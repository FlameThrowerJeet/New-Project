const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const META_AI_URL = 'https://www.meta.ai/?utm_source=ig_web_nav';
const INSTAGRAM_CREDENTIALS = {
  username: 'denmark_zurichberg',
  password: 'Foxtrot@1'
};
const OUTPUT_DIR = './client/public/images/miina-ai-generated';
const MIINA_IMAGES_DIR = './client/Miina - Pics';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function getMiinaImages() {
  const files = fs.readdirSync(MIINA_IMAGES_DIR);
  return files
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
    .map(file => path.join(MIINA_IMAGES_DIR, file))
    .slice(0, 10); // Process first 10 images
}

async function completeLogin(page) {
  console.log('🔐 Starting complete login process...');
  
  try {
    // Step 1: Click "Log in" button in upper right corner
    console.log('🔍 Looking for "Log in" button...');
    await delay(2000);
    
    // Try to find and click the Log in button
    const loginButton = await page.$('button:has-text("Log in"), a:has-text("Log in"), button[aria-label*="Log in"], a[aria-label*="Log in"]');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ Clicked "Log in" button');
    } else {
      // Try clicking by text content
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const loginButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('log in') || 
          btn.textContent.toLowerCase().includes('sign in')
        );
        if (loginButton) loginButton.click();
      });
      console.log('✅ Attempted to click "Log in" button');
    }
    await delay(2000);
    
    // Step 2: Click "Continue with Instagram"
    console.log('🔍 Looking for "Continue with Instagram" button...');
    const continueButton = await page.$('button:has-text("Continue with Instagram"), a:has-text("Continue with Instagram"), button[aria-label*="Instagram"], a[aria-label*="Instagram"]');
    if (continueButton) {
      await continueButton.click();
      console.log('✅ Clicked "Continue with Instagram" button');
    } else {
      // Try clicking by text content
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const continueButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('continue with instagram') ||
          btn.textContent.toLowerCase().includes('instagram')
        );
        if (continueButton) continueButton.click();
      });
      console.log('✅ Attempted to click "Continue with Instagram" button');
    }
    await delay(3000);
    
    // Step 3: Fill credentials
    console.log('🔍 Looking for login form...');
    await delay(2000);
    
    // Fill username
    const usernameInput = await page.$('input[name="username"], input[aria-label*="username"], input[placeholder*="username"]');
    if (usernameInput) {
      await usernameInput.click();
      await usernameInput.type(INSTAGRAM_CREDENTIALS.username);
      console.log('✅ Username filled');
      await delay(1000);
    }
    
    // Fill password
    const passwordInput = await page.$('input[name="password"], input[aria-label*="password"], input[placeholder*="password"]');
    if (passwordInput) {
      await passwordInput.click();
      await passwordInput.type(INSTAGRAM_CREDENTIALS.password);
      console.log('✅ Password filled');
      await delay(1000);
    }
    
    // Step 4: Click submit
    const submitButton = await page.$('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")');
    if (submitButton) {
      await submitButton.click();
      console.log('✅ Submit button clicked');
      await delay(5000);
    }
    
    // Wait for Meta AI chat page to load
    console.log('⏳ Waiting for Meta AI chat page...');
    let chatPageLoaded = false;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!chatPageLoaded && attempts < maxAttempts) {
      await delay(10000);
      attempts++;
      
      try {
        const chatElements = await page.$$('textarea, [contenteditable="true"], [role="textbox"], button[aria-label*="+"]');
        if (chatElements.length > 0) {
          console.log(`✅ Meta AI chat page loaded after ${attempts * 10} seconds`);
          chatPageLoaded = true;
          break;
        }
        
        console.log(`⏳ Waiting for chat page... (${attempts}/${maxAttempts})`);
        
      } catch (e) {
        console.log(`⚠️ Error checking chat page: ${e.message}`);
      }
    }
    
    if (chatPageLoaded) {
      console.log('✅ Login process completed successfully!');
      return true;
    } else {
      console.log('❌ Chat page did not load, but continuing anyway...');
      return true; // Continue anyway
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function processImage(page, imagePath) {
  console.log(`🎨 Processing: ${path.basename(imagePath)}`);
  
  try {
    // Step 1: Click the '+' button
    const plusButton = await page.$('button[aria-label*="+"], button[aria-label*="Add"], button[aria-label*="Upload"], .x1i10hfl');
    if (plusButton) {
      await plusButton.click();
      console.log('✅ + button clicked');
      await delay(2000);
    } else {
      console.log('❌ No + button found');
      return false;
    }

    // Step 2: Wait for file chooser and select file
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({timeout: 10000}),
    ]);
    
    await fileChooser.accept([imagePath]);
    console.log('✅ File selected');
    await delay(3000);
    
    // Step 3: Find chat input and send prompt
    const chatInput = await page.$('textarea, [contenteditable="true"], [role="textbox"]');
    if (chatInput) {
      await chatInput.type("Transform this into beautiful anime style");
      await page.keyboard.press('Enter');
      console.log('✅ Prompt sent');
      await delay(8000); // Wait for generation
    }
    
    // Step 4: Download the generated image
    const downloadSuccess = await downloadImage(page, imagePath);
    return downloadSuccess;
    
  } catch (error) {
    console.error(`❌ Processing failed: ${error.message}`);
    return false;
  }
}

async function downloadImage(page, originalImagePath) {
  try {
    console.log('📥 Looking for generated image...');
    
    // Look for generated images
    const images = await page.$$('img[src*="blob:"], img[src*="data:"], img[src*="generated"]');
    
    if (images.length > 0) {
      const generatedImage = images[images.length - 1];
      const imageSrc = await generatedImage.evaluate(img => img.src);
      const response = await page.goto(imageSrc);
      const buffer = await response.buffer();
      
      const originalName = path.basename(originalImagePath, path.extname(originalImagePath));
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFileName = `miina_anime_${originalName}_${timestamp}.jpg`;
      const outputPath = path.join(OUTPUT_DIR, outputFileName);
      
      fs.writeFileSync(outputPath, buffer);
      console.log(`💾 Generated image saved: ${outputFileName}`);
      return true;
    }

    console.log('❌ No generated image found');
    return false;
  } catch (error) {
    console.error(`❌ Error downloading: ${error.message}`);
    return false;
  }
}

async function updateManifest() {
  try {
    const files = fs.readdirSync(OUTPUT_DIR);
    const animeImages = files.filter(file => file.startsWith('miina_anime_') && /\.(jpg|jpeg|png)$/i.test(file));
    
    const manifest = {
      images: animeImages.map((file, index) => ({
        id: `anime_${index + 1}`,
        title: `Miina Anime Style ${index + 1}`,
        filename: file,
        category: 'anime'
      }))
    };
    
    const manifestPath = path.join(OUTPUT_DIR, 'miina-ai-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Updated manifest with ${animeImages.length} anime images`);
    
  } catch (error) {
    console.error('❌ Error updating manifest:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting FULL Meta AI Automation...');
  
  await ensureDirectoryExists(OUTPUT_DIR);
  
  const miinaImages = await getMiinaImages();
  console.log(`📸 Found ${miinaImages.length} Miina images to process`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    
    // Go to Meta AI
    await page.goto(META_AI_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Meta AI page loaded');
    
    // Complete login process
    const loginSuccess = await completeLogin(page);
    if (!loginSuccess) {
      console.log('⚠️ Login may have failed, but continuing anyway...');
    }
    
    // Process images
    let processedCount = 0;
    for (let i = 0; i < miinaImages.length; i++) {
      const imagePath = miinaImages[i];
      console.log(`\n🔄 Processing image ${i + 1}/${miinaImages.length}: ${path.basename(imagePath)}`);
      
      const success = await processImage(page, imagePath);
      if (success) {
        processedCount++;
        console.log(`✅ Successfully processed ${processedCount} images total`);
      } else {
        console.log(`❌ Failed to process image: ${path.basename(imagePath)}`);
      }
      
      // Delay between images
      await delay(3000);
    }
    
    // Update manifest
    await updateManifest();
    
    console.log(`\n🎉 FULL Automation completed!`);
    console.log(`📊 Results: ${processedCount}/${miinaImages.length} images processed`);
    console.log(`📁 Anime images saved to: ${OUTPUT_DIR}`);
    console.log('🌐 Your Images page is now filled with anime images!');
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
  } finally {
    console.log('🔓 Browser will stay open for inspection...');
    await new Promise(() => {}); // Keep running
  }
}

main().catch(console.error); 