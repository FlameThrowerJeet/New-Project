import React from 'react';
import useGlobalData from '../hooks/useGlobalData';
import './MissionBulletin.css';

// Helper to format time from seconds into H:M:S
const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
};

// --- Statement Generation Logic ---
const generateStatements = (data: any): string[] => {
    const statements: string[] = [];
    const { missions, missionTracker } = data;

    // 1. Ongoing Mission Statements
    const ongoingMissions = missions.filter((m: any) => m.isCompleted);
    ongoingMissions.forEach((mission: any) => {
        const elapsedSeconds = mission.completedAt ? (new Date().getTime() - new Date(mission.completedAt).getTime()) / 1000 : 0;
        statements.push(`TACTICAL.OP: ${mission.title.toUpperCase()} | ELAPSED: ${formatTime(elapsedSeconds)} | STATUS: ONGOING`);
    });

    // 2. Recent Session Statements
    const today = new Date().toLocaleDateString();
    const todayData = missionTracker.find((d: any) => d.date === today);
    if (todayData) {
        const passedSessions = todayData.sessions.filter((s: any) => s.status === 'passed' && s.notes.trim());
        if(passedSessions.length > 0) {
            const lastSession = passedSessions[passedSessions.length - 1];
            statements.push(`SESSION.LOG: Last entry for session ${lastSession.id} recorded. | DATA: "${lastSession.notes}"`);
        }
        
        const currentSession = todayData.sessions.find((s: any) => s.status === 'current');
        if (currentSession) {
            statements.push(`SESSION.ACTIVE: Session ${currentSession.id} is live. | OBJECTIVE: Record current activity.`);
        }
    }

    // 3. Upcoming Goal Statements
    const upcomingMissions = missions.filter((m: any) => !m.isCompleted);
    if (upcomingMissions.length > 0) {
        statements.push(`UPCOMING.OP: ${upcomingMissions[0].title.toUpperCase()} is pending deployment.`);
    }
    
    // 4. General Motivational Statements
    const completedCount = missions.filter((m:any) => m.isCompleted).length;
    if(completedCount > 3) {
        statements.push(`STATUS: Pilot is maintaining high operational tempo. ${completedCount} objectives active.`);
    } else {
        statements.push(`SYSTEM.NOTE: Maintain focus. Consistency is key to mission success.`);
    }

    if (statements.length === 0) {
        return ["SYSTEM.STANDBY: No active data streams. All systems nominal."];
    }

    return statements;
};


const MissionBulletin: React.FC = () => {
  const { missions, missionTracker, loading, error } = useGlobalData();

  if (loading) {
    return (
      <div className="mission-bulletin-container">
        <div className="bulletin-message">SYNCING DATA STREAMS...</div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="mission-bulletin-container">
            <div className="bulletin-message error">DATA LINK SEVERED: {error}</div>
        </div>
    );
  }
  
  const statements = generateStatements({ missions, missionTracker });
  const displayMessages = [...statements, ...statements]; // Duplicate for seamless scroll

  return (
    <div className="mission-bulletin-container">
      <div className="bulletin-scroll">
        {displayMessages.map((msg, idx) => (
          <div className="bulletin-message" key={idx}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionBulletin; 