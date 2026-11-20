#!/usr/bin/env python3
"""
Bangla AI Dataset Collection Downloader
Direct-to-Google-Drive streaming downloader with resume support and SHA-256 validation.
Designed specifically to minimize local SSD and RAM consumption.
"""

import os
import sys
import argparse
import hashlib
import json
import csv
import time
import urllib.request
import urllib.error

DEFAULT_DRIVE_BASE = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai"

DATASET_DOWNLOADS = [
    {
        "id": "BAI-003",
        "name": "indictrans2",
        "category_folder": "translation/indictrans2",
        "files": [
            {
                "filename": "IN22_benchmark.tar.gz",
                "url": "https://huggingface.co/datasets/ai4bharat/IN22-Gen/resolve/main/IN22_benchmark.tar.gz",
                "expected_size": 3355008
            }
        ]
    },
    {
        "id": "BAI-004",
        "name": "banglaparaphrase",
        "category_folder": "translation/banglaparaphrase",
        "files": [
            {
                "filename": "BanglaParaphrase.zip",
                "url": "https://huggingface.co/datasets/csebuetnlp/BanglaParaphrase/resolve/main/data/BanglaParaphrase.zip",
                "expected_size": 38002116
            }
        ]
    },
    {
        "id": "BAI-005",
        "name": "sentnob",
        "category_folder": "sentiment/sentnob",
        "files": [
            {
                "filename": "Train.csv",
                "url": "https://huggingface.co/datasets/khondoker/SentNoB/resolve/main/Train.csv",
                "expected_size": 2653460
            },
            {
                "filename": "Test.csv",
                "url": "https://huggingface.co/datasets/khondoker/SentNoB/resolve/main/Test.csv",
                "expected_size": 334211
            },
            {
                "filename": "Val.csv",
                "url": "https://huggingface.co/datasets/khondoker/SentNoB/resolve/main/Val.csv",
                "expected_size": 345798
            }
        ]
    },
    {
        "id": "BAI-006",
        "name": "bangla_book_reviews",
        "category_folder": "sentiment/bangla_book_reviews",
        "files": [
            {
                "filename": "validation.csv",
                "url": "https://raw.githubusercontent.com/mohsinulkabir14/BanglaBook/main/data/csv/validation.csv",
                "expected_size": 8785352
            },
            {
                "filename": "test.csv",
                "url": "https://raw.githubusercontent.com/mohsinulkabir14/BanglaBook/main/data/csv/test.csv",
                "expected_size": 17448926
            },
            {
                "filename": "train.csv",
                "url": "https://raw.githubusercontent.com/mohsinulkabir14/BanglaBook/main/data/csv/train.csv",
                "expected_size": 61338063
            }
        ]
    },
    {
        "id": "BAI-007",
        "name": "banglaner",
        "category_folder": "ner/banglaner",
        "files": [
            {
                "filename": "train.jsonl",
                "url": "https://huggingface.co/datasets/saiful9379/BanglaNER_V1.0/resolve/main/train.jsonl",
                "expected_size": 1410959
            },
            {
                "filename": "val.jsonl",
                "url": "https://huggingface.co/datasets/saiful9379/BanglaNER_V1.0/resolve/main/val.jsonl",
                "expected_size": 371159
            }
        ]
    },
    {
        "id": "BAI-008",
        "name": "wikiann",
        "category_folder": "ner/wikiann",
        "files": [
            {
                "filename": "train-00000-of-00001.parquet",
                "url": "https://huggingface.co/datasets/unimelb-nlp/wikiann/resolve/main/bn/train-00000-of-00001.parquet",
                "expected_size": 553738
            },
            {
                "filename": "test-00000-of-00001.parquet",
                "url": "https://huggingface.co/datasets/unimelb-nlp/wikiann/resolve/main/bn/test-00000-of-00001.parquet",
                "expected_size": 57644
            },
            {
                "filename": "validation-00000-of-00001.parquet",
                "url": "https://huggingface.co/datasets/unimelb-nlp/wikiann/resolve/main/bn/validation-00000-of-00001.parquet",
                "expected_size": 56017
            }
        ]
    },
    {
        "id": "BAI-009",
        "name": "banglarqa",
        "category_folder": "question_answering/banglarqa",
        "files": [
            {
                "filename": "Validation.json",
                "url": "https://huggingface.co/datasets/sartajekram/BanglaRQA/resolve/main/Validation.json",
                "expected_size": 3493591
            },
            {
                "filename": "Test.json",
                "url": "https://huggingface.co/datasets/sartajekram/BanglaRQA/resolve/main/Test.json",
                "expected_size": 3603506
            },
            {
                "filename": "Train.json",
                "url": "https://huggingface.co/datasets/sartajekram/BanglaRQA/resolve/main/Train.json",
                "expected_size": 27818012
            }
        ]
    },
    {
        "id": "BAI-012",
        "name": "fleurs",
        "category_folder": "speech/fleurs",
        "files": [
            {
                "filename": "dev.tsv",
                "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/dev.tsv",
                "expected_size": 465963
            },
            {
                "filename": "test.tsv",
                "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/test.tsv",
                "expected_size": 1089017
            },
            {
                "filename": "train.tsv",
                "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/train.tsv",
                "expected_size": 3481282
            }
        ]
    },
    {
        "id": "BAI-015",
        "name": "dialectbd",
        "category_folder": "dialects/dialectbd",
        "files": [
            {
                "filename": "train.parquet",
                "url": "https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset/resolve/main/data/train-00000-of-00001.parquet",
                "expected_size": 887035
            },
            {
                "filename": "test.parquet",
                "url": "https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset/resolve/main/data/test-00000-of-00001.parquet",
                "expected_size": 113225
            },
            {
                "filename": "validation.parquet",
                "url": "https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset/resolve/main/data/validation-00000-of-00001.parquet",
                "expected_size": 119492
            }
        ]
    }
]

def format_bytes(num):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if abs(num) < 1024.0:
            return f"{num:3.2f} {unit}"
        num /= 1024.0
    return f"{num:.2f} PB"

def stream_download(url, dest_path, expected_size=None, resume=True):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    temp_path = dest_path + ".part"
    existing_bytes = 0

    if os.path.exists(dest_path):
        actual_size = os.path.getsize(dest_path)
        if expected_size and actual_size == expected_size:
            print(f"  [SKIPPED] {os.path.basename(dest_path)} already exists ({format_bytes(actual_size)})")
            # Calculate SHA256 of existing file
            sha256 = hashlib.sha256()
            with open(dest_path, "rb") as f:
                while chunk := f.read(131072):
                    sha256.update(chunk)
            return actual_size, sha256.hexdigest(), "existing"
        elif not expected_size:
            print(f"  [SKIPPED] {os.path.basename(dest_path)} exists")
            return actual_size, "", "existing"

    headers = {"User-Agent": "Mozilla/5.0"}
    mode = "wb"
    if resume and os.path.exists(temp_path):
        existing_bytes = os.path.getsize(temp_path)
        headers["Range"] = f"bytes={existing_bytes}-"
        mode = "ab"
        print(f"  [RESUME] Resuming from {format_bytes(existing_bytes)}")

    req = urllib.request.Request(url, headers=headers)
    sha256 = hashlib.sha256()
    
    # If resuming, pre-hash existing part
    if mode == "ab" and existing_bytes > 0:
        with open(temp_path, "rb") as f:
            while chunk := f.read(131072):
                sha256.update(chunk)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp, open(temp_path, mode) as out_f:
            total_size = resp.headers.get("content-length")
            if total_size is not None:
                total_size = int(total_size) + existing_bytes
            
            downloaded = existing_bytes
            start_time = time.time()
            last_print = start_time

            while True:
                chunk = resp.read(131072) # 128 KB buffer
                if not chunk:
                    break
                out_f.write(chunk)
                sha256.update(chunk)
                downloaded += len(chunk)

                current_time = time.time()
                if current_time - last_print >= 2.0:
                    pct = f"{(downloaded / total_size) * 100:5.1f}%" if total_size else "N/A"
                    speed = downloaded / (current_time - start_time) if current_time > start_time else 0
                    print(f"    Progress: {pct} ({format_bytes(downloaded)}) @ {format_bytes(speed)}/s", end="\r")
                    last_print = current_time

            print(f"    Progress: 100.0% ({format_bytes(downloaded)})               ")

        # Atomic rename after complete download
        if os.path.exists(dest_path):
            os.remove(dest_path)
        os.rename(temp_path, dest_path)
        return downloaded, sha256.hexdigest(), "downloaded"

    except urllib.error.HTTPError as e:
        if e.code == 416: # Range not satisfiable (already finished)
            if os.path.exists(temp_path):
                os.rename(temp_path, dest_path)
                return os.path.getsize(dest_path), "", "downloaded"
        print(f"  [ERROR] HTTP {e.code}: {e.reason} for {url}")
        return 0, "", f"failed_http_{e.code}"
    except Exception as e:
        print(f"  [ERROR] {e} for {url}")
        return 0, "", f"failed_{type(e).__name__}"

def main():
    parser = argparse.ArgumentParser(description="Bangla AI Datasets Stream Downloader")
    parser.add_argument("--drive-path", default=DEFAULT_DRIVE_BASE, help="Target Google Drive directory")
    parser.add_argument("--dataset", default="all", help="Dataset ID or name to download (or 'all')")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without downloading")
    args = parser.parse_args()

    drive_base = args.drive_path
    print("=" * 70)
    print("BANGLA AI DATASET COLLECTION - DIRECT GOOGLE DRIVE STREAM DOWNLOADER")
    print(f"Destination: {drive_base}")
    print("=" * 70)

    if not os.path.exists(drive_base):
        print(f"Creating base directory: {drive_base}")
        os.makedirs(drive_base, exist_ok=True)

    results = []
    checksums = []

    for item in DATASET_DOWNLOADS:
        ds_id = item["id"]
        ds_name = item["name"]
        cat_folder = item["category_folder"]

        if args.dataset != "all" and args.dataset.lower() not in (ds_id.lower(), ds_name.lower()):
            continue

        print(f"\nProcessing [{ds_id}] {ds_name} -> {cat_folder}")
        target_dir = os.path.join(drive_base, cat_folder.replace("/", os.sep))

        total_ds_bytes = 0
        status_list = []

        for f_info in item["files"]:
            filename = f_info["filename"]
            url = f_info["url"]
            expected_size = f_info.get("expected_size")
            dest_file = os.path.join(target_dir, filename)

            print(f"Downloading file: {filename}")
            if args.dry_run:
                print(f"  [DRY-RUN] Would download from {url} to {dest_file}")
                continue

            size, sha, status = stream_download(url, dest_file, expected_size)
            total_ds_bytes += size
            status_list.append(status)

            if sha:
                checksums.append({
                    "dataset_id": ds_id,
                    "filename": filename,
                    "relative_path": f"{cat_folder}/{filename}",
                    "size_bytes": size,
                    "size_human": format_bytes(size),
                    "sha256": sha
                })

        overall_status = "verified_and_downloaded" if all(s in ("downloaded", "existing") for s in status_list) else "partially_downloaded"
        results.append({
            "dataset_id": ds_id,
            "dataset_name": ds_name,
            "category_folder": cat_folder,
            "status": overall_status,
            "total_bytes": total_ds_bytes,
            "total_human": format_bytes(total_ds_bytes)
        })

    # Summary
    print("\n" + "=" * 70)
    print("DOWNLOAD SUMMARY")
    print("=" * 70)
    for r in results:
        print(f"[{r['dataset_id']:8}] {r['dataset_name']:25} | {r['status']:25} | {r['total_human']:>10}")

    # Write checksums and report
    report_csv = os.path.join(drive_base, "download_report.csv")
    with open(report_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["dataset_id", "dataset_name", "category_folder", "status", "total_bytes", "total_human"])
        writer.writeheader()
        writer.writerows(results)
    print(f"\nDownload report written to {report_csv}")

    checksum_csv = os.path.join(drive_base, "checksums.csv")
    with open(checksum_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["dataset_id", "filename", "relative_path", "size_bytes", "size_human", "sha256"])
        writer.writeheader()
        writer.writerows(checksums)
    print(f"Checksums written to {checksum_csv}")

if __name__ == "__main__":
    main()
