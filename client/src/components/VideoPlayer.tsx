import React, { useState, useEffect, useRef } from 'react';
import '../styles/VideoPlayer.css';

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl = '', 
  title = 'UNTITLED VIDEO',
  autoplay = false,
  loop = false,
  muted = true,
  controls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 0.5);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      
      if (muted) {
        videoRef.current.muted = true;
      }
      
      const videoElement = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(videoElement.duration);
      };
      
      const handleTimeUpdate = () => {
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        setProgress(isNaN(progress) ? 0 : progress);
        setCurrentTime(videoElement.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('ended', handleEnded);
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [videoRef, muted]);
  
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && duration) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(parseFloat(e.target.value));
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };
  
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  return (
    <div 
      className="f16-video-player"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="video-header">
        <div className="video-title">{title}</div>
        <div className="video-status">{isPlaying ? 'PLAYING' : 'PAUSED'}</div>
      </div>
      
      <div className="video-screen-container">
        <video
          ref={videoRef}
          src={videoUrl}
          className="video-screen"
          loop={loop}
          playsInline
          onClick={handlePlayPause}
        />
        
        <div className="video-overlay"></div>
        <div className="scan-line"></div>
        <div className="video-frame-corners">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </div>
        
        {!videoUrl && (
          <div className="no-video">NO VIDEO SIGNAL</div>
        )}
        
        <div className={`video-controls ${showControls ? 'visible' : ''}`}>
          <div className="control-row timeline">
            <span className="time-display">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="progress-slider"
            />
            <span className="time-display">{formatTime(duration)}</span>
          </div>
          
          <div className="control-row buttons">
            <button className="control-btn" onClick={handlePlayPause}>
              {isPlaying ? '❚❚' : '▶'}
            </button>
            
            <div className="volume-control">
              <span className="volume-icon">{volume === 0 ? '🔇' : '🔊'}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
            
            {controls && (
              <div className="additional-controls">
                <button className="control-btn">⟲</button>
                <button className="control-btn">HD</button>
                <button className="control-btn">⚙</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="video-stats">
        <div className="stat-item">
          <span className="stat-label">RESOLUTION:</span>
          <span className="stat-value">1920x1080</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">BUFFER:</span>
          <span className="stat-value">100%</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;