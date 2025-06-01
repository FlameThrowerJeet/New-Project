import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import '../styles/VideoPage.css';

interface VideoItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
}

const defaultVideos: VideoItem[] = [
  {
    id: 1,
    title: "F-16 COCKPIT SIMULATION",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    description: "Virtual cockpit simulation with HUD overlay",
    thumbnail: "https://via.placeholder.com/320x180.png?text=F-16+Simulation",
    duration: 125
  },
  {
    id: 2,
    title: "RECONNAISSANCE FLIGHT 09-27",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    description: "Aerial reconnaissance footage from sector 7G",
    thumbnail: "https://via.placeholder.com/320x180.png?text=Recon+Flight",
    duration: 183
  }
];

const VideoPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    // Load videos from localStorage or use default
    const savedVideos = localStorage.getItem('fogghyaVideos');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    } else {
      setVideos(defaultVideos);
      localStorage.setItem('fogghyaVideos', JSON.stringify(defaultVideos));
    }
  }, []);

  useEffect(() => {
    // Select the first video by default
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  return (
    <div className="video-page">
      <header className="video-header">
        <Link to="/" className="back-button">←</Link>
        <h1>VISUAL RECONNAISSANCE</h1>
      </header>

      <div className="f16-video-terminal">
        {/* Main video player */}
        <div className="video-main-section">
          {selectedVideo ? (
            <VideoPlayer 
              videoUrl={selectedVideo.url}
              title={selectedVideo.title}
              autoplay={true}
              controls={true}
            />
          ) : (
            <div className="no-video-container">
              <div className="no-video-message">NO VIDEO SELECTED</div>
            </div>
          )}
        </div>
        
        {/* Video playlist */}
        <div className="video-playlist-section">
          <div className="playlist-header">MISSION FOOTAGE</div>
          <div className="playlist-items">
            {videos.map(video => (
              <div 
                key={video.id} 
                className={`playlist-item ${selectedVideo?.id === video.id ? 'active' : ''}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="video-thumbnail">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <span>NO PREVIEW</span>
                    </div>
                  )}
                </div>
                <div className="video-info">
                  <div className="video-title">{video.title}</div>
                  <div className="video-meta">
                    <span className="video-duration">
                      {video.duration 
                        ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`
                        : '--:--'}
                    </span>
                  </div>
                  <div className="video-description">{video.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;