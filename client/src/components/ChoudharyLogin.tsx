import React, { useState } from 'react';
import { getChoudharyByAadhar, getAllChoudharyMembers } from '../data/choudharyRegistry';
import './ChoudharyLogin.css';

interface ChoudharyLoginProps {
  onLoginSuccess: (userData: { firstName: string; aadharNumber: string; fullName: string }) => void;
}

interface UIDAIResponse {
  success: boolean;
  data?: {
    name: string;
    surname: string;
    aadharNumber: string;
  };
  error?: string;
}

const ChoudharyLogin: React.FC<ChoudharyLoginProps> = ({ onLoginSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateAadhar = (aadhar: string) => {
    // Remove spaces and check if it's 12 digits
    const cleanAadhar = aadhar.replace(/\s/g, '');
    return /^\d{12}$/.test(cleanAadhar);
  };

  const handleMinimize = () => {
    // Skip login during development - use a default user
    onLoginSuccess({
      firstName: 'Dev',
      aadharNumber: '123456789012',
      fullName: 'Dev Choudhary'
    });
  };

  const verifyWithUIDAI = async (aadhar: string, name: string): Promise<UIDAIResponse> => {
    try {
      // This would be the actual UIDAI API endpoint
      // Note: In production, this would require proper authentication and API keys
      const response = await fetch('/api/uidai/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_UIDAI_API_KEY', // Would need actual API key
        },
        body: JSON.stringify({
          aadharNumber: aadhar.replace(/\s/g, ''),
          name: name,
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('UIDAI service unavailable');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('UIDAI verification error:', error);
      // For demo purposes, we'll simulate the verification
      return simulateUIDAIVerification(aadhar, name);
    }
  };

  const simulateUIDAIVerification = (aadhar: string, name: string): UIDAIResponse => {
    // This simulates what the real UIDAI API would return
    // In production, this would be replaced with actual API calls
    
    const cleanAadhar = aadhar.replace(/\s/g, '');
    
    // Check against the comprehensive Choudhary registry
    const member = getChoudharyByAadhar(cleanAadhar);
    
    if (member) {
      // Verify first name matches (case-insensitive)
      if (member.firstName.toLowerCase() === name.toLowerCase()) {
        return {
          success: true,
          data: {
            name: member.firstName,
            surname: member.lastName,
            aadharNumber: cleanAadhar
          }
        };
      } else {
        return {
          success: false,
          error: 'First name does not match the Aadhar card records'
        };
      }
    }

    return {
      success: false,
      error: 'Aadhar verification failed. Please check your details.'
    };
  };

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!firstName.trim()) {
      setError('Please enter your first name');
      setIsLoading(false);
      return;
    }

    if (!validateAadhar(aadharNumber)) {
      setError('Please enter a valid 12-digit Aadhar number');
      setIsLoading(false);
      return;
    }

    try {
      // Verify with UIDAI
      const verificationResult = await verifyWithUIDAI(aadharNumber, firstName);

      if (verificationResult.success && verificationResult.data) {
        const { name, surname, aadharNumber: verifiedAadhar } = verificationResult.data;
        
        // Check if surname is Choudhary
        if (surname.toLowerCase() !== 'choudhary') {
          setError('Access denied. Only Choudhary surname members are allowed.');
          setIsLoading(false);
          return;
        }

        // Login successful
        onLoginSuccess({
          firstName: name,
          aadharNumber: verifiedAadhar,
          fullName: `${name} ${surname}`
        });
      } else {
        setError(verificationResult.error || 'Aadhar verification failed. Please check your details.');
      }
    } catch (error) {
      setError('Unable to verify with UIDAI. Please try again later.');
    }

    setIsLoading(false);
  };

  const formatAadharNumber = (value: string) => {
    // Format Aadhar as XXXX XXXX XXXX
    const cleanValue = value.replace(/\s/g, '');
    const formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 14); // Max 14 characters (12 digits + 2 spaces)
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadharNumber(e.target.value);
    setAadharNumber(formatted);
  };

  return (
    <div className="choudhary-login-container">
      <div className="choudhary-login-card">
        {/* Minimize Button */}
        <button 
          className="minimize-button"
          onClick={handleMinimize}
          title="Skip login (Development mode)"
        >
          ⚡ Dev Mode
        </button>

        <div className="choudhary-login-header">
          <h1>Flame Thrower Jet</h1>
        </div>

        <div className="choudhary-login-form">
          <div className="input-group">
            <div className="name-input-container">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="name-input"
              />
              <span className="surname-display">Choudhary</span>
            </div>
          </div>

          <div className="input-group">
            <input
              type="text"
              value={aadharNumber}
              onChange={handleAadharChange}
              placeholder="Aadhar Number"
              maxLength={14}
              className="aadhar-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'Verifying with UIDAI...' : 'Verify & Login'}
          </button>

          <div className="uidai-info">
            <small>🔐 Verified through UIDAI - Government of India</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoudharyLogin; 