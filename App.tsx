import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { Overlay } from './components/Overlay';
import { GameState, Difficulty } from './types';
import { generateExcuse } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [aiExcuse, setAiExcuse] = useState<string>("");
  const [isExcuseLoading, setIsExcuseLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);

  // Resize logic
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [gameDims, setGameDims] = useState({ w: 300, h: 300 });

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;
      const { width: availW, height: availH } = wrapperRef.current.getBoundingClientRect();
      
      // Aspect Ratio 21/20 = 1.05
      const ASPECT_RATIO = 21 / 20;
      
      // Try to fit by height first
      let h = availH;
      let w = h * ASPECT_RATIO;

      // If width is too big, fit by width
      if (w > availW) {
        w = availW;
        h = w / ASPECT_RATIO;
      }

      setGameDims({ w, h });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGameStart = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
    setAiExcuse("");
  };

  const handleGameOver = async (finalScore: number) => {
    setGameState(GameState.GAME_OVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    
    // Fetch AI excuse
    setIsExcuseLoading(true);
    try {
      const excuse = await generateExcuse(finalScore);
      setAiExcuse(excuse);
    } catch (error) {
      console.error("Failed to generate excuse", error);
      setAiExcuse("The budget just... disappeared into the cloud.");
    } finally {
      setIsExcuseLoading(false);
    }
  };

  const handleWin = () => {
    setGameState(GameState.WON);
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center bg-brand-dark overflow-hidden font-mono touch-none select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-brand-dark to-brand-dark pointer-events-none" />

      {/* Header / Scoreboard */}
      <div className="w-full max-w-2xl px-4 pt-3 pb-2 flex justify-between items-end bg-gradient-to-b from-black/90 to-transparent shrink-0 z-20 h-[60px] sm:h-[80px]">
        <div className="flex flex-col justify-center h-full">
          <span className="text-[10px] sm:text-xs text-brand-neon uppercase tracking-widest opacity-80 leading-none mb-1">Budget</span>
          <span className="text-lg sm:text-2xl font-bold text-white tabular-nums drop-shadow-md leading-none">${score.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-end justify-center h-full">
            <span className="text-[10px] sm:text-xs text-brand-danger uppercase tracking-widest opacity-80 leading-none mb-1">Record</span>
            <span className="text-base sm:text-xl font-bold text-gray-400 tabular-nums leading-none">${highScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Game Container Wrapper */}
      <div ref={wrapperRef} className="flex-1 w-full flex items-center justify-center p-2 min-h-0 relative z-10">
        {/* The Sized Game Box */}
        <div 
          style={{ width: gameDims.w, height: gameDims.h }} 
          className="relative shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden bg-black ring-1 ring-white/10"
        >
           {gameState === GameState.PLAYING ? (
             <GameBoard 
               onGameOver={handleGameOver} 
               onScoreUpdate={setScore} 
               onWin={handleWin}
               difficulty={difficulty}
             />
           ) : (
             <Overlay 
               gameState={gameState} 
               score={score} 
               onStart={handleGameStart}
               aiExcuse={aiExcuse}
               isExcuseLoading={isExcuseLoading}
               onDifficultyChange={setDifficulty}
               currentDifficulty={difficulty}
             />
           )}
        </div>
      </div>
      
      {/* Footer Instructions (Hidden on very short screens) */}
      <div className="h-[30px] sm:h-[40px] shrink-0 flex items-center justify-center pb-2 text-center z-10">
         <p className="text-[10px] sm:text-xs text-gray-500 opacity-50">
           Swipe to Move • Collect Budget
         </p>
      </div>
    </div>
  );
};

export default App;