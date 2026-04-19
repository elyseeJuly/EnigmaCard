@echo off
set SCRIPT_DIR=%~dp0
set APP_DIR=%SCRIPT_DIR%..\app
set PORT=4173

cd /d "%APP_DIR%"
start http://127.0.0.1:%PORT%
python -m http.server %PORT%
