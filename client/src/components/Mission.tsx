import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Mission.css';
import ScrollableContainer from './common/ScrollableContainer';

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
    <div className="mission-container">
      <header className="mission-header">
        <h1>RATPREET GODARA</h1>
        <h2>MISSION CONTROL</h2>
        
        <nav className="mission-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            DASHBOARD
          </button>
          <button 
            className={activeTab === 'milestones' ? 'active' : ''} 
            onClick={() => setActiveTab('milestones')}
          >
            MILESTONES
          </button>
          <button 
            className={activeTab === 'sessions' ? 'active' : ''} 
            onClick={() => setActiveTab('sessions')}
          >
            SESSIONS
          </button>
          <button 
            className={activeTab === 'finances' ? 'active' : ''} 
            onClick={() => setActiveTab('finances')}
          >
            FINANCES
          </button>
          <button 
            className={activeTab === 'schedule' ? 'active' : ''} 
            onClick={() => setActiveTab('schedule')}
          >
            SCHEDULE
          </button>
          <Link to="/" className="back-button">RETURN TO MAIN</Link>
        </nav>
      </header>
      
      <main className="mission-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-container">
            <section className="mission-statement">
              <h3>MISSION STATEMENT</h3>
              <p>{data.mission.vision}</p>
            </section>
            
            <div className="dashboard-grid">
              <div className="grid-item">
                <h3>PROGRESS OVERVIEW</h3>
                <div className="progress-bars">
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Website</span>
                      <span>{data.progress.website}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${data.progress.website}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Streaming</span>
                      <span>{data.progress.streaming}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${data.progress.streaming}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Content</span>
                      <span>{data.progress.content}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${data.progress.content}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Revenue</span>
                      <span>{data.progress.revenue}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${data.progress.revenue}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="progress-item">
                    <div className="progress-label">
                      <span>Community</span>
                      <span>{data.progress.community}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${data.progress.community}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid-item">
                <h3>UPCOMING MILESTONES</h3>
                <div className="milestone-list">
                  {data.milestones.slice(0, 2).map(milestone => (
                    <div key={milestone.id} className="upcoming-milestone">
                      <h4>{milestone.title}</h4>
                      <div className="milestone-meta">
                        <span className="due-date">Due: {milestone.deadline}</span>
                        <span className={`status status-${milestone.status}`}>
                          {milestone.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p>{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid-item">
                <h3>RECENT SESSIONS</h3>
                <div className="session-list">
                  {data.sessions.slice(0, 1).map(session => (
                    <div key={session.id} className="session-card">
                      <div className="session-header">
                        <span className="session-date">{session.date}</span>
                        <span className="session-time">{session.duration}</span>
                      </div>
                      <div className="session-focus">{session.focus}</div>
                      <div className="session-accomplishments">
                        <strong>Accomplishments:</strong> {session.accomplishments}
                      </div>
                      <div className="session-challenges">
                        <strong>Challenges:</strong> {session.challenges}
                      </div>
                      <div className="session-next-steps">
                        <strong>Next Steps:</strong> {session.nextSteps}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid-item">
                <h3>FINANCIAL SUMMARY</h3>
                <div className="finance-stats">
                  <div className="stat">
                    <span className="stat-label">Total Income</span>
                    <span className="stat-value positive">${totalIncome}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Expenses</span>
                    <span className="stat-value negative">${totalExpenses}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Balance</span>
                    <span className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                      ${balance}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Funding Goal</span>
                    <span className="stat-value">${data.finances.goal}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, (balance / data.finances.goal) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="grid-item">
                <h3>TODAY'S SCHEDULE</h3>
                <div className="schedule-list">
                  {data.schedule.daily.slice(0, 5).map((item, index) => (
                    <div key={index} className="schedule-item">
                      <span className="schedule-time">{item.time}</span>
                      <span>{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid-item">
                <h3>QUICK ACTIONS</h3>
                <div className="action-buttons">
                  <button className="action-button" onClick={() => setActiveTab('sessions')}>
                    LOG NEW SESSION
                  </button>
                  <button className="action-button" onClick={() => setActiveTab('milestones')}>
                    UPDATE MILESTONES
                  </button>
                  <button className="action-button" onClick={() => setActiveTab('finances')}>
                    UPDATE FINANCES
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'milestones' && (
          <div className="milestones-container">
            <h3>PROJECT MILESTONES</h3>
            <ScrollableContainer maxHeight="calc(100vh - 200px)">
              <div className="milestones-timeline"> q
                {data.milestones.map(milestone => (
                  <div key={milestone.id} className={`milestone-card status-${milestone.status}`}>
                    <div className="milestone-header">
                      <h4>{milestone.title}</h4>
                      <div className="milestone-meta">
                        <span className="due-date">Due: {milestone.deadline}</span>
                        <span className={`status status-${milestone.status}`}>
                          {milestone.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p>{milestone.description}</p>
                    
                    <div className="task-list">
                      <h5>Tasks</h5>
                      {milestone.tasks.map(task => (
                        <div key={task.id} className="task-item">
                          <label className="checkbox">
                            <input 
                              type="checkbox" 
                              checked={task.completed} 
                              onChange={() => toggleTaskCompletion(milestone.id, task.id)}
                            />
                            <span className="checkbox-custom"></span>
                            <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                              {task.text}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollableContainer>
          </div>
        )}
        
        {activeTab === 'sessions' && (
          <div className="sessions-container">
            <div className="sessions-grid">
              <div className="new-session-form">
                <h3>LOG NEW SESSION</h3>
                <form onSubmit={addNewSession}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="session-date">Date</label>
                      <input 
                        id="session-date"
                        type="date" 
                        value={newSession.date}
                        onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="session-start">Start Time</label>
                      <input 
                        id="session-start"
                        type="time" 
                        value={newSession.startTime}
                        onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="session-end">End Time</label>
                      <input 
                        id="session-end"
                        type="time" 
                        value={newSession.endTime}
                        onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="session-focus">Session Focus</label>
                    <input 
                      id="session-focus"
                      type="text" 
                      value={newSession.focus}
                      onChange={(e) => setNewSession({...newSession, focus: e.target.value})}
                      placeholder="Main focus of this session"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="session-accomplishments">Accomplishments</label>
                    <textarea 
                      id="session-accomplishments"
                      value={newSession.accomplishments}
                      onChange={(e) => setNewSession({...newSession, accomplishments: e.target.value})}
                      placeholder="What did you accomplish?"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="session-challenges">Challenges</label>
                    <textarea 
                      id="session-challenges"
                      value={newSession.challenges}
                      onChange={(e) => setNewSession({...newSession, challenges: e.target.value})}
                      placeholder="What challenges did you face?"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="session-next">Next Steps</label>
                    <textarea 
                      id="session-next"
                      value={newSession.nextSteps}
                      onChange={(e) => setNewSession({...newSession, nextSteps: e.target.value})}
                      placeholder="What are the next steps?"
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="submit-button">LOG SESSION</button>
                </form>
              </div>
              
              <div className="session-history">
                <h3>SESSION HISTORY</h3>
                <ScrollableContainer maxHeight="600px">
                  <div className="session-list">
                    {data.sessions.map(session => (
                      <div key={session.id} className="session-card">
                        <div className="session-header">
                          <span className="session-date">{session.date}</span>
                          <span className="session-time">{session.duration}</span>
                        </div>
                        <div className="session-focus">{session.focus}</div>
                        <div className="session-accomplishments">
                          <strong>Accomplishments:</strong> {session.accomplishments}
                        </div>
                        {session.challenges && (
                          <div className="session-challenges">
                            <strong>Challenges:</strong> {session.challenges}
                          </div>
                        )}
                        {session.nextSteps && (
                          <div className="session-next-steps">
                            <strong>Next Steps:</strong> {session.nextSteps}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollableContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'finances' && (
          <div className="finances-container">
            <div className="finances-grid">
              <div className="finance-section">
                <h3>INCOME TRACKING</h3>
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Streaming</td>
                      <td>
                        <input 
                          type="number"
                          aria-label="Streaming Income"
                          value={data.finances.income.streaming}
                          onChange={(e) => handleFinanceChange('income', 'streaming', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Teaching</td>
                      <td>
                        <input 
                          type="number"
                          aria-label="Teaching Income"
                          value={data.finances.income.teaching}
                          onChange={(e) => handleFinanceChange('income', 'teaching', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Power Washing</td>
                      <td>
                        <input 
                          type="number"
                          aria-label="Power Washing Income"
                          value={data.finances.income.powerWashing}
                          onChange={(e) => handleFinanceChange('income', 'powerWashing', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Other</td>
                      <td>
                        <input 
                          type="number"
                          aria-label="Other Income"
                          value={data.finances.income.other}
                          onChange={(e) => handleFinanceChange('income', 'other', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr className="total-row">
                      <td><strong>Total Income</strong></td>
                      <td><strong>${totalIncome}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="finance-section">
                <h3>EXPENSE TRACKING</h3>
                <ScrollableContainer maxHeight="400px">
                  <table className="finance-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Hosting</td>
                        <td>
                          <input 
                            type="number"
                            aria-label="Hosting Expense"
                            value={data.finances.expenses.hosting}
                            onChange={(e) => handleFinanceChange('expenses', 'hosting', e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Equipment</td>
                        <td>
                          <input 
                            type="number"
                            aria-label="Equipment Expense"
                            value={data.finances.expenses.equipment}
                            onChange={(e) => handleFinanceChange('expenses', 'equipment', e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Marketing</td>
                        <td>
                          <input 
                            type="number"
                            aria-label="Marketing Expense"
                            value={data.finances.expenses.marketing}
                            onChange={(e) => handleFinanceChange('expenses', 'marketing', e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Other</td>
                        <td>
                          <input 
                            type="number"
                            aria-label="Other Expense"
                            value={data.finances.expenses.other}
                            onChange={(e) => handleFinanceChange('expenses', 'other', e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr className="total-row">
                        <td><strong>Total Expenses</strong></td>
                        <td><strong>${totalExpenses}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </ScrollableContainer>
              </div>
              
              <div className="finance-section">
                <h3>SAVINGS PROGRESS</h3>
                <div className="savings-grid">
                  <div className="savings-item">
                    <span className="savings-label">Current Balance</span>
                    <span className={`savings-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                      ${balance}
                    </span>
                  </div>
                  <div className="savings-item">
                    <span className="savings-label">Funding Goal</span>
                    <div className="savings-input">
                      <span className="currency">$</span>
                      <input 
                        type="number"
                        aria-label="Funding Goal"
                        value={data.finances.goal}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setData({...data, finances: {...data.finances, goal: value}});
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div style={{marginTop: '20px'}}>
                  <h4 style={{marginBottom: '10px'}}>Progress to Goal</h4>
                  <div className="finance-progress-bar">
                    <div 
                      className="finance-progress-fill" 
                      style={{ width: `${Math.min(100, Math.max(0, (balance / data.finances.goal) * 100))}%` }}
                    ></div>
                    <span className="finance-progress-text">
                      {Math.min(100, Math.max(0, Math.round((balance / data.finances.goal) * 100)))}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <div className="schedule-container">
            <div className="schedule-grid">
              <div className="daily-schedule">
                <h3>DAILY SCHEDULE</h3>
                <div className="daily-schedule-list">
                  {data.schedule.daily.map((item, index) => (
                    <div key={index} className="schedule-item">
                      <span className="schedule-time">{item.time}</span>
                      <span>{item.activity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="schedule-notes">
                  <h4>Session Structure</h4>
                  <p>Each work session follows the Ratpreet Method:</p>
                  <ol>
                    <li>Review goals for the session</li>
                    <li>Set up environment and tools</li>
                    <li>Work in 45-minute focused blocks</li>
                    <li>Take 15-minute breaks between blocks</li>
                    <li>Document progress and challenges</li>
                    <li>Plan next session</li>
                  </ol>
                </div>
              </div>
              
              <div className="weekly-schedule">
                <h3>WEEKLY FOCUS</h3>
                <div className="weekly-schedule-grid">
                  {data.schedule.weekly.map((item, index) => (
                    <div key={index} className="day-focus">
                      <div className="day-header">{item.day}</div>
                      <div className="day-content">{item.focus}</div>
                    </div>
                  ))}
                </div>
                
                <div className="schedule-notes">
                  <h4>Weekly Principles</h4>
                  <ul>
                    <li>Each day has a primary focus area</li>
                    <li>Morning is for high-cognitive tasks</li>
                    <li>Afternoon is for creative work</li>
                    <li>Evening is for community and planning</li>
                    <li>Document everything at the end of each day</li>
                  </ul>
                </div>
              </div>
              
              <div className="streaming-schedule">
                <h3>STREAMING SCHEDULE</h3>
                <div className="stream-schedule-list">
                  <div className="stream-day">
                    <span className="stream-day-name">Monday</span>
                    <span className="stream-time">19:00 - 21:00</span>
                    <span className="stream-topic">Web Development</span>
                  </div>
                  <div className="stream-day">
                    <span className="stream-day-name">Wednesday</span>
                    <span className="stream-time">19:00 - 21:00</span>
                    <span className="stream-topic">Educational Content</span>
                  </div>
                  <div className="stream-day">
                    <span className="stream-day-name">Friday</span>
                    <span className="stream-time">19:00 - 22:00</span>
                    <span className="stream-topic">Project Showcase & Community</span>
                  </div>
                </div>
                
                <div className="schedule-notes">
                  <h4>Stream Format</h4>
                  <p>Each stream follows a consistent format:</p>
                  <ul>
                    <li>First 15 min: Introduction and goals</li>
                    <li>Middle: Main content/activities</li>
                    <li>Last 15 min: Summary and preview next stream</li>
                    <li>Content is recorded for later publishing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mission-footer">
        <p>RATPREET GODARA - MISSION CONTROL SYSTEM</p>
        <p>Operating Session: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
};

export default Mission;