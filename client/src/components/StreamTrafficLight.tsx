import React, { useState, useEffect } from 'react';

interface StreamStatus {
  iphone1: boolean;
  iphone2: boolean;
  obsCamera: boolean;
}

const StreamTrafficLight: React.FC = () => {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    iphone1: false,
    iphone2: false,
    obsCamera: false
  });
  const [isChecking, setIsChecking] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Test iPhone streams
  const testIPhoneStream = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      return true; // If no error, stream is accessible
    } catch (error) {
      // Silently fail to reduce console spam
      return false;
    }
  };

  // Test OBS Virtual Camera
  const testOBSCamera = async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return false;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const obsCamera = devices.find(
        (d) => d.kind === 'videoinput' && 
               (d.label.toLowerCase().includes('obs') || 
                d.label.toLowerCase().includes('virtual'))
      );
      
      return !!obsCamera;
    } catch (error) {
      return false;
    }
  };

  // Run all stream tests
  const runStreamTests = async () => {
    setIsChecking(true);
    
    try {
      const [iphone1, iphone2, obsCamera] = await Promise.all([
        testIPhoneStream('http://192.168.29.21:8989/'),
        testIPhoneStream('http://192.168.29.208:8080/'),
        testOBSCamera()
      ]);

      const newStatus = { iphone1, iphone2, obsCamera };
      setStreamStatus(newStatus);
      setLastUpdate(new Date());
      
      // Only log significant changes to reduce spam
      const workingStreams = Object.values(newStatus).filter(Boolean).length;
      console.log(`🚦 Traffic Light: ${workingStreams}/3 streams active`);
    } catch (error) {
      // Reduce error spam - only log occasionally
      console.warn('Stream monitoring temporarily unavailable');
    } finally {
      setIsChecking(false);
    }
  };

  // Run tests on mount and every 30 seconds
  useEffect(() => {
    runStreamTests();
    const interval = setInterval(runStreamTests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate traffic light color
  const getTrafficLightColor = () => {
    const workingStreams = Object.values(streamStatus).filter(Boolean).length;
    
    if (workingStreams === 0) return '#ff4444'; // Red
    if (workingStreams === 1) return '#ffaa00'; // Yellow/Orange
    if (workingStreams === 2) return '#4499ff'; // Blue
    if (workingStreams === 3) return '#00ff44'; // Green
    return '#666'; // Default
  };

  const getStatusText = () => {
    const workingStreams = Object.values(streamStatus).filter(Boolean).length;
    const total = Object.values(streamStatus).length;
    
    if (isChecking) return 'Checking Streams...';
    if (workingStreams === 0) return 'All Streams Offline';
    if (workingStreams === total) return 'All Systems Online';
    return `${workingStreams}/${total} Streams Active`;
  };

  const getTrafficLightIntensity = () => {
    const workingStreams = Object.values(streamStatus).filter(Boolean).length;
    return isChecking ? 0.3 : 0.2 + (workingStreams * 0.2);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      {/* Traffic Light Housing */}
      <div style={{
        background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
        borderRadius: '20px',
        padding: '20px 15px',
        border: '3px solid #444',
        boxShadow: '0 8px 25px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '120px'
      }}>
        {/* Main Traffic Light */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${getTrafficLightColor()}, ${getTrafficLightColor()}dd)`,
          border: '4px solid #333',
          boxShadow: `
            0 0 20px ${getTrafficLightColor()}88,
            inset 0 4px 15px rgba(255,255,255,0.2),
            inset 0 -4px 15px rgba(0,0,0,0.5)
          `,
          marginBottom: '15px',
          transition: 'all 0.5s ease',
          position: 'relative'
        }}>
          {/* Light reflection */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '20px',
            width: '30px',
            height: '30px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)',
            borderRadius: '50%',
            filter: 'blur(2px)'
          }} />
          
          {/* Checking animation */}
          {isChecking && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              border: '3px solid transparent',
              borderTop: '3px solid rgba(255,255,255,0.6)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>

        {/* Status Text */}
        <div style={{
          color: getTrafficLightColor(),
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          textShadow: `0 0 10px ${getTrafficLightColor()}66`
        }}>
          {getStatusText()}
        </div>

        {/* Individual Stream Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '10px',
          color: '#ccc'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: streamStatus.iphone1 ? '#00ff44' : '#ff4444',
              boxShadow: `0 0 8px ${streamStatus.iphone1 ? '#00ff44' : '#ff4444'}66`
            }} />
            <span>iPhone 1</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: streamStatus.iphone2 ? '#00ff44' : '#ff4444',
              boxShadow: `0 0 8px ${streamStatus.iphone2 ? '#00ff44' : '#ff4444'}66`
            }} />
            <span>iPhone 2</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: streamStatus.obsCamera ? '#00ff44' : '#ff4444',
              boxShadow: `0 0 8px ${streamStatus.obsCamera ? '#00ff44' : '#ff4444'}66`
            }} />
            <span>OBS Cam</span>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={runStreamTests}
          disabled={isChecking}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            background: 'linear-gradient(145deg, #404040, #303030)',
            border: '1px solid #555',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '10px',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            opacity: isChecking ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isChecking ? '🔄 Testing...' : '🔄 Refresh'}
        </button>

        {/* Last Update */}
        <div style={{
          fontSize: '8px',
          color: '#666',
          marginTop: '8px',
          textAlign: 'center'
        }}>
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StreamTrafficLight; 