import React, { useEffect, useState } from 'react';

const CommandOutput: React.FC = () => {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#000',
      border: '2px solid #00ff00',
      borderRadius: 18,
      color: '#00ff00',
      fontFamily: 'Share Tech Mono, monospace',
      fontSize: 16,
      padding: 12,
      overflowY: 'auto',
      boxShadow: '0 0 18px #0f03',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      flex: 1
    }}>
      <div>SYSTEM ONLINE</div>
      <div>CHECKING SENSORS...</div>
      <div>ALL SYSTEMS NOMINAL</div>
      <div>READY FOR MISSION</div>
      <div>
        <span>&gt;_</span>
        <span style={{ opacity: showCursor ? 1 : 0 }}>|</span>
      </div>
    </div>
  );
};

export default CommandOutput;