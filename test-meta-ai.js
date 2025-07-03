const fs = require('fs').promises;
const path = require('path');

async function testSetup() {
    console.log('🧪 Testing Meta AI Automation Setup...\n');
    
    // Test 1: Check dependencies
    console.log('1. Checking dependencies...');
    try {
        require('puppeteer');
        console.log('   ✅ Puppeteer installed');
    } catch (error) {
        console.log('   ❌ Puppeteer not found');
        return false;
    }
    
    try {
        require('axios');
        console.log('   ✅ Axios installed');
    } catch (error) {
        console.log('   ❌ Axios not found');
        return false;
    }
    
    // Test 2: Check Miina images directory
    console.log('\n2. Checking Miina images directory...');
    const miinaDir = path.join(__dirname, 'client', 'Miina - Pics');
    try {
        const files = await fs.readdir(miinaDir);
        const imageFiles = files.filter(file => 
            file.toLowerCase().endsWith('.jpg') || 
            file.toLowerCase().endsWith('.jpeg') || 
            file.toLowerCase().endsWith('.png')
        );
        console.log(`   ✅ Found ${imageFiles.length} images in Miina directory`);
        if (imageFiles.length === 0) {
            console.log('   ⚠️  No image files found');
            return false;
        }
    } catch (error) {
        console.log('   ❌ Miina directory not found or not accessible');
        return false;
    }
    
    // Test 3: Check output directory
    console.log('\n3. Checking output directory...');
    const outputDir = path.join(__dirname, 'client', 'public', 'images', 'miina-ai-generated');
    try {
        await fs.access(outputDir);
        console.log('   ✅ Output directory exists');
    } catch (error) {
        console.log('   ❌ Output directory not found');
        return false;
    }
    
    // Test 4: Check automation script
    console.log('\n4. Checking automation script...');
    const scriptPath = path.join(__dirname, 'meta-ai-automation.js');
    try {
        await fs.access(scriptPath);
        console.log('   ✅ Automation script exists');
    } catch (error) {
        console.log('   ❌ Automation script not found');
        return false;
    }
    
    // Test 5: Check React component
    console.log('\n5. Checking React component...');
    const componentPath = path.join(__dirname, 'client', 'src', 'components', 'MiinaAI.tsx');
    try {
        await fs.access(componentPath);
        console.log('   ✅ React component exists');
    } catch (error) {
        console.log('   ❌ React component not found');
        return false;
    }
    
    console.log('\n🎉 All tests passed! Setup is ready.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your React app: npm start');
    console.log('   2. Navigate to "9. Miina" in the cockpit');
    console.log('   3. Enter your Instagram credentials');
    console.log('   4. Click "Start AI Generation"');
    console.log('\n   Or run directly: node meta-ai-automation.js');
    
    return true;
}

// Run the test
testSetup().catch(console.error); 