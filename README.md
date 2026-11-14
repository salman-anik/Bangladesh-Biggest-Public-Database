# Bangladesh Biggest Public Database

### A Community-Driven Collection of Public Datasets About Bangladesh

Explore structured Bangladesh datasets covering geography, banking, education, healthcare, pharmaceuticals, government services, law, transportation, culture, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Community%20Maintained-brightgreen.svg)](#)
[![Formats](https://img.shields.io/badge/Data-JSON%20%7C%20CSV%20%7C%20PDF-blue.svg)](#)
[![Country](https://img.shields.io/badge/Country-Bangladesh-green.svg)](#)

**Repository:** [salman-anik/Bangladesh-Biggest-Public-Database](https://github.com/salman-anik/Bangladesh-Biggest-Public-Database)

---

## About This Project

The **Bangladesh Open Data Repository** is an open-source initiative to collect, organize, document, and share publicly accessible datasets about Bangladesh.

Finding reliable, structured Bangladesh-specific data can be challenging for developers, researchers, students, and organizations. Information is often scattered across government websites, regulatory portals, public directories, PDF documents, and independent data sources.

This project aims to make that information easier to discover and use by organizing it into machine-readable formats such as JSON and CSV, alongside source documents where available.

Whether you are developing a software application, conducting academic research, performing statistical analysis, building an AI/ML project, or exploring Bangladesh-related information, this repository can serve as a starting point.

**Project goals:**
- Build an accessible collection of Bangladesh-related open datasets.
- Organize public information into structured and reusable formats.
- Support Python, JavaScript, data science, and machine learning projects.
- Document original sources and data provenance.
- Encourage community contributions and data verification.
- Make Bangladesh-specific datasets easier to discover and access.

## Dataset Categories

The repository is organized into the following subject areas.

| Category | Dataset Coverage | Directory |
|---|---|---|
| Geography & Administration | 8 divisions, 64 districts, 494 upazilas, 4,540 unions, 12 city corporations, 1,368 postal codes | `geography/` |
| Demographics & Census | BBS latest publications (120 reports) & statistical yearbooks catalog | `demographics/` |
| Economy & Macro | BBS macro indicators (GDP, GNI, per capita income) & 14 national accounts reports | `economy/` |
| Banking & Finance | 62 banks, 8,751 branches, 8,747 BEFTN routing numbers and 5 MFS providers | `banking/` |
| Companies & Businesses | 3,344 companies: 409 DSE listed, 2,882 BASIS IT members, conglomerates, startups, trade bodies | `company/` |
| Medicine & Pharmaceuticals | 33,219 medicines, 1,233 diseases/indications, 2,594 generics, 435 manufacturers, 215 dosage forms | `medicine/` |
| Education | 40,000+ schools, colleges, madrasas, EIIN and teacher rosters | `education/` |
| Universities & Higher Ed | 185 UGC-listed universities (61 public, 121 private, 3 international) with details | `universities/` |
| Agriculture & Crops | 117 BBS crop/agricultural wage reports & DAE portal resources | `agriculture/` |
| Climate & Weather | BMD temperature history (576 records), humidity normals (36 stations), 20 agromet stations | `climate/` |
| Environment & Pollution | DoE daily AQI (1,286 reports cataloged, 15 recent parsed) & water quality reports | `environment/` |
| Elections & Constituencies | 300 parliamentary constituencies (with voter counts) & 63 registered political parties | `elections/` |
| Government Procurement | BPPA contract awards & public procurement records | `procurement/` |
| Land Records | 83,455 ePorcha khatian records & mouza map PDFs | `land/` |
| Law & Legal Information | Constitution, Penal Code 1860, CrPC 1898, major acts and legal glossary | `law/` |
| Lawyers Directory | 34,591 Dhaka Bar Association members by division, district and status | `Lawyer/` |
| Healthcare | 3,590 hospitals, diagnostic centers, doctors, blood banks and ambulance services | `healthcare/` |
| Emergency Services | 14 national hotlines, 76 police stations, 67 fire stations and 64 district admin offices | `emergency/` |
| Transportation | Railway stations, 44 station BTCL phones, intercity trains, fares, bus/launch routes, airports | `transport/` |
| Islamic Information | Quran, Hadith collections and Fiqh/Sunnah datasets | `Islamic/` |
| Government & Public Services | 15 ministries, 10 statutory bodies and 8 citizen e-services | `governance/` |
| Heritage & Tourism | Historical landmarks and tourist destinations | `heritage/` |

*Dataset availability varies by category. Refer to the actual repository files for current coverage.*

## Standardized Hierarchy: Division > District > Upazila

To make finding information instant and intuitive, all regional datasets are organized under the standardized Bangladesh geographic hierarchy:

```text
<category>/[divisions/]<Division>/<District>/<Upazila>[.json]
```

- **Education:** `education/<Division>/<District>/<Upazila>/<category>/<institution>.json` (40,000+ schools, colleges, and madrasas with teachers and contacts, plus `_summary.json` per upazila).
- **Healthcare:** `healthcare/divisions/<Division>/<District>/<Upazila>.json` (hospitals, bed capacity, ICU, ambulance availability, and emergency hotlines).
- **Banking:** `banking/divisions/<Division>/<District>/<Upazila>.json` (8,750+ bank branches, routing numbers, swift codes, and branch codes).
- **Emergency Services:** `emergency/divisions/<Division>/<District>/<Upazila>.json` (police stations with OC numbers, fire stations, district administration contacts, and national hotlines).
- **Geography:** `geography/divisions/<Division>/<District>/<Upazila>/info.json` (unions, postal codes, coordinates, and official government portal links).
- **Land Records:** `land/khatians/<Division>/<District>/<Upazila>.json` (54,000+ ePorcha khatian records partitioned by upazila).
- **Transport:** `transport/divisions/<Division>/<District>/transport_nodes.json` (railway stations and airports).

---

## Medicine & Disease Data (`medicine/`)

The `medicine/` directory contains a comprehensive Bangladesh pharmaceutical and disease/indication dataset (last updated `2026-11-07`):

- **33,219 Medicines** (`all_medicines_summary.json`): Brand-level medicine records with generic names, strengths, dosage forms, manufacturers, BDT pricing, and clinical monograph details.
- **1,233 Diseases / Medical Indications** (`indications.json`): Medical conditions and therapeutic indications mapped to matching medicine counts.
- **2,594 Generics** (`generics.json`): Clinical monographs for active pharmaceutical ingredients.
- **Additional Catalogs:** 435 manufacturers (`manufacturers.json`), 215 dosage forms (`dosage_forms.json`), and 556 therapeutic classes (`therapeutic_classes.json`), plus pre-segmented `by_company/` and `by_form/` directories.

---

## Interactive Data Visualizer (`visualize/`)

A modern, fast React + Vite web application is included in the `visualize/` folder to search, explore, and visualize all public datasets.

### Running the Visualizer:

```bash
cd visualize
npm install
npm run dev
```

Visit `http://localhost:3000` to browse by **Division > District > Upazila** or search globally across 53,000+ institutions, hospitals, bank branches, routing numbers, and emergency stations.

---

## Repository Structure

```text
Bangladesh-Biggest-Public-Database/
├── visualize/                   # React + Vite interactive search & visualizer portal
│   ├── src/
│   ├── public/data/             # Pre-indexed search and upazila bundle data
│   └── package.json
│
├── agriculture/                 # BBS Crop Reports (117) & DAE Agricultural Resources
├── banking/                     # 8,751 Bank Branches & 8,747 Routing Numbers
│   ├── divisions/<Division>/<District>/<Upazila>.json
│   ├── branches.json
│   ├── routing_numbers.json
│   └── by_bank/
│
├── climate/                     # BMD Temperature History, Humidity Normals & Agromet Stations
├── company/                     # 3,344 Companies (DSE, BASIS IT, Conglomerates, Startups)
├── demographics/                # BBS Latest Publications & Statistical Yearbooks Catalog
├── economy/                     # BBS Macro Indicators (GDP, Per Capita) & National Accounts
├── education/                   # 40,000+ Educational Institutions & Teacher Rosters
│   ├── <Division>/<District>/<Upazila>/
│   └── education_hierarchy.json
│
├── elections/                   # 300 Parliamentary Constituencies & 63 Political Parties
├── emergency/                   # Police, Fire Service, District Admin & National Hotlines
├── environment/                 # DoE Daily AQI (1,286 Reports) & Water Quality Reports
├── geography/                   # 8 Divisions, 64 Districts, 494 Upazilas, 4,540 Unions, 1,368 Postcodes
├── governance/                  # Ministries, Statutory Bodies & Citizen Services
├── healthcare/                  # 3,590 Hospitals, Doctors, Blood Banks & Ambulances
├── heritage/                    # Historical Landmarks & Tourist Destinations
├── Islamic/                     # Quran, Hadith & Fiqh Datasets
├── land/                        # 83,455 Land Khatians & Mouza Maps
├── law/                         # Constitution, Penal Code 1860, CrPC 1898 & Major Acts
├── Lawyer/                      # 34,591 Dhaka Bar Association Members
├── medicine/                    # 33,219 Medicines, 2,594 Generics, 1,233 Indications
├── procurement/                 # BPPA Public Procurement & Contract Awards
├── transport/                   # Railway Stations, 44 Station Phones, Trains, Fares & Airports
└── universities/                # 185 UGC Universities (Public, Private, International)
```

This is a representative directory overview. Check the repository for the actual available files.

## Data Formats

Datasets may be provided in the following formats:

| Format | Purpose |
|---|---|
| JSON | Applications, APIs, automation and software development |
| CSV | Excel, pandas, statistical analysis and data processing |
| PDF | Original documents and source references |

## Quick Start

### Python

Load and explore a Bangladesh dataset using Python:

```python
import json

file_path = "geography/districts.json"

with open(file_path, "r", encoding="utf-8") as file:
    districts = json.load(file)

print(f"Total records: {len(districts)}")

for district in districts[:5]:
    print(district)
```

### JavaScript / Node.js

Read and search Bangladesh banking information:

```javascript
const banks = require(
  "./banking/banks.json"
);

const results = banks.filter(bank =>
  bank.name?.toLowerCase().includes("brac")
);

console.log(results);
```

Adapt field names to the actual dataset schema.

### Command Line

Use `jq` to explore JSON datasets:

```bash
jq '.' geography/districts.json
```

Filter records when the relevant field exists:

```bash
jq '.[] | select(.district_name == "Dhaka")' \
  geography/upazilas.json
```

## Data Sources & References

Datasets are collected from publicly accessible information and sources where available.

Primary source organizations include:

- [Bangladesh Bureau of Statistics (BBS)](https://bbs.gov.bd/) — Population, census, agriculture, national accounts and statistical yearbooks.
- [Bangladesh Bank](https://www.bb.org.bd/) — Banking and financial information.
- [Bangladesh Election Commission (ECS)](https://www.ecs.gov.bd/) — Parliamentary constituencies, voter statistics and registered political parties.
- [University Grants Commission (UGC)](https://ugc.gov.bd/) — Public, private and international universities directory.
- [Bangladesh Meteorological Department (BMD)](https://bmd.gov.bd/) — Historical temperature, humidity normals and agromet stations.
- [Department of Agricultural Extension (DAE)](https://dae.gov.bd/) — Agricultural extension and crop resources.
- [Department of Environment (DoE)](https://doe.gov.bd/) — Daily Air Quality Index (AQI) and water quality reports.
- [Bangladesh Public Procurement Authority (BPPA)](https://www.bppa.gov.bd/) — Public procurement and contract award records.
- [Directorate General of Drug Administration](https://dgda.gov.bd/) — Pharmaceutical and medicine information.
- [Ministry of Education](https://moedu.gov.bd/) — Education-related information.
- [Ministry of Land](https://land.gov.bd/) — Land administration information.
- [Bangladesh Railway](https://railway.gov.bd/) — Railway schedules and station directory.
- [Bangladesh Police](https://www.police.gov.bd/) — Public safety information.
- [Bangladesh Fire Service](https://fireservice.gov.bd/) — Fire and emergency services.
- [Laws of Bangladesh](https://bdlaws.minlaw.gov.bd/) — Legislative and legal information.

**Source attribution:** These are potential source references, not a claim that every dataset has already been verified against each organization. Consult individual dataset documentation for its actual origin.

## Data Quality & Verification

Data quality is an important part of this project.

Where applicable, datasets should include:

- Original source URL.
- Collection or publication date.
- Last verification date.
- Record count.
- File format and encoding.
- Field descriptions and schema.
- License and reuse restrictions.
- Known limitations and missing information.

Contributors are encouraged to validate JSON syntax, remove duplicate records, preserve original Bengali text, and document any transformations.

## Responsible Data Usage

Public accessibility does not automatically mean unrestricted reuse.

Before using a dataset, check its original source license, applicable terms, and legal restrictions.

In particular:

- Do not publish private or confidential personal information.
- Treat personal contact details and land ownership information with appropriate care.
- Do not assume that public records are accurate or up to date.
- Verify banking, healthcare, medicine, legal and emergency information before operational use.
- Do not use this repository as a substitute for official records or professional advice.

## Contributing

Contributions from developers, researchers, students and data enthusiasts are welcome.

1. Fork this repository.
2. Create a feature branch.
3. Add or update a dataset.
4. Validate the data and document its source.
5. Submit a pull request.

Example:

```bash
git checkout -b feature/update-geography
git add database/
git commit -m "Update Bangladesh geography dataset"
git push origin feature/update-geography
```

Please ensure that contributions:
- Use UTF-8 encoding.
- Contain valid JSON or CSV.
- Include source attribution.
- Avoid duplicate or unsupported records.
- Respect privacy and licensing requirements.

## License

The repository's code and documentation are distributed under the [MIT License](LICENSE), where applicable.

Individual datasets may have separate copyright, licensing, attribution, or reuse restrictions. Always consult their original sources and accompanying license information.

## Project Maintainer

**Salman Anik**

Computer Science & Engineering Student | Data Science Enthusiast | Developer

- GitHub: https://github.com/salman-anik
- Repository: https://github.com/salman-anik/Bangladesh-Biggest-Public-Database

---

**Building a more accessible Bangladesh data ecosystem, one dataset at a time.**

If this project is useful to you, consider giving it a ⭐ and contributing to its development.
