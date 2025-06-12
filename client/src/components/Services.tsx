import React from 'react';
import CleaningServices from './CleaningServices';
import './Home.css';

const Services: React.FC = () => {
  return (
    <div className="main-module-panel">
      <div className="services-main" style={{ width: '100%', maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="services-title">Our Services</h2>
        <div className="cockpit-services-options" style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <h3 style={{ color: '#00fff7', textShadow: '0 0 8px #00fff7', marginBottom: 12 }}>Cleaning</h3>
            <CleaningServices />
          </div>
          <div style={{ width: '100%', display: 'flex', gap: 24, justifyContent: 'center' }}>
            <button className="service-btn" disabled>News: Ops news and mission updates from HQ</button>
            <button className="service-btn" disabled>Teaching: Tactical training and mission briefings</button>
            <button className="service-btn" disabled>Other: More cockpit modules coming soon</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services; 