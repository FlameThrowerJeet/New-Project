# iPhone Remote Meta AI Processing Setup

This system uses your iPhone as a remote processing unit to convert Miina images to anime style using Instagram's Meta AI.

## 🏗️ System Architecture

```
Laptop (Your PC)                    iPhone (Your Device)
     |                                    |
     |-- Sends Miina images ------------>|
     |                                    |-- Uses Instagram Meta AI
     |                                    |-- Processes images
     |<-- Downloads generated images ----|
     |                                    |
```

## 📱 iPhone Setup

### 1. Install Node.js on iPhone
- Install Node.js from the App Store or use a jailbreak method
- Alternative: Use a cloud service or remote desktop to run the server

### 2. Install Dependencies
```bash
npm install express multer puppeteer cors
```

### 3. Configure Instagram Credentials
Edit `iphone-server.js` and update:
```javascript
const INSTAGRAM_CREDENTIALS = {
  username: 'your_instagram_username',
  password: 'your_instagram_password'
};
```

### 4. Get iPhone IP Address
- Connect iPhone to same WiFi as laptop
- Find iPhone IP: Settings > WiFi > (i) next to network name
- Update `iphone-remote-processor.js` with correct IP

### 5. Start iPhone Server
```bash
node iphone-server.js
```

## 💻 Laptop Setup

### 1. Install Dependencies
```bash
npm install express multer axios form-data cors
```

### 2. Start Remote Processor
```bash
node iphone-remote-processor.js
```

### 3. Start React App
```bash
cd client
npm run dev
```

## 🚀 Usage

1. **Start iPhone Server** (on iPhone):
   ```bash
   node iphone-server.js
   ```

2. **Start Laptop System** (on laptop):
   ```bash
   node iphone-remote-processor.js
   ```

3. **Open React App**:
   - Navigate to Miina module in cockpit
   - Check iPhone status
   - Set number of images to process
   - Click "Start iPhone Processing"

## 📋 How It Works

1. **Image Transfer**: Laptop sends Miina images to iPhone via HTTP
2. **Meta AI Processing**: iPhone uses Instagram's Meta AI to convert images
3. **Result Download**: Generated images are sent back to laptop
4. **Storage**: Results are saved in `client/public/images/miina-ai-generated/`

## 🔧 Troubleshooting

### iPhone Connection Issues
- Ensure both devices on same network
- Check iPhone IP address is correct
- Verify iPhone server is running on port 3004

### Instagram Login Issues
- Update credentials in `iphone-server.js`
- Ensure Instagram account is active
- Check for 2FA requirements

### Processing Failures
- Check iPhone has enough storage
- Verify Instagram app is working
- Monitor server logs for errors

## 📁 File Structure

```
Fogghya/
├── iphone-remote-processor.js    # Laptop server
├── iphone-server.js              # iPhone server
├── start-iphone-system.bat       # Laptop startup script
├── start-iphone-server.bat       # iPhone startup script
└── client/
    ├── Miina - Pics/             # Original images
    └── public/
        └── images/
            └── miina-ai-generated/ # Generated images
```

## 🎯 Benefits

- **Hardware Utilization**: Uses your iPhone's processing power
- **Instagram Integration**: Leverages Meta AI directly
- **Automated Workflow**: One-click processing
- **Local Storage**: All images stored on your laptop
- **Real-time Status**: Live monitoring of processing

## ⚠️ Important Notes

- Keep iPhone connected to power during processing
- Ensure stable WiFi connection
- Monitor Instagram for rate limits
- Backup original images before processing
- Generated images are automatically timestamped

## 🔄 Alternative Setup

If you can't run Node.js on iPhone directly:

1. **Use Cloud Server**: Deploy `iphone-server.js` to a cloud service
2. **Use Remote Desktop**: Access iPhone via remote desktop
3. **Use Web Automation**: Create web-based automation instead

## 📞 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify network connectivity
3. Test Instagram login manually
4. Ensure all dependencies are installed 