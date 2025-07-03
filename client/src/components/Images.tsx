import React, { useState, useEffect, useRef } from 'react';
import OptimizedImage from './OptimizedImage';
import './Images.css';

interface GalleryImage {
  id: number;
  url: string;
  category: string;
  title: string;
}

interface ImagesProps {
  sectionIndex: number;
  setSectionIndex: (idx: number) => void;
  imageIndex: number;
  setImageIndex: (idx: number) => void;
  isContentHidden?: boolean;
}

const Images: React.FC<ImagesProps> = ({ sectionIndex, setSectionIndex, imageIndex, setImageIndex, isContentHidden = false }) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Load Miina images from manifest
  useEffect(() => {
    const loadImages = async () => {
      try {
        console.log('🔄 Loading Miina image manifest...');
        const response = await fetch('/images/miina-full-manifest.json');
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        const manifest = await response.json();
        const imgs: GalleryImage[] = [];
        Object.keys(manifest).forEach(cat => {
          manifest[cat].forEach((img: any) => {
            imgs.push({
              id: imgs.length,
              url: img.url,
              category: cat,
              title: img.title || img.originalName || 'Image'
            });
          });
        });
        setGalleryImages(imgs);
        console.log(`🎉 Loaded ${imgs.length} images`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('❌ Error loading manifest:', msg);
        setManifestError(msg);
      } finally {
        setManifestLoaded(true);
      }
    };
    loadImages();
  }, []);

  // Derive unique categories from loaded images
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(galleryImages.map(img => img.category || 'Misc')));
    return cats.length ? cats : ['All'];
  }, [galleryImages]);

  // Ensure sectionIndex stays within bounds if categories length changes
  useEffect(() => {
    if (sectionIndex >= categories.length) {
      setSectionIndex(0);
    }
  }, [categories, sectionIndex, setSectionIndex]);

  // Filter images based on selected category
  const filteredImages = React.useMemo(() => {
    if (!categories.length) return [];
    const currentCategory = categories[sectionIndex] || categories[0];
    if (currentCategory === 'All') return galleryImages;
    return galleryImages.filter(img => img.category === currentCategory);
  }, [galleryImages, categories, sectionIndex]);

  // Reset image index when section changes
  useEffect(() => {
    setImageIndex(0);
  }, [sectionIndex, setImageIndex]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      imageContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleNextImage = () => {
    setImageIndex(Math.min(filteredImages.length - 1, imageIndex + 1));
  };

  const handlePrevImage = () => {
    setImageIndex(Math.max(0, imageIndex - 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            handlePrevImage();
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleNextImage();
            break;
          case 'Escape':
            e.preventDefault();
            handleFullscreen();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, imageIndex, filteredImages.length]);
  
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);
  
  // --- Jump-to-image helpers ---
  const [jumpInput, setJumpInput] = React.useState('');

  const handleJump = () => {
    const num = parseInt(jumpInput, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= filteredImages.length) {
      setImageIndex(num - 1);
    }
    setJumpInput('');
  };

  // --- Clean anime image viewer ---
  return (
    <div className={`images-container ${isFullscreen ? 'fullscreen-container' : ''}`}>
      {/* Category Navigation */}
      <div className={`images-tactical-nav ${isFullscreen ? 'fullscreen-nav' : ''}`}>
        {categories.map((cat, idx) => (
          <div
            key={cat}
            className={`cockpit-link-box-lg${sectionIndex === idx ? ' selected' : ''}`}
            onClick={() => setSectionIndex(idx)}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSectionIndex(idx); }}
          >
            <span>{cat.toUpperCase()}</span>
          </div>
        ))}
      </div>
      
      {/* Center: Clean image viewer */}
      <div className="images-viewer">
        {!manifestLoaded ? (
          <div className="images-status-text">LOADING IMAGE DATABASE...</div>
        ) : manifestError ? (
          <div className="images-status-text error">{manifestError}</div>
        ) : filteredImages.length === 0 ? (
          <div className="images-status-text">
            NO IMAGES AVAILABLE
            <br />
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              Images will appear here once generated
            </span>
          </div>
        ) : filteredImages[imageIndex] ? (
          <div className="images-content-wrapper">
            {/* Navigation buttons - always visible */}
            <button
              onClick={handlePrevImage}
              disabled={imageIndex === 0}
              className="image-nav-button prev"
            >
              ◀
            </button>
            
            <div className="image-display-container" ref={imageContainerRef}>
              <OptimizedImage
                src={filteredImages[imageIndex].url}
                alt={filteredImages[imageIndex].title}
                className="main-image"
                style={{ transform: `scale(${zoom})` }}
              />
              
              {/* Controls overlay - always visible */}
              <div className="image-controls-overlay">
                <button onClick={handleZoomIn} className="control-button">➕</button>
                <button onClick={handleZoomOut} className="control-button">➖</button>
                <button onClick={handleFullscreen} className="control-button">{isFullscreen ? '↙️' : '⛶'}</button>
              </div>
              
              {/* Fullscreen navigation controls */}
              {isFullscreen && (
                <div className="fullscreen-nav-controls">
                  <button
                    onClick={handlePrevImage}
                    disabled={imageIndex === 0}
                    className="fullscreen-nav-btn prev"
                  >
                    ◀
                  </button>
                  <button
                    onClick={handleNextImage}
                    disabled={imageIndex === filteredImages.length - 1}
                    className="fullscreen-nav-btn next"
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={handleNextImage}
              disabled={imageIndex === filteredImages.length - 1}
              className="image-nav-button next"
            >
              ▶
            </button>
          </div>
        ) : null}
      </div>
      
      {/* Footer with progress + jump-to control */}
      {filteredImages[imageIndex] && (
        <div className="images-footer">
          <div className="image-progress">
            {imageIndex + 1} / {filteredImages.length}
          </div>
          <div className="image-jump-control">
            <input
              type="number"
              min={1}
              max={filteredImages.length}
              placeholder="Jump to #"
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleJump(); }}
              className="image-jump-input"
            />
            <button onClick={handleJump} className="image-jump-btn">GO</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Images;