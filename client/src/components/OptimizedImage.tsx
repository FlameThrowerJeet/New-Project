import React, { useState, useEffect } from 'react';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);

    // Create a new image object to preload
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setError(true);
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  if (error) {
    return (
      <div className={`optimized-image error ${className}`} style={style}>
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span className="error-text">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-image ${isLoaded ? 'loaded' : 'loading'} ${className}`} style={style}>
      {!isLoaded && (
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`image-content ${isLoaded ? 'visible' : 'hidden'}`}
        loading="lazy"
      />
    </div>
  );
};

export default OptimizedImage; 