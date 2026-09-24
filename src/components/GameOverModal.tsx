import React from 'react';
import { Trophy, Swords, Coins, RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import { GameMode } from '../types';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  kills: number;
  length: number;
  coinsEarned: number;
  isHighScore: boolean;
  xpEarned?: number;
  gameMode?: GameMode;
  waveReached?: number;
  onPlayAgain: () => void;
  onReturnLobby: () => void;
  onOpenLeaderboard?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  kills,
  length,
  coinsEarned,
  isHighScore,
  xpEarned,
  gameMode,
  waveReached,
  onPlayAgain,
  onReturnLobby,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="gameover-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] flex flex-col items-center text-center my-auto max-h-[96vh] overflow-y-auto">
        {/* Glowing Skull / Elimination Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)] mb-2 sm:mb-3">
          <Swords className="w-6 h-6 sm:w-9 sm:h-9" />
        </div>

        <h2 className="font-cyber text-lg sm:text-2xl font-black text-rose-500 tracking-widest uppercase">
          YOU GOT KILLED.
        </h2>

        {gameMode === 'horde' && waveReached && (
          <div className="text-xs font-cyber text-purple-400 font-bold mb-2">
            👾 HORDE SURVIVAL • WAVE {waveReached}
          </div>
        )}

        {isHighScore && (
          <div className="w-full mb-3 py-1 px-2.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 font-cyber text-[10px] sm:text-xs font-black flex items-center justify-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> NEW ALL-TIME HIGH SCORE!
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 font-cyber mb-3 sm:mb-4">
          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-slate-500 block uppercase">FINAL SCORE</span>
            <span className="text-base sm:text-xl font-black text-white">{score}</span>
          </div>

          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-slate-500 block uppercase">TOTAL KILLS</span>
            <span className="text-base sm:text-xl font-black text-rose-400">{kills}</span>
          </div>

          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-slate-500 block uppercase">MAX LENGTH</span>
            <span className="text-base sm:text-xl font-black text-cyan-400">{length}</span>
          </div>

          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-amber-500/30">
            <span className="text-[9px] sm:text-[10px] text-amber-400/80 block uppercase">CASH EARNED</span>
            <span className="text-base sm:text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5" /> +${coinsEarned}
            </span>
          </div>
        </div>

        {/* Battle Pass XP Banner */}
        {typeof xpEarned === 'number' && xpEarned > 0 && (
          <div className="w-full mb-4 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-amber-500/15 border border-amber-400/50 flex items-center justify-between text-xs font-cyber">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>PASS XP REWARD</span>
            </span>
            <span className="font-black text-amber-300 font-mono text-sm">+{xpEarned} XP</span>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full space-y-2">
          <button
            id="btn-play-again"
            type="button"
            onClick={onPlayAgain}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:brightness-110 text-slate-950 font-cyber text-sm sm:text-base font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /> RE-DEPLOY NOW
          </button>

          {onOpenLeaderboard && (
            <button
              id="btn-gameover-leaderboard"
              type="button"
              onClick={onOpenLeaderboard}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-amber-300 font-cyber text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" /> VIEW GLOBAL LEADERBOARD
            </button>
          )}

          <button
            id="btn-return-lobby"
            type="button"
            onClick={onReturnLobby}
            className="w-full py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-cyber text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" /> RETURN TO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
};
