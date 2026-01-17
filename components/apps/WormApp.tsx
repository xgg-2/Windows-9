import React, { useState, useEffect, useRef, useCallback } from 'react';

// Game Constants
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

interface Point {
  x: number;
  y: number;
}

const WormApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 }); // Moving right
  const [nextDirection, setNextDirection] = useState<Point>({ x: 1, y: 0 }); // Prevent 180 turns in one tick
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover' | 'paused'>('idle');
  const [highScore, setHighScore] = useState(0);
  
  // Game Loop Ref to clear interval
  const gameLoopRef = useRef<number | null>(null);

  const spawnFood = useCallback((currentSnake: Point[]) => {
      // Basic logic to spawn food not on snake
      // In a real grid (e.g. 20x20 => 0-19)
      // We assume canvas size is roughly fixed, let's say 400x340 roughly.
      // 400 / 20 = 20 cols. 340 / 20 = 17 rows.
      const cols = 19; 
      const rows = 16;
      
      let newFood;
      let valid = false;
      while(!valid) {
          newFood = {
              x: Math.floor(Math.random() * cols),
              y: Math.floor(Math.random() * rows)
          };
          // eslint-disable-next-line no-loop-func
          valid = !currentSnake.some(s => s.x === newFood?.x && s.y === newFood?.y);
      }
      setFood(newFood!);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
    setDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setScore(0);
    setStatus('playing');
    spawnFood([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
    if (containerRef.current) containerRef.current.focus();
  };

  const gameOver = () => {
      setStatus('gameover');
      if (score > highScore) setHighScore(score);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  // Keyboard Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Only control if game is playing or focused
        if (status !== 'playing' && status !== 'paused' && status !== 'idle') return;
        
        // Prevent default scrolling for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === ' ' && status === 'playing') {
             setStatus('paused');
             return;
        }
        if (e.key === ' ' && status === 'paused') {
             setStatus('playing');
             return;
        }
        
        if (status !== 'playing') return;

        switch(e.key) {
            case 'ArrowUp':
                if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
                break;
        }
    };

    const container = containerRef.current;
    if (container) {
        container.addEventListener('keydown', handleKeyDown);
    }
    return () => {
        if (container) container.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, status]);

  // Game Loop
  useEffect(() => {
      if (status !== 'playing') {
          if (gameLoopRef.current) clearInterval(gameLoopRef.current);
          return;
      }

      const moveSnake = () => {
          setDirection(nextDirection);
          
          setSnake(prevSnake => {
              const head = prevSnake[0];
              const newHead = { x: head.x + nextDirection.x, y: head.y + nextDirection.y };

              // Check Wall Collision
              const cols = 19; // Canvas width 380 / 20
              const rows = 16; // Canvas height 320 / 20
              
              if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
                  gameOver();
                  return prevSnake;
              }

              // Check Self Collision
              if (prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
                  gameOver();
                  return prevSnake;
              }

              const newSnake = [newHead, ...prevSnake];

              // Check Food Collision
              if (newHead.x === food.x && newHead.y === food.y) {
                  setScore(s => s + 10);
                  spawnFood(newSnake);
                  // Don't pop tail, snake grows
              } else {
                  newSnake.pop();
              }

              return newSnake;
          });
      };

      const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 5);
      gameLoopRef.current = window.setInterval(moveSnake, speed);

      return () => {
          if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
  }, [status, nextDirection, food, score, spawnFood]);

  // Rendering
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear Canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid (Optional, makes it look more retro)
      ctx.strokeStyle = '#f0f0f0';
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Draw Food
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
      // Food highlight
      ctx.fillStyle = '#ffaaaa';
      ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, 4, 4);

      // Draw Snake
      snake.forEach((segment, i) => {
          ctx.fillStyle = i === 0 ? '#006400' : '#008000'; // Dark green head
          ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
      });

  }, [snake, food]);

  return (
    <div 
        ref={containerRef}
        className="flex flex-col h-full bg-[#c0c0c0] select-none font-sans"
        tabIndex={0}
        style={{ outline: 'none' }}
    >
        {/* Menu Bar */}
        <div className="flex px-1 pt-1 mb-1 text-sm bg-[#c0c0c0]">
            <div className="px-2 cursor-pointer hover:bg-blue-800 hover:text-white" onClick={() => setStatus('idle')}>Game</div>
            <div className="px-2 cursor-pointer hover:bg-blue-800 hover:text-white">Help</div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 p-2 flex flex-col items-center justify-center border-t border-white shadow-[inset_1px_1px_0px_#808080]">
            <div className="relative border-2 border-[#808080] border-r-white border-b-white bg-white">
                <canvas 
                    ref={canvasRef} 
                    width={380} 
                    height={320} 
                    className="block"
                />
                
                {/* Overlays */}
                {status === 'idle' && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                        <div className="text-2xl font-bold mb-4 drop-shadow-md text-green-400">WORM.EXE</div>
                        <button 
                            className="px-4 py-2 bg-[#c0c0c0] text-black border-2 border-white border-r-gray-600 border-b-gray-600 active:border-gray-600 active:border-r-white active:border-b-white active:translate-y-px text-sm font-bold"
                            onClick={resetGame}
                        >
                            Start Game
                        </button>
                        <div className="mt-4 text-xs text-gray-200">Use Arrow Keys to Move</div>
                    </div>
                )}
                
                {status === 'gameover' && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                        <div className="text-xl font-bold mb-2 text-red-500 bg-black px-2">GAME OVER</div>
                        <div className="mb-4">Score: {score}</div>
                        <button 
                            className="px-4 py-1 bg-[#c0c0c0] text-black border-2 border-white border-r-gray-600 border-b-gray-600 active:border-gray-600 active:border-r-white active:border-b-white active:translate-y-px text-sm"
                            onClick={resetGame}
                        >
                            Play Again
                        </button>
                    </div>
                )}
                
                {status === 'paused' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-600 border-b-gray-600 p-4 shadow-xl">
                             <div className="text-center font-bold mb-2">PAUSED</div>
                             <div className="text-xs text-center">Press Space to Resume</div>
                         </div>
                     </div>
                )}
            </div>
        </div>

        {/* Status Bar */}
        <div className="h-6 border-t border-gray-400 flex items-center justify-between px-2 text-xs bg-[#c0c0c0] shadow-[inset_0_1px_0_white]">
            <div>Score: {score}</div>
            <div>High Score: {highScore}</div>
        </div>
    </div>
  );
};

export default WormApp;