"""
Comprehensive National Land Records Crawler & PDF Downloader
Traverses Bangladesh administrative hierarchy (8 Divisions, 64 Districts, Upazilas, Mouzas)
Extracts Khatian details, generates official PDFs, and organizes them into the database.
"""

import os
import sys
import json
import time
import shutil
import urllib.request
import urllib.parse
from eporcha_scraper import EPorchaScraper

sys.stdout.reconfigure(encoding='utf-8')

STATE_FILE = "crawler_state.json"
MIN_FREE_DISK_GB = 5.0  # Safe threshold to protect OS drive

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

def run_crawler(max_khatians_per_mouza=10, max_mouzas_per_upazila=2):
    scraper = EPorchaScraper(".")
    state = load_state()
    completed_mouzas = set(state.get("completed_mouzas", []))

    print("=======================================================================")
    print("   ePorcha National Land Records Continuous Ingestion Engine")
    print(f"   Free Disk Space: {get_free_disk_gb():.2f} GB (Safety Threshold: {MIN_FREE_DISK_GB} GB)")
    print(f"   Previously processed mouzas: {len(completed_mouzas)}")
    print("=======================================================================")

    divisions = scraper.divisions
    districts = scraper.districts
    upazilas = scraper.upazilas
    surveys = scraper.surveys

    # Sort divisions: start with Dhaka, Chattogram, Rajshahi, etc.
    for div in divisions:
        div_name = div.get('NAME')
        div_bbs = div.get('BBS_CODE')
        div_districts = [d for d in districts if d.get('DIVISION_BBS_CODE') == div_bbs or d.get('DIVISION_ID') == div.get('ID')]

        print(f"\n[Division: {div_name}] Starting {len(div_districts)} districts...")

        for dist in div_districts:
            dist_name = dist.get('NAME')
            dist_en = dist.get('NAME_EN', dist_name)
            dist_bbs = dist.get('BBS_CODE')
            dist_upazilas = [u for u in upazilas if u.get('DISTRICT_BBS_CODE') == dist_bbs or u.get('DISTRICT_ID') == dist.get('ID')]

            print(f"  [District: {dist_name} ({dist_en})] {len(dist_upazilas)} upazilas.")

            for upa in dist_upazilas:
                upa_name = upa.get('NAME')
                upa_en = upa.get('NAME_EN', upa_name)
                upa_bbs = upa.get('BBS_CODE')

                # Check disk safety
                free_gb = get_free_disk_gb()
                if free_gb < MIN_FREE_DISK_GB:
                    print(f"\n[!] WARNING: Free disk space is low ({free_gb:.2f} GB). Pausing crawler for system safety.")
                    return

                # For each upazila, fetch surveys
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
                    # Find survey key
                    matched_s = next((s for s in surveys if s.get('ID') == surv_id), None)
                    surv_key = matched_s.get('KEY', 'RS') if matched_s else 'RS'

                    # Fetch mouzas
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

                    # Process up to max_mouzas_per_upazila for wide national coverage
                    target_mouzas = mouzas[:max_mouzas_per_upazila]
                    for m in target_mouzas:
                        m_id = str(m.get('ID'))
                        mouza_key = f"{dist_bbs}_{upa_bbs}_{surv_id}_{m_id}"

                        if mouza_key in completed_mouzas:
                            continue

                        state["current_step"] = f"{dist_name} -> {upa_name} -> {m.get('MOUZA_NAME')} ({surv_name})"
                        save_state(state)

                        try:
                            khatians_raw = scraper.fetch_all_khatians_for_mouza(
                                survey_key=surv_key,
                                jl_number_id=m['ID'],
                                mouza_name=m['MOUZA_NAME'],
                                jl_number=m['JL_NUMBER'],
                                max_khatians=max_khatians_per_mouza
                            )

                            if khatians_raw:
                                scraper.process_and_save_khatians(
                                    division=div,
                                    district=dist,
                                    upazila=upa,
                                    survey={"NAME": surv_name, "KEY": surv_key},
                                    mouza=m,
                                    khatians_raw=khatians_raw,
                                    download_pdfs=True
                                )
                        except Exception as e:
                            print(f"      [!] Error processing mouza {m.get('MOUZA_NAME')}: {e}")

                        completed_mouzas.add(mouza_key)
                        state["completed_mouzas"] = list(completed_mouzas)
                        save_state(state)
                        scraper.generate_summary()
                        time.sleep(0.5)

    print("\nNational ingestion cycle complete!")

if __name__ == '__main__':
    limit = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8
    run_crawler(max_khatians_per_mouza=limit, max_mouzas_per_upazila=2)
