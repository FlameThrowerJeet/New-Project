const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Function to get image dimensions
async function getImageDimensions(imagePath) {
  try {
    const image = await loadImage(imagePath);
    return {
      width: image.width,
      height: image.height,
      isLandscape: image.width > image.height
    };
  } catch (error) {
    console.error(`Error loading image ${imagePath}:`, error.message);
    return null;
  }
}

// Function to update manifest with image dimensions
async function updateManifestWithDimensions() {
  try {
    // Read the current manifest
    const manifestPath = path.join(__dirname, 'client', 'public', 'images', 'miina-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log('🔍 Detecting image dimensions...');
    
    // Process each category
    for (const category of Object.keys(manifest)) {
      console.log(`📁 Processing ${category} category...`);
      
      for (const imageData of manifest[category]) {
        // Construct the full path to the image
        const imagePath = path.join(__dirname, 'client', 'public', imageData.url);
        
        // Get image dimensions
        const dimensions = await getImageDimensions(imagePath);
        
        if (dimensions) {
          imageData.width = dimensions.width;
          imageData.height = dimensions.height;
          imageData.isLandscape = dimensions.isLandscape;
          console.log(`✅ ${imageData.originalName}: ${dimensions.width}x${dimensions.height} (${dimensions.isLandscape ? 'Landscape' : 'Portrait'})`);
        } else {
          console.log(`❌ Failed to get dimensions for ${imageData.originalName}`);
        }
      }
    }
    
    // Write updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Manifest updated with image dimensions!');
    
    // Count landscape images
    let totalImages = 0;
    let landscapeImages = 0;
    
    for (const category of Object.keys(manifest)) {
      for (const imageData of manifest[category]) {
        totalImages++;
        if (imageData.isLandscape) {
          landscapeImages++;
        }
      }
    }
    
    console.log(`📊 Summary: ${landscapeImages}/${totalImages} images are landscape`);
    
  } catch (error) {
    console.error('❌ Error updating manifest:', error);
  }
}

// Run the script
updateManifestWithDimensions(); 