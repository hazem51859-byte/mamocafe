@echo off
echo === Killing any running node processes ===
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo === Current node.exe version (before) ===
"Z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node.exe" --version

echo === Replacing node.exe with v22 ===
copy /B /Y "Z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node_v22.exe" "Z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node.exe"
if errorlevel 1 (
    echo FAILED to copy!
    pause
    exit /b 1
)

echo === New node.exe version (after) ===
"Z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node.exe" --version

echo === Also update tools\cache\node-win-x64.exe ===
copy /B /Y "Z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node_v22.exe" "Z:\Downloads\Market\tools\cache\node-win-x64.exe"

echo === Done! Now starting server ===
cd /d "Z:\Downloads\Market\ZoTech_Market_POS_Windows"
".\runtime\node.exe" ".\server\index.js"
