@echo off
echo Starting sequential video conversion to save disk space...
echo.

cd /d "%~dp0"

set "input_dir=client\public\videos\converted"
set "output_dir=client\public\videos\converted"

if not exist "%input_dir%" (
    echo Error: Input directory %input_dir% does not exist!
    pause
    exit /b 1
)

echo Converting videos from: %input_dir%
echo Output directory: %output_dir%
echo.

:: Convert each MKV file one by one
for %%f in ("%input_dir%\*.mkv") do (
    echo.
    echo ========================================
    echo Converting: %%~nxf
    echo ========================================
    
    set "input_file=%%f"
    set "output_file=%output_dir%\%%~nf.mp4"
    
    echo Input: !input_file!
    echo Output: !output_file!
    echo.
    
    :: Convert MKV to MP4
    ffmpeg -i "!input_file!" -c:v libx264 -c:a aac -preset medium -crf 23 "!output_file!"
    
    if !errorlevel! equ 0 (
        echo.
        echo ✓ Successfully converted: %%~nxf
        echo.
        
        :: Check if output file exists and has size > 0
        if exist "!output_file!" (
            for %%A in ("!output_file!") do set "output_size=%%~zA"
            if !output_size! gtr 0 (
                echo Deleting original MKV file to save space...
                del "!input_file!"
                echo ✓ Deleted original: %%~nxf
            ) else (
                echo ✗ Output file is empty, keeping original
            )
        ) else (
            echo ✗ Output file not created, keeping original
        )
    ) else (
        echo.
        echo ✗ Failed to convert: %%~nxf
        echo Keeping original file
    )
    
    echo.
    echo Current disk space:
    dir /-c "%input_dir%"
    echo.
)

echo.
echo ========================================
echo Conversion complete!
echo ========================================
echo.
echo Final directory contents:
dir /-c "%output_dir%"
echo.
pause 