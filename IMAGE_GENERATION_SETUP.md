# 🎨 Image Generation Setup Guide

This project now includes comprehensive AI image generation capabilities with support for multiple providers and automatic fallback mechanisms.

## 🚀 Features

- **Multiple AI Providers**: DALL-E 3, Stability AI, Replicate
- **Automatic Fallback**: If one provider fails, automatically tries others
- **Image Processing**: Resize, apply filters, and enhance images
- **Generation History**: Track and view all generated images
- **Modern UI**: Clean, responsive interface for image generation

## 📋 Required API Keys

### 1. OpenAI DALL-E 3
- **Get it from**: https://platform.openai.com/api-keys
- **Cost**: ~$0.040 per image (1024x1024)
- **Features**: Highest quality, artistic styles, multiple sizes

### 2. Stability AI
- **Get it from**: https://platform.stability.ai/account/keys
- **Cost**: Free tier available, then pay-per-use
- **Features**: Fast generation, customizable parameters

### 3. Replicate
- **Get it from**: https://replicate.com/account/api-tokens
- **Cost**: Pay-per-use, varies by model
- **Features**: Access to thousands of AI models

## ⚙️ Configuration

1. **Create a `.env` file** in your project root:

```env
# Image Generation API Keys
OPENAI_API_KEY=your_openai_api_key_here
STABILITY_API_KEY=your_stability_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here

# Server Configuration
PORT=3002
NODE_ENV=development
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start the server**:

```bash
npm start
```

## 🎯 Usage

### API Endpoints

#### Unified Generation
```bash
POST /api/generate-image
{
  "prompt": "A majestic dragon flying over a medieval castle",
  "preferredProvider": "dalle",
  "fallbackProviders": ["stability", "replicate"]
}
```

#### Provider-Specific Generation
```bash
# DALL-E 3
POST /api/generate-dalle
{
  "prompt": "A cyberpunk city at night",
  "size": "1024x1024",
  "quality": "hd",
  "style": "vivid"
}

# Stability AI
POST /api/generate-stability
{
  "prompt": "A serene mountain landscape",
  "width": 1024,
  "height": 1024,
  "steps": 30,
  "cfg_scale": 7
}

# Replicate
POST /api/generate-replicate
{
  "prompt": "An anime-style portrait",
  "model": "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  "width": 1024,
  "height": 1024,
  "num_inference_steps": 50,
  "guidance_scale": 7.5
}
```

#### Image Processing
```bash
POST /api/process-image
{
  "imageUrl": "/path/to/image.jpg",
  "operation": "resize",
  "width": 512,
  "height": 512
}

POST /api/process-image
{
  "imageUrl": "/path/to/image.jpg",
  "operation": "filter",
  "filter": "grayscale"
}
```

### Web Interface

1. Navigate to your application
2. Use the Image Generator component
3. Enter your prompt
4. Select your preferred AI provider
5. Adjust generation parameters
6. Click "Generate Image"

## 🔧 Advanced Configuration

### Provider Options

#### DALL-E 3
- **Sizes**: 1024x1024, 1792x1024, 1024x1792
- **Quality**: standard, hd
- **Styles**: vivid, natural

#### Stability AI
- **Dimensions**: 512x512 to 2048x2048 (64px increments)
- **Steps**: 10-150 (higher = better quality, slower)
- **CFG Scale**: 1-20 (higher = more prompt adherence)

#### Replicate
- **Models**: SDXL, AnimeGAN v2, and thousands more
- **Customizable**: Width, height, inference steps, guidance scale

### Fallback Strategy

The system automatically tries providers in this order:
1. **Preferred Provider** (user-selected)
2. **Fallback Providers** (if specified)
3. **Default Fallbacks** (dalle → stability → replicate)

## 📁 File Structure

```
├── image-generation-service.js    # Core generation service
├── server.js                      # API endpoints
├── client/src/components/
│   ├── ImageGenerator.jsx         # React component
│   └── ImageGenerator.css         # Styling
└── client/public/images/
    └── generated/                 # Generated images storage
```

## 🛠️ Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check your `.env` file
   - Ensure API keys are valid and active

2. **"Generation failed"**
   - Check API quotas and billing
   - Verify prompt content (some providers have content filters)
   - Try a different provider

3. **"Failed to load image"**
   - Check network connectivity
   - Verify image URLs are accessible
   - Check file permissions in generated/ directory

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 💡 Tips for Better Results

1. **Be Specific**: "A red dragon with golden scales flying over a snow-capped mountain at sunset" vs "dragon"

2. **Use Style Keywords**: "digital art", "photorealistic", "oil painting", "anime style"

3. **Experiment with Parameters**: Try different CFG scales, steps, and sizes

4. **Use Fallbacks**: If one provider fails, others might succeed

5. **Check History**: Review previous generations for inspiration

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Consider rate limiting for production use
- Monitor API usage and costs

## 📈 Performance

- **DALL-E 3**: ~10-30 seconds, highest quality
- **Stability AI**: ~5-15 seconds, good quality
- **Replicate**: ~10-60 seconds, varies by model

## 🎨 Example Prompts

- "A futuristic cityscape with neon lights and flying cars, cyberpunk style"
- "A serene Japanese garden with cherry blossoms and a traditional pagoda"
- "A majestic eagle soaring over a dramatic mountain landscape at golden hour"
- "A cozy coffee shop interior with warm lighting and vintage decor"
- "A magical forest with glowing mushrooms and fairy lights"

---

**Happy generating! 🎨✨** 