@echo off
echo ========================================
echo    META AI SERVER ONLY
echo ========================================
echo.
echo Starting Meta AI test server...
echo.
echo Server will run on: http://localhost:3002
echo.
echo ========================================
echo.

REM Kill any existing process on port 3002
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Start the test server
node test-server.js

pause 