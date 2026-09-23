import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sliders,
  Zap,
  Shield,
  Crosshair,
  Sparkles,
  Trophy,
  Package,
  BookOpen,
  User,
  Check,
  Smartphone,
  Cpu,
} from 'lucide-react';
import { GameSettings, TargetFpsOption, saveGameSettings } from '../utils/settings';
import { playTestSound } from '../utils/audio';
import { FpsInfo, useFpsDetector } from '../utils/fpsDetector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  playerName: string;
  onUpdatePlayerName: (newName: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  playerName,
  onUpdatePlayerName,
}) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'audio' | 'profile' | 'mechanics'>('performance');
  const [localName, setLocalName] = useState(playerName);
  const [nameSaved, setNameSaved] = useState(false);
  const fpsInfo = useFpsDetector();

  if (!isOpen) return null;

  const fpsOptions: TargetFpsOption[] = [60, 90, 120, 144, 'unlimited'];

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = localName.trim().slice(0, 16);
    if (clean) {
      onUpdatePlayerName(clean);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-white font-cyber">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
                CYBER SNAKE SETTINGS
              </h2>
              <p className="text-[11px] text-slate-400">
                Display: <span className="text-cyan-400 font-bold">{fpsInfo.label}</span> · Dimensity & High-Hz Ready
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto scrollbar-none px-2 sm:px-4">
          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'performance'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>FPS & GRAPHICS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'audio'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>SOUND LEVELS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>PILOT IDENTITY</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'mechanics'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>MECHANICS & GUIDE</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: FPS & PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-5">
              {/* Device Chipset Note */}
              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-black text-cyan-300 block uppercase">
                    HIGH REFRESH RATE CHIPSET SUPPORT
                  </span>
                  <span className="text-slate-300">
                    Optimized for 120Hz & 144Hz displays (MediaTek Dimensity 8350, Snapdragon, Apple ProMotion).
                    Current hardware refresh detected: <strong className="text-white">{fpsInfo.label}</strong>.
                  </span>
                </div>
              </div>

              {/* Target FPS Selector */}
              <div>
                <label className="text-xs font-black uppercase text-slate-300 block mb-2 flex items-center justify-between">
                  <span>TARGET FPS CAP:</span>
                  <span className="text-cyan-400">{settings.targetFps === 'unlimited' ? 'UNLOCKED' : `${settings.targetFps} FPS`}</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {fpsOptions.map((fps) => {
                    const isSelected = settings.targetFps === fps;
                    return (
                      <button
                        key={String(fps)}
                        type="button"
                        onClick={() => onUpdateSettings({ targetFps: fps })}
                        className={`py-2.5 px-2 rounded-xl border text-center font-black transition-all ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                            : 'bg-slate-950/70 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        <span className="block text-sm sm:text-base">
                          {fps === 'unlimited' ? 'MAX' : fps}
                        </span>
                        <span className="block text-[9px] opacity-80">
                          {fps === 120 ? '★ 120Hz' : fps === 'unlimited' ? 'UNLOCKED' : 'FPS'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* High Performance Mode Toggle */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-white block">120Hz Ultra Performance Mode</span>
                  <span className="text-xs text-slate-400 block">
                    Optimizes canvas pixel scale (DPR 1.25×) to lock steady 120 FPS on mobile devices without overheating.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ highPerformanceMode: !settings.highPerformanceMode })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-3 ${
                    settings.highPerformanceMode ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                      settings.highPerformanceMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Screen Shake Toggle */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-white block">Screen Shake on Explosions</span>
                  <span className="text-xs text-slate-400 block">
                    Cinematic camera vibration when Grenades and artillery detonate.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-3 ${
                    settings.screenShake ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                      settings.screenShake ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SOUND LEVELS */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Mute Toggle */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${settings.soundMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {settings.soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">Mute All Audio</span>
                    <span className="text-xs text-slate-400">Silences weapons, explosions, ability chimes, and crate roulette</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ soundMuted: !settings.soundMuted })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    settings.soundMuted ? 'bg-rose-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                      settings.soundMuted ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Master Volume Slider */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-300 uppercase">MASTER VOLUME</span>
                  <span className="text-cyan-400 font-mono text-sm">{settings.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => onUpdateSettings({ masterVolume: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  disabled={settings.soundMuted}
                />
              </div>

              {/* SFX Volume Slider */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-300 uppercase">SFX & WEAPONS VOLUME</span>
                  <span className="text-cyan-400 font-mono text-sm">{settings.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={(e) => onUpdateSettings({ sfxVolume: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  disabled={settings.soundMuted}
                />
              </div>

              {/* Test Audio Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={playTestSound}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  TEST SOUND LEVEL
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PILOT IDENTITY (CHANGE NAME) */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <form onSubmit={handleNameSubmit} className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-300 block">
                  CHANGE PILOT CALLSIGN / NAME:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value.slice(0, 16))}
                    placeholder="Enter new pilot name..."
                    className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 font-cyber text-base font-bold text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0"
                  >
                    {nameSaved ? <Check className="w-4 h-4 text-green-950" /> : null}
                    {nameSaved ? 'SAVED!' : 'SAVE NAME'}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Max 16 characters. This name appears on leaderboards, kill feeds, and bounty announcements.
                </span>
              </form>

              {/* Callsign Preview Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-black text-lg">
                    {localName.charAt(0).toUpperCase() || 'V'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">CURRENT BATTLE CALLSIGN</span>
                    <span className="text-base font-black text-white">{localName || playerName}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-bold text-xs uppercase">
                  ACTIVE PILOT
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: MECHANICS & GUIDE */}
          {activeTab === 'mechanics' && (
            <div className="space-y-4 text-xs">
              {/* 1. Controls */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <h3 className="text-sm font-black text-cyan-400 uppercase flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> 1. CONTROLS & BOOST
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>Steering:</strong> Drag the Virtual Joystick on the left, or touch/mouse steer anywhere on screen.<br />
                  • <strong>Boost / Sprint:</strong> Hold the BOOST button (or Spacebar / Right Click) to surge forward at double velocity. Consumes eaten mass/energy.
                </p>
              </div>

              {/* 2. Weapons */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <h3 className="text-sm font-black text-amber-400 uppercase flex items-center gap-2">
                  <Crosshair className="w-4 h-4" /> 2. BATTLEFIELD WEAPON LOOTS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg p-2">
                    <span className="font-black text-amber-300 block">💣 GRENADE (1-HIT KILL)</span>
                    <span className="text-slate-400">×2 Ammo. Massive explosive radius, vaporizes any snake upon contact.</span>
                  </div>
                  <div className="bg-slate-900/90 border border-lime-500/40 rounded-lg p-2">
                    <span className="font-black text-lime-300 block">🔫 PISTOL (28 DMG)</span>
                    <span className="text-slate-400">×12 Ammo. Semi-automatic fast reload sidearm.</span>
                  </div>
                  <div className="bg-slate-900/90 border border-sky-500/40 rounded-lg p-2">
                    <span className="font-black text-sky-300 block">⚡ AR (32 DMG)</span>
                    <span className="text-slate-400">×24 Ammo. Automatic high fire-rate assault rifle.</span>
                  </div>
                  <div className="bg-slate-900/90 border border-rose-500/40 rounded-lg p-2">
                    <span className="font-black text-rose-300 block">🎯 SNIPER (75 DMG)</span>
                    <span className="text-slate-400">×5 Ammo. High-velocity armor piercing long-range beam.</span>
                  </div>
                </div>
              </div>

              {/* 3. Defense */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <h3 className="text-sm font-black text-sky-400 uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4" /> 3. DEFENSIVE BUNKERS & SHIELDS
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>Shield Powerups:</strong> Collect glowing blue shield orbs to gain +100 HP shield overcharge.<br />
                  • <strong>Tactical Obstacles:</strong> Titanium bunkers and forcefield pillars block incoming enemy bullets. Use them for sniper cover!
                </p>
              </div>

              {/* 4. Warframe Archetypes & Abilities */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <h3 className="text-sm font-black text-purple-400 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 4. 16 SNAKE WARFRAME ARCHETYPES
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Every snake type features unique active and passive abilities:
                  <strong> Angel</strong> (Divine Shield), <strong>Devil</strong> (Hellfire ring), <strong>Void</strong> (Gravity vortex), 
                  <strong> Robot</strong> (Defense barrier), <strong>Dragon</strong> (Inferno blast), <strong>Cyber</strong> (EMP overload), 
                  <strong> Phoenix</strong> (Fire trail revival), <strong>Frost</strong> (Freeze aura), <strong>Venom</strong> (Acid spray), 
                  <strong> Storm</strong> (Chain lightning), <strong>Phantom</strong> (Ghost phase), <strong>Vampire</strong> (Lifesteal), 
                  <strong> Chrono</strong> (Time bubble), <strong>Ninja</strong> (Dash-slash melee), <strong>Crystal</strong> (Reflect bullets), 
                  <strong> Alien</strong> (Acid nova).
                </p>
              </div>

              {/* 5. Crates & Economy */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <h3 className="text-sm font-black text-yellow-400 uppercase flex items-center gap-2">
                  <Package className="w-4 h-4" /> 5. SUPPLY CRATE ROULETTE & BOUNTIES
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>Kill Bounty:</strong> Earn +$50 CASH for every enemy snake eliminated.<br />
                  • <strong>Cyber Supply Crate (1,000 Coins):</strong> Roll CS-style crate roulette with 6 tiers: Common (40%), Uncommon (28.5%), Epic (18%), Legendary (8.5%), Mythic (4.2%), and ★ SECRET ★ (0.8%).<br />
                  • <strong>Duplicate Cashback:</strong> Unlocking a skin you already own instantly awards 250 to 5,000 coins cashback!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">Settings auto-save instantly</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
