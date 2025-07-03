import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Planner.css';

interface Mission {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

const Planner: React.FC = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>(() => {
    const savedMissions = localStorage.getItem('fogghyaMissions');
    return savedMissions ? JSON.parse(savedMissions) : [
      {
        id: 1,
        title: 'Complete Border Analysis',
        description: 'Analyze security vulnerabilities along the northern border',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2025-06-15'
      },
      {
        id: 2,
        title: 'Review Terrain Maps',
        description: 'Check accuracy of terrain data for western sector',
        status: 'pending',
        priority: 'medium',
        dueDate: '2025-06-20'
      }
    ];
  });
  
  const [newMission, setNewMission] = useState<Omit<Mission, 'id'>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });
  
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    localStorage.setItem('fogghyaMissions', JSON.stringify(missions));
  }, [missions]);
  
  const handleAddMission = () => {
    if (!newMission.title) return;
    
    const mission: Mission = {
      id: Date.now(),
      ...newMission
    };
    
    setMissions([...missions, mission]);
    setNewMission({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium'
    });
  };
  
  const handleStatusChange = (id: number, status: Mission['status']) => {
    setMissions(missions.map(mission => 
      mission.id === id ? { ...mission, status } : mission
    ));
  };
  
  const handleDeleteMission = (id: number) => {
    setMissions(missions.filter(mission => mission.id !== id));
  };
  
  const filteredMissions = filter === 'all' 
    ? missions 
    : missions.filter(mission => mission.status === filter);
  
  const goToHomePage = () => {
    navigate('/');
  };
  
  return (
    <div className="planner-container">
      <header className="planner-header">
        <div className="planner-title">Mission Planner</div>
        <div className="planner-controls">
          <button className="home-button" onClick={goToHomePage}>Home Page</button>
          <div className="filter-controls">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={filter === 'in-progress' ? 'active' : ''}
              onClick={() => setFilter('in-progress')}
            >
              In Progress
            </button>
            <button 
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>
      </header>
      
      <div className="planner-content">
        <div className="mission-form">
          <h3>Add New Mission</h3>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={newMission.title}
              onChange={(e) => setNewMission({...newMission, title: e.target.value})}
              placeholder="Mission Title"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={newMission.description}
              onChange={(e) => setNewMission({...newMission, description: e.target.value})}
              placeholder="Mission Details"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mission-priority">Priority</label>
              <select 
                id="mission-priority"
                value={newMission.priority}
                onChange={(e) => setNewMission({
                  ...newMission, 
                  priority: e.target.value as Mission['priority']
                })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                value={newMission.dueDate}
                onChange={(e) => setNewMission({...newMission, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <button className="add-button" onClick={handleAddMission}>
            Add Mission
          </button>
        </div>
        
        <div className="mission-list">
          <h3>Mission List</h3>
          {filteredMissions.length === 0 ? (
            <div className="no-missions">No missions found</div>
          ) : (
            filteredMissions.map(mission => (
              <div key={mission.id} className={`mission-card priority-${mission.priority}`}>
                <div className="mission-header">
                  <h4>{mission.title}</h4>
                  <div className="mission-actions">
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteMission(mission.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="mission-description">{mission.description}</p>
                
                {mission.dueDate && (
                  <div className="mission-due-date">
                    Due: {new Date(mission.dueDate).toLocaleDateString()}
                  </div>
                )}
                
                <div className="mission-status">
                  <label htmlFor={`status-${mission.id}`}>Status:</label>
                  <select 
                    id={`status-${mission.id}`}
                    value={mission.status}
                    onChange={(e) => handleStatusChange(
                      mission.id, 
                      e.target.value as Mission['status']
                    )}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Planner;