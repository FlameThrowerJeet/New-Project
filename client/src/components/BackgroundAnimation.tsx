import React, { useEffect, useRef, useState } from 'react';
import './BackgroundAnimation.css';

interface BackgroundAnimationProps {
  useCamera?: boolean;
  backgroundImages?: string[];
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ 
  useCamera = true, 
  backgroundImages = [] 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  
  // OBS Virtual Camera setup
  useEffect(() => {
    if (!useCamera) return;
    
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsVideoAvailable(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setIsVideoAvailable(false);
      }
    }
    
    setupCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [useCamera]);
  
  // Background image slideshow
  useEffect(() => {
    if (useCamera || backgroundImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 8000); // Change image every 8 seconds
    
    return () => clearInterval(interval);
  }, [useCamera, backgroundImages]);

  return (
    <div className="background-animation">
      {/* OBS Virtual Camera */}
      {useCamera && (
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`camera-background ${isVideoAvailable ? 'active' : ''}`}
        />
      )}
      
      {/* Image slideshow background */}
      {!useCamera && backgroundImages.length > 0 && (
        <div className="bg-container">
          {backgroundImages.map((img, index) => (
            <div 
              key={index}
              className={`bg-slide ${index === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
      )}
      
      {/* Visual effects that work with both camera and images */}
      <div className="bg-overlay"></div>
      <div className="bg-scanlines"></div>
      <div className="bg-grid"></div>
    </div>
  );
};

export default BackgroundAnimation;