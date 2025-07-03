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
    .slice(0, 1); // Start with just 1 image
}

async function simpleLogin(page) {
  console.log('🔐 Simple login process...');
  
  try {
    // Go to Meta AI
    await page.goto(META_AI_URL, { waitUntil: 'networkidle0' });
    await delay(3000);
    
    // Click login
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in')
      );
      if (loginButton) loginButton.click();
    });
    console.log('✅ Login clicked');
    await delay(3000);
    
    // Click Continue with Instagram
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const instagramButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('continue with instagram')
      );
      if (instagramButton) instagramButton.click();
    });
    console.log('✅ Continue with Instagram clicked');
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
    console.log('✅ Credentials filled');
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
    console.log('✅ Submit clicked');
    
    // Wait for redirect
    await delay(15000);
    
    console.log('✅ Login completed');
    return true;
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function navigateToChatInterface(page) {
  console.log('🔍 Navigating to chat interface...');
  
  try {
    // Try different URLs to get to the chat interface
    const chatUrls = [
      'https://www.meta.ai/?__pwa=1',
      'https://www.meta.ai/chat',
      'https://www.meta.ai/?__pwa=1&nr=1',
      'https://www.meta.ai/?__pwa=1&chat=1'
    ];
    
    for (const url of chatUrls) {
      console.log(`🔍 Trying URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle0' });
      await delay(5000);
      
      // Check if we have chat interface
      const chatInput = await page.$('textarea, [contenteditable="true"], [role="textbox"]');
      const plusButton = await page.$('button[aria-label*="+"]');
      
      if (chatInput || plusButton) {
        console.log(`✅ Chat interface found at: ${url}`);
        return true;
      }
      
      console.log(`❌ No chat interface at: ${url}`);
    }
    
    console.log('❌ Chat interface not found at any URL');
    return false;
    
  } catch (error) {
    console.error('❌ Navigation failed:', error.message);
    return false;
  }
}

async function findPlusButton(page) {
  console.log('🔍 Looking for + button...');
  
  // Try multiple times
  for (let i = 0; i < 10; i++) {
    console.log(`Attempt ${i + 1}: Looking for + button...`);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Look for + button
    const plusButton = await page.$('button[aria-label*="+"]');
    if (plusButton) {
      console.log('✅ + button found!');
      return true;
    }
    
    // Try alternative selectors
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const ariaLabel = await button.evaluate(btn => btn.getAttribute('aria-label'));
      const textContent = await button.evaluate(btn => btn.textContent);
      
      if (ariaLabel && (ariaLabel.includes('+') || ariaLabel.includes('Add') || ariaLabel.includes('Upload'))) {
        console.log(`✅ Found + button with aria-label: ${ariaLabel}`);
        return true;
      }
      
      if (textContent && (textContent.includes('+') || textContent.includes('Add'))) {
        console.log(`✅ Found + button with text: ${textContent}`);
        return true;
      }
    }
    
    console.log(`❌ Attempt ${i + 1}: + button not found`);
    
    if (i < 9) {
      console.log('🔄 Refreshing page...');
      await page.reload({ waitUntil: 'networkidle0' });
      await delay(3000);
    }
  }
  
  console.log('❌ + button not found after 10 attempts');
  return false;
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

async function main() {
  console.log('🚀 Starting MANUAL NAVIGATION Meta AI Automation...');
  
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
      // Navigate to chat interface
      const chatFound = await navigateToChatInterface(page);
      console.log(`Chat interface: ${chatFound ? 'Found' : 'Not found'}`);
      
      if (chatFound) {
        // Find + button
        const plusButtonFound = await findPlusButton(page);
        console.log(`+ button: ${plusButtonFound ? 'Found' : 'Not found'}`);
        
        if (plusButtonFound) {
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
          
          console.log(`\n🎉 MANUAL NAVIGATION Automation completed!`);
          console.log(`📊 Results: ${processedCount}/${miinaImages.length} images processed`);
          console.log(`📁 Anime images saved to: ${OUTPUT_DIR}`);
        } else {
          console.log('❌ Could not find + button, automation failed');
        }
      } else {
        console.log('❌ Could not find chat interface, automation failed');
      }
    }
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
  } finally {
    console.log('🔓 Browser will stay open...');
    await new Promise(() => {});
  }
}

main().catch(console.error); 