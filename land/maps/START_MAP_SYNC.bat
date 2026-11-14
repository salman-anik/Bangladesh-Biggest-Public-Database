@echo off
chcp 65001 > nul
title Mouza Maps Continuous Zero-Disk Google Drive Sync
cd /d "%~dp0"
echo ============================================================================
echo   Bangladesh Mouza Maps Continuous Zero-Disk Google Drive Sync + GitHub Push
echo ============================================================================
python sync_gdrive_maps.py --workers 3 --limit-gb 0 --continuous --refresh-github --auto-push-github
echo.
echo Finished continuous sync.
pause
