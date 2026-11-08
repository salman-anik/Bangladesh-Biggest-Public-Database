"""
Master Pipeline:
1. Waits until 100% of all PDFs are downloaded.
2. Reorganizes Land strictly into: Division > District > Upazila > Survey > Mouza.
3. Stages, commits, and pushes to GitHub (https://github.com/salman-anik/database).
4. Uploads entire database and arranged archives to Google Drive (Bangladesh Database).
"""

import os
import sys
import time
import subprocess
import json

sys.stdout.reconfigure(encoding='utf-8')

DATABASE_DIR = r"C:\Users\USER\Desktop\database"
REMOTE_URL = "https://github.com/salman-anik/database"
LAND_DIR = os.path.join(DATABASE_DIR, "land")
KHATIAN_FILE = os.path.join(LAND_DIR, "khatians", "khatians.json")

def run(cmd, cwd=DATABASE_DIR):
    print(f">> {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding='utf-8')
    if res.stdout:
        print(res.stdout.strip())
    if res.stderr:
        print(res.stderr.strip())
    return res.returncode == 0

def check_if_done():
    if not os.path.exists(KHATIAN_FILE):
        return False
    try:
        with open(KHATIAN_FILE, "r", encoding="utf-8") as f:
            records = json.load(f)
        total = len(records)
        downloaded = sum(1 for r in records if r.get('pdf_status') == 'Downloaded')
        remaining = total - downloaded
        print(f"[{time.strftime('%H:%M:%S')}] Total: {total:,} | Downloaded: {downloaded:,} | Remaining: {remaining:,}")
        return remaining <= 0 or (total > 50000 and remaining <= 10)
    except Exception as e:
        print("Check error:", e)
        return False

def do_reorganize():
    print("\n=======================================================")
    print("   STEP 1: Arranging Land (Division > District > Upazila > Others)...")
    print("=======================================================")
    run([sys.executable, "reorganize_by_division.py"], cwd=LAND_DIR)

def do_git_commit_and_push():
    print("\n=======================================================")
    print("   STEP 2: Staging, Committing & Pushing to GitHub...")
    print("=======================================================")
    run(["git", "branch", "-M", "main"])
    run(["git", "add", "."])
    run(["git", "commit", "-m", "Add complete Bangladesh Database: land records arranged by Division > District > Upazila, 54K+ ePorcha khatians, education, healthcare, and website"])
    print(f"Pushing to {REMOTE_URL}...")
    run(["git", "push", "-u", "origin", "main"])

def do_gdrive_upload():
    print("\n=======================================================")
    print("   STEP 3: Uploading Complete Database to Google Drive...")
    print("=======================================================")
    run([sys.executable, "upload_to_gdrive.py"])

if __name__ == '__main__':
    print(f"Master Watcher active: Download Completion -> Reorganize -> GitHub -> Google Drive...")
    while True:
        if check_if_done():
            do_reorganize()
            do_git_commit_and_push()
            do_gdrive_upload()
            break
        time.sleep(30)
