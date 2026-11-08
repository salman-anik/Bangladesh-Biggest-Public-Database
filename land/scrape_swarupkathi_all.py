"""
Full Swarupkathi (Nesarabad) Khatian Scraper
Collects all available land records across all mouzas for Swarupkathi, Pirojpur, Barishal.
Saves to land/khatians/Barishal/Pirojpur/Swarupkathi.json and updates master datasets.
"""

import os
import sys
import json
import time
import csv
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://eporcha.tech"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8'
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KHATIAN_DIR = os.path.join(BASE_DIR, "khatians")
SOURCE_JSON = os.path.join(KHATIAN_DIR, "khatians.json")
SOURCE_CSV = os.path.join(KHATIAN_DIR, "khatians.csv")
INDEX_JSON = os.path.join(KHATIAN_DIR, "index.json")
SUMMARY_JSON = os.path.join(BASE_DIR, "summary.json")

SWARUPKATHI_DIR = os.path.join(KHATIAN_DIR, "Barishal", "Pirojpur")
SWARUPKATHI_FILE = os.path.join(SWARUPKATHI_DIR, "Swarupkathi.json")
SWARUPKATHI_ALIAS = os.path.join(SWARUPKATHI_DIR, "Nesarabad (Swarupkathi).json")

DIST_BBS = "79"  # Pirojpur
UPZ_BBS = "87"   # Nesarabad (Swarupkathi)

def api_get(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except Exception:
            time.sleep(0.5 + attempt * 0.5)
    return None

def fetch_mouza_khatians(m, survey_key="RS"):
    m_id = str(m.get('ID'))
    m_name = m.get('MOUZA_NAME', '')
    m_jl = str(m.get('JL_NUMBER', ''))

    params_first = {
        'SURVEY': survey_key,
        'JL_NUMBER_ID': m_id,
        'PAGE_NO': '1',
        'PAGE_SIZE': '100',
        'X_MOUZA_NAME': m_name,
        'X_JL_NUMBER': m_jl,
        'ROW_STATUS': '1'
    }
    url = f"{BASE_URL}/api/dlrms/index-khatian/{survey_key}?{urllib.parse.urlencode(params_first)}"
    res = api_get(url)
    if not res or not isinstance(res.get('data'), dict):
        return []

    data = res['data']
    items = data.get('items', [])
    meta = data.get('meta', {})
    total_pages = meta.get('totalPages', 1)
    total_items = meta.get('totalItems', len(items))

    print(f"  [Mouza JL {m_jl}: {m_name}] {total_items} khatians across {total_pages} page(s)...", flush=True)

    for p in range(2, total_pages + 1):
        params_p = {
            'SURVEY': survey_key,
            'JL_NUMBER_ID': m_id,
            'PAGE_NO': str(p),
            'PAGE_SIZE': '100',
            'X_MOUZA_NAME': m_name,
            'X_JL_NUMBER': m_jl,
            'ROW_STATUS': '1'
        }
        url_p = f"{BASE_URL}/api/dlrms/index-khatian/{survey_key}?{urllib.parse.urlencode(params_p)}"
        res_p = api_get(url_p)
        if res_p and isinstance(res_p.get('data'), dict):
            items.extend(res_p['data'].get('items', []))
        time.sleep(0.15)

    return items

def main():
    print("=" * 75)
    print("   Starting Full Swarupkathi (Nesarabad) Khatian Harvesting Engine")
    print("=" * 75, flush=True)

    # 1. Fetch all RS mouzas for Swarupkathi
    url_mouzas_rs = f"{BASE_URL}/api/dlrms/mouzas/jl-numbers?DISTRICT_BBS_CODE={DIST_BBS}&UPAZILA_BBS_CODE={UPZ_BBS}&SURVEY_ID=2&ROW_STATUS=1"
    res_mouzas = api_get(url_mouzas_rs)
    mouzas_rs = res_mouzas.get('data', []) if res_mouzas else []
    print(f"Discovered {len(mouzas_rs)} official RS mouzas in Swarupkathi.", flush=True)

    # Load existing Swarupkathi records if any
    records = []
    seen_khatians = set()
    if os.path.exists(SWARUPKATHI_FILE):
        try:
            with open(SWARUPKATHI_FILE, "r", encoding="utf-8") as f:
                records = json.load(f)
                for r in records:
                    seen_khatians.add((r.get('mouza_name'), str(r.get('jl_no')), str(r.get('khatian_no'))))
            print(f"Loaded {len(records)} existing Swarupkathi records.")
        except Exception:
            records = []

    total_mouzas = len(mouzas_rs)
    for idx, m in enumerate(mouzas_rs, 1):
        m_name = m.get('MOUZA_NAME', '')
        m_jl = str(m.get('JL_NUMBER', ''))
        m_id = m.get('ID')

        print(f"[{idx}/{total_mouzas}] Harvesting JL {m_jl} {m_name}...", end=" ", flush=True)
        raw_items = fetch_mouza_khatians(m, survey_key="RS")

        added_in_mouza = 0
        for it in raw_items:
            k_no = str(it.get('KHATIAN_NO', ''))
            key = (m_name, m_jl, k_no)
            if key in seen_khatians:
                continue

            rec = {
                "id": it.get('ID'),
                "khatian_no": k_no,
                "division": "বরিশাল",
                "division_en": "Barishal",
                "district": "পিরোজপুর",
                "district_en": "Pirojpur",
                "upazila": "নেছারাবাদ (স্বরূপকাঠি)",
                "upazila_en": "Swarupkathi",
                "survey": "আর এস",
                "survey_key": "RS",
                "mouza_name": m_name,
                "jl_no": m_jl,
                "jl_id": m_id,
                "owners": it.get('OWNERS') or '',
                "guardians": it.get('GUARDIANS') or '',
                "dags": it.get('DAGS') or '',
                "total_land": it.get('TOTAL_LAND') or '',
                "pdf_path": f"pdfs/Barishal/Pirojpur/Swarupkathi/RS/{m_name}_JL_{m_jl}/Khatian_{k_no}.pdf",
                "pdf_status": "Cataloged",
                "pdf_size_bytes": 0
            }
            records.append(rec)
            seen_khatians.add(key)
            added_in_mouza += 1

        print(f"Done (+{added_in_mouza} new). Total now: {len(records):,}", flush=True)

        # Periodic checkpoint save every 5 mouzas
        if idx % 5 == 0 or idx == total_mouzas:
            os.makedirs(SWARUPKATHI_DIR, exist_ok=True)
            with open(SWARUPKATHI_FILE, "w", encoding="utf-8") as f:
                json.dump(records, f, ensure_ascii=False, indent=2)
            with open(SWARUPKATHI_ALIAS, "w", encoding="utf-8") as f:
                json.dump(records, f, ensure_ascii=False, indent=2)
            print(f"--> Checkpoint saved ({len(records):,} records).", flush=True)

    print("\n" + "=" * 75)
    print(f"SUCCESS: Collected {len(records):,} total khatians for Swarupkathi across {total_mouzas} mouzas!")
    print("=" * 75, flush=True)

    # Now integrate into master khatians.json & khatians.csv
    print("Integrating into master database...", flush=True)
    master_records = []
    master_keys = set()
    if os.path.exists(SOURCE_JSON):
        with open(SOURCE_JSON, "r", encoding="utf-8") as f:
            master_records = json.load(f)
            for r in master_records:
                master_keys.add((r.get('district_en', '').lower(), r.get('upazila_en', '').lower(), r.get('mouza_name'), str(r.get('jl_no')), str(r.get('khatian_no'))))

    new_master_count = 0
    for r in records:
        key = (r['district_en'].lower(), r['upazila_en'].lower(), r['mouza_name'], str(r['jl_no']), str(r['khatian_no']))
        if key not in master_keys:
            master_records.append(r)
            master_keys.add(key)
            new_master_count += 1

    print(f"Added {new_master_count:,} new records to master catalog. Total: {len(master_records):,}", flush=True)
    with open(SOURCE_JSON, "w", encoding="utf-8") as f:
        json.dump(master_records, f, ensure_ascii=False, indent=2)

    # Save CSV
    fields = [
        "id", "khatian_no", "division", "division_en", "district", "district_en",
        "upazila", "upazila_en", "survey", "survey_key", "mouza_name", "jl_no", "jl_id",
        "owners", "guardians", "dags", "total_land", "pdf_path", "pdf_status", "pdf_size_bytes"
    ]
    with open(SOURCE_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for r in master_records:
            writer.writerow({k: r.get(k, '') for k in fields})

    # Update index.json
    if os.path.exists(INDEX_JSON):
        with open(INDEX_JSON, "r", encoding="utf-8") as f:
            catalog = json.load(f)
        catalog["total_records"] = len(master_records)
        # Check if Swarupkathi entry exists in partitions
        found = False
        for p in catalog.get("partitions", []):
            if p.get("upazila_en") == "Swarupkathi":
                p["record_count"] = len(records)
                found = True
                break
        if not found:
            catalog["partitions"].append({
                "division_en": "Barishal",
                "division_bn": "বরিশাল",
                "district_en": "Pirojpur",
                "district_bn": "পিরোজপুর",
                "upazila_en": "Swarupkathi",
                "upazila_bn": "নেছারাবাদ (স্বরূপকাঠি)",
                "record_count": len(records),
                "file_path": "Barishal/Pirojpur/Swarupkathi.json"
            })
            catalog["total_upazilas"] = len(catalog["partitions"])

        with open(INDEX_JSON, "w", encoding="utf-8") as f:
            json.dump(catalog, f, ensure_ascii=False, indent=2)

    # Update summary.json
    if os.path.exists(SUMMARY_JSON):
        with open(SUMMARY_JSON, "r", encoding="utf-8") as f:
            summary = json.load(f)
        summary["total_khatians"] = len(master_records)
        summary["upazilas_represented"] = catalog["total_upazilas"]
        summary["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S")
        with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)

    print("All datasets, indexes, and summary successfully refreshed!", flush=True)

if __name__ == "__main__":
    main()
