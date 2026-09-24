import React from 'react';
import { PlayerProfile, TrailType } from '../types';
import { TRAILS, TrailDef } from '../utils/trails';
import { Sparkles, Check, Lock, X, Coins } from 'lucide-react';
import { playRetroButtonClick, playCashSound } from '../utils/audio';

interface TrailsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onClose: () => void;
}

export const TrailsModal: React.FC<TrailsModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const unlockedTrails = profile.unlockedTrailIds || profile.unlockedTrails || ['none'];
  const selectedTrail = profile.selectedTrailId || 'none';

  const handleEquip = (trailId: TrailType) => {
    playRetroButtonClick();
    onUpdateProfile({ selectedTrailId: trailId });
  };

  const handleBuy = (trail: TrailDef) => {
    if (profile.coins < trail.price) return;
    playCashSound();
    const newUnlocked = [...unlockedTrails, trail.id];
    onUpdateProfile({
      coins: profile.coins - trail.price,
      unlockedTrailIds: newUnlocked,
      unlockedTrails: newUnlocked,
      selectedTrailId: trail.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-cyan-500/40 rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-hidden text-white font-chakra">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wider text-cyan-300 uppercase">
                Serpent Tail Trails Locker
              </h2>
              <p className="text-xs text-slate-400">
                Equip luminous particle emitters behind your tail in the arena
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-bold text-sm">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{profile.coins.toLocaleString()}</span>
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
        </div>

        {/* Trail Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TRAILS.map((trail) => {
            const isUnlocked = unlockedTrails.includes(trail.id);
            const isEquipped = selectedTrail === trail.id;
            const canAfford = profile.coins >= trail.price;

            return (
              <div
                key={trail.id}
                className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isEquipped
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : isUnlocked
                    ? 'border-slate-700/80 bg-slate-800/40 hover:border-slate-600'
                    : 'border-slate-800/60 bg-slate-900/40 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Trail Info */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl filter drop-shadow">{trail.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                          {trail.name}
                        </h3>
                        <span
                          className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${trail.color}22`,
                            color: trail.color,
                            border: `1px solid ${trail.color}55`,
                          }}
                        >
                          {trail.rarity || trail.badge}
                        </span>
                      </div>
                    </div>
                    {isEquipped && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        EQUIPPED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {trail.description}
                  </p>

                  {/* Visual Particle Preview Bar */}
                  <div className="relative h-2 rounded-full overflow-hidden mb-4 bg-slate-950/60 border border-slate-700/50">
                    <div
                      className="absolute inset-0 animate-pulse"
                      style={{
                        backgroundColor: trail.color,
                        boxShadow: `0 0 10px ${trail.glowColor}`,
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  {isUnlocked ? (
                    <button
                      onClick={() => handleEquip(trail.id)}
                      disabled={isEquipped}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        isEquipped
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Equipped
                        </>
                      ) : (
                        'Equip Trail'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(trail)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Buy for {trail.price.toLocaleString()} Cash
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-slate-950/60 text-center text-xs text-slate-400">
          Tail trails render dynamic luminous particles behind your serpent in all game modes!
        </div>
      </div>
    </div>
  );
};
