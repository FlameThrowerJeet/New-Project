import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TwitchBackground from '../components/TwitchBackground';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Fogghya - Home';
  }, []);

  return (
    <div className="home-container">
      {/* Restore the Twitch background */}
      <TwitchBackground channel="your_channel_name" />
      
      <div className="content-overlay">
        <h1 className="site-title">FOGGHYA</h1>
        
        <div className="navigation-grid">
          <Link to="/images" className="nav-item images-link">
            <div className="nav-item-content">
              <h2>Images</h2>
              <p>Explore visual artworks</p>
            </div>
          </Link>
          
          <Link to="/videos" className="nav-item videos-link">
            <div className="nav-item-content">
              <h2>Videos</h2>
              <p>Watch creative content</p>
            </div>
          </Link>
          
          <Link to="/game" className="nav-item game-link">
            <div className="nav-item-content">
              <h2>Game</h2>
              <p>Experience interactive adventures</p>
            </div>
          </Link>
          
          <Link to="/store" className="nav-item store-link">
            <div className="nav-item-content">
              <h2>Store</h2>
              <p>Discover unique merchandise</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;