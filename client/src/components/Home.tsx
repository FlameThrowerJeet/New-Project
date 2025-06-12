import React, { useState } from 'react';
import './Home.css';
import Services from './Services';
import Images from './Images';
import Videos from './Videos';
import Marketplace from './Marketplace';
import Game from './Game';
import Planner from './Planner';
import Mission from './Mission';
import PhoneStream from './PhoneStream';
import LiveChat from './LiveChat';
import StatusConsole from './StatusConsole';
import RetroClock from './RetroClock';
import ScreenCast from './ScreenCast';
import TwitchBackground from './TwitchBackground';

// Cockpit links and their corresponding modules
const COCKPIT_LINKS = [
  { label: '1. Services', key: 'services' },
  { label: '2. Images', key: 'images' },
  { label: '3. Videos', key: 'videos' },
  { label: '4. Stream', key: 'stream' },
  { label: '5. Social', key: 'social' },
  { label: '6. Game', key: 'game' },
  { label: '7. Marketplace', key: 'marketplace' },
  { label: '8. Stats', key: 'stats' },
  { label: '9. Miina', key: 'miina' },
  { label: '10. Journal', key: 'journal' },
  { label: '11. News', key: 'news' },
  { label: '12. Mission', key: 'mission' },
  { label: '13. Clock', key: 'clock' },
  { label: '14. ScreenCast', key: 'screencast' },
];

const PHONE_WIDTH = 220;
const PHONE_HEIGHT = 600;

const Home: React.FC = () => {
  // Set default to 'services' for cockpit landing
  const [selectedKey, setSelectedKey] = useState('services');
  const [imagesSectionIndex, setImagesSectionIndex] = useState(0);
  const [imagesImageIndex, setImagesImageIndex] = useState(0);

  // Minimal real modules for missing links
  const SocialModule = () => (
    <div className="main-module-panel">
      <div className="main-module-title">
        Social Cockpit
        <div style={{ fontSize: 18, color: '#00fff7aa', marginTop: 16 }}>Connect, share, and collaborate with your squad.</div>
      </div>
    </div>
  );

  const MiinaModule = () => (
    <div className="main-module-panel">
      <div className="main-module-title">
        Miina AI
        <div style={{ fontSize: 18, color: '#00fff7aa', marginTop: 16 }}>Your tactical AI assistant for mission planning.</div>
      </div>
    </div>
  );

  const JournalModule = () => (
    <div className="main-module-panel">
      <div className="main-module-title">
        Mission Journal
        <div style={{ fontSize: 18, color: '#00fff7aa', marginTop: 16 }}>Log your sorties, notes, and mission debriefs.</div>
      </div>
    </div>
  );

  const NewsModule = () => (
    <div className="main-module-panel">
      <div className="main-module-title">
        Ops News
        <div style={{ fontSize: 18, color: '#00fff7aa', marginTop: 16 }}>Latest updates from the tactical network.</div>
      </div>
    </div>
  );

  // Map keys to components
  const COCKPIT_MODULES: Record<string, JSX.Element> = {
    services: <Services />,
    images: <Images
      sectionIndex={imagesSectionIndex}
      setSectionIndex={setImagesSectionIndex}
      imageIndex={imagesImageIndex}
      setImageIndex={setImagesImageIndex}
    />,
    videos: <Videos />,
    stream: <PhoneStream streamUrl="http://192.168.29.21:8989" />,
    social: <SocialModule />,
    game: <Game />,
    marketplace: <Marketplace />,
    stats: <StatusConsole />,
    miina: <MiinaModule />,
    journal: <JournalModule />,
    news: <NewsModule />,
    mission: <Mission />,
    clock: <RetroClock />,
    screencast: <ScreenCast />,
  };

  return (
    <div className="home-root cockpit-grid-layout">
      <TwitchBackground style={{ opacity: 0.45, zIndex: 0 }} />
      <div className="retro-scanline" />
      <div className="obs-overlay" />
      {/* Top Cockpit Links: Full-width, sharp, cockpit-style */}
      <div className="cockpit-top-links">
        {COCKPIT_LINKS.map((link, idx) => (
          <div
            key={link.key}
            className={`cockpit-link-box cockpit-link-box-lg${selectedKey === link.key ? ' selected' : ''}`}
            tabIndex={0}
            onClick={() => setSelectedKey(link.key)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedKey(link.key); }}
          >
            <span className="cockpit-hotkey">{link.label.split('.')[0]}.</span> {link.label.replace(/^[0-9]+\. /, '')}
          </div>
        ))}
      </div>
      {/* Main Content Row: iPhone | Main Viewer | iPhone */}
      <div className="cockpit-grid-main">
        {/* Left iPhone at far left */}
        <div className="phone-mockup cockpit-grid-phone" style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, borderRadius: 0, position: 'relative', gridColumn: 2, gridRow: 1 }}>
          <div className="phone-notch" style={{ borderRadius: 0 }} />
          <div className="phone-screen" style={{ borderRadius: 0 }}>
            <iframe
              src="http://192.168.29.21:8989"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media"
              title="Phone Stream"
              onError={e => { (e.target as HTMLIFrameElement).style.background = '#222'; }}
            />
          </div>
          <div className="phone-home-indicator" style={{ borderRadius: 0 }} />
        </div>
        {/* Neon shadow between left iPhone and main viewer */}
        <div className="cockpit-side-shadow left" />
        {/* Main viewer: fixed size, always centered */}
        <div className="cockpit-main-viewer cockpit-grid-mainviewer" style={{ position: 'relative', justifySelf: 'center', alignSelf: 'center', gridColumn: 3, gridRow: 1 }}>
          {COCKPIT_MODULES[selectedKey]}
          <div className="cockpit-status-bar">
            <span><span className="cockpit-status-light" />STATUS: ONLINE</span>
            <span>MISSION: ACTIVE</span>
            <span><span className="cockpit-warning-light" />TIME: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        {/* Neon shadow between main viewer and right iPhone */}
        <div className="cockpit-side-shadow right" />
        {/* Right iPhone at far right */}
        <div className="phone-mockup cockpit-grid-phone" style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, borderRadius: 0, position: 'relative', gridColumn: 4, gridRow: 1 }}>
          <div className="phone-notch" style={{ borderRadius: 0 }} />
          <div className="phone-screen" style={{ position: 'relative', borderRadius: 0 }}>
            <iframe
              src="http://192.168.29.208:8080"
              style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
              allow="autoplay; encrypted-media"
              title="Phone Stream 2"
            />
            <div style={{ position: 'relative', width: '100%', height: '100%', background: 'rgba(0,10,20,0.7)', zIndex: 2, border: '2px solid #00fff7', boxShadow: '0 0 12px #00fff7, 0 0 4px #0ff inset', borderRadius: 0 }}>
              <LiveChat />
            </div>
          </div>
          <div className="phone-home-indicator" style={{ borderRadius: 0 }} />
        </div>
      </div>
      {/* Bottom Cockpit Links: Full-width, sharp, cockpit-style */}
      <div className="cockpit-bottom-links">
        {COCKPIT_LINKS.map((link, idx) => (
          <div
            key={link.key}
            className={`cockpit-link-box cockpit-link-box-lg${selectedKey === link.key ? ' selected' : ''}`}
            tabIndex={0}
            onClick={() => setSelectedKey(link.key)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedKey(link.key); }}
          >
            <span className="cockpit-hotkey">{link.label.split('.')[0]}.</span> {link.label.replace(/^[0-9]+\. /, '')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
