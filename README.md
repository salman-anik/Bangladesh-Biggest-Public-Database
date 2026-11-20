# Bangladesh Biggest Public Database

### A Community-Driven Comprehensive National Data Repository & Bangla AI Hub

Explore structured, verified Bangladesh datasets covering geography, economy, fisheries, livestock, employment, infrastructure, energy, disaster management, trade, urban development, environment, medicine, banking, law, and artificial intelligence.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Community%20Maintained-brightgreen.svg)](#)
[![Formats](https://img.shields.io/badge/Data-JSON%20%7C%20CSV%20%7C%20GeoJSON-blue.svg)](#)
[![Country](https://img.shields.io/badge/Country-Bangladesh-green.svg)](#)
[![Categories](https://img.shields.io/badge/Categories-31%20Subject%20Areas-orange.svg)](#)

**Repository:** [salman-anik/Bangladesh-Biggest-Public-Database](https://github.com/salman-anik/Bangladesh-Biggest-Public-Database) | **Live Visualizer (Next.js on Vercel):** [bangladesh-biggest-public-database.vercel.app](https://bangladesh-biggest-public-database.vercel.app)

---

## About This Project

The **Bangladesh Biggest Public Database** is a national-scale open data initiative to collect, standardize, validate, and share publicly accessible open datasets about Bangladesh in machine-readable formats (JSON, CSV, GeoJSON).

Information in Bangladesh is traditionally fragmented across PDF statistical bulletins, departmental portals, gazettes, and academic research papers. This project aggregates this knowledge into standardized, reproducible, and verifiable formats with strict provenance attribution, automated JSON Schema validation, and UTF-8 encoding.

### Core Objectives:
- **Comprehensive National Scope**: 31 subject categories spanning macroeconomics, labor, energy, biodiversity, agriculture, and urban infrastructure.
- **Dedicated Bangla AI & Machine Learning Hub**: Curated corpora, speech recordings, OCR, and NLP benchmarks for researchers building AI systems for Bangladesh.
- **Strict Provenance & Verification**: Every dataset carries verified metadata tracking official source URLs, dates, record counts, and verification status (`verified`, `partially_verified`, `unverified`, `source_only`).
- **Developer-Ready**: Machine-readable JSON and CSV files ready for direct integration into Python (pandas/PyTorch), JavaScript, R, and SQL workflows.

---

## Dataset Categories (31 Subject Areas)

| Category | Coverage & Highlights | Directory |
|---|---|---|
| **Fisheries & Aquaculture** *(New)* | 40 fish species, division production (capture/culture/marine), water body areas | [`fisheries/`](./fisheries/) |
| **Livestock & Poultry** *(New)* | Cattle, buffalo, goat, sheep, poultry populations by division; milk/meat/egg trends | [`livestock/`](./livestock/) |
| **Employment & Labor Market** *(New)* | BBS LFS 2022/2024 indicators, BSCO occupations, minimum wage gazettes, BMET overseas migration | [`employment/`](./employment/) |
| **Roads & Infrastructure** *(New)* | RHD national highways (N1-N8), signature bridges/tunnels, seaports, river ports, railway zones | [`infrastructure/`](./infrastructure/) |
| **Energy & Utilities** *(New)* | Major grid power plants, fuel mix, DESCO/DPDC/BREB utility metrics, Petrobangla gas fields | [`energy/`](./energy/) |
| **Rivers & Disasters** *(New)* | 10 major river systems, BWDB water level danger stations, historical cyclones (1970-2024), cyclone shelters | [`disasters/`](./disasters/) |
| **Trade & Commerce** *(New)* | Macro trade balance, HS commodity exports (RMG, jute, leather), top market countries, BEPZA EPZs | [`trade/`](./trade/) |
| **Housing & Urban Dev** *(New)* | 12 City Corporations, Census 2022 housing structure types, urban-rural population splits | [`housing/`](./housing/) |
| **Environment & Biodiversity** *(New)* | Forest land cover types, National Parks and Wildlife Sanctuaries, IUCN Red List status | [`biodiversity/`](./biodiversity/) |
| **Bangla AI & ML Hub** *(New)* | 18 curated benchmarks: text corpora, parallel translation, ASR, OCR, sentiment, dialects | [`bangla_ai/`](./bangla_ai/) |
| **Geography & Administration** | 8 divisions, 64 districts, 494 upazilas, 4,540 unions, 12 city corporations, 1,368 postcodes, GeoJSONs | [`geography/`](./geography/) |
| **Demographics & Census** | BBS Census & SVRS District Statistics (64 districts) and statistical yearbooks | [`demographics/`](./demographics/) |
| **Economy & Macro** | BBS macro indicators (CPI/inflation, GDP growth) and National Accounts | [`economy/`](./economy/) |
| **Banking & Finance** | 62 banks, 8,751 branches, 8,747 BEFTN routing numbers, and MFS providers | [`banking/`](./banking/) |
| **Companies & Businesses** | 3,344 companies: 409 DSE listed, 2,882 BASIS IT members, conglomerates, startups | [`company/`](./company/) |
| **Medicine & Pharmaceuticals** | 33,219 medicines, 1,233 diseases/indications, 2,594 generics, 435 manufacturers | [`medicine/`](./medicine/) |
| **Education** | 40,000+ schools, colleges, madrasas, EIIN, and teacher rosters by division/district/upazila | [`education/`](./education/) |
| **Universities & Higher Ed** | 185 UGC-listed universities (Public, Private, International) | [`universities/`](./universities/) |
| **Agriculture & Crops** | 64 district profiles, 117 BBS crop reports, and 134 DAE resources | [`agriculture/`](./agriculture/) |
| **Climate & Weather** | BMD weather station history (48 stations, 576 records) and normals | [`climate/`](./climate/) |
| **Environment & Pollution** | DoE daily AQI reports (14 cities) and surface water quality metrics | [`environment/`](./environment/) |
| **Elections & Constituencies** | 300 parliamentary constituencies and 63 registered political parties | [`elections/`](./elections/) |
| **Government Procurement** | BPPA/CPTU e-GP public procurement contract awards by division/district | [`procurement/`](./procurement/) |
| **Land Records & Mouza Maps** | 93,953 ePorcha khatians, 171,877 mouzas & 226,157 online Mouza maps | [`land/`](./land/) |
| **Law & Legal Information** | Constitution by Part, Penal Code 1860, CrPC 1898, and major national acts | [`law/`](./law/) |
| **Lawyers Directory** | 34,591 Dhaka Bar Association members by status | [`Lawyer/`](./Lawyer/) |
| **Healthcare** | 3,590 hospitals, diagnostic centers, doctors, blood banks, and ambulances | [`healthcare/`](./healthcare/) |
| **Emergency Services** | National hotlines, 76 police stations, 67 fire stations, and district administration | [`emergency/`](./emergency/) |
| **Transportation** | Railway stations, station phones, intercity trains, bus/launch routes, airports | [`transport/`](./transport/) |
| **Islamic Information** | Quran, Hadith collections, and Fiqh/Sunnah datasets | [`Islamic/`](./Islamic/) |
| **Governance & Public Services** | 494 Upazilas UNO portals, 64 DC portals, 15 ministries, citizen e-services | [`governance/`](./governance/) |

*See [`DATASET_CATALOG.md`](./DATASET_CATALOG.md) for full metadata and row count metrics.*

---

## Bangla AI & Machine Learning Hub (`bangla_ai/`)

A dedicated hub for AI researchers, NLP practitioners, and ML engineers working on Bengali language technologies:

```python
from datasets import load_dataset

# 1. Load SentNoB Sentiment Dataset
sentiment_ds = load_dataset("Universal-SentNoB/SentNoB")

# 2. Stream large Bangla text corpus (2B+ tokens)
c4_bn = load_dataset("allenai/c4", "bn", split="train", streaming=True)

# 3. Load Bangla Reading Comprehension QA
qa_ds = load_dataset("csebuetnlp/banglarqa")
```

Explore [`bangla_ai/README.md`](./bangla_ai/README.md) for the complete index across NLP, speech recognition (Common Voice), handwriting (BanglaLekha), OCR, and regional dialects.

---

## Data Standards & Validation

Every dataset in this repository adheres to the **Dataset Metadata Schema** defined in [`schemas/dataset.schema.json`](./schemas/dataset.schema.json).

### Validation Utilities:
```bash
# Validate JSON/CSV syntax and metadata schemas
python scripts/validate_datasets.py

# Calculate live repository statistics and record counts
python scripts/calculate_dataset_statistics.py

# Detect duplicates across records
python scripts/detect_duplicates.py
```

### Verification States:
- **`verified`**: Numbers match official government releases, statistical yearbooks, or peer-reviewed academic publications.
- **`partially_verified`**: Data matches official national/divisional aggregates with minor sub-indicator interpolations.
- **`unverified`**: Community submission pending authoritative cross-referencing.
- **`source_only`**: Access links, schemas, and instructions provided when redistribution is restricted by licensing or file size.

---

## Contributing

Contributions from developers, researchers, students, and data scientists are welcome. Please read our **[Contribution Guidelines](./CONTRIBUTING.md)** and **[Dataset Schema Specifications](./DATASET_SCHEMA.md)** before submitting pull requests.

---

## License

The repository code, scripts, schemas, and documentation are licensed under the **[MIT License](LICENSE)**. Individual datasets preserve their original source licensing and attribution (Open Government Data Bangladesh, CC-BY-4.0, Public Domain). Consult individual dataset metadata in [`metadata/`](./metadata/) for details.

---

**Project Maintainer: [Salman Anik](https://github.com/salman-anik)**  
Computer Science & Engineering Student | Data Science Enthusiast | Open Source Maintainer
