#!/usr/bin/env python3
"""
Bangla AI Dataset Collection Manifest Synchronizer
Scans the Google Drive storage directory, gathers file sizes, record counts, and checksums,
and synchronizes `manifest.json`, `download_report.csv`, and `checksums.csv` between Drive and GitHub repo.
Strictly ensures NO large dataset binaries are copied to the Git tree.
"""

import os
import sys
import json
import csv
import hashlib
import argparse

DEFAULT_DRIVE_BASE = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai"
DEFAULT_REPO_BANGLA_AI = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

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

def load_cached_checksums(checksums_file):
    cached = {}
    if os.path.exists(checksums_file):
        try:
            with open(checksums_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    key = (row.get("filename"), int(row.get("size_bytes", 0)))
                    if row.get("sha256"):
                        cached[key] = row.get("sha256")
        except Exception:
            pass
    return cached

def main():
    parser = argparse.ArgumentParser(description="Sync Drive Manifest with GitHub")
    parser.add_argument("--drive-path", default=DEFAULT_DRIVE_BASE, help="Google Drive bangla_ai folder")
    parser.add_argument("--repo-path", default=DEFAULT_REPO_BANGLA_AI, help="GitHub repo bangla_ai directory")
    args = parser.parse_args()

    drive_base = args.drive_path
    repo_base = args.repo_path

    print("=" * 80)
    print("SYNC DRIVE MANIFEST WITH GITHUB REPOSITORY")
    print(f"Google Drive: {drive_base}")
    print(f"GitHub Repo : {repo_base}")
    print("=" * 80)

    # Load master catalog
    catalog_json_path = os.path.join(repo_base, "bangla_ai_datasets_catalog.json")
    with open(catalog_json_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    # Load existing manifest to preserve drive_file_id
    existing_manifest_map = {}
    manifest_repo = os.path.join(repo_base, "manifest.json")
    if os.path.exists(manifest_repo):
        try:
            with open(manifest_repo, "r", encoding="utf-8") as f:
                old_m = json.load(f)
                for entry in old_m:
                    existing_manifest_map[entry["dataset_id"]] = entry
        except Exception:
            pass

    # Load cached checksums
    checksum_repo = os.path.join(repo_base, "checksums.csv")
    cached_checksums = load_cached_checksums(checksum_repo)

    # Category folder mapping
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
        drive_folder = os.path.join(drive_base, rel_folder.replace("/", os.sep)) if drive_base and os.path.exists(drive_base) else ""
        
        files_found = []
        total_bytes = 0

        if drive_folder and os.path.exists(drive_folder):
            for root, dirs, files in os.walk(drive_folder):
                for fname in sorted(files):
                    if fname.lower() in ("desktop.ini", ".ds_store") or fname.endswith(".part"):
                        continue
                    fpath = os.path.join(root, fname)
                    fsize = os.path.getsize(fpath)
                    total_bytes += fsize
                    rel_file = os.path.relpath(fpath, drive_base).replace("\\", "/")
                    
                    # Check cache or compute sha256
                    cache_key = (fname, fsize)
                    if cache_key in cached_checksums:
                        sha = cached_checksums[cache_key]
                    else:
                        print(f"Computing checksum for {fname} ({format_bytes(fsize)})...")
                        sha = compute_sha256(fpath)
                        cached_checksums[cache_key] = sha

                    files_found.append({
                        "filename": fname,
                        "relative_path": rel_file,
                        "size_bytes": fsize,
                        "size_human": format_bytes(fsize),
                        "sha256": sha
                    })
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

        # Check if old entry had drive_file_id
        old_entry = existing_manifest_map.get(ds_id, {})
        drive_file_id = old_entry.get("drive_file_id", "")
        drive_file_url = old_entry.get("drive_file_url", "")

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
        if drive_file_id:
            manifest_entry["drive_file_id"] = drive_file_id
            manifest_entry["drive_file_url"] = drive_file_url

        manifest.append(manifest_entry)

        download_reports.append({
            "dataset_id": ds_id,
            "dataset_name": entry["dataset_name"],
            "category_folder": rel_folder,
            "status": status,
            "total_bytes": total_bytes,
            "total_human": format_bytes(total_bytes)
        })

    # Save manifest.json in GitHub repo
    with open(manifest_repo, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Manifest written to GitHub repo: {manifest_repo}")

    report_repo = os.path.join(repo_base, "download_report.csv")
    with open(report_repo, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["dataset_id", "dataset_name", "category_folder", "status", "total_bytes", "total_human"])
        writer.writeheader()
        writer.writerows(download_reports)
    print(f"Download report written to GitHub repo: {report_repo}")

    with open(checksum_repo, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["dataset_id", "filename", "relative_path", "size_bytes", "size_human", "sha256"])
        writer.writeheader()
        writer.writerows(checksums)
    print(f"Checksums written to GitHub repo: {checksum_repo}")

    # Mirror metadata files to Google Drive
    if drive_base and os.path.exists(drive_base):
        for fname, repo_fpath in [("manifest.json", manifest_repo), ("download_report.csv", report_repo), ("checksums.csv", checksum_repo)]:
            dest_drive = os.path.join(drive_base, fname)
            with open(repo_fpath, "r", encoding="utf-8") as src, open(dest_drive, "w", encoding="utf-8") as dst:
                dst.write(src.read())
            print(f"Mirrored {fname} to Google Drive: {dest_drive}")

    print("\nManifest sync completed successfully.")

if __name__ == "__main__":
    main()
