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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8'
}

def api_get(endpoint, params=None):
    url = f"{BASE_URL}{endpoint}"
    if params:
        url += f"?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data.get('data', [])

def api_post_json(endpoint, payload):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={**HEADERS, 'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode('utf-8'))

def download_pdf(payload, output_path):
    url = f"{BASE_URL}/api/namjari-khatian/pdf"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={**HEADERS, 'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        content_type = resp.headers.get('Content-Type', '')
        if 'application/pdf' in content_type:
            data = resp.read()
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(data)
            return len(data)
    return 0

def fetch_all_metadata(target_dir):
    meta_dir = os.path.join(target_dir, "metadata")
    os.makedirs(meta_dir, exist_ok=True)

    print("--> Fetching Divisions...")
    divisions = api_get("/api/dlrms/divisions", {"ROW_STATUS": "1"})
    with open(os.path.join(meta_dir, "divisions.json"), "w", encoding="utf-8") as f:
        json.dump(divisions, f, ensure_ascii=False, indent=2)

    print(f"--> Saved {len(divisions)} divisions.")

    print("--> Fetching Districts...")
    districts = api_get("/api/dlrms/districts", {"ROW_STATUS": "1"})
    with open(os.path.join(meta_dir, "districts.json"), "w", encoding="utf-8") as f:
        json.dump(districts, f, ensure_ascii=False, indent=2)
    print(f"--> Saved {len(districts)} districts.")

    print("--> Fetching Upazilas...")
    upazilas = api_get("/api/dlrms/upazilas", {"ROW_STATUS": "1"})
    with open(os.path.join(meta_dir, "upazilas.json"), "w", encoding="utf-8") as f:
        json.dump(upazilas, f, ensure_ascii=False, indent=2)
    print(f"--> Saved {len(upazilas)} upazilas.")

    print("--> Fetching Surveys...")
    surveys = api_get("/api/dlrms/surveys", {"ROW_STATUS": "1"})
    with open(os.path.join(meta_dir, "surveys.json"), "w", encoding="utf-8") as f:
        json.dump(surveys, f, ensure_ascii=False, indent=2)
    print(f"--> Saved {len(surveys)} surveys.")

    return divisions, districts, upazilas, surveys

if __name__ == '__main__':
    target = os.path.abspath(".")
    print(f"Target directory: {target}")
    fetch_all_metadata(target)
