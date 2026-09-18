@echo off
"z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node.exe" --version > "C:\ProgramData\ZoTechPOS\version.log" 2>&1
echo Exit: %errorlevel% >> "C:\ProgramData\ZoTechPOS\version.log"
