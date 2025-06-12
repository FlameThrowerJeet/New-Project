import React, { useState } from 'react';
import './PhoneStream.css';

interface PhoneStreamProps {
  streamUrl?: string;
  classic?: boolean;
}

const PhoneStream: React.FC<PhoneStreamProps> = ({ streamUrl = 'https://www.twitch.tv/embed/your_channel/chat?parent=localhost', classic = false }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={classic ? 'phone-container classic' : 'phone-container'}>
      <div className="phone-label" style={{position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 10, color: '#00ff99', fontSize: '0.9rem', fontWeight: 600, textShadow: '0 0 8px #000'}}>
        {streamUrl}
      </div>
      <div className={classic ? 'phone-frame classic' : 'phone-frame'}>
        {!classic && <div className="phone-notch"></div>}
        {imgError ? (
          <div className="phone-content" style={{ color: '#f00', textAlign: 'center', padding: 20 }}>Stream failed to load.</div>
        ) : (
          <img
            key={streamUrl}
            src={streamUrl}
            alt="Phone Stream"
            className="phone-content"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PhoneStream; 