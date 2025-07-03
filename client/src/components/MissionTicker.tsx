import React, { useEffect, useState } from 'react';
import './MissionTicker.css';

interface MissionTickerProps {
  missions: string[];
  maxVisible?: number; // how many missions to show simultaneously
  loopDelay?: number; // ms between rotations
}

const MissionTicker: React.FC<MissionTickerProps> = ({ missions, maxVisible = 3, loopDelay = 4000 }) => {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (missions.length <= maxVisible) return;
    const id = setInterval(() => {
      setStartIndex((prev) => (prev + maxVisible) % missions.length);
    }, loopDelay);
    return () => clearInterval(id);
  }, [missions.length, maxVisible, loopDelay]);

  const visible = missions.slice(startIndex, startIndex + maxVisible);
  if (visible.length < maxVisible) {
    visible.push(...missions.slice(0, maxVisible - visible.length));
  }

  return (
    <div className="mission-ticker">
      {visible.map((m, idx) => (
        <div key={`${startIndex}-${idx}`} className="mission-line fade">
          {m}
        </div>
      ))}
    </div>
  );
};

export default MissionTicker; 