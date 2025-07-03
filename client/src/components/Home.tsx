import React, { useState, useRef, useEffect, Suspense } from 'react';
import './Home.css';
import Services from './Services';
import Images from './Images';
import Videos from './Videos';
import Marketplace from './Marketplace';
import Game from './Game';
import Planner from './Planner';
import Mission from './Mission';
import StatusConsole from './StatusConsole';
import RetroClock from './RetroClock';

import MissionTracker from './MissionTracker';
import VerticalSlideshow from './VerticalSlideshow';
import HorizontalSlideshow from './HorizontalSlideshow';
import Stream from './Stream';
import MiinaAI from './MiinaAI';
import FileStorage from './FileStorage';
import Maps from './Maps';
import AnimeWorld from './AnimeWorld';
import FaceSwap from './FaceSwap';
import Social from './Social';
import OBSBackground from './OBSBackground';
import PhoneStream from './PhoneStream';
import LiveWallpaper from './LiveWallpaper';
import AdvancedLever from './AdvancedLever';
import DemoPhoneContent from './DemoPhoneContent';
import SmartPhoneDisplay from './SmartPhoneDisplay';
import PlayerProfile from './PlayerProfile';

interface UserData {
  firstName: string;
  aadharNumber: string;
  fullName: string;
}

interface HomeProps {
  userData: UserData | null;
}

// Define the CockpitKey type - Added 'player' as the first option
type CockpitKey = 'player' | 'services' | 'images' | 'videos' | 'stream' | 'social' | 'game' | 'marketplace' | 'stats' | 'miina' | 'news' | 'mission' | 'files' | 'maps' | 'animeworld' | 'ai-generator';

// Updated COCKPIT_LINKS with Player as the first item
const COCKPIT_LINKS = [
  { en: 'Player: FTJ', hi: 'खिलाड़ी: FTJ', key: 'player' as CockpitKey },
  { en: 'Services', hi: 'सेवाएं', key: 'services' as CockpitKey },
  { en: 'Images', hi: 'चित्र', key: 'images' as CockpitKey },
  { en: 'Videos', hi: 'वीडियो', key: 'videos' as CockpitKey },
  { en: 'Stream', hi: 'स्ट्रीम', key: 'stream' as CockpitKey },
  { en: 'Social', hi: 'सामाजिक', key: 'social' as CockpitKey },
  { en: 'Game', hi: 'खेल', key: 'game' as CockpitKey },
  { en: 'Marketplace', hi: 'बाजार', key: 'marketplace' as CockpitKey },
  { en: 'Stats', hi: 'आंकड़े', key: 'stats' as CockpitKey },
  { en: 'Miina', hi: 'मीना', key: 'miina' as CockpitKey },
  { en: 'News', hi: 'समाचार', key: 'news' as CockpitKey },
  { en: 'Mission', hi: 'मिशन', key: 'mission' as CockpitKey },
  { en: 'Files', hi: 'फाइलें', key: 'files' as CockpitKey },
  { en: 'Maps', hi: 'मानचित्र', key: 'maps' as CockpitKey },
  { en: 'AnimeWorld', hi: 'ऐनिमे वर्ल्ड', key: 'animeworld' as CockpitKey },
  { en: 'Face Swap', hi: 'चेहरा बदलें', key: 'ai-generator' as CockpitKey },
];

const PHONE_WIDTH = 250;
const PHONE_HEIGHT = 600;

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const Home: React.FC<HomeProps> = ({ userData }) => {
  const [selectedKey, setSelectedKey] = useState<CockpitKey>('player'); // Changed default to 'player'
  const [isContentHidden, setIsContentHidden] = useState(false); // false = show streams, true = show wallpapers
  const [scale, setScale] = useState(1);
  const [imagesSectionIndex, setImagesSectionIndex] = useState(0);
  const [imagesImageIndex, setImagesImageIndex] = useState(0);
  const topLinksRef = useRef<HTMLDivElement>(null);
  const bottomLinksRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState(true);
  const cockpitGridRef = useRef<HTMLDivElement>(null);
  const [leftStreamVisible, setLeftStreamVisible] = useState(false); // delay for left iPhone

  const SocialModule = () => (
    <Social />
  );

  const MiinaModule = () => (
    <MiinaAI />
  );

  const NewsModule = () => (
    <div className="main-module-panel semi-transparent-bg">
      <div className="main-module-title">
        Ops News (ऑप्स समाचार)
        <div style={{ fontSize: 18, color: '#00d4aaaa', marginTop: 16 }}>Latest updates from the strategic network. (रणनीतिक नेटवर्क से नवीनतम अपडेट।)</div>
      </div>
    </div>
  );

  // Updated COCKPIT_MODULES with PlayerProfile as the first module
  const COCKPIT_MODULES: Record<CockpitKey, JSX.Element> = {
    player: <PlayerProfile playerName="FTJ" />,
    services: (
      <Suspense fallback={null}>
        <Services />
      </Suspense>
    ),
    images: <Images
      sectionIndex={imagesSectionIndex}
      setSectionIndex={setImagesSectionIndex}
      imageIndex={imagesImageIndex}
      setImageIndex={setImagesImageIndex}
    />,
    videos: <Videos />,
    stream: <Stream />,
    social: <SocialModule />,
    game: <Game />,
    marketplace: <Marketplace />,
    stats: <StatusConsole />,
    miina: <MiinaModule />,
    news: <NewsModule />,
    mission: <Mission />,
    files: <FileStorage />,
    maps: <Maps />,
    animeworld: <AnimeWorld />,
    'ai-generator': <FaceSwap />,
  };

  // Seamless, smooth nav bar autoscroll
  useEffect(() => {
    const topBar = topLinksRef.current;
    const bottomBar = bottomLinksRef.current;
    if (!topBar || !bottomBar) return;
    let animationId: number;
    const scrollSpeed = 0.3; // slower for barely noticeable
    function scrollNavBars() {
      [topBar, bottomBar].forEach(bar => {
        if (bar && bar.scrollWidth > bar.clientWidth) {
          bar.scrollLeft += scrollSpeed;
          // Seamless loop: when scrollLeft passes half, reset back by half
          if (bar.scrollLeft >= bar.scrollWidth / 2) {
            bar.scrollLeft -= bar.scrollWidth / 2;
          }
        }
      });
      animationId = requestAnimationFrame(scrollNavBars);
    }
    animationId = requestAnimationFrame(scrollNavBars);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Zoom-to-fit logic
  useEffect(() => {
    function updateScale() {
      const scaleW = window.innerWidth / DESIGN_WIDTH;
      const scaleH = window.innerHeight / DESIGN_HEIGHT;
      setScale(Math.min(scaleW, scaleH));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', updateScale);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLeftStreamVisible(true), 30000); // 30-second lag
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <OBSBackground />
      <div className="home-root" style={{ 
        minHeight: '100vh', 
        height: '100vh', 
        minWidth: '100vw', 
        background: 'rgba(10,20,30,0.3)', // More transparent
        display: 'flex', 
        flexDirection: 'column',
        backdropFilter: 'blur(1px)' // Subtle blur for readability
      }}>
        {/* Top Cockpit Links */}
        <div 
          className="cockpit-top-links semi-transparent-bg"
          ref={topLinksRef}
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 100, 
            overflowX: 'auto', 
            whiteSpace: 'nowrap',
            background: 'rgba(0, 0, 0, 0.4)', // Semi-transparent nav
            backdropFilter: 'blur(3px)'
          }}
        >
          {/* Duplicate links for seamless scroll */}
          {[...COCKPIT_LINKS, ...COCKPIT_LINKS].map((link, idx) => (
            <div
              key={link.key + '-' + idx}
              className={`cockpit-link-box cockpit-link-box-lg${selectedKey === link.key ? ' selected' : ''}`}
              tabIndex={0}
              onClick={() => setSelectedKey(link.key)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedKey(link.key); }}
              style={{
                background: selectedKey === link.key ? 'rgba(0, 212, 170, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)'
              }}
            >
              <span className="nav-label-en">{link.en}</span>
            </div>
          ))}
        </div>

        {/* Main Cockpit Grid and Preview - explicit rows so they never overlap */}
        <div style={{ 
          flex: 1, 
          minWidth: 0, 
          minHeight: 0, 
          height: '100%', 
          width: '100vw', 
          maxWidth: '100vw', 
          display: 'grid', 
          gridTemplateRows: 'calc(100% - 260px) 260px', 
          overflow: 'hidden', 
          position: 'relative', 
          zIndex: 1, 
          background: 'rgba(10,20,30,0.2)' // More transparent
        }}>
          {/* Row 1: Phones, viewer, tracker */}
          <div ref={cockpitGridRef} style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 20px 2.7fr 20px 1.2fr 1.2fr', 
            gridTemplateRows: '1fr', 
            gap: 0, 
            alignItems: 'center', 
            justifyItems: 'center', 
            width: '100%', 
            margin: 0, 
            minWidth: 0, 
            height: '100%', 
            background: 'rgba(10,20,30,0.2)' // More transparent
          }}>
            {/* Left iPhone */}
            <div className="cockpit-grid-phone" style={{ 
              gridColumn: 1, 
              alignSelf: 'center', 
              width: '100%', 
              minWidth: 220, 
              maxWidth: 420, 
              background: 'rgba(10,20,30,0.3)', // Semi transparent
              flex: 1, 
              minHeight: 0, 
              height: '100%',
              backdropFilter: 'blur(2px)'
            }}>
              <div className="iphone-shape">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  {!isContentHidden ? (
                    leftStreamVisible ? (
                      <SmartPhoneDisplay 
                        url="http://192.168.29.21:8989/"
                        label="LEFT IPHONE"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '16px'
                        }}
                      />
                    ) : (
                      <DemoPhoneContent label="LEFT IPHONE (DELAYING 30s)" style={{ width: '100%', height: '100%' }} />
                    )
                  ) : (
                    <LiveWallpaper isLandscape={false} wallpaperIndex={0} />
                  )}
                </div>
                <div className="phone-home-indicator" />
              </div>
            </div>
            {/* Left Vertical Bar */}
            <div style={{ gridColumn: 2, width: '100%', height: '100%', background: 'rgba(0,212,170,0.18)', boxShadow: '0 0 12px 2px #00d4aa55', borderRadius: 6, zIndex: 2, pointerEvents: 'none', backdropFilter: 'blur(2px)', minHeight: 0 }} />
            {/* Main Viewer */}
            <div className="cockpit-main-viewer cockpit-grid-mainviewer" style={{ gridColumn: 3, alignSelf: 'center', width: '100%', minWidth: 600, maxWidth: '100%', background: 'rgba(10,20,30,0.5)', flex: 1, minHeight: 0, height: '100%' }}>
              <div className="cockpit-status-bar" style={{ top: 0, bottom: 'auto', position: 'absolute' }}>
                <div className="status-label"><span>Status: Online</span></div>
                <div className="status-label"><span>Mission: Active</span></div>
                <div className="status-label"><span>Time: {new Date().toLocaleTimeString()}</span></div>
                {userData && (
                  <div className="status-label" style={{ color: '#00d4aa', fontWeight: 'bold' }}>
                    <span>User: {userData.fullName}</span>
                  </div>
                )}
              </div>
              {/* Show Miina Live Wallpaper in preview when lever is pressed */}
              {isContentHidden && selectedKey === 'images' ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <LiveWallpaper isLandscape={true} wallpaperIndex={2} />
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'rgba(0,0,0,0.8)',
                    color: '#00d4aa',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(8px)',
                    border: '2px solid #00d4aa'
                  }}>
                    🎨 MIINA LIVE WALLPAPER PREVIEW (3/3)
                  </div>
                </div>
              ) : (
                COCKPIT_MODULES[selectedKey]
              )}
            </div>
            {/* Right Vertical Bar */}
            <div style={{ gridColumn: 4, width: '100%', height: '100%', background: 'rgba(0,212,170,0.18)', boxShadow: '0 0 12px 2px #00d4aa55', borderRadius: 6, zIndex: 2, pointerEvents: 'none', backdropFilter: 'blur(2px)', minHeight: 0 }} />
            {/* Right iPhone */}
            <div className="cockpit-grid-phone" style={{ gridColumn: 5, alignSelf: 'center', width: '100%', minWidth: 220, maxWidth: 420, background: 'rgba(10,20,30,0.5)', flex: 1, minHeight: 0, height: '100%' }}>
              <div className="iphone-shape">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  {/* Ticker Overlay for Predictive History */}
                  <div className="ticker-bar">
                    <a
                      href="https://www.youtube.com/watch?v=Jjqf9T59uY0&list=PLREQ8S3NPaQvNTsYrqph8T4hn7KAHb1si&index=63"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Predictive History
                    </a>
                  </div>
                  {!isContentHidden ? (
                    <SmartPhoneDisplay 
                      url="http://192.168.29.208:8080/"
                      label="RIGHT IPHONE"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '16px'
                      }}
                    />
                  ) : (
                    <LiveWallpaper isLandscape={false} wallpaperIndex={1} />
                  )}
                </div>
                <div className="phone-home-indicator" />
              </div>
            </div>
            {/* Mission Tracker */}
            <div className="mission-tracker-container" style={{ gridColumn: 6, alignSelf: 'center', width: '100%', minWidth: 320, maxWidth: '100%', height: '100%', minHeight: 480, maxHeight: '60vh', overflow: 'visible', display: 'flex', flexDirection: 'column', background: 'rgba(10,20,30,0.5)', flex: 1 }}>
              <MissionTracker />
            </div>
          </div>
          {/* Row 2: Live Wallpaper / Preview strip */}
          <div
            className={`live-wallpaper-container ${!isContentHidden ? '' : 'active'}`}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: '3px solid rgba(0,212,170,0.45)',
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: !isContentHidden ? 'none' : 'auto',
              opacity: 0.9,
            }}
          >
            {isContentHidden && (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <LiveWallpaper isLandscape={true} wallpaperIndex={2} />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(0,0,0,0.8)',
                  color: '#00d4aa',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(4px)',
                  border: '2px solid #00d4aa'
                }}>
                  🖼️ MIINA LANDSCAPE WALLPAPER (3/3)
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Bottom Cockpit Links - fixed to bottom of viewport */}
        <div className="cockpit-bottom-links semi-transparent-bg" ref={bottomLinksRef} style={{ position: 'fixed', left: 0, bottom: 0, width: '100vw', zIndex: 1000, marginTop: 0, overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', background: 'rgba(10,20,30,0.7)' }}>
          {[...COCKPIT_LINKS, ...COCKPIT_LINKS].map((link, idx) => (
            <div
              key={link.key + '-' + idx}
              className={`cockpit-link-box cockpit-link-box-lg${selectedKey === link.key ? ' selected' : ''}`}
              tabIndex={0}
              onClick={() => setSelectedKey(link.key)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedKey(link.key); }}
            >
              <span className="nav-label-hi">{link.hi}</span>
            </div>
          ))}
        </div>
        {/* Floating lever cockpit control */}
        <div style={{ position: 'fixed', left: 24, bottom: 120, zIndex: 2000 }}>
          <AdvancedLever 
            onToggle={setIsContentHidden}
            isActive={isContentHidden}
            size={70}
          />
        </div>
      </div>
    </>
  );
};

export default Home;