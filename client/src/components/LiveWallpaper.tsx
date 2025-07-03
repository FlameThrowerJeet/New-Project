import React, { useState, useEffect } from 'react';

interface LiveWallpaperProps {
  style?: React.CSSProperties;
  isLandscape?: boolean; // true for preview section, false for iPhone portraits
  wallpaperIndex?: number; // 0 = first set, 1 = second set, 2 = third set
}

interface MiinaImage {
  id: number;
  url: string;
  title: string;
  description: string;
  category: string;
  originalName: string;
  width: number;
  height: number;
  isLandscape: boolean;
}

const LiveWallpaper: React.FC<LiveWallpaperProps> = ({ style, isLandscape = false, wallpaperIndex = 0 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [miinaImages, setMiinaImages] = useState<MiinaImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Zoom and scroll states for portrait mode
  const [zoom, setZoom] = useState(2.0);
  const [translateX, setTranslateX] = useState(0);

  // Load Miina images from manifest
  useEffect(() => {
    const loadMiinaImages = async () => {
      try {
        const response = await fetch('/images/miina-full-manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          const allImages: MiinaImage[] = manifest.Miina || [];
          
          // Filter images based on orientation
          const filteredImages = allImages.filter(img => 
            isLandscape ? img.isLandscape : !img.isLandscape
          );
          
          // Split into different sets for different wallpapers
          const imagesPerWallpaper = Math.floor(filteredImages.length / 3);
          const startIndex = wallpaperIndex * imagesPerWallpaper;
          const endIndex = wallpaperIndex === 2 ? filteredImages.length : (wallpaperIndex + 1) * imagesPerWallpaper;
          const wallpaperImages = filteredImages.slice(startIndex, endIndex);
          
          setMiinaImages(wallpaperImages);
          console.log(`🎨 Loaded ${wallpaperImages.length} Miina ${isLandscape ? 'landscape' : 'portrait'} images for wallpaper ${wallpaperIndex + 1}`);
        } else {
          console.error('Failed to load Miina manifest');
        }
      } catch (error) {
        console.error('Error loading Miina images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMiinaImages();
  }, [isLandscape, wallpaperIndex]);

  // Auto-rotate through images every 10 seconds
  useEffect(() => {
    if (miinaImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % miinaImages.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [miinaImages.length]);

  // Zoom and horizontal scroll animation for portrait mode
  useEffect(() => {
    if (isLandscape || miinaImages.length === 0) return;
    
    // Reset zoom when image changes
    setZoom(2.0);
    
    let animationId: number;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Zoom from 200% to 125% over 8 seconds
      const zoomProgress = Math.min(elapsed / 8, 1);
      const currentZoom = 2.0 - (0.75 * zoomProgress); // 2.0 to 1.25
      setZoom(currentZoom);
      
      // Horizontal movement - different speeds for different wallpapers
      const moveSpeed = wallpaperIndex === 0 ? 0.12 : wallpaperIndex === 1 ? 0.09 : 0.15;
      const moveRange = wallpaperIndex === 0 ? 24 : wallpaperIndex === 1 ? 18 : 30;
      const offsetPhase = wallpaperIndex === 1 ? 1.2 : wallpaperIndex === 2 ? 2.4 : 0;
      
      setTranslateX(Math.sin(elapsed * moveSpeed + offsetPhase) * moveRange);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentImageIndex, isLandscape, wallpaperIndex, miinaImages.length]);

  if (isLoading) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
        color: '#00d4aa',
        fontFamily: 'monospace',
        fontSize: '14px',
        borderRadius: '16px',
        ...style
      }}>
        LOADING MIINA WALLPAPER...
    </div>
  );
  }

  if (miinaImages.length === 0) {
  return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
        color: '#ff4444',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '16px',
        ...style
      }}>
        NO MIINA IMAGES FOUND
      </div>
    );
  }

  const currentImage = miinaImages[currentImageIndex];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '16px',
      background: '#000',
      ...style
    }}>
      {/* Miina Image */}
      <img
        src={currentImage.url}
        alt={currentImage.title}
      style={{
        width: '100%',
        height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.5s ease-in-out',
          transform: !isLandscape ? `scale(${zoom}) translateX(${translateX}px)` : 'none',
          transformOrigin: 'center center'
        }}
        onError={(e) => {
          console.error('Failed to load Miina image:', currentImage.url);
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default LiveWallpaper; 