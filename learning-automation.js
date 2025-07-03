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
const SCREENSHOT_DIR = './debug-screenshots';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshot(page, name) {
  try {
    await ensureDirectoryExists(SCREENSHOT_DIR);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Screenshot failed: ${error.message}`);
  }
}

async function getMiinaImages() {
  const files = fs.readdirSync(MIINA_IMAGES_DIR);
  return files
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
    .map(file => path.join(MIINA_IMAGES_DIR, file))
    .slice(0, 5); // Start with 5 images for testing
}

async function findAndClickButton(page, buttonText, stepName) {
  console.log(`🔍 Looking for "${buttonText}" button...`);
  
  // Take screenshot before attempting to click
  await takeScreenshot(page, `before-${stepName}`);
  
  // Try multiple approaches to find the button
  const selectors = [
    // Text-based selectors
    `button:has-text("${buttonText}")`,
    `a:has-text("${buttonText}")`,
    // Aria-label selectors
    `button[aria-label*="${buttonText}"]`,
    `a[aria-label*="${buttonText}"]`,
    // Data-testid selectors
    `[data-testid*="${buttonText.toLowerCase().replace(/\s+/g, '-')}"]`,
    // Generic button selectors
    'button',
    'a'
  ];
  
  for (const selector of selectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        // Check if this button has the right text
        const buttonText = await button.evaluate(el => el.textContent);
        if (buttonText.toLowerCase().includes(buttonText.toLowerCase())) {
          await button.click();
          console.log(`✅ Clicked "${buttonText}" with selector: ${selector}`);
          await delay(2000);
          await takeScreenshot(page, `after-${stepName}`);
          return true;
        }
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  // Fallback: try clicking by text content
  try {
    await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const targetButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes(text.toLowerCase())
      );
      if (targetButton) targetButton.click();
    }, buttonText);
    console.log(`✅ Attempted to click "${buttonText}" by text content`);
    await delay(2000);
    await takeScreenshot(page, `after-${stepName}-fallback`);
    return true;
  } catch (e) {
    console.log(`❌ Failed to click "${buttonText}"`);
    await takeScreenshot(page, `failed-${stepName}`);
    return false;
  }
}

async function fillCredentials(page) {
  console.log('🔑 Filling credentials...');
  await takeScreenshot(page, 'before-credentials');
  
  try {
    // Fill username
    const usernameInput = await page.$('input[name="username"], input[aria-label*="username"], input[placeholder*="username"]');
    if (usernameInput) {
      await usernameInput.click();
      await usernameInput.type(INSTAGRAM_CREDENTIALS.username);
      console.log('✅ Username filled');
      await delay(1000);
    } else {
      console.log('❌ Username input not found');
      await takeScreenshot(page, 'username-input-not-found');
    }
    
    // Fill password
    const passwordInput = await page.$('input[name="password"], input[aria-label*="password"], input[placeholder*="password"]');
    if (passwordInput) {
      await passwordInput.click();
      await passwordInput.type(INSTAGRAM_CREDENTIALS.password);
      console.log('✅ Password filled');
      await delay(1000);
    } else {
      console.log('❌ Password input not found');
      await takeScreenshot(page, 'password-input-not-found');
    }
    
    await takeScreenshot(page, 'after-credentials');
    return true;
  } catch (error) {
    console.error('❌ Error filling credentials:', error.message);
    await takeScreenshot(page, 'credentials-error');
    return false;
  }
}

async function completeLogin(page) {
  console.log('🔐 Starting learning login process...');
  
  try {
    // Step 1: Click "Log in" button
    const loginClicked = await findAndClickButton(page, 'Log in', 'login');
    if (!loginClicked) {
      console.log('❌ Failed to click Log in button');
      return false;
    }
    
    // Step 2: Click "Continue with Instagram"
    const continueClicked = await findAndClickButton(page, 'Continue with Instagram', 'continue-instagram');
    if (!continueClicked) {
      console.log('❌ Failed to click Continue with Instagram');
      return false;
    }
    
    // Step 3: Fill credentials
    const credentialsFilled = await fillCredentials(page);
    if (!credentialsFilled) {
      console.log('❌ Failed to fill credentials');
      return false;
    }
    
    // Step 4: Click submit
    const submitClicked = await findAndClickButton(page, 'Log In', 'submit');
    if (!submitClicked) {
      console.log('❌ Failed to click submit');
      return false;
    }
    
    // Wait for Meta AI chat page
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
          await takeScreenshot(page, 'chat-page-loaded');
          chatPageLoaded = true;
          break;
        }
        
        console.log(`⏳ Waiting for chat page... (${attempts}/${maxAttempts})`);
        await takeScreenshot(page, `waiting-chat-${attempts}`);
        
      } catch (e) {
        console.log(`⚠️ Error checking chat page: ${e.message}`);
      }
    }
    
    if (chatPageLoaded) {
      console.log('✅ Login process completed successfully!');
      return true;
    } else {
      console.log('❌ Chat page did not load');
      await takeScreenshot(page, 'chat-page-failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    await takeScreenshot(page, 'login-error');
    return false;
  }
}

async function processImage(page, imagePath, imageNumber) {
  console.log(`🎨 Processing image ${imageNumber}: ${path.basename(imagePath)}`);
  
  try {
    await takeScreenshot(page, `before-image-${imageNumber}`);
    
    // Find and click + button
    const plusButton = await page.$('button[aria-label*="+"], button[aria-label*="Add"], button[aria-label*="Upload"], .x1i10hfl');
    if (plusButton) {
      await plusButton.click();
      console.log('✅ + button clicked');
      await delay(2000);
      await takeScreenshot(page, `after-plus-click-${imageNumber}`);
    } else {
      console.log('❌ No + button found');
      await takeScreenshot(page, `no-plus-button-${imageNumber}`);
      return false;
    }

    // Wait for file chooser and select file
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({timeout: 10000}),
    ]);
    
    await fileChooser.accept([imagePath]);
    console.log('✅ File selected');
    await delay(3000);
    await takeScreenshot(page, `after-file-select-${imageNumber}`);
    
    // Find chat input and send prompt
    const chatInput = await page.$('textarea, [contenteditable="true"], [role="textbox"]');
    if (chatInput) {
      await chatInput.type("Transform this into beautiful anime style");
      await page.keyboard.press('Enter');
      console.log('✅ Prompt sent');
      await delay(8000); // Wait for generation
      await takeScreenshot(page, `after-prompt-${imageNumber}`);
    }
    
    // Download the generated image
    const downloadSuccess = await downloadImage(page, imagePath, imageNumber);
    return downloadSuccess;
    
  } catch (error) {
    console.error(`❌ Processing failed: ${error.message}`);
    await takeScreenshot(page, `image-error-${imageNumber}`);
    return false;
  }
}

async function downloadImage(page, originalImagePath, imageNumber) {
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
      await takeScreenshot(page, `success-download-${imageNumber}`);
      return true;
    }

    console.log('❌ No generated image found');
    await takeScreenshot(page, `no-generated-image-${imageNumber}`);
    return false;
  } catch (error) {
    console.error(`❌ Error downloading: ${error.message}`);
    await takeScreenshot(page, `download-error-${imageNumber}`);
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
  console.log('🚀 Starting LEARNING Meta AI Automation...');
  console.log('📸 This version takes screenshots and learns from failures');
  
  await ensureDirectoryExists(OUTPUT_DIR);
  await ensureDirectoryExists(SCREENSHOT_DIR);
  
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
    await takeScreenshot(page, 'initial-page');
    
    // Complete login process
    const loginSuccess = await completeLogin(page);
    if (!loginSuccess) {
      console.log('❌ Login failed - check screenshots in debug-screenshots folder');
      console.log('🔄 You may need to manually complete login and restart the script');
      return;
    }
    
    // Process images
    let processedCount = 0;
    for (let i = 0; i < miinaImages.length; i++) {
      const imagePath = miinaImages[i];
      console.log(`\n🔄 Processing image ${i + 1}/${miinaImages.length}: ${path.basename(imagePath)}`);
      
      const success = await processImage(page, imagePath, i + 1);
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
    
    console.log(`\n🎉 LEARNING Automation completed!`);
    console.log(`📊 Results: ${processedCount}/${miinaImages.length} images processed`);
    console.log(`📁 Anime images saved to: ${OUTPUT_DIR}`);
    console.log(`📸 Debug screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('🌐 Your Images page is now filled with anime images!');
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
    await takeScreenshot(page, 'final-error');
  } finally {
    console.log('🔓 Browser will stay open for inspection...');
    await new Promise(() => {}); // Keep running
  }
}

main().catch(console.error); 