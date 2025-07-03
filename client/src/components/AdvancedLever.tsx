import React, { useState } from 'react';
import './AdvancedLever.css';

interface AdvancedLeverProps {
  onToggle: (isActive: boolean) => void;
  isActive: boolean;
  size?: number;
  style?: React.CSSProperties;
}

const AdvancedLever: React.FC<AdvancedLeverProps> = ({ 
  onToggle, 
  isActive, 
  size = 80, 
  style 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onToggle(!isActive);
  };

  return (
    <div className="advanced-lever-container" style={style}>
      {/* Lever Base */}
      <div 
        className={`advanced-lever-base ${isActive ? 'active' : 'inactive'}`}
        style={{
          width: size,
          height: size,
          position: 'relative'
        }}
      >
        {/* Outer Ring */}
        <div className="lever-outer-ring">
          <div className="lever-ring-glow" />
        </div>

        {/* Inner Core */}
        <div 
          className={`lever-inner-core ${isPressed ? 'pressed' : ''}`}
          onClick={handleClick}
        >
          {/* Center Button */}
          <div className="lever-center-button">
            <div className="lever-button-surface">
              {/* Status Indicator */}
              <div className={`lever-status-dot ${isActive ? 'active' : 'inactive'}`} />
              
              {/* Handle */}
              <div className={`lever-handle ${isActive ? 'pulled' : 'released'}`}>
                <div className="lever-handle-grip" />
              </div>
            </div>
          </div>

          {/* Energy Rings */}
          <div className="lever-energy-rings">
            <div className="energy-ring ring-1" />
            <div className="energy-ring ring-2" />
            <div className="energy-ring ring-3" />
          </div>
        </div>

        {/* Status Display */}
        <div className="lever-status-display">
          <div className="status-text">
            {isActive ? 'LIVE WALLPAPER' : 'STREAM MODE'}
          </div>
          <div className="status-subtext">
            {isActive ? 'ACTIVE' : 'STANDBY'}
          </div>
        </div>
      </div>

      {/* Holographic Effects */}
      <div className="lever-hologram-effects">
        <div className="hologram-line line-1" />
        <div className="hologram-line line-2" />
        <div className="hologram-line line-3" />
        <div className="hologram-particle particle-1" />
        <div className="hologram-particle particle-2" />
        <div className="hologram-particle particle-3" />
      </div>
    </div>
  );
};

export default AdvancedLever; 