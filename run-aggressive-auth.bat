@echo off
echo 🔥 Starting AGGRESSIVE Meta AI Automation...
echo 💪 This version uses multiple methods to get past the auth page!
echo.

cd /d "C:\Users\Namit\Desktop\Pilot\Fogghya"

echo 📦 Installing dependencies if needed...
call npm install puppeteer --force

echo.
echo 🔥 Running AGGRESSIVE auth automation...
node aggressive-auth-automation.js

echo.
echo ✅ AGGRESSIVE automation completed!
pause 