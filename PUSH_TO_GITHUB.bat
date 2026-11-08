@echo off
chcp 65001 > nul
title Push Database to GitHub
cd /d "%~dp0"
echo ==============================================================
echo        Pushing Entire Database to GitHub
echo        Repo: https://github.com/salman-anik/database
echo ==============================================================
echo.
git branch -M main
echo 1. Staging all files...
git add .
echo.
echo 2. Committing...
git commit -m "Add complete Bangladesh Database: land records, 54K+ ePorcha khatians, and website portal"
echo.
echo 3. Pushing to GitHub (main)...
git push -u origin main
echo.
echo ==============================================================
pause
