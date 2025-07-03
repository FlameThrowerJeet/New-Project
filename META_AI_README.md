# 🎨 Meta AI Image Generator for Miina

This tool automatically recreates Miina photos in anime style using Instagram's Meta AI. It's a complete automation solution that handles the entire process from login to download.

## 🚀 Features

- **Automated Instagram Login**: Secure credential handling
- **Meta AI Integration**: Direct access to Instagram's Meta AI chat
- **Batch Processing**: Process multiple images automatically
- **Smart Image Detection**: Automatically finds Miina photos
- **Download Management**: Organized file naming and storage
- **Error Handling**: Comprehensive error reporting and recovery
- **UI Integration**: Built-in React component for easy use

## 📋 Requirements

- Node.js (v14 or higher)
- Instagram account with access to Meta AI
- Miina photos in `client/public/images/Miina - Pics/`
- Internet connection

## 🛠️ Installation

1. **Install Dependencies**:
   ```bash
   npm install puppeteer axios --force
   ```

2. **Verify Setup**:
   - Ensure Miina photos are in the correct directory
   - Check that Node.js is properly installed
   - Verify internet connection

## 🎯 Usage

### Method 1: Web Interface (Recommended)

1. **Start the Application**:
   ```bash
   npm start
   ```

2. **Navigate to Miina AI**:
   - Go to the main cockpit
   - Click on "9. Miina" in the navigation
   - You'll see the Meta AI interface

3. **Enter Credentials**:
   - Input your Instagram username
   - Input your Instagram password
   - Click "Start AI Generation"

4. **Monitor Progress**:
   - Watch the status updates
   - View real-time processing results
   - Check generated images when complete

### Method 2: Command Line

1. **Run the Batch Script**:
   ```bash
   run-meta-ai.bat
   ```

2. **Enter Credentials** when prompted

3. **Wait for Completion**:
   - The tool will process up to 5 images
   - Each image takes 1-3 minutes
   - Results are saved automatically

### Method 3: Direct Node.js

1. **Set Environment Variables**:
   ```bash
   set INSTAGRAM_USERNAME=your_username
   set INSTAGRAM_PASSWORD=your_password
   ```

2. **Run the Script**:
   ```bash
   node meta-ai-automation.js
   ```

## 📁 File Structure

```
Fogghya/
├── meta-ai-automation.js          # Main automation script
├── run-meta-ai.bat               # Windows batch script
├── client/
│   ├── src/
│   │   └── components/
│   │       ├── MiinaAI.tsx       # React UI component
│   │       └── MiinaAI.css       # Component styles
│   └── public/
│       └── images/
│           ├── Miina - Pics/     # Source images
│           └── miina-ai-generated/ # Generated images
└── META_AI_README.md             # This file
```

## 🔧 How It Works

### 1. **Initialization**
- Launches headless Chrome browser
- Sets up user agent and viewport
- Creates output directory

### 2. **Instagram Login**
- Navigates to Instagram login page
- Enters credentials securely
- Verifies successful login

### 3. **Meta AI Navigation**
- Goes to Instagram's Meta AI chat
- Waits for chat interface to load
- Prepares for image upload

### 4. **Image Processing**
- Scans Miina photos directory
- Uploads images one by one
- Sends "Recreate this image in Anime Style" prompt
- Waits for AI generation (30-60 seconds)

### 5. **Download Management**
- Detects generated images in chat
- Downloads high-quality versions
- Saves with organized filenames
- Records processing results

## 📊 Output

### Generated Images
- **Location**: `client/public/images/miina-ai-generated/`
- **Naming**: `ai-anime-{original-name}-{timestamp}.jpg`
- **Format**: High-quality JPG files

### Processing Results
- **File**: `processing-results.json`
- **Content**: Detailed success/failure logs
- **Includes**: Original paths, generated paths, errors

## ⚠️ Important Notes

### Rate Limiting
- Instagram has rate limits on AI generation
- Tool includes 30-second delays between images
- Process 5 images maximum per session

### Browser Requirements
- Tool runs in visible browser mode for debugging
- Keep browser window open during processing
- Don't interact with browser during automation

### Error Handling
- Network errors are automatically retried
- Failed images are logged with error details
- Tool continues processing other images

### Security
- Credentials are stored in memory only
- No permanent storage of passwords
- Use dedicated Instagram account if possible

## 🐛 Troubleshooting

### Common Issues

1. **Login Failed**
   - Check username/password
   - Ensure 2FA is disabled or handled
   - Try logging in manually first

2. **Meta AI Not Found**
   - Verify Meta AI is available in your region
   - Check Instagram account permissions
   - Try accessing Meta AI manually

3. **Image Upload Failed**
   - Check file formats (JPG, PNG supported)
   - Verify file sizes (under 10MB)
   - Ensure images are accessible

4. **Generation Timeout**
   - Meta AI may be slow during peak hours
   - Increase timeout values in code
   - Try again later

### Debug Mode

Enable detailed logging by modifying the script:
```javascript
// In meta-ai-automation.js
this.browser = await puppeteer.launch({
    headless: false,  // Keep this false for debugging
    devtools: true,   // Add this for debugging
    slowMo: 1000      // Add this for slower execution
});
```

## 🔄 Updates and Maintenance

### Regular Maintenance
- Update Puppeteer regularly for Instagram compatibility
- Monitor Instagram's UI changes
- Test with new Meta AI features

### Customization
- Modify prompts in `sendPrompt()` method
- Adjust delays in `processBatch()` method
- Change output directory in constructor

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for error details
3. Verify all requirements are met
4. Test with a single image first

## 🎉 Success Tips

1. **Use Quality Images**: Higher resolution = better results
2. **Be Patient**: Each image takes 1-3 minutes
3. **Monitor Progress**: Watch the status updates
4. **Check Results**: Review generated images for quality
5. **Backup Originals**: Keep your source images safe

---

**Happy AI Generation! 🎨✨** 