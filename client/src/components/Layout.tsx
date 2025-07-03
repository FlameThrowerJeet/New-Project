import React from 'react';
import { useLocation } from 'react-router-dom';

const BACKGROUND_STREAM_URL = 'http://localhost:8003/stream';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // High opacity on home, lower elsewhere
  const isHome = location.pathname === '/';
  return (
    <>
      {/* Global OBS Background Video */}
      <video
        src={BACKGROUND_STREAM_URL}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -10
        }}
      />
      
      {/* Main Content */}
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        backgroundColor: 'rgba(10, 10, 35, 0.05)', // Ultra transparent to reveal video
        backdropFilter: 'blur(3px)'
      }}>
        {children}
      </div>
    </>
  );
};

export default Layout; 