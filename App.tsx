import React, { useState, useEffect, useRef } from 'react';
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
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-brand-dark overflow-hidden font-mono">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-brand-dark to-brand-dark pointer-events-none" />

      {/* Main Game Container */}
      <div className="relative z-10 w-full max-w-2xl h-full max-h-[90vh] flex flex-col items-center">
        
        {/* Header / Scoreboard */}
        <div className="w-full px-6 py-4 flex justify-between items-end bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex flex-col">
            <span className="text-xs text-brand-neon uppercase tracking-widest opacity-80">Budget Collected</span>
            <span className="text-2xl font-bold text-white tabular-nums drop-shadow-md">${score.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs text-brand-danger uppercase tracking-widest opacity-80">High Score</span>
             <span className="text-xl font-bold text-gray-400 tabular-nums">${highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 w-full flex items-center justify-center p-4">
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
        
        <div className="pb-6 text-center text-xs text-gray-500 opacity-50">
          Swipe to Move • Avoid the Finance Dept
        </div>
      </div>
    </div>
  );
};

export default App;