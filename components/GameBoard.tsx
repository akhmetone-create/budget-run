import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LEVEL_MAP, COLORS, TILE_SIZE, INITIAL_PLAYER_POS, GHOST_HOUSE_POS } from '../constants';
import { Entity, Ghost, Direction, Position, GameState, Difficulty } from '../types';

interface GameBoardProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onWin: () => void;
  difficulty: Difficulty;
}

// Helper to check wall collisions
const isWall = (x: number, y: number) => {
  const row = Math.floor(y);
  const col = Math.floor(x);
  if (row < 0 || row >= LEVEL_MAP.length || col < 0 || col >= LEVEL_MAP[0].length) return true;
  return LEVEL_MAP[row][col] === 1;
};

export const GameBoard: React.FC<GameBoardProps> = ({ onGameOver, onScoreUpdate, onWin, difficulty }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

  // Time tracking for speed increase
  const startTimeRef = useRef<number | null>(null);
  const speedMultiplierRef = useRef<number>(1);

  // Game State Refs
  const playerRef = useRef<Entity>({
    pos: { ...INITIAL_PLAYER_POS },
    dir: Direction.NONE,
    nextDir: Direction.NONE,
    speed: 0.03, // Base speed (slowed down 5x from original 0.15)
    color: COLORS.MARKETER_SKIN
  });

  // Initialize Ghosts
  const ghostsRef = useRef<Ghost[]>([
    { id: 0, type: 'CFO', pos: { x: 9, y: 9 }, dir: Direction.LEFT, nextDir: Direction.LEFT, speed: 0.02, color: COLORS.TIE_RED, scatterTarget: {x: 20, y: 0}, mode: 'SCATTER' },
    { id: 1, type: 'AUDITOR', pos: { x: 10, y: 9 }, dir: Direction.UP, nextDir: Direction.UP, speed: 0.018, color: COLORS.TIE_BLUE, scatterTarget: {x: 1, y: 0}, mode: 'SCATTER' },
    { id: 2, type: 'TAX', pos: { x: 11, y: 9 }, dir: Direction.RIGHT, nextDir: Direction.RIGHT, speed: 0.016, color: COLORS.TIE_GREEN, scatterTarget: {x: 20, y: 20}, mode: 'SCATTER' },
    { id: 3, type: 'COMPLIANCE', pos: { x: 10, y: 10 }, dir: Direction.DOWN, nextDir: Direction.DOWN, speed: 0.014, color: COLORS.TIE_PURPLE, scatterTarget: {x: 0, y: 20}, mode: 'SCATTER' },
  ]);

  const pelletsRef = useRef<number[][]>(LEVEL_MAP.map(row => [...row]));
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const powerModeTimerRef = useRef(0);

  // Helper to calculate ghost speed based on identity, difficulty, and multiplier
  const getGhostSpeed = (ghost: Ghost, multiplier: number) => {
    if (ghost.mode === 'FRIGHTENED') {
        return 0.01 * multiplier; // Frightened speed scales too
    }
    
    let diffMult = 1;
    if (difficulty === Difficulty.EASY) diffMult = 0.8;
    if (difficulty === Difficulty.HARD) diffMult = 1.3;

    // Base calculation: ((0.08 + (id * 0.01)) / 5) * diffMult * multiplier
    return ((0.08 + (ghost.id * 0.01)) / 5) * diffMult * multiplier;
  };

  // Initial difficulty setup
  useEffect(() => {
    ghostsRef.current.forEach(g => {
        g.speed = getGhostSpeed(g, 1);
    });
  }, [difficulty]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': playerRef.current.nextDir = Direction.UP; break;
        case 'ArrowDown': playerRef.current.nextDir = Direction.DOWN; break;
        case 'ArrowLeft': playerRef.current.nextDir = Direction.LEFT; break;
        case 'ArrowRight': playerRef.current.nextDir = Direction.RIGHT; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch Controls
  const handleTouchStart = (e: React.TouchEvent) => {
    // e.preventDefault(); // Passive listeners are default in React 18, so we rely on CSS touch-action: none
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStart.x;
    const diffY = endY - touchStart.y;
    
    // Minimum swipe distance to avoid accidental direction changes on taps
    const minSwipeDistance = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > minSwipeDistance) {
        playerRef.current.nextDir = diffX > 0 ? Direction.RIGHT : Direction.LEFT;
      }
    } else {
      if (Math.abs(diffY) > minSwipeDistance) {
        playerRef.current.nextDir = diffY > 0 ? Direction.DOWN : Direction.UP;
      }
    }
    setTouchStart(null);
  };

  // Movement Logic
  const canMove = (x: number, y: number, dir: Direction) => {
    const tolerance = 0.1;
    const intX = Math.round(x);
    const intY = Math.round(y);
    
    if (Math.abs(x - intX) > tolerance || Math.abs(y - intY) > tolerance) {
        if (dir === Direction.UP || dir === Direction.DOWN) return Math.abs(x - intX) < tolerance;
        if (dir === Direction.LEFT || dir === Direction.RIGHT) return Math.abs(y - intY) < tolerance;
        return false;
    }

    let nextX = intX;
    let nextY = intY;

    if (dir === Direction.UP) nextY--;
    if (dir === Direction.DOWN) nextY++;
    if (dir === Direction.LEFT) nextX--;
    if (dir === Direction.RIGHT) nextX++;

    return !isWall(nextX, nextY);
  };

  const moveEntity = (entity: Entity) => {
    if (entity.nextDir !== Direction.NONE && canMove(entity.pos.x, entity.pos.y, entity.nextDir)) {
      entity.dir = entity.nextDir;
      entity.nextDir = Direction.NONE;
      entity.pos.x = Math.round(entity.pos.x);
      entity.pos.y = Math.round(entity.pos.y);
    }

    if (canMove(entity.pos.x, entity.pos.y, entity.dir)) {
      if (entity.dir === Direction.UP) entity.pos.y -= entity.speed;
      if (entity.dir === Direction.DOWN) entity.pos.y += entity.speed;
      if (entity.dir === Direction.LEFT) entity.pos.x -= entity.speed;
      if (entity.dir === Direction.RIGHT) entity.pos.x += entity.speed;
      
      if (entity.pos.x < 0) entity.pos.x = LEVEL_MAP[0].length - 1;
      if (entity.pos.x >= LEVEL_MAP[0].length) entity.pos.x = 0;
    }
  };

  const getTargetPos = (ghost: Ghost) => {
    if (ghost.mode === 'SCATTER' || ghost.mode === 'FRIGHTENED') return ghost.scatterTarget;
    return playerRef.current.pos;
  };

  const moveGhost = (ghost: Ghost) => {
    const x = Math.round(ghost.pos.x);
    const y = Math.round(ghost.pos.y);
    
    if (Math.abs(ghost.pos.x - x) < 0.1 && Math.abs(ghost.pos.y - y) < 0.1) {
       const target = getTargetPos(ghost);
       const possibleDirs = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
       let bestDir = Direction.NONE;
       let minDist = Infinity;
       const reverseDir = ghost.dir === Direction.UP ? Direction.DOWN :
                          ghost.dir === Direction.DOWN ? Direction.UP :
                          ghost.dir === Direction.LEFT ? Direction.RIGHT : Direction.LEFT;

       for (const d of possibleDirs) {
         if (d === reverseDir && ghost.mode !== 'FRIGHTENED') continue;

         let nextX = x;
         let nextY = y;
         if (d === Direction.UP) nextY--;
         if (d === Direction.DOWN) nextY++;
         if (d === Direction.LEFT) nextX--;
         if (d === Direction.RIGHT) nextX++;

         if (!isWall(nextX, nextY)) {
             const dist = Math.sqrt(Math.pow(nextX - target.x, 2) + Math.pow(nextY - target.y, 2));
             if (ghost.mode === 'FRIGHTENED') {
                 if (Math.random() < 0.5) bestDir = d;
             } else {
                 if (dist < minDist) {
                     minDist = dist;
                     bestDir = d;
                 }
             }
         }
       }
       if (bestDir !== Direction.NONE) ghost.dir = bestDir;
    }

    if (canMove(ghost.pos.x, ghost.pos.y, ghost.dir)) {
        if (ghost.dir === Direction.UP) ghost.pos.y -= ghost.speed;
        if (ghost.dir === Direction.DOWN) ghost.pos.y += ghost.speed;
        if (ghost.dir === Direction.LEFT) ghost.pos.x -= ghost.speed;
        if (ghost.dir === Direction.RIGHT) ghost.pos.x += ghost.speed;
    }
  };

  // --- RENDERING HELPERS ---

  const drawModernWall = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = COLORS.WALL_BASE;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = COLORS.WALL_TOP;
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.strokeStyle = COLORS.WALL_NEON;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.WALL_NEON;
    ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);
    ctx.shadowBlur = 0;
  };

  const drawMarketer = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dir: Direction) => {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 2;

    ctx.fillStyle = COLORS.MARKETER_SKIN;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.MARKETER_SKIN;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = COLORS.MARKETER_GLASSES;
    ctx.strokeStyle = COLORS.MARKETER_GLASSES;
    ctx.lineWidth = 2;

    const glassesY = centerY - 2;
    const glassSize = radius / 2.5;

    let lookX = 0;
    let lookY = 0;
    if (dir === Direction.LEFT) lookX = -2;
    if (dir === Direction.RIGHT) lookX = 2;
    if (dir === Direction.UP) lookY = -2;
    if (dir === Direction.DOWN) lookY = 2;

    ctx.beginPath();
    ctx.rect(centerX - glassSize - 2 + lookX, glassesY - glassSize/2 + lookY, glassSize, glassSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(centerX + 2 + lookX, glassesY - glassSize/2 + lookY, glassSize, glassSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - 2 + lookX, glassesY + lookY);
    ctx.lineTo(centerX + 2 + lookX, glassesY + lookY);
    ctx.stroke();
  };

  const drawFinancier = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, isFrightened: boolean) => {
    const cx = x + size/2;
    const cy = y + size/2;
    
    if (isFrightened) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(cx, cy, size/2 - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 5);
      ctx.lineTo(cx - 2, cy + 2);
      ctx.lineTo(cx + 2, cy + 5);
      ctx.lineTo(cx + 5, cy + 2);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = COLORS.SUIT_NAVY;
    const shoulderW = size - 6;
    const shoulderH = size / 2;
    ctx.beginPath();
    ctx.roundRect(cx - shoulderW/2, cy, shoulderW, shoulderH, 4);
    ctx.fill();

    ctx.fillStyle = '#f3f4f6'; 
    ctx.beginPath();
    ctx.arc(cx, cy - 4, size/3.5, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy + 2);
    ctx.lineTo(cx + 2, cy + 2);
    ctx.lineTo(cx, cy + 12);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.rect(cx - 4, cy - 6, 2, 2);
    ctx.rect(cx + 2, cy - 6, 2, 2);
    ctx.fill();
  };

  // Main Game Loop
  const loop = (time: number) => {
    if (!canvasRef.current || !containerRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize Timer
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;

    // --- SPEED INCREASE LOGIC ---
    // Every 30 seconds (30000ms), increase multiplier by 1.5x
    const stage = Math.floor(elapsed / 30000);
    const targetMultiplier = Math.min(Math.pow(1.5, stage), 5); // Cap at 5x

    const multiplierChanged = targetMultiplier !== speedMultiplierRef.current;
    
    if (multiplierChanged) {
        speedMultiplierRef.current = targetMultiplier;
        playerRef.current.speed = 0.03 * targetMultiplier;
        ghostsRef.current.forEach(g => {
            g.speed = getGhostSpeed(g, targetMultiplier);
        });
    }

    frameCountRef.current++;

    // 1. Update State
    moveEntity(playerRef.current);
    
    const px = Math.round(playerRef.current.pos.x);
    const py = Math.round(playerRef.current.pos.y);
    if (pelletsRef.current[py] && (pelletsRef.current[py][px] === 0 || pelletsRef.current[py][px] === 2)) {
        const type = pelletsRef.current[py][px];
        pelletsRef.current[py][px] = 3;
        const points = type === 2 ? 500 : 100;
        scoreRef.current += points;
        onScoreUpdate(scoreRef.current);

        if (type === 2) {
            powerModeTimerRef.current = 600;
            ghostsRef.current.forEach(g => {
                g.mode = 'FRIGHTENED';
                g.speed = getGhostSpeed(g, speedMultiplierRef.current);
            });
        }
        
        const hasDots = pelletsRef.current.some(row => row.some(cell => cell === 0 || cell === 2));
        if (!hasDots) {
            onWin();
            return;
        }
    }

    if (powerModeTimerRef.current > 0) {
        powerModeTimerRef.current--;
        if (powerModeTimerRef.current === 0) {
            ghostsRef.current.forEach(g => {
                g.mode = 'SCATTER';
                g.speed = getGhostSpeed(g, speedMultiplierRef.current);
            });
        }
    }

    ghostsRef.current.forEach(ghost => {
        moveGhost(ghost);
        const dist = Math.sqrt(Math.pow(ghost.pos.x - playerRef.current.pos.x, 2) + Math.pow(ghost.pos.y - playerRef.current.pos.y, 2));
        if (dist < 0.6) { 
            if (ghost.mode === 'FRIGHTENED') {
                ghost.pos = { ...GHOST_HOUSE_POS };
                ghost.mode = 'SCATTER';
                ghost.speed = getGhostSpeed(ghost, speedMultiplierRef.current);
                scoreRef.current += 1000;
                onScoreUpdate(scoreRef.current);
            } else {
                onGameOver(scoreRef.current);
                return;
            }
        }
    });

    // 2. Render
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const cols = LEVEL_MAP[0].length;
    const rows = LEVEL_MAP.length;
    const ts = Math.min(w / cols, h / rows);
    const offsetX = (w - (cols * ts)) / 2;
    const offsetY = (h - (rows * ts)) / 2;

    // Draw Map
    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const tile = pelletsRef.current[r][c];
            const x = offsetX + c * ts;
            const y = offsetY + r * ts;

            if (LEVEL_MAP[r][c] === 1) {
                drawModernWall(ctx, x, y, ts);
            } else if (tile === 0) {
                ctx.fillStyle = COLORS.BUDGET_DOT;
                ctx.font = `bold ${ts * 0.7}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', x + ts/2, y + ts/2 + (ts*0.05));
            } else if (tile === 2) {
                const pulse = (Math.sin(frameCountRef.current * 0.15) + 1) * 0.3 + 0.7;
                ctx.fillStyle = COLORS.VIRAL_PELLET;
                ctx.beginPath();
                ctx.arc(x + ts/2, y + ts/2, (ts/4) * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 15;
                ctx.shadowColor = COLORS.VIRAL_PELLET;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    const playerX = offsetX + playerRef.current.pos.x * ts;
    const playerY = offsetY + playerRef.current.pos.y * ts;
    drawMarketer(ctx, playerX, playerY, ts, playerRef.current.dir);

    ghostsRef.current.forEach(ghost => {
        const gx = offsetX + ghost.pos.x * ts;
        const gy = offsetY + ghost.pos.y * ts;
        drawFinancier(ctx, gx, gy, ts, ghost.color, ghost.mode === 'FRIGHTENED');
    });

    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // Canvas resizing logic
    const handleResize = () => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    requestRef.current = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-[21/20] max-h-full flex items-center justify-center">
        <canvas 
            ref={canvasRef} 
            className="w-full h-full bg-[#050505] rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] sm:shadow-[0_0_50px_rgba(139,92,246,0.3)] border border-white/10 touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ imageRendering: 'pixelated' }}
        />
        {speedMultiplierRef.current > 1 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-brand-danger/20 border border-brand-danger rounded text-xs text-brand-danger font-bold animate-pulse pointer-events-none">
                {speedMultiplierRef.current.toFixed(1)}x SPEED
            </div>
        )}
    </div>
  );
};