const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cors = require('cors');

// Configuration
const PORT = 3004;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'generated');

// Ensure directories exist
[UPLOADS_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/generated', express.static(OUTPUT_DIR));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `upload_${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

// Instagram credentials (hardcoded for automation)
const INSTAGRAM_CREDENTIALS = {
  username: 'your_instagram_username',
  password: 'your_instagram_password'
};

// Meta AI processing function
async function processWithMetaAI(imagePath, prompt, originalName) {
  let browser;
  let page;
  
  try {
    console.log(`🤖 Starting Meta AI processing for ${originalName}...`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set user agent
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
    const outputFileName = `meta_ai_${timestamp}_${originalName}`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`💾 Generated image saved: ${outputFileName}`);
    
    // Return the local URL for the laptop to download
    const localUrl = `http://localhost:${PORT}/generated/${outputFileName}`;
    
    return localUrl;
    
  } catch (error) {
    console.error('❌ Meta AI processing failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// API endpoint to process images
app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }
    
    const imagePath = req.file.path;
    const prompt = req.body.prompt || 'Transform this photo into an anime style';
    const originalName = req.body.originalName || req.file.originalname;
    
    console.log(`📱 iPhone received image: ${originalName}`);
    
    // Process with Meta AI
    const generatedImageUrl = await processWithMetaAI(imagePath, prompt, originalName);
    
    // Clean up uploaded file
    fs.unlinkSync(imagePath);
    
    res.json({
      success: true,
      message: 'Image processed successfully',
      generatedImage: generatedImageUrl,
      originalName: originalName
    });
    
  } catch (error) {
    console.error('❌ Processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uploadsDir: UPLOADS_DIR,
    outputDir: OUTPUT_DIR
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📱 iPhone Meta AI Server running on port ${PORT}`);
  console.log(`🌐 Available at http://0.0.0.0:${PORT}`);
  console.log(`📤 Upload endpoint: POST http://0.0.0.0:${PORT}/process-image`);
  console.log(`📥 Generated images: http://0.0.0.0:${PORT}/generated/`);
});

module.exports = app; 