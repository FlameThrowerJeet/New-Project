import React from 'react';
import './RotatingGlobe.css';

interface RotatingGlobeProps {
  /** Diameter of the globe in pixels (defaults to 260) */
  size?: number;
  /** Animation duration in seconds for a full rotation (defaults to 24) */
  speed?: number;
}

const RotatingGlobe: React.FC<RotatingGlobeProps> = ({ size = 260, speed = 24 }) => {
  return (
    <div
      className="rotating-globe"
      style={{
        width: size,
        height: size,
        // Pass the speed via inline style to override default CSS variable
        ['--globe-speed' as any]: `${speed}s`,
      }}
    />
  );
};

export default RotatingGlobe; 