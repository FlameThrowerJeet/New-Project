const ImageGenerationService = require('./image-generation-service');

async function testImageGeneration() {
  console.log('🧪 Testing Image Generation Service...\n');
  
  const imageService = new ImageGenerationService();
  
  // Test prompts
  const testPrompts = [
    'A beautiful sunset over mountains, digital art style',
    'A cute robot playing with a cat, cartoon style',
    'A futuristic city with flying cars, cyberpunk style'
  ];
  
  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n🎨 Test ${i + 1}: "${prompt}"`);
    console.log('=' .repeat(50));
    
    try {
      // Test with different providers
      const providers = ['dalle', 'stability', 'replicate'];
      
      for (const provider of providers) {
        console.log(`\n📡 Testing ${provider.toUpperCase()}...`);
        
        let result;
        switch (provider) {
          case 'dalle':
            result = await imageService.generateWithDalle(prompt, {
              size: '1024x1024',
              quality: 'standard',
              style: 'vivid'
            });
            break;
          case 'stability':
            result = await imageService.generateWithStability(prompt, {
              width: 1024,
              height: 1024,
              steps: 30,
              cfg_scale: 7
            });
            break;
          case 'replicate':
            result = await imageService.generateWithReplicate(prompt, {
              width: 1024,
              height: 1024,
              num_inference_steps: 50,
              guidance_scale: 7.5
            });
            break;
        }
        
        if (result.success) {
          console.log(`✅ ${provider.toUpperCase()} SUCCESS`);
          console.log(`   Image URL: ${result.imageUrl}`);
          console.log(`   Provider: ${result.provider}`);
        } else {
          console.log(`❌ ${provider.toUpperCase()} FAILED`);
          console.log(`   Error: ${result.error}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error.message);
    }
  }
  
  // Test unified generation
  console.log('\n\n🔄 Testing Unified Generation...');
  console.log('=' .repeat(50));
  
  try {
    const result = await imageService.generateImage('A magical forest with glowing mushrooms', {
      preferredProvider: 'dalle',
      fallbackProviders: ['stability', 'replicate']
    });
    
    if (result.success) {
      console.log('✅ Unified Generation SUCCESS');
      console.log(`   Image URL: ${result.imageUrl}`);
      console.log(`   Provider: ${result.provider}`);
    } else {
      console.log('❌ Unified Generation FAILED');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Unified generation test failed:', error.message);
  }
  
  // Test generation history
  console.log('\n\n📚 Testing Generation History...');
  console.log('=' .repeat(50));
  
  try {
    const history = await imageService.getGenerationHistory();
    console.log(`📊 Found ${history.length} generations in history`);
    
    if (history.length > 0) {
      console.log('📋 Recent generations:');
      history.slice(-3).forEach((gen, index) => {
        console.log(`   ${index + 1}. ${gen.prompt} (${gen.provider})`);
      });
    }
  } catch (error) {
    console.error('❌ History test failed:', error.message);
  }
  
  console.log('\n\n🏁 Image Generation Service Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Set up your API keys in .env file');
  console.log('2. Start the server with: npm start');
  console.log('3. Access the web interface at: http://localhost:3002');
  console.log('4. Check IMAGE_GENERATION_SETUP.md for detailed instructions');
}

// Run the test
testImageGeneration().catch(console.error); 