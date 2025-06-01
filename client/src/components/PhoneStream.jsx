import React from 'react';
import './PhoneStream.css';

const PhoneStream = () => {
  return (
    <div className="phone-container">
      <div className="phone-frame">
        <div className="phone-notch"></div>
        <div className="phone-screen">
          <iframe
            src="http://192.168.29.208:8080"
            title="Phone Stream"
            className="stream-iframe"
            allow="camera; microphone"
          />
        </div>
        <div className="phone-home-indicator"></div>
      </div>
    </div>
  );
};

export default PhoneStream; 