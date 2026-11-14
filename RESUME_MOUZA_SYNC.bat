@echo off
title Bangladesh Mouza Maps - Google Drive Continuous Sync
echo Starting/Resuming Bangladesh 2.33 TB Mouza Maps Sync to Google Drive...
echo Progress is saved automatically in %LOCALAPPDATA%\BangladeshMouzaSync\sync_state.db
python -u "%~dp0land\maps\sync_gdrive_maps.py" --workers 3 --limit-gb 0 --continuous --refresh-github --auto-push-github
pause
