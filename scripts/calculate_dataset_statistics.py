"""
Calculate Dataset Statistics
Bangladesh Biggest Public Database

Analyzes all categories, counts datasets, computes total records,
and produces breakdown reports.
"""

import json
from pathlib import Path

def analyze_repository():
    root = Path(__file__).resolve().parent.parent
    stats = {
        "categories": {},
        "total_datasets": 0,
        "total_records": 0,
        "format_breakdown": {"JSON": 0, "CSV": 0, "Other": 0},
        "verification_breakdown": {
            "verified": 0,
            "partially_verified": 0,
            "unverified": 0,
            "source_only": 0
        }
    }
    
    metadata_dir = root / "metadata"
    if metadata_dir.exists():
        for meta_file in metadata_dir.glob("*.json"):
            try:
                with open(meta_file, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                cat = meta.get("category", "General")
                rec = meta.get("record_count", 0)
                status = meta.get("verification_status", "unverified")
                formats = meta.get("format", ["JSON"])
                
                stats["total_datasets"] += 1
                stats["total_records"] += rec
                
                if cat not in stats["categories"]:
                    stats["categories"][cat] = {"datasets": 0, "records": 0}
                stats["categories"][cat]["datasets"] += 1
                stats["categories"][cat]["records"] += rec
                
                stats["verification_breakdown"][status] = stats["verification_breakdown"].get(status, 0) + 1
                
                for fmt in formats:
                    if fmt in stats["format_breakdown"]:
                        stats["format_breakdown"][fmt] += 1
                    else:
                        stats["format_breakdown"]["Other"] += 1
            except Exception as e:
                print(f"Warning reading {meta_file}: {e}")
                
    return stats

def main():
    stats = analyze_repository()
    print("==================================================")
    print(" BANGLADESH BIGGEST PUBLIC DATABASE - STATISTICS ")
    print("==================================================")
    print(f"Total Indexed Datasets : {stats['total_datasets']}")
    print(f"Total Measured Records : {stats['total_records']:,}")
    print("\n--- Category Breakdown ---")
    for cat, data in sorted(stats["categories"].items()):
        print(f"  * {cat:30}: {data['datasets']} datasets | {data['records']:,} records")
    print("\n--- Verification Breakdown ---")
    for status, count in stats["verification_breakdown"].items():
        print(f"  * {status:20}: {count} datasets")
    print("\n--- Format Breakdown ---")
    for fmt, count in stats["format_breakdown"].items():
        print(f"  * {fmt:10}: {count}")
    print("==================================================")

if __name__ == "__main__":
    main()
