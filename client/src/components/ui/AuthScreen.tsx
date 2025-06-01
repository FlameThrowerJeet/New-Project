import React, { useState, useEffect } from 'react';
import '../../styles/AuthScreen.css';
import { playSound } from '../../utils/audioFeedback';

interface AuthScreenProps {
  onAuthenticate: () => void;
  onCancel?: () => void;
  showBypass?: boolean;
  accessLevel?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticate,
  onCancel,
  showBypass = false,
  accessLevel = 'LEVEL_3'
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticateProgress, setAuthenticateProgress] = useState(0);
  const [bioScanProgress, setBioScanProgress] = useState(0);
  const [showBioScan, setShowBioScan] = useState(false);
  
  useEffect(() => {
    playSound('boot', { volume: 0.3 });
    
    return () => {
      // Cleanup logic if needed
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !password) {
      setErrorMessage('USERNAME AND PASSWORD REQUIRED');
      playSound('error');
      return;
    }
    
    // Start authentication process
    setIsAuthenticating(true);
    playSound('scan', { loop: true, volume: 0.3 });
    
    // Simulated authentication process with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setAuthenticateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Authentication complete, start bio scan
        setShowBioScan(true);
        simulateBioScan();
      }
    }, 150);
  };
  
  const simulateBioScan = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setBioScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        playSound('confirm');
        
        // Authentication successful
        setTimeout(() => {
          onAuthenticate();
        }, 1000);
      }
    }, 120);
  };
  
  const handleBypass = () => {
    playSound('menu');
    onAuthenticate();
  };
  
  const handleCancel = () => {
    playSound('click');
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <div className="system-name">FOGGHYA SECURE ACCESS</div>
          <div className="access-level">CLEARANCE: {accessLevel}</div>
        </div>
        
        {!isAuthenticating ? (
          <div className="auth-content">
            <div className="auth-message">
              AUTHENTICATION REQUIRED
            </div>
            
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">USERNAME:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">PASSPHRASE:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </div>
              
              {errorMessage && (
                <div className="auth-error">
                  {errorMessage}
                </div>
              )}
              
              <div className="auth-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  CANCEL
                </button>
                <button type="submit" className="auth-btn">
                  AUTHENTICATE
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="auth-process">
            {!showBioScan ? (
              <>
                <div className="process-title">AUTHENTICATING USER</div>
                <div className="scan-animation">
                  <div className="scan-line"></div>
                </div>
                <div className="auth-steps">
                  <div className="auth-step">
                    <span className="step-label">VERIFYING CREDENTIALS</span>
                    <span className="step-status">IN PROGRESS</span>
                  </div>
                  <div className="auth-step">
                    <span className="step-label">CHECKING PERMISSIONS</span>
                    <span className="step-status">PENDING</span>
                  </div>
                  <div className="auth-step">
                    <span className="step-label">BIOMETRIC VERIFICATION</span>
                    <span className="step-status">PENDING</span>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${authenticateProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {authenticateProgress.toFixed(0)}%
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="process-title">BIOMETRIC VERIFICATION</div>
                <div className="bio-scan-animation">
                  <div className="fingerprint"></div>
                  <div className="scan-line horizontal"></div>
                </div>
                <div className="auth-steps">
                  <div className="auth-step">
                    <span className="step-label">FACIAL RECOGNITION</span>
                    <span className="step-status success">COMPLETE</span>
                  </div>
                  <div className="auth-step">
                    <span className="step-label">RETINAL SCAN</span>
                    <span className="step-status success">COMPLETE</span>
                  </div>
                  <div className="auth-step">
                    <span className="step-label">FINGERPRINT MATCH</span>
                    <span className="step-status">IN PROGRESS</span>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${bioScanProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {bioScanProgress.toFixed(0)}%
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="auth-footer">
          <div className="footer-text">SECURE CONNECTION ESTABLISHED</div>
          {showBypass && !isAuthenticating && (
            <button className="bypass-btn" onClick={handleBypass}>
              BYPASS AUTH
            </button>
          )}
        </div>
        
        <div className="auth-decorations">
          <div className="corner tl"></div>
          <div className="corner tr"></div>
          <div className="corner bl"></div>
          <div className="corner br"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;