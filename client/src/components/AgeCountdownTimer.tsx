import React, { useState, useEffect } from 'react';
import './AgeCountdownTimer.css';

const AgeCountdownTimer: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const [timeLeft, setTimeLeft] = useState({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0
  });
  const [dobISO, setDobISO] = useState<string | null>(null);

  // Load DOB from localStorage and listen for changes
  useEffect(() => {
    const loadDob = () => {
      const savedDob = localStorage.getItem('playerDOB');
      if (savedDob) {
        // Normalize any previous formats to YYYY-MM-DD
        const normalize = (s: string): string | null => {
          const trimmed = s.trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
          // Try ISO or any Date-parsable string
          const d = new Date(trimmed);
          if (!Number.isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          }
          // Try MM/DD/YYYY
          const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (mdy) {
            const m = mdy[1].padStart(2, '0');
            const d2 = mdy[2].padStart(2, '0');
            const y = mdy[3];
            return `${y}-${m}-${d2}`;
          }
          return null;
        };
        const norm = normalize(savedDob);
        if (norm) {
          setDobISO(norm);
        }
      } else {
        setDobISO(null);
      }
    };

    // Load initial DOB
    loadDob();

    // Listen for storage changes (when DOB is updated in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'playerDOB') {
        loadDob();
      }
    };

    // Listen for custom event (when DOB is updated in same window)
    const handleDobUpdate = () => {
      loadDob();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dobUpdated', handleDobUpdate);

    // Also poll localStorage periodically as a fallback
    const pollInterval = setInterval(loadDob, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dobUpdated', handleDobUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (!dobISO) {
      // If no DOB is set, show zeros
      setTimeLeft({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTimeLeft = () => {
      // Parse DOB as date-only to avoid timezone drift
      let birthDate: Date | null = null;
      try {
        const parts = dobISO.split('-').map(Number);
        if (parts.length === 3 && parts.every(n => !Number.isNaN(n))) {
          const [y, m, d] = parts;
          birthDate = new Date(y, m - 1, d, 0, 0, 0, 0);
        }
      } catch {}
      
      if (!birthDate || Number.isNaN(birthDate.getTime())) {
        setTimeLeft({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const now = new Date();
      const ageInMs = now.getTime() - birthDate.getTime();
      
      const years = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
      const remainingMs = ageInMs % (365.25 * 24 * 60 * 60 * 1000);
      const months = Math.floor(remainingMs / (30.44 * 24 * 60 * 60 * 1000));
      const remainingMs2 = remainingMs % (30.44 * 24 * 60 * 60 * 1000);
      const days = Math.floor(remainingMs2 / (24 * 60 * 60 * 1000));
      const remainingMs3 = remainingMs2 % (24 * 60 * 60 * 1000);
      const hours = Math.floor(remainingMs3 / (60 * 60 * 1000));
      const remainingMs4 = remainingMs3 % (60 * 60 * 1000);
      const minutes = Math.floor(remainingMs4 / (60 * 1000));
      const seconds = Math.floor((remainingMs4 % (60 * 1000)) / 1000);
      
      setTimeLeft({ years, months, days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [dobISO]);

  const timerItems = [
    { value: timeLeft.years, label: 'Years' },
    { value: timeLeft.months, label: 'Months' },
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' }
  ];

  return (
    <div className="age-timer-container" style={style}>
      {/* Train 1 */}
      <div className="age-train age-train-1">
        <div className="age-train-header">AGE</div>
        {timerItems.map((item, index) => (
          <div key={item.label} className={`age-train-car ${index % 2 === 0 ? 'even' : 'odd'}`}>
            <div className="age-train-value">{String(item.value).padStart(2, '0')}</div>
            <div className="age-train-label">{item.label}</div>
          </div>
        ))}
        <div className="age-train-footer" />
      </div>
      
      {/* Train 2 - offset */}
      <div className="age-train age-train-2">
        <div className="age-train-header">AGE</div>
        {timerItems.map((item, index) => (
          <div key={item.label} className={`age-train-car ${index % 2 === 0 ? 'even' : 'odd'}`}>
            <div className="age-train-value">{String(item.value).padStart(2, '0')}</div>
            <div className="age-train-label">{item.label}</div>
          </div>
        ))}
        <div className="age-train-footer" />
      </div>
    </div>
  );
};

export default AgeCountdownTimer;
