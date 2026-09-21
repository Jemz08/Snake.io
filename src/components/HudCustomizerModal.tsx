import React, { useState, useRef } from 'react';
import { HudLayoutConfig } from '../types';
import { saveHudLayout, resetHudLayout, DEFAULT_HUD_LAYOUT } from '../utils/hudLayout';
import {
  Sliders,
  RotateCcw,
  Check,
  X,
  Move,
  Flame,
  Crosshair,
  Compass,
  Zap,
  Sparkles,
  Shield,
  Eye,
} from 'lucide-react';

interface HudCustomizerModalProps {
  layout: HudLayoutConfig;
  onSave: (newLayout: HudLayoutConfig) => void;
  onClose: () => void;
}

type SelectedElementKey = 'joystick' | 'firePad' | 'boostBtn' | 'abilityBtn' | 'weaponGauge' | 'minimap' | 'statsBar';

export const HudCustomizerModal: React.FC<HudCustomizerModalProps> = ({
  layout: initialLayout,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<HudLayoutConfig>({ ...initialLayout });
  const [selectedKey, setSelectedKey] = useState<SelectedElementKey>('boostBtn');
  const [activeDragKey, setActiveDragKey] = useState<SelectedElementKey | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initX: number; initY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pinch-to-zoom scaling support
  const touchDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1.0);

  const handlePointerDown = (key: SelectedElementKey, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedKey(key);
    setActiveDragKey(key);
    const item = config[key];
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initX: item.x,
      initY: item.y,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragKey || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, dragStartRef.current.initX + dx));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.initY + dy));

    setConfig((prev) => ({
      ...prev,
      [activeDragKey]: {
        ...prev[activeDragKey],
        x: Math.round(newX),
        y: Math.round(newY),
      },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragKey) {
      setActiveDragKey(null);
      dragStartRef.current = null;
    }
  };

  // Touch handlers for pinching to scale
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedKey) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
      initialScaleRef.current = config[selectedKey].scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null && selectedKey) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchDistanceRef.current;
      const newScale = Math.max(0.6, Math.min(1.6, initialScaleRef.current * ratio));
      setConfig((prev) => ({
        ...prev,
        [selectedKey]: {
          ...prev[selectedKey],
          scale: parseFloat(newScale.toFixed(2)),
        },
      }));
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  const handleSave = () => {
    saveHudLayout(config);
    onSave(config);
    onClose();
  };

  const handleReset = () => {
    const res = resetHudLayout();
    setConfig(res);
  };

  const currentItem = config[selectedKey];

  return (
    <div
      id="hud-customizer-modal"
      className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col select-none backdrop-blur-md animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-slate-900/90 border-b border-slate-800 text-white z-20">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-cyber font-black text-sm sm:text-base text-cyan-300 tracking-wider">
              HUD & CONTROLS LAYOUT EDITOR
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400">
              Drag elements anywhere • Click to select & adjust scale with slider or pinch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-cyber font-bold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-cyber font-black tracking-wider shadow-[0_0_12px_#06b6d4] transition-all"
          >
            <Check className="w-4 h-4" />
            SAVE & APPLY
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Screen Canvas */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 bg-slate-950/80 overflow-hidden border-2 border-dashed border-cyan-500/20 m-2 rounded-2xl"
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* 1. STATS BAR */}
        <div
          id="hud-edit-stats"
          onPointerDown={(e) => handlePointerDown('statsBar', e)}
          className={`absolute cursor-move transition-shadow rounded-xl p-1.5 border flex items-center gap-2 ${
            selectedKey === 'statsBar'
              ? 'ring-2 ring-cyan-400 bg-cyan-950/70 border-cyan-300 shadow-[0_0_15px_#06b6d4]'
              : 'bg-slate-900/80 border-slate-700'
          }`}
          style={{
            left: `${config.statsBar.x}%`,
            top: `${config.statsBar.y}%`,
            transform: `translate(-50%, 0) scale(${config.statsBar.scale})`,
            opacity: config.statsBar.opacity,
          }}
        >
          <div className="font-cyber font-bold text-xs text-cyan-300 px-2 py-0.5 bg-cyan-900/40 rounded border border-cyan-500/40 flex items-center gap-1">
            <Move className="w-3 h-3 text-cyan-400" />
            VITAL STATS (SCORE / HP)
          </div>
        </div>

        {/* 2. MINIMAP */}
        <div
          id="hud-edit-minimap"
          onPointerDown={(e) => handlePointerDown('minimap', e)}
          className={`absolute cursor-move rounded-xl p-1 border flex flex-col items-center justify-center ${
            selectedKey === 'minimap'
              ? 'ring-2 ring-cyan-400 bg-cyan-950/70 border-cyan-300 shadow-[0_0_15px_#06b6d4]'
              : 'bg-slate-900/80 border-slate-700'
          }`}
          style={{
            left: `${config.minimap.x}%`,
            top: `${config.minimap.y}%`,
            transform: `translate(-50%, -50%) scale(${config.minimap.scale})`,
            opacity: config.minimap.opacity,
            width: 100,
            height: 100,
          }}
        >
          <Compass className="w-8 h-8 text-cyan-400 mb-1" />
          <span className="font-cyber font-black text-[9px] text-slate-300">RADAR MINIMAP</span>
        </div>

        {/* 3. WEAPON GAUGE */}
        <div
          id="hud-edit-weapon"
          onPointerDown={(e) => handlePointerDown('weaponGauge', e)}
          className={`absolute cursor-move rounded-xl p-2 border flex flex-col items-center ${
            selectedKey === 'weaponGauge'
              ? 'ring-2 ring-cyan-400 bg-cyan-950/70 border-cyan-300 shadow-[0_0_15px_#06b6d4]'
              : 'bg-slate-900/80 border-slate-700'
          }`}
          style={{
            left: `${config.weaponGauge.x}%`,
            top: `${config.weaponGauge.y}%`,
            transform: `translate(-50%, -50%) scale(${config.weaponGauge.scale})`,
            opacity: config.weaponGauge.opacity,
          }}
        >
          <Zap className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="font-cyber font-black text-[9px] text-white">AMMO GAUGE</span>
        </div>

        {/* 4. VIRTUAL JOYSTICK */}
        <div
          id="hud-edit-joystick"
          onPointerDown={(e) => handlePointerDown('joystick', e)}
          className={`absolute cursor-move rounded-full border-2 flex items-center justify-center ${
            selectedKey === 'joystick'
              ? 'ring-2 ring-cyan-400 bg-cyan-950/70 border-cyan-300 shadow-[0_0_20px_#06b6d4]'
              : 'bg-slate-900/80 border-slate-700'
          }`}
          style={{
            left: `${config.joystick.x}%`,
            top: `${config.joystick.y}%`,
            transform: `translate(-50%, -50%) scale(${config.joystick.scale})`,
            opacity: config.joystick.opacity,
            width: 90,
            height: 90,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-[9px] font-cyber font-bold text-cyan-300">
            JOY
          </div>
          {config.isFloatingJoystick && (
            <span className="absolute -top-6 text-[8px] font-cyber text-cyan-400 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-400">
              FLOATING
            </span>
          )}
        </div>

        {/* 5. LASER AIM & FIRE PAD */}
        <div
          id="hud-edit-firepad"
          onPointerDown={(e) => handlePointerDown('firePad', e)}
          className={`absolute cursor-move rounded-full border-2 flex flex-col items-center justify-center ${
            selectedKey === 'firePad'
              ? 'ring-2 ring-cyan-400 bg-cyan-950/70 border-cyan-300 shadow-[0_0_20px_#06b6d4]'
              : 'bg-slate-900/80 border-slate-700'
          }`}
          style={{
            left: `${config.firePad.x}%`,
            top: `${config.firePad.y}%`,
            transform: `translate(-50%, -50%) scale(${config.firePad.scale})`,
            opacity: config.firePad.opacity,
            width: 90,
            height: 90,
          }}
        >
          <Crosshair className="w-6 h-6 text-cyan-400 mb-0.5" />
          <span className="font-cyber font-black text-[8px] text-cyan-300">LASER AIM</span>
        </div>

        {/* 6. BOOST BUTTON */}
        <div
          id="hud-edit-boost"
          onPointerDown={(e) => handlePointerDown('boostBtn', e)}
          className={`absolute cursor-move rounded-full border-2 flex flex-col items-center justify-center ${
            selectedKey === 'boostBtn'
              ? 'ring-2 ring-cyan-400 bg-orange-950/70 border-amber-400 shadow-[0_0_20px_#f97316]'
              : 'bg-slate-900/80 border-slate-700'
          }`}
          style={{
            left: `${config.boostBtn.x}%`,
            top: `${config.boostBtn.y}%`,
            transform: `translate(-50%, -50%) scale(${config.boostBtn.scale})`,
            opacity: config.boostBtn.opacity,
            width: 76,
            height: 76,
          }}
        >
          <Flame className="w-6 h-6 text-amber-400" />
          <span className="font-cyber font-black text-[8px] text-amber-300">BOOST</span>
        </div>

        {/* 7. ARCHETYPE ABILITY BUTTON */}
        {config.abilityBtn && (
          <div
            id="hud-edit-ability"
            onPointerDown={(e) => handlePointerDown('abilityBtn', e)}
            className={`absolute cursor-move rounded-2xl border-2 flex flex-col items-center justify-center ${
              selectedKey === 'abilityBtn'
                ? 'ring-2 ring-cyan-400 bg-purple-950/70 border-purple-400 shadow-[0_0_20px_#c084fc]'
                : 'bg-slate-900/80 border-slate-700'
            }`}
            style={{
              left: `${config.abilityBtn.x}%`,
              top: `${config.abilityBtn.y}%`,
              transform: `translate(-50%, -50%) scale(${config.abilityBtn.scale})`,
              opacity: config.abilityBtn.opacity,
              width: 70,
              height: 70,
            }}
          >
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="font-cyber font-black text-[8px] text-purple-300">ABILITY</span>
          </div>
        )}
      </div>

      {/* Bottom Configuration Toolbar for Selected Control */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 text-white z-20 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Selected Element Name & Floating Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-cyber text-slate-400 uppercase tracking-widest">
              SELECTED CONTROL
            </span>
            <span className="text-sm font-cyber font-black text-cyan-300 uppercase">
              {selectedKey === 'joystick' && 'Movement Joystick'}
              {selectedKey === 'firePad' && 'Laser Aim & Auto-Fire Pad'}
              {selectedKey === 'boostBtn' && 'Sprint Boost Button'}
              {selectedKey === 'abilityBtn' && 'Active Archetype Ability Button'}
              {selectedKey === 'weaponGauge' && 'Vertical Weapon Ammo Gauge'}
              {selectedKey === 'minimap' && 'Radar Minimap'}
              {selectedKey === 'statsBar' && 'Top Stats Bar'}
            </span>
          </div>

          {/* Floating Joystick toggle when joystick is selected */}
          {selectedKey === 'joystick' && (
            <button
              onClick={() =>
                setConfig((prev) => ({ ...prev, isFloatingJoystick: !prev.isFloatingJoystick }))
              }
              className={`px-2.5 py-1 rounded-lg border font-cyber text-xs font-bold transition-all ${
                config.isFloatingJoystick
                  ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Mode: {config.isFloatingJoystick ? '🌊 Floating (Under Finger)' : '📌 Fixed Position'}
            </button>
          )}
        </div>

        {/* Center: Scale Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-cyber text-slate-300 font-bold">SCALE:</span>
          <input
            type="range"
            min="0.6"
            max="1.5"
            step="0.05"
            value={currentItem.scale}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setConfig((prev) => ({
                ...prev,
                [selectedKey]: { ...prev[selectedKey], scale: val },
              }));
            }}
            className="w-28 sm:w-40 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-cyan-300 w-10">
            {Math.round(currentItem.scale * 100)}%
          </span>
        </div>

        {/* Center-Right: Opacity Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-cyber text-slate-300 font-bold">OPACITY:</span>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={currentItem.opacity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setConfig((prev) => ({
                ...prev,
                [selectedKey]: { ...prev[selectedKey], opacity: val },
              }));
            }}
            className="w-24 sm:w-32 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-cyan-300 w-10">
            {Math.round(currentItem.opacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
