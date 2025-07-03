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

// Function to create comprehensive manifest from Miina-Pics folder
async function createFullManifest() {
  try {
    const miinaPicsPath = path.join(__dirname, 'client', 'Miina - Pics');
    const outputPath = path.join(__dirname, 'client', 'public', 'images', 'miina-full-manifest.json');
    
    console.log('🔍 Scanning Miina-Pics folder...');
    
    // Get all image files from Miina-Pics folder
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const allImages = [];
    
    function scanDirectory(dirPath) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.includes(ext)) {
            allImages.push({
              name: file,
              path: fullPath,
              relativePath: path.relative(miinaPicsPath, fullPath)
            });
          }
        }
      }
    }
    
    scanDirectory(miinaPicsPath);
    
    console.log(`📸 Found ${allImages.length} images in Miina-Pics folder`);
    
    // Process images and get dimensions
    const processedImages = [];
    let processedCount = 0;
    
    for (const image of allImages) {
      const dimensions = await getImageDimensions(image.path);
      
      if (dimensions) {
        processedImages.push({
          id: Date.now() + Math.random(),
          url: `/Miina - Pics/${image.relativePath.replace(/\\/g, '/')}`,
          title: `Miina ${image.name}`,
          description: `Image from Miina collection - ${image.name}`,
          category: 'Miina',
          originalName: image.name,
          width: dimensions.width,
          height: dimensions.height,
          isLandscape: dimensions.isLandscape
        });
        
        processedCount++;
        if (processedCount % 100 === 0) {
          console.log(`✅ Processed ${processedCount}/${allImages.length} images...`);
        }
      }
    }
    
    // Create manifest structure
    const manifest = {
      Miina: processedImages
    };
    
    // Write manifest
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
    
    // Count landscape images
    const landscapeImages = processedImages.filter(img => img.isLandscape);
    
    console.log('✅ Full manifest created!');
    console.log(`📊 Summary:`);
    console.log(`   Total images: ${processedImages.length}`);
    console.log(`   Landscape images: ${landscapeImages.length}`);
    console.log(`   Portrait images: ${processedImages.length - landscapeImages.length}`);
    console.log(`   Manifest saved to: ${outputPath}`);
    
    return {
      total: processedImages.length,
      landscape: landscapeImages.length,
      portrait: processedImages.length - landscapeImages.length
    };
    
  } catch (error) {
    console.error('❌ Error creating full manifest:', error);
  }
}

// Run the script
createFullManifest(); 