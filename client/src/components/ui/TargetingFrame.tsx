import React, { useState, useEffect } from 'react';
import '../../styles/TargetingFrame.css';

interface TargetingFrameProps {
  children: React.ReactNode;
  title?: string;
  targetId?: string;
  targetType?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  status?: 'LOCKED' | 'ACQUIRING' | 'TRACKING' | 'ANALYZING';
  isSelected?: boolean;
  onClick?: () => void;
}

const TargetingFrame: React.FC<TargetingFrameProps> = ({
  children,
  title = 'TARGET',
  targetId = Math.random().toString(36).substring(2, 10).toUpperCase(),
  targetType = 'IMAGE',
  status = 'TRACKING',
  isSelected = false,
  onClick
}) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    // Simulate targeting system activity
    const interval = setInterval(() => {
      setIsActive(prev => !prev);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`targeting-frame ${isSelected ? 'selected' : ''} ${status.toLowerCase()}`}
      onClick={onClick}
    >
      <div className="target-content">
        {children}
      </div>
      
      <div className="target-overlay"></div>
      
      <div className="target-corners">
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
      </div>
      
      <div className="target-scan-line"></div>
      
      <div className="target-info">
        <div className="target-header">
          <div className="target-id">{targetId}</div>
          <div className="target-type">{targetType}</div>
        </div>
        
        <div className="target-title">{title}</div>
        
        <div className="target-footer">
          <div className="target-status">
            <span className={`status-indicator ${isActive ? 'active' : ''}`}></span>
            <span className="status-text">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetingFrame;