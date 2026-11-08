"""
Resilient Dual-Mode PDF Recovery & Ingestion Engine
Fixes all "502 Bad Gateway" errors by automatically falling back to official HTML form
and compiling authentic PDFs locally via Windows headless Edge (msedge.exe).
"""

import os
import sys
import json
import time
import subprocess
import csv
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KHATIAN_JSON = os.path.join(BASE_DIR, "khatians", "khatians.json")
KHATIAN_CSV = os.path.join(BASE_DIR, "khatians", "khatians.csv")
SUMMARY_JSON = os.path.join(BASE_DIR, "summary.json")
EDGE_EXE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Content-Type': 'application/json'
}
TEMP_DIR = os.path.join(BASE_DIR, "temp_html")
os.makedirs(TEMP_DIR, exist_ok=True)

def download_or_render_pdf(item):
    k_no = str(item.get('khatian_no', ''))
    rel_path = item.get('pdf_path', '')
    if not rel_path:
        return item, False

    out_pdf = os.path.join(BASE_DIR, rel_path)
    if os.path.exists(out_pdf) and os.path.getsize(out_pdf) > 2000:
        item['pdf_status'] = "Downloaded"
        item['pdf_size_bytes'] = os.path.getsize(out_pdf)
        return item, True

    payload = {
        "division": item.get('division', ''),
        "survey": item.get('survey_key', item.get('survey', '')),
        "district": item.get('district', ''),
        "upazila": item.get('upazila', ''),
        "mouza": item.get('mouza_name', ''),
        "jlNo": str(item.get('jl_no', '')),
        "jlNumberId": item.get('jl_id'),
        "khatianNo": k_no,
        "owners": item.get('owners', ''),
        "guardians": item.get('guardians', ''),
        "dags": item.get('dags', ''),
        "totalLand": item.get('total_land', '')
    }

    # 1. Attempt server-side direct PDF (fast)
    try:
        req = urllib.request.Request("https://eporcha.tech/api/namjari-khatian/pdf", data=json.dumps(payload).encode('utf-8'), headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            if 'application/pdf' in resp.headers.get('Content-Type', ''):
                data = resp.read()
                os.makedirs(os.path.dirname(out_pdf), exist_ok=True)
                with open(out_pdf, 'wb') as f:
                    f.write(data)
                item['pdf_status'] = "Downloaded"
                item['pdf_size_bytes'] = len(data)
                return item, True
    except Exception:
        pass  # Server returned 502 Bad Gateway -> Fallback to client Edge render

    # 2. Resilient Fallback: Fetch official HTML template & render locally
    temp_html = os.path.join(TEMP_DIR, f"temp_{os.getpid()}_{item.get('id', 'x')}_{k_no}.html")
    try:
        req = urllib.request.Request("https://eporcha.tech/api/namjari-khatian/form", data=json.dumps(payload).encode('utf-8'), headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            html = resp.read().decode('utf-8')

        with open(temp_html, 'w', encoding='utf-8') as f:
            f.write(html)

        os.makedirs(os.path.dirname(out_pdf), exist_ok=True)
        cmd = [EDGE_EXE, "--headless", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={out_pdf}", temp_html]
        subprocess.run(cmd, capture_output=True, timeout=25)

        if os.path.exists(out_pdf) and os.path.getsize(out_pdf) > 2000:
            item['pdf_status'] = "Downloaded"
            item['pdf_size_bytes'] = os.path.getsize(out_pdf)
            return item, True
    except Exception as e:
        item['pdf_status'] = "Failed"
    finally:
        if os.path.exists(temp_html):
            try:
                os.remove(temp_html)
            except Exception:
                pass

    return item, False

def repair_all(max_workers=4):
    print("=" * 70)
    print("   Starting Dual-Mode PDF Recovery (502 Bad Gateway Auto-Fix)")
    print("=" * 70)

    if not os.path.exists(KHATIAN_JSON):
        print("No khatians.json found.")
        return

    with open(KHATIAN_JSON, "r", encoding="utf-8") as f:
        records = json.load(f)

    # Find items that need repair
    missing = []
    for r in records:
        pdf_file = os.path.join(BASE_DIR, r.get('pdf_path', ''))
        if r.get('pdf_status') != "Downloaded" or not os.path.exists(pdf_file) or os.path.getsize(pdf_file) < 2000:
            missing.append(r)

    print(f"Total catalog records: {len(records):,}")
    print(f"Found {len(missing):,} PDFs needing download/repair.")
    if not missing:
        print("All PDFs are already downloaded and verified!")
        return

    recovered = 0
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_rec = {executor.submit(download_or_render_pdf, item): item for item in missing}

        for idx, future in enumerate(as_completed(future_to_rec), 1):
            item, success = future.result()
            if success:
                recovered += 1

            if idx % 25 == 0 or idx == len(missing):
                elapsed = time.time() - start_time
                rate = recovered / max(elapsed, 1)
                print(f"   [{idx}/{len(missing)}] Recovered {recovered} PDFs ({rate:.1f} PDFs/sec)...")

                # Incremental flush to disk every 100 items
                if idx % 100 == 0 or idx == len(missing):
                    with open(KHATIAN_JSON, "w", encoding="utf-8") as f:
                        json.dump(records, f, ensure_ascii=False, indent=2)

    # Final summary update
    with open(KHATIAN_JSON, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    # Update CSV
    fields = [
        "id", "khatian_no", "division", "division_en", "district", "district_en",
        "upazila", "upazila_en", "survey", "survey_key", "mouza_name", "jl_no", "jl_id",
        "owners", "guardians", "dags", "total_land", "pdf_path", "pdf_status", "pdf_size_bytes"
    ]
    with open(KHATIAN_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in records:
            writer.writerow({k: row.get(k, '') for k in fields})

    total_downloaded = sum(1 for r in records if r.get('pdf_status') == "Downloaded")
    total_bytes = sum(r.get('pdf_size_bytes', 0) for r in records)

    summary = {
        "total_khatians": len(records),
        "total_pdfs_downloaded": total_downloaded,
        "total_pdf_size_mb": round(total_bytes / (1024 * 1024), 2),
        "divisions_represented": len(set(r.get('division') for r in records if r.get('division'))),
        "districts_represented": len(set(r.get('district') for r in records if r.get('district'))),
        "upazilas_represented": len(set(r.get('upazila') for r in records if r.get('upazila'))),
        "mouzas_represented": len(set(f"{r.get('district')}_{r.get('mouza_name')}" for r in records)),
        "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("\nRecovery Complete!")
    print(f"Total PDFs now successfully arranged: {total_downloaded:,} ({summary['total_pdf_size_mb']} MB)")

if __name__ == '__main__':
    repair_all(max_workers=4)
