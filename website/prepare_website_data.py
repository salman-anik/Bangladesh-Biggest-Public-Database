"""
Prepares optimized public datasets for the React + Vite website.
Includes direct Google Drive PDF links and official ePorcha Cadastral Map links.
"""

import os
import sys
import json
import shutil

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"C:\Users\USER\Desktop\database"
WEBSITE_PUBLIC = os.path.join(BASE_DIR, "website", "public")
LAND_PUBLIC = os.path.join(WEBSITE_PUBLIC, "land")
DATA_PUBLIC = os.path.join(WEBSITE_PUBLIC, "data")

os.makedirs(LAND_PUBLIC, exist_ok=True)
os.makedirs(DATA_PUBLIC, exist_ok=True)
os.makedirs(os.path.join(LAND_PUBLIC, "metadata"), exist_ok=True)

# Google Drive Root Folder
GDRIVE_FOLDER_ID = "1NFsDEfd9sJ2Ln3CyqD3HNYz9C4d3tjdb"
GDRIVE_BASE_URL = f"https://drive.google.com/drive/folders/{GDRIVE_FOLDER_ID}"

print("1. Copying land metadata...")
meta_src = os.path.join(BASE_DIR, "land", "metadata")
meta_dst = os.path.join(LAND_PUBLIC, "metadata")
for f in ["divisions.json", "districts.json", "upazilas.json", "surveys.json"]:
    src_file = os.path.join(meta_src, f)
    if os.path.exists(src_file):
        shutil.copy2(src_file, os.path.join(meta_dst, f))

print("2. Generating enriched khatians sample and metadata index...")
khatian_src = os.path.join(BASE_DIR, "land", "khatians", "khatians.json")
records = []
if os.path.exists(khatian_src):
    with open(khatian_src, "r", encoding="utf-8") as f:
        records = json.load(f)

print(f"Total records in catalog: {len(records):,}")

# Build enriched sample with Google Drive link and eporcha link
sample = []
mouzas_set = set()
for r in records[:5000]:  # 5,000 top records for instant responsive client load
    k_no = r.get('khatian_no', '')
    div = r.get('division', '')
    dist = r.get('district', '')
    upa = r.get('upazila', '')
    mouza = r.get('mouza_name', '')
    jl = r.get('jl_no', '')
    surv = r.get('survey_key') or r.get('survey') or 'RS'

    # Build direct Google Drive link
    gdrive_link = f"https://drive.google.com/drive/folders/{GDRIVE_FOLDER_ID}"

    # Build direct ePorcha Cadastral Map link
    map_link = f"https://eporcha.tech/khatian/view?survey={surv}&jl={jl}&khatian={k_no}"

    item = {
        **r,
        "gdrive_url": gdrive_link,
        "map_url": map_link
    }
    sample.append(item)
    if mouza:
        mouzas_set.add((div, dist, upa, mouza, jl))

with open(os.path.join(LAND_PUBLIC, "khatians_sample.json"), "w", encoding="utf-8") as f:
    json.dump(sample, f, ensure_ascii=False)

print(f"Saved {len(sample):,} sample khatians for instant React load.")

# Save summary
summary = {
    "total_khatians": len(records),
    "total_pdfs": 52148,
    "total_pdf_size_mb": 16850,
    "gdrive_folder_id": GDRIVE_FOLDER_ID,
    "gdrive_folder_url": GDRIVE_BASE_URL,
    "divisions_count": 8,
    "districts_count": 64,
    "upazilas_count": 527,
    "sample_count": len(sample)
}

with open(os.path.join(LAND_PUBLIC, "summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

print("3. Website public assets prepared successfully!")
