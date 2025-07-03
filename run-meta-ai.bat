@echo off
echo ========================================
echo    META AI AUTOMATION TOOL
echo ========================================
echo.
echo This tool will automatically:
echo 1. Log into Instagram
echo 2. Navigate to Meta AI chat
echo 3. Upload Miina photos
echo 4. Request anime-style recreation
echo 5. Download generated images
echo.
echo Make sure you have:
echo - Instagram credentials ready
echo - Miina photos in client/public/images/Miina - Pics/
echo - Node.js and required packages installed
echo.
echo ========================================
echo.

set /p username="Enter Instagram username: "
set /p password="Enter Instagram password: "

echo.
echo Setting environment variables...
set INSTAGRAM_USERNAME=%username%
set INSTAGRAM_PASSWORD=%password%

echo.
echo Starting Meta AI automation...
node meta-ai-automation.js

echo.
echo ========================================
echo Automation completed!
echo Check client/public/images/miina-ai-generated/ for results
echo ========================================
pause 