# Bangladesh Companies & Corporate Member Directory Database

### Authoritative Open Dataset of Bangladesh Companies, Listed Securities, IT Firms, Conglomerates & Apex Trade Chambers

This directory provides a structured, comprehensive, and machine-readable collection of business entities, public corporations, technology firms, and industry associations operating in Bangladesh. Every record includes official verified website links, executive/board contact details, corporate headquarters, registered offices, and sector classifications.

---

## Dataset Overview

| Dataset | File | Records | Key Details |
|---|---|---|---|
| **Unified Master Directory** | `companies_master.json` | **3,344** | Universal search index linking all entities across Bangladesh |
| **DSE Listed Companies** | `dse_listed_companies.json` | **409** | All publicly traded companies on Dhaka Stock Exchange (DSE) with ticker, market cap, board, ISIN, company secretary & registered address |
| **BASIS IT & Software Members** | `it_basis_members.json` | **2,882** | Official member companies of Bangladesh Association of Software and Information Services (BASIS) with membership type, establishment year, and profile |
| **Conglomerates & Business Groups** | `conglomerates_and_groups.json` | **25** | Top diversified industrial corporate groups (Square, Beximco, PRAN-RFL, Akij, Bashundhara, Walton, MGI, ACI, City, Summit, etc.) |
| **Tech Startups & Scaleups** | `startups_and_tech_companies.json` | **15** | Leading tech ventures, fintechs, super-apps, edtechs, and e-commerce platforms (bKash, Nagad, Pathao, Chaldal, ShopUp, etc.) |
| **Apex Chambers & Trade Bodies** | `trade_associations_and_chambers.json` | **13** | Apex trade organizations (FBCCI, DCCI, MCCI, BGMEA, BKMEA, BASIS, BAPI, e-CAB, BACCO, etc.) |
| **Sector-Wise Breakdowns** | `by_sector/*.json` | **8 Sectors** | Fast lookup categorized by Banking/Finance, Pharma, IT, Textile/RMG, Engineering, Food, Energy, and Cement/Construction |

---

## Directory Structure

```text
company/
├── index.json                             # Dataset catalog, schema & summary statistics
├── README.md                              # Complete documentation & usage guide
├── companies_master.json                  # Unified catalog across all corporate categories (3,344 entries)
├── dse_listed_companies.json              # All Dhaka Stock Exchange listed companies (409 entries)
├── it_basis_members.json                  # All BASIS registered IT & software firms (2,882 entries)
├── conglomerates_and_groups.json          # Major industrial conglomerates & business groups (25 entries)
├── startups_and_tech_companies.json       # Top venture-backed digital startups & platforms (15 entries)
├── trade_associations_and_chambers.json   # Apex trade bodies and national chambers (13 entries)
└── by_sector/                             # Sector-specific JSON datasets
    ├── banking_financial.json
    ├── pharmaceuticals_healthcare.json
    ├── it_software.json
    ├── textile_rmg.json
    ├── engineering_industrial.json
    ├── food_agri.json
    ├── energy_power.json
    └── cement_ceramics_construction.json
```

---

## Sample Data Formats

### 1. DSE Listed Company Record
```json
{
  "symbol": "GP",
  "company_name": "Grameenphone Ltd.",
  "sector": "Telecom",
  "market_category": "A",
  "board": "PUBLIC",
  "market_cap_mn_bdt": 306383.07,
  "website": "https://www.grameenphone.com",
  "email": "shareoffice@grameenphone.com",
  "phone": "+880-2-222282990",
  "fax": "+880-2-8412921",
  "headquarters": "GPHOUSE, Bashundhara, Baridhara, Dhaka-1229, Bangladesh.",
  "registered_office": "GPHOUSE, Bashundhara, Baridhara, Dhaka-1229, Bangladesh.",
  "factory_address": "N/A",
  "listing_year": 2009,
  "isin": "BD0001GP0004",
  "scrip_code": 27001,
  "operational_status": "Active",
  "company_secretary": {
    "name": "Mr. S.M. Imdadul Haque",
    "email": "csgp@grameenphone.com",
    "phone": "0202222282990",
    "cell": "+88 01713 118 191"
  },
  "source": "Dhaka Stock Exchange (DSE)"
}
```

### 2. Conglomerate Record
```json
{
  "group_name": "Square Group",
  "bn_name": "স্কয়ার গ্রুপ",
  "founder": "Samson H. Chowdhury, Dr. Kazi Harunur Rashid, P.K. Saha, Radharaman Saha",
  "leadership": {
    "chairman": "Samuel S. Chowdhury",
    "managing_director": "Tapan Chowdhury (Square Pharma)",
    "vice_chairman": "Ratna Patra",
    "director": "Anjan Chowdhury (Square Toiletries & Media)"
  },
  "headquarters": "Square Centre, 48 Mohakhali C/A, Dhaka-1212, Bangladesh",
  "established_year": 1958,
  "website": "https://www.squaregroup.com",
  "email": "info@squaregroup.com",
  "phone": "+880-2-8833047",
  "key_sectors": [
    "Pharmaceuticals",
    "Consumer Goods / Toiletries",
    "Textiles & Garments",
    "Healthcare & Hospitals",
    "Food & Beverage",
    "Media",
    "Information Technology"
  ],
  "flagship_companies": [
    "Square Pharmaceuticals PLC",
    "Square Toiletries Ltd.",
    "Square Textiles Ltd.",
    "Square Hospitals Ltd.",
    "Square Food & Beverage Ltd.",
    "Square InformatiX Ltd."
  ],
  "employee_count_approx": 65000
}
```

---

## Quick Usage Examples

### Python: Search Company by Name or Ticker
```python
import json

with open("company/companies_master.json", encoding="utf-8") as f:
    companies = json.load(f)

# Find any company by keyword
query = "bKash"
matches = [c for c in companies if query.lower() in c["name"].lower()]
for m in matches:
    print(f"Name: {m['name']} | Category: {m['category']} | Website: {m['website']}")
```

### Python: Filter All DSE Companies with Websites
```python
import json

with open("company/dse_listed_companies.json", encoding="utf-8") as f:
    dse = json.load(f)

for c in dse[:10]:
    print(f"{c['symbol']:<10} | {c['company_name']:<35} | {c['website']}")
```

---

## Data Sources & Provenance
- **Dhaka Stock Exchange (DSE):** Official public company profiles, disclosure filings, and market board data.
- **BASIS:** Official member portal of Bangladesh Association of Software and Information Services.
- **Apex Trade Associations & Chambers:** Official registries of FBCCI, DCCI, MCCI, BGMEA, BKMEA, BAPI, and e-CAB.
- **Corporate Disclosures:** Official corporate websites, annual reports, and investor relations publications.
