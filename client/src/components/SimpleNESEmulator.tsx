import React, { useEffect, useRef, useState } from 'react';

interface GameState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  gameOver: boolean;
}

interface PlatformerState {
  player: { x: number; y: number; velocityY: number; onGround: boolean };
  platforms: { x: number; y: number; width: number }[];
  enemies: { x: number; y: number; direction: number }[];
  score: number;
  gameOver: boolean;
}

interface SimpleNESEmulatorProps {
  gameType: 'snake' | 'platformer';
  onBack: () => void;
}

const SimpleNESEmulator: React.FC<SimpleNESEmulatorProps> = ({ gameType, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const animationRef = useRef<number>();

  // Initialize game state based on game type
  useEffect(() => {
    if (gameType === 'snake') {
      setGameState({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        direction: 'right',
        score: 0,
        gameOver: false
      });
    } else if (gameType === 'platformer') {
      setGameState({
        player: { x: 50, y: 200, velocityY: 0, onGround: false },
        platforms: [
          { x: 0, y: 250, width: 100 },
          { x: 150, y: 200, width: 80 },
          { x: 300, y: 150, width: 100 },
          { x: 450, y: 100, width: 80 }
        ],
        enemies: [
          { x: 200, y: 230, direction: 1 },
          { x: 350, y: 130, direction: -1 }
        ],
        score: 0,
        gameOver: false
      });
    }
    setIsRunning(true);
  }, [gameType]);

  // Game loop
  useEffect(() => {
    if (!isRunning || isPaused || !gameState) return;

    const gameLoop = () => {
      if (gameType === 'snake') {
        updateSnake();
      } else if (gameType === 'platformer') {
        updatePlatformer();
      }
      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, isPaused, gameState, gameType]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key === 'Escape') {
        onBack();
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(!isPaused);
        return;
      }

      if (isPaused) return;

      if (gameType === 'snake') {
        handleSnakeInput(e.key);
      } else if (gameType === 'platformer') {
        handlePlatformerInput(e.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameState, gameType, onBack]);

  const handleSnakeInput = (key: string) => {
    if (!gameState) return;

    let newDirection = gameState.direction;
    switch (key) {
      case 'ArrowUp':
        if (gameState.direction !== 'down') newDirection = 'up';
        break;
      case 'ArrowDown':
        if (gameState.direction !== 'up') newDirection = 'down';
        break;
      case 'ArrowLeft':
        if (gameState.direction !== 'right') newDirection = 'left';
        break;
      case 'ArrowRight':
        if (gameState.direction !== 'left') newDirection = 'right';
        break;
    }

    setGameState({ ...gameState, direction: newDirection });
  };

  const handlePlatformerInput = (key: string) => {
    if (!gameState) return;

    const player = { ...gameState.player };
    
    switch (key) {
      case 'ArrowLeft':
        player.x -= 5;
        break;
      case 'ArrowRight':
        player.x += 5;
        break;
      case ' ':
      case 'ArrowUp':
        if (player.onGround) {
          player.velocityY = -12;
          player.onGround = false;
        }
        break;
    }

    setGameState({ ...gameState, player });
  };

  const updateSnake = () => {
    if (!gameState || gameState.gameOver) return;

    const newSnake = [...gameState.snake];
    const head = { ...newSnake[0] };

    // Move head
    switch (gameState.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    // Check collision with walls
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 15) {
      setGameState({ ...gameState, gameOver: true });
      return;
    }

    // Check collision with self
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameState({ ...gameState, gameOver: true });
      return;
    }

    newSnake.unshift(head);

    // Check if food eaten
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
      // Generate new food
      const newFood = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 15)
      };
      setGameState({
        ...gameState,
        snake: newSnake,
        food: newFood,
        score: gameState.score + 10
      });
    } else {
      newSnake.pop();
      setGameState({ ...gameState, snake: newSnake });
    }
  };

  const updatePlatformer = () => {
    if (!gameState || gameState.gameOver) return;

    const player = { ...gameState.player };
    const enemies = [...gameState.enemies];

    // Apply gravity
    player.velocityY += 0.8;
    player.y += player.velocityY;

    // Check platform collisions
    player.onGround = false;
    for (const platform of gameState.platforms) {
      if (player.x + 20 > platform.x && 
          player.x < platform.x + platform.width &&
          player.y + 20 >= platform.y && 
          player.y < platform.y + 20) {
        player.y = platform.y - 20;
        player.velocityY = 0;
        player.onGround = true;
        break;
      }
    }

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x > 580) player.x = 580;
    if (player.y > 280) {
      setGameState({ ...gameState, gameOver: true });
      return;
    }

    // Update enemies
    enemies.forEach(enemy => {
      enemy.x += enemy.direction * 2;
      if (enemy.x < 0 || enemy.x > 580) {
        enemy.direction *= -1;
      }
    });

    // Check enemy collisions
    for (const enemy of enemies) {
      if (player.x < enemy.x + 20 &&
          player.x + 20 > enemy.x &&
          player.y < enemy.y + 20 &&
          player.y + 20 > enemy.y) {
        setGameState({ ...gameState, gameOver: true });
        return;
      }
    }

    setGameState({ ...gameState, player, enemies });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameType === 'snake') {
      drawSnake(ctx);
    } else if (gameType === 'platformer') {
      drawPlatformer(ctx);
    }

    // Draw UI
    drawUI(ctx);
  };

  const drawSnake = (ctx: CanvasRenderingContext2D) => {
    // Draw snake
    ctx.fillStyle = '#00ff00';
    gameState.snake.forEach((segment: { x: number; y: number }) => {
      ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    });

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(gameState.food.x * 20, gameState.food.y * 20, 18, 18);
  };

  const drawPlatformer = (ctx: CanvasRenderingContext2D) => {
    // Draw platforms
    ctx.fillStyle = '#00ff00';
    gameState.platforms.forEach((platform: { x: number; y: number; width: number }) => {
      ctx.fillRect(platform.x, platform.y, platform.width, 10);
    });

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(gameState.player.x, gameState.player.y, 20, 20);

    // Draw enemies
    ctx.fillStyle = '#ff0000';
    gameState.enemies.forEach((enemy: { x: number; y: number; direction: number }) => {
      ctx.fillRect(enemy.x, enemy.y, 20, 20);
    });
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`Score: ${gameState.score}`, 10, 30);

    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, 600, 300);
      
      ctx.fillStyle = '#ff0000';
      ctx.font = '24px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 300, 120);
      ctx.fillText(`Final Score: ${gameState.score}`, 300, 160);
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText('Press ESC to return', 300, 200);
      ctx.textAlign = 'left';
    }

    if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, 600, 300);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '24px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', 300, 150);
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText('Press P to resume', 300, 180);
      ctx.textAlign = 'left';
    }
  };

  const resetGame = () => {
    if (gameType === 'snake') {
      setGameState({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        direction: 'right',
        score: 0,
        gameOver: false
      });
    } else if (gameType === 'platformer') {
      setGameState({
        player: { x: 50, y: 200, velocityY: 0, onGround: false },
        platforms: [
          { x: 0, y: 250, width: 100 },
          { x: 150, y: 200, width: 80 },
          { x: 300, y: 150, width: 100 },
          { x: 450, y: 100, width: 80 }
        ],
        enemies: [
          { x: 200, y: 230, direction: 1 },
          { x: 350, y: 130, direction: -1 }
        ],
        score: 0,
        gameOver: false
      });
    }
  };

  return (
    <div className="emulator-container">
      <div className="emulator-controls">
        <button className="control-button" onClick={onBack}>
          ← Back
        </button>
        <button className="control-button" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        <button className="control-button" onClick={resetGame}>
          🔄 Reset
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="nes-canvas"
        tabIndex={0}
      />

      <div className="emulator-info">
        <div className="game-info">
          <h3>{gameType === 'snake' ? 'Snake Classic' : 'Platform Adventure'}</h3>
          <p>
            {gameType === 'snake' 
              ? 'Eat the red food to grow and survive!' 
              : 'Jump on platforms and avoid the red enemies!'}
          </p>
          <div className="game-meta">
            <span>Type: {gameType === 'snake' ? 'Arcade' : 'Platformer'}</span>
            <span>Year: 1985</span>
            <span>Publisher: Retro Games</span>
          </div>
        </div>

        <div className="controls-info">
          <h4>Controls</h4>
          <div className="controls-grid">
            <div className="control-item">
              <span className="control-key">↑↓←→</span>
              <span className="control-label">Move</span>
            </div>
            <div className="control-item">
              <span className="control-key">Space</span>
              <span className="control-label">Jump</span>
            </div>
            <div className="control-item">
              <span className="control-key">P</span>
              <span className="control-label">Pause</span>
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

export default SimpleNESEmulator; 