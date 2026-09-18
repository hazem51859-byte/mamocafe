@echo off
set "DIST=Z:\Downloads\Market\ZoTech_Market_POS_Windows"

echo Checking node.exe version...
"%DIST%\runtime\node.exe" --version

echo Removing extra runtime files...
if exist "%DIST%\runtime\node_v22.exe" del /f /q "%DIST%\runtime\node_v22.exe" && echo   deleted node_v22.exe
if exist "%DIST%\runtime\node_old.exe" del /f /q "%DIST%\runtime\node_old.exe" && echo   deleted node_old.exe

echo Removing DB session files...
if exist "%DIST%\server\market.db-shm" del /f /q "%DIST%\server\market.db-shm" && echo   deleted market.db-shm
if exist "%DIST%\server\market.db-wal" del /f /q "%DIST%\server\market.db-wal" && echo   deleted market.db-wal
if exist "%DIST%\server\market.db"     del /f /q "%DIST%\server\market.db"     && echo   deleted market.db

echo Removing test files...
if exist "%DIST%\server\test_workflow.js" del /f /q "%DIST%\server\test_workflow.js" && echo   deleted test_workflow.js

echo.
echo --- runtime contents ---
dir "%DIST%\runtime" /b
echo.
echo --- server files (no folders) ---
dir "%DIST%\server" /b /a:-d
echo.
echo DONE
