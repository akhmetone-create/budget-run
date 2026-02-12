import React from 'react';
import { GameState, Difficulty } from '../types';
import { Play, RotateCcw, TrendingUp, DollarSign, BrainCircuit } from 'lucide-react';

interface OverlayProps {
  gameState: GameState;
  score: number;
  onStart: () => void;
  aiExcuse: string;
  isExcuseLoading: boolean;
  onDifficultyChange: (diff: Difficulty) => void;
  currentDifficulty: Difficulty;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  gameState, 
  score, 
  onStart, 
  aiExcuse, 
  isExcuseLoading,
  onDifficultyChange,
  currentDifficulty
}) => {
  
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-4 sm:space-y-6 animate-fade-in p-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-neon tracking-tighter drop-shadow-lg leading-tight">
          BUDGET<br/>RUN
        </h1>
        <p className="text-gray-400 font-bold tracking-wide text-[10px] sm:text-sm uppercase">Marketer vs Finance</p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-[200px] sm:max-w-xs">
        <div className="text-[10px] text-center text-gray-500 uppercase font-bold tracking-widest mb-1">Select Difficulty</div>
        {(Object.values(Difficulty) as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => onDifficultyChange(diff)}
            className={`w-full py-2 px-3 sm:px-4 rounded-lg font-bold text-[10px] sm:text-sm transition-all duration-200 flex items-center justify-between border
              ${currentDifficulty === diff 
                ? 'bg-brand-neon/20 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
              }`}
          >
            <span>{diff}</span>
            {currentDifficulty === diff && <TrendingUp size={14} className="sm:w-4 sm:h-4" />}
          </button>
        ))}
      </div>

      <button
        onClick={onStart}
        className="group relative px-6 py-3 bg-brand-gold text-black font-black text-sm sm:text-lg rounded-full overflow-hidden transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:shadow-[0_0_30px_rgba(255,215,0,0.7)] mt-2"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <span className="relative flex items-center gap-2">
          <Play fill="currentColor" size={16} className="sm:w-5 sm:h-5" /> START CAMPAIGN
        </span>
      </button>
    </div>
  );

  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center space-y-4">
      <div className="space-y-1">
        <h2 className="text-3xl sm:text-5xl font-black text-brand-danger drop-shadow-[0_0_10px_rgba(255,42,109,0.5)]">
          BUDGET CUT
        </h2>
        <p className="text-gray-400 text-xs sm:text-base">The Finance Dept caught you.</p>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full max-w-[240px] backdrop-blur-sm">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Spend</div>
        <div className="text-2xl sm:text-4xl font-mono text-brand-gold font-bold flex items-center justify-center gap-1">
          <DollarSign size={18} className="sm:w-6 sm:h-6" /> 
          {score.toLocaleString()}
        </div>
      </div>

      <div className="w-full max-w-[280px] bg-brand-dark/80 p-3 rounded-xl border border-brand-neon/30 relative overflow-hidden min-h-[80px] flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-neon" />
        <div className="flex items-center gap-2 mb-1 text-brand-neon text-[10px] font-bold uppercase">
          <BrainCircuit size={12} /> Excuse Generator
        </div>
        {isExcuseLoading ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-neon"></div>
          </div>
        ) : (
          <p className="text-[11px] sm:text-sm text-gray-200 italic leading-relaxed">"{aiExcuse}"</p>
        )}
      </div>

      <button
        onClick={onStart}
        className="px-6 py-2 sm:py-3 bg-white text-black font-bold text-xs sm:text-sm rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 mt-2"
      >
        <RotateCcw size={14} className="sm:w-4 sm:h-4" /> TRY AGAIN
      </button>
    </div>
  );

  const renderWon = () => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-6 px-4">
      <h2 className="text-3xl sm:text-5xl font-black text-brand-success drop-shadow-[0_0_15px_rgba(5,255,161,0.6)]">
        APPROVED!
      </h2>
      <div className="text-sm sm:text-lg text-gray-300 max-w-[80%]">
        You secured <span className="text-brand-gold font-bold">${score.toLocaleString()}</span> for Q4!
      </div>
      <button
        onClick={onStart}
        className="px-6 py-3 bg-brand-success text-black font-bold text-sm sm:text-base rounded-full hover:brightness-110 transition-all flex items-center gap-2"
      >
        <Play fill="currentColor" size={16} /> NEXT FISCAL YEAR
      </button>
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      {gameState === GameState.MENU && renderMenu()}
      {gameState === GameState.GAME_OVER && renderGameOver()}
      {gameState === GameState.WON && renderWon()}
    </div>
  );
};