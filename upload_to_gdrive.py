"""
Automated Google Drive Uploader for Bangladesh Database
Parent Folder: Bangladesh Database (ID: 1NFsDEfd9sJ2Ln3CyqD3HNYz9C4d3tjdb)
"""

import os
import sys
import subprocess
import shutil
import zipfile
import json
import time

sys.stdout.reconfigure(encoding='utf-8')

DATABASE_DIR = r"C:\Users\USER\Desktop\database"
GDRIVE_PARENT_ID = "1NFsDEfd9sJ2Ln3CyqD3HNYz9C4d3tjdb"

def run_gdrive(cmd):
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    return res.stdout.strip() if res.returncode == 0 else None

def create_gdrive_folder(name, parent_id):
    out = run_gdrive(["gdrive", "mutate", "mkdir", name, "--parent", parent_id])
    if out and "ID:" in out:
        # e.g. Created folder: name (ID: xyz)
        return out.split("ID:")[1].strip().rstrip(")")
    return None

def upload_file(local_path, parent_id):
    print(f"   [↑] Uploading {os.path.basename(local_path)}...")
    res = subprocess.run(
        ["gdrive", "mutate", "upload", local_path, "--parent", parent_id],
        capture_output=True, text=True, encoding='utf-8'
    )
    if res.returncode == 0:
        print(f"       ✓ {os.path.basename(local_path)} uploaded.")
        return True
    else:
        print(f"       [!] Upload error for {os.path.basename(local_path)}: {res.stderr.strip()}")
        return False

def zip_folder(source_dir, output_zip_path):
    print(f"\n--> Compressing {os.path.basename(source_dir)} into {os.path.basename(output_zip_path)}...")
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED, allowZip64=True) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                zipf.write(full_path, rel_path)
    size_mb = os.path.getsize(output_zip_path) / (1024 * 1024)
    print(f"    ✓ Archive created: {size_mb:.2f} MB")
    return output_zip_path

def upload_all_database():
    print("=" * 70)
    print("      Starting Google Drive Database Upload")
    print(f"      Target: Google Drive / Bangladesh Database (ID: {GDRIVE_PARENT_ID})")
    print("=" * 70)

    # 1. Upload All Core JSON/Data Folders
    core_folders = [
        "banking", "education", "emergency", "geography", "governance",
        "healthcare", "heritage", "Islamic", "law", "Lawyer", "medicine",
        "transport", "website"
    ]

    for folder_name in core_folders:
        folder_path = os.path.join(DATABASE_DIR, folder_name)
        if not os.path.exists(folder_path):
            continue

        print(f"\n[Processing {folder_name} folder]...")
        # Zip folder for clean, high-speed single upload
        zip_path = os.path.join(DATABASE_DIR, f"{folder_name}_data.zip")
        try:
            zip_folder(folder_path, zip_path)
            upload_file(zip_path, GDRIVE_PARENT_ID)
        finally:
            if os.path.exists(zip_path):
                os.remove(zip_path)

    # 2. Upload Land Records: metadata, master khatians.json/csv, scripts
    print("\n[Processing Land Records]...")
    land_dir = os.path.join(DATABASE_DIR, "land")
    
    # Upload Land Metadata & Databases
    for sub in ["summary.json", "README.md"]:
        fpath = os.path.join(land_dir, sub)
        if os.path.exists(fpath):
            upload_file(fpath, GDRIVE_PARENT_ID)

    # Zip khatians database & metadata
    land_data_zip = os.path.join(DATABASE_DIR, "land_databases_and_metadata.zip")
    with zipfile.ZipFile(land_data_zip, 'w', zipfile.ZIP_DEFLATED, allowZip64=True) as z:
        for folder in ["metadata", "khatians"]:
            full_f = os.path.join(land_dir, folder)
            if os.path.exists(full_f):
                for root, dirs, files in os.walk(full_f):
                    for file in files:
                        full_p = os.path.join(root, file)
                        rel_p = os.path.relpath(full_p, land_dir)
                        z.write(full_p, rel_p)
    upload_file(land_data_zip, GDRIVE_PARENT_ID)
    if os.path.exists(land_data_zip):
        os.remove(land_data_zip)

    # 3. Zip and upload Land PDFs by District
    pdfs_dir = os.path.join(land_dir, "pdfs")
    if os.path.exists(pdfs_dir):
        print("\n[Compressing & Uploading Land PDFs by District]...")
        districts = [d for d in os.listdir(pdfs_dir) if os.path.isdir(os.path.join(pdfs_dir, d))]
        for dist in districts:
            dist_path = os.path.join(pdfs_dir, dist)
            zip_name = f"PDFs_{dist}.zip"
            dist_zip = os.path.join(DATABASE_DIR, zip_name)
            try:
                zip_folder(dist_path, dist_zip)
                upload_file(dist_zip, GDRIVE_PARENT_ID)
            finally:
                if os.path.exists(dist_zip):
                    os.remove(dist_zip)

    print("\n" + "=" * 70)
    print("      ALL DATABASE FILES & PDFS UPLOADED TO GOOGLE DRIVE!")
    print("=" * 70)

if __name__ == '__main__':
    upload_all_database()
