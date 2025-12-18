import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import InceptionTimer from './InceptionTimer';

interface PlayerProfileProps {
  playerName?: string;
}

interface EventItem {
  id: string;
  time: string;
  event: string;
  originalText?: string;
  type: 'success' | 'info' | 'system' | 'welcome' | 'ai' | 'user' | 'personal' | 'work' | 'prediction' | 'milestone' | 'daily' | 'future';
  timestamp: number;
  isEditable?: boolean;
  aiGenerated?: boolean;
  tense?: 'past' | 'present' | 'future';
  relativeTime?: string;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerName = "FTJ" }) => {
  console.log('🎮 PlayerProfile component rendered with height 1200px');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(playerName);
  const [currentPlayerName, setCurrentPlayerName] = useState(playerName);
  // DOB + Age counter
  const [dobISO, setDobISO] = useState<string | null>(null);
  const [isEditingDob, setIsEditingDob] = useState(false);
  const [dobInput, setDobInput] = useState('');
  const [ageText, setAgeText] = useState('');
  
  // Custom date picker state
  const [dobYear, setDobYear] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');

  // Enhanced Events System with LTTL functionality
  const [events, setEvents] = useState<EventItem[]>([
    { id: '1', time: '10:30', event: 'Mission "Data Recovery" completed', type: 'success', timestamp: Date.now() - 3600000 },
    { id: '2', time: '09:45', event: 'New iPhone stream detected', type: 'info', timestamp: Date.now() - 7200000 },
    { id: '3', time: '09:20', event: 'OBS Virtual Camera activated', type: 'system', timestamp: Date.now() - 9000000 },
    { id: '4', time: '08:55', event: 'Daily tracker initialized', type: 'info', timestamp: Date.now() - 10800000 },
    { id: '5', time: '08:30', event: 'Welcome back, Agent FTJ!', type: 'welcome', timestamp: Date.now() - 12600000 }
  ]);
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventText, setNewEventText] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventText, setEditingEventText] = useState('');
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // AI Integration
  const [aiEnabled, setAiEnabled] = useState(true);
  const [lastAiUpdate, setLastAiUpdate] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load saved player name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setCurrentPlayerName(savedName);
      setEditedName(savedName);
    }
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
        if (norm !== savedDob) localStorage.setItem('playerDOB', norm);
      }
    }
  }, []);

  // Compute age every second when dob is set
  useEffect(() => {
    if (!dobISO) return;
    const update = () => {
      const now = new Date();
      // Parse DOB as date-only to avoid timezone drift
      let dob: Date | null = null;
      try {
        const parts = dobISO.split('-').map(Number);
        if (parts.length === 3 && parts.every(n => !Number.isNaN(n))) {
          const [y, m, d] = parts;
          dob = new Date(y, m - 1, d, 0, 0, 0, 0);
        }
      } catch {}
      if (!dob || Number.isNaN(dob.getTime())) return;

      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      let days = now.getDate() - dob.getDate();
      let hours = now.getHours() - dob.getHours();
      let minutes = now.getMinutes() - dob.getMinutes();
      let seconds = now.getSeconds() - dob.getSeconds();

      if (seconds < 0) { seconds += 60; minutes -= 1; }
      if (minutes < 0) { minutes += 60; hours -= 1; }
      if (hours < 0) { hours += 24; days -= 1; }
      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month
        days += prevMonth.getDate();
        months -= 1;
      }
      if (months < 0) { months += 12; years -= 1; }

      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');
      setAgeText(`${years} years ${months} months ${days} days ${hh} hours ${mm} minutes ${ss} seconds`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [dobISO]);

  // Helpers for progress + countdowns
  const getAgeYears = (dobStr: string | null, now: Date): number => {
    if (!dobStr) return 0;
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return 0;
    const diffMs = now.getTime() - dob.getTime();
    const years = diffMs / (365.2425 * 24 * 3600 * 1000); // tropical-year average
    return Math.max(0, years);
  };

  const buildBirthday = (dobStr: string, targetAge: number): Date => {
    const d = new Date(dobStr);
    return new Date(d.getFullYear() + targetAge, d.getMonth(), d.getDate(), 12, 0, 0, 0);
  };

  const timeUntil = (target: Date, from: Date) => {
    let ms = target.getTime() - from.getTime();
    const past = ms <= 0;
    if (past) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    let seconds = totalSeconds % 60;
    let minutes = Math.floor(totalSeconds / 60) % 60;
    let hours = Math.floor(totalSeconds / 3600) % 24;
    const totalDays = Math.floor(totalSeconds / (24 * 3600));
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = (totalDays % 365) % 30;
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      past,
      text: `${years} years ${months} months ${days} days ${pad(hours)} hours ${pad(minutes)} minutes ${pad(seconds)} seconds`
    };
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(currentPlayerName);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      setCurrentPlayerName(editedName.trim());
      // Save to localStorage for persistence
      localStorage.setItem('playerName', editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(currentPlayerName);
  };

  const stats = [
    { label: 'Active Session', value: formatTime(sessionTime), icon: '⏱️' },
    { label: 'Today\'s Focus', value: '2h 15m', icon: '🎯' },
    { label: 'Missions Completed', value: '7/12', icon: '✅' },
    { label: 'Current Streak', value: '5 days', icon: '🔥' },
    { label: 'Level Progress', value: '78%', icon: '📈' },
    { label: 'Energy Level', value: '89%', icon: '⚡' }
  ];

  // Event Management Functions with AI Processing
  const addEvent = async (eventText: string, type: EventItem['type'] = 'user') => {
    if (!eventText.trim()) return;

    try {
      // Process with AI if it's a user event (not system events)
      let processedEvent = eventText;
      let processedType = type;
      let tense: EventItem['tense'] = 'present';
      let relativeTime = 'now';
      let timestamp = new Date();

      if (type === 'user' || type === 'ai') {
        const processed = await processEventWithAI(eventText);
        processedEvent = processed.processedText;
        processedType = processed.type;
        tense = processed.tense;
        relativeTime = processed.relativeTime;
        timestamp = processed.timestamp;
      }

      const timeString = timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const newEvent: EventItem = {
        id: Date.now().toString(),
        time: timeString,
        event: processedEvent,
        originalText: eventText,
        type: processedType,
        timestamp: timestamp.getTime(),
        isEditable: true,
        aiGenerated: type === 'ai',
        tense,
        relativeTime
      };
      
      setEvents(prev => [newEvent, ...prev]);
      setNewEventText('');
      setIsAddingEvent(false);
      
      // Auto-scroll to top
      if (autoScroll && eventsContainerRef.current) {
        eventsContainerRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('Error processing event:', error);
      // Fallback to simple event if AI processing fails
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const newEvent: EventItem = {
        id: Date.now().toString(),
        time: timeString,
        event: eventText,
        type,
        timestamp: now.getTime(),
        isEditable: true,
        aiGenerated: type === 'ai'
      };
      
      setEvents(prev => [newEvent, ...prev]);
      setNewEventText('');
      setIsAddingEvent(false);
    }
  };

  const editEvent = (id: string, newText: string) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, event: newText } : event
    ));
    setEditingEventId(null);
    setEditingEventText('');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const startEditEvent = (event: EventItem) => {
    setEditingEventId(event.id);
    setEditingEventText(event.event);
  };

  // Event type configurations for LTTL
  const eventTypes = {
    personal: { icon: '👤', color: '#4CAF50', label: 'Personal' },
    work: { icon: '💼', color: '#2196F3', label: 'Work' },
    prediction: { icon: '🔮', color: '#9C27B0', label: 'Prediction' },
    milestone: { icon: '🏆', color: '#FF9800', label: 'Milestone' },
    daily: { icon: '📅', color: '#00BCD4', label: 'Daily' },
    future: { icon: '🚀', color: '#E91E63', label: 'Future' },
    success: { icon: '✅', color: '#4CAF50', label: 'Success' },
    info: { icon: 'ℹ️', color: '#2196F3', label: 'Info' },
    system: { icon: '⚙️', color: '#FF9800', label: 'System' },
    welcome: { icon: '👋', color: '#00BCD4', label: 'Welcome' },
    ai: { icon: '🤖', color: '#9C27B0', label: 'AI' },
    user: { icon: '👤', color: '#E91E63', label: 'User' }
  };

  // AI Event Processing for LTTL
  const processEventWithAI = useCallback(async (originalText: string): Promise<{
    processedText: string;
    type: EventItem['type'];
    tense: EventItem['tense'];
    timestamp: Date;
    relativeTime: string;
  }> => {
    // Simulate AI processing with intelligent text analysis
    const text = originalText.toLowerCase();
    
    // Determine event type based on keywords
    let type: EventItem['type'] = 'personal';
    if (text.includes('work') || text.includes('job') || text.includes('meeting') || text.includes('project')) {
      type = 'work';
    } else if (text.includes('will') || text.includes('going to') || text.includes('plan') || text.includes('future')) {
      type = 'future';
    } else if (text.includes('prediction') || text.includes('might') || text.includes('could')) {
      type = 'prediction';
    } else if (text.includes('achieved') || text.includes('completed') || text.includes('won') || text.includes('milestone')) {
      type = 'milestone';
    } else if (text.includes('daily') || text.includes('routine') || text.includes('tracker')) {
      type = 'daily';
    }

    // Determine tense and extract time information
    let tense: EventItem['tense'] = 'present';
    let timestamp = new Date();
    let relativeTime = 'now';

    // Time extraction patterns
    const timePatterns = [
      { pattern: /(\d{1,2}):(\d{2})\s*(am|pm)?/gi, type: 'time' },
      { pattern: /yesterday/i, type: 'relative' },
      { pattern: /tomorrow/i, type: 'relative' },
      { pattern: /last\s+(week|month|year)/i, type: 'relative' },
      { pattern: /next\s+(week|month|year)/i, type: 'relative' },
      { pattern: /(\d+)\s+(days?|weeks?|months?|years?)\s+ago/i, type: 'ago' },
      { pattern: /in\s+(\d+)\s+(days?|weeks?|months?|years?)/i, type: 'future' }
    ];

    // Process time information
    for (const pattern of timePatterns) {
      const match = text.match(pattern.pattern);
      if (match) {
        if (pattern.type === 'relative') {
          if (text.includes('yesterday')) {
            timestamp = new Date(Date.now() - 24 * 60 * 60 * 1000);
            relativeTime = 'yesterday';
            tense = 'past';
          } else if (text.includes('tomorrow')) {
            timestamp = new Date(Date.now() + 24 * 60 * 60 * 1000);
            relativeTime = 'tomorrow';
            tense = 'future';
          } else if (text.includes('last')) {
            tense = 'past';
            relativeTime = 'recently';
          } else if (text.includes('next')) {
            tense = 'future';
            relativeTime = 'soon';
          }
        } else if (pattern.type === 'ago') {
          tense = 'past';
          relativeTime = 'recently';
        } else if (pattern.type === 'future') {
          tense = 'future';
          relativeTime = 'soon';
        }
        break;
      }
    }

    // Determine tense from text content
    if (text.includes('will') || text.includes('going to') || text.includes('plan to') || text.includes('gonna')) {
      tense = 'future';
    } else if (text.includes('was') || text.includes('were') || text.includes('had') || text.includes('did') || 
               text.includes('went') || text.includes('came') || text.includes('met') || text.includes('saw')) {
      tense = 'past';
    }

    // Generate processed text with lore-style narrative
    let processedText = originalText;
    
    // Add narrative wrapper based on tense
    if (tense === 'past') {
      if (!processedText.startsWith('the user') && !processedText.startsWith('user')) {
        processedText = `The user ${processedText}`;
      }
      // Ensure past tense
      processedText = processedText.replace(/\b(am|is|are)\b/gi, 'was');
      processedText = processedText.replace(/\b(go|goes)\b/gi, 'went');
      processedText = processedText.replace(/\b(meet|meets)\b/gi, 'met');
      processedText = processedText.replace(/\b(see|sees)\b/gi, 'saw');
      processedText = processedText.replace(/\b(do|does)\b/gi, 'did');
    } else if (tense === 'future') {
      if (!processedText.startsWith('the user will') && !processedText.startsWith('user will')) {
        processedText = `The user will ${processedText}`;
      }
    } else {
      if (!processedText.startsWith('the user') && !processedText.startsWith('user')) {
        processedText = `The user ${processedText}`;
      }
    }

    // Add time context if not present
    if (!processedText.includes('at') && !processedText.includes('on') && !processedText.includes('in')) {
      if (relativeTime === 'yesterday') {
        processedText += ' yesterday';
      } else if (relativeTime === 'tomorrow') {
        processedText += ' tomorrow';
      } else if (relativeTime === 'recently') {
        processedText += ' recently';
      } else if (relativeTime === 'soon') {
        processedText += ' soon';
      }
    }

    return {
      processedText,
      type,
      tense,
      timestamp,
      relativeTime
    };
  }, []);

  // AI Event Generation
  const generateAIEvent = async () => {
    const aiEvents = [
      'Completed daily meditation session',
      'Will attend team meeting tomorrow',
      'Achieved personal milestone in project',
      'Met with mentor for career guidance',
      'Planning weekend trip to mountains',
      'Started new fitness routine',
      'Will complete certification exam next week',
      'Had breakthrough moment in creative work',
      'Scheduled important client presentation',
      'Will launch new business venture soon',
      '🎯 Focus session completed - Great work maintaining concentration!',
      '📊 Progress milestone reached - You\'re on track for today\'s goals',
      '⚡ Energy levels optimal - Perfect time for intensive tasks',
      '🎮 Break reminder - Time to recharge and refresh',
      '📱 System optimization completed - Performance enhanced'
    ];
    
    const randomEvent = aiEvents[Math.floor(Math.random() * aiEvents.length)];
    await addEvent(randomEvent, 'ai');
  };

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && eventsContainerRef.current) {
      eventsContainerRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  // AI Auto-updates (every 2-5 minutes)
  useEffect(() => {
    if (!aiEnabled) return;
    
    const interval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastAiUpdate;
      const minInterval = 2 * 60 * 1000; // 2 minutes
      const maxInterval = 5 * 60 * 1000; // 5 minutes
      
      if (timeSinceLastUpdate > minInterval && Math.random() < 0.3) {
        generateAIEvent();
        setLastAiUpdate(Date.now());
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [aiEnabled, lastAiUpdate]);

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('playerEvents');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        setEvents(parsed);
      } catch (e) {
        console.error('Failed to load events:', e);
      }
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('playerEvents', JSON.stringify(events));
  }, [events]);

  const personalNotes = [
    "🎯 Focus on completing the iPhone stream integration today",
    "📱 Test both iPhone cameras before the next mission",
    "🎥 OBS setup optimization scheduled for this afternoon",
    "📊 Review yesterday's performance metrics",
    "🔧 System maintenance check due soon"
  ];

  return (
    <>
      <style>{`
        .main-module-panel.player-profile-container {
          height: 1500px !important;
          width: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          position: relative !important;
          z-index: 1000 !important;
          border: 5px solid #00ffff !important;
        }
      `}</style>
      <div 
        key="player-profile-fixed"
        className="main-module-panel player-profile-container" 
        style={{
          background: 'rgba(20, 30, 40, 0.4)',
          backdropFilter: 'blur(3px)',
          border: '1px solid rgba(0, 212, 170, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          height: '1500px',
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1000
        }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(0, 212, 170, 0.3)',
        paddingBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '10px'
        }}>
          <h1 style={{
            color: '#00d4aa',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 10px rgba(0, 212, 170, 0.5)'
          }}>
            🎮 PLAYER: {currentPlayerName}
          </h1>
          {!isEditingName ? (
            <button
              onClick={handleEditName}
              style={{
                background: 'rgba(0, 212, 170, 0.2)',
                border: '1px solid #00d4aa',
                borderRadius: '4px',
                color: '#00d4aa',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 170, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 170, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✏️ EDIT
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid #00d4aa',
                  borderRadius: '4px',
                  color: '#00d4aa',
                  padding: '4px 8px',
                  fontSize: '14px',
                  fontFamily: 'Courier New, monospace',
                  outline: 'none',
                  minWidth: '120px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName();
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleSaveName}
                style={{
                  background: 'rgba(0, 212, 170, 0.2)',
                  border: '1px solid #00d4aa',
                  borderRadius: '4px',
                  color: '#00d4aa',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace'
                }}
              >
                ✅
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '1px solid #ff0000',
                  borderRadius: '4px',
                  color: '#ff0000',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace'
                }}
              >
                ❌
              </button>
            </div>
          )}
        </div>
        {/* Slim Age Counter under Player name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '4px',
          marginBottom: '8px'
        }}>
          {dobISO ? (
            <>
              <span style={{ color: '#9fe', fontSize: '12px' }}>Age: {ageText}</span>
              <span style={{ color: '#6a9', fontSize: '11px' }}>
                {
                  (() => {
                    try {
                      const parts = dobISO.split('-').map(Number);
                      if (parts.length === 3 && parts.every(n => !Number.isNaN(n))) {
                        const [y, m, d] = parts;
                        return `DOB: ${new Date(y, m - 1, d).toLocaleDateString()}`;
                      }
                    } catch {}
                    return `DOB: —`;
                  })()
                }
              </span>
              <button
                onClick={() => { 
                  setIsEditingDob(true); 
                  if (dobISO) {
                    try {
                      const [y, m, d] = dobISO.split('-');
                      setDobYear(y || '');
                      setDobMonth((m || '').toString().padStart(2, '0'));
                      setDobDay((d || '').toString().padStart(2, '0'));
                    } catch {
                      // Fallback for unexpected formats
                      const date = new Date(dobISO);
                      if (!Number.isNaN(date.getTime())) {
                        setDobYear(date.getFullYear().toString());
                        setDobMonth((date.getMonth() + 1).toString().padStart(2, '0'));
                        setDobDay(date.getDate().toString().padStart(2, '0'));
                      }
                    }
                  }
                }}
                style={{ background: 'rgba(0, 212, 170, 0.15)', border: '1px solid #00d4aa', color: '#00d4aa', borderRadius: 4, padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
              >
                Edit DOB
              </button>
            </>
          ) : (
            <>
              <span style={{ color: '#888', fontSize: '12px' }}>Set your Date of Birth to start the age counter.</span>
              <button
                onClick={() => { 
                  setIsEditingDob(true); 
                  setDobYear('');
                  setDobMonth('');
                  setDobDay('');
                }}
                style={{ background: '#00d4aa', color: '#000', border: '1px solid #00d4aa', borderRadius: 4, padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Set DOB
              </button>
            </>
          )}
        </div>
        {isEditingDob && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 6, padding: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: '1px solid rgba(0,212,170,0.3)' }}>
            <div style={{ fontSize: '12px', color: '#00d4aa', marginBottom: 8, fontWeight: 'bold' }}>Enter your date of birth:</div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Year */}
              <select
                value={dobYear}
                onChange={(e) => {
                  console.log('Year changed:', e.target.value);
                  setDobYear(e.target.value);
                }}
                style={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  color: '#00d4aa', 
                  border: '2px solid #00d4aa', 
                  borderRadius: 4, 
                  padding: '6px 8px', 
                  fontSize: '12px',
                  minWidth: '80px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>

              {/* Month */}
              <select
                value={dobMonth}
                onChange={(e) => {
                  console.log('Month changed:', e.target.value);
                  setDobMonth(e.target.value);
                }}
                style={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  color: '#00d4aa', 
                  border: '2px solid #00d4aa', 
                  borderRadius: 4, 
                  padding: '6px 8px', 
                  fontSize: '12px',
                  minWidth: '80px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Month</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return <option key={month} value={month.toString().padStart(2, '0')}>{monthNames[i]}</option>;
                })}
              </select>

              {/* Day */}
              <select
                value={dobDay}
                onChange={(e) => {
                  console.log('Day changed:', e.target.value);
                  setDobDay(e.target.value);
                }}
                style={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  color: '#00d4aa', 
                  border: '2px solid #00d4aa', 
                  borderRadius: 4, 
                  padding: '6px 8px', 
                  fontSize: '12px',
                  minWidth: '60px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  return <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>;
                })}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => {
                  console.log('Save button clicked, year:', dobYear, 'month:', dobMonth, 'day:', dobDay);
                  if (dobYear && dobMonth && dobDay) {
                    const dateOnly = `${dobYear}-${dobMonth}-${dobDay}`; // YYYY-MM-DD
                    const d = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay));
                    console.log('Parsed date (local):', d, 'dateOnly:', dateOnly);

                    if (!Number.isNaN(d.getTime())) {
                      // Check if date is not in the future
                      if (d.getTime() > Date.now()) {
                        alert('Date of birth cannot be in the future!');
                        return;
                      }
                      // Check if date is not too far in the past (reasonable age limit)
                      const maxAge = 150; // 150 years
                      const minDate = new Date();
                      minDate.setFullYear(minDate.getFullYear() - maxAge);
                      if (d.getTime() < minDate.getTime()) {
                        alert('Please enter a valid date of birth (not more than 150 years ago).');
                        return;
                      }
                      // Store date-only string to avoid timezone issues
                      console.log('Saving DOB (date-only):', dateOnly);
                      setDobISO(dateOnly);
                      localStorage.setItem('playerDOB', dateOnly);
                      // Dispatch custom event to notify other components (like AgeCountdownTimer)
                      window.dispatchEvent(new CustomEvent('dobUpdated', { detail: { dob: dateOnly } }));
                      setIsEditingDob(false);
                      setDobYear('');
                      setDobMonth('');
                      setDobDay('');
                    } else {
                      alert('Please enter a valid date.');
                    }
                  } else {
                    alert('Please select year, month, and day.');
                  }
                }}
                disabled={!dobYear || !dobMonth || !dobDay}
                style={{ 
                  background: dobYear && dobMonth && dobDay ? 'rgba(0,255,0,0.4)' : 'rgba(0,0,0,0.3)', 
                  color: dobYear && dobMonth && dobDay ? '#0f0' : '#666', 
                  border: '1px solid ' + (dobYear && dobMonth && dobDay ? '#0f0' : '#666'), 
                  borderRadius: 4, 
                  padding: '8px 16px', 
                  fontSize: '12px', 
                  cursor: dobYear && dobMonth && dobDay ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >Save DOB</button>
              
              <button 
                onClick={() => {
                  setIsEditingDob(false);
                  setDobYear('');
                  setDobMonth('');
                  setDobDay('');
                }} 
                style={{ 
                  background: 'rgba(255,0,0,0.3)', 
                  color: '#f66', 
                  border: '1px solid #f66', 
                  borderRadius: 4, 
                  padding: '8px 16px', 
                  fontSize: '12px', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >Cancel</button>
            </div>
            
            <div style={{ fontSize: '10px', color: '#888', textAlign: 'center', marginTop: 4 }}>
              Select your birth year, month, and day
            </div>
          </div>
        )}

        {/* Age Progress Bar + Decades + Countdowns */}
        {dobISO && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            maxWidth: '880px',
            margin: '0 auto 10px auto'
          }}>
              {/* Progress Panel */}
              <div style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(0,212,170,0.35)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative'
              }}>
                {/* Control Buttons - Left Side of Age Progress Window */}
                <div style={{
                  position: 'absolute',
                  left: -45,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 10
                }}>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))',
                      border: '2px solid #00d4aa',
                      color: '#00d4aa',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Courier New, monospace',
                      boxShadow: '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(0, 212, 170, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.4), rgba(0, 255, 231, 0.5))';
                      e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 170, 0.6), inset 0 0 12px rgba(0, 212, 170, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)';
                    }}
                    onClick={() => {
                      const fileInput = document.querySelector('.video-player-container input[type="file"]') as HTMLInputElement;
                      if (fileInput) fileInput.click();
                    }}
                    title="Add video"
                  >
                    ➕
                  </button>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.25), rgba(255, 140, 140, 0.35))',
                      border: '2px solid #ff6b6b',
                      color: '#ff6b6b',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Courier New, monospace',
                      boxShadow: '0 0 12px rgba(255, 107, 107, 0.4), inset 0 0 8px rgba(255, 107, 107, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(255, 107, 107, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.4), rgba(255, 140, 140, 0.5))';
                      e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.6), inset 0 0 12px rgba(255, 107, 107, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.25), rgba(255, 140, 140, 0.35))';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 107, 107, 0.4), inset 0 0 8px rgba(255, 107, 107, 0.1)';
                    }}
                    onClick={() => {
                      const videoPlayer = document.querySelector('.video-player-container') as HTMLElement;
                      if (videoPlayer) {
                        const removeButton = videoPlayer.querySelector('.minimal-btn.remove') as HTMLButtonElement;
                        if (removeButton) removeButton.click();
                      }
                    }}
                    title="Remove current video"
                  >
                    ➖
                  </button>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))',
                      border: '2px solid #00d4aa',
                      color: '#00d4aa',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Courier New, monospace',
                      boxShadow: '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(0, 212, 170, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.4), rgba(0, 255, 231, 0.5))';
                      e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 170, 0.6), inset 0 0 12px rgba(0, 212, 170, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)';
                    }}
                    onClick={() => {
                      const videoPlayer = document.querySelector('.video-player-container') as HTMLElement;
                      if (videoPlayer) {
                        const prevButton = videoPlayer.querySelector('.minimal-btn.prev') as HTMLButtonElement;
                        if (prevButton) prevButton.click();
                      }
                    }}
                    title="Previous video"
                  >
                    ⬆️
                  </button>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))',
                      border: '2px solid #00d4aa',
                      color: '#00d4aa',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Courier New, monospace',
                      boxShadow: '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(0, 212, 170, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.4), rgba(0, 255, 231, 0.5))';
                      e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 170, 0.6), inset 0 0 12px rgba(0, 212, 170, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)';
                    }}
                    onClick={() => {
                      const videoPlayer = document.querySelector('.video-player-container') as HTMLElement;
                      if (videoPlayer) {
                        const nextButton = videoPlayer.querySelector('.minimal-btn.next') as HTMLButtonElement;
                        if (nextButton) nextButton.click();
                      }
                    }}
                    title="Next video"
                  >
                    ⬇️
                  </button>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))',
                      border: '2px solid #00d4aa',
                      color: '#00d4aa',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Courier New, monospace',
                      boxShadow: '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(0, 212, 170, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.4), rgba(0, 255, 231, 0.5))';
                      e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 170, 0.6), inset 0 0 12px rgba(0, 212, 170, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 170, 0.25), rgba(0, 255, 231, 0.35))';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 212, 170, 0.4), inset 0 0 8px rgba(0, 212, 170, 0.1)';
                    }}
                    onClick={() => {
                      const videoPlayer = document.querySelector('.video-player-container') as HTMLElement;
                      if (videoPlayer) {
                        const playButton = videoPlayer.querySelector('.minimal-btn.play') as HTMLButtonElement;
                        if (playButton && !playButton.disabled) playButton.click();
                      }
                    }}
                    title="Play"
                  >
                    ▶️
                  </button>
                  <button 
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.25), rgba(255, 200, 50, 0.35))',
                      border: '2px solid #ffaa00',
                      color: '#ffaa00',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Courier New, monospace',
                      boxShadow: '0 0 12px rgba(255, 170, 0, 0.4), inset 0 0 8px rgba(255, 170, 0, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(255, 170, 0, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 170, 0, 0.4), rgba(255, 200, 50, 0.5))';
                      e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 170, 0, 0.6), inset 0 0 12px rgba(255, 170, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 170, 0, 0.25), rgba(255, 200, 50, 0.35))';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 170, 0, 0.4), inset 0 0 8px rgba(255, 170, 0, 0.1)';
                    }}
                    onClick={() => {
                      const videoPlayer = document.querySelector('.video-player-container') as HTMLElement;
                      if (videoPlayer) {
                        const pauseButton = videoPlayer.querySelector('.minimal-btn.pause') as HTMLButtonElement;
                        if (pauseButton && !pauseButton.disabled) pauseButton.click();
                      }
                    }}
                    title="Pause"
                  >
                    ⏸️
                  </button>
                </div>

                <div style={{ color: '#9fe', fontSize: 12, marginBottom: 6 }}>Age Progress (0 → 100)</div>
               {(() => {
                 const now = new Date();
                 const yearsFloat = getAgeYears(dobISO, now);
                 const pct = Math.max(0, Math.min(100, (yearsFloat / 100) * 100));
                 const decades = [10,20,30,40,50,60,70,80,90];
                 return (
                   <div style={{ position: 'relative', height: 14, background: 'rgba(0,255,200,0.08)', border: '1px solid rgba(0,212,170,0.4)', borderRadius: 6 }}>
                     <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, rgba(0,212,170,0.4), rgba(0,255,231,0.6))', boxShadow: '0 0 8px rgba(0,255,231,0.6) inset', borderRadius: 6 }} />
                     {decades.map(d => (
                       <div key={d} style={{ position: 'absolute', top: 0, left: `${d}%`, height: '100%', width: 1, background: 'rgba(255,255,255,0.25)' }} />
                     ))}
                   </div>
                 );
               })()}
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6ac', fontSize: 10, marginTop: 6 }}>
                 <span>0</span>
                 {[10,20,30,40,50,60,70,80,90].map(d => <span key={d}>{d}</span>)}
                 <span>100</span>
               </div>
               
               {/* Video Player in the same panel */}
               <div style={{
                 flex: 1,
                 minHeight: '200px',
                 background: 'rgba(0,0,0,0.2)',
                 border: '1px solid rgba(0,212,170,0.2)',
                 borderRadius: 6,
                 position: 'relative',
                 overflow: 'visible'
               }}>
                 <VideoPlayer />
               </div>
             </div>

            {/* Countdown Panel */}
            <div style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(0,212,170,0.35)',
              borderRadius: 8,
              padding: '10px 12px'
            }}>
              <div style={{ color: '#9fe', fontSize: 12, marginBottom: 6 }}>Countdowns</div>
              {(() => {
                const now = new Date();
                const items: Array<{label: string, date: Date}> = [];
                // Next decade target
                const ageYears = Math.floor(getAgeYears(dobISO!, now));
                const nextDecade = Math.ceil((ageYears + 0.0001) / 10) * 10; // avoid zero
                items.push({ label: `Next Decade (${nextDecade})`, date: buildBirthday(dobISO!, nextDecade) });
                // Specific age milestones
                [40,50,60,70].forEach(a => items.push({ label: `Age ${a}`, date: buildBirthday(dobISO!, a) }));
                // Year 2047 (Independence 100)
                const year2047 = new Date(2047, 0, 1, 0,0,0,0);
                items.push({ label: 'Year 2047', date: year2047 });

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {items.map((it, idx) => {
                      const t = timeUntil(it.date, now);
                      return (
                        <div key={idx} style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(0,212,170,0.25)',
                          borderRadius: 6,
                          padding: '6px 8px',
                          fontSize: 11,
                          color: t.past ? '#888' : '#cfe'
                        }}>
                          <div style={{ color: '#00d4aa', marginBottom: 2 }}>{it.label}</div>
                          <div>{t.text}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        <div style={{
          color: '#888',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <span>📅 {currentTime.toLocaleDateString()}</span>
          <span>🕐 {currentTime.toLocaleTimeString()}</span>
          <span>🌐 System Status: ONLINE</span>
        </div>
      </div>

              {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          height: '90vh',
          marginTop: '20px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
                                 {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Inception Timer */}
              <InceptionTimer />
              
              {/* Quick Stats */}
             <div style={{
               background: 'rgba(0, 0, 0, 0.3)',
               borderRadius: '8px',
               padding: '15px',
               border: '1px solid rgba(0, 212, 170, 0.2)'
             }}>
              <h3 style={{ color: '#00d4aa', marginBottom: '15px', fontSize: '16px' }}>
                📊 QUICK STATS
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                {stats.map((stat, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.icon}</div>
                    <div style={{ color: '#00d4aa', fontWeight: 'bold' }}>{stat.value}</div>
                    <div style={{ color: '#888', fontSize: '10px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Notes */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '15px',
              border: '1px solid rgba(0, 212, 170, 0.2)',
              flex: 1
            }}>
              <h3 style={{ color: '#00d4aa', marginBottom: '15px', fontSize: '16px' }}>
                📝 PERSONAL NOTES
              </h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {personalNotes.map((note, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    fontSize: '12px',
                    color: '#ccc',
                    borderLeft: '3px solid rgba(0, 212, 170, 0.5)'
                  }}>
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         {/* Enhanced Recent Events with LTTL */}
             <div style={{
               background: 'rgba(0, 0, 0, 0.3)',
               borderRadius: '8px',
               padding: '15px',
               border: '1px solid rgba(0, 212, 170, 0.2)',
               flex: 1,
               display: 'flex',
               flexDirection: 'column'
             }}>
               <div style={{ 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center', 
                 marginBottom: '15px' 
               }}>
                 <h3 style={{ color: '#00d4aa', fontSize: '16px', margin: 0 }}>
                   📜 LIFE TIMELINE
                 </h3>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <button
                     onClick={() => setIsAddingEvent(!isAddingEvent)}
                     style={{
                       background: 'rgba(0, 212, 170, 0.2)',
                       border: '1px solid #00d4aa',
                       color: '#00d4aa',
                       padding: '4px 8px',
                       borderRadius: '4px',
                       fontSize: '10px',
                       cursor: 'pointer',
                       fontFamily: 'Courier New, monospace'
                     }}
                   >
                     {isAddingEvent ? '✕' : '✚'}
                   </button>
                   <button
                     onClick={generateAIEvent}
                     style={{
                       background: 'rgba(255, 193, 7, 0.2)',
                       border: '1px solid #FFC107',
                       color: '#FFC107',
                       padding: '4px 8px',
                       borderRadius: '4px',
                       fontSize: '10px',
                       cursor: 'pointer',
                       fontFamily: 'Courier New, monospace'
                     }}
                     title="Generate AI Event"
                   >
                     🤖
                   </button>
                   <button
                     onClick={() => setAiEnabled(!aiEnabled)}
                     style={{
                       background: aiEnabled ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                       border: `1px solid ${aiEnabled ? '#FFC107' : '#666'}`,
                       color: aiEnabled ? '#FFC107' : '#666',
                       padding: '4px 8px',
                       borderRadius: '4px',
                       fontSize: '10px',
                       cursor: 'pointer',
                       fontFamily: 'Courier New, monospace'
                     }}
                     title={aiEnabled ? 'AI Updates: ON' : 'AI Updates: OFF'}
                   >
                     ⚡
                   </button>
                   <button
                     onClick={() => setAutoScroll(!autoScroll)}
                     style={{
                       background: autoScroll ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                       border: `1px solid ${autoScroll ? '#2196F3' : '#666'}`,
                       color: autoScroll ? '#2196F3' : '#666',
                       padding: '4px 8px',
                       borderRadius: '4px',
                       fontSize: '10px',
                       cursor: 'pointer',
                       fontFamily: 'Courier New, monospace'
                     }}
                     title={autoScroll ? 'Auto-scroll: ON' : 'Auto-scroll: OFF'}
                   >
                     📜
                   </button>
                 </div>
               </div>

              {/* Add Event Input */}
              {isAddingEvent && (
                <div style={{
                  background: 'rgba(0, 212, 170, 0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  border: '1px solid rgba(0, 212, 170, 0.3)'
                }}>
                                     <input
                     type="text"
                     value={newEventText}
                     onChange={(e) => setNewEventText(e.target.value)}
                     placeholder="Enter your life event (e.g., 'Met with friends yesterday', 'Will attend meeting tomorrow')..."
                     style={{
                       width: '100%',
                       background: 'rgba(0, 0, 0, 0.5)',
                       border: '1px solid #00d4aa',
                       color: '#fff',
                       padding: '6px 8px',
                       borderRadius: '4px',
                       fontSize: '12px',
                       fontFamily: 'Courier New, monospace'
                     }}
                     onKeyPress={(e) => {
                       if (e.key === 'Enter' && newEventText.trim()) {
                         addEvent(newEventText.trim());
                       }
                     }}
                   />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => addEvent(newEventText.trim())}
                      disabled={!newEventText.trim()}
                      style={{
                        background: 'rgba(0, 212, 170, 0.3)',
                        border: '1px solid #00d4aa',
                        color: '#00d4aa',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontFamily: 'Courier New, monospace',
                        opacity: newEventText.trim() ? 1 : 0.5
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => generateAIEvent()}
                      style={{
                        background: 'rgba(255, 193, 7, 0.3)',
                        border: '1px solid #FFC107',
                        color: '#FFC107',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontFamily: 'Courier New, monospace'
                      }}
                    >
                      AI Event
                    </button>
                  </div>
                </div>
              )}

              {/* Events List */}
              <div 
                ref={eventsContainerRef}
                style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  scrollBehavior: 'smooth'
                }}
              >
                                 {events.map((event: EventItem, index: number) => (
                   <div key={event.id} style={{
                     display: 'flex',
                     alignItems: 'center',
                     background: event.aiGenerated ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                     padding: '8px',
                     borderRadius: '6px',
                     marginBottom: '6px',
                     fontSize: '12px',
                     border: event.aiGenerated ? '1px solid rgba(255, 193, 7, 0.3)' : '1px solid transparent',
                     position: 'relative'
                   }}>
                     {/* Event Type Badge */}
                     {event.type && eventTypes[event.type] && (
                       <div style={{
                         position: 'absolute',
                         top: '2px',
                         right: '2px',
                         background: `${eventTypes[event.type].color}20`,
                         border: `1px solid ${eventTypes[event.type].color}60`,
                         borderRadius: '3px',
                         padding: '2px 4px',
                         fontSize: '8px',
                         color: eventTypes[event.type].color,
                         fontFamily: 'Courier New, monospace'
                       }}>
                         {eventTypes[event.type].icon}
                       </div>
                     )}
                     
                     <div style={{
                       width: '8px',
                       height: '8px',
                       borderRadius: '50%',
                       marginRight: '8px',
                       background: event.type === 'success' ? '#4CAF50' :
                                  event.type === 'system' ? '#FF9800' :
                                  event.type === 'welcome' ? '#00d4aa' :
                                  event.type === 'ai' ? '#FFC107' :
                                  event.type === 'user' ? '#2196F3' :
                                  eventTypes[event.type]?.color || '#2196F3'
                     }}></div>
                     <div style={{ color: '#888', minWidth: '40px', fontSize: '10px' }}>{event.time}</div>
                     <div style={{ 
                       color: '#ccc', 
                       marginLeft: '8px', 
                       flex: 1,
                       display: 'flex',
                       alignItems: 'center',
                       gap: '8px'
                     }}>
                       {editingEventId === event.id ? (
                         <input
                           type="text"
                           value={editingEventText}
                           onChange={(e) => setEditingEventText(e.target.value)}
                           style={{
                             background: 'rgba(0, 0, 0, 0.5)',
                             border: '1px solid #00d4aa',
                             color: '#fff',
                             padding: '4px 6px',
                             borderRadius: '3px',
                             fontSize: '11px',
                             fontFamily: 'Courier New, monospace',
                             flex: 1
                           }}
                           onKeyPress={(e) => {
                             if (e.key === 'Enter') {
                               editEvent(event.id, editingEventText);
                             }
                           }}
                           autoFocus
                         />
                       ) : (
                         <span style={{ flex: 1 }}>{event.event}</span>
                       )}
                       {event.aiGenerated && (
                         <span style={{ color: '#FFC107', fontSize: '10px' }}>🤖</span>
                       )}
                       {/* Tense Indicator */}
                       {event.tense && (
                         <span style={{
                           background: event.tense === 'past' ? 'rgba(76, 175, 80, 0.2)' :
                                      event.tense === 'future' ? 'rgba(255, 193, 7, 0.2)' :
                                      'rgba(33, 150, 243, 0.2)',
                           border: `1px solid ${event.tense === 'past' ? '#4CAF50' :
                                          event.tense === 'future' ? '#FFC107' :
                                          '#2196F3'}`,
                           borderRadius: '2px',
                           padding: '1px 3px',
                           fontSize: '8px',
                           color: event.tense === 'past' ? '#4CAF50' :
                                  event.tense === 'future' ? '#FFC107' :
                                  '#2196F3',
                           fontFamily: 'Courier New, monospace'
                         }}>
                           {event.tense.toUpperCase()}
                         </span>
                       )}
                     </div>
                    {event.isEditable && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {editingEventId === event.id ? (
                          <>
                            <button
                              onClick={() => editEvent(event.id, editingEventText)}
                              style={{
                                background: 'rgba(76, 175, 80, 0.3)',
                                border: '1px solid #4CAF50',
                                color: '#4CAF50',
                                padding: '2px 4px',
                                borderRadius: '3px',
                                fontSize: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Courier New, monospace'
                              }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingEventId(null)}
                              style={{
                                background: 'rgba(244, 67, 54, 0.3)',
                                border: '1px solid #F44336',
                                color: '#F44336',
                                padding: '2px 4px',
                                borderRadius: '3px',
                                fontSize: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Courier New, monospace'
                              }}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditEvent(event)}
                              style={{
                                background: 'rgba(33, 150, 243, 0.3)',
                                border: '1px solid #2196F3',
                                color: '#2196F3',
                                padding: '2px 4px',
                                borderRadius: '3px',
                                fontSize: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Courier New, monospace'
                              }}
                              title="Edit"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              style={{
                                background: 'rgba(244, 67, 54, 0.3)',
                                border: '1px solid #F44336',
                                color: '#F44336',
                                padding: '2px 4px',
                                borderRadius: '3px',
                                fontSize: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Courier New, monospace'
                              }}
                              title="Delete"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerProfile; 