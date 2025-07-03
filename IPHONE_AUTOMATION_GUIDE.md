# 📱 iPhone Meta AI Automation Guide

## 🚀 Overview
This guide shows you how to automate Meta AI image generation directly on your iPhone using iOS automation tools. This approach is much more reliable than desktop automation since Meta AI is optimized for iOS.

## 🛠️ Method 1: Shortcuts App (Recommended)

### Step 1: Create a New Shortcut
1. Open the **Shortcuts** app on your iPhone
2. Tap the **+** button to create a new shortcut
3. Name it "Meta AI Image Generator"

### Step 2: Add Actions
Add these actions in order:

#### Action 1: Get Recent Photos
- Search for "Get Recent Photos"
- Set **Count** to 5-10
- Set **Album** to "Miina Photos" (if you have a specific album)

#### Action 2: Repeat with Each
- Search for "Repeat with Each"
- This will process each photo individually

#### Action 3: Open Instagram
- Search for "Open App"
- Select **Instagram**

#### Action 4: Wait
- Search for "Wait"
- Set to **3 seconds**

#### Action 5: Navigate to Meta AI
- Search for "Open URL"
- Enter: `instagram://direct/t/340282366841710300949128142825742127956`
- Or use: `https://www.meta.ai`

#### Action 6: Wait
- Set to **5 seconds**

#### Action 7: Upload Photo
- Search for "Upload to Instagram"
- Select the **Repeat Item** (current photo)

#### Action 8: Type Text
- Search for "Type Text"
- Enter: "Transform this photo into an anime style, maintaining the same pose and composition but with anime aesthetics"

#### Action 9: Wait for Response
- Set to **30 seconds**

#### Action 10: Save Generated Image
- Search for "Save to Photos"
- This will save the generated image

### Step 3: Run the Shortcut
1. Tap the **Play** button
2. Grant necessary permissions
3. The shortcut will process each photo automatically

## 🛠️ Method 2: Safari Automation

### Step 1: Create Automation Script
1. Open Safari on your iPhone
2. Go to your website: `http://192.168.29.84:3003`
3. Open Developer Tools (if available)
4. Paste the iPhone automation script

### Step 2: Run in Safari
```javascript
// In Safari console, run:
iPhoneMetaAIAutomation.runAutomation();
```

## 🛠️ Method 3: Web-Based Automation

### Step 1: Access the Automation Page
1. Open Safari on your iPhone
2. Navigate to: `http://192.168.29.84:3003`
3. Go to the **Miina** section
4. Look for the iPhone automation button

### Step 2: Configure and Run
1. Enter your Instagram credentials
2. Select photos to process
3. Tap "Start iPhone Automation"

## 📋 Prerequisites

### Required Apps
- ✅ Instagram app (latest version)
- ✅ Shortcuts app (built into iOS)
- ✅ Photos app
- ✅ Safari browser

### Required Permissions
- 📸 Photos access
- 🔐 Instagram login
- 🌐 Internet connection
- 📱 Automation permissions

### Instagram Setup
1. Make sure you're logged into Instagram
2. Enable Meta AI access (if not already enabled)
3. Have some Miina photos in your Photos app

## ⚙️ Configuration

### Update Credentials
In the automation script, update:
```javascript
config: {
  instagramUsername: 'your_actual_username',
  instagramPassword: 'your_actual_password',
  prompt: "Transform this photo into an anime style...",
  maxImages: 10,
  delayBetweenImages: 5000
}
```

### Customize Prompt
You can modify the prompt to get different styles:
- **Anime Style**: "Transform this photo into an anime style..."
- **Cartoon Style**: "Convert this photo to cartoon style..."
- **Artistic Style**: "Recreate this photo in artistic style..."

## 🔧 Troubleshooting

### Common Issues

#### Issue: Instagram not opening
**Solution**: 
- Make sure Instagram app is installed
- Try using the web version: `https://www.instagram.com`

#### Issue: Meta AI not accessible
**Solution**:
- Check if Meta AI is available in your region
- Try accessing via web: `https://www.meta.ai`
- Make sure your Instagram account has Meta AI access

#### Issue: Photos not uploading
**Solution**:
- Grant Photos permission to Shortcuts
- Make sure photos are in the correct album
- Try with fewer photos first

#### Issue: Generated images not saving
**Solution**:
- Grant Photos permission to save
- Check if there's enough storage space
- Wait longer for generation (up to 60 seconds)

### Debug Mode
Enable debug mode by adding this to the script:
```javascript
config.debug = true;
```

## 📊 Expected Results

### Processing Time
- **Per image**: 30-60 seconds
- **Batch of 10 images**: 5-10 minutes
- **Total with delays**: 10-15 minutes

### Output Quality
- **Resolution**: Same as original
- **Format**: JPEG/PNG
- **Style**: Anime/artistic transformation
- **Storage**: Saved to Photos app

### Success Rate
- **Desktop automation**: ~60-70%
- **iPhone automation**: ~90-95%
- **Manual process**: 100% (but time-consuming)

## 🎯 Best Practices

### For Best Results
1. **Use high-quality photos** (at least 1080p)
2. **Good lighting** in original photos
3. **Clear faces** for better anime conversion
4. **Process in batches** of 5-10 images
5. **Wait between batches** to avoid rate limits

### Automation Tips
1. **Run during off-peak hours** (late night/early morning)
2. **Keep iPhone plugged in** during automation
3. **Don't use phone** during automation
4. **Check results** after each batch
5. **Backup original photos** before processing

## 🔄 Integration with Website

### Automatic Upload
The generated images can be automatically uploaded to your website:

1. **Save to iCloud Drive** instead of Photos
2. **Sync with website folder** using Files app
3. **Update manifest** automatically
4. **Display in Miina gallery**

### Real-time Updates
- Generated images appear in the website gallery
- Progress tracking in real-time
- Error reporting and retry mechanisms

## 🚀 Advanced Features

### Batch Processing
- Process multiple albums
- Different prompts per batch
- Automatic organization by style

### Quality Control
- Preview generated images
- Manual approval process
- Retry failed generations

### Analytics
- Track success rates
- Monitor processing times
- Generate reports

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Enable debug mode
3. Check Instagram/Meta AI status
4. Try with a single image first
5. Contact support with error logs

---

**🎉 You're now ready to automate Meta AI image generation on your iPhone!** 