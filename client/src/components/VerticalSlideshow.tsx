import React, { useState, useEffect, useRef, useCallback } from 'react';
import OptimizedImage from './OptimizedImage';
import './VerticalSlideshow.css';

interface Image {
  id: number;
  url: string;
  title: string;
  description: string;
  category: string;
  isLandscape?: boolean;
}

interface ImagePosition {
  scale: number;
  translateX: number;
  translateY: number;
}

const CATEGORIES = ['History', 'Science', 'Geo-Politics', 'News'];

interface VerticalSlideshowProps {
  selectedSectionIndex: number;
}

const VerticalSlideshow: React.FC<VerticalSlideshowProps> = ({ selectedSectionIndex }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  // Load Miina images from full manifest (portrait only)
  useEffect(() => {
    const loadMiinaImages = async () => {
      try {
        const response = await fetch('/images/miina-full-manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          // Flatten all images from all categories
          let allMiinaImages: Image[] = [];
          Object.keys(manifest).forEach(category => {
            manifest[category].forEach((imageData: any) => {
              allMiinaImages.push(imageData);
            });
          });
          // Filter for portrait images only
          const portraitImages = allMiinaImages.filter(img => img.isLandscape === false);
          setImages(portraitImages);
        }
      } catch (error) {
        console.error('❌ Error loading Miina images for vertical slideshow:', error);
      }
    };
    loadMiinaImages();
  }, []);

  // Load saved positions from localStorage
  useEffect(() => {
    const savedPositions = localStorage.getItem('verticalImagePositions');
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
    localStorage.setItem('verticalImagePositions', JSON.stringify(newPositions));
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

  // Get ALL images for random selection (independent of section)
  const allImages = images;

  const currentImage = allImages[currentImageIndex];

  // Desynchronize timer with random initial delay
  useEffect(() => {
    if (allImages.length > 1) {
      const initialDelay = Math.random() * 10000; // up to 10s random delay
      let interval: NodeJS.Timeout;
      const timeout = setTimeout(() => {
        interval = setInterval(() => {
          if (currentImage) {
            savePosition(currentImage.id.toString(), { scale, translateX, translateY });
          }
          const randomIndex = Math.floor(Math.random() * allImages.length);
          setCurrentImageIndex(randomIndex);
        }, 30000);
      }, initialDelay);
      return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
      };
    }
  }, [allImages.length, currentImage, scale, translateX, translateY, savePosition]);

  // Initialize with random image
  useEffect(() => {
    if (allImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * allImages.length);
      setCurrentImageIndex(randomIndex);
    } else {
      setCurrentImageIndex(0);
    }
  }, [allImages.length]);

  // Load position when image changes
  useEffect(() => {
    if (currentImage) {
      // Reset to starting position and zoom for new image
      setTranslateX(0);
      setTranslateY(0);
      setScale(2.0); // Start at 200% zoom
      loadPosition(currentImage.id.toString());
    }
  }, [currentImage, loadPosition]);

  // Slow horizontal movement with zoom animation
  useEffect(() => {
    if (!currentImage || !imageRef.current) return;
    
    let animationId: number;
    let startTime = Date.now();
    const moveSpeed = 0.05; // Very slow horizontal movement
    const maxMoveX = 50; // Small horizontal movement range
    const zoomDuration = 10000; // 10 seconds for zoom animation
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Horizontal movement only (very slow)
      const moveX = Math.sin(elapsed * moveSpeed) * maxMoveX;
      setTranslateX(moveX);
      
      // Keep vertical position at 0 (no vertical movement)
      setTranslateY(0);
      
      // Zoom animation: start at 200%, gradually zoom to 125%
      const zoomProgress = Math.min(elapsed / (zoomDuration / 1000), 1);
      const currentZoom = 2.0 - (zoomProgress * 0.75); // 2.0 to 1.25
      setScale(currentZoom);
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Reset timer for new image
    startTime = Date.now();
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentImage]);

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

  if (!currentImage) {
    return null;
  }

  return (
    <div className="vertical-slideshow" ref={containerRef}>
      <div 
        ref={imageRef}
        className="slideshow-image-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <OptimizedImage
          src={currentImage.url}
          alt={currentImage.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            margin: 0,
            padding: 0,
            display: 'block',
            backgroundColor: '#000',
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
          }}
        />
      </div>
      
      {/* Zoom indicator */}
      {scale !== 1 && (
        <div className="zoom-indicator">
          {Math.round(scale * 100)}%
        </div>
      )}
      
      {/* Reset button */}
      <button 
        className="reset-view-btn"
        onClick={resetView}
        title="Reset View"
      >
        🔄
      </button>
    </div>
  );
};

export default VerticalSlideshow; 