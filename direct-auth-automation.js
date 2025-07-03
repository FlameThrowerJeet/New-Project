const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
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
    .slice(0, 2);
}

async function handleAuthPage(page) {
  console.log('🔐 Handling Meta auth page...');
  
  try {
    // Wait for page to load
    await delay(3000);
    
    // Method 1: Look for "Continue with Instagram" button with multiple approaches
    console.log('🔍 Method 1: Looking for "Continue with Instagram" button...');
    
    const instagramButtonFound = await page.evaluate(() => {
      // Try multiple selectors
      const selectors = [
        'button[data-testid*="instagram"]',
        'button[aria-label*="instagram"]',
        'a[href*="instagram"]',
        'button:contains("Continue with Instagram")',
        'button:contains("Instagram")',
        '[role="button"]:contains("Instagram")',
        'button[class*="instagram"]',
        'div[role="button"]:contains("Instagram")'
      ];
      
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            console.log('Found Instagram button with selector:', selector);
            element.click();
            return true;
          }
        } catch (e) {}
      }
      
      // Try text-based search
      const allElements = Array.from(document.querySelectorAll('*'));
      const instagramElement = allElements.find(el => {
        const text = el.textContent || '';
        return text.toLowerCase().includes('continue with instagram') ||
               text.toLowerCase().includes('instagram');
      });
      
      if (instagramElement) {
        console.log('Found Instagram button via text search');
        instagramElement.click();
        return true;
      }
      
      // Try clicking any button that contains "Instagram"
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const instagramButton = buttons.find(btn => {
        const text = btn.textContent || '';
        return text.toLowerCase().includes('instagram');
      });
      
      if (instagramButton) {
        console.log('Found Instagram button via button search');
        instagramButton.click();
        return true;
      }
      
      return false;
    });
    
    if (instagramButtonFound) {
      console.log('✅ Instagram button clicked');
      await delay(8000); // Wait for Instagram login page
    } else {
      console.log('❌ Instagram button not found, trying alternative...');
    }
    
    // Method 2: Try clicking any button that might be Instagram
    if (!instagramButtonFound) {
      console.log('🔍 Method 2: Trying to click any Instagram-related button...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        buttons.forEach(btn => {
          const text = btn.textContent || '';
          if (text.toLowerCase().includes('instagram') || text.toLowerCase().includes('continue')) {
            console.log('Clicking potential button:', text);
            btn.click();
          }
        });
      });
      await delay(5000);
    }
    
    // Method 3: Try direct Instagram login if we're still on auth page
    const currentUrl = page.url();
    if (currentUrl.includes('auth.meta.com')) {
      console.log('🔍 Method 3: Still on auth page, trying direct Instagram login...');
      await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle0' });
      await delay(3000);
    }
    
    // Fill Instagram credentials
    console.log('🔍 Filling Instagram credentials...');
    await page.evaluate((credentials) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const usernameInput = inputs.find(input => 
        input.name === 'username' || 
        input.placeholder && input.placeholder.toLowerCase().includes('username') ||
        input.type === 'text'
      );
      const passwordInput = inputs.find(input => 
        input.name === 'password' || 
        input.type === 'password'
      );
      
      if (usernameInput) {
        usernameInput.value = credentials.username;
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('Username filled');
      }
      if (passwordInput) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('Password filled');
      }
    }, INSTAGRAM_CREDENTIALS);
    await delay(2000);
    
    // Click login
    console.log('🔍 Clicking Instagram login...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in') ||
        btn.textContent.toLowerCase().includes('sign in') ||
        btn.type === 'submit'
      );
      if (loginButton) loginButton.click();
    });
    
    console.log('✅ Instagram login submitted');
    await delay(15000); // Wait for redirect
    
    // Navigate back to Meta AI PWA
    console.log('🔍 Navigating back to Meta AI PWA...');
    await page.goto(META_AI_URL, { waitUntil: 'networkidle0' });
    await delay(5000);
    
    console.log('✅ Auth page handling completed');
    return true;
    
  } catch (error) {
    console.error('❌ Auth page handling failed:', error.message);
    return false;
  }
}

async function directLogin(page) {
  console.log('🔐 Direct login process...');
  
  try {
    // Go to Meta AI PWA
    await page.goto(META_AI_URL, { waitUntil: 'networkidle0' });
    await delay(5000);
    
    // Check if we're redirected to auth page
    const currentUrl = page.url();
    if (currentUrl.includes('auth.meta.com')) {
      console.log('🔍 Redirected to auth page, handling...');
      const authSuccess = await handleAuthPage(page);
      if (!authSuccess) {
        console.log('❌ Auth page handling failed');
        return false;
      }
    } else {
      console.log('✅ Already on Meta AI PWA page');
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
      console.log('❌ + button not found, trying to refresh...');
      await page.reload({ waitUntil: 'networkidle0' });
      await delay(5000);
      
      const hasPlusButtonAfterRefresh = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => 
          btn.textContent.includes('+') ||
          btn.getAttribute('aria-label')?.includes('+') ||
          btn.getAttribute('aria-label')?.includes('Add')
        );
      });
      
      return hasPlusButtonAfterRefresh;
    }
    
  } catch (error) {
    console.error('❌ Direct login failed:', error.message);
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
    } else {
      console.log('❌ + button not found');
      return false;
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
  console.log('🚀 Starting DIRECT Meta AI Automation...');
  console.log('🎯 This version specifically handles the auth page!');
  
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
    
    // Direct login process
    const loginSuccess = await directLogin(page);
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
      
      console.log(`\n🎉 DIRECT Automation completed!`);
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