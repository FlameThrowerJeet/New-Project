import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Mission.css';
import ScrollableContainer from './common/ScrollableContainer';
import GPSMap from './GPSMap';
import TerrainMap from './TerrainMap';
import RadarDisplay from './RadarDisplay';
import StatusConsole from './StatusConsole';
import PilotStatus from './PilotStatus';

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

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'nofap',
    title: 'NoFap Challenge',
    description: 'Abstaining from pornography and masturbation',
    isCompleted: false,
    category: 'health'
  },
  {
    id: 'water-fasting',
    title: 'Water Fasting',
    description: 'Intermittent or extended water fasting periods',
    isCompleted: false,
    category: 'health'
  },
  {
    id: 'no-social-media',
    title: 'Social Media Detox',
    description: 'Giving up social media platforms',
    isCompleted: false,
    category: 'habits'
  },
  {
    id: 'no-smoking',
    title: 'Quit Smoking',
    description: 'Giving up cigarettes completely',
    isCompleted: false,
    category: 'health'
  },
  {
    id: 'no-junk-food',
    title: 'No Junk Food',
    description: 'Eliminating processed and unhealthy foods',
    isCompleted: false,
    category: 'health'
  },
  {
    id: 'daily-exercise',
    title: 'Daily Exercise',
    description: 'Maintaining consistent physical activity',
    isCompleted: false,
    category: 'health'
  },
  {
    id: 'meditation',
    title: 'Daily Meditation',
    description: 'Practicing mindfulness and meditation',
    isCompleted: false,
    category: 'habits'
  },
  {
    id: 'early-wake',
    title: 'Early Wake Up',
    description: 'Waking up before 6 AM daily',
    isCompleted: false,
    category: 'habits'
  }
];

const Mission: React.FC = () => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('mission-checklist');
    return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST_ITEMS;
  });
  
  const [activeTab, setActiveTab] = useState('ongoing');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'health' | 'habits' | 'goals' | 'custom'>('custom');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for real-time counters
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mission-checklist', JSON.stringify(checklistItems));
  }, [checklistItems]);

  // Calculate time elapsed since completion
  const calculateTimeElapsed = (completedAt: Date | string): TimeCounter => {
    const now = currentTime.getTime();
    const completedDate = completedAt instanceof Date ? completedAt : new Date(completedAt);
    const completed = completedDate.getTime();
    const diffMs = now - completed;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Toggle checklist item start/completion
  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isCompleted: !item.isCompleted,
          completedAt: !item.isCompleted ? new Date() : undefined
        };
      }
      return item;
    }));
  };

  // Add new checklist item
  const addChecklistItem = () => {
    if (!newItemTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      title: newItemTitle.trim(),
      description: newItemDescription.trim() || 'Custom mission objective',
      isCompleted: false,
      category: newItemCategory
    };

    setChecklistItems(prev => [...prev, newItem]);
    setNewItemTitle('');
    setNewItemDescription('');
    setNewItemCategory('custom');
  };

  // Remove checklist item
  const removeChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  // Reset checklist item (mark as incomplete)
  const resetChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isCompleted: false,
          completedAt: undefined
        };
      }
      return item;
    }));
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health': return '#00ff88';
      case 'habits': return '#00d4aa';
      case 'goals': return '#00fff7';
      case 'custom': return '#ffaa00';
      default: return '#00fff7';
    }
  };

  // Format time counter display
  const formatTimeCounter = (counter: TimeCounter) => {
    if (counter.days > 0) {
      return `${counter.days}d ${counter.hours}h ${counter.minutes}m ${counter.seconds}s`;
    } else if (counter.hours > 0) {
      return `${counter.hours}h ${counter.minutes}m ${counter.seconds}s`;
    } else if (counter.minutes > 0) {
      return `${counter.minutes}m ${counter.seconds}s`;
    } else {
      return `${counter.seconds}s`;
    }
  };

  const completedItems = checklistItems.filter(item => item.isCompleted);
  const pendingItems = checklistItems.filter(item => !item.isCompleted);

  return (
    <div className="main-module-panel">
      <div className="mission-container">
      {/* Mission Header */}
      <div className="mission-header">
        <h1 className="mission-title">TACTICAL MISSION CONTROL</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="mission-tabs">
        <button 
          className={`mission-tab ${activeTab === 'ongoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('ongoing')}
        >
          ONGOING MISSIONS
        </button>
        <button 
          className={`mission-tab ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          CHECKLIST
        </button>
      </div>

      {/* Tab Content */}
      <div className="mission-content">
        {activeTab === 'ongoing' && (
          <div className="completed-container">
            <h2 className="section-title">ONGOING MISSIONS</h2>
            {completedItems.length === 0 ? (
              <div className="empty-state">
                <p>No missions started yet. Start your first mission from the checklist!</p>
              </div>
            ) : (
              <div className="completed-grid">
                {completedItems.map(item => {
                  const timeElapsed = item.completedAt ? calculateTimeElapsed(item.completedAt) : null;
                  return (
                    <div key={item.id} className="completed-item">
                      <div className="item-header">
                        <div className="item-category" style={{ color: getCategoryColor(item.category) }}>
                          {item.category.toUpperCase()}
                        </div>
                        <div className="item-actions">
                          <button 
                            className="reset-btn"
                            onClick={() => resetChecklistItem(item.id)}
                            title="Stop Mission"
                          >
                            ⏹
                          </button>
                          <button 
                            className="remove-btn"
                            onClick={() => removeChecklistItem(item.id)}
                            title="Remove Mission"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-description">{item.description}</p>
                      
                      {item.completedAt && (
                        <div className="completion-info">
                          <div className="completion-timestamp">
                            <span className="timestamp-label">STARTED:</span>
                            <span className="timestamp-value">
                              {item.completedAt instanceof Date 
                                ? item.completedAt.toLocaleString() 
                                : new Date(item.completedAt).toLocaleString()}
                            </span>
                          </div>
                          
                          {timeElapsed && (
                            <div className="time-counter">
                              <span className="counter-label">TIME ELAPSED:</span>
                              <span className="counter-value">
                                {formatTimeCounter(timeElapsed)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="checklist-container">
            <h2 className="section-title">MISSION CHECKLIST</h2>
            
            {/* Add Mission Form */}
            <div className="add-item-container" style={{ marginBottom: '30px' }}>
              <div className="add-item-form">
                <h3 style={{ color: '#00fff7', marginBottom: '20px', textAlign: 'center' }}>ADD NEW MISSION</h3>
                <div className="form-group">
                  <label className="form-label">Mission Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Enter mission objective..."
                    maxLength={50}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mission Description</label>
                  <textarea
                    className="form-textarea"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="Describe the mission details..."
                    maxLength={200}
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                  >
                    <option value="health">Health</option>
                    <option value="habits">Habits</option>
                    <option value="goals">Goals</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <button 
                  className="add-btn"
                  onClick={addChecklistItem}
                  disabled={!newItemTitle.trim()}
                >
                  ADD MISSION
                </button>
              </div>
            </div>

            {/* Pending Missions */}
            {pendingItems.length === 0 ? (
              <div className="empty-state">
                <p>All missions started! Add new objectives above to continue.</p>
              </div>
            ) : (
              <div className="checklist-grid">
                {pendingItems.map(item => (
                  <div key={item.id} className="checklist-item">
                    <div className="item-header">
                      <div className="item-category" style={{ color: getCategoryColor(item.category) }}>
                        {item.category.toUpperCase()}
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeChecklistItem(item.id)}
                        title="Remove Mission"
                      >
                        ×
                      </button>
                    </div>
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-description">{item.description}</p>
                    <button 
                      className="complete-btn"
                      onClick={() => toggleChecklistItem(item.id)}
                    >
                      START MISSION
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
                )}

        
      </div>
    </div>
    </div>
  );
};

export default Mission;