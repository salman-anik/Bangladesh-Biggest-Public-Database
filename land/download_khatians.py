"""
Interactive & Automated Downloader for ePorcha Land Records
Downloads all khatians, fetches owners & plot details, downloads PDFs, and arranges them.
"""

import os
import sys
import argparse
from eporcha_scraper import EPorchaScraper

sys.stdout.reconfigure(encoding='utf-8')

def run_preset_batch(scraper, max_per_mouza=15):
    """
    Downloads real khatians and PDFs across multiple districts, upazilas, and mouzas
    to populate a rich database immediately.
    """
    print("=" * 70)
    print("Starting ePorcha Land Database Batch Ingestion...")
    print("=" * 70)

    # We select diverse representative upazilas across districts
    targets = [
        # Tangail -> Basail -> Mouza 1 & 2
        {
            "division_bbs": "30", "division_name": "ঢাকা",
            "district_bbs": "93", "district_name": "টাঙ্গাইল", "district_en": "TANGAIL",
            "upazila_bbs": "09", "upazila_name": "বাসাইল", "upazila_en": "BASAIL",
            "survey_id": 2, "survey_name": "আর এস", "survey_key": "RS",
            "mouza_limit": 2
        },
        # Dhaka -> Dhamrai
        {
            "division_bbs": "30", "division_name": "ঢাকা",
            "district_bbs": "26", "district_name": "ঢাকা", "district_en": "DHAKA",
            "upazila_bbs": "14", "upazila_name": "ধামরাই", "upazila_en": "DHAMRAI",
            "survey_id": 2, "survey_name": "আর এস", "survey_key": "RS",
            "mouza_limit": 1
        },
        # Gazipur -> Kaliakair
        {
            "division_bbs": "30", "division_name": "ঢাকা",
            "district_bbs": "33", "district_name": "গাজীপুর", "district_en": "GAZIPUR",
            "upazila_bbs": "32", "upazila_name": "কালিয়াকৈর", "upazila_en": "KALIAKAIR",
            "survey_id": 2, "survey_name": "আর এস", "survey_key": "RS",
            "mouza_limit": 1
        }
    ]

    for target in targets:
        print(f"\n=======================================================")
        print(f"Target: {target['district_name']} -> {target['upazila_name']} ({target['survey_name']})")
        print(f"=======================================================")

        mouzas = scraper.fetch_mouzas(
            district_bbs=target['district_bbs'],
            upazila_bbs=target['upazila_bbs'],
            district_en=target['district_en'],
            upazila_en=target['upazila_en'],
            survey_key=target['survey_key'],
            survey_id=target['survey_id']
        )
        print(f"Found {len(mouzas)} mouzas.")

        selected_mouzas = mouzas[:target.get('mouza_limit', 1)]
        for m in selected_mouzas:
            khatians_raw = scraper.fetch_all_khatians_for_mouza(
                survey_key=target['survey_key'],
                jl_number_id=m['ID'],
                mouza_name=m['MOUZA_NAME'],
                jl_number=m['JL_NUMBER'],
                max_khatians=max_per_mouza
            )

            if khatians_raw:
                scraper.process_and_save_khatians(
                    division={"NAME": target['division_name']},
                    district={"NAME": target['district_name'], "NAME_EN": target['district_en']},
                    upazila={"NAME": target['upazila_name'], "NAME_EN": target['upazila_en']},
                    survey={"NAME": target['survey_name'], "KEY": target['survey_key']},
                    mouza=m,
                    khatians_raw=khatians_raw,
                    download_pdfs=True
                )

    scraper.generate_summary()
    print("\nBatch download complete!")

def interactive_mode(scraper):
    print("\n" + "=" * 60)
    print("  ePorcha Interactive Land Record Downloader")
    print("=" * 60)

    # 1. Division
    divisions = scraper.divisions
    print("\nSelect Division:")
    for i, d in enumerate(divisions, 1):
        print(f"  [{i}] {d.get('NAME')} ({d.get('NAME_EN')})")
    try:
        div_idx = int(input("Enter division number: ").strip()) - 1
        selected_div = divisions[div_idx]
    except Exception:
        selected_div = divisions[0]
    print(f"Selected: {selected_div.get('NAME')}")

    # 2. District
    districts = [d for d in scraper.districts if d.get('DIVISION_ID') == selected_div.get('ID') or d.get('DIVISION_BBS_CODE') == selected_div.get('BBS_CODE')]
    print(f"\nSelect District in {selected_div.get('NAME')}:")
    for i, d in enumerate(districts, 1):
        print(f"  [{i}] {d.get('NAME')} ({d.get('NAME_EN')})")
    try:
        dist_idx = int(input("Enter district number: ").strip()) - 1
        selected_dist = districts[dist_idx]
    except Exception:
        selected_dist = districts[0]
    print(f"Selected: {selected_dist.get('NAME')}")

    # 3. Upazila
    upazilas = [u for u in scraper.upazilas if u.get('DISTRICT_ID') == selected_dist.get('ID') or u.get('DISTRICT_BBS_CODE') == selected_dist.get('BBS_CODE')]
    print(f"\nSelect Upazila in {selected_dist.get('NAME')}:")
    for i, u in enumerate(upazilas, 1):
        print(f"  [{i}] {u.get('NAME')} ({u.get('NAME_EN')})")
    try:
        upa_idx = int(input("Enter upazila number: ").strip()) - 1
        selected_upa = upazilas[upa_idx]
    except Exception:
        selected_upa = upazilas[0]
    print(f"Selected: {selected_upa.get('NAME')}")

    # 4. Survey
    surveys = scraper.surveys
    print("\nSelect Survey Type:")
    for i, s in enumerate(surveys, 1):
        print(f"  [{i}] {s.get('NAME')} ({s.get('KEY')})")
    try:
        surv_idx = int(input("Enter survey number: ").strip()) - 1
        selected_surv = surveys[surv_idx]
    except Exception:
        selected_surv = surveys[1]  # Default RS
    print(f"Selected: {selected_surv.get('NAME')}")

    # 5. Fetch Mouzas
    print("\nFetching mouzas for selected area...")
    mouzas = scraper.fetch_mouzas(
        district_bbs=selected_dist.get('BBS_CODE'),
        upazila_bbs=selected_upa.get('BBS_CODE'),
        district_en=selected_dist.get('NAME_EN'),
        upazila_en=selected_upa.get('NAME_EN'),
        survey_key=selected_surv.get('KEY'),
        survey_id=selected_surv.get('ID')
    )
    if not mouzas:
        print("No mouzas found for this survey in the selected upazila.")
        return

    print(f"\nFound {len(mouzas)} mouzas:")
    for i, m in enumerate(mouzas[:30], 1):
        print(f"  [{i}] {m.get('MOUZA_NAME')} (JL: {m.get('JL_NUMBER')})")
    if len(mouzas) > 30:
        print(f"  ... and {len(mouzas)-30} more mouzas.")

    print("\nEnter mouza number (or 'all' for all mouzas in upazila):")
    choice = input("Choice: ").strip()

    limit_str = input("Max khatians per mouza to download (press enter for all, e.g. 10 or 50): ").strip()
    max_khatians = int(limit_str) if limit_str.isdigit() else None

    if choice.lower() == 'all':
        targets_mouzas = mouzas
    else:
        try:
            m_idx = int(choice) - 1
            targets_mouzas = [mouzas[m_idx]]
        except Exception:
            targets_mouzas = [mouzas[0]]

    for m in targets_mouzas:
        khatians_raw = scraper.fetch_all_khatians_for_mouza(
            survey_key=selected_surv.get('KEY'),
            jl_number_id=m['ID'],
            mouza_name=m['MOUZA_NAME'],
            jl_number=m['JL_NUMBER'],
            max_khatians=max_khatians
        )
        if khatians_raw:
            scraper.process_and_save_khatians(
                division=selected_div,
                district=selected_dist,
                upazila=selected_upa,
                survey=selected_surv,
                mouza=m,
                khatians_raw=khatians_raw,
                download_pdfs=True
            )

    scraper.generate_summary()
    print("\nDownload complete! Files saved and arranged.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="ePorcha Land Records & PDF Downloader")
    parser.add_argument("--batch", action="store_true", help="Run preset batch download across districts")
    parser.add_argument("--interactive", action="store_true", help="Run interactive selection mode")
    parser.add_argument("--limit", type=int, default=10, help="Max khatians per mouza in batch mode")
    args = parser.parse_args()

    scraper = EPorchaScraper(".")

    if args.interactive:
        interactive_mode(scraper)
    else:
        # Default run preset batch to ingest data immediately
        run_preset_batch(scraper, max_per_mouza=args.limit)
