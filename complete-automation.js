const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const META_AI_PWA_URL = 'https://www.meta.ai/?__pwa=1';
const INSTAGRAM_CREDENTIALS = {
  username: 'denmark_zurichberg',
  password: 'Foxtrot@1'
};
const OUTPUT_DIR = './client/public/images/miina-ai-generated';
const MIINA_IMAGES_DIR = './client/Miina - Pics';
const DOWNLOADS_DIR = path.join(process.env.USERPROFILE || '', 'Downloads');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function getPortraitMiinaImages() {
  const files = fs.readdirSync(MIINA_IMAGES_DIR);
  return files
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
    .map(file => path.join(MIINA_IMAGES_DIR, file))
    .slice(0, 5); // Start with 5 portrait images
}

async function step1ClickLogin(page) {
  console.log('🔐 Step 1: Clicking Log in button on Meta AI PWA...');
  
  try {
    await page.goto(META_AI_PWA_URL, { waitUntil: 'networkidle0' });
    await delay(5000);
    
    const loginClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in')
      );
      if (loginButton) {
        loginButton.click();
        return true;
      }
      return false;
    });
    
    if (loginClicked) {
      console.log('✅ Log in button clicked');
      await delay(3000);
      return true;
    } else {
      console.log('❌ Log in button not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Step 1 failed:', error.message);
    return false;
  }
}

async function step2ClickContinueWithInstagram(page) {
  console.log('🔐 Step 2: Clicking Continue with Instagram on auth page...');
  
  try {
    await delay(3000);
    
    const instagramClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const instagramButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('continue with instagram')
      );
      if (instagramButton) {
        instagramButton.click();
        return true;
      }
      return false;
    });
    
    if (instagramClicked) {
      console.log('✅ Continue with Instagram clicked');
      await delay(5000);
      return true;
    } else {
      console.log('❌ Continue with Instagram button not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Step 2 failed:', error.message);
    return false;
  }
}

async function step3FillCredentialsAndLogin(page) {
  console.log('🔐 Step 3: Filling credentials and clicking Login...');
  
  try {
    await delay(3000);
    
    // Fill credentials
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
      }
      if (passwordInput) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, INSTAGRAM_CREDENTIALS);
    
    await delay(2000);
    
    // Click Login
    const loginClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('log in') ||
        btn.type === 'submit'
      );
      if (loginButton) {
        loginButton.click();
        return true;
      }
      return false;
    });
    
    if (loginClicked) {
      console.log('✅ Login button clicked');
      await delay(8000);
      return true;
    } else {
      console.log('❌ Login button not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Step 3 failed:', error.message);
    return false;
  }
}

async function step4ClickSaveInfo(page) {
  console.log('🔐 Step 4: Clicking Save info on onetap page...');
  
  try {
    await delay(3000);
    
    const saveInfoClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('save info') ||
        btn.textContent.toLowerCase().includes('save')
      );
      if (saveButton) {
        saveButton.click();
        return true;
      }
      return false;
    });
    
    if (saveInfoClicked) {
      console.log('✅ Save info clicked');
      await delay(10000); // Wait for redirect to Meta AI PWA
      return true;
    } else {
      console.log('❌ Save info button not found, continuing...');
      await delay(10000);
      return true; // Continue anyway
    }
  } catch (error) {
    console.error('❌ Step 4 failed:', error.message);
    return true; // Continue anyway
  }
}

async function step5ClickPlusButton(page) {
  console.log('🔐 Step 5: Clicking + button to attach file...');
  
  try {
    // Navigate to Meta AI PWA if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('meta.ai')) {
      await page.goto(META_AI_PWA_URL, { waitUntil: 'networkidle0' });
      await delay(5000);
    }
    
    const plusButton = await page.$('button[aria-label*="+"]');
    if (plusButton) {
      await plusButton.click();
      console.log('✅ + button clicked');
      await delay(2000);
      return true;
    } else {
      console.log('❌ + button not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Step 5 failed:', error.message);
    return false;
  }
}

async function step6UploadImageAndPrompt(page, imagePath) {
  console.log('🔐 Step 6: Uploading image and adding prompt...');
  
  try {
    // Upload file
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({timeout: 5000}),
    ]);
    await fileChooser.accept([imagePath]);
    console.log('✅ Image uploaded');
    await delay(3000);
    
    // Add prompt
    const chatInput = await page.$('textarea, [contenteditable="true"]');
    if (chatInput) {
      await chatInput.type("Transform this into beautiful anime style");
      await page.keyboard.press('Enter');
      console.log('✅ Prompt sent');
      await delay(10000); // Wait for generation
      return true;
    } else {
      console.log('❌ Chat input not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Step 6 failed:', error.message);
    return false;
  }
}

async function step7ClickOnGeneratedImage(page) {
  console.log('🔐 Step 7: Clicking on generated image...');
  
  try {
    await delay(5000);
    
    const images = await page.$$('img');
    if (images.length > 0) {
      const lastImage = images[images.length - 1];
      await lastImage.click();
      console.log('✅ Generated image clicked');
      await delay(2000);
      return true;
    } else {
      console.log('❌ No generated image found');
      return false;
    }
  } catch (error) {
    console.error('❌ Step 7 failed:', error.message);
    return false;
  }
}

async function step8DownloadImage(page) {
  console.log('🔐 Step 8: Downloading image...');
  
  try {
    // Look for download button in enlarged view
    const downloadButton = await page.$('button[aria-label*="download"], button[aria-label*="Download"]');
    if (downloadButton) {
      await downloadButton.click();
      console.log('✅ Download button clicked');
      await delay(3000);
      return true;
    } else {
      console.log('❌ Download button not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Step 8 failed:', error.message);
    return false;
  }
}

async function step9MoveDownloadedImage(imageNumber) {
  console.log('🔐 Step 9: Moving downloaded image...');
  
  try {
    // Wait for download to complete
    await delay(5000);
    
    // Find the most recent downloaded file
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file) && 
      !file.includes('miina_anime_')
    );
    
    if (imageFiles.length > 0) {
      const latestFile = imageFiles[imageFiles.length - 1];
      const sourcePath = path.join(DOWNLOADS_DIR, latestFile);
      const destFileName = `miina_anime_${imageNumber}_${Date.now()}.jpg`;
      const destPath = path.join(OUTPUT_DIR, destFileName);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Downloaded image moved: ${destFileName}`);
      return destFileName;
    } else {
      console.log('❌ No downloaded image found');
      return null;
    }
  } catch (error) {
    console.error('❌ Step 9 failed:', error.message);
    return null;
  }
}

async function step10CreateImagePage(originalImages, animeImages) {
  console.log('🔐 Step 10: Creating Images page with iPhone containers...');
  
  try {
    const imagePageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miina Images - Original vs Anime</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f0f0f0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
        }
        .iphone-container {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 30px;
        }
        .iphone {
            width: 300px;
            height: 600px;
            background: #000;
            border-radius: 40px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
        }
        .iphone-screen {
            width: 100%;
            height: 100%;
            background: #fff;
            border-radius: 25px;
            overflow: hidden;
            position: relative;
        }
        .iphone-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .iphone-label {
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            font-weight: bold;
            color: #333;
        }
        .controls {
            margin: 20px 0;
        }
        .nav-button {
            padding: 10px 20px;
            margin: 0 10px;
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .nav-button:hover {
            background: #0056CC;
        }
        .nav-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .image-counter {
            font-size: 18px;
            margin: 20px 0;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Miina Images - Original vs Anime Style</h1>
        
        <div class="image-counter">
            Image <span id="currentIndex">1</span> of <span id="totalImages">${originalImages.length}</span>
        </div>
        
        <div class="iphone-container">
            <div class="iphone">
                <div class="iphone-screen">
                    <img id="originalImage" class="iphone-image" src="${originalImages[0]}" alt="Original">
                </div>
                <div class="iphone-label">Original</div>
            </div>
            
            <div class="iphone">
                <div class="iphone-screen">
                    <img id="animeImage" class="iphone-image" src="${animeImages[0]}" alt="Anime Style">
                </div>
                <div class="iphone-label">Anime Style</div>
            </div>
        </div>
        
        <div class="controls">
            <button class="nav-button" id="prevBtn" onclick="previousImage()">Previous</button>
            <button class="nav-button" id="nextBtn" onclick="nextImage()">Next</button>
        </div>
    </div>

    <script>
        const originalImages = ${JSON.stringify(originalImages)};
        const animeImages = ${JSON.stringify(animeImages)};
        let currentIndex = 0;

        function updateImage() {
            document.getElementById('originalImage').src = originalImages[currentIndex];
            document.getElementById('animeImage').src = animeImages[currentIndex];
            document.getElementById('currentIndex').textContent = currentIndex + 1;
            
            document.getElementById('prevBtn').disabled = currentIndex === 0;
            document.getElementById('nextBtn').disabled = currentIndex === originalImages.length - 1;
        }

        function previousImage() {
            if (currentIndex > 0) {
                currentIndex--;
                updateImage();
            }
        }

        function nextImage() {
            if (currentIndex < originalImages.length - 1) {
                currentIndex++;
                updateImage();
            }
        }

        // Initialize
        updateImage();
    </script>
</body>
</html>`;

    const imagePagePath = path.join(OUTPUT_DIR, 'images-page.html');
    fs.writeFileSync(imagePagePath, imagePageContent);
    console.log('✅ Images page created: images-page.html');
    
    return imagePagePath;
  } catch (error) {
    console.error('❌ Step 10 failed:', error.message);
    return null;
  }
}

async function completeLoginFlow(page) {
  console.log('🔐 Starting complete login flow...');
  
  // Step 1: Click Log in
  if (!await step1ClickLogin(page)) return false;
  
  // Step 2: Click Continue with Instagram
  if (!await step2ClickContinueWithInstagram(page)) return false;
  
  // Step 3: Fill credentials and login
  if (!await step3FillCredentialsAndLogin(page)) return false;
  
  // Step 4: Click Save info
  if (!await step4ClickSaveInfo(page)) return false;
  
  console.log('✅ Complete login flow successful');
  return true;
}

async function processSingleImage(page, imagePath, imageNumber) {
  console.log(`\n🔄 Processing image ${imageNumber}: ${path.basename(imagePath)}`);
  
  // Step 5: Click + button
  if (!await step5ClickPlusButton(page)) return null;
  
  // Step 6: Upload image and add prompt
  if (!await step6UploadImageAndPrompt(page, imagePath)) return null;
  
  // Step 7: Click on generated image
  if (!await step7ClickOnGeneratedImage(page)) return null;
  
  // Step 8: Download image
  if (!await step8DownloadImage(page)) return null;
  
  // Step 9: Move downloaded image
  const downloadedFileName = await step9MoveDownloadedImage(imageNumber);
  if (!downloadedFileName) return null;
  
  console.log(`✅ Image ${imageNumber} processed successfully`);
  return downloadedFileName;
}

async function main() {
  console.log('🚀 Starting COMPLETE Meta AI Automation...');
  console.log('🎯 Following the exact 13-step process!');
  
  await ensureDirectoryExists(OUTPUT_DIR);
  
  const miinaImages = await getPortraitMiinaImages();
  console.log(`📸 Found ${miinaImages.length} portrait Miina images to process`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Complete login flow
    const loginSuccess = await completeLoginFlow(page);
    if (!loginSuccess) {
      console.log('❌ Login failed, stopping automation');
      return;
    }
    
    // Process images
    const processedImages = [];
    for (let i = 0; i < miinaImages.length; i++) {
      const imagePath = miinaImages[i];
      const downloadedFileName = await processSingleImage(page, imagePath, i + 1);
      
      if (downloadedFileName) {
        processedImages.push({
          original: path.basename(imagePath),
          anime: downloadedFileName
        });
      }
      
      await delay(3000); // Wait between images
    }
    
    // Step 10: Create Images page
    if (processedImages.length > 0) {
      const originalImagePaths = processedImages.map(img => `./images/${img.original}`);
      const animeImagePaths = processedImages.map(img => `./images/miina-ai-generated/${img.anime}`);
      
      await step10CreateImagePage(originalImagePaths, animeImagePaths);
      
      console.log(`\n🎉 COMPLETE Automation finished!`);
      console.log(`📊 Results: ${processedImages.length}/${miinaImages.length} images processed`);
      console.log(`📁 Anime images saved to: ${OUTPUT_DIR}`);
      console.log(`🌐 Images page created: ${OUTPUT_DIR}/images-page.html`);
    }
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
  } finally {
    console.log('🔓 Browser will stay open...');
    await new Promise(() => {});
  }
}

main().catch(console.error); 