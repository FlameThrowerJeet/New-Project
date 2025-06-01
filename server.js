require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const NodeMediaServer = require('node-media-server');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.error('Warning: PEXELS_API_KEY is not set in environment variables');
}

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Only serve static files in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
}

// Basic route for testing
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Proxy endpoint for Pexels API
app.get('/api/pexels', async (req, res) => {
  if (!PEXELS_API_KEY) {
    return res.status(500).json({ error: 'Pexels API key not configured' });
  }
  try {
    const { query, per_page } = req.query;
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query, per_page }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Pexels API error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch images from Pexels',
      details: NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Serve React app for any other routes in production
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// NodeMediaServer configuration
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  trans: {
    ffmpeg: process.platform === 'win32' 
      ? 'C:\\ffmpeg\\bin\\ffmpeg.exe'
      : '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]'
      }
    ]
  }
};

// Initialize NodeMediaServer
const nms = new NodeMediaServer(config);

// Error handling for NodeMediaServer
nms.on('error', (err, ctx) => {
  console.error('NodeMediaServer error:', err);
});

// Start NodeMediaServer
nms.run();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`NodeMediaServer RTMP running on port ${config.rtmp.port}`);
  console.log(`NodeMediaServer HTTP running on port ${config.http.port}`);
});