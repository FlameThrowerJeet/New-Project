import React, { useMemo, useState, useEffect } from 'react';
import './MissionEncouragementOverlay.css';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date | string;
  category: 'health' | 'habits' | 'goals' | 'custom';
}

interface TimeCounter {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeElapsed(completedAt: Date | string): TimeCounter {
  const now = new Date().getTime();
  const completedDate = completedAt instanceof Date ? completedAt : new Date(completedAt);
  const completed = completedDate.getTime();
  const diffMs = now - completed;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function formatTimeCounter(counter: TimeCounter): string {
  if (counter.days > 0) {
    return `${counter.days}d ${counter.hours}h ${counter.minutes}m ${counter.seconds}s`;
  } else if (counter.hours > 0) {
    return `${counter.hours}h ${counter.minutes}m ${counter.seconds}s`;
  } else if (counter.minutes > 0) {
    return `${counter.minutes}m ${counter.seconds}s`;
  } else {
    return `${counter.seconds}s`;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'health': return '#00ff88';
    case 'habits': return '#00d4aa';
    case 'goals': return '#00fff7';
    case 'custom': return '#ffaa00';
    default: return '#00fff7';
  }
}

interface MissionChecklistItem { /* ... as defined before ... */ }
interface Session { /* ... as defined before ... */ }
interface DayData { /* ... as defined before ... */ }

const useGlobalData = () => {
    // ... logic from previous attempt ...
    const [missions, setMissions] = useState<MissionChecklistItem[]>([]);
    const [missionTracker, setMissionTracker] = useState<DayData[]>([]);

    useEffect(() => {
        const fetchData = () => {
            try {
                const savedMissions = localStorage.getItem('mission-checklist');
                setMissions(savedMissions ? JSON.parse(savedMissions) : []);
                const savedTrackerData = localStorage.getItem('mission-tracker-data');
                setMissionTracker(savedTrackerData ? JSON.parse(savedTrackerData) : []);
            } catch (err) { console.error("Data fetch error:", err); }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return { missions, missionTracker };
};

const generateStatements = (data: any): string[] => {
    // ... logic from previous attempt ...
    const statements: string[] = [];
    const { missions } = data;
    const ongoing = missions.filter((m: any) => m.isCompleted);
    ongoing.forEach((m: any) => {
        const elapsed = m.completedAt ? (new Date().getTime() - new Date(m.completedAt).getTime()) / 1000 : 0;
        statements.push(`OP ACTIVE: ${m.title.toUpperCase()} // ELAPSED: ${Math.floor(elapsed/60)}m ${Math.floor(elapsed%60)}s`);
    });
    if (statements.length === 0) return ["SYSTEM STANBY: No active missions."];
    return statements;
};

const MissionEncouragementOverlay: React.FC = () => {
  const { missions, missionTracker } = useGlobalData();
  
  const statements = useMemo(() => generateStatements({ missions, missionTracker }), [missions, missionTracker]);
  const displayMessages = [...statements, ...statements];

  return (
    <>
      {/* Mission Bulletin */}
      <div className="mission-bulletin-container">
        <div className="bulletin-scroll">
          {displayMessages.map((msg, idx) => (
            <div className="bulletin-message" key={idx}>{msg}</div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MissionEncouragementOverlay; 