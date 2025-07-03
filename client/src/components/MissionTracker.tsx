import React, { useState, useEffect, useRef } from 'react';
import './MissionTracker.css';
import Scribe from './Scribe'; // Import the Scribe component

interface Session {
  id: number;
  type: 'session' | 'break';
  startTime: string;
  endTime: string;
  notes: string;
  isActive: boolean;
  status: 'upcoming' | 'current' | 'passed';
}

interface DayData {
  dayNumber: number;
  date: string;
  sessions: Session[];
}

const MissionTracker: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'day' | 'sessions' | 'review' | 'scribe'>('day');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [missionData, setMissionData] = useState<DayData[]>(() => {
    try {
        const savedData = localStorage.getItem('mission-tracker-data');
        return savedData ? JSON.parse(savedData) : [];
    } catch {
        return [];
    }
  });
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [startDate] = useState<Date>(() => {
    const savedStartDate = localStorage.getItem('mission-tracker-startDate');
    return savedStartDate ? new Date(savedStartDate) : new Date();
  });
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const sessionScrollRef = useRef<HTMLDivElement>(null);
  const [tabsPaused, setTabsPaused] = useState(false);
  const [sessionsPaused, setSessionsPaused] = useState(false);

  const tabLabels = {
    day: 'दिन',
    sessions: 'सत्र',
    review: 'समीक्षा',
    scribe: 'स्क्राइब'
  };

  // Generate sessions for a day (12 sessions only, breaks integrated)
  const generateDaySessions = (dayNumber: number, date: Date): Session[] => {
    const sessions: Session[] = [];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    for (let i = 0; i < 12; i++) {
      // Session (90 minutes) + Break (30 minutes) = 120 minute intervals
      const sessionStart = new Date(dayStart.getTime() + (i * 120 * 60 * 1000));
      const sessionEnd = new Date(sessionStart.getTime() + (90 * 60 * 1000));
      const breakEnd = new Date(sessionEnd.getTime() + (30 * 60 * 1000));
      
      sessions.push({
        id: i,
        type: 'session',
        startTime: sessionStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        endTime: i < 11 ? breakEnd.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : sessionEnd.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        notes: '',
        isActive: false,
        status: 'upcoming'
      });
    }

    return sessions;
  };

  // Update session statuses based on current time
  const updateSessionStatuses = (sessions: Session[], dayDate: string): Session[] => {
    const now = new Date();
    const today = now.toLocaleDateString();
    
    if (dayDate !== today) {
      // Past days: all passed, future days: all upcoming
      const isPastDay = new Date(dayDate) < new Date(today);
      return sessions.map(session => ({
        ...session,
        status: isPastDay ? 'passed' : 'upcoming'
      }));
    }

    // Today: check actual times
    return sessions.map(session => {
      const [startHour, startMin] = session.startTime.split(':').map(Number);
      const [endHour, endMin] = session.endTime.split(':').map(Number);
      
      const sessionStart = new Date();
      sessionStart.setHours(startHour, startMin, 0, 0);
      const sessionEnd = new Date();
      sessionEnd.setHours(endHour, endMin, 0, 0);
      
      let status: 'upcoming' | 'current' | 'passed';
      if (now < sessionStart) {
        status = 'upcoming';
      } else if (now >= sessionStart && now <= sessionEnd) {
        status = 'current';
      } else {
        status = 'passed';
      }
      
      return { ...session, status };
    });
  };

  // Initialize mission data if empty
  useEffect(() => {
    if (missionData.length === 0) {
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const data: DayData[] = [];
        for (let i = 0; i <= daysSinceStart; i++) {
          const dayDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
          const sessions = generateDaySessions(i, dayDate);
          
          data.push({
            dayNumber: i,
            date: dayDate.toLocaleDateString(),
            sessions: sessions
          });
        }
        setMissionData(data);
    }
    
    if (!localStorage.getItem('mission-tracker-startDate')) {
        localStorage.setItem('mission-tracker-startDate', startDate.toISOString());
    }
    
    const interval = setInterval(() => {
      setMissionData(prevData =>
        prevData.map(day => ({
          ...day,
          sessions: updateSessionStatuses(day.sessions, day.date)
        }))
      );
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Persist data on change
  useEffect(() => {
    if(missionData.length > 0) {
        localStorage.setItem('mission-tracker-data', JSON.stringify(missionData));
    }
  }, [missionData]);

  // Listen for auto-fill updates from Scribe
  useEffect(() => {
    const handleAutoFillUpdate = () => {
      // Reload mission data from localStorage when Scribe auto-fills
      try {
        const savedData = localStorage.getItem('mission-tracker-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setMissionData(parsedData);
        }
      } catch (error) {
        console.error('Error reloading mission data:', error);
      }
    };

    window.addEventListener('mission-tracker:update', handleAutoFillUpdate);
    
    return () => {
      window.removeEventListener('mission-tracker:update', handleAutoFillUpdate);
    };
  }, []);

  // Auto-scroll for tracker tabs (horizontal, seamless, pause on hover)
  useEffect(() => {
    const tabBar = tabScrollRef.current;
    if (!tabBar) return;
    let animationId: number;
    const scrollSpeed = 0.12;
    function scrollTabs() {
      if (!tabsPaused && tabBar && tabBar.scrollWidth > tabBar.clientWidth) {
        tabBar.scrollLeft += scrollSpeed;
        if (tabBar.scrollLeft >= tabBar.scrollWidth / 2) {
          tabBar.scrollLeft -= tabBar.scrollWidth / 2;
        }
      }
      animationId = requestAnimationFrame(scrollTabs);
    }
    animationId = requestAnimationFrame(scrollTabs);
    return () => cancelAnimationFrame(animationId);
  }, [tabsPaused]);

  // Auto-scroll for session items (vertical, seamless, pause on hover)
  useEffect(() => {
    const sessionList = sessionScrollRef.current;
    if (!sessionList) return;
    let animationId: number;
    const scrollSpeed = 0.08;
    function scrollSessions() {
      if (!sessionsPaused && sessionList && sessionList.scrollHeight > sessionList.clientHeight) {
        sessionList.scrollTop += scrollSpeed;
        if (sessionList.scrollTop >= sessionList.scrollHeight / 2) {
          sessionList.scrollTop -= sessionList.scrollHeight / 2;
        }
      }
      animationId = requestAnimationFrame(scrollSessions);
    }
    animationId = requestAnimationFrame(scrollSessions);
    return () => cancelAnimationFrame(animationId);
  }, [sessionsPaused, missionData, selectedDay]);

  // Check if current time allows editing
  const canEditSession = (session: Session): boolean => {
    return session.status === 'current';
  };

  const handleSessionClick = (sessionId: number) => {
    const currentDay = missionData.find(d => d.dayNumber === selectedDay);
    const session = currentDay?.sessions.find(s => s.id === sessionId);
    
    if (session && canEditSession(session)) {
      setSelectedSession(sessionId);
      setCurrentNotes(session.notes);
    }
  };

  const saveNotes = () => {
    if (selectedSession === null) return;
    
    setMissionData(prev => prev.map(day => 
      day.dayNumber === selectedDay 
        ? {
            ...day,
            sessions: day.sessions.map(session =>
              session.id === selectedSession
                ? { ...session, notes: currentNotes }
                : session
            )
          }
        : day
    ));
    
    setSelectedSession(null);
    setCurrentNotes('');
  };

  const generateReviewStats = (): string[] => {
    const totalDays = missionData.length;
    const totalSessions = missionData.reduce((acc, day) => 
      acc + day.sessions.filter(s => s.notes.trim()).length, 0
    );
    
    return [
      `MISSION DAYS ACTIVE: ${totalDays}`,
      `SESSIONS COMPLETED: ${totalSessions}`,
      `OPERATIONAL READINESS: ${Math.round((totalSessions / (totalDays * 12)) * 100)}%`,
      `PILOT STATUS: ACTIVE DUTY`,
      `NEXT OBJECTIVE: MAINTAIN TACTICAL SUPERIORITY`
    ];
  };

  // Generate AI content for sessions without entries
  const generateAIContent = (sessionId: number, isBreak: boolean = false): string => {
    if (isBreak) {
      // Determine if it's likely work hours (9 AM - 6 PM) or sleep time
      const breakStart = new Date(`2000-01-01 ${missionData.find(d => d.dayNumber === selectedDay)?.sessions[sessionId]?.endTime}`);
      const breakHour = breakStart.getHours();
      
      if (breakHour >= 22 || breakHour <= 6) {
        // Night time - probably sleeping
        const sleepQuotes = [
          "• Was probably sleeping (no entry detected)",
          "• Likely resting (night hours)",
          "• Probably getting some sleep",
          "• Rest period - no activity logged",
          "• Night time rest cycle",
          "• Sleep recovery phase"
        ];
        return sleepQuotes[sessionId % sleepQuotes.length];
      } else {
        // Day time - probably working
        const workQuotes = [
          "• Probably was working (no entry detected)",
          "• Likely busy with work tasks",
          "• Work session in progress",
          "• Professional duties attended to",
          "• Productive work period",
          "• Focus time - work mode engaged"
        ];
        return workQuotes[sessionId % workQuotes.length];
      }
    } else {
      // For sessions, also check time
      const sessionStart = new Date(`2000-01-01 ${missionData.find(d => d.dayNumber === selectedDay)?.sessions[sessionId]?.startTime}`);
      const sessionHour = sessionStart.getHours();
      
      if (sessionHour >= 22 || sessionHour <= 6) {
        // Night sessions - probably sleeping
        const nightActivities = [
          "• Was probably sleeping (no entry detected)",
          "• Rest and recovery time",
          "• Sleep cycle in progress",
          "• Night time rest period",
          "• Recharging for tomorrow",
          "• Deep sleep phase"
        ];
        return nightActivities[sessionId % nightActivities.length];
      } else {
        // Day sessions - probably working
        const workActivities = [
          "• Probably was working (no entry detected)",
          "• Productive work session completed",
          "• Professional tasks managed",
          "• Work goals pursued",
          "• Project development time",
          "• Creative problem solving",
          "• Task completion focus",
          "• Skill development session",
          "• Meeting objectives",
          "• Process optimization",
          "• Knowledge acquisition",
          "• Strategic planning time"
        ];
        return workActivities[sessionId % workActivities.length];
      }
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'day':
        // Remove session list rendering from here, only render in main return
        return null;
      case 'sessions':
        return (
          <div className="tracker-day-grid">
            {missionData.map(day => (
              <div
                key={day.dayNumber}
                className={`day-card ${selectedDay === day.dayNumber ? 'selected' : ''}`}
                onClick={() => { setSelectedDay(day.dayNumber); setSelectedTab('day'); }}
              >
                {tabLabels.sessions} {day.dayNumber}
              </div>
            ))}
          </div>
        );
      case 'review':
        const stats = generateReviewStats();
        return (
          <div className="tracker-review-content">
            <div className="review-title">{tabLabels.review}</div>
            <div className="review-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-line">{stat}</div>
              ))}
            </div>
          </div>
        );
      case 'scribe':
        return (
          <div>
            <h2>{tabLabels.scribe} (ऑटो-सेशन ट्रैकर)</h2>
            <Scribe />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mission-tracker">
      <div className="tracker-header">
        <div className="tracker-tabs-scroll" ref={tabScrollRef} style={{ overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex' }}>
          {(["day", "sessions", "review", "scribe", "day", "sessions", "review", "scribe"] as const).map((tab, idx) => (
            <button
              key={tab + '-' + idx}
              className={`tracker-tab ${selectedTab === tab ? 'selected' : ''}`}
              onClick={() => setSelectedTab(tab)}
              onMouseEnter={() => setTabsPaused(true)}
              onMouseLeave={() => setTabsPaused(false)}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>
      <div className="tracker-content">
        {/* Only for 'day' tab: auto-scroll session list vertically */}
        {selectedTab === 'day' ? (
          <div className="tracker-session-list-scroll" ref={sessionScrollRef} style={{ overflowY: 'auto', flex: 1, height: '100%' }}>
            {[0, 1].map(loopIdx => (
              <React.Fragment key={loopIdx}>
                {missionData.find(d => d.dayNumber === selectedDay)?.sessions.map(session => (
                  <div
                    key={session.id + '-' + loopIdx}
                    className={`session-item ${session.status} ${selectedSession === session.id ? 'editing' : ''}`}
                    onClick={() => handleSessionClick(session.id)}
                    onMouseEnter={() => setSessionsPaused(true)}
                    onMouseLeave={() => setSessionsPaused(false)}
                  >
                    <div className="session-time">
                      {session.startTime} - {session.endTime}
                    </div>
                    <div className="session-title">
                      SESSION {session.id + 1}
                    </div>
                    <div className="session-notes-preview">
                      {session.notes || generateAIContent(session.id, false)}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        ) : renderContent()}
      </div>
      {selectedSession !== null && (
        <div className="session-editor">
           <div className="editor-header">
             MISSION LOG ENTRY
           </div>
          <textarea
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="• Enter mission notes..."
            className="editor-textarea"
          />
           <div className="editor-actions">
             <button onClick={saveNotes} className="save-btn">SAVE LOG</button>
             <button onClick={() => setSelectedSession(null)} className="cancel-btn">ABORT</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default MissionTracker;