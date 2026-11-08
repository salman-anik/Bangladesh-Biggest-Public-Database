import os
import sys
import json
import csv
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KHATIANS_DIR = os.path.join(BASE_DIR, "khatians")
SOURCE_JSON = os.path.join(KHATIANS_DIR, "khatians.json")
SOURCE_CSV = os.path.join(KHATIANS_DIR, "khatians.csv")
INDEX_JSON = os.path.join(KHATIANS_DIR, "index.json")

def sanitize_name(name):
    if not name:
        return "Unknown"
    # replace invalid characters for filesystem
    return "".join(c for c in str(name) if c not in r'\/:*?"<>|').strip()

def run_partition():
    print(f"Reading {SOURCE_JSON}...")
    with open(SOURCE_JSON, "r", encoding="utf-8") as f:
        records = json.load(f)

    total_records = len(records)
    print(f"Loaded {total_records:,} records.")

    # Group records by (division, district, upazila)
    grouped = defaultdict(list)
    updated_records = []

    for r in records:
        div_en = r.get("division_en") or r.get("division") or "Unknown_Division"
        dist_en = r.get("district_en") or r.get("district") or "Unknown_District"
        upz_en = r.get("upazila_en") or r.get("upazila") or "Unknown_Upazila"
        upz_bn = r.get("upazila", "")

        # Fix Gazipur Unknown upazila_en
        if (upz_en == "Unknown" or not upz_en) and "কালিয়াকৈর" in upz_bn:
            upz_en = "Kaliakair"
            r["upazila_en"] = "Kaliakair"
            if r.get("pdf_path") and "Unknown" in r["pdf_path"]:
                r["pdf_path"] = r["pdf_path"].replace("Unknown", "Kaliakair")

        div_clean = sanitize_name(div_en)
        dist_clean = sanitize_name(dist_en)
        upz_clean = sanitize_name(upz_en)

        grouped[(div_clean, dist_clean, upz_clean)].append(r)
        updated_records.append(r)

    print(f"Found {len(grouped)} distinct upazila groups.")

    catalog = {
        "title": "Bangladesh Khatians Dataset - Partitioned Catalog",
        "total_records": total_records,
        "total_divisions": len(set(k[0] for k in grouped.keys())),
        "total_districts": len(set((k[0], k[1]) for k in grouped.keys())),
        "total_upazilas": len(grouped),
        "hierarchy": "division > district > upazila.json",
        "partitions": []
    }

    # Write each group to its own JSON file
    for (div, dist, upz), recs in sorted(grouped.items()):
        target_dir = os.path.join(KHATIANS_DIR, div, dist)
        os.makedirs(target_dir, exist_ok=True)
        target_file = os.path.join(target_dir, f"{upz}.json")

        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(recs, f, ensure_ascii=False, indent=2)

        rel_path = os.path.relpath(target_file, KHATIANS_DIR).replace("\\", "/")
        print(f"  -> Wrote {len(recs):,} records to {rel_path}")

        first_rec = recs[0]
        catalog["partitions"].append({
            "division_en": div,
            "division_bn": first_rec.get("division", ""),
            "district_en": dist,
            "district_bn": first_rec.get("district", ""),
            "upazila_en": upz,
            "upazila_bn": first_rec.get("upazila", ""),
            "record_count": len(recs),
            "file_path": rel_path
        })

    # Save index.json
    with open(INDEX_JSON, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    print(f"Wrote index to {os.path.relpath(INDEX_JSON, BASE_DIR)}")

    # Update source khatians.json with any fixes (like Kaliakair)
    with open(SOURCE_JSON, "w", encoding="utf-8") as f:
        json.dump(updated_records, f, ensure_ascii=False, indent=2)
    print(f"Updated source {SOURCE_JSON} with normalized metadata.")

    # Update source khatians.csv
    fields = [
        "id", "khatian_no", "division", "division_en", "district", "district_en",
        "upazila", "upazila_en", "survey", "survey_key", "mouza_name", "jl_no", "jl_id",
        "owners", "guardians", "dags", "total_land", "pdf_path", "pdf_status", "pdf_size_bytes"
    ]
    with open(SOURCE_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in updated_records:
            writer.writerow({k: row.get(k, '') for k in fields})
    print(f"Updated source {SOURCE_CSV}.")

    print("\nPartition complete!")

if __name__ == "__main__":
    run_partition()
