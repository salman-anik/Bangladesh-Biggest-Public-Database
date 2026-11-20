# Dataset Metadata Schema & Standards

This document outlines the standard metadata schema and data quality rules for datasets in the **Bangladesh Biggest Public Database** repository.

---

## 1. Metadata Schema (`schemas/dataset.schema.json`)

Every dataset in the repository must be accompanied by a standardized metadata record (either embedded within the dataset's `_metadata` key or alongside it as a dedicated `.meta.json` file in `metadata/`).

### Standard JSON Schema

```json
{
  "dataset_name": "Marine & Inland Fisheries Production by Division",
  "country": "Bangladesh",
  "category": "Fisheries",
  "subcategory": "Production",
  "description": "Annual production of inland (capture and culture) and marine fisheries by administrative division in metric tons.",
  "source": "Department of Fisheries (DoF), Ministry of Fisheries and Livestock",
  "source_url": "https://fisheries.gov.bd/",
  "license": "Open Government Data Bangladesh / Public Domain",
  "last_updated": "2026-11-20",
  "record_count": 8,
  "format": ["JSON", "CSV"],
  "geographic_coverage": "Division",
  "language": ["English", "Bangla"],
  "verification_status": "verified"
}
```

---

## 2. Field Definitions

| Field | Type | Required | Description |
|---|---|---|---|
| `dataset_name` | String | Yes | Human-readable title of the dataset. |
| `country` | String | Yes | Must be `"Bangladesh"`. |
| `category` | String | Yes | Primary category (e.g., `Fisheries`, `Livestock`, `Employment`, `Infrastructure`, `Energy`, `Disasters`, `Trade`, `Housing`, `Environment`, `Bangla AI`). |
| `subcategory` | String | No | Secondary topic (e.g., `Aquaculture`, `Labor Force`, `Power Generation`, `NLP`). |
| `description` | String | Yes | Summary of data contents, collection methodology, and notes. |
| `source` | String | Yes | Official agency, department, or research organization. |
| `source_url` | String (URI) | Yes | Direct official web portal or publication link. |
| `license` | String | Yes | Dataset license or reuse conditions. |
| `last_updated` | String | Yes | Date of last verification formatted as `YYYY-MM-DD`. |
| `record_count` | Integer | Yes | Actual count of records in the dataset (never fabricated). |
| `format` | Array[String]| Yes | Formats provided: `["JSON", "CSV", "GeoJSON", "Parquet", "PDF"]`. |
| `geographic_coverage`| String | Yes | Granularity: `National`, `Division`, `District`, `Upazila`, `Union`, `City Corporation`, `Station-based`. |
| `language` | Array[String]| Yes | `["English"]`, `["Bangla"]`, or `["English", "Bangla"]`. |
| `verification_status`| String | Yes | One of the 4 valid states: `verified`, `partially_verified`, `unverified`, `source_only`. |
| `citation` | String | No | Suggested formal academic citation. |

---

## 3. Verification States

To maintain strict data integrity, every dataset is assigned one of four verification statuses:

1. **`verified`**: Data was collected directly from an official government release, statistical bulletin, verified API, or peer-reviewed publication. Numbers match primary sources.
2. **`partially_verified`**: Data matches official aggregates or sample points, but some historical series or sub-indicators are interpolated or combined from secondary reports.
3. **`unverified`**: Public community dataset submitted without an authoritative government cross-reference; pending verification.
4. **`source_only`**: The dataset cannot be legally redistributed in this repository due to third-party copyright or file size constraints, but complete links, access instructions, and schema definitions are documented.

---

## 4. Quality Rules

- **UTF-8 Encoding**: All Bangla characters must be properly UTF-8 encoded without broken byte sequences or legacy ANSI conversions.
- **No Fabricated Records**: If a district or upazila's official statistic is unavailable, leave as `null` or record as missing; do not make up placeholder numbers.
- **Proven Provenance**: Always link back to the exact publication, report number, or official portal.
- **Deterministic Schema**: CSV columns and JSON object keys must use standard snake_case naming (`district_name`, `production_mt`, `fiscal_year`).
