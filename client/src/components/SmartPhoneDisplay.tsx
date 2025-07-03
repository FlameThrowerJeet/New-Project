import React, { useState, useEffect } from 'react';
import PhoneStream from './PhoneStream';
import DemoPhoneContent from './DemoPhoneContent';

interface SmartPhoneDisplayProps {
  url: string;
  label: string;
  style?: React.CSSProperties;
}

const SmartPhoneDisplay: React.FC<SmartPhoneDisplayProps> = ({ url, label, style }) => {
  const [streamFailed, setStreamFailed] = useState(false);

  // Always try to load the real stream first
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      {!streamFailed ? (
        <PhoneStream 
          url={url} 
          label={label} 
          style={style}
          onStreamFail={() => setStreamFailed(true)}
        />
      ) : (
        <DemoPhoneContent label={`${label} (OFFLINE)`} style={style} />
      )}
    </div>
  );
};

export default SmartPhoneDisplay; 