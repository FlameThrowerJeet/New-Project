import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './iPhoneImageComparison.css';
import MissionTicker from './MissionTicker';
import { missions } from '../data/missions';

interface ImageData {
  id: number;
  url: string;
  title: string;
  description?: string;
  category: string;
  width: number;
  height: number;
  isLandscape: boolean;
}

const iPhoneImageComparison: React.FC = () => {
  const [portraitImages, setPortraitImages] = useState<ImageData[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [leftShuffle, setLeftShuffle] = useState<number[]>([]);
  const [rightShuffle, setRightShuffle] = useState<number[]>([]);
  const [leftPointer, setLeftPointer] = useState(0);
  const [rightPointer, setRightPointer] = useState(0);
  const [animeVersions, setAnimeVersions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leftTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [leftZoom, setLeftZoom] = useState(2.0);
  const [rightZoom, setRightZoom] = useState(2.0);
  const [leftX, setLeftX] = useState(0);
  const [rightX, setRightX] = useState(0);

  useEffect(() => {
    fetchPortraitImages();
  }, []);

  const fetchPortraitImages = async () => {
    try {
      const response = await axios.get('/images/miina-full-manifest.json');
      const allImages = response.data;
      
      // Flatten all categories and filter for portrait images only
      const allPortraitImages: ImageData[] = [];
      Object.keys(allImages).forEach(category => {
        if (Array.isArray(allImages[category])) {
          const portraitInCategory = allImages[category].filter((img: ImageData) => !img.isLandscape);
          allPortraitImages.push(...portraitInCategory);
        }
      });
      
      setPortraitImages(allPortraitImages);
      console.log(`Found ${allPortraitImages.length} portrait images`);
    } catch (error) {
      console.error('Error fetching portrait images:', error);
      setError('Failed to load images');
    }
  };

  const generateAnimeVersion = async (imageUrl: string) => {
    if (animeVersions[imageUrl]) {
      return animeVersions[imageUrl];
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Generating anime version for:', imageUrl);
      const response = await axios.post('/api/anime-filter', {
        imageUrl: imageUrl
      });

      if (response.data.animeImageUrl) {
        const animeUrl = response.data.animeImageUrl;
        setAnimeVersions(prev => ({
          ...prev,
          [imageUrl]: animeUrl
        }));
        console.log('Anime version generated successfully:', animeUrl);
        return animeUrl;
      } else {
        throw new Error('No anime image URL received from server');
      }
    } catch (error: any) {
      console.error('Error generating anime version:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate anime version';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleGenerateAnime = async () => {
    const currentImage = portraitImages[leftIndex];
    if (currentImage) {
      await generateAnimeVersion(currentImage.url);
    }
  };

  // Auto-generate anime version when image changes
  useEffect(() => {
    const currentImage = portraitImages[leftIndex];
    if (currentImage && !animeVersions[currentImage.url] && !loading) {
      // Auto-generate anime version after a short delay
      const timer = setTimeout(() => {
        generateAnimeVersion(currentImage.url);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [leftIndex, portraitImages]);

  // Shuffle function
  function shuffleArray(length: number) {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // On images load, reshuffle both
  useEffect(() => {
    if (portraitImages.length > 1) {
      setLeftShuffle(shuffleArray(portraitImages.length));
      setRightShuffle(shuffleArray(portraitImages.length));
      setLeftPointer(0);
      setRightPointer(0);
    }
  }, [portraitImages.length]);

  // Left iPhone timer
  useEffect(() => {
    if (portraitImages.length > 1) {
      if (leftTimerRef.current) clearTimeout(leftTimerRef.current);
      const initialDelay = 2000 + Math.random() * 5000;
      const interval = 8000 + Math.random() * 7000;
      function tick() {
        setLeftPointer(prev => {
          if (prev + 1 >= leftShuffle.length) {
            setLeftShuffle(shuffleArray(portraitImages.length));
            return 0;
          }
          return prev + 1;
        });
        leftTimerRef.current = setTimeout(tick, interval);
      }
      leftTimerRef.current = setTimeout(tick, initialDelay);
      return () => { if (leftTimerRef.current) clearTimeout(leftTimerRef.current); };
    }
  }, [portraitImages.length, leftShuffle.length]);

  // Right iPhone timer
  useEffect(() => {
    if (portraitImages.length > 1) {
      if (rightTimerRef.current) clearTimeout(rightTimerRef.current);
      const initialDelay = 2000 + Math.random() * 5000;
      const interval = 9000 + Math.random() * 7000;
      function tick() {
        setRightPointer(prev => {
          if (prev + 1 >= rightShuffle.length) {
            setRightShuffle(shuffleArray(portraitImages.length));
            return 0;
          }
          return prev + 1;
        });
        rightTimerRef.current = setTimeout(tick, interval);
      }
      rightTimerRef.current = setTimeout(tick, initialDelay);
      return () => { if (rightTimerRef.current) clearTimeout(rightTimerRef.current); };
    }
  }, [portraitImages.length, rightShuffle.length]);

  // Set current indices from shuffles
  useEffect(() => {
    if (leftShuffle.length > 0) setLeftIndex(leftShuffle[leftPointer] || 0);
  }, [leftPointer, leftShuffle]);
  useEffect(() => {
    if (rightShuffle.length > 0) setRightIndex(rightShuffle[rightPointer] || 0);
  }, [rightPointer, rightShuffle]);

  // Animate zoom and horizontal scroll for left iPhone
  useEffect(() => {
    setLeftZoom(2.0);
    let start = Date.now();
    let frame: number;
    function animate() {
      const elapsed = (Date.now() - start) / 1000;
      // Zoom from 2.0 to 1.25 over 8 seconds
      const zoom = Math.max(1.25, 2.0 - (0.75 * Math.min(elapsed / 8, 1)));
      setLeftZoom(zoom);
      // Slow horizontal movement (sinusoidal)
      setLeftX(Math.sin(elapsed * 0.12) * 24);
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [leftIndex]);

  // Animate zoom and horizontal scroll for right iPhone
  useEffect(() => {
    setRightZoom(2.0);
    let start = Date.now();
    let frame: number;
    function animate() {
      const elapsed = (Date.now() - start) / 1000;
      // Zoom from 2.0 to 1.25 over 8 seconds
      const zoom = Math.max(1.25, 2.0 - (0.75 * Math.min(elapsed / 8, 1)));
      setRightZoom(zoom);
      // Slightly different horizontal movement
      setRightX(Math.sin(elapsed * 0.09 + 1.2) * 18);
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [rightIndex]);

  const currentImage = portraitImages[leftIndex];
  const currentAnimeVersion = currentImage ? animeVersions[currentImage.url] : null;

  if (error) {
    return (
      <div className="iphone-comparison-container">
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  if (portraitImages.length === 0) {
    return (
      <div className="iphone-comparison-container">
        <div className="loading-message">📱 Loading portrait images...</div>
      </div>
    );
  }

  return (
    <div className="iphone-comparison-container">
      <div className="comparison-header">
        <h2>📱 आईफोन चित्र तुलना</h2>
        <p>मूल पोर्ट्रेट बनाम एआई एनीमे शैली</p>
        <div className="image-counter">
                      {leftIndex + 1} का {portraitImages.length}
            {loading && <span className="status-indicator"> • 🎨 जेनरेट हो रहा है...</span>}
        </div>
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="iphones-container">
        {/* Original Image iPhone */}
        <div className="iphone-frame">
          <div className="iphone-screen">
            <div className="iphone-notch"></div>
            <div className="iphone-content">
              <div className="image-container">
                <img
                  src={currentImage?.url}
                  alt={currentImage?.title || 'Original'}
                  className="phone-image"
                  style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%', transform: `scale(${leftZoom}) translateX(${leftX}px)` }}
                />
              </div>
              <div className="image-info">
                <h3>मूल</h3>
                <p>{currentImage?.title || 'पोर्ट्रेट चित्र'}</p>
              </div>
              <div className="mission-overlay">
                <MissionTicker missions={missions.slice(0,3)} maxVisible={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Anime Version iPhone */}
        <div className="iphone-frame">
          <div className="iphone-screen">
            <div className="iphone-notch"></div>
            <div className="iphone-content">
              <div className="image-container">
                {currentAnimeVersion ? (
                  <img
                    src={currentAnimeVersion}
                    alt="AI Anime Version"
                    className="phone-image"
                    onError={(e) => {
                      console.error('Failed to load anime image:', currentAnimeVersion);
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%', transform: `scale(${rightZoom}) translateX(${rightX}px)` }}
                  />
                ) : (
                  <div className="placeholder-image">
                    <div className="placeholder-content">
                      {loading ? (
                        <>
                          <p>🎨 Creating Anime Style...</p>
                          <span className="loading-subtitle">Using AnimeGAN v2</span>
                        </>
                      ) : error ? (
                        <>
                          <span className="error-icon">❌</span>
                          <p>Generation Failed</p>
                          <button 
                            className="retry-button"
                            onClick={handleGenerateAnime}
                          >
                            🔄 Retry
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="placeholder-icon">🎨</span>
                          <p>Auto-generating...</p>
                          <span className="loading-subtitle">Please wait</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="image-info">
                <h3>एआई एनीमे संस्करण</h3>
                <p>एआई-निर्मित एनीमे शैली</p>
              </div>
              <div className="mission-overlay">
                <MissionTicker missions={missions.slice(3,6)} maxVisible={3} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button 
          className="nav-button prev-button"
          onClick={() => setLeftIndex(prev => (prev - 1 + portraitImages.length) % portraitImages.length)}
          disabled={portraitImages.length <= 1}
        >
          ⬅️ पिछला
        </button>

        <button 
          className="generate-button"
          onClick={handleGenerateAnime}
          disabled={loading || !currentImage}
        >
          {loading ? '🎨 जेनरेट हो रहा है...' : currentAnimeVersion ? '🔄 फिर से बनाएं' : '🎨 एनीमे बनाएं'}
        </button>

        <button 
          className="nav-button next-button"
          onClick={() => setLeftIndex(prev => (prev + 1) % portraitImages.length)}
          disabled={portraitImages.length <= 1}
        >
          अगला ➡️
        </button>
      </div>

      <div className="image-details">
        {currentImage && (
          <div className="details-content">
            <h4>चित्र विवरण</h4>
            <p><strong>शीर्षक:</strong> {currentImage.title}</p>
            <p><strong>श्रेणी:</strong> {currentImage.category}</p>
            <p><strong>आकार:</strong> {currentImage.width} × {currentImage.height}</p>
            {currentImage.description && (
              <p><strong>विवरण:</strong> {currentImage.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      <div className="thumbnail-nav">
        <h4>त्वरित नेविगेशन</h4>
        <div className="thumbnail-grid">
          {portraitImages.slice(0, 8).map((image, index) => (
            <div
              key={image.id}
              className={`thumbnail ${index === leftIndex ? 'active' : ''}`}
              onClick={() => setLeftIndex(index)}
            >
              <img
                src={image.url}
                alt={image.title}
                className="thumbnail-image"
                style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }}
              />
              <span className="thumbnail-number">{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default iPhoneImageComparison; 