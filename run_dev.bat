@echo off
set NODE_ENV=development
set PORT=5050
cd /d "z:\Downloads\Market\ZoTech_Market_POS_Windows"
".\runtime\node.exe" ".\server\index.js" > "C:\ProgramData\ZoTechPOS\out_dev.log" 2> "C:\ProgramData\ZoTechPOS\err_dev.log"
echo Process exited with code: %errorlevel% >> "C:\ProgramData\ZoTechPOS\err_dev.log"
