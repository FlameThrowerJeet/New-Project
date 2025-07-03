import React, { useState, useEffect } from 'react';

interface PlayerProfileProps {
  playerName?: string;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerName = "FTJ" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = [
    { label: 'Active Session', value: formatTime(sessionTime), icon: '⏱️' },
    { label: 'Today\'s Focus', value: '2h 15m', icon: '🎯' },
    { label: 'Missions Completed', value: '7/12', icon: '✅' },
    { label: 'Current Streak', value: '5 days', icon: '🔥' },
    { label: 'Level Progress', value: '78%', icon: '📈' },
    { label: 'Energy Level', value: '89%', icon: '⚡' }
  ];

  const recentEvents = [
    { time: '10:30', event: 'Mission "Data Recovery" completed', type: 'success' },
    { time: '09:45', event: 'New iPhone stream detected', type: 'info' },
    { time: '09:20', event: 'OBS Virtual Camera activated', type: 'system' },
    { time: '08:55', event: 'Daily tracker initialized', type: 'info' },
    { time: '08:30', event: 'Welcome back, Agent FTJ!', type: 'welcome' }
  ];

  const personalNotes = [
    "🎯 Focus on completing the iPhone stream integration today",
    "📱 Test both iPhone cameras before the next mission",
    "🎥 OBS setup optimization scheduled for this afternoon",
    "📊 Review yesterday's performance metrics",
    "🔧 System maintenance check due soon"
  ];

  return (
    <div className="main-module-panel" style={{
      background: 'rgba(20, 30, 40, 0.4)',
      backdropFilter: 'blur(3px)',
      border: '1px solid rgba(0, 212, 170, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      height: '100%',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(0, 212, 170, 0.3)',
        paddingBottom: '20px'
      }}>
        <h1 style={{
          color: '#00d4aa',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          textShadow: '0 0 10px rgba(0, 212, 170, 0.5)'
        }}>
          🎮 PLAYER: {playerName}
        </h1>
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
        height: 'calc(100% - 120px)'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          {/* Welcome Message */}
          <div style={{
            background: 'linear-gradient(45deg, rgba(0, 212, 170, 0.1), rgba(0, 100, 200, 0.1))',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid rgba(0, 212, 170, 0.3)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#00d4aa', fontSize: '18px', marginBottom: '10px' }}>
              🎯 MISSION CONTROL READY
            </h2>
            <p style={{ color: '#ccc', fontSize: '14px', margin: 0 }}>
              Welcome back, Agent {playerName}! All systems are operational and ready for your commands.
              Your dedication to excellence continues to impress the command center.
            </p>
          </div>

          {/* Recent Events */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid rgba(0, 212, 170, 0.2)',
            flex: 1
          }}>
            <h3 style={{ color: '#00d4aa', marginBottom: '15px', fontSize: '16px' }}>
              📋 RECENT EVENTS
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentEvents.map((event, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '8px',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    marginRight: '8px',
                    background: event.type === 'success' ? '#4CAF50' :
                               event.type === 'system' ? '#FF9800' :
                               event.type === 'welcome' ? '#00d4aa' : '#2196F3'
                  }}></div>
                  <div style={{ color: '#888', minWidth: '40px' }}>{event.time}</div>
                  <div style={{ color: '#ccc', marginLeft: '8px' }}>{event.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile; 