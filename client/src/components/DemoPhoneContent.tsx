import React, { useState, useEffect } from 'react';

interface DemoPhoneContentProps {
  label: string;
  style?: React.CSSProperties;
}

const DemoPhoneContent: React.FC<DemoPhoneContentProps> = ({ label, style }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setBatteryLevel(prev => {
        const newLevel = prev - 0.1;
        return newLevel <= 0 ? 100 : newLevel;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const apps = [
    { name: 'Camera', icon: '📷', color: '#34C759' },
    { name: 'Photos', icon: '🖼️', color: '#007AFF' },
    { name: 'Settings', icon: '⚙️', color: '#8E8E93' },
    { name: 'Messages', icon: '💬', color: '#34C759' },
    { name: 'Phone', icon: '📞', color: '#34C759' },
    { name: 'Safari', icon: '🧭', color: '#007AFF' },
    { name: 'Mail', icon: '📧', color: '#007AFF' },
    { name: 'Maps', icon: '🗺️', color: '#34C759' },
    { name: 'Weather', icon: '🌤️', color: '#007AFF' },
    { name: 'Clock', icon: '⏰', color: '#FF9500' },
    { name: 'Calculator', icon: '🔢', color: '#FF9500' },
    { name: 'Notes', icon: '📝', color: '#FF9500' }
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <div>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>📶</span>
          <span>📶</span>
          <span>🔋{Math.round(batteryLevel)}%</span>
        </div>
      </div>

      {/* App Grid */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        height: 'calc(100% - 120px)'
      }}>
        {apps.map((app, index) => (
          <div key={index} style={{
            background: app.color,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            aspectRatio: '1'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{app.icon}</div>
            <div style={{ fontSize: '8px', textAlign: 'center', fontWeight: 'bold' }}>
              {app.name}
            </div>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        height: '60px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        {['📞', '💬', '📧', '🧭'].map((icon, index) => (
          <div key={index} style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {icon}
          </div>
        ))}
      </div>

      {/* Label */}
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        background: 'rgba(0,0,0,0.7)',
        color: '#00d4aa',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'monospace',
        zIndex: 10
      }}>
        {label} 📱 DEMO
      </div>
    </div>
  );
};

export default DemoPhoneContent; 