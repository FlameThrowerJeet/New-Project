@echo off
echo.
echo 📺 TESTING OBS STREAM SYSTEM
echo =============================
echo.

echo 🔍 Checking if servers are running...
echo.

echo ✅ Testing OBS Stream Server (Port 8003)...
curl -s http://localhost:8003/health > nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ OBS Stream Server: ONLINE
) else (
    echo    ❌ OBS Stream Server: OFFLINE
)

echo.
echo ✅ Testing Main Server (Port 3001)...
curl -s http://localhost:3001 > nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Main Server: ONLINE
) else (
    echo    ❌ Main Server: OFFLINE
)

echo.
echo 🌐 Opening test URLs...
echo.
echo 📺 OBS Stream Server Interface: http://localhost:8003
start http://localhost:8003

echo.
echo 🏠 Main Application (Stream Page): http://localhost:3001
start http://localhost:3001

echo.
echo 💡 INSTRUCTIONS:
echo ================
echo 1. In the OBS server tab, you should see either:
echo    - OBS Live stream (if OBS Virtual Camera is enabled)
echo    - Test pattern (if OBS is not running)
echo.
echo 2. In the main app, go to "Stream" page to see the integrated OBS stream
echo.
echo 3. To enable OBS Virtual Camera:
echo    - Open OBS Studio
echo    - Go to Tools → Virtual Camera → Start
echo    - Refresh the stream pages
echo.
pause 