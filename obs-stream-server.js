const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 8003;

// Serve a simple HTML page that displays the stream
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OBS Virtual Camera Stream</title>
      <style>
        body { margin: 0; background: #000; }
        video { width: 100%; height: 100vh; object-fit: cover; }
      </style>
    </head>
    <body>
      <video autoplay muted>
        <source src="/stream" type="video/mp4">
      </video>
    </body>
    </html>
  `);
});

// Stream endpoint using FFmpeg
app.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // FFmpeg command to capture OBS Virtual Camera and stream as MP4
  const ffmpeg = exec(`ffmpeg -f dshow -i video="OBS Virtual Camera" -f mp4 -vcodec libx264 -preset ultrafast -tune zerolatency -f mp4 pipe:1`, {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  ffmpeg.stdout.pipe(res);

  req.on('close', () => {
    ffmpeg.kill();
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OBS Stream Server running on http://0.0.0.0:${PORT}`);
  console.log('Make sure OBS Virtual Camera is running!');
}); 