import React, { useEffect, useRef, useState } from 'react';
import '../../styles/RadarDisplay.css';

interface RadarTarget {
  id: string;
  distance: number; // 0-1 value representing distance from center
  angle: number; // 0-359 degrees
  type: 'friendly' | 'hostile' | 'unknown' | 'target';
  size?: number; // Size of the blip
  label?: string;
}

interface RadarDisplayProps {
  targets?: RadarTarget[];
  range?: number; // Display range in km
  scanSpeed?: number; // Degrees per second
  showGrid?: boolean;
  showCoordinates?: boolean;
  width?: number;
  height?: number;
}

const RadarDisplay: React.FC<RadarDisplayProps> = ({
  targets = [],
  range = 50,
  scanSpeed = 4,
  showGrid = true,
  showCoordinates = true,
  width = 300,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanAngle, setScanAngle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle(prev => (prev + scanSpeed) % 360);
    }, 100);
    
    return () => clearInterval(interval);
  }, [scanSpeed]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 15, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer ring
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw intermediate rings
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (i / 4), 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw cross
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.15)';
      ctx.beginPath();
      for (let angle = 0; angle < 360; angle += 30) {
        const radian = (angle * Math.PI) / 180;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(radian),
          centerY + radius * Math.sin(radian)
        );
      }
      ctx.stroke();
    }
    
    // Draw scan line
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.lineWidth = 2;
    const scanRadian = (scanAngle * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + radius * Math.cos(scanRadian),
      centerY + radius * Math.sin(scanRadian)
    );
    ctx.stroke();
    
    // Draw scan effect
    const gradient = ctx.createConicGradient(scanRadian, centerX, centerY);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, scanRadian - Math.PI / 6, scanRadian);
    ctx.fill();
    
    // Draw targets
    targets.forEach(target => {
      const radian = (target.angle * Math.PI) / 180;
      const distance = target.distance * radius;
      const x = centerX + distance * Math.cos(radian);
      const y = centerY + distance * Math.sin(radian);
      
      // Determine if target is within the scan area
      const scanDiff = Math.abs((scanAngle - target.angle + 360) % 360);
      const isVisible = scanDiff < 30 || scanDiff > 330;
      
      if (!isVisible) return;
      
      const blipSize = target.size || 4;
      
      // Draw different target types
      switch (target.type) {
        case 'friendly':
          ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, blipSize, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'hostile':
          ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
          ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
          ctx.beginPath();
          ctx.moveTo(x, y - blipSize);
          ctx.lineTo(x + blipSize, y + blipSize);
          ctx.lineTo(x - blipSize, y + blipSize);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'unknown':
          ctx.strokeStyle = 'rgba(255, 255, 50, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, blipSize, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case 'target':
          ctx.strokeStyle = 'rgba(255, 150, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(x - blipSize, y - blipSize, blipSize * 2, blipSize * 2);
          ctx.stroke();
          break;
      }
      
      // Draw target label
      if (target.label) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(target.label, x + blipSize + 2, y + 4);
      }
    });
    
        // Draw coordinates
          if (showCoordinates) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
            ctx.font = '10px "Share Tech Mono", monospace';
            
            // Draw range markings
            for (let i = 1; i <= 4; i++) {
              const rangeText = ((range * i) / 4).toFixed(0) + 'km';
              ctx.textAlign = 'left';
              ctx.fillText(rangeText, centerX + 5, centerY - (radius * i / 4) - 5);
            }
          }
        }, [scanAngle, targets, range, showGrid, showCoordinates]);
        
        return (
          <canvas 
            ref={canvasRef} 
            className="radar-display" 
            width={width} 
            height={height}
          />
        );
    };