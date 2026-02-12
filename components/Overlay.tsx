import React from 'react';
import { GameState, Difficulty } from '../types';
import { Play, RotateCcw, TrendingUp, DollarSign, BrainCircuit, ShieldAlert } from 'lucide-react';

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
    <div className="flex flex-col items-center space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-neon tracking-tighter drop-shadow-lg">
          BUDGET<br/>RUN
        </h1>
        <p className="text-gray-400 font-bold tracking-wide">MARKETER vs FINANCE</p>
      </div>

      <div className="flex flex-col gap-3 w-64">
        <div className="text-xs text-center text-gray-500 uppercase font-bold tracking-widest mb-1">Select Position Level</div>
        {(Object.values(Difficulty) as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => onDifficultyChange(diff)}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-between border-2
              ${currentDifficulty === diff 
                ? 'bg-brand-neon/20 border-brand-neon text-brand-neon shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
              }`}
          >
            <span>{diff}</span>
            {currentDifficulty === diff && <TrendingUp size={16} />}
          </button>
        ))}
      </div>

      <button
        onClick={onStart}
        className="group relative px-8 py-4 bg-brand-gold text-black font-black text-xl rounded-full overflow-hidden transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:shadow-[0_0_30px_rgba(255,215,0,0.7)]"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <span className="relative flex items-center gap-2">
          <Play fill="currentColor" /> START CAMPAIGN
        </span>
      </button>
    </div>
  );

  const renderGameOver = () => (
    <div className="flex flex-col items-center max-w-sm text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-5xl font-black text-brand-danger drop-shadow-[0_0_10px_rgba(255,42,109,0.5)]">
          BUDGET CUT
        </h2>
        <p className="text-gray-400 text-lg">The Finance Dept caught you.</p>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 w-full backdrop-blur-sm">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Spend</div>
        <div className="text-4xl font-mono text-brand-gold font-bold flex items-center justify-center gap-1">
          <DollarSign size={24} /> {score.toLocaleString()}
        </div>
      </div>

      <div className="w-full bg-brand-dark/50 p-4 rounded-xl border border-brand-neon/30 relative overflow-hidden min-h-[100px] flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-neon" />
        <div className="flex items-center gap-2 mb-2 text-brand-neon text-xs font-bold uppercase">
          <BrainCircuit size={14} /> Gemini Generated Excuse
        </div>
        {isExcuseLoading ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-neon"></div>
          </div>
        ) : (
          <p className="text-sm text-gray-200 italic leading-relaxed">"{aiExcuse}"</p>
        )}
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 mt-4"
      >
        <RotateCcw size={18} /> TRY AGAIN
      </button>
    </div>
  );

  const renderWon = () => (
    <div className="flex flex-col items-center text-center space-y-8">
      <h2 className="text-5xl font-black text-brand-success drop-shadow-[0_0_15px_rgba(5,255,161,0.6)]">
        BUDGET APPROVED!
      </h2>
      <div className="text-xl text-gray-300">
        You secured <span className="text-brand-gold font-bold">${score.toLocaleString()}</span> for Q4!
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-brand-success text-black font-bold rounded-full hover:brightness-110 transition-all flex items-center gap-2"
      >
        <Play fill="currentColor" /> NEXT FISCAL YEAR
      </button>
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      {gameState === GameState.MENU && renderMenu()}
      {gameState === GameState.GAME_OVER && renderGameOver()}
      {gameState === GameState.WON && renderWon()}
    </div>
  );
};