import React from 'react';
import { useLocation } from 'react-router-dom';
import TwitchBackground from './TwitchBackground';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // High opacity on home, lower elsewhere
  const isHome = location.pathname === '/';
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <TwitchBackground style={{ opacity: isHome ? 0.85 : 0.25, zIndex: 0, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default Layout; 