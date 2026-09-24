import React from 'react';
import { PlayerProfile } from '../types';
import { evaluateMasteryBadges } from '../utils/progression';
import { Award, Check, Lock, X, Shield, Sparkles } from 'lucide-react';
import { playRetroButtonClick } from '../utils/audio';

interface MasteryModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const MasteryModal: React.FC<MasteryModalProps> = ({ profile, onClose }) => {
  const badges = evaluateMasteryBadges(profile);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-purple-500/40 rounded-xl shadow-[0_0_35px_rgba(168,85,247,0.25)] flex flex-col max-h-[90vh] overflow-hidden text-white font-chakra">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-wider text-purple-300 uppercase">
                  Pilot Mastery Badges
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {unlockedCount} / {badges.length} UNLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Honorary cyber combat insignia awarded for distinguished arena achievements
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playRetroButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((badge) => {
            const percent = Math.min(100, Math.floor((badge.progress / badge.maxProgress) * 100));

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  badge.unlocked
                    ? 'border-purple-400/60 bg-purple-950/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'border-slate-800 bg-slate-900/40 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl filter drop-shadow">{badge.icon}</span>
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase block">
                          {badge.category}
                        </span>
                        <h3 className="font-bold text-sm text-slate-100">{badge.name}</h3>
                      </div>
                    </div>

                    {badge.unlocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3" /> MASTERED
                      </span>
                    ) : (
                      <span className="p-1 rounded text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {badge.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>PROGRESS</span>
                    <span>
                      {badge.progress.toLocaleString()} / {badge.maxProgress.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                    <div
                      className={`h-full transition-all duration-300 ${
                        badge.unlocked
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-purple-500/20 bg-slate-950/70 text-center text-xs text-slate-400">
          Mastery badges are automatically updated at the conclusion of every arena operation.
        </div>
      </div>
    </div>
  );
};
