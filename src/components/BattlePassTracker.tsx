import React, { useState, useMemo, useRef } from 'react';
import { PlayerProfile, BattlePassTier } from '../types';
import { BATTLE_PASS_TIERS, getBattlePassLevel, XP_PER_TIER } from '../utils/progression';
import {
  Trophy,
  ChevronRight,
  ChevronLeft,
  Gift,
  Sparkles,
  Star,
  Check,
  Lock,
  Zap,
  Flame,
} from 'lucide-react';
import { playRetroButtonClick, playCashSound, playRetroVictoryFanfare } from '../utils/audio';

interface BattlePassTrackerProps {
  profile: PlayerProfile;
  onOpenPass: () => void;
  onUpdateProfile?: (updated: Partial<PlayerProfile>) => void;
}

export const BattlePassTracker: React.FC<BattlePassTrackerProps> = ({
  profile,
  onOpenPass,
  onUpdateProfile,
}) => {
  const xp = profile.battlePassXp || 0;
  const claimedTiers = useMemo(
    () => profile.claimedBattlePassTiers || profile.claimedPassTiers || [],
    [profile.claimedBattlePassTiers, profile.claimedPassTiers]
  );
  const status = getBattlePassLevel(xp);
  const trackRef = useRef<HTMLDivElement>(null);

  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  const currentTierDef = BATTLE_PASS_TIERS.find((t) => t.tier === status.currentTier);
  const nextTierDef = BATTLE_PASS_TIERS.find((t) => t.tier === status.currentTier + 1);

  // Unclaimed tiers that the user has already unlocked
  const unclaimedTiers = useMemo(
    () =>
      BATTLE_PASS_TIERS.filter(
        (t) => t.tier <= status.currentTier && !claimedTiers.includes(t.tier)
      ),
    [status.currentTier, claimedTiers]
  );
  const unclaimedCount = unclaimedTiers.length;

  // Claim single tier directly from tracker
  const handleClaimTier = (e: React.MouseEvent, tierNum: number) => {
    e.stopPropagation();
    if (!onUpdateProfile) {
      onOpenPass();
      return;
    }
    const tierDef = BATTLE_PASS_TIERS.find((t) => t.tier === tierNum);
    if (!tierDef) return;
    if (tierNum > status.currentTier || claimedTiers.includes(tierNum)) return;

    if (tierNum === 15 || tierDef.rewardType === 'skin') {
      playRetroVictoryFanfare();
    } else {
      playCashSound();
    }

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

  // Claim all eligible unclaimed tiers at once
  const handleClaimAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateProfile) {
      onOpenPass();
      return;
    }

    let bonusCoins = 0;
    const newTrails = [...(profile.unlockedTrailIds || ['none'])];
    const newSkins = [...(profile.unlockedSkinIds || ['cyber-viper'])];
    const newClaimed = [...claimedTiers];

    for (const tierDef of unclaimedTiers) {
      newClaimed.push(tierDef.tier);
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

    playRetroVictoryFanfare();
    onUpdateProfile({
      coins: (profile.coins || 0) + bonusCoins,
      unlockedTrailIds: newTrails as any,
      unlockedTrails: newTrails as any,
      unlockedSkinIds: newSkins,
      claimedBattlePassTiers: newClaimed,
      claimedPassTiers: newClaimed,
    });
  };

  // Scroll horizontal milestone track left/right
  const scrollTrack = (direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    playRetroButtonClick();
    if (trackRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      trackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="battle-pass-tracker"
      onClick={onOpenPass}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenPass();
        }
      }}
      className="group relative w-full rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/40 hover:border-amber-400 p-2.5 sm:p-3 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer backdrop-blur-md select-none shrink-0"
      title="Click to view full Cyber Protocol Battle Pass rewards"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2 font-cyber">
        {/* Title & Tier Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-yellow-500/10 border border-amber-400/60 flex items-center justify-center shrink-0 shadow-inner">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 drop-shadow" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300">
                CYBER PASS
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold border border-amber-500/30 uppercase hidden xs:inline">
                S1: PROTOCOL
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 flex items-center gap-1">
              {status.isMaxTier ? (
                <span className="text-yellow-300 font-bold flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 inline" /> MAX TIER 15 REACHED
                </span>
              ) : (
                <span>
                  Current: <strong className="text-amber-300">Tier {status.currentTier}</strong>
                  <span className="text-slate-500 mx-1">→</span>
                  Target: <strong className="text-yellow-400">Tier {status.currentTier + 1}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action: Quick Claim or XP Count */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {unclaimedCount > 0 ? (
            <button
              type="button"
              onClick={handleClaimAll}
              className="px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-[10px] sm:text-[11px] font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse transition-all active:scale-95 cursor-pointer"
              title="Claim all unlocked tier rewards instantly"
            >
              <Gift className="w-3.5 h-3.5 text-slate-950" />
              <span>CLAIM ({unclaimedCount})</span>
            </button>
          ) : (
            <div className="text-right">
              <div className="text-[10px] sm:text-xs font-mono font-black text-amber-300">
                {status.isMaxTier ? '15,000 / 15,000 XP' : `${status.xpIntoCurrentTier} / ${XP_PER_TIER} XP`}
              </div>
              <div className="text-[8px] sm:text-[9px] font-mono text-slate-400">
                Total: {(profile.battlePassXp || 0).toLocaleString()} XP
              </div>
            </div>
          )}

          <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main XP Progress Bar */}
      <div className="space-y-1 mb-2.5">
        <div className="relative w-full h-3 sm:h-3.5 rounded-full bg-slate-950/90 border border-amber-500/40 p-0.5 shadow-inner overflow-hidden">
          {/* Progress Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 transition-all duration-500 relative shadow-[0_0_14px_rgba(245,158,11,0.6)]"
            style={{ width: `${Math.max(4, status.percentToNextTier)}%` }}
          >
            {/* Animated Light Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>

          {/* Milestone pip notches at 25%, 50%, 75% */}
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-slate-700/60 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-2/4 w-px bg-slate-700/60 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-slate-700/60 pointer-events-none" />
        </div>

        {/* Progress Subtext & Target Preview */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono px-0.5">
          <span className="text-amber-400/90 font-bold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-yellow-400 inline" />
            {status.percentToNextTier}% To Tier {status.isMaxTier ? 15 : status.currentTier + 1}
          </span>

          {!status.isMaxTier && nextTierDef && (
            <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[300px]">
              <span className="text-slate-400">{status.xpNeededForNextTier} XP to unlock:</span>{' '}
              <strong className="text-amber-300 font-cyber">{nextTierDef.rewardName}</strong>
            </span>
          )}

          {status.isMaxTier && (
            <span className="text-yellow-300 font-cyber font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              MAX PROTOCOL COMPLETED!
            </span>
          )}
        </div>
      </div>

      {/* Tier Icons Milestone Track */}
      <div className="relative pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[9px] sm:text-[10px] font-cyber font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>TIER REWARDS ROADMAP</span>
          </span>

          {/* Scroll Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => scrollTrack('left', e)}
              className="p-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollTrack('right', e)}
              className="p-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Horizontal Tier Icons Track */}
        <div
          ref={trackRef}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900/50"
          style={{ scrollbarWidth: 'thin' }}
        >
          {BATTLE_PASS_TIERS.map((tier) => {
            const isUnlocked = tier.tier <= status.currentTier;
            const isClaimed = claimedTiers.includes(tier.tier);
            const isReadyToClaim = isUnlocked && !isClaimed;
            const isCurrentTarget = tier.tier === status.currentTier + 1;
            const isHovered = hoveredTier === tier.tier;

            // Tier node styling
            let nodeBorderClass = 'border-slate-800 bg-slate-950/70 text-slate-500';
            let badgeClass = 'bg-slate-900 text-slate-400 border-slate-800';

            if (isClaimed) {
              nodeBorderClass = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300';
              badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
            } else if (isReadyToClaim) {
              nodeBorderClass =
                'border-amber-400 bg-amber-950/40 text-amber-200 ring-2 ring-amber-400/50 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]';
              badgeClass = 'bg-amber-500 text-slate-950 font-black';
            } else if (isCurrentTarget) {
              nodeBorderClass = 'border-cyan-400/80 bg-cyan-950/30 text-cyan-200 ring-1 ring-cyan-400/40';
              badgeClass = 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50';
            }

            return (
              <div
                key={tier.tier}
                onMouseEnter={() => setHoveredTier(tier.tier)}
                onMouseLeave={() => setHoveredTier(null)}
                onClick={(e) => {
                  if (isReadyToClaim) {
                    handleClaimTier(e, tier.tier);
                  }
                }}
                className={`group/tier relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl border transition-all duration-200 shrink-0 w-[62px] sm:w-[70px] select-none ${nodeBorderClass} ${
                  isReadyToClaim ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
                }`}
                title={`Tier ${tier.tier}: ${tier.rewardName} (${tier.requiredXp} XP)`}
              >
                {/* Top: Tier Tag + Status Indicator */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`text-[8px] sm:text-[9px] font-cyber px-1 py-0.2 rounded border font-bold ${badgeClass}`}
                  >
                    T{tier.tier}
                  </span>

                  {isClaimed ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : isReadyToClaim ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  ) : (
                    <Lock className="w-2.5 h-2.5 text-slate-600" />
                  )}
                </div>

                {/* Center: Reward Icon */}
                <div className="relative my-0.5 flex items-center justify-center text-xl sm:text-2xl drop-shadow-md">
                  <span>{tier.rewardIcon}</span>
                  {tier.rewardType === 'skin' && (
                    <span className="absolute -top-1 -right-1 text-[7px] px-1 py-0.2 rounded bg-purple-500 text-white font-black uppercase">
                      SKIN
                    </span>
                  )}
                </div>

                {/* Bottom: Action or Reward Label */}
                <div className="w-full mt-1 text-center truncate">
                  {isReadyToClaim ? (
                    <span className="inline-block w-full py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[8px] font-black uppercase tracking-tight shadow">
                      CLAIM!
                    </span>
                  ) : isClaimed ? (
                    <span className="text-[8px] text-emerald-400 font-mono uppercase font-bold">
                      CLAIMED
                    </span>
                  ) : isCurrentTarget ? (
                    <span className="text-[8px] text-cyan-300 font-mono font-bold">
                      {status.percentToNextTier}%
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-500 font-mono">
                      {tier.requiredXp >= 1000 ? `${tier.requiredXp / 1000}k XP` : `${tier.requiredXp} XP`}
                    </span>
                  )}
                </div>

                {/* Floating Detail Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 rounded-lg bg-slate-900 border border-amber-400/80 shadow-2xl text-left z-30 pointer-events-none font-sans">
                    <div className="flex items-center justify-between text-[9px] font-cyber text-amber-400 mb-0.5">
                      <span>TIER {tier.tier} REWARD</span>
                      <span className="text-slate-400 font-mono">{tier.requiredXp} XP</span>
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">
                      {tier.rewardName}
                    </div>
                    <div className="mt-1 text-[8px] text-slate-400 flex items-center justify-between font-mono">
                      <span>TYPE: {tier.rewardType.toUpperCase()}</span>
                      <span
                        className={
                          isClaimed
                            ? 'text-emerald-400 font-bold'
                            : isReadyToClaim
                            ? 'text-amber-300 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {isClaimed ? 'CLAIMED' : isReadyToClaim ? 'READY TO CLAIM!' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
