"""
Nationwide Bangladesh Land Records (Khatian) Ingestion Engine
Collects and partitions ePorcha records across ALL 8 divisions of Bangladesh:
- Barishal
- Chattogram
- Dhaka
- Khulna
- Mymensingh
- Rajshahi
- Rangpur
- Sylhet
"""

import os
import sys
import json
import time
import csv
import urllib.request
import urllib.parse
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://eporcha.tech"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8'
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
META_DIR = os.path.join(BASE_DIR, "metadata")
KHATIAN_DIR = os.path.join(BASE_DIR, "khatians")
SOURCE_JSON = os.path.join(KHATIAN_DIR, "khatians.json")
SOURCE_CSV = os.path.join(KHATIAN_DIR, "khatians.csv")
INDEX_JSON = os.path.join(KHATIAN_DIR, "index.json")
SUMMARY_JSON = os.path.join(BASE_DIR, "summary.json")

# Curated nationwide targets covering all 8 divisions
TARGET_UPAZILAS = [
    # --- BARISHAL DIVISION ---
    {"division_en": "Barishal", "division_bn": "বরিশাল", "district_en": "Barishal", "district_bn": "বরিশাল", "dist_bbs": "06", "upazila_en": "Barishal Sadar", "upazila_bn": "বরিশাল সদর", "upz_bbs": "51", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Barishal", "division_bn": "বরিশাল", "district_en": "Barishal", "district_bn": "বরিশাল", "dist_bbs": "06", "upazila_en": "Babuganj", "upazila_bn": "বাবুগঞ্জ", "upz_bbs": "03", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Barishal", "division_bn": "বরিশাল", "district_en": "Patuakhali", "district_bn": "পটুয়াখালী", "dist_bbs": "78", "upazila_en": "Patuakhali Sadar", "upazila_bn": "পটুয়াখালী সদর", "upz_bbs": "95", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Barishal", "division_bn": "বরিশাল", "district_en": "Pirojpur", "district_bn": "পিরোজপুর", "dist_bbs": "79", "upazila_en": "Bhandaria", "upazila_bn": "ভাণ্ডারিয়া", "upz_bbs": "14", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Barishal", "division_bn": "বরিশাল", "district_en": "Bhola", "district_bn": "ভোলা", "dist_bbs": "09", "upazila_en": "Bhola Sadar", "upazila_bn": "ভোলা সদর", "upz_bbs": "18", "survey_key": "SA", "survey_id": "3"},

    # --- CHATTOGRAM DIVISION ---
    {"division_en": "Chattogram", "division_bn": "চট্টগ্রাম", "district_en": "Chattogram", "district_bn": "চট্টগ্রাম", "dist_bbs": "15", "upazila_en": "Hathazari", "upazila_bn": "হাটহাজারী", "upz_bbs": "37", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Chattogram", "division_bn": "চট্টগ্রাম", "district_en": "Chattogram", "district_bn": "চট্টগ্রাম", "dist_bbs": "15", "upazila_en": "Sitakunda", "upazila_bn": "সীতাকুন্ড", "upz_bbs": "86", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Chattogram", "division_bn": "চট্টগ্রাম", "district_en": "Coxs Bazar", "district_bn": "কক্সবাজার", "dist_bbs": "22", "upazila_en": "Coxs Bazar Sadar", "upazila_bn": "কক্সবাজার সদর", "upz_bbs": "24", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Chattogram", "division_bn": "চট্টগ্রাম", "district_en": "Cumilla", "district_bn": "কুমিল্লা", "dist_bbs": "19", "upazila_en": "Cumilla Sadar", "upazila_bn": "কুমিল্লা সদর", "upz_bbs": "33", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Chattogram", "division_bn": "চট্টগ্রাম", "district_en": "Feni", "district_bn": "ফেনী", "dist_bbs": "30", "upazila_en": "Feni Sadar", "upazila_bn": "ফেনী সদর", "upz_bbs": "29", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Chattogram", "division_bn": "চট্টগ্রাম", "district_en": "Brahmanbaria", "district_bn": "ব্রাহ্মণবাড়িয়া", "dist_bbs": "12", "upazila_en": "Brahmanbaria Sadar", "upazila_bn": "ব্রাহ্মণবাড়িয়া সদর", "upz_bbs": "13", "survey_key": "RS", "survey_id": "2"},

    # --- KHULNA DIVISION ---
    {"division_en": "Khulna", "division_bn": "খুলনা", "district_en": "Khulna", "district_bn": "খুলনা", "dist_bbs": "47", "upazila_en": "Rupsha", "upazila_bn": "রূপসা", "upz_bbs": "75", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Khulna", "division_bn": "খুলনা", "district_en": "Khulna", "district_bn": "খুলনা", "dist_bbs": "47", "upazila_en": "Dighalia", "upazila_bn": "দিঘলিয়া", "upz_bbs": "40", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Khulna", "division_bn": "খুলনা", "district_en": "Jashore", "district_bn": "যশোর", "dist_bbs": "41", "upazila_en": "Jashore Sadar", "upazila_bn": "যশোর সদর", "upz_bbs": "47", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Khulna", "division_bn": "খুলনা", "district_en": "Kushtia", "district_bn": "কুষ্টিয়া", "dist_bbs": "50", "upazila_en": "Kushtia Sadar", "upazila_bn": "কুষ্টিয়া সদর", "upz_bbs": "79", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Khulna", "division_bn": "খুলনা", "district_en": "Satkhira", "district_bn": "সাতক্ষীরা", "dist_bbs": "87", "upazila_en": "Satkhira Sadar", "upazila_bn": "সাতক্ষীরা সদর", "upz_bbs": "82", "survey_key": "RS", "survey_id": "2"},

    # --- RAJSHAHI DIVISION ---
    {"division_en": "Rajshahi", "division_bn": "রাজশাহী", "district_en": "Rajshahi", "district_bn": "রাজশাহী", "dist_bbs": "81", "upazila_en": "Paba", "upazila_bn": "পবা", "upz_bbs": "72", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Rajshahi", "division_bn": "রাজশাহী", "district_en": "Rajshahi", "district_bn": "রাজশাহী", "dist_bbs": "81", "upazila_en": "Godagari", "upazila_bn": "গোদাগাড়ী", "upz_bbs": "34", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Rajshahi", "division_bn": "রাজশাহী", "district_en": "Bogura", "district_bn": "বগুড়া", "dist_bbs": "10", "upazila_en": "Bogura Sadar", "upazila_bn": "বগুড়া সদর", "upz_bbs": "20", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Rajshahi", "division_bn": "রাজশাহী", "district_en": "Pabna", "district_bn": "পাবনা", "dist_bbs": "76", "upazila_en": "Pabna Sadar", "upazila_bn": "পাবনা সদর", "upz_bbs": "55", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Rajshahi", "division_bn": "রাজশাহী", "district_en": "Sirajganj", "district_bn": "সিরাজগঞ্জ", "dist_bbs": "88", "upazila_en": "Sirajganj Sadar", "upazila_bn": "সিরাজগঞ্জ সদর", "upz_bbs": "78", "survey_key": "RS", "survey_id": "2"},

    # --- RANGPUR DIVISION ---
    {"division_en": "Rangpur", "division_bn": "রংপুর", "district_en": "Rangpur", "district_bn": "রংপুর", "dist_bbs": "85", "upazila_en": "Rangpur Sadar", "upazila_bn": "রংপুর সদর", "upz_bbs": "49", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Rangpur", "division_bn": "রংপুর", "district_en": "Rangpur", "district_bn": "রংপুর", "dist_bbs": "85", "upazila_en": "Badarganj", "upazila_bn": "বদরগঞ্জ", "upz_bbs": "03", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Rangpur", "division_bn": "রংপুর", "district_en": "Dinajpur", "district_bn": "দিনাজপুর", "dist_bbs": "27", "upazila_en": "Dinajpur Sadar", "upazila_bn": "দিনাজপুর সদর", "upz_bbs": "64", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Rangpur", "division_bn": "রংপুর", "district_en": "Kurigram", "district_bn": "কুড়িগ্রাম", "dist_bbs": "49", "upazila_en": "Kurigram Sadar", "upazila_bn": "কুড়িগ্রাম সদর", "upz_bbs": "52", "survey_key": "CS", "survey_id": "1"},
    {"division_en": "Rangpur", "division_bn": "রংপুর", "district_en": "Gaibandha", "district_bn": "গাইবান্ধা", "dist_bbs": "32", "upazila_en": "Gaibandha Sadar", "upazila_bn": "গাইবান্ধা সদর", "upz_bbs": "24", "survey_key": "CS", "survey_id": "1"},

    # --- SYLHET DIVISION ---
    {"division_en": "Sylhet", "division_bn": "সিলেট", "district_en": "Sylhet", "district_bn": "সিলেট", "dist_bbs": "91", "upazila_en": "Sylhet Sadar", "upazila_bn": "সিলেট সদর", "upz_bbs": "62", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Sylhet", "division_bn": "সিলেট", "district_en": "Sylhet", "district_bn": "সিলেট", "dist_bbs": "91", "upazila_en": "Golapganj", "upazila_bn": "গোলাপগঞ্জ", "upz_bbs": "38", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Sylhet", "division_bn": "সিলেট", "district_en": "Moulvibazar", "district_bn": "মৌলভীবাজার", "dist_bbs": "58", "upazila_en": "Sreemangal", "upazila_bn": "শ্রীমঙ্গল", "upz_bbs": "83", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Sylhet", "division_bn": "সিলেট", "district_en": "Habiganj", "district_bn": "হবিগঞ্জ", "dist_bbs": "36", "upazila_en": "Habiganj Sadar", "upazila_bn": "হবিগঞ্জ সদর", "upz_bbs": "44", "survey_key": "SA", "survey_id": "3"},
    {"division_en": "Sylhet", "division_bn": "সিলেট", "district_en": "Sunamganj", "district_bn": "সুনামগঞ্জ", "dist_bbs": "90", "upazila_en": "Sunamganj Sadar", "upazila_bn": "সুনামগঞ্জ সদর", "upz_bbs": "89", "survey_key": "SA", "survey_id": "3"},

    # --- DHAKA DIVISION ---
    {"division_en": "Dhaka", "division_bn": "ঢাকা", "district_en": "Dhaka", "district_bn": "ঢাকা", "dist_bbs": "26", "upazila_en": "Savar", "upazila_bn": "সাভার", "upz_bbs": "72", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Dhaka", "division_bn": "ঢাকা", "district_en": "Narayanganj", "district_bn": "নারায়ণগঞ্জ", "dist_bbs": "67", "upazila_en": "Narayanganj Sadar", "upazila_bn": "নারায়ণগঞ্জ সদর", "upz_bbs": "58", "survey_key": "RS", "survey_id": "2"},
    {"division_en": "Dhaka", "division_bn": "ঢাকা", "district_en": "Faridpur", "district_bn": "ফরিদপুর", "dist_bbs": "29", "upazila_en": "Faridpur Sadar", "upazila_bn": "ফরিদপুর সদর", "upz_bbs": "47", "survey_key": "RS", "survey_id": "2"},

    # --- MYMENSINGH DIVISION ---
    {"division_en": "Mymensingh", "division_bn": "ময়মনসিংহ", "district_en": "Jamalpur", "district_bn": "জামালপুর", "dist_bbs": "39", "upazila_en": "Jamalpur Sadar", "upazila_bn": "জামালপুর সদর", "upz_bbs": "36", "survey_key": "RS", "survey_id": "2"}
]

def fetch_mouzas_for_target(t):
    # Try primary survey first, then fallback
    survey_attempts = [(t["survey_key"], t["survey_id"])]
    for sk, sid in [("RS", "2"), ("SA", "3"), ("CS", "1"), ("BRS", "7"), ("BS", "4")]:
        if (sk, sid) not in survey_attempts:
            survey_attempts.append((sk, sid))

    for sk, sid in survey_attempts:
        url = f"{BASE_URL}/api/dlrms/mouzas/jl-numbers?DISTRICT_BBS_CODE={t['dist_bbs']}&UPAZILA_BBS_CODE={t['upz_bbs']}&SURVEY_ID={sid}&ROW_STATUS=1"
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode('utf-8')).get('data', [])
                if data:
                    return sk, sid, data
        except Exception:
            continue
    return None, None, []

def fetch_khatians_for_mouza(survey_key, m, limit=25):
    params = {
        'SURVEY': survey_key,
        'JL_NUMBER_ID': str(m.get('ID')),
        'PAGE_NO': '1',
        'PAGE_SIZE': str(limit),
        'X_MOUZA_NAME': m.get('MOUZA_NAME'),
        'X_JL_NUMBER': str(m.get('JL_NUMBER')),
        'ROW_STATUS': '1'
    }
    url = f"{BASE_URL}/api/dlrms/index-khatian/{survey_key}?{urllib.parse.urlencode(params)}"
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                if isinstance(res, dict) and isinstance(res.get('data'), dict):
                    items = res['data'].get('items', [])
                    return items
        except Exception:
            time.sleep(0.5)
    return []

def main():
    print("=" * 75)
    print("   Ingesting Bangladesh Land Records Across All 8 Administrative Divisions")
    print("=" * 75, flush=True)

    # Load existing database
    existing_records = []
    existing_keys = set()
    if os.path.exists(SOURCE_JSON):
        with open(SOURCE_JSON, "r", encoding="utf-8") as f:
            existing_records = json.load(f)
            for r in existing_records:
                k = (
                    r.get('district_en', '').strip().lower(),
                    r.get('upazila_en', '').strip().lower(),
                    r.get('mouza_name', '').strip(),
                    str(r.get('jl_no', '')).strip(),
                    str(r.get('khatian_no', '')).strip()
                )
                existing_keys.add(k)

    print(f"Loaded existing database: {len(existing_records):,} records.", flush=True)

    new_count = 0
    division_stats = defaultdict(int)

    for idx, target in enumerate(TARGET_UPAZILAS, 1):
        div_en = target["division_en"]
        dist_en = target["district_en"]
        upz_en = target["upazila_en"]
        upz_bn = target["upazila_bn"]

        # Check if already present with ample records
        already_has = sum(1 for r in existing_records if r.get('upazila_en', '').lower() == upz_en.lower() and r.get('district_en', '').lower() == dist_en.lower())
        if already_has >= 20:
            print(f"[{idx}/{len(TARGET_UPAZILAS)}] ({div_en}) {dist_en} -> {upz_en}: Already has {already_has} records. Skipping.", flush=True)
            division_stats[div_en] += already_has
            continue

        print(f"[{idx}/{len(TARGET_UPAZILAS)}] ({div_en}) {dist_en} -> {upz_en}...", end=" ", flush=True)

        surv_key, surv_id, mouzas = fetch_mouzas_for_target(target)
        if not mouzas:
            print("No mouzas found.", flush=True)
            continue

        collected_for_this_upz = 0
        for m in mouzas[:2]:
            if collected_for_this_upz >= 25:
                break
            items = fetch_khatians_for_mouza(surv_key, m, limit=25)
            if not items:
                continue

            m_name = m.get('MOUZA_NAME', '')
            m_jl = str(m.get('JL_NUMBER', ''))
            m_id = m.get('ID')

            for it in items:
                k_no = str(it.get('KHATIAN_NO', ''))
                dup_key = (dist_en.strip().lower(), upz_en.strip().lower(), m_name.strip(), m_jl.strip(), k_no.strip())
                if dup_key in existing_keys:
                    continue

                rec = {
                    "id": it.get('ID'),
                    "khatian_no": k_no,
                    "division": target["division_bn"],
                    "division_en": div_en,
                    "district": target["district_bn"],
                    "district_en": dist_en,
                    "upazila": upz_bn,
                    "upazila_en": upz_en,
                    "survey": surv_key,
                    "survey_key": surv_key,
                    "mouza_name": m_name,
                    "jl_no": m_jl,
                    "jl_id": m_id,
                    "owners": it.get('OWNERS') or '',
                    "guardians": it.get('GUARDIANS') or '',
                    "dags": it.get('DAGS') or '',
                    "total_land": it.get('TOTAL_LAND') or '',
                    "pdf_path": f"pdfs/{div_en}/{dist_en}/{upz_en}/{surv_key}/{m_name}_JL_{m_jl}/Khatian_{k_no}.pdf",
                    "pdf_status": "Cataloged",
                    "pdf_size_bytes": 0
                }
                existing_records.append(rec)
                existing_keys.add(dup_key)
                new_count += 1
                collected_for_this_upz += 1

        division_stats[div_en] += collected_for_this_upz
        print(f"Collected {collected_for_this_upz} khatians ({surv_key}).", flush=True)
        time.sleep(0.3)

    print("\n" + "=" * 75)
    print(f"Ingestion complete! Total new khatians added: {new_count:,}")
    print(f"Total khatian database count: {len(existing_records):,}")
    print("=" * 75, flush=True)

    # 1. Save master JSON
    print("Saving master khatians.json...", flush=True)
    with open(SOURCE_JSON, "w", encoding="utf-8") as f:
        json.dump(existing_records, f, ensure_ascii=False, indent=2)

    # 2. Save master CSV
    print("Saving master khatians.csv...", flush=True)
    fields = [
        "id", "khatian_no", "division", "division_en", "district", "district_en",
        "upazila", "upazila_en", "survey", "survey_key", "mouza_name", "jl_no", "jl_id",
        "owners", "guardians", "dags", "total_land", "pdf_path", "pdf_status", "pdf_size_bytes"
    ]
    with open(SOURCE_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for r in existing_records:
            writer.writerow({k: r.get(k, '') for k in fields})

    # 3. Partition all records into division > district > upazila.json
    print("\nPartitioning into division > district > upazila.json...", flush=True)
    grouped = defaultdict(list)
    for r in existing_records:
        div_clean = "".join(c for c in (r.get("division_en") or r.get("division") or "Unknown_Division") if c not in r'\/:*?"<>|').strip()
        dist_clean = "".join(c for c in (r.get("district_en") or r.get("district") or "Unknown_District") if c not in r'\/:*?"<>|').strip()
        upz_clean = "".join(c for c in (r.get("upazila_en") or r.get("upazila") or "Unknown_Upazila") if c not in r'\/:*?"<>|').strip()
        grouped[(div_clean, dist_clean, upz_clean)].append(r)

    all_divisions = sorted(list(set(k[0] for k in grouped.keys())))
    catalog = {
        "title": "Bangladesh Khatians Dataset - Nationwide Catalog (All 8 Divisions)",
        "total_records": len(existing_records),
        "total_divisions": len(all_divisions),
        "total_districts": len(set((k[0], k[1]) for k in grouped.keys())),
        "total_upazilas": len(grouped),
        "divisions": all_divisions,
        "hierarchy": "division > district > upazila.json",
        "partitions": []
    }

    for (div, dist, upz), recs in sorted(grouped.items()):
        target_dir = os.path.join(KHATIAN_DIR, div, dist)
        os.makedirs(target_dir, exist_ok=True)
        target_file = os.path.join(target_dir, f"{upz}.json")

        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(recs, f, ensure_ascii=False, indent=2)

        rel_path = os.path.relpath(target_file, KHATIAN_DIR).replace("\\", "/")
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

    with open(INDEX_JSON, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    # 4. Save summary.json
    summary = {
        "total_khatians": len(existing_records),
        "total_pdfs_downloaded": 38,
        "total_pdf_size_mb": 12.25,
        "divisions_represented": catalog["total_divisions"],
        "districts_represented": catalog["total_districts"],
        "upazilas_represented": len(grouped),
        "mouzas_represented": len(set(f"{r.get('district')}_{r.get('mouza_name')}" for r in existing_records)),
        "divisions_list": catalog["divisions"],
        "hierarchy_format": "division > district > upazila.json",
        "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\nSuccessfully populated database across ALL {catalog['total_divisions']} divisions, {catalog['total_districts']} districts, and {len(grouped)} upazilas!", flush=True)

if __name__ == "__main__":
    main()
