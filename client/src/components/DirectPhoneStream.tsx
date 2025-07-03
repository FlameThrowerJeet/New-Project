import React from 'react';

interface DirectPhoneStreamProps {
  url: string;
  label: string;
}

const DirectPhoneStream: React.FC<DirectPhoneStreamProps> = ({ url, label }) => {
  React.useEffect(() => {
    console.log(`🔧 ${label} component mounted with URL:`, url);
    
    // Test fetch to see what's happening
    fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    })
    .then(() => console.log(`🌐 ${label} HEAD request succeeded`))
    .catch(e => console.log(`🌐 ${label} HEAD request failed:`, e));
    
  }, [url, label]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      background: '#000',
      borderRadius: 16,
      overflow: 'hidden'
    }}>
      <img
        src={url}
        alt={`${label} Stream`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover'
        }}
        onLoad={(e) => {
          console.log(`✅ ${label} stream connected`);
          console.log(`📐 ${label} dimensions:`, (e.target as HTMLImageElement).naturalWidth, 'x', (e.target as HTMLImageElement).naturalHeight);
        }}
        onError={(e) => {
          console.log(`❌ ${label} stream error`);
          console.log(`🔍 ${label} error details:`, e);
          console.log(`🔍 ${label} current src:`, (e.target as HTMLImageElement).src);
        }}
      />
      <div style={{
        position: 'absolute',
        top: 5,
        left: 5,
        fontSize: 10,
        color: '#00ff00',
        background: 'rgba(0,0,0,0.7)',
        padding: 4,
        borderRadius: 2,
        fontFamily: 'monospace'
      }}>
        {label}
      </div>
    </div>
  );
};

export default DirectPhoneStream; 