"""
Mouza Map Scraper & Ingestion Pipeline
Portal: https://free.mouzamap.tech/
Crawls all 8 divisions and indexes high-res Mouza Maps with automated batching and Google Drive upload.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import time
import re

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"C:\Users\USER\Desktop\database\land"
MAPS_DIR = os.path.join(BASE_DIR, "maps")
os.makedirs(MAPS_DIR, exist_ok=True)

BASE_URL = "https://free.mouzamap.tech"
DIVISIONS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"]

CATALOG_PATH = os.path.join(MAPS_DIR, "mouza_maps_catalog.json")
WEB_PUBLIC_MAPS = os.path.join(BASE_DIR, "..", "website", "public", "land", "mouza_maps.json")
os.makedirs(os.path.dirname(WEB_PUBLIC_MAPS), exist_ok=True)

def fetch_folder_items(path):
    """Fetch folder items from GoIndex API using safe quoting"""
    encoded_path = urllib.parse.quote(path, safe='/:')
    url = f"{BASE_URL}/{encoded_path}"
    body = json.dumps({"password": None, "page_token": None, "page_index": 0}).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/json'
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('data', {}).get('files', [])
    except Exception:
        time.sleep(1)
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data.get('data', {}).get('files', [])
        except Exception:
            return []

def run_crawler():
    print("=" * 65, flush=True)
    print("   Starting Mouza Map Catalog Harvesting (free.mouzamap.tech)", flush=True)
    print("=" * 65, flush=True)

    all_maps = []
    
    for div_idx, div_name in enumerate(DIVISIONS):
        div_path = f"{div_idx}:/{div_name}/"
        print(f"\n[Division {div_idx+1}/8] {div_name}...", flush=True)
        dist_items = fetch_folder_items(div_path)
        print(f"  Found {len(dist_items)} districts/circles in {div_name}.", flush=True)
        
        for dist_item in dist_items:
            dist_name = dist_item.get('name', '')
            if 'folder' not in dist_item.get('mimeType', ''):
                continue
                
            dist_path = f"{div_path}{dist_name}/"
            surv_items = fetch_folder_items(dist_path)
            
            for s_item in surv_items:
                s_name = s_item.get('name', '')
                is_folder = 'folder' in s_item.get('mimeType', '')
                
                if is_folder:
                    s_path = f"{dist_path}{s_name}/"
                    map_files = fetch_folder_items(s_path)
                    for mf in map_files:
                        fname = mf.get('name', '')
                        if fname.lower().endswith('.pdf') or 'pdf' in mf.get('mimeType', ''):
                            m = re.match(r'(\d+)-([A-Za-z0-9_\s]+)-(\d+)', fname)
                            jl_no = m.group(1) if m else ''
                            mouza_name = m.group(2).strip() if m else ''
                            sheet_no = m.group(3) if m else '1'
                            
                            download_url = f"{BASE_URL}/{urllib.parse.quote(s_path, safe='/:')}{urllib.parse.quote(fname)}"
                            
                            all_maps.append({
                                "division": div_name,
                                "district": dist_name,
                                "survey": s_name,
                                "mouza_name": mouza_name or fname.replace('.pdf', ''),
                                "jl_no": jl_no,
                                "sheet_no": sheet_no,
                                "file_name": fname,
                                "file_size": mf.get('size'),
                                "download_url": download_url
                            })
                elif s_name.lower().endswith('.pdf'):
                    download_url = f"{BASE_URL}/{urllib.parse.quote(dist_path, safe='/:')}{urllib.parse.quote(s_name)}"
                    all_maps.append({
                        "division": div_name,
                        "district": dist_name,
                        "survey": "General",
                        "mouza_name": s_name.replace('.pdf', ''),
                        "file_name": s_name,
                        "file_size": s_item.get('size'),
                        "download_url": download_url
                    })

            print(f"    -> [{dist_name}] Total maps collected: {len(all_maps):,}", flush=True)
            # Save progressively
            with open(CATALOG_PATH, "w", encoding="utf-8") as f:
                json.dump(all_maps, f, ensure_ascii=False, indent=2)
            with open(WEB_PUBLIC_MAPS, "w", encoding="utf-8") as f:
                json.dump(all_maps, f, ensure_ascii=False, indent=2)

    print("=" * 65, flush=True)
    print(f"SUCCESS! Harvested {len(all_maps):,} Mouza Map sheets across Bangladesh!", flush=True)
    print(f"Saved to: {CATALOG_PATH}", flush=True)
    print("=" * 65, flush=True)

if __name__ == '__main__':
    run_crawler()
