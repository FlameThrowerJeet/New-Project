import React, { useState, useEffect } from 'react';
import './Stream.css';
import StreamScheduleCalendar from './StreamScheduleCalendar';
import RotatingGlobe from './RotatingGlobe';

interface OBSStreamProps {
  isBackground?: boolean;
  onHealthChange?: (isHealthy: boolean) => void;
}

const OBSStream: React.FC<OBSStreamProps> = ({ isBackground = false, onHealthChange }) => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [streamSrc, setStreamSrc] = useState('http://localhost:8003');
  const [isLoading, setIsLoading] = useState(true);
  const [healthCheckCount, setHealthCheckCount] = useState(0);

  // Health check for OBS server
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8080', {
          signal: AbortSignal.timeout(3000)
        });
        const healthy = response.ok;

        if (healthy) {
          setIsHealthy(true);
          if (onHealthChange) onHealthChange(true);
          setStreamSrc('http://localhost:8003');
        } else {
          throw new Error('Not healthy');
        }
        
        // Only log status changes or every 10th check to reduce spam
        if (healthy !== isHealthy || healthCheckCount % 10 === 0) {
          console.log(`OBS Server: ${healthy ? 'Online' : 'Offline'}`);
        }
      } catch (error) {
        // Try fallback port if first failed
        if (streamSrc === 'http://localhost:8003') {
          let urlToCheck = 'http://localhost:8080';
          try {
            const res2 = await fetch(urlToCheck, { signal: AbortSignal.timeout(3000) });
            if (res2.ok) {
              setIsHealthy(true);
              if (onHealthChange) onHealthChange(true);
              setStreamSrc(urlToCheck);
              return;
            }
          } catch {}
        }

        setIsHealthy(false);
        if (onHealthChange) onHealthChange(false);
        // Only log errors occasionally to reduce spam
        if (healthCheckCount % 20 === 0) {
          console.warn('OBS server check failed - retrying in background');
        }
      } finally {
        setIsLoading(false);
        setHealthCheckCount(prev => prev + 1);
      }
    };

    checkHealth();
    // Increased interval to 30 seconds to reduce spam
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [isHealthy, healthCheckCount, onHealthChange, streamSrc]);

  if (isBackground) {
    return (
      <iframe
        src={streamSrc}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          zIndex: -10,
          opacity: 0.5,
          pointerEvents: 'none'
        }}
        title="OBS Background Stream"
      />
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '2px solid rgba(0, 212, 170, 0.3)'
    }}>
      {/* Main Stream */}
      <video
        src={`${streamSrc}/stream`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          border: 'none'
        }}
        autoPlay
        muted
        controls={false}
      />
      
      {/* Status Overlay - Only show when offline */}
      {!isHealthy && !isLoading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 68, 68, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          backdropFilter: 'blur(5px)'
        }}>
          OBS Offline
        </div>
      )}
      
      {/* Minimize status overlay when healthy */}
      {isHealthy && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 212, 170, 0.6)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          backdropFilter: 'blur(5px)',
          opacity: 0.8
        }}>
          🔴 LIVE
          </div>
        )}
    </div>
  );
};

export default OBSStream; 