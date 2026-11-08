@echo off
chcp 65001 > nul
title ePorcha Land Records & PDF Downloader
cls
echo ======================================================================
echo           ePorcha Land Records & Khatian PDF Downloader
echo                       Portal: eporcha.tech
echo ======================================================================
echo.
echo Select an option:
echo [1] Interactive Downloader (Select Division, District, Upazila, Mouza)
echo [2] Run Batch Ingestion (Download latest khatians across districts)
echo [3] View Land Records Summary
echo [4] Exit
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    python download_khatians.py --interactive
    pause
    exit /b
)
if "%choice%"=="2" (
    python download_khatians.py --batch --limit 15
    pause
    exit /b
)
if "%choice%"=="3" (
    type summary.json
    echo.
    pause
    exit /b
)
if "%choice%"=="4" (
    exit /b
)

echo Invalid choice.
pause
