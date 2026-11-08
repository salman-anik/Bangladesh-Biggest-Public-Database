@echo off
chcp 65001 > nul
title ePorcha Dual-Mode PDF Repair (Auto 502 Fix)
cls
echo ======================================================================
echo          ePorcha PDF Repair & Ingestion Engine (502 Fix)
echo ======================================================================
echo.
python repair_failed_pdfs.py
pause
