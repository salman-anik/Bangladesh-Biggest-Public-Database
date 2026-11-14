# Bangladesh Biggest Public Database

### A Community-Driven Collection of Public Datasets About Bangladesh

Explore structured Bangladesh datasets covering geography, banking, education, healthcare, pharmaceuticals, government services, law, transportation, culture, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Community%20Maintained-brightgreen.svg)](#)
[![Formats](https://img.shields.io/badge/Data-JSON%20%7C%20CSV%20%7C%20PDF-blue.svg)](#)
[![Country](https://img.shields.io/badge/Country-Bangladesh-green.svg)](#)

**Repository:** [salman-anik/Bangladesh-Biggest-Public-Database](https://github.com/salman-anik/Bangladesh-Biggest-Public-Database) | **Live Visualizer (Next.js on Vercel):** [bangladesh-biggest-public-database.vercel.app](https://bangladesh-biggest-public-database.vercel.app)

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
| Geography & Administration | 8 divisions, 64 districts, 494 upazilas, 4,540 unions, 12 city corporations, 1,368 postal codes, GeoJSONs & [uncompressed boundary layers (Drive)](./geography/geojson/README.md) | `geography/` |
| Demographics & Census | BBS latest publications by topic, Census/SVRS District Statistics (64 districts) & statistical yearbooks | `demographics/` |
| Economy & Macro | BBS macro indicators (CPI/inflation, GDP growth) & National Accounts (2016–2026) | `economy/` |
| Banking & Finance | 62 banks, 8,751 branches, 8,747 BEFTN routing numbers and 5 MFS providers by bank & division/district | `banking/` |
| Companies & Businesses | 3,344 companies: 409 DSE listed, 2,882 BASIS IT members, conglomerates, startups, trade bodies | `company/` |
| Medicine & Pharmaceuticals | 33,219 medicines, 1,233 diseases/indications, 2,594 generics, 435 manufacturers, 215 dosage forms | `medicine/` |
| Education | 40,000+ schools, colleges, madrasas, EIIN and teacher rosters by Division > District > Upazila | `education/` |
| Universities & Higher Ed | 185 UGC-listed universities categorized into Public (General/Engineering/Agri/Medical), Private & International | `universities/` |
| Agriculture & Crops | 64 district profiles (agro-ecological zones & seasonal calendars), 117 BBS crop reports & 134 DAE resources | `agriculture/` |
| Climate & Weather | BMD weather station history (48 stations, 576 records) by Division > District, decadal series & normals | `climate/` |
| Environment & Pollution | DoE daily AQI by year (2023–2026) & city (14 cities), plus water quality reports | `environment/` |
| Elections & Constituencies | 300 parliamentary constituencies by Division > District & seat range, plus 63 registered political parties | `elections/` |
| Government Procurement | BPPA/CPTU e-GP contract awards categorized by Division > District & procuring ministry | `procurement/` |
| Land Records & Mouza Maps | 93,953 ePorcha khatian records (61 districts, 515 upazilas), 171,877 cataloged mouzas (527 upazilas) & [226,157 Mouza map files (2,385.37 GB) linked directly online via `free.mouzamap.tech`](./land/maps/README.md) | `land/` |
| Law & Legal Information | Constitution by Part, Penal Code 1860, CrPC 1898, major acts by category & legal glossary | `law/` |
| Lawyers Directory | 34,591 Dhaka Bar Association members by division, district and status | `Lawyer/` |
| Healthcare | 3,590 hospitals, diagnostic centers, doctors, blood banks and ambulance services | `healthcare/` |
| Emergency Services | 14 national hotlines, 76 police stations, 67 fire stations and 64 district admin offices | `emergency/` |
| Transportation | Railway stations, 44 station BTCL phones, intercity trains, fares, bus/launch routes, airports | `transport/` |
| Islamic Information | Quran, Hadith collections and Fiqh/Sunnah datasets | `Islamic/` |
| Governance & Public Services | 494 Upazilas (`Division > District > Upazila`), 64 districts, UNO/district portals, constituencies, 15 ministries, 10 statutory bodies & 8 citizen e-services | `governance/` |
| Heritage & Tourism | Historical landmarks, UNESCO heritage sites & natural destinations by Division > District & category | `heritage/` |

*Dataset availability varies by category. Refer to the actual repository files for current coverage.*

## Standardized Hierarchy: Division > District > Upazila

To make finding information instant and intuitive, all regional datasets are organized under the standardized Bangladesh geographic hierarchy:

```text
<category>/[divisions/]<Division>/<District>/<Upazila>[.json]
```

- **Education:** `education/<Division>/<District>/<Upazila>/<category>/<institution>.json` (40,000+ schools, colleges, and madrasas with teachers and contacts, plus `_summary.json` per upazila).
- **Governance:** `governance/divisions/<Division>/<District>/<Upazila>.json` (494 upazila UNO portals, 64 district administrations, parliamentary seats, ministries, statutory bodies & citizen e-services).
- **Healthcare:** `healthcare/divisions/<Division>/<District>/<Upazila>.json` (hospitals, bed capacity, ICU, ambulance availability, and emergency hotlines).
- **Banking:** `banking/divisions/<Division>/<District>/<Upazila>.json` (8,750+ bank branches, routing numbers, swift codes, and branch codes).
- **Emergency Services:** `emergency/divisions/<Division>/<District>/<Upazila>.json` (police stations with OC numbers, fire stations, district administration contacts, and national hotlines).
- **Geography & GIS:** `geography/divisions/<Division>/<District>/<Upazila>/info.json` plus nationwide GeoJSON layers in `geography/geojson/` and [uncompressed high-resolution GeoJSON boundary folders on Google Drive](./geography/geojson/README.md).
- **Land Records, Khatians & Mouza Maps:** `land/khatians/<Division>/<District>/<Upazila>.json` (93,953 ePorcha khatian records across 8 divisions / 61 districts / 515 upazilas), `land/metadata/mouzas/<Division>/<District>.json` (171,877 cataloged mouza/JL entries across 527 upazilas), and `land/maps/<Division>/<District>.json` indexing 226,157 Mouza map files (PDF/JPG/TIF) hosted on [Google Drive](./land/maps/README.md).
- **Transport:** `transport/divisions/<Division>/<District>/transport_nodes.json` (railway stations and airports).

---

## Medicine & Disease Data (`medicine/`)

The `medicine/` directory contains a comprehensive Bangladesh pharmaceutical and disease/indication dataset (last updated `2026-11-07`):

- **33,219 Medicines** (`all_medicines_summary.json`): Brand-level medicine records with generic names, strengths, dosage forms, manufacturers, BDT pricing, and clinical monograph details.
- **1,233 Diseases / Medical Indications** (`indications.json`): Medical conditions and therapeutic indications mapped to matching medicine counts.
- **2,594 Generics** (`generics.json`): Clinical monographs for active pharmaceutical ingredients.
- **Additional Catalogs:** 435 manufacturers (`manufacturers.json`), 215 dosage forms (`dosage_forms.json`), and 556 therapeutic classes (`therapeutic_classes.json`), plus pre-segmented `by_company/` and `by_form/` directories.

---

## Interactive Data Visualizer (`visualize/` — Next.js App Router)

A modern, fast **Next.js 15 (App Router) + Tailwind CSS** web application is included in `visualize/` (configured for Vercel static export) to search, explore, and visualize all 22 categories, 494 Upazilas, Land Khatians, Governance portals, and Google Drive Mouza Maps.

### Running the Visualizer:

```bash
cd visualize
npm install
npm run dev
```

Visit `http://localhost:3000` to browse by **Location Explorer (`Division > District > Upazila`)** or switch to the **22 Dataset Categories** view. Every folder throughout this repository also contains a dedicated `README.md` index for effortless GitHub navigation.

---

## Repository Structure

```text
Bangladesh-Biggest-Public-Database/
├── visualize/                   # Next.js 15 App Router interactive explorer & Vercel frontend
│   ├── src/app/                 # Next.js App Router layout, globals.css & page entry
│   ├── public/data/             # Pre-indexed search, 22-category overview & 494 upazila bundles
│   └── next.config.mjs
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
├── geography/                   # 8 Divisions, 64 Districts, 494 Upazilas, 4,540 Unions, 1,368 Postcodes & GeoJSON/GIS layers
├── governance/                  # Ministries, Statutory Bodies & Citizen Services
├── healthcare/                  # 3,590 Hospitals, Doctors, Blood Banks & Ambulances
├── heritage/                    # Historical Landmarks & Tourist Destinations
├── Islamic/                     # Quran, Hadith & Fiqh Datasets
├── land/                        # 93,953 Land Khatians, 171,877 Mouzas & 226,157 Drive-linked Mouza Maps
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

## Google Drive Mirror & Direct Online Map Links

All **JSON/CSV datasets, metadata, and scripts** live directly inside this GitHub repository and are mirrored as **uncompressed folders (zero ZIP archives)** in **Google Drive**. Because the **226,157 Mouza map files (`PDF`/`JPG`/`TIF`, ~2.33 TB)** from [`mouzamap.tech`](https://mouzamap.tech/) are too heavy for GitHub or personal Google Drive storage, [`land/maps/`](./land/maps/README.md) links directly to their live online URLs on [`free.mouzamap.tech`](https://free.mouzamap.tech/):

- **Full Repository Google Drive Mirror:** [Open `Bangladesh-Biggest-Public-Database` on Google Drive](https://drive.google.com/drive/folders/1ObOiGGQXl9B4bodcnDkx7g5yU_dc-Gol) (full manifest: [`drive_mirror.json`](./drive_mirror.json))
- **Mouza Maps Catalog (`land/maps/`):** [Direct Online Mouza Map Links (`free.mouzamap.tech`)](./land/maps/README.md) — 226,157 cataloged map files (~2.33 TB) organized by Division → District → Upazila → Survey; see [`land/maps/index.json`](./land/maps/index.json)
- **Land Records Folder (`land/`):** [Open `land` on Google Drive](https://drive.google.com/drive/folders/1hbpHQ-3DFp1AsSZr_ISKV4g59KeKGb5e) — see [`land/README.md`](./land/README.md)
- **Geography & High-Res GIS Boundaries (`geography/geojson/`):** [Open `geography/geojson` on Google Drive](https://drive.google.com/drive/folders/1slEFybA33XtFDW1vqK60nwkwqGHpL8XO) (parent [`geography/`](https://drive.google.com/drive/folders/1oo_tHSf42JXy5NUVY2qxH6KctXOZhVj9)) — see [`geography/geojson/README.md`](./geography/geojson/README.md)

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
