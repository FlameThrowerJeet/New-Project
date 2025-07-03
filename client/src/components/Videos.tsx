import React, { useState, useEffect, useRef } from 'react';
import './Videos.css';

interface MiinaVideo {
  id: string;
  title: string;
  filename: string;
  url: string;
}

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<MiinaVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadVideoManifest = async () => {
      try {
        console.log('🔄 Loading video manifest...');
        const response = await fetch('/videos/working-videos-manifest.json');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const videos = data.videos;
        
        console.log(`✅ Loaded ${videos.length} videos from manifest:`, videos.map((v: MiinaVideo) => v.title));
        
        if (videos.length === 0) {
          throw new Error('No videos found in manifest.');
        }

        setVideos(videos);
        setCurrentVideoTitle(videos[0].title);
        setIsLoading(false);
      } catch (e: any) {
        console.error('❌ Error loading video manifest:', e);
        setError(`Video manifest error: ${e.message}`);
        setIsLoading(false);
      }
    };
    loadVideoManifest();
  }, []);

  // Setup video player with autoplay and cycling through videos
  useEffect(() => {
    if (isLoading || videos.length === 0) return;

    const video = videoRef.current;
    if (!video) return;

    console.log(`🎬 Setting up video player with: ${videos[currentVideoIndex].title}`);
    
    // Set video source
    video.src = videos[currentVideoIndex].url;
    video.load();
    
    // Configure for autoplay and cycling
    video.muted = true;
    video.playsInline = true;
    video.loop = false; // Don't loop individual videos, cycle through them
    
    // Add event listeners
    const handleLoadedData = () => {
      console.log('✅ Video loaded:', videos[currentVideoIndex].title);
      // Start playing immediately
      video.play().catch(e => {
        console.error("❌ Autoplay was prevented:", e);
        setError(`Autoplay blocked: ${e.message}`);
      });
    };

    const handleError = (e: Event) => {
      console.error('❌ Video error:', e);
      setError(`Video playback error: ${videos[currentVideoIndex].title}`);
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play');
      setError(null); // Clear any previous errors
    };

    const handleEnded = () => {
      console.log('🔚 Video ended, cycling to next');
      // Cycle to next video
      setCurrentVideoIndex(prev => (prev + 1) % videos.length);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isLoading, videos, currentVideoIndex]);

  if (isLoading) {
    return <div className="video-system-message">रणनीतिक फीड प्रारंभ हो रहा है...</div>;
  }
  
  if (error) {
    return (
      <div className="video-system-message error">
        <div style={{ fontSize: '18px', marginBottom: '20px', color: '#ff4444' }}>
          वीडियो प्लेबैक उपलब्ध नहीं है
        </div>
        <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
          <strong>त्रुटि:</strong> {error}
          <br /><br />
          <strong>उपलब्ध वीडियो:</strong> {videos.length}
          <br />
          <strong>वर्तमान वीडियो:</strong> {currentVideoTitle}
          <br /><br />
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#00d4aa',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              fontFamily: 'Courier New',
              fontWeight: 'bold'
            }}
          >
            पुनः प्रयास करें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="continuous-video-container">
        <div className="video-header-overlay">
            मीना रणनीतिक फीड :: {videos.length} संसाधन स्ट्रीम हो रहे हैं
            <br />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              अब चल रहा है: {currentVideoTitle}
            </span>
        </div>
        <video
            ref={videoRef}
            className="video-player"
            muted
            playsInline
            onError={(e) => console.error('❌ Video error:', e)}
            onLoadStart={() => console.log('🔄 Video loading...')}
            onCanPlay={() => console.log('✅ Video can play')}
            onPlay={() => console.log('▶️ Video started playing')}
            onPause={() => console.log('⏸️ Video paused')}
            onEnded={() => console.log('🔚 Video ended')}
        />
        <div className="video-vignette" />
    </div>
  );
};

export default Videos;