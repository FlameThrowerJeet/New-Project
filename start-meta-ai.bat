@echo off
echo ========================================
echo    META AI AUTOMATION SYSTEM
echo ========================================
echo.
echo Starting Meta AI system...
echo.
echo 1. Starting test server on port 3002...
echo 2. Starting React app on port 3000...
echo.
echo ========================================
echo.

REM Start the test server in the background
start "Meta AI Server" cmd /k "node test-server.js"

REM Wait a moment for server to start
timeout /t 3 /nobreak > nul

REM Start the React app with the correct script
start "React App" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo System started!
echo.
echo Meta AI Server: http://localhost:3002
echo React App: http://localhost:3000
echo.
echo Navigate to "9. Miina" in the cockpit
echo to use the Meta AI automation tool.
echo ========================================
echo.
pause 