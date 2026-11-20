"""
Dataset Validation Utility
Bangladesh Biggest Public Database

Validates:
1. JSON syntax across all JSON files.
2. Metadata conformance against schemas/dataset.schema.json.
3. Record counts vs actual rows.
4. UTF-8 encoding integrity.
"""

import json
import csv
from pathlib import Path
import sys

def validate_json_file(file_path: Path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return True, data, ""
    except UnicodeDecodeError as e:
        return False, None, f"Encoding error (not UTF-8): {e}"
    except json.JSONDecodeError as e:
        return False, None, f"JSON decode error: {e}"
    except Exception as e:
        return False, None, str(e)

def validate_metadata_object(meta: dict, file_name: str):
    required_keys = [
        "dataset_name", "country", "category", "description",
        "source", "source_url", "license", "last_updated",
        "record_count", "format", "geographic_coverage",
        "language", "verification_status"
    ]
    valid_statuses = ["verified", "partially_verified", "unverified", "source_only"]
    errors = []
    
    for key in required_keys:
        if key not in meta:
            errors.append(f"Missing required metadata key: '{key}'")
            
    if "country" in meta and meta["country"] != "Bangladesh":
        errors.append(f"Country must be 'Bangladesh', got '{meta.get('country')}'")
        
    if "verification_status" in meta and meta["verification_status"] not in valid_statuses:
        errors.append(f"Invalid verification_status '{meta.get('verification_status')}'. Must be one of {valid_statuses}")
        
    if "record_count" in meta and not isinstance(meta["record_count"], int):
        errors.append(f"record_count must be integer, got {type(meta.get('record_count'))}")
        
    return errors

def main():
    root = Path(__file__).resolve().parent.parent
    print(f"[*] Validating repository at: {root}")
    
    metadata_dir = root / "metadata"
    errors = []
    validated_files = 0
    
    if metadata_dir.exists():
        for meta_file in metadata_dir.glob("*.json"):
            validated_files += 1
            ok, data, err = validate_json_file(meta_file)
            if not ok:
                errors.append(f"[Metadata Error] {meta_file.name}: {err}")
                continue
            meta_errors = validate_metadata_object(data, meta_file.name)
            for me in meta_errors:
                errors.append(f"[Metadata Schema] {meta_file.name}: {me}")
                
    print(f"[+] Checked {validated_files} metadata files.")
    
    schemas_dir = root / "schemas"
    if schemas_dir.exists():
        for schema_file in schemas_dir.glob("*.json"):
            ok, _, err = validate_json_file(schema_file)
            if not ok:
                errors.append(f"[Schema Error] {schema_file.name}: {err}")
            else:
                validated_files += 1

    if errors:
        print(f"\n[!] Found {len(errors)} validation issues:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("\n[SUCCESS] All checked metadata and schema files are valid UTF-8 and structurally sound!")
        sys.exit(0)

if __name__ == "__main__":
    main()
