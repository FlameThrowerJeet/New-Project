const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 3002;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Basic status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Meta AI automation endpoint
app.post('/api/meta-ai/start', async (req, res) => {
  try {
    console.log('🚀 Starting Meta AI automation...');
    
    // Spawn the automation script as a separate process
    const automationProcess = spawn('node', ['meta-ai-automation.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    automationProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Meta AI:', data.toString());
    });
    
    automationProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Meta AI Error:', data.toString());
    });
    
    automationProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Meta AI automation completed successfully');
        res.json({ 
          success: true, 
          message: 'Meta AI automation completed successfully',
          output: output
        });
      } else {
        console.error('❌ Meta AI automation failed with code:', code);
        res.status(500).json({ 
          success: false, 
          message: 'Meta AI automation failed',
          error: errorOutput,
          output: output
        });
      }
    });
    
    automationProcess.on('error', (error) => {
      console.error('❌ Failed to start Meta AI automation:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to start Meta AI automation',
        error: error.message
      });
    });
    
  } catch (error) {
    console.error('❌ Meta AI API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Manifest endpoint
app.get('/api/meta-ai/manifest', (req, res) => {
  try {
    const manifestPath = path.join(__dirname, 'client', 'public', 'images', 'miina-ai-generated', 'miina-ai-manifest.json');
    
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      res.json(manifest);
    } else {
      res.json({ generated: null, images: [] });
    }
  } catch (error) {
    console.error('❌ Error reading manifest:', error);
    res.status(500).json({ error: 'Failed to read manifest' });
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Meta AI API available at http://localhost:${PORT}/api/meta-ai/start`);
}); 