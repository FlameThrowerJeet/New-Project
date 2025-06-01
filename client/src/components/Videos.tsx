import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Videos.css';

const MINI_PLAYERS = [
  {
    title: 'Recon Highlights',
    playlist: 'PLyBAqOWU1mfUGnBl8IMAcutxMeeHw1--p',
    className: 'mini-player-ipod',
  },
  {
    title: 'Mission Debriefs',
    playlist: 'PLv8GEgZdIB2fubCgAtXl50mkUfGjAFfpq',
    className: 'mini-player-cockpit',
  },
  {
    title: 'Cockpit Footage',
    playlist: 'PLd7-bHaQwnthaNDpZ32TtYONGVk95-fhF',
    className: 'mini-player-cockpit',
  },
];

const MAIN_PLAYER = {
  title: 'F-16 Main Operations',
  playlist: 'PLlWFkXdbRXvIkzohqXzjGULVhfQCA__Xc',
};

const getPlaylistEmbedUrl = (playlistId: string) =>
  `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=1&loop=1&playlist=${playlistId}`;

const Videos: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="videos-cockpit-root">
      <header className="videos-header">
        <div className="videos-title">F-16 Mission Videos</div>
        <div className="videos-controls">
          <button className="home-button" onClick={() => navigate('/')}>Home Page</button>
        </div>
      </header>
      <div className="videos-cockpit-layout">
        <div className="mini-players-col">
          {MINI_PLAYERS.map((player, idx) => (
            <div className={`mini-player-frame ${player.className}`} key={player.playlist}>
              <div className="mini-player-label">{player.title}</div>
              <div className="mini-player-inner">
                <iframe
                  className="mini-player-iframe"
                  src={getPlaylistEmbedUrl(player.playlist)}
                  title={player.title}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
        <div className="main-player-frame cockpit-terminal">
          <div className="main-player-label">{MAIN_PLAYER.title}</div>
          <div className="main-player-inner">
            <iframe
              className="main-player-iframe"
              src={getPlaylistEmbedUrl(MAIN_PLAYER.playlist)}
              title={MAIN_PLAYER.title}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;