"""
Commit and Push to GitHub repository: https://github.com/salman-anik/database
"""

import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

DATABASE_DIR = r"C:\Users\USER\Desktop\database"

def run(cmd):
    print(f">> {' '.join(cmd)}")
    p = subprocess.run(cmd, cwd=DATABASE_DIR, capture_output=True, text=True, encoding='utf-8')
    if p.stdout:
        print(p.stdout.strip())
    if p.stderr:
        print(p.stderr.strip())
    return p.returncode == 0

print("Committing database changes...")
run(["git", "commit", "-m", "Add React+Vite web app, comprehensive land & khatian metadata, and database services"])

print("Ensuring main branch...")
run(["git", "branch", "-M", "main"])

print("Pushing to GitHub remote...")
success = run(["git", "push", "-u", "origin", "main"])
if not success:
    print("Retrying with force if needed or pushing current branch...")
    run(["git", "push", "-u", "origin", "HEAD:main"])

print("Git push completed!")
