"""
High-Throughput Multi-Threaded Unlimited National Land Records & PDF Downloader
Portal: https://eporcha.tech/
Downloads ALL mouzas, ALL khatians, and ALL PDFs without limits, with parallel workers.
"""

import os
import sys
import json
import time
import shutil
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from eporcha_scraper import EPorchaScraper

sys.stdout.reconfigure(encoding='utf-8')

STATE_FILE = "crawler_state.json"
MIN_FREE_DISK_GB = 4.0
PARALLEL_PDF_WORKERS = 6  # Optimal for eporcha.tech without getting rate-limited

def get_free_disk_gb(path="."):
    total, used, free = shutil.disk_usage(path)
    return free / (1024 ** 3)

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"completed_mouzas": [], "total_khatians": 0, "total_pdfs": 0, "current_step": ""}

def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def download_single_pdf(scraper, record, target_pdf_dir):
    khatian_no = record.get('khatian_no', '')
    pdf_filename = f"Khatian_{scraper.clean_name(str(khatian_no))}.pdf"
    pdf_path = os.path.join(target_pdf_dir, pdf_filename)
    rel_pdf_path = os.path.relpath(pdf_path, scraper.base_dir).replace('\\', '/')

    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
        return rel_pdf_path, "Downloaded", os.path.getsize(pdf_path)

    pdf_data = scraper.download_khatian_pdf(
        division_name=record.get('division', ''),
        survey_name_or_key=record.get('survey', ''),
        district_name=record.get('district', ''),
        upazila_name=record.get('upazila', ''),
        mouza_name=record.get('mouza_name', ''),
        jl_number=record.get('jl_no', ''),
        jl_number_id=record.get('jl_id'),
        khatian_no=khatian_no,
        owners=record.get('owners', ''),
        guardians=record.get('guardians', ''),
        dags=record.get('dags', ''),
        total_land=record.get('total_land', ''),
        save_path=pdf_path
    )

    if pdf_data:
        return rel_pdf_path, "Downloaded", len(pdf_data)
    return rel_pdf_path, "Failed", 0

def process_mouza_unlimited(scraper, division, district, upazila, survey, mouza):
    div_name = division.get('NAME') or division.get('NAME_EN', '')
    div_en = division.get('NAME_EN', '')
    dist_name = district.get('NAME') or district.get('NAME_EN', '')
    dist_en = district.get('NAME_EN', dist_name)
    upa_name = upazila.get('NAME') or upazila.get('NAME_EN', '')
    upa_en = upazila.get('NAME_EN', upa_name)
    surv_name = survey.get('NAME') or survey.get('LOCAL_NAME') or survey.get('KEY', '')
    surv_key = survey.get('KEY') or survey.get('SURVEY_NAME_EN') or 'RS'
    mouza_name = mouza.get('MOUZA_NAME', '')
    jl_no = mouza.get('JL_NUMBER', '')
    jl_id = mouza.get('ID')

    # Target folder
    dist_folder = scraper.clean_name(f"{dist_en}_{dist_name}" if dist_en != dist_name else dist_name)
    upa_folder = scraper.clean_name(f"{upa_en}_{upa_name}" if upa_en != upa_name else upa_name)
    surv_folder = scraper.clean_name(surv_key)
    mouza_folder = scraper.clean_name(f"{mouza_name}_JL_{jl_no}")
    target_pdf_dir = os.path.join(scraper.pdf_dir, dist_folder, upa_folder, surv_folder, mouza_folder)
    os.makedirs(target_pdf_dir, exist_ok=True)

    print(f"\n=======================================================================")
    print(f"--> [Mouza: {mouza_name} (JL {jl_no})] {dist_name} -> {upa_name} ({surv_name})")
    print(f"=======================================================================")

    # 1. Fetch ALL pages of khatians without any limit
    all_khatians = scraper.fetch_all_khatians_for_mouza(
        survey_key=surv_key,
        jl_number_id=jl_id,
        mouza_name=mouza_name,
        jl_number=jl_no,
        max_khatians=None  # UNLIMITED
    )

    if not all_khatians:
        print("   No khatians found for this mouza.")
        return []

    print(f"   Fetched {len(all_khatians)} khatians. Preparing records & PDFs...")

    # Build raw records list
    records = []
    for k in all_khatians:
        khatian_no = k.get('KHATIAN_NO', '')
        khatian_id = k.get('ID', '')
        owners = k.get('OWNERS') or ''
        guardians = k.get('GUARDIANS') or ''
        dags = k.get('DAGS') or ''
        total_land = k.get('TOTAL_LAND') or ''

        record = {
            "id": khatian_id,
            "khatian_no": khatian_no,
            "division": div_name,
            "division_en": div_en,
            "district": dist_name,
            "district_en": dist_en,
            "upazila": upa_name,
            "upazila_en": upa_en,
            "survey": surv_name,
            "survey_key": surv_key,
            "mouza_name": mouza_name,
            "jl_no": jl_no,
            "jl_id": jl_id,
            "owners": owners,
            "guardians": guardians,
            "dags": dags,
            "total_land": total_land,
            "pdf_path": "",
            "pdf_status": "Pending",
            "pdf_size_bytes": 0
        }
        records.append(record)

    # 2. Parallel PDF Downloads
    print(f"   Downloading PDFs with {PARALLEL_PDF_WORKERS} parallel workers...")
    with ThreadPoolExecutor(max_workers=PARALLEL_PDF_WORKERS) as executor:
        future_to_rec = {
            executor.submit(download_single_pdf, scraper, rec, target_pdf_dir): rec
            for rec in records
        }

        completed = 0
        for future in as_completed(future_to_rec):
            rec = future_to_rec[future]
            try:
                rel_path, status, size = future.result()
                rec['pdf_path'] = rel_path
                rec['pdf_status'] = status
                rec['pdf_size_bytes'] = size
            except Exception as e:
                rec['pdf_status'] = "Failed"
            completed += 1
            if completed % 10 == 0 or completed == len(records):
                print(f"      [{completed}/{len(records)}] PDFs processed.")

    # 3. Save to database
    scraper.append_to_database(records)
    scraper.generate_summary()
    return records

def run_unlimited():
    scraper = EPorchaScraper(".")
    state = load_state()
    completed_mouzas = set(state.get("completed_mouzas", []))

    print("*" * 75)
    print("      ePorcha UNLIMITED Land Records & PDF Ingestion Engine")
    print(f"      Free Disk Space: {get_free_disk_gb():.2f} GB")
    print(f"      Parallel Workers: {PARALLEL_PDF_WORKERS}")
    print("*" * 75)

    divisions = scraper.divisions
    districts = scraper.districts
    upazilas = scraper.upazilas
    surveys = scraper.surveys

    for div in divisions:
        div_name = div.get('NAME')
        div_bbs = div.get('BBS_CODE')
        div_districts = [d for d in districts if d.get('DIVISION_BBS_CODE') == div_bbs or d.get('DIVISION_ID') == div.get('ID')]

        for dist in div_districts:
            dist_name = dist.get('NAME')
            dist_en = dist.get('NAME_EN', dist_name)
            dist_bbs = dist.get('BBS_CODE')
            dist_upazilas = [u for u in upazilas if u.get('DISTRICT_BBS_CODE') == dist_bbs or u.get('DISTRICT_ID') == dist.get('ID')]

            for upa in dist_upazilas:
                upa_name = upa.get('NAME')
                upa_en = upa.get('NAME_EN', upa_name)
                upa_bbs = upa.get('BBS_CODE')

                # Disk safety check
                free_gb = get_free_disk_gb()
                if free_gb < MIN_FREE_DISK_GB:
                    print(f"\n[!] DISK SPACE SAFETY LIMIT REACHED ({free_gb:.2f} GB remaining).")
                    print("Halting to prevent system disk exhaustion.")
                    return

                surv_list = scraper._get("/api/dlrms/upazilas/surveys", {
                    "DISTRICT_BBS_CODE": dist_bbs,
                    "UPAZILA_BBS_CODE": upa_bbs,
                    "ROW_STATUS": "1"
                })
                if not surv_list:
                    continue

                for surv in surv_list:
                    surv_id = surv.get('SURVEY_ID')
                    surv_name = surv.get('LOCAL_NAME', '')
                    matched_s = next((s for s in surveys if s.get('ID') == surv_id), None)
                    surv_key = matched_s.get('KEY', 'RS') if matched_s else 'RS'

                    mouzas = scraper.fetch_mouzas(
                        district_bbs=dist_bbs,
                        upazila_bbs=upa_bbs,
                        district_en=dist_en,
                        upazila_en=upa_en,
                        survey_key=surv_key,
                        survey_id=surv_id
                    )
                    if not mouzas:
                        continue

                    for m in mouzas:
                        m_id = str(m.get('ID'))
                        mouza_key = f"{dist_bbs}_{upa_bbs}_{surv_id}_{m_id}"

                        if mouza_key in completed_mouzas:
                            continue

                        state["current_step"] = f"{dist_name} -> {upa_name} -> {m.get('MOUZA_NAME')} ({surv_name})"
                        save_state(state)

                        try:
                            process_mouza_unlimited(scraper, div, dist, upa, {"NAME": surv_name, "KEY": surv_key}, m)
                        except Exception as e:
                            print(f"Error processing mouza: {e}")

                        completed_mouzas.add(mouza_key)
                        state["completed_mouzas"] = list(completed_mouzas)
                        save_state(state)
                        time.sleep(0.3)

if __name__ == '__main__':
    run_unlimited()
