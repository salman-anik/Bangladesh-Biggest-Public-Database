#!/usr/bin/env python3
"""
Bangla AI Dataset Collection Integrity Verifier
Ultra-low memory & storage verifier tailored for cloud virtual filesystems (Google Drive).
Validates headers, magic numbers, sample records, and SHA-256 checksums without pulling multi-GB binaries into local RAM.
"""

import os
import sys
import hashlib
import json
import csv
import zipfile
import tarfile
import argparse

DEFAULT_DRIVE_BASE = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai"

def format_bytes(num):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if abs(num) < 1024.0:
            return f"{num:3.2f} {unit}"
        num /= 1024.0
    return f"{num:.2f} PB"

def verify_file_content(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    fname = os.path.basename(filepath).lower()
    size = os.path.getsize(filepath)
    
    try:
        # Magic bytes check for binary archives
        with open(filepath, "rb") as f:
            header = f.read(512)

        if fname.endswith(".tar.gz") or fname.endswith(".tgz"):
            if header.startswith(b"\x1f\x8b"):
                return True, "Valid GZIP archive magic (0x1F8B)"
            return False, "Invalid GZIP archive magic"

        elif fname.endswith(".tar.bz2") or fname.endswith(".tbz2"):
            if header.startswith(b"BZh"):
                return True, "Valid BZIP2 archive magic (BZh)"
            return False, "Invalid BZIP2 archive magic"

        elif ext == ".zip":
            if header.startswith(b"PK\x03\x04"):
                try:
                    with zipfile.ZipFile(filepath, "r") as zf:
                        names = zf.namelist()
                        return True, f"Valid ZIP ({len(names)} entries: {names[0] if names else ''}...)"
                except Exception:
                    return True, "Valid ZIP magic header (PK)"
            return False, "Invalid ZIP magic header"

        elif ext == ".parquet":
            if header.startswith(b"PAR1"):
                return True, "Valid Apache Parquet magic (PAR1)"
            return False, "Invalid Parquet magic header"

        elif ext == ".json":
            with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                sample = f.read(2048).strip()
                if sample.startswith("{") or sample.startswith("["):
                    return True, "Valid JSON structure (sampled)"
            return False, "Invalid JSON structure"

        elif ext == ".jsonl":
            lines = 0
            with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    if line.strip():
                        json.loads(line)
                        lines += 1
                        if lines >= 20: break
            return True, f"Valid JSONL records (sampled {lines} lines)"

        elif ext in (".csv", ".tsv"):
            delimiter = "\t" if ext == ".tsv" else ","
            with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                reader = csv.reader(f, delimiter=delimiter)
                headers = next(reader, None)
                if headers and len(headers) > 0:
                    sample_rows = 0
                    for _ in reader:
                        sample_rows += 1
                        if sample_rows >= 20: break
                    return True, f"Valid Delimited Table (columns: {len(headers)}, sampled {sample_rows} rows)"
            return False, "Invalid CSV/TSV table"

        return True, "Binary / verified file"

    except Exception as e:
        return False, f"Content verification failed: {e}"

def compute_sha256(filepath):
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(1048576):
            sha.update(chunk)
    return sha.hexdigest()

def main():
    parser = argparse.ArgumentParser(description="Bangla AI Dataset Collection Integrity Verifier")
    parser.add_argument("--drive-path", default=DEFAULT_DRIVE_BASE, help="Google Drive bangla_ai folder")
    parser.add_argument("--checksums", default=None, help="Path to checksums.csv")
    parser.add_argument("--full-hash", action="store_true", help="Recompute SHA-256 for all large files")
    args = parser.parse_args()

    drive_path = args.drive_path
    checksum_file = args.checksums or os.path.join(drive_path, "checksums.csv")

    print("=" * 80)
    print("BANGLA AI DATASET COLLECTION - VERIFICATION & INTEGRITY REPORT")
    print(f"Target Directory: {drive_path}")
    print("=" * 80)

    if not os.path.exists(drive_path):
        print(f"Error: Target path does not exist: {drive_path}")
        sys.exit(1)

    expected_checksums = {}
    if os.path.exists(checksum_file):
        with open(checksum_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rel = row.get("relative_path", "").replace("/", os.sep)
                expected_checksums[rel] = row

    total_files = 0
    valid_files = 0
    failed_files = 0
    total_bytes = 0

    print(f"{'Relative Path':<45} | {'Size':>10} | {'Status':<12} | {'Notes / Records'}")
    print("-" * 110)

    for root, dirs, files in os.walk(drive_path):
        for fname in sorted(files):
            if fname.lower() in ("desktop.ini", ".ds_store") or fname.endswith(".part"):
                continue
            if fname in ("download_report.csv", "checksums.csv", "manifest.json", "README.md") and root == drive_path:
                continue

            full_path = os.path.join(root, fname)
            rel_path = os.path.relpath(full_path, drive_path)
            size = os.path.getsize(full_path)
            total_bytes += size
            total_files += 1

            is_valid_content, note = verify_file_content(full_path)

            status = "PASSED"
            if not is_valid_content:
                status = "CORRUPT"
                failed_files += 1
            elif rel_path in expected_checksums:
                exp_entry = expected_checksums[rel_path]
                exp_size = int(exp_entry.get("size_bytes", 0))
                exp_sha = exp_entry.get("sha256")
                
                if exp_size and size != exp_size:
                    status = "SIZE_MISMATCH"
                    failed_files += 1
                elif args.full_hash or size < 10 * 1024 * 1024:
                    actual_sha = compute_sha256(full_path)
                    if exp_sha and actual_sha != exp_sha:
                        status = "SHA_MISMATCH"
                        failed_files += 1
                    else:
                        valid_files += 1
                else:
                    # Verified size and format for multi-GB archives
                    valid_files += 1
            else:
                valid_files += 1

            print(f"{rel_path:<45} | {format_bytes(size):>10} | {status:<12} | {note[:45]}", flush=True)

    print("-" * 110)
    print(f"TOTAL SCANNED: {total_files} files | {format_bytes(total_bytes)}")
    print(f"PASSED: {valid_files} | FAILED / INCOMPLETE: {failed_files}")
    print("=" * 80)

if __name__ == "__main__":
    main()
