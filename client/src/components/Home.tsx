import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TwitchBackground from './TwitchBackground';
import './Home.css';
import PhoneStream from './PhoneStream';
import LiveChat from './LiveChat';

const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'Fogghya - Home';
  }, []);

  return (
    <div className="home-root">
      <TwitchBackground style={{ opacity: 0.7, zIndex: 0 }} />
      <div className="main-content-row">
        <div className="main-col phone-stream-col">
          <PhoneStream />
        </div>
        <div className="main-col center-col">
          <div className="main-links">
            <Link to="/images" className="nav-link">
              <span className="icon">📸</span>
              <span className="text">Images</span>
              <span className="description">F-16 Mission Reconnaissance</span>
            </Link>
            <Link to="/videos" className="nav-link">
              <span className="icon">🎥</span>
              <span className="text">Videos</span>
              <span className="description">Mission Footage & Analysis</span>
            </Link>
            <Link to="/game" className="nav-link">
              <span className="icon">🎮</span>
              <span className="text">Game</span>
              <span className="description">F-16 Combat Simulator</span>
            </Link>
            <Link to="/routine-tracker" className="nav-link">
              <span className="icon">📊</span>
              <span className="text">Routine Tracker</span>
              <span className="description">Mission Planning & Tracking</span>
            </Link>
          </div>
        </div>
        <div className="main-col live-chat-col">
          <LiveChat />
        </div>
      </div>
    </div>
  );
};

export default Home;