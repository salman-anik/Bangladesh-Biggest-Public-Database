import os
import sys
import json
import shutil
from eporcha_scraper import EPorchaScraper

sys.stdout.reconfigure(encoding='utf-8')

scraper = EPorchaScraper(".")
json_file = "khatians/khatians.json"

if os.path.exists(json_file):
    with open(json_file, "r", encoding="utf-8") as f:
        records = json.load(f)

    updated_records = []
    for r in records:
        dist_name = r.get('district', '')
        dist_en = r.get('district_en') or dist_name
        upa_name = r.get('upazila', '')
        upa_en = r.get('upazila_en') or upa_name
        surv_key = r.get('survey_key', 'RS')
        mouza_name = r.get('mouza_name', '')
        jl_no = r.get('jl_no', '')
        khatian_no = r.get('khatian_no', '')

        # Standard folder names
        dist_folder = scraper.clean_name(f"{dist_en}_{dist_name}" if dist_en != dist_name else dist_name)
        upa_folder = scraper.clean_name(f"{upa_en}_{upa_name}" if upa_en != upa_name else upa_name)
        surv_folder = scraper.clean_name(surv_key)
        mouza_folder = scraper.clean_name(f"{mouza_name}_JL_{jl_no}")
        pdf_filename = f"Khatian_{scraper.clean_name(str(khatian_no))}.pdf"

        new_pdf_dir = os.path.join(scraper.pdf_dir, dist_folder, upa_folder, surv_folder, mouza_folder)
        os.makedirs(new_pdf_dir, exist_ok=True)
        new_pdf_path = os.path.join(new_pdf_dir, pdf_filename)

        # Check old path
        old_path = r.get('pdf_path', '')
        if old_path and os.path.exists(old_path):
            if os.path.abspath(old_path) != os.path.abspath(new_pdf_path):
                shutil.copy2(old_path, new_pdf_path)

        if os.path.exists(new_pdf_path):
            r['pdf_path'] = os.path.relpath(new_pdf_path, scraper.base_dir).replace('\\', '/')
            r['pdf_status'] = "Downloaded"
            r['pdf_size_bytes'] = os.path.getsize(new_pdf_path)
            r['district_en'] = dist_en
            r['upazila_en'] = upa_en

        updated_records.append(r)

    # Save
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(updated_records, f, ensure_ascii=False, indent=2)

    scraper.append_to_database(updated_records)
    scraper.generate_summary()
    print(f"Reorganized {len(updated_records)} records successfully.")
