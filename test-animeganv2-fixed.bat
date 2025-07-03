@echo off
echo.
echo 🧪 TESTING FIXED ANIMEGANV2 PROCESSOR
echo ====================================
echo.

echo 🔍 Testing Python availability...
python --version 2>nul
if %errorlevel% equ 0 (
    echo ✅ Python found
    python animeganv2-batch-processor-fixed.py --check-only
    goto :end
)

echo ⚠️ Python not in PATH, trying alternative locations...

set "PYTHON_PATHS=C:\Python38\python.exe C:\Python39\python.exe C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python38\python.exe C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python39\python.exe"

for %%P in (%PYTHON_PATHS%) do (
    if exist "%%P" (
        echo ✅ Found Python at: %%P
        "%%P" animeganv2-batch-processor-fixed.py --check-only
        goto :end
    )
)

echo ❌ Python not found in common locations
echo 💡 Please install Python 3.6+ or add it to your PATH
echo.
echo 📥 Download Python from: https://www.python.org/downloads/
echo 💡 During installation, check "Add Python to PATH"

:end
echo.
pause 