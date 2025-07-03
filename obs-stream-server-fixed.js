const express = require('express');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8003;

let isOBSAvailable = false;
let ffmpegProcess = null;

// Check if OBS Virtual Camera is available
function checkOBSVirtualCamera() {
  return new Promise((resolve) => {
    // On Windows, check for DirectShow devices
    const checkCmd = 'ffmpeg -list_devices true -f dshow -i dummy';
    
    exec(checkCmd, (error, stdout, stderr) => {
      const output = stderr + stdout; // FFmpeg outputs device list to stderr
      const hasOBSCamera = output.toLowerCase().includes('obs virtual camera');
      
      console.log(hasOBSCamera ? '✅ OBS Virtual Camera detected' : '❌ OBS Virtual Camera not found');
      if (!hasOBSCamera) {
        console.log('💡 Start OBS Studio and enable Virtual Camera to use this feature');
      }
      
      resolve(hasOBSCamera);
    });
  });
}

// Generate a test pattern video when OBS isn't available
function generateTestPattern() {
  return new Promise((resolve) => {
    const testPatternCmd = [
      'ffmpeg',
      '-loglevel', 'error',
      '-f', 'lavfi',
      '-i', 'testsrc2=size=1280x720:rate=30',
      '-f', 'lavfi',
      '-i', 'sine=frequency=1000:duration=0',
      '-t', '3600', // 1 hour duration
      '-f', 'mp4',
      '-vcodec', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-b:v', '2500k',
      '-maxrate', '2500k',
      '-bufsize', '3000k',
      '-pix_fmt', 'yuv420p',
      '-movflags', 'frag_keyframe+empty_moov',
      '-scale', '480:-1',
      'pipe:1'
    ];
    
    const ffmpeg = spawn(testPatternCmd[0], testPatternCmd.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Silence FFmpeg stderr entirely to avoid console spam
    ffmpeg.stderr.on('data', (data) => {
      // Suppress FFmpeg logs
    });
    
    resolve(ffmpeg);
  });
}

// Initialize OBS detection
checkOBSVirtualCamera().then(available => {
  isOBSAvailable = available;
});

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve a simple HTML page that displays the stream
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OBS Virtual Camera Stream</title>
      <style>
        body { 
          margin: 0; 
          background: #0a0a0a; 
          color: #00d4aa;
          font-family: 'Courier New', monospace;
        }
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .header {
          padding: 10px;
          background: #1a1a1a;
          text-align: center;
          border-bottom: 2px solid #00d4aa;
        }
        .status {
          color: ${isOBSAvailable ? '#00ff00' : '#ff4444'};
          font-size: 14px;
        }
        video { 
          flex: 1;
          width: 100%; 
          object-fit: cover;
          background: #000;
        }
        .footer {
          padding: 10px;
          background: #1a1a1a;
          text-align: center;
          font-size: 12px;
          border-top: 1px solid #333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📺 OBS VIRTUAL CAMERA STREAM</h2>
          <div class="status">
            STATUS: ${isOBSAvailable ? 'OBS LIVE' : 'TEST PATTERN (OBS OFFLINE)'}
          </div>
        </div>
        <video autoplay muted controls>
          <source src="/stream" type="video/mp4">
          Your browser does not support video streaming.
        </video>
        <div class="footer">
          Port: ${PORT} | Method: HTTP MP4 Stream | ${isOBSAvailable ? 'Source: OBS Virtual Camera' : 'Source: Test Pattern'}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Stream endpoint with OBS detection and fallback
app.get('/stream', async (req, res) => {
  console.log('📺 Stream requested');
  
  // Re-check OBS availability for each request
  isOBSAvailable = await checkOBSVirtualCamera();
  
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  let streamProcess;

  if (isOBSAvailable) {
    console.log('🎥 Starting OBS Virtual Camera stream...');
    
    // FFmpeg command for OBS Virtual Camera
    const obsCmd = [
      'ffmpeg',
      '-loglevel', 'error',
      '-f', 'dshow',
      '-rtbufsize', '100M',
      '-i', 'video=OBS Virtual Camera',
      '-vf', 'scale=480:-1',
      '-vcodec', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-b:v', '800k',
      '-maxrate', '800k',
      '-bufsize', '1000k',
      '-pix_fmt', 'yuv420p',
      '-movflags', 'frag_keyframe+empty_moov',
      'pipe:1'
    ];
    
    streamProcess = spawn(obsCmd[0], obsCmd.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
  } else {
    console.log('🧪 Starting test pattern stream (OBS not available)...');
    streamProcess = await generateTestPattern();
  }

  // Handle stream data
  streamProcess.stdout.on('data', (data) => {
    if (!res.destroyed) {
      res.write(data);
    }
  });

  // Suppress continuous FFmpeg frame logs; only show critical errors
  streamProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (/error|Error|failed/i.test(msg)) {
      console.error('[FFmpeg]', msg.trim());
    }
  });

  streamProcess.on('close', (code) => {
    console.log(`Stream process exited with code ${code}`);
    if (!res.destroyed) {
      res.end();
    }
  });

  streamProcess.on('error', (error) => {
    console.error('Stream error:', error);
    if (!res.destroyed) {
      res.status(500).end('Stream error');
    }
  });

  // Clean up when client disconnects
  req.on('close', () => {
    console.log('📺 Client disconnected, stopping stream');
    if (streamProcess && !streamProcess.killed) {
      streamProcess.kill('SIGTERM');
    }
  });

  req.on('error', () => {
    if (streamProcess && !streamProcess.killed) {
      streamProcess.kill('SIGTERM');
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const obsStatus = await checkOBSVirtualCamera();
  res.json({
    status: 'ok',
    obs_available: obsStatus,
    timestamp: new Date().toISOString()
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down OBS Stream Server...');
  if (ffmpegProcess && !ffmpegProcess.killed) {
    ffmpegProcess.kill('SIGTERM');
  }
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('📺 OBS Stream Server starting...');
  console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Web interface: http://localhost:${PORT}`);
  console.log(`📡 Stream endpoint: http://localhost:${PORT}/stream`);
  console.log(`💊 Health check: http://localhost:${PORT}/health`);
  console.log('');
  
  if (isOBSAvailable) {
    console.log('✅ OBS Virtual Camera detected and ready!');
  } else {
    console.log('⚠️  OBS Virtual Camera not detected');
    console.log('💡 Start OBS Studio → Sources → Add → Video Capture Device');
    console.log('💡 Then go to OBS → Tools → Virtual Camera → Start');
    console.log('🧪 Using test pattern for now');
  }
}); 