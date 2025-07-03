Write-Host "Starting sequential video conversion to save disk space..." -ForegroundColor Green
Write-Host ""

$inputDir = "client\public\videos\converted"
$outputDir = "client\public\videos\converted"

if (-not (Test-Path $inputDir)) {
    Write-Host "Error: Input directory $inputDir does not exist!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Converting videos from: $inputDir" -ForegroundColor Yellow
Write-Host "Output directory: $outputDir" -ForegroundColor Yellow
Write-Host ""

# Get all MKV files
$mkvFiles = Get-ChildItem -Path $inputDir -Filter "*.mkv"

foreach ($file in $mkvFiles) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Converting: $($file.Name)" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    
    $inputFile = $file.FullName
    $outputFile = Join-Path $outputDir "$($file.BaseName).mp4"
    
    Write-Host "Input: $inputFile" -ForegroundColor Gray
    Write-Host "Output: $outputFile" -ForegroundColor Gray
    Write-Host ""
    
    # Convert MKV to MP4
    $ffmpegArgs = @(
        "-i", "`"$inputFile`"",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "medium",
        "-crf", "23",
        "`"$outputFile`""
    )
    
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "✓ Successfully converted: $($file.Name)" -ForegroundColor Green
        Write-Host ""
        
        # Check if output file exists and has size > 0
        if (Test-Path $outputFile) {
            $outputSize = (Get-Item $outputFile).Length
            if ($outputSize -gt 0) {
                Write-Host "Deleting original MKV file to save space..." -ForegroundColor Yellow
                Remove-Item $inputFile -Force
                Write-Host "✓ Deleted original: $($file.Name)" -ForegroundColor Green
            } else {
                Write-Host "✗ Output file is empty, keeping original" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ Output file not created, keeping original" -ForegroundColor Red
        }
    } else {
        Write-Host ""
        Write-Host "✗ Failed to convert: $($file.Name)" -ForegroundColor Red
        Write-Host "Keeping original file" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Current disk space:" -ForegroundColor Gray
    Get-ChildItem $inputDir | Format-Table Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}} -AutoSize
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Conversion complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Final directory contents:" -ForegroundColor Yellow
Get-ChildItem $outputDir | Format-Table Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}} -AutoSize
Write-Host ""
Read-Host "Press Enter to continue" 