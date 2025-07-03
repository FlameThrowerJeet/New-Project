require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// const NodeMediaServer = require('node-media-server');
const axios = require('axios');
const ytdl = require('ytdl-core');
const Replicate = require('replicate');
const { exec } = require('child_process');
const fs = require('fs');
const ImageGenerationService = require('./image-generation-service');
const FormData = require('form-data');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Initialize image generation service
const imageService = new ImageGenerationService();

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

// Custom MIME types for uncommon video extensions
// Modern Express with @expressjs/send automatically handles common types; however,
// if you still need explicit types, consider using the `mime` package.
// Example (uncomment if necessary):
// const mime = require('mime');
// mime.define({
//   'video/x-matroska': ['mkv'],
//   'video/avi': ['avi']
// });

// Serve static files from client/public in development, client/dist in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
} else {
  // In development, serve files from client/public for videos, images, etc.
  app.use(express.static(path.join(__dirname, 'client/public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.mkv')) {
        res.setHeader('Content-Type', 'video/x-matroska');
      } else if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (path.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      } else if (path.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      }
    }
  }));
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

// Add YouTube video download endpoint
app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }
  try {
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');
    ytdl(url, { filter: 'videoonly', quality: 'highestvideo', format: 'mp4' })
      .pipe(res)
      .on('error', (err) => {
        console.error('ytdl error:', err);
        res.status(500).end('Failed to download video');
      });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to download video' });
  }
});

// Serve React app (always). PS4 needs the ES5 legacy bundle we placed in client/dist.
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Add Meta AI automation endpoint
app.post('/api/meta-ai/start', async (req, res) => {
  try {
    console.log('🚀 Starting Meta AI automation...');
    
    // Spawn the automation script as a separate process
    const { spawn } = require('child_process');
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

// Add endpoint to get generated images manifest
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

// ===== IMAGE GENERATION ENDPOINTS =====

// Unified image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, preferredProvider, fallbackProviders, ...options } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`🎨 Generating image: "${prompt}"`);

    const result = await imageService.generateImage(prompt, {
      preferredProvider,
      fallbackProviders,
      ...options
    });

    if (result.success) {
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        provider: result.provider,
        prompt: result.prompt,
        metadata: result.metadata
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        provider: result.provider
      });
    }
  } catch (error) {
    console.error('❌ Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// DALL-E specific generation
app.post('/api/generate-dalle', async (req, res) => {
  try {
    const { prompt, size, quality, style } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await imageService.generateWithDalle(prompt, { size, quality, style });

    if (result.success) {
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        provider: 'dalle',
        prompt: result.prompt,
        metadata: result.metadata
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ DALL-E generation error:', error);
    res.status(500).json({ error: 'Failed to generate image with DALL-E' });
  }
});

// Stability AI specific generation
app.post('/api/generate-stability', async (req, res) => {
  try {
    const { prompt, width, height, steps, cfg_scale } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await imageService.generateWithStability(prompt, { width, height, steps, cfg_scale });

    if (result.success) {
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        provider: 'stability',
        prompt: result.prompt,
        metadata: result.metadata
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Stability AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate image with Stability AI' });
  }
});

// Replicate specific generation
app.post('/api/generate-replicate', async (req, res) => {
  try {
    const { prompt, model, width, height, num_inference_steps, guidance_scale } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await imageService.generateWithReplicate(prompt, { 
      model, 
      width, 
      height, 
      num_inference_steps, 
      guidance_scale 
    });

    if (result.success) {
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        provider: 'replicate',
        prompt: result.prompt,
        metadata: result.metadata
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Replicate generation error:', error);
    res.status(500).json({ error: 'Failed to generate image with Replicate' });
  }
});

// Get generation history
app.get('/api/generation-history', async (req, res) => {
  try {
    const history = await imageService.getGenerationHistory();
    res.json(history);
  } catch (error) {
    console.error('❌ Error fetching generation history:', error);
    res.status(500).json({ error: 'Failed to fetch generation history' });
  }
});

// Image processing endpoints
app.post('/api/process-image', async (req, res) => {
  try {
    const { imageUrl, operation, ...params } = req.body;

    if (!imageUrl || !operation) {
      return res.status(400).json({ error: 'Image URL and operation are required' });
    }

    let result;
    switch (operation) {
      case 'resize':
        const { width, height } = params;
        if (!width || !height) {
          return res.status(400).json({ error: 'Width and height are required for resize operation' });
        }
        result = await imageService.resizeImage(imageUrl, width, height);
        break;
      case 'filter':
        const { filter } = params;
        if (!filter) {
          return res.status(400).json({ error: 'Filter type is required for filter operation' });
        }
        result = await imageService.applyFilter(imageUrl, filter);
        break;
      default:
        return res.status(400).json({ error: 'Unknown operation' });
    }

    res.json({
      success: true,
      processedImageUrl: result
    });
  } catch (error) {
    console.error('❌ Image processing error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Get available models and providers
app.get('/api/image-providers', (req, res) => {
  res.json({
    providers: [
      {
        name: 'dalle',
        displayName: 'DALL-E 3',
        description: 'OpenAI\'s latest image generation model',
        capabilities: ['text-to-image', 'high-quality', 'artistic'],
        sizes: ['1024x1024', '1792x1024', '1024x1792'],
        styles: ['vivid', 'natural'],
        quality: ['standard', 'hd']
      },
      {
        name: 'stability',
        displayName: 'Stability AI',
        description: 'Stable Diffusion XL for creative image generation',
        capabilities: ['text-to-image', 'customizable', 'fast'],
        sizes: ['512x512', '768x768', '1024x1024', '1152x896', '896x1152'],
        engines: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6']
      },
      {
        name: 'replicate',
        displayName: 'Replicate',
        description: 'Access to thousands of AI models',
        capabilities: ['text-to-image', 'image-to-image', 'style-transfer'],
        models: [
          'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          'cjwb/animegan-v2:4020336909787e8a23c7513c3bde3998583447e45c446979a7c7378a5171b8de'
        ]
      }
    ],
    operations: [
      {
        name: 'resize',
        description: 'Resize image to specified dimensions',
        params: ['width', 'height']
      },
      {
        name: 'filter',
        description: 'Apply image filters',
        params: ['filter'],
        filterTypes: ['grayscale', 'blur', 'sharpen', 'sepia']
      }
    ]
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// NodeMediaServer configuration
// const config = {
//   rtmp: {
//     port: 1938,
//     chunk_size: 60000,
//     gop_cache: true,
//     ping: 30,
//     ping_timeout: 60
//   },
//   http: {
//     hostname: '0.0.0.0',
//     port: 8004,
//     allow_origin: '*'
//   },
//   trans: {
//     ffmpeg: process.platform === 'win32' 
//       ? 'C:\\ffmpeg\\bin\\ffmpeg.exe'
//       : '/usr/local/bin/ffmpeg',
//     tasks: [
//       {
//         app: 'live',
//         hls: true,
//         hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]'
//       }
//     ]
//   }
// };

// Initialize NodeMediaServer
// const nms = new NodeMediaServer(config);

// Error handling for NodeMediaServer
// nms.on('error', (err, ctx) => {
//   console.error('NodeMediaServer error:', err);
// });

// Start NodeMediaServer
// nms.run();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Stream status endpoints
app.get('/api/stream-status', (req, res) => {
  res.json({
    obs_stream: {
      url: 'http://localhost:8080',
      status: 'checking',
      description: 'OBS Virtual Camera Stream'
    },
    node_media: {
      url: 'http://localhost:8004',
      status: 'disabled',
      description: 'NodeMedia Server (RTMP)'
    },
    rtmp_endpoint: 'rtmp://localhost:1938/live/STREAM_KEY'
  });
});

// Start Express server
app.listen(PORT, () => {
  const expressPort = PORT || 3002;
  console.log(`🚀 Server running on port ${expressPort} in ${NODE_ENV} mode`);
  console.log(`📱 Frontend available at http://localhost:${expressPort}`);
  console.log(`🔧 API endpoints available at http://localhost:${expressPort}/api`);
  console.log(`📺 OBS Stream: Check http://localhost:8080 (requires OBS Virtual Camera)`);
  console.log(`📡 RTMP Stream: rtmp://localhost:1938/live/STREAM_KEY (when enabled)`);
});

let newsCache = { data: null, timestamp: 0 };

app.get('/api/bulletin-news', async (req, res) => {
  const now = Date.now();
  if (newsCache.data && now - newsCache.timestamp < 60 * 60 * 1000) {
    return res.json(newsCache.data);
  }
  const fallbackArticles = [
    {
      id: 'placeholder-1',
      headline: 'Welcome to Flame Thrower Jet',
      summary: 'Your news API key is missing. Add GNEWS_API_KEY in .env to see live headlines.',
      image: '',
      source: 'System',
      url: '#',
      timestamp: new Date().toISOString(),
    },
  ];

  try {
    // Use GNews API (free tier, 100 req/day) as primary
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey || apiKey === 'demo') {
      return res.json(fallbackArticles);
    }

    const query = encodeURIComponent('Indo-Pacific OR China OR USA OR Pakistan OR Russia OR Turkey OR Arab OR Africa');
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=20&token=${apiKey}`;
    const response = await axios.get(url);
    const articles = (response.data.articles || []).map((a, i) => ({
      id: a.url || i,
      headline: a.title,
      summary: a.description,
      image: a.image || '',
      source: a.source?.name || '',
      url: a.url,
      timestamp: a.publishedAt,
    }));
    newsCache = { data: articles, timestamp: now };
    res.json(articles);
  } catch (err) {
    console.error('Failed to fetch news:', err.message);
    // On auth errors, return fallback so UI isn't broken
    if (err.response && err.response.status === 401) {
      return res.json(fallbackArticles);
    }
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Endpoint to convert an image to anime style
app.post('/api/anime-filter', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'Replicate API token is not configured on the server.' });
  }

  try {
    console.log(`Processing image with AnimeGAN v2: ${imageUrl}`);
    const output = await replicate.run(
      "cjwb/animegan-v2:4020336909787e8a23c7513c3bde3998583447e45c446979a7c7378a5171b8de",
       {
         input: {
           image: imageUrl
         }
       }
    );
    
    console.log('Anime conversion successful:', output);
    // The output from this model is an array of URLs
    res.json({ animeImageUrl: output[0] });

  } catch (error) {
    console.error('Replicate API error:', error);
    res.status(500).json({ error: 'Failed to apply anime filter.' });
  }
});

// Add dynamic video manifest endpoint (development convenience)
// Serve a synthetic manifest if it doesn't exist so the Videos component always has data
const videosDir = path.join(__dirname, 'client', 'public', 'videos');

app.get('/videos/miina-videos-manifest.json', async (req, res, next) => {
  try {
    // If a pre-built manifest file exists, serve it directly
    const manifestPath = path.join(videosDir, 'miina-videos-manifest.json');
    if (fs.existsSync(manifestPath)) {
      return res.sendFile(manifestPath);
    }

    // Otherwise construct a quick manifest from files found in the directory
    const files = fs.readdirSync(videosDir).filter(f => /\.(mp4|webm|mkv)$/i.test(f));

    const manifest = {
      videos: files.map((filename, idx) => ({
        id: idx,
        title: filename.replace(/\.[^.]+$/, ''),
        filename,
        url: `/videos/${filename}`,
        description: 'Auto-generated video',
        duration: 0,
        category: 'Miina'
      }))
    };

    res.json(manifest);
  } catch (err) {
    next(err);
  }
});

// Spawn Python face swap service once when server starts
try {
  const { spawn } = require('child_process');
  const venvPython = path.join(__dirname, 'venv', process.platform === 'win32' ? 'Scripts' : 'bin', process.platform === 'win32' ? 'python.exe' : 'python');
  const pyExec = fs.existsSync(venvPython) ? venvPython : 'python';
  const pyProcess = spawn(pyExec, ['face_swap_service.py']);
  pyProcess.stdout.on('data', d => console.log('[FaceSwapPy]', d.toString()));
  pyProcess.stderr.on('data', d => console.error('[FaceSwapPy]', d.toString()));
} catch (err) {
  console.error('Failed to launch face swap python service:', err.message);
}

// Face swap proxy endpoint
app.post('/api/face-swap', upload.fields([{ name: 'base' }, { name: 'face' }]), async (req, res) => {
  try {
    if (!req.files || !req.files.base || !req.files.face) {
      return res.status(400).json({ error: 'Both images required' });
    }

    const form = new FormData();
    form.append('base', req.files.base[0].buffer, { filename: 'base.png' });
    form.append('face', req.files.face[0].buffer, { filename: 'face.png' });

    const response = await axios.post('http://127.0.0.1:5005/swap', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
      timeout: 300000 // 5 min
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(response.data);
  } catch (err) {
    console.error('Face swap proxy error:', err.message);
    res.status(500).json({ error: 'Face swap failed' });
  }
});