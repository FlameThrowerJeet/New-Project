@echo off
echo Starting OBS Stream Server...
echo.
echo This will start a local streaming server on port 8003
echo Make sure OBS Virtual Camera is enabled before accessing the stream
echo.
echo Server will be available at: http://localhost:8003
echo.
node obs-stream-server.js
pause 