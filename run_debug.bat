@echo off
set NODE_ENV=production
set ENFORCE_ACTIVATION=true
set PORT=5050
cd /d "z:\Downloads\Market\ZoTech_Market_POS_Windows"
".\runtime\node.exe" ".\server\index.js" > "C:\ProgramData\ZoTechPOS\out.log" 2> "C:\ProgramData\ZoTechPOS\err.log"
echo Process exited with code: %errorlevel% >> "C:\ProgramData\ZoTechPOS\err.log"
