import React, { useEffect, useRef, CSSProperties } from 'react';

const TwitchBackground: React.FC<{ style?: CSSProperties }> = ({ style }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Request the OBS Virtual Camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        // Optionally handle error (e.g., show fallback background)
        console.error('Could not access OBS Virtual Camera:', err);
      });
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: 0,
        pointerEvents: 'none',
        ...style
      }}
    />
  );
};

export default TwitchBackground;