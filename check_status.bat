@echo off
echo === Checking node.exe version ===
"Z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node.exe" --version

echo.
echo === Checking if server process is running ===
tasklist | findstr node

echo.
echo === Checking logs ===
if exist "C:\ProgramData\ZoTechPOS\out.log" (
    echo --- OUT LOG ---
    type "C:\ProgramData\ZoTechPOS\out.log"
) else (
    echo No out.log found at C:\ProgramData\ZoTechPOS\
)

echo.
if exist "C:\ProgramData\ZoTechPOS\err.log" (
    echo --- ERR LOG ---
    type "C:\ProgramData\ZoTechPOS\err.log"
) else (
    echo No err.log found
)

echo.
echo === Testing port 5050 ===
netstat -ano | findstr :5050

pause
