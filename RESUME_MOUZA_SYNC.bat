@echo off
title Bangladesh Mouza Maps - Fast Local Sync (8 Workers)
echo Starting/Resuming Bangladesh 2.33 TB Mouza Maps Sync to Google Drive (8 parallel workers)...
echo Progress is saved automatically in %LOCALAPPDATA%\BangladeshMouzaSync\sync_state.db
python -u "%~dp0land\maps\sync_gdrive_maps.py" --workers 8 --limit-gb 0 --continuous --refresh-github --auto-push-github
pause
