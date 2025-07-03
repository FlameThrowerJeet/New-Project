const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const META_AI_URL = 'https://www.meta.ai/?utm_source=ig_web_nav';
const OUTPUT_DIR = './client/public/images/miina-ai-generated';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  console.log('🚀 Opening Meta AI directly...');
  
  await ensureDirectoryExists(OUTPUT_DIR);
  
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
    
    // Go directly to Meta AI
    console.log('🌐 Navigating to Meta AI...');
    await page.goto(META_AI_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(5000);
    
    console.log('✅ Meta AI page loaded!');
    console.log('📝 You can now manually upload images and process them.');
    console.log('🖼️ Images will be saved to:', OUTPUT_DIR);
    
    // Keep browser open for manual use
    console.log('🔓 Browser will stay open for manual processing...');
    
    // Wait indefinitely (or until user closes)
    await new Promise(() => {}); // This keeps the script running
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Don't close browser automatically
    // await browser.close();
  }
}

main().catch(console.error); 