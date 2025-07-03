import React, { useEffect, useRef, useState } from 'react';
import jsNES from 'jsnes';

interface NESGame {
  id: string;
  name: string;
  year: number;
  category: string;
  description: string;
  publisher: string;
  romUrl: string;
  size: string;
}

interface RealNESEmulatorProps {
  selectedGame: NESGame | null;
  onBack: () => void;
}

const RealNESEmulator: React.FC<RealNESEmulatorProps> = ({ selectedGame, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nesRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(0);

  // Initialize NES emulator
  useEffect(() => {
    if (!canvasRef.current) return;

    const nes = new jsNES({
      onFrame: (frameBuffer: number[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.createImageData(256, 240);
        const data = imageData.data;

        for (let i = 0; i < frameBuffer.length; i++) {
          const pixel = frameBuffer[i];
          const dataIndex = i * 4;
          
          // Convert 16-bit RGB to RGBA
          data[dataIndex] = (pixel >> 11) << 3;     // Red
          data[dataIndex + 1] = ((pixel >> 5) & 0x3F) << 2; // Green
          data[dataIndex + 2] = (pixel & 0x1F) << 3;        // Blue
          data[dataIndex + 3] = 255;                         // Alpha
        }

        ctx.putImageData(imageData, 0, 0);
      },
      onAudioSample: (left: number, right: number) => {
        // Audio handling would go here
        // For now, we'll skip audio to keep it simple
      }
    });

    nesRef.current = nes;

    return () => {
      if (nesRef.current) {
        nesRef.current.stop();
      }
    };
  }, []);

  // Load ROM when game is selected
  useEffect(() => {
    if (!selectedGame || !nesRef.current) return;

    const loadROM = async () => {
      setIsLoading(true);
      setError(null);
      setIsRunning(false);

      try {
        const response = await fetch(selectedGame.romUrl);
        if (!response.ok) {
          throw new Error(`Failed to load ROM: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const romData = new Uint8Array(arrayBuffer);

        nesRef.current.loadROM(romData);
        setIsRunning(true);
        setIsLoading(false);
        
        // Start the emulator
        nesRef.current.start();
        
        // Start the game loop
        startGameLoop();
      } catch (err) {
        console.error('Error loading ROM:', err);
        setError(err instanceof Error ? err.message : 'Failed to load ROM');
        setIsLoading(false);
      }
    };

    loadROM();
  }, [selectedGame]);

  const startGameLoop = () => {
    const gameLoop = (currentTime: number) => {
      if (!nesRef.current || !isRunning || isPaused) return;

      if (lastTime === 0) {
        setLastTime(currentTime);
      }

      const deltaTime = currentTime - lastTime;
      const targetFrameTime = 1000 / fps;

      if (deltaTime >= targetFrameTime) {
        nesRef.current.frame();
        setFrameCount(prev => prev + 1);
        setLastTime(currentTime);
      }

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (!nesRef.current || !isRunning) return;

      switch (e.key) {
        case 'Escape':
          onBack();
          break;
        case 'p':
        case 'P':
          setIsPaused(!isPaused);
          break;
        case 'r':
        case 'R':
          if (nesRef.current) {
            nesRef.current.reset();
          }
          break;
        case 'ArrowUp':
          nesRef.current.buttonDown(1, jsNES.BUTTON_UP);
          break;
        case 'ArrowDown':
          nesRef.current.buttonDown(1, jsNES.BUTTON_DOWN);
          break;
        case 'ArrowLeft':
          nesRef.current.buttonDown(1, jsNES.BUTTON_LEFT);
          break;
        case 'ArrowRight':
          nesRef.current.buttonDown(1, jsNES.BUTTON_RIGHT);
          break;
        case 'a':
        case 'A':
          nesRef.current.buttonDown(1, jsNES.BUTTON_A);
          break;
        case 's':
        case 'S':
          nesRef.current.buttonDown(1, jsNES.BUTTON_B);
          break;
        case 'Enter':
          nesRef.current.buttonDown(1, jsNES.BUTTON_START);
          break;
        case 'Shift':
          nesRef.current.buttonDown(1, jsNES.BUTTON_SELECT);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (!nesRef.current || !isRunning) return;

      switch (e.key) {
        case 'ArrowUp':
          nesRef.current.buttonUp(1, jsNES.BUTTON_UP);
          break;
        case 'ArrowDown':
          nesRef.current.buttonDown(1, jsNES.BUTTON_DOWN);
          break;
        case 'ArrowLeft':
          nesRef.current.buttonUp(1, jsNES.BUTTON_LEFT);
          break;
        case 'ArrowRight':
          nesRef.current.buttonUp(1, jsNES.BUTTON_RIGHT);
          break;
        case 'a':
        case 'A':
          nesRef.current.buttonUp(1, jsNES.BUTTON_A);
          break;
        case 's':
        case 'S':
          nesRef.current.buttonUp(1, jsNES.BUTTON_B);
          break;
        case 'Enter':
          nesRef.current.buttonUp(1, jsNES.BUTTON_START);
          break;
        case 'Shift':
          nesRef.current.buttonUp(1, jsNES.BUTTON_SELECT);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRunning, isPaused, onBack]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    if (nesRef.current) {
      nesRef.current.reset();
    }
  };

  const handleSaveState = () => {
    if (nesRef.current) {
      const state = nesRef.current.toJSON();
      localStorage.setItem(`nes_save_${selectedGame?.id}`, JSON.stringify(state));
      alert('Game state saved!');
    }
  };

  const handleLoadState = () => {
    if (nesRef.current && selectedGame) {
      const savedState = localStorage.getItem(`nes_save_${selectedGame.id}`);
      if (savedState) {
        const state = JSON.parse(savedState);
        nesRef.current.fromJSON(state);
        alert('Game state loaded!');
      } else {
        alert('No saved state found!');
      }
    }
  };

  return (
    <div className="emulator-container">
      <div className="emulator-controls">
        <button className="control-button" onClick={onBack}>
          ← Back
        </button>
        <button className="control-button" onClick={handlePause}>
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        <button className="control-button" onClick={handleReset}>
          🔄 Reset
        </button>
        <button className="control-button" onClick={handleSaveState}>
          💾 Save
        </button>
        <button className="control-button" onClick={handleLoadState}>
          📂 Load
        </button>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={256}
          height={240}
          className="nes-canvas"
          tabIndex={0}
        />
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading {selectedGame?.name}...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <p>❌ {error}</p>
            <button onClick={onBack}>Go Back</button>
          </div>
        )}

        {isPaused && (
          <div className="pause-overlay">
            <p>⏸️ PAUSED</p>
            <p>Press P to resume</p>
          </div>
        )}
      </div>

      <div className="emulator-info">
        <div className="game-info">
          <h3>{selectedGame?.name}</h3>
          <p>{selectedGame?.description}</p>
          <div className="game-meta">
            <span>Year: {selectedGame?.year}</span>
            <span>Publisher: {selectedGame?.publisher}</span>
            <span>Size: {selectedGame?.size}</span>
            <span>FPS: {fps}</span>
          </div>
        </div>

        <div className="controls-info">
          <h4>NES Controls</h4>
          <div className="controls-grid">
            <div className="control-item">
              <span className="control-key">↑↓←→</span>
              <span className="control-label">D-Pad</span>
            </div>
            <div className="control-item">
              <span className="control-key">A</span>
              <span className="control-label">A Button</span>
            </div>
            <div className="control-item">
              <span className="control-key">S</span>
              <span className="control-label">B Button</span>
            </div>
            <div className="control-item">
              <span className="control-key">Enter</span>
              <span className="control-label">Start</span>
            </div>
            <div className="control-item">
              <span className="control-key">Shift</span>
              <span className="control-label">Select</span>
            </div>
            <div className="control-item">
              <span className="control-key">P</span>
              <span className="control-label">Pause</span>
            </div>
            <div className="control-item">
              <span className="control-key">R</span>
              <span className="control-label">Reset</span>
            </div>
            <div className="control-item">
              <span className="control-key">Esc</span>
              <span className="control-label">Back</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealNESEmulator; 