# Bangladesh Land Records, Khatians & Mouza Maps Database

Nationwide Bangladesh land records, mouza/JL metadata, ePorcha khatians, and [Google Drive-linked Mouza maps archive](./maps/README.md), sourced from [ePorcha (eporcha.tech)](https://eporcha.tech/) and [`mouzamap.tech`](https://mouzamap.tech/). All JSON/CSV datasets are stored directly in GitHub while large binary Mouza map files (`PDF`/`JPG`/`TIF`) live in Google Drive and are linked inside [`land/maps/`](./maps/).

---

## 📂 Directory Architecture

```
database/land/ (or Desktop/Land/)
│
├── metadata/                          # Core administrative reference data & nationwide Mouza catalog
│   ├── divisions.json                 # All 8 administrative divisions of Bangladesh
│   ├── districts.json                 # All 64 districts with BBS codes
│   ├── upazilas.json                  # All 527 upazilas / circles
│   ├── surveys.json                   # Land survey types (RS, CS, SA, BS, Diara, etc.)
│   ├── mouzas_index.json              # Master nationwide Mouza index (171,877 entries across 527 upazilas)
│   └── mouzas/                        # Per-district Mouza/JL catalogs (<Division>/<District>.json)
│
├── khatians/                          # Partitioned & Unified Khatian datasets (8 Divisions, 61 districts, 515 upazilas, 798 mouzas)
│   ├── index.json                     # Nationwide catalog with upazila-level record counts
│   ├── khatians.json                  # Complete consolidated JSON records (93,953 khatians, 89.04 MiB)
│   ├── khatians.csv                   # CSV format for Excel, Google Sheets, or SQL imports
│   ├── Barishal/                      # Barishal, Patuakhali, Pirojpur, Bhola...
│   ├── Chattogram/                    # Chattogram, Cox's Bazar, Cumilla, Feni, Brahmanbaria...
│   ├── Dhaka/                         # Dhaka, Gazipur, Tangail, Narayanganj, Faridpur...
│   ├── Khulna/                        # Khulna, Jashore, Kushtia, Satkhira...
│   ├── Mymensingh/                    # Sherpur, Netrakona, Mymensingh, Jamalpur...
│   ├── Rajshahi/                      # Rajshahi, Bogura, Pabna, Sirajganj...
│   ├── Rangpur/                       # Rangpur, Dinajpur, Kurigram, Gaibandha...
│   └── Sylhet/                        # Sylhet, Moulvibazar, Habiganj, Sunamganj...
│
├── (Drive-only binary archives — gitignored locally; stored in Google Drive):
│   └── Mouza Map PDFs/JPGs/TIFs -> Google Drive folder `land/maps/` (226,157 files / 2,385.37 GB)
│
├── maps/                              # Google Drive-linked index of 226,157 Mouza map files (2,385.37 GB across 8 divisions / 61 districts)
│   ├── index.json                     # Division/District totals, Google Drive folder IDs & live upload counts
│   ├── mouza_maps_catalog.json        # Uploaded map file records with direct Google Drive view/download URLs
│   ├── <Division>/<District>.json     # Per-district Mouza map catalogs (upazila/survey paths + Drive links)
│   ├── sync_gdrive_maps.py            # Zero-disk resumable streaming sync engine (free.mouzamap.tech -> Google Drive -> GitHub links)
│   ├── START_MAP_SYNC.bat             # Windows launcher to continue streaming remaining maps under Drive's 750 GB/day cap
│   └── README.md                      # Nationwide Mouza maps table with clickable Google Drive links
│
├── collect_all_divisions.py           # Nationwide ePorcha collector script
├── partition_khatians.py              # Partitioned khatian builder script
├── scrape_swarupkathi_all.py          # Swarupkathi ePorcha scraper script
├── summary.json                       # Live stats summary (93,953 khatians & 171,877 cataloged mouzas)
└── README.md                          # Documentation
```

---

## 📊 Dataset Schema (`khatians.json` & `khatians.csv`)

| Field | Description (বাংলা) | Example |
| :--- | :--- | :--- |
| `id` | ইউনিক রেকর্ড আইডি | `4529649` |
| `khatian_no` | খতিয়ান নম্বর | `47` |
| `division` | বিভাগের নাম | `ঢাকা` |
| `district` | জেলার নাম | `টাঙ্গাইল` |
| `upazila` | উপজেলার নাম | `বাসাইল` |
| `survey` | সার্ভের ধরণ (RS, CS, SA, BS) | `আর এস` |
| `mouza_name` | মৌজার নাম | `একঢালা` |
| `jl_no` | জে. এল. নম্বর | `5` |
| `owners` | মালিকগণের নাম, অংশ ও রেকর্ডরুম নোট | `দং মির্জা আব্দুল জলিল, মির্জা ইউসুফ আলী...` |
| `guardians` | পিতা বা স্বামীর নাম | `পিতা- মির্জা আব্দুল আজিজ...` |
| `dags` | দাগ নম্বরসমূহ | `625, 626, 631` |
| `total_land` | মোট জমির পরিমাণ (একর) | `1.0900` |
| `pdf_path` | ডাউনলোডকৃত PDF ফাইলের পাথ | `pdfs/টাঙ্গাইল/বাসাইল/আর এস/একঢালা_JL_5/Khatian_47.pdf` |
| `pdf_status` | PDF ডাউনলোড অবস্থা | `Downloaded` |
| `pdf_size_bytes` | PDF ফাইলের সাইজ (বাইট) | `337552` |

---

## 🗺️ Google Drive Mouza Maps & Zero-Disk Sync

Large binary Mouza maps (`226,157` files totaling `2,385.37 GB`) are stored in Google Drive (not inside GitHub) and indexed under [`maps/`](./maps/README.md):

- **Google Drive `land/maps` Root:** [Open in Google Drive](https://drive.google.com/drive/folders/1sPrrrWXaAsWByTms7Kwcnq230QkZFW4u)
- **Google Drive `land/` Folder:** [Open in Google Drive](https://drive.google.com/drive/folders/1hbpHQ-3DFp1AsSZr_ISKV4g59KeKGb5e)
- **Continue Zero-Disk Sync (`750 GB / 24h` Google Drive limit):**
  Run [`maps/START_MAP_SYNC.bat`](./maps/START_MAP_SYNC.bat) on Windows, or run via CLI:
  ```bash
  cd maps
  python sync_gdrive_maps.py --workers 6 --limit-gb 700 --refresh-github
  ```
  Each file is streamed through temporary storage to Google Drive, deleted immediately from the local PC after upload, recorded in `%LOCALAPPDATA%\BangladeshMouzaSync\sync_state.db`, and linked back into `maps/<Division>/<District>.json`, `maps/index.json`, `maps/mouza_maps_catalog.json`, and `maps/README.md`.

---

## 🔧 Reliability & Maintenance
- Retries transient upstream and Google Drive API errors with exponential backoff while keeping zero permanent binary map files on local disk.
- Khatian collector (`collect_all_divisions.py`, `partition_khatians.py`) keeps all JSON/CSV datasets partitioned below GitHub's 100 MiB file limit (`khatians.json` = 89.04 MiB).
- Run `python maps/sync_gdrive_maps.py --refresh-only` anytime to regenerate GitHub map catalogs and Drive links from local SQLite sync state.
