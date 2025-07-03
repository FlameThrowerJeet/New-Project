const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const IPHONE_IP = '192.168.29.84'; // Your iPhone's IP address
const IPHONE_PORT = 3004; // Port for iPhone processing server
const MIINA_IMAGES_DIR = path.join(__dirname, 'client', 'Miina - Pics');
const OUTPUT_DIR = path.join(__dirname, 'client', 'public', 'images', 'miina-ai-generated');

// Create Express app for iPhone communication
const app = express();
const PORT = 3005;

app.use(express.json());
app.use(express.static('public'));

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure directories exist
function ensureDirectories() {
  [OUTPUT_DIR, 'uploads'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Get list of Miina images
function getMiinaImages() {
  try {
    const files = fs.readdirSync(MIINA_IMAGES_DIR);
    return files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    ).map(file => ({
      name: file,
      path: path.join(MIINA_IMAGES_DIR, file)
    }));
  } catch (error) {
    console.error('Error reading Miina directory:', error);
    return [];
  }
}

// Send image to iPhone for processing
async function sendImageToiPhone(imagePath, imageName) {
  try {
    console.log(`📤 Sending ${imageName} to iPhone for processing...`);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('prompt', 'Transform this photo into an anime style, maintaining the same pose and composition but with anime aesthetics');
    formData.append('originalName', imageName);
    
    // Send to iPhone
    const response = await axios.post(`http://${IPHONE_IP}:${IPHONE_PORT}/process-image`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 120000, // 2 minutes timeout
    });
    
    if (response.data.success) {
      console.log(`✅ iPhone processed ${imageName} successfully`);
      return response.data.generatedImage;
    } else {
      throw new Error(response.data.error || 'iPhone processing failed');
    }
    
  } catch (error) {
    console.error(`❌ Failed to send ${imageName} to iPhone:`, error.message);
    throw error;
  }
}

// Download generated image from iPhone
async function downloadGeneratedImage(imageUrl, originalName) {
  try {
    console.log(`📥 Downloading generated image for ${originalName}...`);
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFileName = `miina_ai_${timestamp}_${originalName}`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    
    fs.writeFileSync(outputPath, response.data);
    console.log(`💾 Generated image saved: ${outputFileName}`);
    
    return {
      original: originalName,
      generated: outputFileName,
      path: outputPath
    };
    
  } catch (error) {
    console.error(`❌ Failed to download generated image for ${originalName}:`, error.message);
    throw error;
  }
}

// Main processing function
async function processImagesWithiPhone(imageCount = 5) {
  console.log('🤖 Starting iPhone Remote Processing...');
  
  ensureDirectories();
  
  // Get Miina images
  const images = getMiinaImages();
  if (images.length === 0) {
    console.error('❌ No images found in Miina directory');
    return;
  }
  
  // Limit to specified count
  const imagesToProcess = images.slice(0, imageCount);
  console.log(`📸 Processing ${imagesToProcess.length} images with iPhone...`);
  
  const results = [];
  
  for (let i = 0; i < imagesToProcess.length; i++) {
    const image = imagesToProcess[i];
    console.log(`\n🔄 Processing ${i + 1}/${imagesToProcess.length}: ${image.name}`);
    
    try {
      // Send to iPhone
      const generatedImageUrl = await sendImageToiPhone(image.path, image.name);
      
      // Download result
      const result = await downloadGeneratedImage(generatedImageUrl, image.name);
      results.push(result);
      
      // Wait between images
      if (i < imagesToProcess.length - 1) {
        console.log('⏳ Waiting 5 seconds before next image...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${image.name}:`, error.message);
      results.push({
        original: image.name,
        generated: null,
        error: error.message
      });
    }
  }
  
  // Create manifest
  const manifest = {
    generated: new Date().toISOString(),
    images: results.filter(r => r.generated)
  };
  
  const manifestPath = path.join(OUTPUT_DIR, 'miina-ai-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 Manifest saved: ${manifestPath}`);
  
  console.log(`\n✅ iPhone processing completed!`);
  console.log(`📊 Results: ${results.filter(r => r.generated).length}/${results.length} successful`);
  
  return results;
}

// API endpoints
app.post('/api/iphone-process', async (req, res) => {
  try {
    const { imageCount = 5 } = req.body;
    console.log(`🚀 Starting iPhone processing for ${imageCount} images...`);
    
    const results = await processImagesWithiPhone(imageCount);
    
    res.json({
      success: true,
      message: 'iPhone processing completed',
      results: results
    });
    
  } catch (error) {
    console.error('❌ iPhone processing error:', error);
    res.status(500).json({
      success: false,
      message: 'iPhone processing failed',
      error: error.message
    });
  }
});

app.get('/api/iphone-status', (req, res) => {
  res.json({
    status: 'ready',
    iphoneIP: IPHONE_IP,
    iphonePort: IPHONE_PORT,
    miinaImagesCount: getMiinaImages().length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📱 iPhone Remote Processor running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api/iphone-process`);
  console.log(`📱 iPhone should be running server on ${IPHONE_IP}:${IPHONE_PORT}`);
});

module.exports = { processImagesWithiPhone, getMiinaImages }; 