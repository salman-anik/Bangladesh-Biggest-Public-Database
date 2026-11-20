"""
Duplicate Detection Utility
Bangladesh Biggest Public Database

Scans CSV and JSON list datasets to detect duplicate records,
duplicate keys, or redundant entries.
"""

import json
from pathlib import Path
import sys

def check_json_duplicates(file_path: Path, unique_key: str = None):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, list):
            return 0, []
        
        seen = set()
        duplicates = []
        for i, item in enumerate(data):
            if unique_key and isinstance(item, dict) and unique_key in item:
                val = str(item[unique_key])
            else:
                val = json.dumps(item, sort_keys=True)
            if val in seen:
                duplicates.append((i, val[:60]))
            seen.add(val)
        return len(duplicates), duplicates
    except Exception as e:
        return -1, [str(e)]

def main():
    root = Path(__file__).resolve().parent.parent
    print(f"[*] Scanning for duplicates across datasets in: {root}")
    
    total_dupes = 0
    checked_files = 0
    
    for category_dir in [root / "fisheries", root / "livestock", root / "energy", root / "employment", root / "trade"]:
        if not category_dir.exists():
            continue
        for json_file in category_dir.glob("*.json"):
            checked_files += 1
            count, items = check_json_duplicates(json_file)
            if count > 0:
                print(f"[!] {json_file.name}: {count} duplicates detected!")
                total_dupes += count
                
    print(f"[+] Checked {checked_files} dataset files. Total duplicates detected: {total_dupes}")

if __name__ == "__main__":
    main()
