const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Simple configuration - using the correct PWA URL
const META_AI_URL = 'https://www.meta.ai/?__pwa=1';
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
    .slice(0, 2); // Just 2 images to start
}

async function simpleLogin(page) {
  console.log('🔐 Simple login process for PWA page...');
  
  try {
    // Go directly to Meta AI PWA
    await page.goto(META_AI_URL, { waitUntil: 'networkidle0' });
    await delay(5000); // Wait longer for PWA to load
    
    // Check if we need to login
    const needsLogin = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.some(btn => 
        btn.textContent.toLowerCase().includes('log in') ||
        btn.textContent.toLowerCase().includes('sign in')
      );
    });
    
    if (needsLogin) {
      console.log('🔍 Login required, proceeding with login...');
      
      // Click login if present
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const loginButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('log in')
        );
        if (loginButton) loginButton.click();
      });
      await delay(3000);
      
      // Click Continue with Instagram
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const instagramButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('continue with instagram')
        );
        if (instagramButton) instagramButton.click();
      });
      await delay(5000);
      
      // Fill credentials
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
      await delay(2000);
      
      // Submit
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('log in') ||
          btn.type === 'submit'
        );
        if (submitButton) submitButton.click();
      });
      
      console.log('✅ Login completed, waiting for redirect...');
      await delay(15000); // Wait for redirect back to PWA
      
      // Navigate back to PWA if needed
      await page.goto(META_AI_URL, { waitUntil: 'networkidle0' });
      await delay(5000);
    } else {
      console.log('✅ Already logged in or no login required');
    }
    
    // Verify we're on the PWA page with + button
    const hasPlusButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => 
        btn.textContent.includes('+') ||
        btn.getAttribute('aria-label')?.includes('+') ||
        btn.getAttribute('aria-label')?.includes('Add')
      );
    });
    
    if (hasPlusButton) {
      console.log('✅ Successfully on PWA page with + button');
      return true;
    } else {
      console.log('❌ + button not found on current page');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function processImage(page, imagePath, imageNumber) {
  console.log(`🎨 Processing image ${imageNumber}: ${path.basename(imagePath)}`);
  
  try {
    // Click + button
    const plusButton = await page.$('button[aria-label*="+"]');
    if (plusButton) {
      await plusButton.click();
      console.log('✅ + button clicked');
      await delay(2000);
    }
    
    // Upload file
    try {
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser({timeout: 5000}),
      ]);
      await fileChooser.accept([imagePath]);
      console.log('✅ File uploaded');
      await delay(3000);
    } catch (e) {
      console.log('❌ File upload failed');
      return false;
    }
    
    // Send prompt
    const chatInput = await page.$('textarea, [contenteditable="true"]');
    if (chatInput) {
      await chatInput.type("Transform this into beautiful anime style");
      await page.keyboard.press('Enter');
      console.log('✅ Prompt sent');
      await delay(8000);
    }
    
    // Download result
    const images = await page.$$('img');
    if (images.length > 0) {
      const lastImage = images[images.length - 1];
      const imageSrc = await lastImage.evaluate(img => img.src);
      
      if (imageSrc && !imageSrc.includes('data:image/svg')) {
        const response = await page.goto(imageSrc);
        const buffer = await response.buffer();
        
        const originalName = path.basename(imagePath, path.extname(imagePath));
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFileName = `miina_anime_${originalName}_${timestamp}.jpg`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);
        
        fs.writeFileSync(outputPath, buffer);
        console.log(`💾 Saved: ${outputFileName}`);
        return true;
      }
    }
    
    console.log('❌ No generated image found');
    return false;
    
  } catch (error) {
    console.error(`❌ Processing failed: ${error.message}`);
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
  console.log('🚀 Starting SIMPLE Meta AI Automation...');
  
  await ensureDirectoryExists(OUTPUT_DIR);
  
  const miinaImages = await getMiinaImages();
  console.log(`📸 Found ${miinaImages.length} Miina images to process`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Simple login
    const loginSuccess = await simpleLogin(page);
    console.log(`Login: ${loginSuccess ? 'Success' : 'Failed'}`);
    
    if (loginSuccess) {
      // Process images
      let processedCount = 0;
      for (let i = 0; i < miinaImages.length; i++) {
        const imagePath = miinaImages[i];
        console.log(`\n🔄 Processing ${i + 1}/${miinaImages.length}: ${path.basename(imagePath)}`);
        
        const success = await processImage(page, imagePath, i + 1);
        if (success) {
          processedCount++;
          console.log(`✅ Processed ${processedCount} images total`);
        }
        
        await delay(2000);
      }
      
      // Update manifest
      await updateManifest();
      
      console.log(`\n🎉 SIMPLE Automation completed!`);
      console.log(`📊 Results: ${processedCount}/${miinaImages.length} images processed`);
      console.log(`📁 Anime images saved to: ${OUTPUT_DIR}`);
    }
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
  } finally {
    console.log('🔓 Browser will stay open...');
    await new Promise(() => {});
  }
}

main().catch(console.error); 