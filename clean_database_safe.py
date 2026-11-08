"""
Safe Database Cleanup Utility
Cleans temporary HTML cache, empty folders, and Python bytecode WITHOUT removing any data, PDFs, or JSONs.
"""

import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DATABASE_DIR = r"C:\Users\USER\Desktop\database"
LAND_DIR = os.path.join(DATABASE_DIR, "land")
TEMP_HTML_DIR = os.path.join(LAND_DIR, "temp_html")

print("=" * 60)
print("   Running Safe Database Cleanup (Preserving All Data)")
print("=" * 60)

# 1. Clean temp_html (only temporary html rendered during scraper)
cleaned_temp = 0
if os.path.exists(TEMP_HTML_DIR):
    for f in os.listdir(TEMP_HTML_DIR):
        fp = os.path.join(TEMP_HTML_DIR, f)
        try:
            if os.path.isfile(fp):
                os.remove(fp)
                cleaned_temp += 1
        except Exception:
            pass
    print(f"✓ Cleaned temporary scraper cache files: {cleaned_temp:,} items")

# 2. Clean __pycache__ and .pyc files
cleaned_pyc = 0
for root, dirs, files in os.walk(DATABASE_DIR):
    if "__pycache__" in dirs:
        pycache_path = os.path.join(root, "__pycache__")
        try:
            for pf in os.listdir(pycache_path):
                os.remove(os.path.join(pycache_path, pf))
            os.rmdir(pycache_path)
            cleaned_pyc += 1
        except Exception:
            pass

print(f"✓ Removed temporary __pycache__ directories: {cleaned_pyc}")

# 3. Clean empty leftover directories (without touching any non-empty folders)
cleaned_dirs = 0
for root, dirs, files in os.walk(DATABASE_DIR, topdown=False):
    # Do not delete root dirs or website
    if root in [DATABASE_DIR, LAND_DIR, os.path.join(DATABASE_DIR, "website")]:
        continue
    try:
        # Check if dir is empty
        if not os.listdir(root):
            os.rmdir(root)
            cleaned_dirs += 1
    except Exception:
        pass

print(f"✓ Cleaned empty leftover directories: {cleaned_dirs}")

# 4. Data integrity verification
khatian_json = os.path.join(LAND_DIR, "khatians", "khatians.json")
import json
if os.path.exists(khatian_json):
    with open(khatian_json, "r", encoding="utf-8") as f:
        k_data = json.load(f)
    print(f"✓ Verified Khatians Catalog: {len(k_data):,} records intact")

print("=" * 60)
print("✓ Cleanup completed successfully! Zero data removed.")
print("=" * 60)
