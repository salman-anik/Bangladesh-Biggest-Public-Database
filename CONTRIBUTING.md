# Contributing to Bangladesh Biggest Public Database

Thank you for helping build Bangladesh's most comprehensive and accessible open-source national data repository!

Whether you are contributing a new public dataset, reporting an outdated number, adding metadata, or building automation scripts, your contributions are invaluable.

---

## Guidelines for Dataset Contributions

### 1. Source Authenticity & Licensing
- **Authoritative Sources**: Prioritize official public publications from Bangladesh government ministries, departments, and directorates (BBS, Bangladesh Bank, DoF, DLS, BPDB, RHD, BMD, BWDB, EPB, etc.) or reputable international organizations (World Bank, UN, FAO, UNESCO).
- **Redistribution Rights**: Check the source's reuse and copyright policy. If a dataset cannot be freely redistributed under an open license, submit a **`source_only`** metadata entry with instructions and official URLs rather than redistributing raw files.
- **No Fabrication**: Under no circumstances should fake, synthesized, or hallucinated numbers be submitted.

### 2. Standardization & Schema
- Every new dataset must have a corresponding metadata record conforming to `schemas/dataset.schema.json`.
- Provide data in **JSON** (and **CSV** where applicable for tabular data).
- Use `UTF-8` character encoding for all Bangla strings.
- Field names must be consistent `snake_case` (e.g., `division_name`, `district_name`, `production_mt`).
- For regional datasets, adhere to the standard hierarchy:
  ```text
  <category>/[divisions/]<Division>/<District>/<Upazila>[.json]
  ```

### 3. Verification Status
Assign an accurate verification state:
- `verified`
- `partially_verified`
- `unverified`
- `source_only`

---

## Step-by-Step Contribution Workflow

1. **Fork the Repository**:
   Click Fork on [salman-anik/Bangladesh-Biggest-Public-Database](https://github.com/salman-anik/Bangladesh-Biggest-Public-Database).

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/add-fisheries-hatcheries
   ```

3. **Add Data and Metadata**:
   - Place your dataset in the appropriate directory (e.g., `fisheries/`).
   - Add the metadata block or file in `metadata/`.

4. **Run Local Validation**:
   ```bash
   python scripts/validate_datasets.py
   python scripts/detect_duplicates.py
   ```

5. **Commit and Push**:
   ```bash
   git commit -m "feat(fisheries): add district-wise fish hatchery statistics (DoF 2024)"
   git push origin feature/add-fisheries-hatcheries
   ```

6. **Submit a Pull Request**:
   Describe the dataset, official source URL, date of release, and number of records in your PR description.
