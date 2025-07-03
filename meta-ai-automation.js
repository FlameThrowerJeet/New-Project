const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const INSTAGRAM_CREDENTIALS = {
  username: 'denmark_zurichberg', // User's actual username
  password: 'Foxtrot@1'  // User's actual password
};

const OUTPUT_DIR = path.join(__dirname, 'client', 'public', 'images', 'miina-ai-generated');
const MIINA_IMAGES_DIR = path.join(__dirname, 'client', 'Miina - Pics');
const PROMPT = "Transform this photo into an anime style, maintaining the same pose and composition but with anime aesthetics";

// Multiple selectors to try for Meta AI chat input
const META_AI_SELECTORS = [
  '[data-testid="message-input"]',
  'textarea[placeholder*="Message"]',
  'textarea[placeholder*="message"]',
  'input[placeholder*="Message"]',
  'input[placeholder*="message"]',
  '[contenteditable="true"]',
  'div[role="textbox"]',
  'textarea',
  'input[type="text"]'
];

// Add more selectors for upload button
const UPLOAD_BUTTON_SELECTORS = [
  'input[type="file"]',
  '[data-testid="file-input"]',
  'button[aria-label*="upload"]',
  'button[aria-label*="Upload"]',
  'button[aria-label*="Attach"]',
  'button[aria-label*="Photo"]',
  'button[aria-label*="image"]',
  'button[aria-label*="media"]',
  'button[title*="Upload"]',
  'button[title*="Photo"]',
  'button[title*="Attach"]',
  'button[title*="image"]',
  'button[title*="media"]',
  'svg[aria-label*="Photo"]',
  'svg[aria-label*="image"]',
  'svg[aria-label*="media"]',
  'svg[title*="Photo"]',
  'svg[title*="image"]',
  'svg[title*="media"]',
  '[role="button"]',
  '.x1i10hfl', // Instagram's generic button class
  '.x1lliihq', // Instagram's generic button class
];

// Add a universal delay function at the top
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Output directory created: ${dir}`);
  }
}

async function takeScreenshot(page, filename) {
  try {
    const screenshotPath = path.join(OUTPUT_DIR, filename);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return screenshotPath;
  } catch (error) {
    console.error(`❌ Failed to take screenshot: ${error.message}`);
  }
}

async function waitForSelector(page, selectors, timeout = 15000) {
  for (const selector of selectors) {
    try {
      console.log(`🔍 Trying selector: ${selector}`);
      await page.waitForSelector(selector, { timeout: 5000 });
      console.log(`✅ Found element with selector: ${selector}`);
      return selector;
    } catch (error) {
      console.log(`❌ Selector failed: ${selector}`);
    }
  }
  throw new Error(`No selectors worked: ${selectors.join(', ')}`);
}

async function navigateToMetaAI(page) {
  console.log('🧠 Navigating to Meta AI...');
  
  try {
    // Try multiple approaches to find Meta AI
    const metaAILinks = [
      'a[href*="meta.ai"]',
      'a[href*="ai.meta"]',
      'a[href*="messenger.com"]',
      'a[href*="instagram.com/direct"]',
      '[data-testid*="ai"]',
      '[data-testid*="meta"]'
    ];

    let metaAILink = null;
    for (const linkSelector of metaAILinks) {
      try {
        const links = await page.$$(linkSelector);
        if (links.length > 0) {
          metaAILink = links[0];
          console.log(`✅ Found Meta AI link with selector: ${linkSelector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Link selector failed: ${linkSelector}`);
      }
    }

    if (!metaAILink) {
      // Try direct navigation
      console.log('🔗 Trying direct navigation to Meta AI...');
      await page.goto('https://www.meta.ai', { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(3000);
    } else {
      await metaAILink.click();
      await delay(3000);
    }

    // Take screenshot for debugging
    await takeScreenshot(page, 'meta-ai-navigation.png');

    // Wait for chat input with multiple selectors
    const chatSelector = await waitForSelector(page, META_AI_SELECTORS, 20000);
    console.log(`✅ Successfully navigated to Meta AI with selector: ${chatSelector}`);
    
    return chatSelector;
  } catch (error) {
    console.error(`❌ Failed to navigate to Meta AI: ${error.message}`);
    await takeScreenshot(page, 'meta-ai-error.png');
    throw error;
  }
}

async function uploadImageToMetaAI(page, imagePath) {
  console.log(`📤 Uploading: ${imagePath}`);
  
  try {
    // Step 1: Click the '+' button (most common selector)
    const plusButton = await page.$('button[aria-label*="+"], button[aria-label*="Add"], button[aria-label*="Upload"], button[title*="+"], button[title*="Add"], button[title*="Upload"], .x1i10hfl');
    
    if (plusButton) {
      await plusButton.click();
      console.log('✅ Clicked + button');
      await delay(2000);
    } else {
      console.log('❌ Could not find + button');
      return false;
    }

    // Step 2: Wait for file chooser and select file
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({timeout: 10000}),
    ]);
    
    await fileChooser.accept([imagePath]);
    console.log('✅ File selected');
    await delay(3000);
    
    return true;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    return false;
  }
}

async function downloadGeneratedImage(page, originalImagePath) {
  try {
    console.log('📥 Looking for generated image...');
    
    // Wait for image to appear
    await delay(5000);
    
    // Look for generated images with various selectors
    const imageSelectors = [
      'img[src*="generated"]',
      'img[alt*="generated"]', 
      'img[src*="ai"]',
      'img[alt*="ai"]',
      'img[src*="response"]',
      'img[alt*="response"]',
      'img[src*="blob:"]',
      'img[src*="data:"]',
      '.generated-image img',
      '[data-testid="generated-image"] img',
      'img[class*="generated"]',
      'img[class*="ai"]'
    ];

    let generatedImage = null;
    for (const imgSelector of imageSelectors) {
      try {
        const images = await page.$$(imgSelector);
        if (images.length > 0) {
          generatedImage = images[images.length - 1]; // Get the latest image
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
    console.error(`❌ Error downloading generated image: ${error.message}`);
    return false;
  }
}

async function processImage(page, imagePath, chatSelector) {
  console.log(`🎨 Processing: ${path.basename(imagePath)}`);
  
  try {
    // Step 1: Upload image
    const uploadSuccess = await uploadImageToMetaAI(page, imagePath);
    if (!uploadSuccess) {
      console.log('❌ Upload failed');
      return false;
    }

    // Step 2: Send prompt
    const prompt = "Transform this into beautiful anime style";
    await page.type(chatSelector, prompt);
    await page.keyboard.press('Enter');
    console.log('✅ Prompt sent');
    
    // Step 3: Wait for response (5-10 seconds like manual)
    await delay(8000);
    
    // Step 4: Download the generated image
    const downloadSuccess = await downloadGeneratedImage(page, imagePath);
    return downloadSuccess;

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🤖 Initializing Meta AI Automation...');
  
  // Ensure output directory exists
  await ensureDirectoryExists(OUTPUT_DIR);

  let browser;
  try {
    // Initialize browser with stealth settings
    browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
      defaultViewport: null,
      userDataDir: './chrome-profile', // Use persistent profile
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--start-maximized'
      ]
    });
    console.log('✅ Browser initialized successfully');

    const page = await browser.newPage();
    
    // Enhanced stealth settings
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      
      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport to realistic size
    await page.setViewport({ width: 1920, height: 1080 });

    // Try to use existing session first
    console.log('🔐 Checking for existing Instagram session...');
    await page.goto('https://www.instagram.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await delay(3000);
    
    // Check if already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('login') && !currentUrl.includes('accounts/login')) {
      console.log('✅ Already logged into Instagram');
    } else {
      console.log('🔐 Need to login, opening login page...');
      
      // Go to login page
      await page.goto('https://www.instagram.com/accounts/login/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for page to fully load
      await delay(3000);

      // Wait for user to manually enter credentials
      console.log('🔐 Please manually enter your credentials in the browser window...');
      console.log('🔐 Username: denmark_zurichberg');
      console.log('🔐 Password: Foxtrot@1');
      console.log('🔐 After logging in, press Enter in this terminal to continue...');
      
      // Wait for user input
      await new Promise(resolve => {
        process.stdin.once('data', () => {
          resolve();
        });
      });

      // Check if login was successful
      await delay(2000);
      const newUrl = page.url();
      if (newUrl.includes('login') || newUrl.includes('accounts/login')) {
        console.log('❌ Login appears to have failed. Please try again.');
        await takeScreenshot(page, 'login-failed.png');
        throw new Error('Login failed - please check credentials or try again later');
      }
      
      console.log('✅ Successfully logged into Instagram');
    }

    // Navigate to Meta AI
    const chatSelector = await navigateToMetaAI(page);

    // Get list of Miina images
    const imageFiles = fs.readdirSync(MIINA_IMAGES_DIR)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .slice(0, 5); // Process first 5 images for testing

    console.log(`📸 Found ${imageFiles.length} images to process`);

    const results = [];
    for (const imageFile of imageFiles) {
      const imagePath = path.join(MIINA_IMAGES_DIR, imageFile);
      const result = await processImage(page, imagePath, chatSelector);
      if (result) {
        results.push(result);
      }
      await delay(3000); // Wait between images
    }

    // Create manifest file
    const manifest = {
      generated: new Date().toISOString(),
      images: results
    };

    const manifestPath = path.join(OUTPUT_DIR, 'miina-ai-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📋 Manifest saved: ${manifestPath}`);

    console.log(`✅ Processing completed. Generated ${results.length} images.`);

  } catch (error) {
    console.error(`❌ Automation failed: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      console.log('🔒 Browser closed');
      await browser.close();
    }
  }
}

// Run the automation
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

