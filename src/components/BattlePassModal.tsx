import React from 'react';
import { PlayerProfile } from '../types';
import { BATTLE_PASS_TIERS, getBattlePassLevel } from '../utils/progression';
import { X, Trophy, Check, Lock, Gift, Sparkles, ShieldCheck } from 'lucide-react';
import { playRetroButtonClick, playCashSound } from '../utils/audio';

interface BattlePassModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onClose: () => void;
}

export const BattlePassModal: React.FC<BattlePassModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const xp = profile.battlePassXp || 0;
  const claimedTiers = profile.claimedBattlePassTiers || profile.claimedPassTiers || [];
  const status = getBattlePassLevel(xp);

  const handleClaim = (tierNum: number) => {
    const tierDef = BATTLE_PASS_TIERS.find((t) => t.tier === tierNum);
    if (!tierDef) return;
    if (tierNum > status.currentTier || claimedTiers.includes(tierNum)) return;

    playCashSound();
    const newClaimed = [...claimedTiers, tierNum];
    const updates: Partial<PlayerProfile> = {
      claimedBattlePassTiers: newClaimed,
      claimedPassTiers: newClaimed,
    };

    if (tierDef.rewardType === 'coins' && typeof tierDef.rewardValue === 'number') {
      updates.coins = (profile.coins || 0) + tierDef.rewardValue;
    } else if (tierDef.rewardType === 'trail' && typeof tierDef.rewardValue === 'string') {
      const curTrails = profile.unlockedTrailIds || ['none'];
      if (!curTrails.includes(tierDef.rewardValue as any)) {
        updates.unlockedTrailIds = [...curTrails, tierDef.rewardValue as any];
        updates.unlockedTrails = [...curTrails, tierDef.rewardValue as any];
      }
    } else if (tierDef.rewardType === 'skin' && typeof tierDef.rewardValue === 'string') {
      const curSkins = profile.unlockedSkinIds || ['cyber-viper'];
      if (!curSkins.includes(tierDef.rewardValue)) {
        updates.unlockedSkinIds = [...curSkins, tierDef.rewardValue];
      }
    }

    onUpdateProfile(updates);
  };

  const handleClaimAll = () => {
    let bonusCoins = 0;
    const newTrails = [...(profile.unlockedTrailIds || ['none'])];
    const newSkins = [...(profile.unlockedSkinIds || ['cyber-viper'])];
    const newClaimed = [...claimedTiers];

    for (let t = 1; t <= status.currentTier; t++) {
      if (!newClaimed.includes(t)) {
        newClaimed.push(t);
        const tierDef = BATTLE_PASS_TIERS.find((x) => x.tier === t);
        if (tierDef) {
          if (tierDef.rewardType === 'coins' && typeof tierDef.rewardValue === 'number') {
            bonusCoins += tierDef.rewardValue;
          } else if (tierDef.rewardType === 'trail' && typeof tierDef.rewardValue === 'string') {
            if (!newTrails.includes(tierDef.rewardValue as any)) {
              newTrails.push(tierDef.rewardValue as any);
            }
          } else if (tierDef.rewardType === 'skin' && typeof tierDef.rewardValue === 'string') {
            if (!newSkins.includes(tierDef.rewardValue)) {
              newSkins.push(tierDef.rewardValue);
            }
          }
        }
      }
    }

    if (newClaimed.length > claimedTiers.length) {
      playCashSound();
      onUpdateProfile({
        coins: (profile.coins || 0) + bonusCoins,
        claimedBattlePassTiers: newClaimed,
        claimedPassTiers: newClaimed,
        unlockedTrailIds: newTrails,
        unlockedTrails: newTrails,
        unlockedSkinIds: newSkins,
      });
    }
  };

  const unclaimedCount = BATTLE_PASS_TIERS.filter(
    (t) => t.tier <= status.currentTier && !claimedTiers.includes(t.tier)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border-2 border-amber-500/40 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col max-h-[90vh] overflow-hidden text-white font-chakra">
        {/* Header */}
        <div className="px-6 py-5 border-b border-amber-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-wider text-amber-300 uppercase">
                  Season 1: Cyber Protocol Pass
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  FREE PASS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Earn Season XP from matches, kills, and wave completions to unlock rewards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unclaimedCount > 0 && (
              <button
                onClick={handleClaimAll}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
              >
                <Gift className="w-4 h-4" /> Claim All ({unclaimedCount})
              </button>
            )}
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

        {/* Level Progression Banner */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <div className="text-center">
                <span className="text-[10px] block font-bold text-amber-300 tracking-wider">TIER</span>
                <span className="text-xl font-black text-white leading-none">{status.currentTier}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-200">
                  {status.isMaxTier ? 'MAX TIER REACHED!' : `Next Tier: ${status.currentTier + 1}`}
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  {xp.toLocaleString()} Total Season XP
                </span>
              </div>
              <div className="w-64 md:w-80 h-2.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${status.percentToNextTier}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {status.isMaxTier
                  ? 'All 15 Cyber Protocol tiers unlocked!'
                  : `${status.xpIntoCurrentTier} / 1,000 XP to next tier`}
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold block mb-0.5">HOW TO EARN XP:</span>
            <span>Eliminations (+120 XP) • Score conversion • Horde waves (+250 XP)</span>
          </div>
        </div>

        {/* Tiers Roadmap Horizontal List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {BATTLE_PASS_TIERS.map((tier) => {
              const isUnlocked = tier.tier <= status.currentTier;
              const isClaimed = claimedTiers.includes(tier.tier);
              const canClaim = isUnlocked && !isClaimed;

              return (
                <div
                  key={tier.tier}
                  className={`relative p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isClaimed
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : canClaim
                      ? 'border-amber-400 bg-amber-950/25 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse'
                      : isUnlocked
                      ? 'border-slate-700 bg-slate-800/40'
                      : 'border-slate-800/60 bg-slate-900/30 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl filter drop-shadow">{tier.rewardIcon}</span>
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-amber-400 block uppercase">
                          Tier {tier.tier} • {tier.requiredXp.toLocaleString()} XP
                        </span>
                        <h4 className="font-bold text-xs text-white leading-tight">
                          {tier.rewardName}
                        </h4>
                      </div>
                    </div>

                    {isClaimed ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3" /> CLAIMED
                      </span>
                    ) : !isUnlocked ? (
                      <span className="p-1 rounded text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      {tier.rewardType === 'coins'
                        ? 'Currency'
                        : tier.rewardType === 'trail'
                        ? 'Tail Particle'
                        : 'Exclusive Skin'}
                    </span>

                    {canClaim ? (
                      <button
                        onClick={() => handleClaim(tier.tier)}
                        className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                      >
                        Claim Reward
                      </button>
                    ) : isClaimed ? (
                      <span className="text-xs text-emerald-400 font-bold">In Locker</span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {(tier.requiredXp - xp).toLocaleString()} XP Needed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-500/20 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>All tiers are 100% free and earnable through arena combat gameplay.</span>
          <span className="text-amber-400 font-bold">Season 1: Active</span>
        </div>
      </div>
    </div>
  );
};
