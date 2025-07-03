import React, { useState, useEffect, useRef, useCallback } from 'react';
import OptimizedImage from './OptimizedImage';
import './HorizontalSlideshow.css';
import MissionTicker from './MissionTicker';
import { missions } from '../data/missions';

interface Image {
  id: number;
  url: string;
  title: string;
  description: string;
  category: string;
  width?: number;
  height?: number;
  isLandscape?: boolean;
}

interface ImagePosition {
  scale: number;
  translateX: number;
  translateY: number;
}

const CATEGORIES = ['History', 'Science', 'Geo-Politics', 'News'];

interface HorizontalSlideshowProps {
  selectedSectionIndex: number;
  isGlobalWallpaper?: boolean;
  isWindowed?: boolean;
  imageStyle?: React.CSSProperties;
}

const HorizontalSlideshow: React.FC<HorizontalSlideshowProps> = ({ selectedSectionIndex, isGlobalWallpaper = false, isWindowed = false, imageStyle }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Pinch and scroll state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePositions, setImagePositions] = useState<Record<string, ImagePosition>>({});

  // For random image cycling
  const [shuffledIndexes, setShuffledIndexes] = useState<number[]>([]);
  const [shufflePointer, setShufflePointer] = useState(0);

  // Load Miina images from manifest
  useEffect(() => {
    const loadMiinaImages = async () => {
      try {
        // Try to load the full manifest first, fallback to original manifest
        let response = await fetch('/images/miina-full-manifest.json');
        if (!response.ok) {
          response = await fetch('/images/miina-manifest.json');
        }
        
        if (response.ok) {
          const manifest = await response.json();
          const allMiinaImages: Image[] = [];
          
          Object.keys(manifest).forEach(category => {
            manifest[category].forEach((imageData: any) => {
              allMiinaImages.push({
                id: imageData.id,
                url: imageData.url,
                title: imageData.title,
                description: imageData.description,
                category: imageData.category,
                width: imageData.width,
                height: imageData.height,
                isLandscape: imageData.isLandscape
              });
            });
          });
          
          setImages(allMiinaImages);
          console.log(`✅ Loaded ${allMiinaImages.length} Miina images for slideshow`);
        }
      } catch (error) {
        console.error('❌ Error loading Miina images for horizontal slideshow:', error);
      }
    };

    loadMiinaImages();
  }, []);

  // Load saved positions from localStorage
  useEffect(() => {
    const savedPositions = localStorage.getItem('imagePositions');
    if (savedPositions) {
      try {
        setImagePositions(JSON.parse(savedPositions));
      } catch (error) {
        console.error('Error loading saved positions:', error);
      }
    }
  }, []);

  // Save positions to localStorage
  const savePosition = useCallback((imageId: string, position: ImagePosition) => {
    const newPositions = { ...imagePositions, [imageId]: position };
    setImagePositions(newPositions);
    localStorage.setItem('imagePositions', JSON.stringify(newPositions));
  }, [imagePositions]);

  // Load position for current image
  const loadPosition = useCallback((imageId: string) => {
    const savedPosition = imagePositions[imageId];
    if (savedPosition) {
      setScale(savedPosition.scale);
      setTranslateX(savedPosition.translateX);
      setTranslateY(savedPosition.translateY);
    } else {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    }
  }, [imagePositions]);

  // Filter images based on mode
  const displayImages = (() => {
    if (isGlobalWallpaper) {
      // For global wallpaper, use all images
      return images;
    } else if (isWindowed) {
      // For windowed mode (live wallpaper preview), use only landscape images
      return images.filter(img => {
        // Use the isLandscape property from the updated manifest
        if (img.isLandscape !== undefined) {
          return img.isLandscape;
        }
        // Fallback: if we have width/height data, use it
        if (img.width && img.height) {
          return img.width > img.height;
        }
        // Otherwise, assume all images are landscape for now
        return true;
      });
    } else {
      // For regular slideshow, use category-based filtering
      const availableCategories = CATEGORIES.filter((_, index) => index !== selectedSectionIndex);
      const randomCategoryIndex = availableCategories.length > 0 ? Math.floor(Math.random() * availableCategories.length) : 0;
      const wallpaperCategory = availableCategories[randomCategoryIndex] || CATEGORIES[0];
      return images.filter(img => img.category === wallpaperCategory);
    }
  })();

  // Shuffle function
  function shuffleArray(length: number) {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // On images load or change, reshuffle
  useEffect(() => {
    if (displayImages.length > 1) {
      setShuffledIndexes(shuffleArray(displayImages.length));
      setShufflePointer(0);
    }
  }, [displayImages.length]);

  // For timer-based cycling, use shuffledIndexes
  useEffect(() => {
    if (displayImages.length > 1 && isPlaying) {
      const initialDelay = Math.random() * 10000;
      let interval: NodeJS.Timeout;
      const timeout = setTimeout(() => {
        interval = setInterval(() => {
          setShufflePointer(prev => {
            if (prev + 1 >= shuffledIndexes.length) {
              // Reshuffle and start over
              setShuffledIndexes(shuffleArray(displayImages.length));
              return 0;
            }
            return prev + 1;
          });
        }, isGlobalWallpaper ? 30000 : 30000);
      }, initialDelay);
      return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
      };
    }
  }, [displayImages.length, isGlobalWallpaper, isPlaying, shuffledIndexes.length]);

  // Set currentImageIndex from shuffledIndexes
  useEffect(() => {
    if (shuffledIndexes.length > 0) {
      setCurrentImageIndex(shuffledIndexes[shufflePointer] || 0);
    }
  }, [shufflePointer, shuffledIndexes]);

  // Enhanced transition function with tactical effects
  const transitionToNextImage = () => {
    if (displayImages.length <= 1) return;
    
    // Save current position before transition
    if (currentImage) {
      savePosition(currentImage.id.toString(), { scale, translateX, translateY });
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(prev => (prev + 1) % displayImages.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 500);
  };

  const transitionToPreviousImage = () => {
    if (displayImages.length <= 1) return;
    
    // Save current position before transition
    if (currentImage) {
      savePosition(currentImage.id.toString(), { scale, translateX, translateY });
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(prev => (prev - 1 + displayImages.length) % displayImages.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 500);
  };

  // Initialize with random image
  useEffect(() => {
    if (displayImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * displayImages.length);
      setCurrentImageIndex(randomIndex);
    }
  }, [displayImages.length, selectedSectionIndex, isGlobalWallpaper, isWindowed]);

  // Touch gesture handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    const x = (touches[0].clientX + touches[1].clientX) / 2;
    const y = (touches[0].clientY + touches[1].clientY) / 2;
    return { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1) {
      // Single touch - start drag
      setIsDragging(true);
      setDragStart({ x: touches[0].clientX - translateX, y: touches[0].clientY - translateY });
    } else if (touches.length === 2) {
      // Two touches - start pinch
      setLastTouchDistance(getTouchDistance(touches));
      setLastTouchCenter(getTouchCenter(touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1 && isDragging) {
      // Single touch - drag
      const newTranslateX = touches[0].clientX - dragStart.x;
      const newTranslateY = touches[0].clientY - dragStart.y;
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
    } else if (touches.length === 2) {
      // Two touches - pinch
      const currentDistance = getTouchDistance(touches);
      const currentCenter = getTouchCenter(touches);
      
      if (lastTouchDistance > 0) {
        const scaleChange = currentDistance / lastTouchDistance;
        const newScale = Math.max(0.5, Math.min(3, scale * scaleChange));
        setScale(newScale);
        
        // Adjust translation to keep pinch center stable
        const centerChangeX = currentCenter.x - lastTouchCenter.x;
        const centerChangeY = currentCenter.y - lastTouchCenter.y;
        setTranslateX(prev => prev + centerChangeX);
        setTranslateY(prev => prev + centerChangeY);
      }
      
      setLastTouchDistance(currentDistance);
      setLastTouchCenter(currentCenter);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setLastTouchDistance(0);
    
    // Save position when interaction ends
    if (currentImage) {
      savePosition(currentImage.id.toString(), { scale, translateX, translateY });
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    setScale(newScale);
    
    // Save position
    if (currentImage) {
      savePosition(currentImage.id.toString(), { scale: newScale, translateX, translateY });
    }
  };

  // Reset zoom and position
  const resetView = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    if (currentImage) {
      savePosition(currentImage.id.toString(), { scale: 1, translateX: 0, translateY: 0 });
    }
  };

  // Fullscreen handling
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Navigation functions
  const goToNext = () => {
    transitionToNextImage();
  };

  const goToPrevious = () => {
    transitionToPreviousImage();
  };

  const currentImage = displayImages[currentImageIndex];

  // Load position when image changes
  useEffect(() => {
    if (currentImage) {
      loadPosition(currentImage.id.toString());
    }
  }, [currentImage, loadPosition]);

  // Slow horizontal movement for live wallpaper
  useEffect(() => {
    if (!currentImage || !imageRef.current || !isWindowed) return;
    
    let animationId: number;
    let startTime = Date.now();
    const moveSpeed = 0.03; // Very slow horizontal movement
    const maxMoveX = 30; // Small horizontal movement range
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Horizontal movement only (very slow)
      const moveX = Math.sin(elapsed * moveSpeed) * maxMoveX;
      setTranslateX(moveX);
      
      // Keep vertical position at 0 (no vertical movement)
      setTranslateY(0);
      
      // Keep scale at 1 for live wallpaper
      setScale(1);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentImage, isWindowed]);

  if (displayImages.length === 0) {
    return null;
  }

  if (!currentImage) {
    return null; // Return nothing if image is not found
  }

  return (
    <div 
      ref={containerRef}
      className={`horizontal-slideshow-wallpaper${isGlobalWallpaper ? ' global-wallpaper' : ''}${isWindowed ? ' windowed' : ''}${isFullscreen ? ' fullscreen' : ''}${isTransitioning ? ' transitioning' : ''}`}
    >
      <div 
        ref={imageRef}
        className="wallpaper-background" 
        style={{ maxHeight: isWindowed ? '100%' : '18vh' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <OptimizedImage
          src={currentImage.url}
          alt={currentImage.title}
          faceCentering={true}
          style={{
            width: '100%',
            height: '100%',
            objectFit: isWindowed ? 'cover' : 'cover',
            objectPosition: isWindowed ? 'center 30%' : 'center',
            backgroundColor: '#000',
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            ...(imageStyle || {})
          }}
        />
      </div>
      
      {/* Minimal controls overlay - only show for windowed mode */}
      {isWindowed && (
        <div className="wallpaper-controls-overlay">
          <div className="wallpaper-controls">
            <button 
              className="control-btn play-pause-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button 
              className="control-btn nav-btn"
              onClick={goToPrevious}
              title="Previous"
            >
              ◀
            </button>
            <button 
              className="control-btn nav-btn"
              onClick={goToNext}
              title="Next"
            >
              ▶
            </button>
            <button 
              className="control-btn reset-btn"
              onClick={resetView}
              title="Reset View"
            >
              🔄
            </button>
            <button 
              className="control-btn fullscreen-btn"
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? '↙️' : '⛶'}
            </button>
          </div>
        </div>
      )}
      
      {/* Tactical scanning lines effect */}
      <div className="scanning-lines"></div>

      <div className="mission-overlay-bottom">
        <MissionTicker missions={missions.slice(6)} maxVisible={3} />
      </div>
    </div>
  );
};

export default HorizontalSlideshow; 