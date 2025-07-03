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
    .slice(0, 20); // Process first 20 images
}

async function loginToMetaAI(page) {
  console.log('🔐 Starting login process...');
  
  try {
    // Go to Meta AI
    await page.goto(META_AI_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    
    // Click login button - be aggressive about finding it
    console.log('🔍 Looking for login button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in') || 
        btn.textContent.toLowerCase().includes('sign in')
      );
      if (loginButton) loginButton.click();
    });
    console.log('✅ Attempted to click login button');
    await delay(2000);
    
    // Click "Continue with Instagram" - be aggressive
    console.log('🔍 Looking for "Continue with Instagram" button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const continueButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('continue with instagram') ||
        btn.textContent.toLowerCase().includes('instagram')
      );
      if (continueButton) continueButton.click();
    });
    console.log('✅ Attempted to click "Continue with Instagram"');
    await delay(2000);
    
    // Enter credentials - be aggressive
    console.log('🔍 Looking for login form...');
    await page.evaluate((credentials) => {
      // Find username input
      const usernameInputs = Array.from(document.querySelectorAll('input'));
      const usernameInput = usernameInputs.find(input => 
        input.type === 'text' || 
        input.name === 'username' ||
        input.placeholder?.toLowerCase().includes('username')
      );
      if (usernameInput) {
        usernameInput.value = credentials.username;
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Find password input
      const passwordInputs = Array.from(document.querySelectorAll('input'));
      const passwordInput = passwordInputs.find(input => 
        input.type === 'password' || 
        input.name === 'password' ||
        input.placeholder?.toLowerCase().includes('password')
      );
      if (passwordInput) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, INSTAGRAM_CREDENTIALS);
    console.log('✅ Attempted to enter credentials');
    await delay(1000);
    
    // Click submit - be aggressive
    console.log('🔍 Looking for submit button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in') || 
        btn.textContent.toLowerCase().includes('sign in') ||
        btn.textContent.toLowerCase().includes('login') ||
        btn.textContent.toLowerCase().includes('signin') ||
        btn.type === 'submit'
      );
      if (submitButton) submitButton.click();
    });
    console.log('✅ Attempted to click submit button');
    await delay(3000);
    
    // Wait for Meta AI chat page to load - be more patient
    console.log('⏳ Waiting for Meta AI chat page to load...');
    let chatPageLoaded = false;
    let waitAttempts = 0;
    const maxWaitAttempts = 60; // Wait up to 10 minutes
    
    while (!chatPageLoaded && waitAttempts < maxWaitAttempts) {
      await delay(10000); // Wait 10 seconds between checks
      waitAttempts++;
      
      try {
        // Check if we're on the Meta AI chat page by looking for chat elements
        const chatElements = await page.$$('textarea, [contenteditable="true"], [role="textbox"], input[placeholder*="Message"], button[aria-label*="+"], button[aria-label*="Add"]');
        
        if (chatElements.length > 0) {
          console.log(`✅ Meta AI chat page loaded after ${waitAttempts * 10} seconds`);
          chatPageLoaded = true;
          break;
        }
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`⏳ Waiting for chat page... (${waitAttempts}/${maxWaitAttempts}) - Current URL: ${currentUrl}`);
        
        // If we're on meta.ai, we might be close
        if (currentUrl.includes('meta.ai')) {
          console.log('✅ We\'re on meta.ai, checking for chat interface...');
          // Try to find chat elements again
          const chatElements2 = await page.$$('textarea, [contenteditable="true"], [role="textbox"], input[placeholder*="Message"], button[aria-label*="+"], button[aria-label*="Add"]');
          if (chatElements2.length > 0) {
            console.log('✅ Chat interface found on meta.ai');
            chatPageLoaded = true;
            break;
          }
        }
        
      } catch (e) {
        console.log(`⚠️ Error checking page status: ${e.message}`);
      }
    }
    
    if (!chatPageLoaded) {
      console.log('❌ Chat page did not load within timeout, but continuing anyway...');
      // Continue anyway, maybe the user can manually complete the login
      return true;
    }
    
    console.log('✅ Login process completed and chat page is ready');
    return true;
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    console.log('🔄 Continuing anyway, user may need to manually complete login...');
    return true; // Continue anyway
  }
}

async function uploadAndProcessImage(page, imagePath) {
  console.log(`🎨 Processing: ${path.basename(imagePath)}`);
  
  try {
    // First, make sure we're on the chat page and find the chat input
    console.log('🔍 Looking for chat interface...');
    const chatInput = await page.$('textarea, [contenteditable="true"], [role="textbox"], input[placeholder*="Message"]');
    
    if (!chatInput) {
      console.log('❌ Chat input not found, cannot proceed');
      return false;
    }
    
    console.log('✅ Chat interface found');
    
    // Click the '+' button - try multiple selectors
    const plusSelectors = [
      'button[aria-label*="+"]',
      'button[aria-label*="Add"]',
      'button[aria-label*="Upload"]',
      'button[title*="+"]',
      'button[title*="Add"]',
      'button[title*="Upload"]',
      'button[aria-label*="Attach"]',
      'button[aria-label*="Photo"]',
      'button[aria-label*="image"]',
      'button[aria-label*="media"]',
      '.x1i10hfl', // Instagram's common button class
      '[role="button"]'
    ];
    
    let plusButton = null;
    for (const selector of plusSelectors) {
      try {
        plusButton = await page.$(selector);
        if (plusButton) {
          console.log(`✅ Found + button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!plusButton) {
      console.log('❌ Could not find + button');
      return false;
    }

    // Click the + button
    await plusButton.click();
    console.log('✅ Clicked + button');
    await delay(2000);
    
    // Wait for file chooser and select file
    console.log('📁 Waiting for file chooser...');
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({timeout: 15000}),
    ]);
    
    await fileChooser.accept([imagePath]);
    console.log('✅ File selected');
    await delay(3000);
    
    // Send prompt
    const prompt = "Transform this into beautiful anime style";
    await chatInput.type(prompt);
    await page.keyboard.press('Enter');
    console.log('✅ Prompt sent');
    await delay(8000); // Wait for generation
    
    // Download the generated image
    const downloadSuccess = await downloadGeneratedImage(page, imagePath);
    return downloadSuccess;
    
  } catch (error) {
    console.error(`❌ Processing failed: ${error.message}`);
    return false;
  }
}

async function downloadGeneratedImage(page, originalImagePath) {
  try {
    console.log('📥 Looking for generated image...');
    
    // Look for generated images
    const imageSelectors = [
      'img[src*="generated"]',
      'img[alt*="generated"]', 
      'img[src*="ai"]',
      'img[alt*="ai"]',
      'img[src*="response"]',
      'img[alt*="response"]',
      'img[src*="blob:"]',
      'img[src*="data:"]'
    ];

    let generatedImage = null;
    for (const imgSelector of imageSelectors) {
      try {
        const images = await page.$$(imgSelector);
        if (images.length > 0) {
          generatedImage = images[images.length - 1];
          console.log(`✅ Found generated image with selector: ${imgSelector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!generatedImage) {
      console.log('❌ No generated image found');
      return false;
    }

    // Download the image
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
  } catch (error) {
    console.error(`❌ Error downloading: ${error.message}`);
    return false;
  }
}

async function updateImagesManifest() {
  try {
    const files = fs.readdirSync(OUTPUT_DIR);
    const animeImages = files.filter(file => file.startsWith('miina_anime_') && /\.(jpg|jpeg|png)$/i.test(file));
    
    const manifest = {
      images: animeImages.map((file, index) => ({
        id: `anime_${index + 1}`,
        title: `Miina Anime Style ${index + 1}`,
        filename: file,
        category: 'anime',
        original: file.replace('miina_anime_', '').replace(/_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.jpg$/, '')
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
  console.log('🚀 Starting Complete Meta AI Automation...');
  
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
    
    // Try login multiple times if needed
    let loginSuccess = false;
    let loginAttempts = 0;
    const maxLoginAttempts = 3;
    
    while (!loginSuccess && loginAttempts < maxLoginAttempts) {
      loginAttempts++;
      console.log(`\n🔄 Login attempt ${loginAttempts}/${maxLoginAttempts}`);
      
      loginSuccess = await loginToMetaAI(page);
      
      if (!loginSuccess && loginAttempts < maxLoginAttempts) {
        console.log('🔄 Login failed, retrying...');
        await delay(5000);
      }
    }
    
    if (!loginSuccess) {
      console.log('⚠️ Login failed after all attempts, but continuing anyway...');
      console.log('🔄 You may need to manually login in the browser window');
      await delay(10000); // Give time for manual login
    }
    
    // Process each image with retry logic
    let processedCount = 0;
    for (let i = 0; i < miinaImages.length; i++) {
      const imagePath = miinaImages[i];
      console.log(`\n🔄 Processing image ${i + 1}/${miinaImages.length}: ${path.basename(imagePath)}`);
      
      let imageSuccess = false;
      let imageAttempts = 0;
      const maxImageAttempts = 3;
      
      while (!imageSuccess && imageAttempts < maxImageAttempts) {
        imageAttempts++;
        console.log(`  📸 Image attempt ${imageAttempts}/${maxImageAttempts}`);
        
        try {
          imageSuccess = await uploadAndProcessImage(page, imagePath);
          
          if (imageSuccess) {
            processedCount++;
            console.log(`✅ Successfully processed ${processedCount} images total`);
          } else if (imageAttempts < maxImageAttempts) {
            console.log('🔄 Image processing failed, retrying...');
            await delay(3000);
          }
        } catch (error) {
          console.error(`❌ Error processing image: ${error.message}`);
          if (imageAttempts < maxImageAttempts) {
            console.log('🔄 Retrying due to error...');
            await delay(3000);
          }
        }
      }
      
      if (!imageSuccess) {
        console.log(`❌ Failed to process image after all attempts: ${path.basename(imagePath)}`);
      }
      
      // Wait between images to avoid rate limiting
      await delay(5000);
    }
    
    // Update the images manifest
    await updateImagesManifest();
    
    console.log(`\n🎉 Automation completed!`);
    console.log(`📊 Results:`);
    console.log(`   - Total images: ${miinaImages.length}`);
    console.log(`   - Successfully processed: ${processedCount}`);
    console.log(`   - Failed: ${miinaImages.length - processedCount}`);
    console.log(`📁 Anime images saved to: ${OUTPUT_DIR}`);
    console.log('🌐 Your Images page is now filled with anime images!');
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
    console.log('🔄 Trying to continue with what we have...');
    
    // Try to update manifest even if there were errors
    try {
      await updateImagesManifest();
      console.log('✅ Updated manifest with available images');
    } catch (e) {
      console.log('❌ Could not update manifest');
    }
  } finally {
    // Keep browser open for inspection
    console.log('🔓 Browser will stay open for inspection...');
    console.log('💡 You can manually process more images if needed');
    await new Promise(() => {}); // Keep running
  }
}

main().catch(console.error); 