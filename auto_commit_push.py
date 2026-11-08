"""
Automatic Git Commit & Push for the Entire Database Folder
"""

import subprocess
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DATABASE_DIR = r"C:\Users\USER\Desktop\database"

def run_git(cmd):
    print(f"Running: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=DATABASE_DIR, capture_output=True, text=True, encoding='utf-8')
    if res.stdout:
        print(res.stdout.strip())
    if res.stderr:
        print(res.stderr.strip())
    return res.returncode == 0

def init_and_commit(remote_url=None):
    os.chdir(DATABASE_DIR)
    
    # 1. Init if needed
    if not os.path.exists(os.path.join(DATABASE_DIR, ".git")):
        print("Initializing git repository in database...")
        run_git(["git", "init"])
        run_git(["git", "branch", "-M", "main"])

    # 2. Check remote
    if remote_url:
        run_git(["git", "remote", "remove", "origin"])
        run_git(["git", "remote", "add", "origin", remote_url])

    # 3. Git Add
    print("Staging files...")
    run_git(["git", "add", "."])

    # 4. Commit
    print("Committing...")
    run_git(["git", "commit", "-m", "Add complete Bangladesh Database: land records, ePorcha khatians, education, healthcare, and explorer website"])

    # 5. Push if remote exists
    if remote_url:
        print("Pushing to remote...")
        run_git(["git", "push", "-u", "origin", "main"])

if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else None
    init_and_commit(url)
