import os
import sys
import json
import csv
import hashlib

DRIVE_BASE = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai"
REPO_BASE = r"C:\Users\USER\.gemini\antigravity\scratch\Bangladesh-Biggest-Public-Database\bangla_ai"

KNOWN_CHECKSUMS = {
    ("Bangla2B+.tar.bz2", 4136057125): "537ebee2b2ac6c3f6d40115b41d9dd6ce4404944c76687499fa9130f6846cc73",
    ("train.tar.gz", 2034709059): "27199ad0041edeb5efe16948718b866c2417f4c88c2eeadebdadf269a041ab8f",
    ("BanglaNMT.tar.bz2", 132839014): "2ad7eef20067ff0c8686f0aa6743ffaa6ff15f8a00263f3ae10e542d62706e4a",
    ("BanglaParaphrase.zip", 38002116): "8f27c967bcb75620fa2c94fb34159795f680df3b28b45f9f40b88a1bf1573a6f",
    ("All60Kdataset.csv", 304586219): "ee7775a7cceeb9a5573e0474668ba4589d3a43fa4da3cf325c7e1ca3134ea4ea",
    ("dev.tar.gz", 278667778): "e5c70ba921ef41712aee784e8db3a875a5e3bc7c81308a9ad0809b45bf94a1ca",
    ("test.tar.gz", 659700249): "fb9873d195973eefd6b2c6861214e91fb6cbfe5febe22f7b8849b28f80479b18",
}

GDRIVE_FILE_IDS = {
    "BAI-002": "1vtGsRngGa8OTdVAO328-sv1LGz-VU_xf",
    "BAI-003": "1qtOV4fIHvtjdPVfINoiFW0u2kC3yL5aQ",
    "BAI-004": "1jYe0tZjTmi337UPpQbb5bw1htdA7vvpG",
    "BAI-006": "1Xsut6Xx5DQYmQqikHekY3siY6v6TjLsl",
    "BAI-009": "1v_NabJjyNEVHxP_YZqk_gSWMuCLtTbSe",
    "BAI-012": "1e-748vJLHn14UTIbth1RHHJ5AxCFDLEy",
    "BAI-016": "1cFbRWoDoZap-jWOcCnWVXC6reZrJcmNQ",
}

def format_bytes(num):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if abs(num) < 1024.0:
            return f"{num:3.2f} {unit}"
        num /= 1024.0
    return f"{num:.2f} PB"

def compute_sha256(filepath):
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(1048576):
            sha.update(chunk)
    return sha.hexdigest()

def main():
    catalog_path = os.path.join(REPO_BASE, "bangla_ai_datasets_catalog.json")
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    # Load existing cached checksums if any
    checksum_file = os.path.join(REPO_BASE, "checksums.csv")
    cached = dict(KNOWN_CHECKSUMS)
    if os.path.exists(checksum_file):
        try:
            with open(checksum_file, "r", encoding="utf-8") as f:
                for r in csv.DictReader(f):
                    cached[(r["filename"], int(r.get("size_bytes", 0)))] = r["sha256"]
        except Exception:
            pass

    cat_folder_map = {
        "BAI-001": "text_corpora/bangla2b",
        "BAI-002": "text_corpora/banglabert",
        "BAI-003": "translation/indictrans2",
        "BAI-004": "translation/banglaparaphrase",
        "BAI-005": "sentiment/sentnob",
        "BAI-006": "sentiment/bangla_book_reviews",
        "BAI-007": "ner/banglaner",
        "BAI-008": "ner/wikiann",
        "BAI-009": "question_answering/banglarqa",
        "BAI-010": "speech/common_voice",
        "BAI-011": "speech/bengaliai_speech",
        "BAI-012": "speech/fleurs",
        "BAI-013": "ocr_handwriting/banglalekha",
        "BAI-014": "ocr_handwriting/ekush",
        "BAI-015": "dialects/dialectbd",
        "BAI-016": "fake_news/banfakenews",
        "BAI-017": "multimodal/bengali_image_captioning",
        "BAI-018": "sign_language/bdsl36"
    }

    manifest = []
    checksums = []
    download_reports = []

    for entry in catalog:
        ds_id = entry["id"]
        rel_folder = cat_folder_map.get(ds_id, "")
        drive_folder = os.path.join(DRIVE_BASE, rel_folder.replace("/", os.sep))
        
        files_found = []
        total_bytes = 0

        if os.path.exists(drive_folder):
            for root, dirs, files in os.walk(drive_folder):
                for fname in sorted(files):
                    if fname.lower() in ("desktop.ini", ".ds_store") or fname.endswith(".part"):
                        continue
                    fpath = os.path.join(root, fname)
                    fsize = os.path.getsize(fpath)
                    total_bytes += fsize
                    rel_file = os.path.relpath(fpath, DRIVE_BASE).replace("\\", "/")

                    cache_key = (fname, fsize)
                    if cache_key in cached:
                        sha = cached[cache_key]
                    else:
                        print(f"Computing sha256 for {fname} ({format_bytes(fsize)})...")
                        sha = compute_sha256(fpath)
                        cached[cache_key] = sha

                    file_info = {
                        "filename": fname,
                        "relative_path": rel_file,
                        "size_bytes": fsize,
                        "size_human": format_bytes(fsize),
                        "sha256": sha
                    }
                    files_found.append(file_info)
                    checksums.append({
                        "dataset_id": ds_id,
                        "filename": fname,
                        "relative_path": rel_file,
                        "size_bytes": fsize,
                        "size_human": format_bytes(fsize),
                        "sha256": sha
                    })

        # Determine status
        if files_found:
            status = "verified_and_downloaded"
        elif ds_id in ("BAI-001", "BAI-010"):
            status = "license_restricted_or_huge"
        elif ds_id in ("BAI-011",):
            status = "access_required"
        else:
            status = "verified_metadata_only"

        manifest_entry = {
            "dataset_id": ds_id,
            "dataset_name": entry["dataset_name"],
            "task_category": entry["task_category"],
            "category_folder": rel_folder,
            "google_drive_folder": f"Bangladesh-Biggest-Public-Database/bangla_ai/{rel_folder}",
            "original_source_url": entry.get("verified_source_url", f"https://huggingface.co/datasets/{entry.get('huggingface_or_github_id')}"),
            "original_repository_or_hf_id": entry.get("huggingface_or_github_id"),
            "license": entry["license"],
            "license_verification_url": entry.get("license_verification_url", "https://choosealicense.com/"),
            "original_reported_size": entry.get("size_or_records"),
            "actual_downloaded_size_bytes": total_bytes,
            "actual_downloaded_size_human": format_bytes(total_bytes),
            "files_count": len(files_found),
            "files": files_found,
            "download_status": status,
            "verification_notes": entry.get("description")
        }

        if ds_id in GDRIVE_FILE_IDS:
            manifest_entry["drive_file_id"] = GDRIVE_FILE_IDS[ds_id]
            manifest_entry["drive_file_url"] = f"https://drive.google.com/file/d/{GDRIVE_FILE_IDS[ds_id]}/view"

        manifest.append(manifest_entry)

        download_reports.append({
            "dataset_id": ds_id,
            "dataset_name": entry["dataset_name"],
            "category_folder": rel_folder,
            "status": status,
            "total_bytes": total_bytes,
            "total_human": format_bytes(total_bytes)
        })

    # Save to GitHub repo
    manifest_repo = os.path.join(REPO_BASE, "manifest.json")
    with open(manifest_repo, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Manifest written: {manifest_repo}")

    report_repo = os.path.join(REPO_BASE, "download_report.csv")
    with open(report_repo, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["dataset_id", "dataset_name", "category_folder", "status", "total_bytes", "total_human"])
        writer.writeheader()
        writer.writerows(download_reports)
    print(f"Download report written: {report_repo}")

    checksum_repo = os.path.join(REPO_BASE, "checksums.csv")
    with open(checksum_repo, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["dataset_id", "filename", "relative_path", "size_bytes", "size_human", "sha256"])
        writer.writeheader()
        writer.writerows(checksums)
    print(f"Checksums written: {checksum_repo}")

    # Mirror to Drive
    for fname, repo_fpath in [("manifest.json", manifest_repo), ("download_report.csv", report_repo), ("checksums.csv", checksum_repo)]:
        dest_drive = os.path.join(DRIVE_BASE, fname)
        with open(repo_fpath, "r", encoding="utf-8") as src, open(dest_drive, "w", encoding="utf-8") as dst:
            dst.write(src.read())
        print(f"Mirrored {fname} to Drive: {dest_drive}")

    print(f"\nSuccessfully synchronized {len(checksums)} files across {len(manifest)} datasets!")

if __name__ == "__main__":
    main()
