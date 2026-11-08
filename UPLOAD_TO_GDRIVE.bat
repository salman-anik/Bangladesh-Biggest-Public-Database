@echo off
chcp 65001 > nul
title Upload Database to Google Drive
cd /d "%~dp0"
echo ==============================================================
echo        Uploading Complete Database to Google Drive
echo        Folder: Bangladesh Database
echo ==============================================================
echo.
python upload_to_gdrive.py
pause
