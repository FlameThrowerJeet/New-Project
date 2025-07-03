import React, { useState, useEffect, useRef } from 'react';
import './MiinaAI.css';

interface MiinaImage {
  id: number;
  url: string;
  title: string;
  description: string;
  category: string;
  width?: number;
  height?: number;
  isLandscape?: boolean;
}

const MiinaAI: React.FC = () => {
  const [originalImages, setOriginalImages] = useState<MiinaImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomDirection, setZoomDirection] = useState<'in' | 'out'>('in');
  const [meditationPhase, setMeditationPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [showText, setShowText] = useState(true);

  const galleryRef = useRef<HTMLDivElement>(null);

  // Load original Miina images
  useEffect(() => {
    const loadOriginalImages = async () => {
      try {
        const response = await fetch('/images/miina-full-manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          let allImages: MiinaImage[] = [];
          Object.keys(manifest).forEach(category => {
            manifest[category].forEach((imageData: any) => {
              allImages.push(imageData);
            });
          });
          setOriginalImages(allImages);
        }
      } catch (error) {
        console.error('Error loading original images:', error);
      }
    };
    loadOriginalImages();
  }, []);

  // Meditation cycle: 4 seconds inhale + 4 seconds exhale = 8 seconds per image
  useEffect(() => {
    if (originalImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % originalImages.length);
        setZoomLevel(1);
        setZoomDirection('in');
        setMeditationPhase('inhale');
        setCountdown(4);
        setShowText(true);
      }, 8000); // 8 seconds per image (4s inhale + 4s exhale)

      return () => clearInterval(interval);
    }
  }, [originalImages.length]);

  // Meditation phase and countdown timer - synchronized
  useEffect(() => {
    if (originalImages.length === 0) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;
        
        if (newCount <= 0) {
          // Switch phases when countdown reaches 0
          if (meditationPhase === 'inhale') {
            setMeditationPhase('exhale');
            setZoomDirection('out');
            return 4; // Reset to 4 for exhale phase
          } else {
            // End of exhale phase - will be reset by main interval
            setShowText(false);
            return 0;
          }
        }
        
        return newCount;
      });
    }, 1000); // Update every second

    return () => clearInterval(countdownInterval);
  }, [meditationPhase, originalImages.length]);

  // Smooth zoom animation synchronized with breathing phases
  useEffect(() => {
    if (originalImages.length === 0) return;

    const zoomDuration = 4000; // 4 seconds - matches breathing phase duration
    const zoomSteps = 40; // 40 steps for smooth animation
    const stepDuration = zoomDuration / zoomSteps; // 100ms per step
    const zoomIncrement = 0.3 / zoomSteps; // Total zoom range: 1.0 to 1.3

    const zoomInterval = setInterval(() => {
      setZoomLevel(prev => {
        if (zoomDirection === 'in') {
          const newZoom = prev + zoomIncrement;
          return newZoom >= 1.3 ? 1.3 : newZoom;
        } else {
          const newZoom = prev - zoomIncrement;
          return newZoom <= 1.0 ? 1.0 : newZoom;
        }
      });
    }, stepDuration);

    return () => clearInterval(zoomInterval);
  }, [zoomDirection, originalImages.length]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleFullscreen = () => {
    console.log('Fullscreen button clicked', galleryRef.current);
    if (galleryRef.current) {
      try {
        const result = galleryRef.current.requestFullscreen?.();
        if (result && typeof result.then === 'function') {
          result.then(() => {
            console.log('Fullscreen entered');
          }).catch((err) => {
            console.error('Fullscreen error:', err);
          });
        } else {
          console.log('Fullscreen API not supported or not a promise');
        }
      } catch (err) {
        console.error('Fullscreen exception:', err);
      }
    }
  };

  const currentImage = originalImages[currentIndex];

  return (
    <div ref={galleryRef} className={`miina-pure-gallery ${isFullscreen ? 'fullscreen' : ''}`}>
      {currentImage ? (
        <div className="main-anime-image">
          <img
            src={currentImage.url}
            alt={currentImage.title}
            style={{
              objectFit: 'cover',
              objectPosition: 'center 30%',
              width: '100%',
              height: '100%',
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          {/* Meditation text overlay */}
          {showText && (
            <div className={`meditation-text ${meditationPhase}`}>
              <div className="meditation-message">
                {meditationPhase === 'inhale' ? 'सांस लें' : 'सांस छोड़ें'}
              </div>
              <div className="meditation-countdown">
                {countdown > 0 ? countdown : 1}
              </div>
            </div>
          )}
          
          {/* Fullscreen toggle button */}
          <button 
            className="fullscreen-toggle-btn"
            onClick={handleFullscreen}
            title={isFullscreen ? 'फुलस्क्रीन से बाहर निकलें' : 'फुलस्क्रीन में प्रवेश करें'}
          >
            {isFullscreen ? '↙️' : '⛶'}
          </button>
        </div>
      ) : (
        <div className="no-images-message">
          <h2>मीना रणनीतिक डेटाबेस</h2>
          <p>एनीमे चित्र संग्रह लोड हो रहा है...</p>
          <div className="image-count">
            {originalImages.length} एनीमे चित्र उपलब्ध
          </div>
        </div>
      )}
    </div>
  );
};

export default MiinaAI; 