"""
ePorcha Land Records & Khatian Scraper, PDF Downloader, and Database Manager
Portal: https://eporcha.tech/
"""

import os
import sys
import json
import time
import csv
import re
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://eporcha.tech"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8'
}

class EPorchaScraper:
    def __init__(self, base_dir="."):
        self.base_dir = os.path.abspath(base_dir)
        self.meta_dir = os.path.join(self.base_dir, "metadata")
        self.khatian_dir = os.path.join(self.base_dir, "khatians")
        self.pdf_dir = os.path.join(self.base_dir, "pdfs")
        
        os.makedirs(self.meta_dir, exist_ok=True)
        os.makedirs(self.khatian_dir, exist_ok=True)
        os.makedirs(self.pdf_dir, exist_ok=True)

        self.divisions = []
        self.districts = []
        self.upazilas = []
        self.surveys = []
        self.load_metadata()

    def _get(self, endpoint, params=None, max_retries=3):
        url = f"{BASE_URL}{endpoint}"
        if params:
            url += f"?{urllib.parse.urlencode(params)}"
        
        for attempt in range(max_retries):
            try:
                req = urllib.request.Request(url, headers=HEADERS)
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    if isinstance(data, dict):
                        return data.get('data', [])
                    return data
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"Error GET {url}: {e}")
                    return []
                time.sleep(1 + attempt)
        return []

    def _post(self, endpoint, payload, max_retries=3):
        url = f"{BASE_URL}{endpoint}"
        for attempt in range(max_retries):
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={**HEADERS, 'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    return json.loads(resp.read().decode('utf-8'))
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"Error POST {url}: {e}")
                    return None
                time.sleep(1 + attempt)
        return None

    def load_metadata(self):
        div_file = os.path.join(self.meta_dir, "divisions.json")
        dist_file = os.path.join(self.meta_dir, "districts.json")
        upa_file = os.path.join(self.meta_dir, "upazilas.json")
        surv_file = os.path.join(self.meta_dir, "surveys.json")

        if os.path.exists(div_file):
            with open(div_file, "r", encoding="utf-8") as f:
                self.divisions = json.load(f)
        if os.path.exists(dist_file):
            with open(dist_file, "r", encoding="utf-8") as f:
                self.districts = json.load(f)
        if os.path.exists(upa_file):
            with open(upa_file, "r", encoding="utf-8") as f:
                self.upazilas = json.load(f)
        if os.path.exists(surv_file):
            with open(surv_file, "r", encoding="utf-8") as f:
                self.surveys = json.load(f)

    def fetch_mouzas(self, district_bbs, upazila_bbs, district_en, upazila_en, survey_key, survey_id=None):
        params = {
            'DISTRICT_BBS_CODE': district_bbs,
            'UPAZILA_BBS_CODE': upazila_bbs,
            'X_DISTRICT_EN': district_en,
            'X_UPAZILA_EN': upazila_en,
            'X_SURVEY_KEY': survey_key,
            'ROW_STATUS': '1'
        }
        if survey_id:
            params['SURVEY_ID'] = str(survey_id)
        if survey_key.upper() == "MUTATION":
            params['SURVEY'] = "MUTATION"

        res = self._get("/api/dlrms/mouzas/jl-numbers", params)
        return res if isinstance(res, list) else []

    def fetch_khatians_index(self, survey_key, jl_number_id, mouza_name, jl_number, page=1, page_size=100):
        params = {
            'SURVEY': survey_key,
            'JL_NUMBER_ID': str(jl_number_id),
            'PAGE_NO': str(page),
            'PAGE_SIZE': str(page_size),
            'X_MOUZA_NAME': mouza_name,
            'X_JL_NUMBER': str(jl_number),
            'ROW_STATUS': '1'
        }
        url = f"/api/dlrms/index-khatian/{survey_key}"
        res = self._get(url, params)
        if isinstance(res, dict):
            return res
        return {'items': [], 'meta': {}}

    def fetch_all_khatians_for_mouza(self, survey_key, jl_number_id, mouza_name, jl_number, max_khatians=None):
        first_page = self.fetch_khatians_index(survey_key, jl_number_id, mouza_name, jl_number, page=1, page_size=50)
        items = first_page.get('items', [])
        meta = first_page.get('meta', {})
        total_pages = meta.get('totalPages', 1)
        total_items = meta.get('totalItems', len(items))

        print(f"   [Mouza: {mouza_name} (JL {jl_number})] Found {total_items} khatians across {total_pages} pages.")

        for p in range(2, total_pages + 1):
            if max_khatians and len(items) >= max_khatians:
                break
            time.sleep(0.3)
            page_data = self.fetch_khatians_index(survey_key, jl_number_id, mouza_name, jl_number, page=p, page_size=50)
            p_items = page_data.get('items', [])
            items.extend(p_items)

        if max_khatians:
            items = items[:max_khatians]
        return items

    def fetch_khatian_record_detail(self, survey_key, division_name, district_name, upazila_name, mouza_name, jl_number, jl_number_id, khatian_no, owner_hint=""):
        payload = {
            "survey": survey_key,
            "divisionName": division_name,
            "districtName": district_name,
            "upazilaName": upazila_name,
            "mouzaName": mouza_name,
            "jlNo": str(jl_number),
            "jlNumberId": jl_number_id,
            "khatianNo": str(khatian_no),
            "ownerHint": owner_hint
        }
        res = self._post("/api/khatian-record", payload)
        if res and res.get("success"):
            return res
        return None

    def download_khatian_pdf(self, division_name, survey_name_or_key, district_name, upazila_name, mouza_name, jl_number, jl_number_id, khatian_no, owners="", guardians="", dags="", total_land="", save_path=None):
        payload = {
            "division": division_name,
            "survey": survey_name_or_key,
            "district": district_name,
            "upazila": upazila_name,
            "mouza": mouza_name,
            "jlNo": str(jl_number),
            "jlNumberId": jl_number_id,
            "khatianNo": str(khatian_no),
            "owners": owners,
            "guardians": guardians,
            "dags": dags,
            "totalLand": total_land
        }

        url = f"{BASE_URL}/api/namjari-khatian/pdf"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={**HEADERS, 'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                content_type = resp.headers.get('Content-Type', '')
                if 'application/pdf' in content_type:
                    data = resp.read()
                    if save_path:
                        os.makedirs(os.path.dirname(save_path), exist_ok=True)
                        with open(save_path, 'wb') as f:
                            f.write(data)
                    return data
        except Exception as e:
            print(f"      [!] PDF download error for Khatian {khatian_no}: {e}")
        return None

    def clean_name(self, name):
        if not name:
            return "Unknown"
        return re.sub(r'[\\/*?:"<>|]', '', str(name)).strip()

    def process_and_save_khatians(self, division, district, upazila, survey, mouza, khatians_raw, download_pdfs=True):
        records = []
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

        dist_folder = self.clean_name(f"{dist_en}_{dist_name}" if dist_en != dist_name else dist_name)
        upa_folder = self.clean_name(f"{upa_en}_{upa_name}" if upa_en != upa_name else upa_name)
        surv_folder = self.clean_name(surv_key)
        mouza_folder = self.clean_name(f"{mouza_name}_JL_{jl_no}")
        
        target_pdf_dir = os.path.join(self.pdf_dir, dist_folder, upa_folder, surv_folder, mouza_folder)
        os.makedirs(target_pdf_dir, exist_ok=True)

        print(f"\n--> Processing {len(khatians_raw)} khatians for {mouza_name} (JL {jl_no})...")

        for idx, k in enumerate(khatians_raw, 1):
            khatian_no = k.get('KHATIAN_NO', '')
            khatian_id = k.get('ID', '')
            owners = k.get('OWNERS') or ''
            guardians = k.get('GUARDIANS') or ''
            dags = k.get('DAGS') or ''
            total_land = k.get('TOTAL_LAND') or ''

            if not owners or not dags:
                detail = self.fetch_khatian_record_detail(
                    survey_key=surv_key,
                    division_name=div_name,
                    district_name=dist_name,
                    upazila_name=upa_name,
                    mouza_name=mouza_name,
                    jl_number=jl_no,
                    jl_number_id=jl_id,
                    khatian_no=khatian_no,
                    owner_hint=owners
                )
                if detail:
                    owners = detail.get('owners', owners)
                    guardians = detail.get('guardians', guardians)
                    dags = detail.get('dags', dags)
                    total_land = detail.get('totalLand', total_land)

            pdf_filename = f"Khatian_{self.clean_name(str(khatian_no))}.pdf"
            pdf_path = os.path.join(target_pdf_dir, pdf_filename)
            rel_pdf_path = os.path.relpath(pdf_path, self.base_dir).replace('\\', '/')

            pdf_status = "Skipped"
            pdf_size = 0
            if download_pdfs:
                if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
                    pdf_status = "Downloaded"
                    pdf_size = os.path.getsize(pdf_path)
                else:
                    print(f"   [{idx}/{len(khatians_raw)}] Generating & Downloading PDF: Khatian No. {khatian_no}...")
                    pdf_data = self.download_khatian_pdf(
                        division_name=div_name,
                        survey_name_or_key=surv_name,
                        district_name=dist_name,
                        upazila_name=upa_name,
                        mouza_name=mouza_name,
                        jl_number=jl_no,
                        jl_number_id=jl_id,
                        khatian_no=khatian_no,
                        owners=owners,
                        guardians=guardians,
                        dags=dags,
                        total_land=total_land,
                        save_path=pdf_path
                    )
                    if pdf_data:
                        pdf_status = "Downloaded"
                        pdf_size = len(pdf_data)
                    else:
                        pdf_status = "Failed"
                    time.sleep(0.3)

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
                "pdf_path": rel_pdf_path,
                "pdf_status": pdf_status,
                "pdf_size_bytes": pdf_size
            }
            records.append(record)

        self.append_to_database(records)
        return records

    def append_to_database(self, records):
        json_file = os.path.join(self.khatian_dir, "khatians.json")
        csv_file = os.path.join(self.khatian_dir, "khatians.csv")

        existing_data = []
        existing_keys = set()
        if os.path.exists(json_file):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
                    for item in existing_data:
                        key = (item.get('district'), item.get('upazila'), item.get('mouza_name'), item.get('jl_no'), item.get('survey_key'), str(item.get('khatian_no')))
                        existing_keys.add(key)
            except Exception:
                existing_data = []

        new_count = 0
        for r in records:
            key = (r.get('district'), r.get('upazila'), r.get('mouza_name'), r.get('jl_no'), r.get('survey_key'), str(r.get('khatian_no')))
            if key not in existing_keys:
                existing_data.append(r)
                existing_keys.add(key)
                new_count += 1
            else:
                for idx, ex in enumerate(existing_data):
                    ex_key = (ex.get('district'), ex.get('upazila'), ex.get('mouza_name'), ex.get('jl_no'), ex.get('survey_key'), str(ex.get('khatian_no')))
                    if ex_key == key:
                        existing_data[idx] = r
                        break

        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)

        fields = [
            "id", "khatian_no", "division", "division_en", "district", "district_en",
            "upazila", "upazila_en", "survey", "survey_key", "mouza_name", "jl_no", "jl_id",
            "owners", "guardians", "dags", "total_land", "pdf_path", "pdf_status", "pdf_size_bytes"
        ]
        with open(csv_file, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            for row in existing_data:
                writer.writerow({k: row.get(k, '') for k in fields})

        print(f"--> Database updated: {len(existing_data)} total khatians in catalog (+{new_count} new).")

    def generate_summary(self):
        json_file = os.path.join(self.khatian_dir, "khatians.json")
        if not os.path.exists(json_file):
            return

        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        pdf_count = sum(1 for d in data if d.get('pdf_status') in ['Downloaded', 'Already Downloaded'] and d.get('pdf_size_bytes', 0) > 0)
        total_pdf_size = sum(d.get('pdf_size_bytes', 0) for d in data)

        summary = {
            "total_khatians": len(data),
            "total_pdfs_downloaded": pdf_count,
            "total_pdf_size_mb": round(total_pdf_size / (1024 * 1024), 2),
            "divisions_represented": len(set(d.get('division') for d in data if d.get('division'))),
            "districts_represented": len(set(d.get('district') for d in data if d.get('district'))),
            "upazilas_represented": len(set(d.get('upazila') for d in data if d.get('upazila'))),
            "mouzas_represented": len(set(f"{d.get('district')}_{d.get('mouza_name')}" for d in data)),
            "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        with open(os.path.join(self.base_dir, "summary.json"), "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        print("--> Summary generated:", summary)
        return summary
