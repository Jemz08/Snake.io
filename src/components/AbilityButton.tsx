import React from 'react';
import { Snake } from '../types';
import { getArchetypeAbility } from '../utils/archetypeAbilities';
import { Sparkles, Shield, Flame, Zap, Compass, RefreshCw } from 'lucide-react';

interface AbilityButtonProps {
  player: Snake | null;
  onTrigger: () => void;
  scale?: number;
  opacity?: number;
}

export const AbilityButton: React.FC<AbilityButtonProps> = ({
  player,
  onTrigger,
  scale = 1.0,
  opacity = 0.95,
}) => {
  if (!player) return null;

  const archetype = player.archetype || 'cyber';
  const abilityDef = getArchetypeAbility(archetype);
  const cooldownTimer = player.abilityCooldownTimer || 0;
  const activeTimer = player.abilityActiveTimer || 0;
  const isReady = cooldownTimer <= 0;
  const isActive = activeTimer > 0;

  // Percentage of cooldown elapsed (for radial sweep indicator)
  const cdRatio = !isReady ? cooldownTimer / abilityDef.activeCooldown : 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isReady && !player.isDead) {
      // Small tactile haptic feedback
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
      } catch {
        // ignore
      }
      onTrigger();
    }
  };

  return (
    <div
      className="flex flex-col items-center pointer-events-auto select-none"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
        opacity: opacity,
      }}
    >
      {/* Dynamic Status / Active Timer Pill */}
      <div
        className="mb-1 px-2 py-0.5 rounded-full font-cyber text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all"
        style={{
          backgroundColor: isActive
            ? `${abilityDef.themeColor}33`
            : isReady
            ? 'rgba(15, 23, 42, 0.85)'
            : 'rgba(15, 23, 42, 0.7)',
          borderColor: isActive
            ? abilityDef.themeColor
            : isReady
            ? `${abilityDef.themeColor}99`
            : 'rgba(71, 85, 105, 0.5)',
          color: isActive
            ? '#ffffff'
            : isReady
            ? abilityDef.themeColor
            : '#94a3b8',
          boxShadow: isActive ? `0 0 12px ${abilityDef.themeColor}` : 'none',
        }}
      >
        {isActive ? (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: abilityDef.themeColor }}
            />
            <span className="font-mono">{activeTimer.toFixed(1)}s ACTIVE</span>
          </>
        ) : isReady ? (
          <>
            <Sparkles className="w-2.5 h-2.5" />
            <span>READY</span>
          </>
        ) : (
          <span className="font-mono">{cooldownTimer.toFixed(1)}s</span>
        )}
      </div>

      {/* The Ability Trigger Button */}
      <button
        id="btn-active-ability"
        type="button"
        onPointerDown={handlePointerDown}
        disabled={!isReady && !isActive}
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all active:scale-95 shadow-xl backdrop-blur-md overflow-hidden ${
          isActive
            ? 'scale-105 animate-pulse'
            : isReady
            ? 'hover:scale-105 active:scale-90 cursor-pointer'
            : 'cursor-not-allowed opacity-75'
        }`}
        style={{
          backgroundColor: isActive
            ? `${abilityDef.themeColor}40`
            : isReady
            ? 'rgba(15, 23, 42, 0.88)'
            : 'rgba(15, 23, 42, 0.75)',
          borderColor: isActive
            ? '#ffffff'
            : isReady
            ? abilityDef.themeColor
            : 'rgba(71, 85, 105, 0.7)',
          boxShadow: isActive
            ? `0 0 25px ${abilityDef.themeColor}, inset 0 0 12px ${abilityDef.themeColor}`
            : isReady
            ? `0 0 16px ${abilityDef.themeColor}66`
            : 'none',
        }}
      >
        {/* Cooldown Dark Overlay Radial Mask */}
        {!isReady && (
          <div
            className="absolute inset-0 bg-slate-950/80 transition-all pointer-events-none"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${
                cdRatio > 0.125 ? '100% 0%,' : ''
              }${cdRatio > 0.375 ? '100% 100%,' : ''}${
                cdRatio > 0.625 ? '0% 100%,' : ''
              }${cdRatio > 0.875 ? '0% 0%,' : ''}${
                50 + Math.cos(cdRatio * Math.PI * 2 - Math.PI / 2) * 60
              }% ${50 + Math.sin(cdRatio * Math.PI * 2 - Math.PI / 2) * 60}%)`,
            }}
          />
        )}

        {/* Ability Icon Display */}
        <span className="text-xl sm:text-2xl select-none z-10 filter drop-shadow">
          {abilityDef.icon}
        </span>

        {/* Cooldown Text Overlay if on cooldown */}
        {!isReady && (
          <span className="absolute z-20 font-cyber font-black text-xs text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {Math.ceil(cooldownTimer)}s
          </span>
        )}

        {/* Active glowing ring shimmer */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-2xl border border-white/60 pointer-events-none animate-ping"
            style={{ borderColor: abilityDef.themeColor }}
          />
        )}
      </button>

      {/* Ability Name Tag */}
      <span
        className="text-[8px] sm:text-[9px] font-cyber tracking-wider font-bold mt-0.5 uppercase drop-shadow text-center max-w-[80px] truncate"
        style={{ color: isReady || isActive ? abilityDef.themeColor : '#94a3b8' }}
      >
        {abilityDef.activeName}
      </span>
    </div>
  );
};
