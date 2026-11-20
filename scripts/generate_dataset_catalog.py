"""
Generate Dataset Catalog
Bangladesh Biggest Public Database

Reads all metadata records from metadata/ and builds a comprehensive
markdown dataset catalog (DATASET_CATALOG.md).
"""

import json
from pathlib import Path

def generate_catalog():
    root = Path(__file__).resolve().parent.parent
    metadata_dir = root / "metadata"
    
    if not metadata_dir.exists():
        print("[!] metadata/ directory not found.")
        return
        
    datasets_by_category = {}
    
    for meta_file in sorted(metadata_dir.glob("*.json")):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta = json.load(f)
            cat = meta.get("category", "General")
            if cat not in datasets_by_category:
                datasets_by_category[cat] = []
            datasets_by_category[cat].append(meta)
        except Exception as e:
            print(f"Error parsing {meta_file}: {e}")
            
    lines = [
        "# Bangladesh National Open Data Catalog",
        "",
        "This catalog provides an index of all standardized datasets in this repository with official sources, record counts, and verification states.",
        "",
        "---",
        ""
    ]
    
    for cat, datasets in sorted(datasets_by_category.items()):
        lines.append(f"## {cat}")
        lines.append("")
        lines.append("| Dataset Name | Records | Coverage | Source | Status | Formats |")
        lines.append("|---|---|---|---|---|---|")
        for d in sorted(datasets, key=lambda x: x.get("dataset_name", "")):
            name = d.get("dataset_name", "N/A")
            records = f"{d.get('record_count', 0):,}"
            cov = d.get("geographic_coverage", "National")
            source = f"[{d.get('source', 'Official')}]({d.get('source_url', '#')})"
            status = f"`{d.get('verification_status', 'unverified')}`"
            formats = " / ".join(d.get("format", ["JSON"]))
            lines.append(f"| **{name}** | {records} | {cov} | {source} | {status} | {formats} |")
        lines.append("")
        
    out_file = root / "DATASET_CATALOG.md"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"[+] Successfully generated catalog at: {out_file}")

if __name__ == "__main__":
    generate_catalog()
