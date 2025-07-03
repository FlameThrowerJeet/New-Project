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

async function quickLogin(page) {
  console.log('🚀 Quick login process...');
  
  try {
    // Go to Meta AI
    await page.goto(META_AI_URL, { waitUntil: 'networkidle0', timeout: 15000 });
    await delay(1000);
    
    // Click login immediately
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in') || 
        btn.textContent.toLowerCase().includes('sign in')
      );
      if (loginButton) loginButton.click();
    });
    console.log('✅ Login clicked');
    await delay(1000);
    
    // Click Continue with Instagram immediately
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const continueButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('continue with instagram') ||
        btn.textContent.toLowerCase().includes('instagram')
      );
      if (continueButton) continueButton.click();
    });
    console.log('✅ Continue with Instagram clicked');
    await delay(1000);
    
    // Enter credentials immediately
    await page.evaluate((credentials) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const usernameInput = inputs.find(input => input.type === 'text' || input.name === 'username');
      const passwordInput = inputs.find(input => input.type === 'password' || input.name === 'password');
      
      if (usernameInput) {
        usernameInput.value = credentials.username;
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passwordInput) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, INSTAGRAM_CREDENTIALS);
    console.log('✅ Credentials entered');
    await delay(500);
    
    // Click submit immediately
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in') || 
        btn.textContent.toLowerCase().includes('sign in') ||
        btn.type === 'submit'
      );
      if (submitButton) submitButton.click();
    });
    console.log('✅ Submit clicked');
    
    // Wait just a bit for redirect
    await delay(5000);
    
    console.log('✅ Quick login completed');
    return true;
    
  } catch (error) {
    console.error('❌ Quick login failed:', error.message);
    return false;
  }
}

async function processImageQuick(page, imagePath) {
  console.log(`🎨 Quick processing: ${path.basename(imagePath)}`);
  
  try {
    // Find and click + button immediately
    const plusButton = await page.$('button[aria-label*="+"], button[aria-label*="Add"], button[aria-label*="Upload"], .x1i10hfl');
    if (plusButton) {
      await plusButton.click();
      console.log('✅ + button clicked');
      await delay(1000);
    } else {
      console.log('❌ No + button found');
      return false;
    }

    // Wait for file chooser and select file
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({timeout: 5000}),
    ]);
    
    await fileChooser.accept([imagePath]);
    console.log('✅ File selected');
    await delay(2000);
    
    // Find chat input and send prompt
    const chatInput = await page.$('textarea, [contenteditable="true"], [role="textbox"]');
    if (chatInput) {
      await chatInput.type("Transform this into beautiful anime style");
      await page.keyboard.press('Enter');
      console.log('✅ Prompt sent');
      await delay(5000); // Wait for generation
    }
    
    // Download the generated image
    const downloadSuccess = await downloadImageQuick(page, imagePath);
    return downloadSuccess;
    
  } catch (error) {
    console.error(`❌ Quick processing failed: ${error.message}`);
    return false;
  }
}

async function downloadImageQuick(page, originalImagePath) {
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

async function updateManifestQuick() {
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
  console.log('🚀 Starting AGGRESSIVE Meta AI Automation...');
  
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
    
    // Quick login - no stalling
    const loginSuccess = await quickLogin(page);
    if (!loginSuccess) {
      console.log('⚠️ Login may have failed, but continuing anyway...');
    }
    
    // Give user time to manually complete login if needed
    console.log('⏳ Waiting 30 seconds for manual login completion if needed...');
    await delay(30000);
    
    // Process images quickly
    let processedCount = 0;
    for (let i = 0; i < miinaImages.length; i++) {
      const imagePath = miinaImages[i];
      console.log(`\n🔄 Processing image ${i + 1}/${miinaImages.length}: ${path.basename(imagePath)}`);
      
      const success = await processImageQuick(page, imagePath);
      if (success) {
        processedCount++;
        console.log(`✅ Successfully processed ${processedCount} images total`);
      } else {
        console.log(`❌ Failed to process image: ${path.basename(imagePath)}`);
      }
      
      // Short delay between images
      await delay(2000);
    }
    
    // Update manifest
    await updateManifestQuick();
    
    console.log(`\n🎉 AGGRESSIVE Automation completed!`);
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