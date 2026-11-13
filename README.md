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
| Geography & Administration | Divisions, districts, upazilas, unions and postal codes | `database/geography/` |
| Banking & Finance | Banks, branches, routing numbers and mobile financial services | `database/banking/` |
| Companies & Businesses | Listed companies (DSE), IT members (BASIS), conglomerates, startups, trade bodies | `database/company/` |
| Medicine & Pharmaceuticals | 33,219 medicines, 1,233 diseases/indications, 2,594 generics, manufacturers and dosage forms | `database/medicine/` |
| Education | Schools, colleges, educational institutions and EIIN information | `database/education/` |
| Land Records | Land administration, survey information and available public records | `database/land/` |
| Law & Legal Information | Constitution, legislation, legal codes and public legal directories | `database/law/` |
| Healthcare | Hospitals, diagnostic centers, blood banks and ambulance services | `database/healthcare/` |
| Emergency Services | National hotlines, police, fire service and public contacts | `database/emergency/` |
| Transportation | Railway stations, trains, fares, routes and airports | `database/transport/` |
| Islamic Information | Quran, Hadith and prayer-time datasets | `database/Islamic/` |
| Government & Public Services | Ministries, departments and public service directories | `database/governance/` |
| Culture & Heritage | Historical locations, archaeological sites and heritage information | `database/culture/` |

*Dataset availability varies by category. Refer to the actual repository files for current coverage.*

## Standardized Hierarchy: Division > District > Upazila

To make finding information instant and intuitive, all regional datasets are organized under the standardized Bangladesh geographic hierarchy:

```text
database/<category>/[divisions/]<Division>/<District>/<Upazila>[.json]
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
database/
├── visualize/                   # React + Vite interactive search & visualizer portal
│   ├── src/
│   ├── public/data/             # Pre-indexed search and upazila bundle data
│   └── package.json
│
├── education/                   # 40,000+ Educational Institutions
│   ├── <Division>/
│   │   └── <District>/
│   │       └── <Upazila>/
│   │           ├── _summary.json
│   │           ├── school/
│   │           ├── college/
│   │           └── dakhil_madrasa/
│   └── education_hierarchy.json
│
├── healthcare/                  # 3,590+ Hospitals & Healthcare Facilities
│   ├── divisions/<Division>/<District>/<Upazila>.json
│   ├── hospitals.json
│   ├── blood_banks.json
│   └── ambulance_services.json
│
├── banking/                     # 8,750+ Bank Branches & Routing Numbers
│   ├── divisions/<Division>/<District>/<Upazila>.json
│   ├── branches.json
│   ├── routing_numbers.json
│   └── by_bank/
│
├── emergency/                   # Police, Fire Service & Hotlines
│   ├── divisions/<Division>/<District>/<Upazila>.json
│   ├── police_stations.json
│   ├── fire_stations.json
│   └── district_administration.json
│
├── geography/                   # Administrative divisions, districts, upazilas, unions
│   ├── divisions/<Division>/<District>/<Upazila>/info.json
│   ├── hierarchy.json
│   ├── postal_codes.json
│   └── unions.json
│
├── land/                        # 54,000+ Land Khatians & Mouza Maps
│   ├── khatians/<Division>/<District>/<Upazila>.json
│   └── maps/
│
├── Lawyer/                      # Bangladesh Bar Association Members
│   ├── divisions/<Division>/<District>/
│   └── dhaka_bar_association_members.json
│
├── transport/                   # Railway stations, airports, train routes
│   └── divisions/<Division>/<District>/
│
├── company/                     # DSE listed, BASIS IT companies, conglomerates
├── medicine/                    # 33,219 Medicines, 2,594 Generics, 1,233 Diseases/Indications
├── Islamic/                     # Quran, Hadith, Sunnah datasets
└── law/                         # Major Acts, Penal Code, CRPC
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

file_path = "database/geography/districts.json"

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
  "./database/banking/banks.json"
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
jq '.' database/geography/districts.json
```

Filter records when the relevant field exists:

```bash
jq '.[] | select(.district_name == "Dhaka")' \
  database/geography/upazilas.json
```

## Data Sources & References

Datasets are collected from publicly accessible information and sources where available.

Potential source organizations include:

- [Bangladesh Bank](https://www.bb.org.bd/) — Banking and financial information.
- [Bangladesh Bureau of Statistics](https://bbs.gov.bd/) — Population, census and statistical information.
- [Directorate General of Drug Administration](https://dgda.gov.bd/) — Pharmaceutical and medicine information.
- [Ministry of Education](https://moedu.gov.bd/) — Education-related information.
- [Ministry of Land](https://land.gov.bd/) — Land administration information.
- [Bangladesh Railway](https://railway.gov.bd/) — Railway information.
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
