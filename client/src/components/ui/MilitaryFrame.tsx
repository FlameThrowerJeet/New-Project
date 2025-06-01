import React, { ReactNode } from 'react';
import '../../styles/MilitaryFrame.css';

interface MilitaryFrameProps {
  children: ReactNode;
  title?: string;
  classification?: 'TOP SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED';
  missionId?: string;
  bordered?: boolean;
  scanEffect?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
}

const MilitaryFrame: React.FC<MilitaryFrameProps> = ({
  children,
  title = 'TACTICAL DISPLAY',
  classification = 'CONFIDENTIAL',
  missionId = 'FOGGHYA-117',
  bordered = true,
  scanEffect = true,
  isActive = true,
  isLoading = false,
}) => {
  return (
    <div className={`military-frame ${bordered ? 'bordered' : ''} ${isActive ? 'active' : 'inactive'}`}>
      <div className="frame-header">
        <div className="header-left">
          <span className="classification">{classification}</span>
          <span className="header-divider">|</span>
          <span className="mission-id">MISSION: {missionId}</span>
        </div>
        <div className="header-title">{title}</div>
        <div className="header-right">
          <span className="timestamp">{new Date().toISOString()}</span>
        </div>
      </div>
      
      <div className="frame-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-text">INITIALIZING...</div>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        ) : (
          <>
            {children}
            {scanEffect && <div className="scan-effect"></div>}
          </>
        )}
      </div>
      
      <div className="frame-footer">
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
        <div className="footer-text">FOGGHYA TACTICAL SYSTEM v2.5.7</div>
        <div className="footer-status">
          <span className="status-indicator"></span>
          <span className="status-text">{isActive ? 'OPERATIONAL' : 'STANDBY'}</span>
        </div>
      </div>
    </div>
  );
};

export default MilitaryFrame;