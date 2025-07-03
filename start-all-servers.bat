@echo off
echo 🚀 Starting All Servers...

REM Kill any existing processes on ports 3001 and 8003
echo 🔄 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Killing process %%a on port 3001
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8003') do (
    echo Killing process %%a on port 8003  
    taskkill /f /pid %%a >nul 2>&1
)

echo ⏳ Starting servers...

REM Start OBS Stream Server
start "OBS Stream Server" cmd /k "echo 📺 OBS Stream Server Starting... && node obs-stream-server-fixed.js"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Main Server  
start "Main Server" cmd /k "echo 🌐 Main Server Starting... && node server.js"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Open website
echo 🌐 Opening website...
start http://localhost:3001

echo ✅ All servers started!
echo 📺 OBS Server: http://localhost:8003
echo 🌐 Main Server: http://localhost:3001
echo.
echo Press any key to continue...
pause >nul 