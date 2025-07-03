@echo off
echo.
echo 🎨 MIINA ANIME GENERATION USING ANIMEGANV2 (FIXED)
echo ================================================
echo.

echo 🔍 Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.6+
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo 🔍 Validating setup...
python animeganv2-batch-processor-fixed.py --check-only
if %errorlevel% neq 0 (
    echo ❌ Setup validation failed!
    pause
    exit /b 1
)

echo.
echo 🚀 STARTING ANIME GENERATION...
echo ================================
echo.

echo 🎨 Processing Miina images with Hayao style...
python animeganv2-batch-processor-fixed.py --style hayao --max-images 3

echo.
echo 🎨 Processing Miina images with Shinkai style...
python animeganv2-batch-processor-fixed.py --style shinkai --max-images 3

echo.
echo 🎉 ANIME GENERATION COMPLETED!
echo =============================
echo.
echo 🌐 Your anime images are now available at:
echo    📁 client\public\images\miina-ai-generated\
echo.
echo 💡 To view them in your website:
echo    1. Start your server: npm start
echo    2. Go to http://localhost:3001
echo    3. Click on "Images" in the cockpit
echo    4. Look for Miina AI Gallery section
echo.
pause 