@echo off
set "DIST=Z:\Downloads\Market\ZoTech_Market_POS_Windows"
set "NODE=%DIST%\runtime\node.exe"
set "SERVER=%DIST%\server"

echo Checking node version...
"%NODE%" --version

echo.
echo Checking if npm is available on system...
where npm
if errorlevel 1 (
    echo npm not found in PATH - trying with node directly
)

echo.
echo Rebuilding better-sqlite3 for Node v22...
cd /d "%SERVER%"

:: Try system npm first
npm rebuild better-sqlite3 --runtime=node --target=22.23.1 --dist-url=https://nodejs.org/dist

echo.
echo Verifying better-sqlite3 loads correctly...
"%NODE%" -e "try { require('./node_modules/better-sqlite3'); console.log('OK - better-sqlite3 works with Node v22'); } catch(e) { console.error('FAIL:', e.message); }"

echo.
echo DONE
