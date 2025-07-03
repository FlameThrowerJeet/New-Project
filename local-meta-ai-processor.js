const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cors = require('cors');

// Configuration
const PORT = 3005;
const MIINA_IMAGES_DIR = path.join(__dirname, 'client', 'Miina - Pics');
const OUTPUT_DIR = path.join(__dirname, 'client', 'public', 'images', 'miina-ai-generated');

// Ensure directories exist
function ensureDirectories() {
  [OUTPUT_DIR, 'temp_uploads'].forEach(dir => {
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

// Instagram credentials (hardcoded for automation)
const INSTAGRAM_CREDENTIALS = {
  username: 'denmark_zurichberg', // User's actual username
  password: 'Foxtrot@1'  // User's actual password
};

// Meta AI processing function
async function processWithMetaAI(imagePath, imageName, prompt) {
  let browser;
  let page;
  
  try {
    console.log(`🤖 Starting Meta AI processing for ${imageName}...`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    page = await browser.newPage();
    
    // Set user agent to mobile
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');
    
    // Navigate to Instagram
    console.log('🔐 Logging into Instagram...');
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
    
    // Wait for login form
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    // Fill login form
    await page.type('input[name="username"]', INSTAGRAM_CREDENTIALS.username);
    await page.type('input[name="password"]', INSTAGRAM_CREDENTIALS.password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Successfully logged into Instagram');
    
    // Navigate to Meta AI
    console.log('🧠 Navigating to Meta AI...');
    await page.goto('https://www.instagram.com/direct/t/340282366841710300949128142825485829123', { waitUntil: 'networkidle2' });
    
    // Wait for chat interface
    await page.waitForSelector('[data-testid="message-input"]', { timeout: 15000 });
    console.log('✅ Meta AI chat interface loaded');
    
    // Upload image
    console.log('📤 Uploading image to Meta AI...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(imagePath);
      console.log('✅ Image uploaded successfully');
    } else {
      throw new Error('File input not found');
    }
    
    // Wait for image to be processed
    await page.waitForTimeout(3000);
    
    // Send prompt
    console.log('💬 Sending prompt to Meta AI...');
    await page.type('[data-testid="message-input"]', prompt);
    await page.keyboard.press('Enter');
    
    // Wait for response
    console.log('⏳ Waiting for Meta AI response...');
    await page.waitForTimeout(15000);
    
    // Look for generated image
    const generatedImageSelector = 'img[src*="scontent"]';
    await page.waitForSelector(generatedImageSelector, { timeout: 30000 });
    
    // Get generated image URL
    const generatedImage = await page.$(generatedImageSelector);
    const imageUrl = await generatedImage.evaluate(img => img.src);
    
    console.log('✅ Meta AI generated image successfully');
    
    // Download the generated image
    const response = await page.goto(imageUrl);
    const buffer = await response.buffer();
    
    // Save to local directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFileName = `meta_ai_${timestamp}_${imageName}`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`💾 Generated image saved: ${outputFileName}`);
    
    return {
      original: imageName,
      generated: outputFileName,
      path: outputPath
    };
    
  } catch (error) {
    console.error('❌ Meta AI processing failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main processing function
async function processImagesLocally(imageCount = 5) {
  console.log('🤖 Starting Local Meta AI Processing...');
  
  ensureDirectories();
  
  // Get Miina images
  const images = getMiinaImages();
  if (images.length === 0) {
    console.error('❌ No images found in Miina directory');
    return [];
  }
  
  // Limit to specified count
  const imagesToProcess = images.slice(0, imageCount);
  console.log(`📸 Processing ${imagesToProcess.length} images with Meta AI...`);
  
  const results = [];
  
  for (let i = 0; i < imagesToProcess.length; i++) {
    const image = imagesToProcess[i];
    console.log(`\n🔄 Processing ${i + 1}/${imagesToProcess.length}: ${image.name}`);
    
    try {
      const prompt = 'Transform this photo into an anime style, maintaining the same pose and composition but with anime aesthetics';
      const result = await processWithMetaAI(image.path, image.name, prompt);
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
  
  console.log(`\n✅ Local processing completed!`);
  console.log(`📊 Results: ${results.filter(r => r.generated).length}/${results.length} successful`);
  
  return results;
}

// Create Express app
const app = express();

app.use(cors());
app.use(express.json());
app.use('/images', express.static(OUTPUT_DIR));

// API endpoints
app.post('/api/process-images', async (req, res) => {
  try {
    const { imageCount = 5 } = req.body;
    console.log(`🚀 Starting local processing for ${imageCount} images...`);
    
    const results = await processImagesLocally(imageCount);
    
    res.json({
      success: true,
      message: 'Local processing completed',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Local processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Local processing failed',
      error: error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ready',
    miinaImagesCount: getMiinaImages().length,
    outputDir: OUTPUT_DIR
  });
});

app.get('/api/manifest', (req, res) => {
  try {
    const manifestPath = path.join(OUTPUT_DIR, 'miina-ai-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      res.json(manifest);
    } else {
      res.json({ images: [] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read manifest' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Local Meta AI Processor running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api/process-images`);
  console.log(`📸 Found ${getMiinaImages().length} Miina images ready for processing`);
});

module.exports = { processImagesLocally, getMiinaImages }; 