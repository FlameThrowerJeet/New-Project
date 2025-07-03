import React, { useState, useEffect } from 'react';

interface Props {
  region: string;
  regionName: string;
}

// Background colors for different regions
const regionSky: Record<string, string> = {
  Mountains: '#b3d9ff',
  Desert: '#fff0cc',
  'River-Plains': '#ccffcc',
  Plateaus: '#e6e6e6',
  Delta: '#b3ffec',
  Hills: '#d9e6ff',
  'River-Valleys': '#b3ffcc',
  Jungles: '#b3ffb3',
  Coast: '#b3e6ff'
};

export const PilotStatus: React.FC<Props> = ({ region, regionName }) => {
  const [blink, setBlink] = useState(false);
  const [headRotation, setHeadRotation] = useState(0);
  const [breathe, setBreathe] = useState(0);
  const [vitals, setVitals] = useState({ heart: 72, oxygen: 98, temp: 36.5 });

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(prev => !prev);
    }, 2800);
    
    return () => clearInterval(blinkInterval);
  }, []);

  // Head movement and breathing
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setHeadRotation(Math.sin(Date.now() / 1000) * 5);
      setBreathe(Math.sin(Date.now() / 700) * 2);
      
      // Randomly adjust vital signs
      setVitals(prev => ({
        heart: prev.heart + (Math.random() - 0.5),
        oxygen: Math.min(100, prev.oxygen + (Math.random() - 0.5) * 0.2),
        temp: prev.temp + (Math.random() - 0.5) * 0.03
      }));
    }, 100);
    
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: regionSky[region] || '#222',
        border: '2px solid #0ff',
        borderRadius: 12,
        padding: 10,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Background elements based on region */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2, zIndex: 1 }}>
        {region === 'Mountains' && (
          <div style={{ 
            width: '100%', 
            height: '40%', 
            background: 'linear-gradient(transparent, #fff)',
            position: 'absolute',
            bottom: 0
          }} />
        )}
        {region === 'Desert' && (
          <div style={{ 
            width: '100%', 
            height: '30%', 
            background: '#ffcc66',
            position: 'absolute',
            bottom: 0
          }} />
        )}
      </div>

      {/* Pilot Avatar */}
      <div style={{ position: 'relative', zIndex: 2, transform: `rotate(${headRotation}deg)` }}>
        <svg width="80" height="80" viewBox="0 0 100 100">
          {/* Helmet */}
          <ellipse cx="50" cy="50" rx="40" ry="40" fill="#222" stroke="#0ff" strokeWidth="2" />
          
          {/* Visor */}
          <defs>
            <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0ff" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="50" rx="30" ry="18" fill="url(#visorGradient)" />
          
          {/* Eyes */}
          <ellipse cx="38" cy="52" rx="6" ry={blink ? 1 : 6} fill="#fff" />
          <ellipse cx="62" cy="52" rx="6" ry={blink ? 1 : 6} fill="#fff" />
          
          {/* Pupils - follow mouse */}
          <ellipse cx="38" cy="52" rx="2.5" ry="2.5" fill="#000" />
          <ellipse cx="62" cy="52" rx="2.5" ry="2.5" fill="#000" />
          
          {/* Mask */}
          <rect x="40" y="65" width="20" height="18" rx="8" fill="#333" stroke="#0ff" strokeWidth="2" />
          
          {/* Breather lines */}
          <rect x="48" y="83" width="4" height={10 + breathe} fill="#0ff" />
          <rect x="43" y="85" width="3" height={8 + breathe * 0.8} fill="#0ff" />
          <rect x="54" y="85" width="3" height={8 + breathe * 0.8} fill="#0ff" />
        </svg>
      </div>

      {/* Status Information */}
      <div style={{ 
        color: '#0ff', 
        marginTop: '10px', 
        fontFamily: 'Share Tech Mono, monospace',
        textAlign: 'center',
        zIndex: 2,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr'
      }}>
        <div style={{ textAlign: 'left', paddingLeft: '10px' }}>
          <div>PILOT: <span style={{ color: '#fff' }}>ONLINE</span></div>
          <div>REGION: <span style={{ color: '#fff' }}>{regionName}</span></div>
          <div>STATUS: <span style={{ color: '#0f0' }}>NOMINAL</span></div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div>HR: <span style={{ color: '#fff' }}>{Math.round(vitals.heart)}</span> BPM</div>
          <div>O₂: <span style={{ color: '#fff' }}>{Math.round(vitals.oxygen)}%</span></div>
          <div>TEMP: <span style={{ color: '#fff' }}>{vitals.temp.toFixed(1)}°C</span></div>
        </div>
      </div>

      {/* Animated status bars */}
      <div style={{ 
        width: '90%', 
        height: '8px', 
        backgroundColor: '#001', 
        marginTop: '10px',
        borderRadius: '4px',
        overflow: 'hidden',
        zIndex: 2
      }}>
        <div style={{ 
          width: `${vitals.oxygen}%`, 
          height: '100%', 
          backgroundColor: '#0ff',
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>
    </div>
  );
};

export default PilotStatus;