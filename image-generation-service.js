const OpenAI = require('openai');
const Replicate = require('replicate');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class ImageGenerationService {
  constructor() {
    // Initialize OpenAI only if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.warn('⚠️ OpenAI API key not found. DALL-E image generation will be disabled.');
      this.openai = null;
    }

    // Initialize Replicate only if API token is available
    if (process.env.REPLICATE_API_TOKEN) {
      this.replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
    } else {
      console.warn('⚠️ Replicate API token not found. Replicate image generation will be disabled.');
      this.replicate = null;
    }

    // Stability AI configuration
    this.stabilityApiKey = process.env.STABILITY_API_KEY;
    this.stabilityApiHost = 'https://api.stability.ai';
    
    if (!this.stabilityApiKey) {
      console.warn('⚠️ Stability AI API key not found. Stability AI image generation will be disabled.');
    }
  }

  // Generate image using DALL-E 3
  async generateWithDalle(prompt, options = {}) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI service not available - API key not configured');
      }

      const {
        size = '1024x1024',
        quality = 'standard',
        style = 'vivid',
        model = 'dall-e-3'
      } = options;

      console.log(`🎨 Generating image with DALL-E: ${prompt}`);
      
      const response = await this.openai.images.generate({
        model,
        prompt,
        size,
        quality,
        style,
        n: 1,
      });

      return {
        success: true,
        provider: 'dalle',
        imageUrl: response.data[0].url,
        prompt,
        metadata: {
          size,
          quality,
          style,
          model
        }
      };
    } catch (error) {
      console.error('DALL-E generation error:', error);
      return {
        success: false,
        provider: 'dalle',
        error: error.message
      };
    }
  }

  // Generate image using Stability AI
  async generateWithStability(prompt, options = {}) {
    try {
      if (!this.stabilityApiKey) {
        throw new Error('Stability AI API key not configured');
      }

      const {
        width = 1024,
        height = 1024,
        steps = 30,
        cfg_scale = 7,
        samples = 1,
        engine_id = 'stable-diffusion-xl-1024-v1-0'
      } = options;

      console.log(`🎨 Generating image with Stability AI: ${prompt}`);

      const response = await axios.post(
        `${this.stabilityApiHost}/v1/generation/${engine_id}/text-to-image`,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale,
          height,
          width,
          samples,
          steps,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.stabilityApiKey}`,
          },
        }
      );

      const imageData = response.data.artifacts[0];
      const imageBuffer = Buffer.from(imageData.base64, 'base64');
      
      // Save image locally
      const filename = `stability_${Date.now()}.png`;
      const imagePath = path.join(__dirname, 'client', 'public', 'images', 'generated', filename);
      
      // Ensure directory exists
      const dir = path.dirname(imagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      await sharp(imageBuffer).png().toFile(imagePath);
      
      return {
        success: true,
        provider: 'stability',
        imageUrl: `/images/generated/${filename}`,
        prompt,
        metadata: {
          width,
          height,
          steps,
          cfg_scale,
          engine_id
        }
      };
    } catch (error) {
      console.error('Stability AI generation error:', error);
      return {
        success: false,
        provider: 'stability',
        error: error.message
      };
    }
  }

  // Generate image using Replicate (various models)
  async generateWithReplicate(prompt, options = {}) {
    try {
      if (!this.replicate) {
        throw new Error('Replicate service not available - API token not configured');
      }

      const {
        model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        width = 1024,
        height = 1024,
        num_outputs = 1,
        scheduler = 'K_EULER',
        num_inference_steps = 50,
        guidance_scale = 7.5,
        prompt_strength = 0.8
      } = options;

      console.log(`🎨 Generating image with Replicate: ${prompt}`);

      const output = await this.replicate.run(model, {
        input: {
          prompt,
          width,
          height,
          num_outputs,
          scheduler,
          num_inference_steps,
          guidance_scale,
          prompt_strength
        }
      });

      return {
        success: true,
        provider: 'replicate',
        imageUrl: Array.isArray(output) ? output[0] : output,
        prompt,
        metadata: {
          model,
          width,
          height,
          num_inference_steps,
          guidance_scale
        }
      };
    } catch (error) {
      console.error('Replicate generation error:', error);
      return {
        success: false,
        provider: 'replicate',
        error: error.message
      };
    }
  }

  // Unified image generation with fallback
  async generateImage(prompt, options = {}) {
    const {
      preferredProvider = 'dalle',
      fallbackProviders = ['stability', 'replicate'],
      ...generationOptions
    } = options;

    console.log(`🚀 Starting image generation for: "${prompt}"`);

    // Try preferred provider first
    let result;
    switch (preferredProvider) {
      case 'dalle':
        result = await this.generateWithDalle(prompt, generationOptions);
        break;
      case 'stability':
        result = await this.generateWithStability(prompt, generationOptions);
        break;
      case 'replicate':
        result = await this.generateWithReplicate(prompt, generationOptions);
        break;
      default:
        result = await this.generateWithDalle(prompt, generationOptions);
    }

    // If preferred provider fails, try fallbacks
    if (!result.success && fallbackProviders.length > 0) {
      console.log(`⚠️ ${preferredProvider} failed, trying fallbacks...`);
      
      for (const provider of fallbackProviders) {
        console.log(`🔄 Trying ${provider}...`);
        
        switch (provider) {
          case 'dalle':
            result = await this.generateWithDalle(prompt, generationOptions);
            break;
          case 'stability':
            result = await this.generateWithStability(prompt, generationOptions);
            break;
          case 'replicate':
            result = await this.generateWithReplicate(prompt, generationOptions);
            break;
        }
        
        if (result.success) {
          console.log(`✅ Success with ${provider}`);
          break;
        }
      }
    }

    if (result.success) {
      // Save generation metadata
      await this.saveGenerationMetadata(prompt, result);
    }

    return result;
  }

  // Save generation metadata for tracking
  async saveGenerationMetadata(prompt, result) {
    try {
      const metadataPath = path.join(__dirname, 'client', 'public', 'images', 'generated', 'generations.json');
      const dir = path.dirname(metadataPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let generations = [];
      if (fs.existsSync(metadataPath)) {
        generations = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }

      generations.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        prompt,
        provider: result.provider,
        imageUrl: result.imageUrl,
        metadata: result.metadata
      });

      fs.writeFileSync(metadataPath, JSON.stringify(generations, null, 2));
    } catch (error) {
      console.error('Error saving generation metadata:', error);
    }
  }

  // Get generation history
  async getGenerationHistory() {
    try {
      const metadataPath = path.join(__dirname, 'client', 'public', 'images', 'generated', 'generations.json');
      
      if (fs.existsSync(metadataPath)) {
        return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }
      
      return [];
    } catch (error) {
      console.error('Error reading generation history:', error);
      return [];
    }
  }

  // Image processing utilities
  async resizeImage(imagePath, width, height) {
    try {
      const outputPath = imagePath.replace(/\.[^.]+$/, `_${width}x${height}.png`);
      await sharp(imagePath)
        .resize(width, height)
        .png()
        .toFile(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Image resize error:', error);
      throw error;
    }
  }

  async applyFilter(imagePath, filter) {
    try {
      const outputPath = imagePath.replace(/\.[^.]+$/, `_${filter}.png`);
      
      let processed = sharp(imagePath);
      
      switch (filter) {
        case 'grayscale':
          processed = processed.grayscale();
          break;
        case 'blur':
          processed = processed.blur(5);
          break;
        case 'sharpen':
          processed = processed.sharpen();
          break;
        case 'sepia':
          processed = processed.tint({ r: 112, g: 66, b: 20 });
          break;
        default:
          throw new Error(`Unknown filter: ${filter}`);
      }
      
      await processed.png().toFile(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Image filter error:', error);
      throw error;
    }
  }
}

module.exports = ImageGenerationService; 