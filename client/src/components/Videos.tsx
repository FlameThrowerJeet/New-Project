import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Videos.css';
import YouTubePlayer from './YouTubePlayer';
import TwitchBackground from './TwitchBackground';

const MINI_PLAYERS = [
  {
    title: 'Recon Highlights',
    playlist: 'PL3F5B3F76B4FD67CB',
    className: 'mini-player-ipod',
    playerId: 'yt-mini-recon',
    storageKey: 'yt-mini-recon-pos',
  },
  {
    title: 'Mission Debriefs',
    playlist: 'PLFfvSQ83Af6bPiXlD1cVm1rjGfmY5Vn2t',
    className: 'mini-player-cockpit',
    playerId: 'yt-mini-debrief',
    storageKey: 'yt-mini-debrief-pos',
  },
  {
    title: 'Cockpit Footage',
    playlist: 'PLcsv_S6mZzSE_6UuoD_QKkW8f47-lyzky',
    className: 'mini-player-cockpit',
    playerId: 'yt-mini-cockpit',
    storageKey: 'yt-mini-cockpit-pos',
  },
];

const MAIN_PLAYER = {
  title: 'F-16 Main Operations',
  playlist: 'PLer9oF4AanvFoD2t2Aq3aYRYkJs6v9wG8',
  playerId: 'yt-main-f16',
  storageKey: 'yt-main-f16-pos',
};

const Videos: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="videos-cockpit-root" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* OBS/Camera background */}
      <TwitchBackground style={{ zIndex: 0, opacity: 0.55 }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
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
                  <YouTubePlayer
                    playlistId={player.playlist}
                    playerId={player.playerId}
                    storageKey={player.storageKey}
                    width="100%"
                    height="100%"
                    opacity={0.92}
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)', background: 'rgba(30,40,50,0.35)', border: '1.5px solid #b0ffb0', backdropFilter: 'blur(2.5px)' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="main-player-frame cockpit-terminal">
            <div className="main-player-label">{MAIN_PLAYER.title}</div>
            <div className="main-player-inner">
              <YouTubePlayer
                playlistId={MAIN_PLAYER.playlist}
                playerId={MAIN_PLAYER.playerId}
                storageKey={MAIN_PLAYER.storageKey}
                width="100%"
                height="100%"
                opacity={0.96}
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)', background: 'rgba(30,40,50,0.45)', border: '2px solid #b0ffb0', backdropFilter: 'blur(2.5px)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;