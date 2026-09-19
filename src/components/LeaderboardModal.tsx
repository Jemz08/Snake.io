import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import {
  getGlobalLeaderboard,
  getDailyLeaderboard,
  getKillsLeaderboard,
} from '../utils/leaderboard';
import { getSkinById } from '../utils/skins';
import { Trophy, Flame, Swords, X, Medal, Crown, Calendar, Sparkles } from 'lucide-react';
import { playEatSound } from '../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
  currentPlayerName?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerName,
  currentPlayerName,
}) => {
  const activePlayerName = currentPlayerName || playerName || 'Viper²';
  const [tab, setTab] = useState<'global' | 'daily' | 'kills'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, tab]);

  const refreshData = () => {
    if (tab === 'global') {
      setEntries(getGlobalLeaderboard());
    } else if (tab === 'daily') {
      setEntries(getDailyLeaderboard());
    } else {
      setEntries(getKillsLeaderboard());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="leaderboard-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="leaderboard-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cyber text-lg sm:text-xl font-black text-white tracking-wider flex items-center gap-2">
                ARENA LEADERBOARDS
              </h2>
              <p className="font-cyber text-[10px] sm:text-xs text-slate-400">
                Top Cyber-Mechs & Lethal Arena Champions
              </p>
            </div>
          </div>

          <button
            id="btn-close-leaderboard"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 pt-3 pb-1 border-b border-slate-800/80 bg-slate-950/30">
          <button
            id="tab-leaderboard-global"
            type="button"
            onClick={() => {
              setTab('global');
              playEatSound();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cyber text-xs font-bold transition-all ${
              tab === 'global'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            GLOBAL ALL-TIME
          </button>

          <button
            id="tab-leaderboard-daily"
            type="button"
            onClick={() => {
              setTab('daily');
              playEatSound();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cyber text-xs font-bold transition-all ${
              tab === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            DAILY RANKINGS
          </button>

          <button
            id="tab-leaderboard-kills"
            type="button"
            onClick={() => {
              setTab('kills');
              playEatSound();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cyber text-xs font-bold transition-all ${
              tab === 'kills'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            MOST KILLS
          </button>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-cyber text-sm">
              NO ARENA RECORDS LOGGED YET
            </div>
          ) : (
            entries.map((entry, idx) => {
              const skin = getSkinById(entry.skinId);
              const isTop3 = entry.rank <= 3;
              const isUser = entry.isPlayer || entry.name.toLowerCase() === activePlayerName.toLowerCase();

              return (
                <div
                  key={`${entry.name}-${entry.rank}-${idx}`}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                    isUser
                      ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-900/30 ring-1 ring-cyan-400/50'
                      : isTop3
                      ? 'bg-slate-950/70 border-amber-500/30'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Rank & Name */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    {/* Rank icon / number */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-cyber font-black text-xs sm:text-sm shrink-0">
                      {entry.rank === 1 ? (
                        <div className="w-full h-full rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-[0_0_10px_#f59e0b]">
                          <Crown className="w-4 h-4" />
                        </div>
                      ) : entry.rank === 2 ? (
                        <div className="w-full h-full rounded-lg bg-slate-300 text-slate-950 flex items-center justify-center shadow-sm">
                          2
                        </div>
                      ) : entry.rank === 3 ? (
                        <div className="w-full h-full rounded-lg bg-amber-700 text-white flex items-center justify-center shadow-sm">
                          3
                        </div>
                      ) : (
                        <span className="text-slate-400">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Skin chassis badge */}
                    <div
                      className="w-6 h-6 rounded-md border border-white/20 shrink-0"
                      style={{ backgroundColor: skin.primaryColor }}
                      title={`Chassis: ${skin.name}`}
                    />

                    {/* Pilot Call Sign */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-cyber font-bold text-xs sm:text-sm truncate ${
                            isUser ? 'text-cyan-300 font-black' : 'text-white'
                          }`}
                        >
                          {entry.name}
                        </span>
                        {isUser && (
                          <span className="bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[9px] font-cyber px-1.5 py-0.2 rounded font-black tracking-wider">
                            YOU
                          </span>
                        )}
                        {entry.badge && (
                          <span className="hidden sm:inline bg-slate-800/80 text-[9px] font-cyber px-1.5 py-0.5 rounded text-slate-400 font-semibold border border-slate-700">
                            {entry.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-cyber text-[10px] text-slate-400 block truncate">
                        {skin.name}
                      </span>
                    </div>
                  </div>

                  {/* Right: Score & Kills */}
                  <div className="flex items-center gap-3 sm:gap-5 text-right font-cyber shrink-0">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">SCORE</span>
                      <span className="text-xs sm:text-sm font-black text-amber-400">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-14 sm:w-16">
                      <span className="text-[9px] text-slate-400 uppercase block">KILLS</span>
                      <span className="text-xs sm:text-sm font-black text-rose-400 flex items-center justify-end gap-0.5">
                        <Swords className="w-3 h-3 text-rose-500" />
                        {entry.kills}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-cyber text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Rankings update automatically after each match.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
