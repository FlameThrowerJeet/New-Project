import React, { useState, useEffect } from 'react';

interface PhoneStreamProps {
  url: string;
  label: string;
  style?: React.CSSProperties;
  onStreamFail?: () => void;
}

const PhoneStream: React.FC<PhoneStreamProps> = ({ url, label, style, onStreamFail }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastLoggedState, setLastLoggedState] = useState<string>('');

  const logStateChange = (newState: string) => {
    if (newState !== lastLoggedState) {
      console.log(`📱 ${label}: ${newState}`);
      setLastLoggedState(newState);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    logStateChange('Connected');
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    logStateChange('Connection failed');
    if (onStreamFail) {
      onStreamFail();
    }
  };

  useEffect(() => {
    // Reset states when URL changes
    setIsLoaded(false);
    setHasError(false);
    logStateChange('Connecting...');
  }, [url]);

  if (hasError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(40, 40, 40, 0.9)',
        color: '#888',
        border: '1px solid rgba(255, 68, 68, 0.3)',
        borderRadius: '8px',
        ...style 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px', color: '#ff4444' }}>📵</div>
          <div style={{ fontSize: '14px', marginBottom: '4px', color: '#ccc' }}>{label}</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>OFFLINE</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', ...style }}>
      {/* Loading indicator */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00d4aa',
          zIndex: 1,
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Connecting...</div>
          </div>
        </div>
      )}
      
      {/* Main iframe */}
      <iframe
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 0,
          objectFit: 'cover'
        }}
        title={label}
        allow="camera; microphone"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default PhoneStream;