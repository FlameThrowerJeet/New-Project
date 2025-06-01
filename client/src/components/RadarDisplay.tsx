import React from 'react';

const RadarDisplay: React.FC = () => {
  return (
    <div style={{
      width: 300,
      height: 300,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 50% 50%, #0f0 0%, #030 100%)',
      border: '2px solid #0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0f0',
      fontFamily: 'monospace'
    }}>
      <span>Radar Display</span>
    </div>
  );
};

export default RadarDisplay;