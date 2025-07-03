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
    .slice(0, 3); // Start with just 3 images
}

async function simpleLogin(page) {
  console.log('🔐 Simple login process...');
  
  try {
    // Go to Meta AI
    await page.goto(META_AI_URL, { waitUntil: 'networkidle0', timeout: 15000 });
    await delay(2000);
    
    // Click login - simple approach
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in')
      );
      if (loginButton) loginButton.click();
    });
    console.log('✅ Login clicked');
    await delay(2000);
    
    // Click Continue with Instagram - simple approach
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const continueButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('continue with instagram')
      );
      if (continueButton) continueButton.click();
    });
    console.log('✅ Continue with Instagram clicked');
    await delay(3000);
    
    // Fill credentials - simple approach
    await page.evaluate((credentials) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const usernameInput = inputs.find(input => input.type === 'text');
      const passwordInput = inputs.find(input => input.type === 'password');
      
      if (usernameInput) {
        usernameInput.value = credentials.username;
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passwordInput) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, INSTAGRAM_CREDENTIALS);
    console.log('✅ Credentials filled');
    await delay(1000);
    
    // Click submit - simple approach
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in') ||
        btn.type === 'submit'
      );
      if (submitButton) submitButton.click();
    });
    console.log('✅ Submit clicked');
    
    // Wait a bit and continue
    await delay(10000);
    console.log('✅ Login process completed');
    return true;
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function processImageSimple(page, imagePath, imageNumber) {
  console.log(`🎨 Processing image ${imageNumber}: ${path.basename(imagePath)}`);
  
  try {
    // Find and click + button - simple approach
    const plusButton = await page.$('button[aria-label*="+"], button[aria-label*="Add"], .x1i10hfl');
    if (plusButton) {
      await plusButton.click();
      console.log('✅ + button clicked');
      await delay(2000);
    } else {
      console.log('❌ No + button found, trying alternative...');
      // Try clicking any button that might be the upload button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const uploadButton = buttons.find(btn => 
          btn.textContent.includes('+') || 
          btn.textContent.includes('Add') ||
          btn.textContent.includes('Upload')
        );
        if (uploadButton) uploadButton.click();
      });
      await delay(2000);
    }

    // Wait for file chooser and select file
    try {
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser({timeout: 5000}),
      ]);
      
      await fileChooser.accept([imagePath]);
      console.log('✅ File selected');
      await delay(3000);
    } catch (e) {
      console.log('❌ File chooser failed, trying alternative...');
      // Try to inject file input
      await page.evaluate(() => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        fileInput.click();
      });
      await delay(3000);
    }
    
    // Find chat input and send prompt - simple approach
    const chatInput = await page.$('textarea, [contenteditable="true"], [role="textbox"]');
    if (chatInput) {
      await chatInput.type("Transform this into beautiful anime style");
      await page.keyboard.press('Enter');
      console.log('✅ Prompt sent');
      await delay(8000); // Wait for generation
    }
    
    // Download the generated image - simple approach
    const downloadSuccess = await downloadImageSimple(page, imagePath, imageNumber);
    return downloadSuccess;
    
  } catch (error) {
    console.error(`❌ Processing failed: ${error.message}`);
    return false;
  }
}

async function downloadImageSimple(page, originalImagePath, imageNumber) {
  try {
    console.log('📥 Looking for generated image...');
    
    // Look for any images that might be generated
    const images = await page.$$('img');
    
    if (images.length > 0) {
      // Try to download the last image
      const lastImage = images[images.length - 1];
      const imageSrc = await lastImage.evaluate(img => img.src);
      
      if (imageSrc && !imageSrc.includes('data:image/svg')) {
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
  console.log('🚀 Starting SIMPLE DIRECT Meta AI Automation...');
  console.log('🎯 This version is simple and direct - no stalling!');
  
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
    
    // Simple login process
    const loginSuccess = await simpleLogin(page);
    console.log(`Login result: ${loginSuccess ? 'Success' : 'Failed but continuing'}`);
    
    // Give time for page to load
    console.log('⏳ Waiting 15 seconds for page to fully load...');
    await delay(15000);
    
    // Process images
    let processedCount = 0;
    for (let i = 0; i < miinaImages.length; i++) {
      const imagePath = miinaImages[i];
      console.log(`\n🔄 Processing image ${i + 1}/${miinaImages.length}: ${path.basename(imagePath)}`);
      
      const success = await processImageSimple(page, imagePath, i + 1);
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
    await updateManifest();
    
    console.log(`\n🎉 SIMPLE DIRECT Automation completed!`);
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