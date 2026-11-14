@echo off
chcp 65001 > nul
title Mouza Maps Zero-Disk Google Drive Sync
cd /d "%~dp0"
echo ============================================================================
echo   Bangladesh Mouza Maps Zero-Disk Google Drive Sync + GitHub Link Updater
echo ============================================================================
python sync_gdrive_maps.py --workers 3 --limit-gb 700 --refresh-github
echo.
echo Finished batch. Run git add/commit/push in repo root to publish updated links.
pause
