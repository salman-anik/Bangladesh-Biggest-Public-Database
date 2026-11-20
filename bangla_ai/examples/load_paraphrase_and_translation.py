#!/usr/bin/env python3
"""
Example: Loading Bangla Paraphrase and Translation Datasets
Demonstrates loading BanglaParaphrase from Drive ZIP archive and IndicTrans2 benchmarks.
"""

import os
import zipfile

DRIVE_PARAPHRASE = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai\translation\banglaparaphrase"

def inspect_paraphrase_archive():
    zip_path = os.path.join(DRIVE_PARAPHRASE, "BanglaParaphrase.zip")
    if os.path.exists(zip_path):
        print("BanglaParaphrase ZIP Archive Contents:")
        with zipfile.ZipFile(zip_path, "r") as zf:
            for info in zf.infolist():
                print(f"  {info.filename} ({info.file_size / (1024*1024):.2f} MB)")
            
            # Read first 2 lines from the first file without full extraction to disk
            first_file = zf.namelist()[0]
            with zf.open(first_file) as f:
                header = f.readline().decode('utf-8', errors='replace').strip()
                sample = f.readline().decode('utf-8', errors='replace').strip()
                print(f"\nHeader from {first_file}: {header}")
                print(f"Sample row: {sample[:150]}...")

if __name__ == "__main__":
    inspect_paraphrase_archive()
