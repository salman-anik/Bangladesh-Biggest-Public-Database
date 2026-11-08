# 🇧🇩 Bangladesh Open Database (বাংলাদেশ ওপেন ডেটাবেজ)
### *The Largest & Most Comprehensive Public Open-Source Database of Bangladesh*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Database Status](https://img.shields.io/badge/Status-Active%20%26%20Production%20Ready-brightgreen.svg)](#)
[![Format](https://img.shields.io/badge/Format-JSON%20%7C%20CSV%20%7C%20PDF-blue.svg)](#)
[![Coverage](https://img.shields.io/badge/Coverage-All%2064%20Districts-red.svg)](#)
[![Data Records](https://img.shields.io/badge/Total%20Records-150%2C000%2B-success.svg)](#)
[![GitHub stars](https://img.shields.io/github/stars/salman-anik/Bangladesh-Biggest-Public-Database?style=social)](https://github.com/salman-anik/Bangladesh-Biggest-Public-Database)

---

## 📌 Overview

Welcome to the **Bangladesh Open Database** — the single largest, authoritative, community-driven public database covering all primary sectors of Bangladesh. Engineered for software engineers, data scientists, researchers, fintech builders, and AI practitioners, this repository provides clean, structured, normalized, and machine-readable data (JSON, CSV, PDF) spanning governance, geography, banking, healthcare, pharmaceuticals, education, land administration, legal records, transportation, and culture.

Whether you are building an e-commerce checkout with address autocompletion, an ERP requiring 9-digit BEFTN bank routing numbers, a digital health platform indexing 33,000+ medicines, or an AI agent parsing land khatians and statutes, this repository provides battle-tested datasets ready for immediate production deployment.

---

## 📊 High-Level Database Statistics

| Category / Domain | File Count | Record Count | Highlights & Coverage |
| :--- | :--- | :--- | :--- |
| **🏛️ Geography & Admin** | 8 files | ~100,000+ | All 8 Divisions, 64 Districts, 500+ Upazilas, 4,570+ Unions, Wards, and Post Codes |
| **🏦 Banking & Fintech** | 67 files | 8,750+ Branches | 62 Scheduled Banks, 8,747 BEFTN Routing Numbers, SWIFT codes & MFS networks |
| **💊 Medicine & Pharma** | 47 files | 33,219 Medicines | 2,594 Generics, 435+ Manufacturers (Square, Beximco, Incepta), BDT pricing & monographs |
| **🎓 Education** | 40,635+ files | 40,000+ Institutions | Primary to Higher Secondary institutions by Division/District/Upazila with EIIN |
| **📜 Land & ePorcha** | 48 files + dirs | 54,000+ Khatians | CS, SA, RS, BS, and Diara records, Mouza maps, Plot numbers, Owners, & PDF khatians |
| **⚖️ Law & Lawyers** | 370 files | 35,000+ Lawyers | Constitution of Bangladesh, Penal Code 1860, CrPC 1898, Bar Associations |
| **🚑 Healthcare & Medical** | 83 files | 5,000+ Facilities | Public & private hospitals, blood banks, diagnostic centers, ambulances |
| **🚨 Emergency Services** | 69 files | 1,500+ Contacts | 999 hotlines, fire service stations, district administration, Thana police contacts |
| **🚆 Transport & Travel** | 29 files | All Intercity Routes | Bangladesh Railway stations, train fares, bus routes, launch services, airports |
| **🕌 Islamic Knowledge** | 925 files | Complete Corpus | Full Quran with Bangla translations & transliteration, Hadith collections & prayer timings |
| **🏛️ Governance & Public** | 3 files | National Scope | Ministries, statutory bodies, e-citizen services and department portals |
| **🏺 Cultural Heritage** | 2 files | National List | Archaeological sites, historical monuments, and national heritage landmarks |

---

## 📂 Detailed Directory Structure & Schemas

```
database/
├── banking/                   # Complete Bangladesh Banking & MFS Directory
│   ├── banks.json             # 62 Scheduled & Non-Scheduled Banks (SWIFT, Head Offices)
│   ├── branches.json          # 8,751 physical bank branches with addresses & phone numbers
│   ├── routing_numbers.json   # 8,747 BEFTN 9-digit electronic clearing routing codes
│   ├── mfs_providers.json     # bKash, Nagad, Rocket, Upay, Tap USSD & channel codes
│   └── by_bank/               # Pre-segmented branch files for each individual bank
│
├── geography/                 # Administrative Hierarchy & Geospatial Data
│   ├── divisions.json         # 8 Divisions (Dhaka, Chattogram, Rajshahi, Khulna, etc.)
│   ├── districts.json         # 64 Districts with BBS codes, coordinates & Bengali names
│   ├── upazilas.json          # 500+ Upazilas / Thanas
│   ├── unions.json            # 4,570+ Union Parishads & City Corporation Wards
│   ├── postal_codes.json      # Exhaustive post code registry for logistics & delivery
│   └── hierarchy.json         # Complete nested JSON tree (Division -> District -> Upazila -> Union)
│
├── medicine/                  # Comprehensive Pharmaceutical Database
│   ├── all_medicines.json     # 33,219 drug products with brand name, dosage, price & strength
│   ├── generics.json          # 2,594 Active Pharmaceutical Ingredients (APIs) with clinical monographs
│   ├── manufacturers.json     # 435+ Pharmaceutical companies (Square, Incepta, Beximco, etc.)
│   ├── dosage_forms.json      # Tablets, Syrups, Capsules, Injections, Ointments, Eye Drops
│   ├── by_company/            # Segmented catalogs per manufacturer
│   └── by_form/               # Segmented catalogs per dosage form
│
├── education/                 # National Educational Directory
│   ├── Barishal/              # Institutions by Division, District & Upazila
│   ├── Chattogram/            # Includes School/College EIIN, Board, Shifts, Level
│   ├── Dhaka/
│   ├── Khulna/
│   ├── Mymensingh/
│   ├── Rajshahi/
│   ├── Rangpur/
│   └── Sylhet/
│
├── land/                      # Land Records, Khatians & Mouza Surveys
│   ├── metadata/              # Divisions, Districts, Upazilas, Survey Types (CS, SA, RS, BS)
│   ├── khatians/              # 54,000+ Khatian records with owner names, plot numbers, & shares
│   ├── maps/                  # Mouza georeferenced maps & spatial coordinates
│   └── pdfs/                  # Official downloadable Khatian PDFs organized by District/Upazila
│
├── law/ & Lawyer/             # Bangladesh Legal & Judicial Database
│   ├── constitution.json      # The Constitution of the People's Republic of Bangladesh (বাঙলা ও English)
│   ├── penal_code_1860.json   # The Penal Code (Act No. XLV of 1860) with all sections
│   ├── crpc_1898.json         # Code of Criminal Procedure 1898
│   ├── major_acts_catalog.json# Catalog of primary legislative acts
│   └── Lawyer/                # Bar Association memberships (Dhaka Bar, Supreme Court Bar, etc.)
│
├── healthcare/                # Medical & Healthcare Infrastructure
│   ├── hospitals.json         # Specialized, Government, Medical College & Private hospitals
│   ├── blood_banks.json       # Blood donor societies & hospital blood banks with emergency contacts
│   ├── diagnostic_centers.json# Diagnostic labs and pathology testing centers
│   └── ambulance_services.json# 24/7 ICU and regular ambulance service directories
│
├── emergency/                 # National Emergency Hotlines & First Responders
│   ├── national_hotlines.json # 999, 109, 333, 106, 16122, and government call centers
│   ├── police_stations.json   # Police Thanas with OC contact numbers and control rooms
│   ├── fire_stations.json     # Fire Service & Civil Defence station contacts
│   └── district_administration.json # Deputy Commissioner (DC) and UNO contact directories
│
├── transport/                 # Public Transportation & Logistics
│   ├── railway_stations.json  # All Bangladesh Railway stations & junction codes
│   ├── intercity_trains.json  # Intercity train schedules, departure times & stopping stations
│   ├── train_fares.json       # Seat classes (Shovon, Snigdha, AC Berth) fare matrix
│   ├── bus_routes.json        # National highway bus corridors & coach operators
│   ├── launch_routes.json     # Inland water passenger launch routes & launch terminals
│   └── airports.json          # Domestic and international airports (DAC, CGP, ZYL, CXB, etc.)
│
└── Islamic/                   # Islamic Heritage & Religious Data
    ├── quran/                 # Surahs, Ayahs, Arabic script, Bengali translation & transliteration
    ├── hadith/                # Sahih Bukhari, Sahih Muslim in Bengali & English
    └── prayer_times/          # District-wise annual prayer schedules and sehri/iftar times
```

---

## ⚡ Quick Start & Usage Examples

### 1. Node.js / JavaScript
```javascript
// Example: Lookup a Bank Routing Number
const routingData = require('./banking/routing_numbers.json');

function findBankRouting(bankName, branchName) {
  return routingData.find(item => 
    item.bank_name.toLowerCase().includes(bankName.toLowerCase()) &&
    item.branch_name.toLowerCase().includes(branchName.toLowerCase())
  );
}

const match = findBankRouting('BRAC Bank', 'Gulshan');
console.log(match);
```

### 2. Python
```python
# Example: Search Medicine by Generic and calculate cost
import json

with open('medicine/all_medicines.json', 'r', encoding='utf-8') as f:
    medicines = json.load(f)

# Find all Paracetamol brands with price under 2 BDT
paracetamol_brands = [
    med for med in medicines 
    if med.get('generic_name', '').lower() == 'paracetamol' and float(med.get('unit_price', 0)) <= 2.0
]

for med in paracetamol_brands[:5]:
    print(f"{med['brand_name']} ({med['strength']}) - {med['manufacturer']} - ৳{med['unit_price']}")
```

### 3. Bash / cURL / jq
```bash
# Query all upazilas in Dhaka District directly from CLI
cat geography/upazilas.json | jq '.[] | select(.district_name == "Dhaka") | .name'
```

---

## 🔍 SEO, Meta Information & Discoverability

This section is optimized for web spiders, academic researchers, search engine indexes, and LLM web retrievers looking for verified data relating to Bangladesh.

### Core Meta Keywords
* `bangladesh public database` • `bangladesh open data` • `bangladesh json database`
* `bangladesh geo data` • `bangladesh postal codes json` • `bangladesh division district upazila union`
* `bangladesh bank routing number database` • `beftn routing numbers json` • `swift codes bangladesh`
* `bangladesh medicine database` • `medex api alternative` • `bangladesh pharmaceuticals generic dataset`
* `bangladesh schools colleges eiin list` • `education board bangladesh database`
* `eporcha bangladesh dataset` • `bangladesh khatian database` • `bangladesh mouza map records`
* `bangladesh laws penal code 1860 json` • `crpc bangladesh` • `constitution of bangladesh json`
* `bangladesh railway train timetable json` • `train fare chart bangladesh`
* `bangladesh emergency numbers json` • `999 bangladesh police stations contact directory`

### Bengali Keywords (বাংলা সার্চ কিওয়ার্ড)
* `বাংলাদেশ উন্মুক্ত ডেটাবেজ` • `বাংলাদেশ ওপেন ডাটা রিপোজিটরি`
* `বাংলাদেশের জেলা উপজেলা ইউনিয়নের তালিকা JSON` • `পোস্ট কোড বাংলাদেশ`
* `বাংলাদেশের সকল ব্যাংক রাউটিং নাম্বার` • `সকল ব্যাংকের শাখার তালিকা`
* `বাংলাদেশের ওষুধের তালিকা ও দাম` • `জেনেরিক নাম ও ফার্মাসিউটিক্যাল কোম্পানি`
* `ই-পর্চা খতিয়ান রেকর্ড` • `মৌজা ম্যাপ ও দাগ নম্বর`
* `বাংলাদেশের আইন ও দণ্ডবিধি ১৮৬০` • `বাংলাদেশ সংবিধান ও সিআরপিসি`
* `বাংলাদেশ রেলওয়ে ট্রেনের সময়সূচি ও ভাড়া` • `জরুরি সেবা হটলাইন নম্বর`

### Search & Index Categorization
- **Primary Topic:** Open Government Data / Public Directory / Country-level Master Dataset
- **Geographical Entity:** Bangladesh (ISO 3166-1 alpha-2: `BD`, ISO 3166-1 alpha-3: `BGD`)
- **Languages Supported:** English (`en`), Bengali (`bn-BD`)
- **Target Audience:** Full-stack developers, mobile app engineers, fintech builders, legal-tech startups, healthcare systems, academic researchers.

---

## 🛠️ Data Sources & Integrity

All data in this repository is curated from official public gazettes, statutory portals, regulatory filings, and government open registries, including:
- **Bangladesh Bank (BB)** for banking, clearing, and routing codes
- **Directorate General of Drug Administration (DGDA)** for pharmaceuticals & medicine pricing
- **Bangladesh Bureau of Statistics (BBS)** & **Cabinet Division** for administrative demarcations
- **Ministry of Land (MinLand / ePorcha)** for land survey khatians and mouza indicators
- **Bangladesh Railway (BR)** & **BRTA** for national transit infrastructure
- **Ministry of Law, Justice and Parliamentary Affairs** for legislation and legal codes
- **Bangladesh Fire Service & Civil Defence** and **Bangladesh Police** for emergency contacts

> *All datasets are regularly sanitized, validated against schema definitions, normalized into UTF-8 JSON, and checked for encoding consistency.*

---

## 🤝 Contributing

Contributions to keep this national repository accurate and updated are warmly welcomed!

1. **Fork** the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/update-banking-routes
   ```
3. Commit your validated JSON modifications:
   ```bash
   git commit -m "Update routing numbers for 2026 newly opened branches"
   ```
4. Push to the branch and open a **Pull Request**.

Please ensure that any newly added JSON data adheres to UTF-8 formatting and valid syntax (`jq . file.json`).

---

## 📄 License & Attribution

This open-source repository is distributed under the **[MIT License](LICENSE)**. You are free to use, distribute, integrate, and modify these datasets in both commercial and non-commercial products with proper attribution.

---

<p align="center">
  <b>Developed & Maintained with ❤️ for the Developer Community of Bangladesh 🇧🇩</b><br>
  <sub>If you find this database helpful, please consider giving it a ⭐ on GitHub to help others discover it!</sub>
</p>
