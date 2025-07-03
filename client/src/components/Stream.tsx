import React, { useState, useEffect } from 'react';
import './Stream.css';
import OBSStream from './OBSStream';

const Stream: React.FC = () => {
  const currentStream = <OBSStream />;

  // Compute scale to fill window after rotation
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (h !== 0) {
        setScale(w / h);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="stream-container-flv" style={{
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(2px)',
      border: '2px solid rgba(0, 212, 170, 0.3)',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="stream-header" style={{
        background: 'rgba(0, 212, 170, 0.2)',
        padding: '10px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(0, 212, 170, 0.3)'
      }}>
        <div className="header-title" style={{ 
          color: '#00d4aa', 
          fontSize: '18px', 
          fontWeight: 'bold' 
        }}>
          🎥 LIVE STREAM
        </div>
      </div>
      
      <div style={{ 
        flex: 1,
        minHeight: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          transform: `rotate(90deg) scale(${scale}) translateX(-12.5%)`,
          transformOrigin: 'center center'
        }}>
          {currentStream}
        </div>
      </div>
    </div>
  );
};

export default Stream;
