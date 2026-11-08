@echo off
chcp 65001 > nul
title ePorcha UNLIMITED Multi-Threaded Land Records Downloader
cls
echo ======================================================================
echo       ePorcha UNLIMITED Land Records & Khatian PDF Downloader
echo          (Parallel Multi-Worker Engine - No Max Limit)
echo ======================================================================
echo.
python download_all.py
pause
