import React, { useEffect, useRef } from 'react';

interface TerrainMapProps {
  lat?: number;
  lon?: number;
}

// Map of border regions to terrain types
const terrainRegions = [
  { name: 'Srinagar', type: 'mountain', lat: 34.08, lon: 74.79 },
  { name: 'Leh', type: 'mountain', lat: 34.16, lon: 77.58 },
  { name: 'Tawang', type: 'mountain', lat: 27.58, lon: 91.86 },
  { name: 'Gangtok', type: 'mountain', lat: 27.33, lon: 88.62 },
  { name: 'Darjeeling', type: 'mountain', lat: 27.04, lon: 88.26 },
  { name: 'Imphal', type: 'forest', lat: 24.82, lon: 93.95 },
  { name: 'Aizawl', type: 'forest', lat: 23.73, lon: 92.72 },
  { name: 'Kolkata', type: 'plain', lat: 22.57, lon: 88.36 },
  { name: 'Sundarbans', type: 'marsh', lat: 21.94, lon: 89.18 },
  { name: 'Chennai', type: 'beach', lat: 13.08, lon: 80.27 },
  { name: 'Kochi', type: 'beach', lat: 9.93, lon: 76.26 },
  { name: 'Mumbai', type: 'coast', lat: 19.08, lon: 72.88 },
  { name: 'Jaisalmer', type: 'desert', lat: 26.91, lon: 70.91 },
  { name: 'Amritsar', type: 'plain', lat: 31.63, lon: 74.87 },
  { name: 'Srinagar', type: 'mountain', lat: 34.08, lon: 74.79 }
];

const BG_COLOR = '#101a10';
const GRID_COLOR = '#0f0';
const HIGHLIGHT_COLOR = '#00ffcc';

function getTerrainType(lat: number, lon: number) {
  // Find nearest region
  let minDist = Infinity;
  let terrain = 'plain';
  for (const region of terrainRegions) {
    const d = Math.sqrt((region.lat - lat) ** 2 + (region.lon - lon) ** 2);
    if (d < minDist) {
      minDist = d;
      terrain = region.type;
    }
  }
  return terrain;
}

const TerrainMap: React.FC<TerrainMapProps> = ({ lat = 20, lon = 77 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTerrain = useRef('plain');
  const transition = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrame: number;
    let t = 0;
    let prevTerrain = lastTerrain.current;
    let currTerrain = getTerrainType(lat, lon);
    if (prevTerrain !== currTerrain) {
      transition.current = 0;
      lastTerrain.current = currTerrain;
    }

    function getBgColor(terrain: string) {
      switch (terrain) {
        case 'mountain': return 'linear-gradient(to top, #0a2a0a 80%, #1a3f1a 100%)';
        case 'desert': return 'linear-gradient(to top, #2a2a0a 80%, #bbaa44 100%)';
        case 'plain': return 'linear-gradient(to top, #0a2a0a 80%, #3fa13f 100%)';
        case 'forest': return 'linear-gradient(to top, #0a2a0a 80%, #0f4 100%)';
        case 'marsh': return 'linear-gradient(to top, #0a2a2a 80%, #0ff 100%)';
        case 'beach':
        case 'coast': return 'linear-gradient(to top, #0a2a2a 80%, #0ff 100%)';
        default: return BG_COLOR;
      }
    }

    function drawTerrain(terrain: string, alpha = 1) {
      if (!ctx || !canvas) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      // Fill background with color/gradient
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      if (terrain === 'mountain') {
        grad.addColorStop(0, '#0a2a0a');
        grad.addColorStop(1, '#1a3f1a');
      } else if (terrain === 'desert') {
        grad.addColorStop(0, '#2a2a0a');
        grad.addColorStop(1, '#bbaa44');
      } else if (terrain === 'plain') {
        grad.addColorStop(0, '#0a2a0a');
        grad.addColorStop(1, '#3fa13f');
      } else if (terrain === 'forest') {
        grad.addColorStop(0, '#0a2a0a');
        grad.addColorStop(1, '#0f4');
      } else if (terrain === 'marsh' || terrain === 'beach' || terrain === 'coast') {
        grad.addColorStop(0, '#0a2a2a');
        grad.addColorStop(1, '#0ff');
      } else {
        grad.addColorStop(0, BG_COLOR);
        grad.addColorStop(1, BG_COLOR);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Perspective grid (3D effect)
      for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = GRID_COLOR;
        ctx.globalAlpha = 0.15 + 0.15 * Math.sin(t + i);
        ctx.beginPath();
        const y = canvas.height - (canvas.height / 20) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let i = 0; i < 12; i++) {
        ctx.strokeStyle = GRID_COLOR;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        const x = (canvas.width / 12) * i;
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(canvas.width / 2 + (x - canvas.width / 2) * 0.2, 0);
        ctx.stroke();
      }
      ctx.globalAlpha = alpha;
      // Dramatic, animated terrain features
      if (terrain === 'mountain') {
        // Sharp, jagged green peaks
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = '#0f0';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height - 120 - 80 * Math.abs(Math.sin((x / 60) + t * 0.7 + i)) + 60 * Math.sin(t + i) + (i * 30);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (terrain === 'desert') {
        // Wavy, yellow dunes
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = '#ff0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height - 60 - 30 * Math.abs(Math.sin((x / 40) + t * 0.5 + i)) + (i * 20);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (terrain === 'plain') {
        // Rolling, smooth green hills
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = '#0f0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height - 40 - 20 * Math.sin((x / 80) + t * 0.6 + i) + (i * 10);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (terrain === 'forest') {
        // Vertical green lines and circles for trees
        for (let i = 0; i < 8; i++) {
          const baseY = canvas.height - 60 - (i * 25) + 10 * Math.sin(t + i);
          for (let j = 0; j < 10; j++) {
            const x = (canvas.width / 10) * j + 10 * Math.sin(t + i + j);
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY - 30 - 10 * Math.sin(t + i + j));
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, baseY - 30 - 10 * Math.sin(t + i + j), 10 + 2 * Math.sin(t + i + j), 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
      } else if (terrain === 'marsh') {
        // Flat, blue wavy lines
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = '#0ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height - 30 - 10 * Math.sin((x / 30) + t * 0.8 + i) + (i * 8);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (terrain === 'beach' || terrain === 'coast') {
        // Flat, blue wavy lines
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = '#0ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height - 20 - 8 * Math.sin((x / 30) + t * 1.2 + i) + (i * 8);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawLabel(terrain: string) {
      if (!ctx || !canvas) return;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.font = 'bold 22px monospace';
      let color = '#0f0';
      if (terrain === 'desert') color = '#ff0';
      if (terrain === 'marsh' || terrain === 'beach' || terrain === 'coast') color = '#0ff';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(terrain.toUpperCase(), canvas.width / 2, 32);
      ctx.restore();
    }

    function draw() {
      if (!ctx || !canvas) return;
      t += 0.03;
      // Animate transition between terrains
      const prev = prevTerrain;
      const curr = getTerrainType(lat, lon);
      if (prev !== curr && transition.current < 1) {
        transition.current += 0.02;
        drawTerrain(prev, 1 - transition.current);
        drawTerrain(curr, transition.current);
        drawLabel(curr);
      } else {
        drawTerrain(curr, 1);
        drawLabel(curr);
        lastTerrain.current = curr;
      }
      // Draw cockpit/jet (first-person, bottom center)
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(canvas.width / 2, canvas.height - 40);
      ctx.rotate(Math.sin(t) * 0.05);
      ctx.strokeStyle = HIGHLIGHT_COLOR;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -40);
      ctx.moveTo(-10, 0);
      ctx.lineTo(0, -20);
      ctx.lineTo(10, 0);
      ctx.moveTo(-6, -25);
      ctx.lineTo(6, -25);
      ctx.stroke();
      ctx.restore();
      animationFrame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [lat, lon]);

  return (
    <div style={{ width: '100%', height: '100%', background: BG_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} width={400} height={400} style={{ width: '100%', height: '100%', background: BG_COLOR, borderRadius: 8, boxShadow: '0 0 24px #0f08' }} />
    </div>
  );
};

export default TerrainMap;