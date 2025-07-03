@echo off
echo.
echo 🔍 TESTING IPHONE STREAM CONNECTIVITY
echo =====================================
echo.

echo Testing LEFT IPHONE (192.168.29.21:8989)...
curl -I -m 10 http://192.168.29.21:8989/ 2>nul
if %errorlevel% equ 0 (
    echo ✅ LEFT IPHONE: Connection successful
) else (
    echo ❌ LEFT IPHONE: Connection failed
)
echo.

echo Testing RIGHT IPHONE (192.168.29.208:8080)...
curl -I -m 10 http://192.168.29.208:8080/ 2>nul
if %errorlevel% equ 0 (
    echo ✅ RIGHT IPHONE: Connection successful
) else (
    echo ❌ RIGHT IPHONE: Connection failed
)
echo.

echo Testing common streaming paths...
echo.

echo LEFT IPHONE /video path:
curl -I -m 5 http://192.168.29.21:8989/video 2>nul
if %errorlevel% equ 0 (echo ✅ /video works) else (echo ❌ /video failed)

echo LEFT IPHONE /mjpeg path:
curl -I -m 5 http://192.168.29.21:8989/mjpeg 2>nul
if %errorlevel% equ 0 (echo ✅ /mjpeg works) else (echo ❌ /mjpeg failed)

echo.
echo RIGHT IPHONE /video path:
curl -I -m 5 http://192.168.29.208:8080/video 2>nul
if %errorlevel% equ 0 (echo ✅ /video works) else (echo ❌ /video failed)

echo RIGHT IPHONE /mjpeg path:
curl -I -m 5 http://192.168.29.208:8080/mjpeg 2>nul
if %errorlevel% equ 0 (echo ✅ /mjpeg works) else (echo ❌ /mjpeg failed)

echo.
echo =====================================
echo 📱 You can also test manually by opening these URLs in your browser:
echo    http://192.168.29.21:8989/
echo    http://192.168.29.208:8080/
echo.
echo If the URLs work in browser but not in the app, it might be a CORS issue.
echo.
pause 