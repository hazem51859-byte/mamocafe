@echo off
echo Killing any running node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting server from ZoTech_Market_POS_Windows folder...
cd /d "Z:\Downloads\Market\ZoTech_Market_POS_Windows"
".\runtime\node.exe" ".\server\index.js"
