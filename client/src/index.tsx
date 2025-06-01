import React from 'react';
import ReactDOM from 'react-dom'; // Change this line - use legacy React 17 import
import './index.css';
import App from './App';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    checkCameraAccess: () => Promise<boolean>;
  }
}

if (process.env.NODE_ENV !== 'production') {
  // Debug helper for video stream
  window.checkCameraAccess = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Available video devices:', videoDevices);
      
      if (videoDevices.length > 0) {
        console.log('First camera selected:', videoDevices[0].label);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: videoDevices[0].deviceId } 
        });
        console.log('Camera access successful!', stream);
        return true;
      } else {
        console.error('No video devices found');
        return false;
      }
      
    } catch (error) {
      console.error('Error checking camera access:', error);
      return false;
    }
  };
}

// Use the React 17 render method
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);