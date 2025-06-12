import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Mission.css';
import ScrollableContainer from './common/ScrollableContainer';
import GPSMap from './GPSMap';
import TerrainMap from './TerrainMap';
import RadarDisplay from './RadarDisplay';
import StatusConsole from './StatusConsole';
import PilotStatus from './PilotStatus';

const INITIAL_DATA = {
  mission: {
    vision: "Build a sustainable digital ecosystem under Ratpreet Godara that combines education, entertainment, and technology."
  },
  progress: {
    website: 15,
    streaming: 10,
    content: 5,
    revenue: 2,
    community: 8
  },
  finances: {
    income: {
      streaming: 0,
      teaching: 0,
      powerWashing: 0,
      other: 0
    },
    expenses: {
      hosting: 0,
      equipment: 0,
      marketing: 0,
      other: 0
    },
    savings: 0,
    goal: 5000
  },
  milestones: [
    {
      id: 1,
      title: "Website Infrastructure",
      deadline: "2024-07-10",
      status: "in-progress",
      description: "Complete the basic website infrastructure with all core components",
      tasks: [
        { id: 1, text: "Home page with streaming", completed: true },
        { id: 2, text: "Images component", completed: false },
        { id: 3, text: "Videos component", completed: false },
        { id: 4, text: "Game section", completed: false },
        { id: 5, text: "Marketplace structure", completed: false },
        { id: 6, text: "Mission control center", completed: false }
      ]
    },
    {
      id: 2,
      title: "Streaming Setup",
      deadline: "2024-06-01",
      status: "in-progress",
      description: "Establish professional streaming capabilities and consistent schedule",
      tasks: [
        { id: 1, text: "OBS configuration", completed: true },
        { id: 2, text: "Website integration", completed: true },
        { id: 3, text: "Create branded overlays", completed: false },
        { id: 4, text: "Set up alerts and notifications", completed: false },
        { id: 5, text: "Establish regular schedule", completed: false }
      ]
    }
  ],
  sessions: [
    {
      id: 1,
      date: "2025-04-10",
      startTime: "09:00",
      endTime: "13:15",
      duration: "4h 15m",
      focus: "Website Setup and Streaming Integration",
      accomplishments: "Configured OBS virtual camera and integrated with website. Set up basic infrastructure.",
      challenges: "Encountered issues with ngrok setup and streaming services.",
      nextSteps: "Complete mission tracker and implement image gallery."
    }
  ],
  schedule: {
    daily: [
      { time: "06:00", activity: "Wake up & Morning routine" },
      { time: "07:00", activity: "Planning & Research" },
      { time: "09:00", activity: "Development Session 1" },
      { time: "12:00", activity: "Lunch & Break" },
      { time: "13:00", activity: "Development Session 2" },
      { time: "16:00", activity: "Content Creation" },
      { time: "18:00", activity: "Stream Session" },
      { time: "20:00", activity: "Review & Planning" },
      { time: "22:00", activity: "End of day" }
    ],
    weekly: [
      { day: "Monday", focus: "Website Development" },
      { day: "Tuesday", focus: "Content Creation" },
      { day: "Wednesday", focus: "Teaching Preparation" },
      { day: "Thursday", focus: "Business Development" },
      { day: "Friday", focus: "Streaming & Community" },
      { day: "Saturday", focus: "Planning & Research" },
      { day: "Sunday", focus: "Rest & Review" }
    ]
  }
};

const Mission: React.FC = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    focus: '',
    accomplishments: '',
    challenges: '',
    nextSteps: ''
  });

  // Function to handle task completion toggle
  const toggleTaskCompletion = (milestoneId: number, taskId: number) => {
    setData(prevData => {
      const updatedMilestones = prevData.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedTasks = milestone.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          });
          return { ...milestone, tasks: updatedTasks };
        }
        return milestone;
      });
      return { ...prevData, milestones: updatedMilestones };
    });
  };

  // Function to add new session log
  const addNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate duration
    let duration = '';
    if (newSession.startTime && newSession.endTime) {
      const start = new Date(`2023-01-01T${newSession.startTime}`);
      const end = new Date(`2023-01-01T${newSession.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      duration = `${diffHrs}h ${diffMins}m`;
    }

    const newSessionData = {
      id: data.sessions.length + 1,
      date: newSession.date,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      duration,
      focus: newSession.focus,
      accomplishments: newSession.accomplishments,
      challenges: newSession.challenges,
      nextSteps: newSession.nextSteps
    };

    setData(prevData => ({
      ...prevData,
      sessions: [newSessionData, ...prevData.sessions]
    }));

    // Reset form
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      focus: '',
      accomplishments: '',
      challenges: '',
      nextSteps: ''
    });
  };

  // Handle income/expense changes
  const handleFinanceChange = (category: 'income' | 'expenses', subcategory: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setData(prevData => ({
      ...prevData,
      finances: {
        ...prevData.finances,
        [category]: {
          ...prevData.finances[category],
          [subcategory]: numValue
        }
      }
    }));
  };

  // Calculate totals for finances
  const calculateTotals = () => {
    const totalIncome = Object.values(data.finances.income).reduce((a, b) => a + b, 0) as number;
    const totalExpenses = Object.values(data.finances.expenses).reduce((a, b) => a + b, 0) as number;
    const balance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, balance };
  };

  const { totalIncome, totalExpenses, balance } = calculateTotals();
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 2fr 1.2fr',
      gap: 0,
      height: '100vh',
      width: '100vw',
      background: 'rgba(0,0,0,0.85)',
      boxSizing: 'border-box',
      border: '3px solid #00fff7',
      boxShadow: '0 0 32px #00fff7cc',
      fontFamily: 'Share Tech Mono, JetBrains Mono, Fira Mono, Consolas, monospace',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Left Tactical Panel */}
      <div style={{ borderRight: '2px solid #00fff7', background: 'rgba(0,16,16,0.22)', boxShadow: '0 0 24px #00fff7', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, gap: 24 }}>
        <GPSMap lat={20} lon={77} />
        <TerrainMap lat={20} lon={77} />
        <RadarDisplay />
      </div>
      {/* Center Mission Log/News */}
      <div style={{ background: 'rgba(18,18,18,0.32)', borderRight: '2px solid #00fff7', boxShadow: '0 0 32px #00fff7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 600, background: 'rgba(0,0,0,0.8)', border: '2px solid #00fff7', borderRadius: 10, boxShadow: '0 0 18px #00fff7', padding: 24, margin: '0 auto', minHeight: 320 }}>
          <h2 style={{ color: '#00fff7', fontWeight: 'bold', fontSize: 28, textShadow: '0 0 12px #00fff7', marginBottom: 18, letterSpacing: '0.08em' }}>Mission Log</h2>
          <div style={{ color: '#0f0', fontSize: 18, fontFamily: 'inherit', background: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 6, minHeight: 180, boxShadow: '0 0 8px #00fff7', fontWeight: 'bold', textShadow: '0 0 6px #00fff7' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>2024-06-01: Mission assigned - Operation Nightfall</li>
              <li>2024-06-02: Recon flight completed</li>
              <li>2024-06-03: Debrief and analysis</li>
              <li>2024-06-04: New orders received from Flame Thrower Corp HQ</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Right Status Panel */}
      <div style={{ background: 'rgba(0,16,16,0.22)', boxShadow: '0 0 24px #00fff7', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, gap: 24 }}>
        <PilotStatus region="Coast" regionName="Coastal Patrol" />
        <StatusConsole messages={[
          { id: 1, text: 'Mission system online.', type: 'info', timestamp: new Date() },
          { id: 2, text: 'GPS lock acquired.', type: 'success', timestamp: new Date() },
          { id: 3, text: 'Image feed active.', type: 'info', timestamp: new Date() }
        ]} />
      </div>
    </div>
  );
};

export default Mission;