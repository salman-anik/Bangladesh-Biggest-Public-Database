"""
Reorganizes Land Records and PDFs strictly by:
Division > District > Upazila > Survey > Mouza > Khatian.pdf
"""

import os
import sys
import json
import shutil
import re
import csv

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"C:\Users\USER\Desktop\database\land"
PDF_DIR = os.path.join(BASE_DIR, "pdfs")
KHATIAN_JSON = os.path.join(BASE_DIR, "khatians", "khatians.json")
KHATIAN_CSV = os.path.join(BASE_DIR, "khatians", "khatians.csv")
META_DIR = os.path.join(BASE_DIR, "metadata")

def clean_name(name):
    if not name:
        return "Unknown"
    return re.sub(r'[\\/*?:"<>|]', '', str(name)).strip()

def build_lookups():
    div_file = os.path.join(META_DIR, "divisions.json")
    dist_file = os.path.join(META_DIR, "districts.json")
    upa_file = os.path.join(META_DIR, "upazilas.json")

    divisions = {}
    if os.path.exists(div_file):
        with open(div_file, "r", encoding="utf-8") as f:
            for d in json.load(f):
                divisions[str(d.get('ID'))] = d
                divisions[str(d.get('BBS_CODE'))] = d

    districts = {}
    if os.path.exists(dist_file):
        with open(dist_file, "r", encoding="utf-8") as f:
            for d in json.load(f):
                districts[d.get('NAME')] = d
                districts[d.get('NAME_EN', '').upper()] = d

    upazilas = {}
    if os.path.exists(upa_file):
        with open(upa_file, "r", encoding="utf-8") as f:
            for u in json.load(f):
                upazilas[(u.get('DISTRICT_NAME'), u.get('NAME'))] = u
                upazilas[(u.get('DISTRICT_NAME_EN', '').upper(), u.get('NAME_EN', '').upper())] = u

    return divisions, districts, upazilas

def reorganize():
    print("=" * 70)
    print("   Reorganizing Land Database: Division > District > Upazila > Others")
    print("=" * 70)

    divisions, districts, upazilas = build_lookups()

    if not os.path.exists(KHATIAN_JSON):
        print("No khatians.json found.")
        return

    with open(KHATIAN_JSON, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"Total catalog records to organize: {len(records):,}")

    moved_count = 0
    updated_records = []

    for r in records:
        div_bn = r.get('division') or ''
        div_en = r.get('division_en') or ''
        dist_bn = r.get('district') or ''
        dist_en = r.get('district_en') or ''
        upa_bn = r.get('upazila') or ''
        upa_en = r.get('upazila_en') or ''
        surv_key = r.get('survey_key') or r.get('survey') or 'RS'
        mouza_bn = r.get('mouza_name') or ''
        jl_no = r.get('jl_no') or ''
        k_no = str(r.get('khatian_no', ''))

        # Lookup missing metadata if needed
        if not div_en or not dist_en:
            dist_info = districts.get(dist_bn) or districts.get(dist_en.upper())
            if dist_info:
                dist_en = dist_en or dist_info.get('NAME_EN', '')
                div_bn = div_bn or dist_info.get('DIVISION_NAME', '')
                div_en = div_en or dist_info.get('DIVISION_NAME_EN', '')

        # Canonical folder names: Division > District > Upazila > Survey > Mouza
        div_folder = clean_name(f"{div_en}_{div_bn}" if div_en and div_en != div_bn else (div_en or div_bn or "Unknown_Division"))
        dist_folder = clean_name(f"{dist_en}_{dist_bn}" if dist_en and dist_en != dist_bn else (dist_en or dist_bn or "Unknown_District"))
        upa_folder = clean_name(f"{upa_en}_{upa_bn}" if upa_en and upa_en != upa_bn else (upa_en or upa_bn or "Unknown_Upazila"))
        surv_folder = clean_name(surv_key)
        mouza_folder = clean_name(f"{mouza_bn}_JL_{jl_no}")
        pdf_filename = f"Khatian_{clean_name(k_no)}.pdf"

        # Target relative path: pdfs/Division/District/Upazila/Survey/Mouza/Khatian.pdf
        rel_pdf_path = f"pdfs/{div_folder}/{dist_folder}/{upa_folder}/{surv_folder}/{mouza_folder}/{pdf_filename}"
        new_pdf_full = os.path.join(BASE_DIR, rel_pdf_path.replace('/', os.sep))

        old_rel_path = r.get('pdf_path', '')
        old_pdf_full = os.path.join(BASE_DIR, old_rel_path.replace('/', os.sep)) if old_rel_path else None

        # Check if old file exists and needs moving
        if old_pdf_full and os.path.exists(old_pdf_full) and os.path.getsize(old_pdf_full) > 1000:
            if os.path.abspath(old_pdf_full) != os.path.abspath(new_pdf_full):
                os.makedirs(os.path.dirname(new_pdf_full), exist_ok=True)
                if not os.path.exists(new_pdf_full) or os.path.getsize(new_pdf_full) < 1000:
                    shutil.move(old_pdf_full, new_pdf_full)
                    moved_count += 1
                elif os.path.exists(old_pdf_full):
                    try:
                        os.remove(old_pdf_full)
                    except Exception:
                        pass

        # Update record
        if os.path.exists(new_pdf_full) and os.path.getsize(new_pdf_full) > 1000:
            r['pdf_status'] = "Downloaded"
            r['pdf_size_bytes'] = os.path.getsize(new_pdf_full)
        r['pdf_path'] = rel_pdf_path
        r['division'] = div_bn
        r['division_en'] = div_en
        r['district'] = dist_bn
        r['district_en'] = dist_en
        r['upazila'] = upa_bn
        r['upazila_en'] = upa_en

        updated_records.append(r)

    print(f"Moved and updated {moved_count:,} PDF files into new Division-first hierarchy.")

    # Cleanup empty directories
    print("Cleaning up old directories...")
    for root, dirs, files in os.walk(PDF_DIR, topdown=False):
        for d in dirs:
            dir_path = os.path.join(root, d)
            try:
                if not os.listdir(dir_path):
                    os.rmdir(dir_path)
            except Exception:
                pass

    # Save JSON
    with open(KHATIAN_JSON, "w", encoding="utf-8") as f:
        json.dump(updated_records, f, ensure_ascii=False, indent=2)

    # Save CSV
    fields = [
        "id", "khatian_no", "division", "division_en", "district", "district_en",
        "upazila", "upazila_en", "survey", "survey_key", "mouza_name", "jl_no", "jl_id",
        "owners", "guardians", "dags", "total_land", "pdf_path", "pdf_status", "pdf_size_bytes"
    ]
    with open(KHATIAN_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in updated_records:
            writer.writerow({k: row.get(k, '') for k in fields})

    total_downloaded = sum(1 for r in updated_records if r.get('pdf_status') == "Downloaded")
    total_bytes = sum(r.get('pdf_size_bytes', 0) for r in updated_records)

    summary = {
        "total_khatians": len(updated_records),
        "total_pdfs_downloaded": total_downloaded,
        "total_pdf_size_mb": round(total_bytes / (1024 * 1024), 2),
        "divisions_represented": len(set(r.get('division') for r in updated_records if r.get('division'))),
        "districts_represented": len(set(r.get('district') for r in updated_records if r.get('district'))),
        "upazilas_represented": len(set(r.get('upazila') for r in updated_records if r.get('upazila'))),
        "mouzas_represented": len(set(f"{r.get('district')}_{r.get('mouza_name')}" for r in updated_records)),
        "hierarchy_format": "division > district > upazila > survey > mouza",
        "last_updated": os.popen('echo %date% %time%').read().strip()
    }
    with open(os.path.join(BASE_DIR, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("\nReorganization Complete!")
    print(f"Verified PDFs: {total_downloaded:,} ({summary['total_pdf_size_mb']} MB)")

if __name__ == '__main__':
    reorganize()
