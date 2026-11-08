# ePorcha Land Records & Khatian PDF Database

Automated database extractor, khatian enricher, and PDF downloader for Bangladesh land records sourced from [ePorcha (eporcha.tech)](https://eporcha.tech/).

---

## 📂 Directory Architecture

```
database/land/ (or Desktop/Land/)
│
├── metadata/                          # Core administrative reference data
│   ├── divisions.json                 # All 8 administrative divisions of Bangladesh
│   ├── districts.json                 # All 64 districts with BBS codes
│   ├── upazilas.json                  # All 527 upazilas / circles
│   └── surveys.json                   # Land survey types (RS, CS, SA, BS, Diara, etc.)
│
├── khatians/                          # Partitioned & Unified Khatian datasets (All 8 Divisions)
│   ├── index.json                     # Nationwide catalog with upazila-level record counts
│   ├── khatians.json                  # Complete consolidated JSON records (56,000+ khatians)
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
├── pdfs/                              # Downloaded & Arranged Official PDF Khatian Copies
│   ├── টাঙ্গাইল/বাসাইল/আর এস/
│   │   ├── একঢালা_JL_5/
│   │   │   ├── Khatian_47.pdf
│   │   │   └── Khatian_633.pdf
│   │   └── মুরাকইর_JL_9/
│   │       ├── Khatian_1.pdf
│   │       └── ...
│   ├── ঢাকা/ধামরাই/আর এস/সুন্দীতারা_JL_1/
│   └── গাজীপুর/কালিয়াকৈর/আর এস/মোথাজুরী_JL_1/
│
├── eporcha_scraper.py                 # Core scraping & API interaction engine
├── download_khatians.py               # Interactive CLI & batch downloader
├── fetch_metadata.py                  # Metadata synchronizer
├── START_DOWNLOADER.bat               # 1-Click launcher for Windows
├── summary.json                       # Live stats summary
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

## 🚀 How to Run & Download More

### Option 1: 1-Click Launcher
Double-click `START_DOWNLOADER.bat` on Windows. You can:
1. Select interactive mode to pick any Division -> District -> Upazila -> Survey -> Mouza.
2. Run batch ingestion across selected districts.
3. Check database summary stats.

### Option 2: Command Line
```bash
# 1. Interactive Downloader (Select any area interactively)
python download_khatians.py --interactive

# 2. Automated batch download (e.g. 20 khatians per mouza)
python download_khatians.py --batch --limit 20

# 3. Synchronize administrative metadata
python fetch_metadata.py
```

---

## 🔒 Reliability & Rate-Limiting
- Includes automated retry with exponential backoff.
- Built-in polite delay (`0.3s`) between PDF generation requests to prevent hitting Cloudflare or DLRMS backend rate limits.
- Resume capability: skips already downloaded PDFs and prevents duplicates in `khatians.json` / `khatians.csv`.
