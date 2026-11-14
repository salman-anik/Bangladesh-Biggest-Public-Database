@echo off
title Setup 24/7 GitHub Actions Cloud Mouza Map Sync
echo ============================================================================
echo  One-Time Setup: 24/7 Cloud Mouza Maps Sync (Runs When Your PC Is OFF)
echo ============================================================================
echo.
python "%~dp0land\maps\setup_github_cloud_sync.py"
pause
