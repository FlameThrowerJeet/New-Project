import React, { useEffect, useRef, useState } from 'react';

const OBSBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cameraInfo, setCameraInfo] = useState<string>('');
  const [streamMethod, setStreamMethod] = useState<'browser' | 'http'>('browser');

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    
    const tryBrowserAPI = async (): Promise<boolean> => {
      try {
        // First check if camera API is available
        if (!navigator.mediaDevices?.enumerateDevices) {
          setCameraInfo('Camera API not available');
          return false;
        }
        
        // List all video input devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        
        // Reduced logging - only log when debugging needed
        
        // Look for OBS Virtual Camera
        const obsCamera = videoDevices.find(
          (d) => d.label.toLowerCase().includes('obs') || 
                 d.label.toLowerCase().includes('virtual')
        );
        
        if (!obsCamera) {
          setCameraInfo(`No OBS Virtual Camera found. Available: ${videoDevices.length} cameras`);
          return false;
        }
        
        setCameraInfo(`Found: ${obsCamera.label}`);
        console.log('📹 Found OBS Camera:', obsCamera.label);
        
        // Try to get the stream
        const constraints = {
          video: {
            deviceId: { exact: obsCamera.deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!active) return false;
        
        const video = videoRef.current;
        if (video && stream) {
          video.srcObject = stream;
          await video.play();
          setIsConnected(true);
          setStreamMethod('browser');
          setCameraInfo(`Connected: ${obsCamera.label}`);
          console.log('✅ OBS Virtual Camera connected');
          return true;
        }
        
        return false;
        
      } catch (error) {
        console.error('❌ OBS Camera browser API error:', error);
        setCameraInfo(`Browser API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
      }
    };

    const tryHTTPStream = async (): Promise<boolean> => {
      try {
        // Try MJPEG stream first
        const img = imgRef.current;
        if (!img || !active) return false;

        setCameraInfo('Trying HTTP stream...');
        
        return new Promise((resolve) => {
          const handleLoad = () => {
            console.log('✅ OBS HTTP stream connected');
            setIsConnected(true);
            setStreamMethod('http');
            setCameraInfo('Connected: HTTP Stream');
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve(true);
          };

          const handleError = () => {
            console.warn('❌ OBS HTTP stream failed');
            setCameraInfo('HTTP stream failed');
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve(false);
          };

          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
          img.src = 'http://localhost:8080/video_feed';
        });
        
      } catch (error) {
        console.error('❌ HTTP stream error:', error);
        return false;
      }
    };

    const init = async () => {
      // Try browser API first for best performance
      const browserSuccess = await tryBrowserAPI();
      
      if (!browserSuccess && active) {
        // Fallback to HTTP streaming
        const httpSuccess = await tryHTTPStream();
        
        if (!httpSuccess && active) {
          setCameraInfo('No OBS stream available');
          setIsConnected(false);
        }
      }
    };

    init();

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      opacity: isConnected ? 0.3 : 0.1,
      pointerEvents: 'none'
    }}>
      {isConnected ? (
        streamMethod === 'browser' ? (
    <video
      ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            autoPlay
      muted
      playsInline
          />
        ) : (
          <img
            ref={imgRef}
      style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            alt="OBS Background Stream"
          />
        )
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333',
          fontSize: '24px',
          fontFamily: 'monospace'
        }}>
          📺 OBS Background
        </div>
      )}
      
      {/* Debug info - only show when not connected */}
      {!isConnected && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#888',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          maxWidth: '300px'
        }}>
          🎥 OBS: {cameraInfo || 'Virtual Camera Not Available'}
        </div>
      )}
    </div>
  );
};

export default OBSBackground; 