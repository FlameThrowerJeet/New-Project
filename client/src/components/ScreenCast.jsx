import React, { useEffect, useRef, useState } from 'react';
import './ScreenCast.css';

const ScreenCast = () => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        setIsStreaming(false);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    } catch (err) {
      setError('Error accessing screen share: ' + err.message);
      setIsStreaming(false);
    }
  };

  const stopScreenShare = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className="screen-cast-container">
      <h2>Screen Cast</h2>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="screen-video"
        />
      </div>
      <div className="controls">
        {!isStreaming ? (
          <button onClick={startScreenShare} className="start-btn">
            Start Screen Share
          </button>
        ) : (
          <button onClick={stopScreenShare} className="stop-btn">
            Stop Screen Share
          </button>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ScreenCast; 