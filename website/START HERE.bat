@echo off
title Bangladesh Database Explorer
cd /d "%~dp0"

echo =========================================
echo   Bangladesh Database Explorer
echo =========================================
echo   Starting local server...
echo   Browser will open automatically.
echo.
echo   Press Ctrl+C in this window to stop.
echo =========================================
echo.

python "start_server.py"
if errorlevel 1 (
    echo.
    echo Trying py launcher...
    py "start_server.py"
)

if errorlevel 1 (
    echo.
    echo [ERROR] Neither python nor py command succeeded.
    echo Please make sure Python is installed and added to PATH.
    pause
)
