import React, { useState, useEffect } from 'react';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  faceCentering?: boolean; // Keep prop for compatibility
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  onLoad,
  onError,
  faceCentering = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [orientation, setOrientation] = useState<number>(1);

  // Function to get image orientation from EXIF data
  const getImageOrientation = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target?.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(1);
          return;
        }
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
          if (view.getUint16(offset + 2, false) <= 8) break;
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) {
            if (view.getUint32(offset + 2, false) !== 0x45786966) {
              resolve(1);
              return;
            }
            const little = view.getUint16(offset + 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + i * 12, little) === 0x0112) {
                resolve(view.getUint16(offset + i * 12 + 8, little));
                return;
              }
            }
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(1);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Function to apply orientation transform
  const getOrientationTransform = (orientation: number): string => {
    switch (orientation) {
      case 2: return 'scaleX(-1)';
      case 3: return 'rotate(180deg)';
      case 4: return 'scaleY(-1)';
      case 5: return 'rotate(90deg) scaleX(-1)';
      case 6: return 'rotate(90deg)';
      case 7: return 'rotate(-90deg) scaleX(-1)';
      case 8: return 'rotate(-90deg)';
      default: return 'none';
    }
  };

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    setOrientation(1);

    // Create a new image object to preload
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = async () => {
      setImageSrc(src);
      setIsLoaded(true);
      
      // Try to get orientation from EXIF data
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        const exifOrientation = await getImageOrientation(file);
        setOrientation(exifOrientation);
      } catch (err) {
        if (img.naturalWidth > img.naturalHeight) {
          setOrientation(1);
        } else {
          setOrientation(6);
        }
      }
      
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

  const imageStyle = {
    ...style,
    transform: getOrientationTransform(orientation),
  };

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
        style={imageStyle}
        loading="lazy"
      />
    </div>
  );
};

export default OptimizedImage; 