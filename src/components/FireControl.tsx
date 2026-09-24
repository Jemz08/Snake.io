import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WeaponType } from '../types';
import { WEAPONS } from '../utils/weapons';
import { Bomb, Crosshair, Zap, Target, Flame, Sparkles } from 'lucide-react';

interface FireControlProps {
  weapon: WeaponType;
  ammo: number;
  targetLocked?: boolean;
  onAim: (angle: number, isAiming: boolean) => void;
  onFire: () => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  padScale?: number;
  padOpacity?: number;
  boostScale?: number;
  boostOpacity?: number;
}

export const FireControl: React.FC<FireControlProps> = ({
  weapon,
  ammo,
  targetLocked = false,
  onAim,
  onFire,
  onBoostStart,
  onBoostEnd,
  padScale = 1.0,
  padOpacity = 0.95,
  boostScale = 1.0,
  boostOpacity = 0.95,
}) => {
  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(0);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isBoosting, setIsBoosting] = useState(false);

  const padRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const boostPointerIdRef = useRef<number | null>(null);

  const weaponCfg = weapon ? WEAPONS[weapon] : null;

  const triggerHaptic = (ms: number = 15) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch {
      // ignore
    }
  };

  const handlePadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!weapon || ammo <= 0) return;
    e.preventDefault();
    activePointerIdRef.current = e.pointerId;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateKnobAndAim(e.clientX, e.clientY, true);
    triggerHaptic(20);
  };

  const handlePadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateKnobAndAim(e.clientX, e.clientY, true);
  };

  const handlePadPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      e.preventDefault();
      activePointerIdRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsAiming(false);
      setKnobPos({ x: 0, y: 0 });
      onAim(aimAngle, false);
    }
  };

  const updateKnobAndAim = (clientX: number, clientY: number, active: boolean) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width * 0.42;

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);

    const x = Math.cos(angle) * clampedDist;
    const y = Math.sin(angle) * clampedDist;

    setKnobPos({ x, y });
    setAimAngle(angle);
    setIsAiming(active);
    onAim(angle, active);
  };

  // Boost Button Handlers
  const handleBoostDown = (e: React.PointerEvent) => {
    e.preventDefault();
    boostPointerIdRef.current = e.pointerId;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsBoosting(true);
    triggerHaptic(15);
    onBoostStart();
  };

  const handleBoostUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (boostPointerIdRef.current === e.pointerId) {
      boostPointerIdRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsBoosting(false);
      onBoostEnd();
    }
  };

  // Keyboard shortcut listeners for Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
        setIsBoosting(true);
        onBoostStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setIsBoosting(false);
        onBoostEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onBoostStart, onBoostEnd]);

  // Render appropriate weapon icon
  const renderWeaponIcon = () => {
    if (!weapon) return <Crosshair className="w-5 h-5 opacity-40 text-slate-400" />;
    switch (weapon) {
      case 'grenade':
        return <Bomb className="w-5 h-5 text-amber-400" />;
      case 'pistol':
        return <Crosshair className="w-5 h-5 text-sky-400" />;
      case 'ar':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'sniper':
        return <Target className="w-5 h-5 text-rose-500" />;
    }
  };

  // Calculate degrees for display (0° - 360°)
  const deg = Math.round(((aimAngle * 180) / Math.PI + 360) % 360);

  return (
    <div id="fire-control-group" className="flex items-end gap-3 select-none touch-none">
      {/* Boost / Thruster Button */}
      <div
        className="flex flex-col items-center mb-0.5"
        style={{
          transform: `scale(${boostScale})`,
          transformOrigin: 'bottom center',
          opacity: boostOpacity,
        }}
      >
        <button
          id="btn-boost"
          type="button"
          onPointerDown={handleBoostDown}
          onPointerUp={handleBoostUp}
          onPointerCancel={handleBoostUp}
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border-2 transition-all active:scale-95 shadow-lg ${
            isBoosting
              ? 'bg-amber-500 border-yellow-200 text-white shadow-[0_0_20px_#f59e0b] scale-105'
              : 'bg-slate-900/85 border-slate-700/90 text-amber-400 hover:border-amber-500/60'
          } backdrop-blur-md`}
        >
          <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${isBoosting ? 'animate-bounce' : ''}`} />
        </button>
        <span className="text-[8px] sm:text-[9px] font-cyber tracking-wider font-bold text-slate-400 mt-1 uppercase">
          BOOST
        </span>
      </div>

      {/* Laser Aim Drag Turret Stick */}
      <div
        className="flex flex-col items-center"
        style={{
          transform: `scale(${padScale})`,
          transformOrigin: 'bottom right',
          opacity: padOpacity,
        }}
      >
        {/* Status Badge above Pad */}
        {weapon && ammo > 0 && (targetLocked || isAiming) && (
          <div
            id="laser-aim-status-badge"
            className={`mb-0.5 px-1.5 py-0.5 rounded-full font-cyber text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
              targetLocked
                ? 'bg-rose-950/90 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-pulse'
                : 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
            }`}
          >
            {targetLocked ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>LOCKED</span>
              </>
            ) : (
              <>
                <Crosshair className="w-2.5 h-2.5 text-cyan-400" />
                <span>{deg}°</span>
              </>
            )}
          </div>
        )}

        {/* The Drag Pad Base */}
        <div
          id="pad-laser-aim"
          ref={padRef}
          onPointerDown={handlePadPointerDown}
          onPointerMove={handlePadPointerMove}
          onPointerUp={handlePadPointerUp}
          onPointerCancel={handlePadPointerUp}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
            !weapon || ammo <= 0
              ? 'bg-slate-950/70 border-slate-800/80 opacity-60'
              : targetLocked
              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
              : isAiming
              ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]'
              : 'bg-slate-950/80 border-slate-700/80 hover:border-cyan-500/50 shadow-xl'
          } backdrop-blur-md`}
        >
          {/* Compass ticks & radar crosshairs */}
          <div className="absolute inset-0 rounded-full border border-dashed border-white/10 pointer-events-none" />
          <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />

          {/* Rotating Laser Sight Indicator Needle on Pad */}
          {weapon && (
            <div
              className="absolute w-full h-full pointer-events-none flex items-center justify-center transition-transform duration-75"
              style={{ transform: `rotate(${aimAngle}rad)` }}
            >
              <div
                className={`absolute right-1 w-4 sm:w-5 h-1 rounded-full ${
                  targetLocked
                    ? 'bg-rose-400 shadow-[0_0_10px_#f43f5e]'
                    : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                }`}
              />
              <div
                className={`absolute right-0 w-1.5 h-1.5 rounded-full -mr-0.5 ${
                  targetLocked ? 'bg-rose-500' : 'bg-cyan-300'
                }`}
              />
            </div>
          )}

          {/* Interactive Thumb Knob */}
          <div
            id="pad-laser-knob"
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex flex-col items-center justify-center shadow-lg transition-transform pointer-events-none ${
              !weapon || ammo <= 0
                ? 'bg-slate-900 border-slate-700 text-slate-600'
                : targetLocked
                ? 'bg-rose-600 border-white text-white shadow-[0_0_20px_#f43f5e]'
                : isAiming
                ? 'bg-cyan-600 border-cyan-200 text-white shadow-[0_0_15px_#06b6d4]'
                : 'bg-slate-900/90 border-slate-600 text-slate-300'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          >
            {renderWeaponIcon()}
            {weapon && ammo > 0 && (
              <span className="text-[7px] sm:text-[8px] font-cyber font-black tracking-tighter">
                ×{ammo}
              </span>
            )}
          </div>
        </div>

        {/* Label below pad */}
        <span className="text-[8px] sm:text-[9px] font-cyber tracking-wider font-bold text-slate-400 mt-1 uppercase">
          AIM & FIRE
        </span>
      </div>
    </div>
  );
};
