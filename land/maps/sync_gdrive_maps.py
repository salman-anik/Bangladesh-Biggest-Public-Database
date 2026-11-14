"""Zero-disk streaming sync engine for Bangladesh Mouza Maps -> Google Drive -> GitHub links.

Streams map files one-by-one from free.mouzamap.tech directly to Google Drive
under `Bangladesh-Biggest-Public-Database/land/maps/<Division>/<District>/...`,
deleting each temporary local file immediately after upload, persisting state in
SQLite, and regenerating GitHub catalog JSON/README files with Google Drive links.
"""

import argparse
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_INDEX_URL = "https://free.mouzamap.tech"
DIVISIONS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"]
DIV_INDEX = {name: idx for idx, name in enumerate(DIVISIONS)}

MAPS_DRIVE_ROOT_ID = "1sPrrrWXaAsWByTms7Kwcnq230QkZFW4u"
REPO_MAPS_DIR = Path(__file__).resolve().parent

DEFAULT_DB_PATH = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "BangladeshMouzaSync" / "sync_state.db"
TMP_ROOT = Path(tempfile.gettempdir()) / "bd_mouza_sync_tmp"

HEADERS = {"User-Agent": "Mozilla/5.0"}
STOP_EVENT = threading.Event()
DB_LOCK = threading.Lock()
FOLDER_LOCK = threading.Lock()
DL_LOCK = threading.Lock()


def find_gdrive():
    exe = shutil.which("gdrive")
    if not exe:
        raise RuntimeError("`gdrive` CLI not found in PATH. Initialize the gdrive plugin CLI first.")
    return exe


def gdrive_run(gdrive_bin, args, retries=5):
    """Run gdrive CLI command with exponential backoff for transient 502/EOF errors."""
    last_err = ""
    for attempt in range(retries):
        p = subprocess.run([gdrive_bin] + args, capture_output=True, text=True, encoding="utf-8")
        if p.returncode == 0:
            return p.stdout.strip()
        err = (p.stderr or "") + "\n" + (p.stdout or "")
        last_err = err.strip()
        low = last_err.lower()
        if "uploadlimitexceeded" in low or "userratelimitexceeded" in low or "daily limit" in low:
            STOP_EVENT.set()
            raise RuntimeError(f"DAILY_QUOTA_HIT: {last_err}")
        time.sleep(min(25, 2 * (attempt + 1)))
    raise RuntimeError(last_err)


def init_db(db_path: Path):
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS folders (
            folder_key TEXT PRIMARY KEY,
            parent_id TEXT NOT NULL,
            name TEXT NOT NULL,
            drive_id TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS files (
            rel_key TEXT PRIMARY KEY,
            drive_idx INTEGER NOT NULL,
            division TEXT NOT NULL,
            district TEXT NOT NULL,
            upazila TEXT NOT NULL,
            survey TEXT NOT NULL,
            subpath TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            drive_folder_id TEXT,
            drive_file_id TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            updated_at TEXT
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_files_div_dist ON files(division, district);")
    conn.commit()
    return conn


def seed_db_from_catalog(conn):
    """Populate SQLite state from partitioned district JSONs if missing entries."""
    existing_count = conn.execute("SELECT COUNT(*) FROM files").fetchone()[0]
    json_files = sorted(REPO_MAPS_DIR.glob("*/*.json"))
    if not json_files:
        return existing_count

    to_insert = []
    for jf in json_files:
        data = json.loads(jf.read_text(encoding="utf-8"))
        dist_folder_id = data.get("drive_folder_id")
        if dist_folder_id:
            div_name = data["division"]
            dist_name = data["district"]
            conn.execute(
                "INSERT OR IGNORE INTO folders(folder_key, parent_id, name, drive_id) VALUES (?, ?, ?, ?)",
                (f"{div_name}/{dist_name}", data.get("division_drive_folder_id", ""), dist_name, dist_folder_id),
            )
        for item in data.get("files", []):
            rel_key = item["source_rel_path"]
            to_insert.append(
                (
                    rel_key,
                    int(item.get("source_drive", DIV_INDEX.get(data["division"], 0))),
                    data["division"],
                    data["district"],
                    item.get("upazila", ""),
                    item.get("survey", ""),
                    item.get("subpath", ""),
                    item["file_name"],
                    int(item.get("file_size", 0)),
                    item.get("mime_type", "application/octet-stream"),
                    item.get("drive_folder_id") or dist_folder_id,
                    item.get("drive_file_id"),
                    item.get("status", "pending_sync"),
                    item.get("updated_at"),
                )
            )
    conn.executemany(
        """
        INSERT OR IGNORE INTO files(
            rel_key, drive_idx, division, district, upazila, survey, subpath,
            file_name, file_size, mime_type, drive_folder_id, drive_file_id, status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        to_insert,
    )
    conn.commit()
    return conn.execute("SELECT COUNT(*) FROM files").fetchone()[0]


def list_drive_children(gdrive_bin, folder_id):
    out = gdrive_run(gdrive_bin, ["readonly", "ls", folder_id, "--json"])
    items = json.loads(out) if out else []
    folders = {x["name"]: x["id"] for x in items if x["mimeType"] == "application/vnd.google-apps.folder"}
    files = {x["name"]: x["id"] for x in items if x["mimeType"] != "application/vnd.google-apps.folder"}
    return folders, files


def ensure_drive_path(conn, gdrive_bin, division, parts):
    """Ensure Drive folder hierarchy starting from division folder; returns leaf folder_id."""
    with FOLDER_LOCK:
        # Look up division folder ID
        row = conn.execute("SELECT drive_id FROM folders WHERE folder_key = ?", (division,)).fetchone()
        if row:
            curr_id = row[0]
        else:
            div_folders, _ = list_drive_children(gdrive_bin, MAPS_DRIVE_ROOT_ID)
            if division in div_folders:
                curr_id = div_folders[division]
            else:
                out = gdrive_run(gdrive_bin, ["mutate", "mkdir", division, "--parent", MAPS_DRIVE_ROOT_ID])
                curr_id = re.search(r"\(ID:\s*([A-Za-z0-9_-]+)\)", out).group(1)
            conn.execute(
                "INSERT OR REPLACE INTO folders(folder_key, parent_id, name, drive_id) VALUES (?, ?, ?, ?)",
                (division, MAPS_DRIVE_ROOT_ID, division, curr_id),
            )
            conn.commit()

        curr_key = division
        for seg in parts:
            if not seg:
                continue
            curr_key = f"{curr_key}/{seg}"
            row = conn.execute("SELECT drive_id FROM folders WHERE folder_key = ?", (curr_key,)).fetchone()
            if row:
                curr_id = row[0]
                continue
            child_folders, _ = list_drive_children(gdrive_bin, curr_id)
            if seg in child_folders:
                next_id = child_folders[seg]
            else:
                out = gdrive_run(gdrive_bin, ["mutate", "mkdir", seg, "--parent", curr_id])
                next_id = re.search(r"\(ID:\s*([A-Za-z0-9_-]+)\)", out).group(1)
            conn.execute(
                "INSERT OR REPLACE INTO folders(folder_key, parent_id, name, drive_id) VALUES (?, ?, ?, ?)",
                (curr_key, curr_id, seg, next_id),
            )
            conn.commit()
            curr_id = next_id
        return curr_id


def fetch_signed_links_for_folder(drive_idx, folder_rel_parts):
    """Query free.mouzamap.tech folder API to obtain fresh signed download links."""
    subpath = "/".join(urllib.parse.quote(p, safe="") for p in folder_rel_parts)
    if subpath:
        subpath += "/"
    url = f"{BASE_INDEX_URL}/{drive_idx}:/{subpath}"
    links = {}
    page_token = None
    page_index = 0
    while True:
        payload = json.dumps({"page_token": page_token, "page_index": page_index}).encode()
        for attempt in range(4):
            try:
                req = urllib.request.Request(
                    url,
                    data=payload,
                    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    res = json.loads(resp.read().decode("utf-8"))
                break
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(1.5 * (attempt + 1))
        for item in (res.get("data") or {}).get("files", []):
            if item.get("link"):
                links[item["name"]] = item["link"]
        nxt = res.get("nextPageToken")
        if not nxt:
            break
        page_token = nxt
        page_index = res.get("curPageIndex", page_index) + 1
    return links


def sync_folder_group(conn, gdrive_bin, folder_group, workers=4):
    """Sync all pending files belonging to a single source folder."""
    drive_idx, division, folder_parts, items = folder_group
    target_folder_id = ensure_drive_path(conn, gdrive_bin, division, folder_parts)
    _, existing_drive_files = list_drive_children(gdrive_bin, target_folder_id)

    # Mark any already-present Drive files right away without re-downloading
    pending_items = []
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    for rel_key, fname, fsize in items:
        if fname in existing_drive_files:
            with DB_LOCK:
                conn.execute(
                    "UPDATE files SET drive_folder_id=?, drive_file_id=?, status='uploaded', updated_at=? WHERE rel_key=?",
                    (target_folder_id, existing_drive_files[fname], now_str, rel_key),
                )
                conn.commit()
        else:
            pending_items.append((rel_key, fname, fsize))

    if not pending_items:
        return len(items), 0

    signed_links = fetch_signed_links_for_folder(drive_idx, folder_parts)
    TMP_ROOT.mkdir(parents=True, exist_ok=True)

    def upload_single(entry):
        if STOP_EVENT.is_set():
            return False, 0
        rel_key, fname, fsize = entry
        link = signed_links.get(fname)
        if not link:
            return False, 0
        t_dir = TMP_ROOT / f"t_{threading.get_ident()}"
        t_dir.mkdir(parents=True, exist_ok=True)
        tmp_path = t_dir / fname
        try:
            dl_ok = False
            last_dl_err = ""
            dl_url = link if link.startswith("http") else (BASE_INDEX_URL + link)
            for attempt in range(4):
                try:
                    with DL_LOCK:
                        time.sleep(0.4)
                    dl_req = urllib.request.Request(dl_url, headers=HEADERS)
                    with urllib.request.urlopen(dl_req, timeout=180) as r, open(tmp_path, "wb") as f:
                        shutil.copyfileobj(r, f, length=262144)
                    dl_ok = True
                    break
                except urllib.error.HTTPError as exc:
                    last_dl_err = str(exc)
                    if tmp_path.exists():
                        tmp_path.unlink()
                    if exc.code in (500, 502, 503):
                        time.sleep(3 * (attempt + 1))
                        try:
                            fresh_links = fetch_signed_links_for_folder(drive_idx, folder_parts)
                            new_link = fresh_links.get(fname)
                            if new_link:
                                link = new_link
                                dl_url = link if link.startswith("http") else (BASE_INDEX_URL + link)
                        except Exception:
                            pass
                    else:
                        time.sleep(min(10, 2 * (attempt + 1)))
                except Exception as exc:
                    last_dl_err = str(exc)
                    if tmp_path.exists():
                        tmp_path.unlink()
                    time.sleep(min(10, 2 * (attempt + 1)))
            if not dl_ok:
                print(f"[Skip] Download failed for {rel_key}: {last_dl_err}", flush=True)
                return False, 0

            out = gdrive_run(gdrive_bin, ["mutate", "upload", str(tmp_path), "--parent", target_folder_id])
            m = re.search(r"\(ID:\s*([A-Za-z0-9_-]+)\)", out)
            fid = m.group(1) if m else None
            if fid:
                with DB_LOCK:
                    conn.execute(
                        "UPDATE files SET drive_folder_id=?, drive_file_id=?, status='uploaded', updated_at=? WHERE rel_key=?",
                        (target_folder_id, fid, time.strftime("%Y-%m-%d %H:%M:%S"), rel_key),
                    )
                    conn.commit()
                return True, fsize
            return False, 0
        except Exception as exc:
            print(f"[Skip] Upload failed for {rel_key}: {exc}", flush=True)
            return False, 0
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

    uploaded_count = 0
    uploaded_bytes = 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = [ex.submit(upload_single, e) for e in pending_items]
        for fut in as_completed(futs):
            try:
                ok, b = fut.result()
            except Exception as exc:
                print(f"[Skip] Worker error: {exc}", flush=True)
                ok, b = False, 0
            if ok:
                uploaded_count += 1
                uploaded_bytes += b
    return uploaded_count, uploaded_bytes


def refresh_github_catalogs(conn):
    """Write updated Google Drive file/folder links from SQLite into GitHub land/maps/ files."""
    folder_rows = dict(conn.execute("SELECT folder_key, drive_id FROM folders").fetchall())
    rows = conn.execute(
        """
        SELECT division, district, upazila, survey, subpath, file_name, file_size, mime_type,
               drive_idx, rel_key, drive_folder_id, drive_file_id, status, updated_at
        FROM files
        ORDER BY division, district, upazila, survey, file_name
        """
    ).fetchall()

    by_div_dist = defaultdict(list)
    for row in rows:
        by_div_dist[(row[0], row[1])].append(row)

    index_divisions = defaultdict(list)
    featured_uploaded = []
    total_files = 0
    total_bytes = 0
    total_uploaded = 0
    total_uploaded_bytes = 0

    for (div_name, dist_name), items in sorted(by_div_dist.items()):
        div_dir = REPO_MAPS_DIR / div_name
        div_dir.mkdir(parents=True, exist_ok=True)
        div_fid = folder_rows.get(div_name, "")
        dist_fid = folder_rows.get(f"{div_name}/{dist_name}", "")

        file_entries = []
        upazilas_set = set()
        dist_bytes = 0
        dist_uploaded = 0
        dist_uploaded_bytes = 0

        for r in items:
            _, _, upz, surv, subp, fname, fsize, mime, d_idx, rel_key, dfold, dfile, status, upd = r
            upazilas_set.add(upz)
            total_files += 1
            total_bytes += fsize
            dist_bytes += fsize
            is_up = status == "uploaded" and bool(dfile)
            if is_up:
                total_uploaded += 1
                total_uploaded_bytes += fsize
                dist_uploaded += 1
                dist_uploaded_bytes += fsize

            entry = {
                "upazila": upz,
                "survey": surv,
                "subpath": subp,
                "file_name": fname,
                "file_size": fsize,
                "mime_type": mime,
                "source_drive": d_idx,
                "source_rel_path": rel_key,
                "drive_folder_id": dfold or dist_fid or None,
                "drive_folder_url": f"https://drive.google.com/drive/folders/{dfold or dist_fid}" if (dfold or dist_fid) else None,
                "drive_file_id": dfile,
                "drive_url": f"https://drive.google.com/file/d/{dfile}/view" if dfile else None,
                "drive_download_url": f"https://drive.google.com/uc?export=download&id={dfile}" if dfile else None,
                "status": "uploaded" if is_up else "pending_sync",
                "updated_at": upd,
            }
            file_entries.append(entry)
            if is_up and len(featured_uploaded) < 2500:
                featured_uploaded.append({"division": div_name, "district": dist_name, **entry})

        dist_payload = {
            "division": div_name,
            "division_drive_folder_id": div_fid,
            "division_drive_folder_url": f"https://drive.google.com/drive/folders/{div_fid}" if div_fid else None,
            "district": dist_name,
            "drive_folder_id": dist_fid,
            "drive_folder_url": f"https://drive.google.com/drive/folders/{dist_fid}" if dist_fid else None,
            "total_files": len(file_entries),
            "uploaded_files": dist_uploaded,
            "total_bytes": dist_bytes,
            "total_gb": round(dist_bytes / (1024**3), 3),
            "files": file_entries,
        }
        out_path = div_dir / f"{dist_name}.json"
        out_path.write_text(json.dumps(dist_payload, ensure_ascii=False, indent=2), encoding="utf-8")

        index_divisions[div_name].append(
            {
                "district": dist_name,
                "upazila_count": len(upazilas_set),
                "total_files": len(file_entries),
                "uploaded_files": dist_uploaded,
                "total_bytes": dist_bytes,
                "total_gb": round(dist_bytes / (1024**3), 3),
                "drive_folder_id": dist_fid,
                "drive_folder_url": f"https://drive.google.com/drive/folders/{dist_fid}" if dist_fid else None,
                "catalog_file": f"{div_name}/{dist_name}.json",
            }
        )

    index_payload = {
        "title": "Bangladesh Nationwide Mouza Maps Catalog (Google Drive Linked)",
        "source": "https://mouzamap.tech / https://free.mouzamap.tech",
        "drive_root_id": MAPS_DRIVE_ROOT_ID,
        "drive_root_url": f"https://drive.google.com/drive/folders/{MAPS_DRIVE_ROOT_ID}",
        "total_divisions": len(index_divisions),
        "total_districts": sum(len(v) for v in index_divisions.values()),
        "total_files": total_files,
        "uploaded_files": total_uploaded,
        "total_bytes": total_bytes,
        "total_gb": round(total_bytes / (1024**3), 2),
        "uploaded_gb": round(total_uploaded_bytes / (1024**3), 3),
        "last_updated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "divisions": {
            div: {
                "drive_folder_id": folder_rows.get(div, ""),
                "drive_folder_url": f"https://drive.google.com/drive/folders/{folder_rows[div]}" if div in folder_rows else None,
                "total_files": sum(d["total_files"] for d in dists),
                "uploaded_files": sum(d["uploaded_files"] for d in dists),
                "total_gb": round(sum(d["total_bytes"] for d in dists) / (1024**3), 2),
                "districts": dists,
            }
            for div, dists in sorted(index_divisions.items())
        },
    }
    (REPO_MAPS_DIR / "index.json").write_text(json.dumps(index_payload, ensure_ascii=False, indent=2), encoding="utf-8")

    # Keep mouza_maps_catalog.json lightweight & rich with all live uploaded Drive map links
    (REPO_MAPS_DIR / "mouza_maps_catalog.json").write_text(
        json.dumps(featured_uploaded, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Generate README.md with clickable Google Drive folder & sample uploaded file links
    md = [
        "# Bangladesh Nationwide Mouza Maps Archive (Google Drive + GitHub Index)",
        "",
        f"All large Mouza map files (PDF/JPG/TIF, totaling **{total_files:,} files / {total_bytes/(1024**3):,.2f} GB**) are organized by **Division → District → Upazila/Thana → Survey Type** in Google Drive and indexed here with direct Google Drive links.",
        "",
        f"- **Google Drive Maps Root Folder:** [Open `land/maps` in Google Drive](https://drive.google.com/drive/folders/{MAPS_DRIVE_ROOT_ID})",
        f"- **Master Index:** [`index.json`](./index.json)",
        f"- **Uploaded Maps with Live File Links (`{total_uploaded:,}` / `{total_files:,}`):** [`mouza_maps_catalog.json`](./mouza_maps_catalog.json)",
        "",
        "## Divisions & Districts (Google Drive Folders + Partitioned Catalogs)",
        "",
        "| Division | Districts | Total Map Files | Total Size | Uploaded to Drive | Google Drive Folder |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for div, info in sorted(index_payload["divisions"].items()):
        link = f"[Open {div} Drive Folder]({info['drive_folder_url']})" if info["drive_folder_url"] else "-"
        md.append(
            f"| **{div}** | {len(info['districts'])} | {info['total_files']:,} | {info['total_gb']:,.2f} GB | {info['uploaded_files']:,} | {link} |"
        )

    md += ["", "## District Catalogs & Google Drive Links", ""]
    for div, info in sorted(index_payload["divisions"].items()):
        md.append(f"### {div} Division")
        md.append("| District | Upazilas | Files | Size (GB) | Uploaded | Drive Folder | Catalog JSON |")
        md.append("|---|---:|---:|---:|---:|---|---|")
        for d in info["districts"]:
            dlink = f"[Drive Folder]({d['drive_folder_url']})" if d["drive_folder_url"] else "-"
            clink = f"[`{d['district']}.json`](./{d['catalog_file']})"
            md.append(
                f"| {d['district']} | {d['upazila_count']} | {d['total_files']:,} | {d['total_gb']:.2f} | {d['uploaded_files']:,} | {dlink} | {clink} |"
            )
        md.append("")

    if featured_uploaded:
        sample_links = []
        per_div_seen = defaultdict(int)
        for f in featured_uploaded:
            if per_div_seen[f["division"]] < 5:
                sample_links.append(f)
                per_div_seen[f["division"]] += 1
            if len(sample_links) >= 40:
                break
        md += [
            "## Sample Live Uploaded Mouza Maps (Direct Google Drive Links)",
            "",
            "| Division | District | Upazila | Survey | File | Size (MB) | Google Drive Link |",
            "|---|---|---|---|---|---:|---|",
        ]
        for f in sample_links:
            md.append(
                f"| {f['division']} | {f['district']} | {f['upazila']} | {f['survey']} | `{f['file_name']}` | {f['file_size']/1048576:.2f} | [View/Download]({f['drive_url']}) |"
            )

    md += [
        "",
        "## Resumable Zero-Disk Sync (For Remaining Files)",
        "",
        "Because Google Drive enforces a **750 GB / 24-hour** upload limit per user and the full archive is ~2.33 TB, run `START_MAP_SYNC.bat` (or `python sync_gdrive_maps.py --workers 3`) to stream remaining files directly to Google Drive without filling local disk storage and automatically refresh the Drive links above:",
        "",
        "```bash",
        "python sync_gdrive_maps.py --workers 3 --limit-gb 700 --refresh-github",
        "```",
    ]
    (REPO_MAPS_DIR / "README.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"Refreshed GitHub catalogs: {total_uploaded:,}/{total_files:,} files uploaded ({total_uploaded_bytes/(1024**3):.2f} GB)", flush=True)


def main():
    parser = argparse.ArgumentParser(description="Zero-disk sync of Mouza Maps to Google Drive + GitHub links.")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    parser.add_argument("--division", type=str, default=None, help="Filter by division (e.g. Dhaka)")
    parser.add_argument("--district", type=str, default=None, help="Filter by district (e.g. Dhaka)")
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--limit-files", type=int, default=0, help="Max files to upload in this run (0 = no limit)")
    parser.add_argument("--limit-gb", type=float, default=700.0, help="Stop cleanly after uploading N GB (default 700 GB for Drive 750 GB/day cap)")
    parser.add_argument("--refresh-github", action="store_true", help="Regenerate GitHub JSONs and README with Drive links")
    parser.add_argument("--refresh-only", action="store_true", help="Only regenerate GitHub JSONs and README from existing DB without uploading")
    args = parser.parse_args()

    conn = init_db(args.db)
    total = seed_db_from_catalog(conn)
    print(f"Sync DB ready ({total:,} cataloged files).", flush=True)

    if args.refresh_only:
        refresh_github_catalogs(conn)
        conn.close()
        return

    gdrive_bin = find_gdrive()

    where = ["status != 'uploaded'"]
    params = []
    if args.division:
        where.append("division = ?")
        params.append(args.division)
    if args.district:
        where.append("district = ?")
        params.append(args.district)

    rows = conn.execute(
        f"""
        SELECT drive_idx, division, district, upazila, survey, subpath, rel_key, file_name, file_size
        FROM files
        WHERE {' AND '.join(where)}
        ORDER BY division, district, upazila, survey, subpath, file_name
        """,
        params,
    ).fetchall()

    # Group by exact source folder path
    groups = defaultdict(list)
    for d_idx, div, dist, upz, surv, subp, rel_key, fname, fsize in rows:
        folder_parts = [p for p in [dist, upz, surv] + ([s for s in subp.split("/") if s] if subp else []) if p]
        groups[(d_idx, div, tuple(folder_parts))].append((rel_key, fname, fsize))

    uploaded_total_files = 0
    uploaded_total_bytes = 0
    limit_bytes = int(args.limit_gb * (1024**3)) if args.limit_gb > 0 else 0

    try:
        for (d_idx, div, fparts), items in groups.items():
            if STOP_EVENT.is_set():
                break
            if args.limit_files and uploaded_total_files >= args.limit_files:
                break
            if limit_bytes and uploaded_total_bytes >= limit_bytes:
                print(f"Reached --limit-gb ({args.limit_gb} GB). Stopping cleanly.", flush=True)
                break
            if args.limit_files:
                rem = args.limit_files - uploaded_total_files
                items = items[:rem]

            c, b = sync_folder_group(conn, gdrive_bin, (d_idx, div, list(fparts), items), workers=args.workers)
            uploaded_total_files += c
            uploaded_total_bytes += b
            if c > 0:
                print(
                    f"[Synced] {div}/{'/'.join(fparts)}: +{c} files ({b/1048576:.1f} MB) | Run total: {uploaded_total_files} files ({uploaded_total_bytes/(1024**3):.2f} GB)",
                    flush=True,
                )
    finally:
        if args.refresh_github:
            refresh_github_catalogs(conn)
        conn.close()


if __name__ == "__main__":
    main()
