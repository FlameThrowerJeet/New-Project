@echo off
echo Converting .mkv files to .mp4 format...
echo.

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: FFmpeg is not installed or not in PATH
    echo Please install FFmpeg from https://ffmpeg.org/download.html
    echo or download the Windows build from https://www.gyan.dev/ffmpeg/builds/
    pause
    exit /b 1
)

REM Create output directory if it doesn't exist
if not exist "client\public\videos\converted" mkdir "client\public\videos\converted"

echo Starting conversion process...
echo.

REM Convert each .mkv file to .mp4
echo Converting IMBD-253...
ffmpeg -i "client\public\videos\[FHD] IMBD-253 Miina Tsubaki - 椿美衣奈 [HEVC].mkv" -c:v libx264 -c:a aac -preset medium -crf 23 "client\public\videos\converted\IMBD-253.mp4"

echo Converting IMBD-266...
ffmpeg -i "client\public\videos\[FHD] IMBD-266 Miina Tsubaki - 椿美衣奈 [HEVC].mkv" -c:v libx264 -c:a aac -preset medium -crf 23 "client\public\videos\converted\IMBD-266.mp4"

echo Converting IMBD-277...
ffmpeg -i "client\public\videos\[FHD] IMBD-277 Miina Tsubaki - 椿美衣奈 [HEVC].mkv" -c:v libx264 -c:a aac -preset medium -crf 23 "client\public\videos\converted\IMBD-277.mp4"

echo Converting IMBD-286...
ffmpeg -i "client\public\videos\[FHD] IMBD-286 Miina Tsubaki - 椿美衣奈 [HEVC].mkv" -c:v libx264 -c:a aac -preset medium -crf 23 "client\public\videos\converted\IMBD-286.mp4"

echo Converting IMBD-298...
ffmpeg -i "client\public\videos\[FHD] IMBD-298 Miina Tsubaki - 椿美衣奈 [HEVC].mkv" -c:v libx264 -c:a aac -preset medium -crf 23 "client\public\videos\converted\IMBD-298.mp4"

echo Converting Kneehigh mk01...
ffmpeg -i "client\public\videos\[HD] Kneehigh Miina Tsubaki mk01 [HEVC].mkv" -c:v libx264 -c:a aac -preset medium -crf 23 "client\public\videos\converted\Kneehigh-mk01.mp4"

echo Converting Kneehigh mk02...
ffmpeg -i "client\public\videos\[HD] Kneehigh Miina Tsubaki mk02 [HEVC].mkv" -c:v libx264 -c:a aac -preset medium -crf 23 "client\public\videos\converted\Kneehigh-mk02.mp4"

echo.
echo Conversion complete! Check the 'client\public\videos\converted' folder for the .mp4 files.
echo.
pause 