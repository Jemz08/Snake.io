import React, { useState, useEffect } from 'react';
import { PlayerProfile, SkinDef } from '../types';
import { getSkinById } from '../utils/skins';
import { getDeathEffectById } from '../utils/deathEffects';
import { WEAPONS } from '../utils/weapons';
import { SnakePreviewCanvas } from './SnakePreviewCanvas';
import {
  Play,
  ShoppingBag,
  Trophy,
  Coins,
  Crosshair,
  Volume2,
  VolumeX,
  Bomb,
  Zap,
  Target,
  Swords,
  Maximize,
  Minimize,
  Flame,
  Download,
} from 'lucide-react';
import { getSoundMuted, setSoundMuted } from '../utils/audio';

interface LobbyViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: Partial<PlayerProfile>) => void;
  onStartGame: () => void;
  onOpenShop: (tab?: 'skins' | 'death-effects') => void;
  onOpenLeaderboard: () => void;
  onOpenMissions: () => void;
  onOpenExport?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  profile,
  onUpdateProfile,
  onStartGame,
  onOpenShop,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenExport,
}) => {
  const [playerName, setPlayerName] = useState(profile.name);
  const [muted, setMuted] = useState(getSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const selectedSkin = getSkinById(profile.selectedSkinId);
  const selectedDeathEffect = getDeathEffectById(profile.selectedDeathEffectId || 'cyber-matrix');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 16);
    setPlayerName(val);
    onUpdateProfile({ name: val });
  };

  const toggleSound = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.().catch(() => {});
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      id="lobby-container"
      className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-slate-950 via-[#0b101d] to-slate-950"
      style={{
        paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
        paddingRight: 'max(14px, env(safe-area-inset-right, 14px))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        paddingLeft: 'max(14px, env(safe-area-inset-left, 14px))',
      }}
    >
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto gap-2 mb-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Swords className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="font-cyber text-lg sm:text-2xl md:text-3xl font-black text-white tracking-widest uppercase flex items-center gap-1.5 sm:gap-2">
              SNAKE<span className="text-cyan-400">²</span>
              <span className="text-[10px] sm:text-xs bg-rose-600/90 text-white px-1.5 sm:px-2 py-0.5 rounded font-black tracking-normal">
                ARMED ARENA
              </span>
            </h1>
            <p className="text-[9px] sm:text-[11px] text-slate-400 font-cyber tracking-wider hidden sm:block">
              BATTLE ROYALE .IO • WEAPON LOOTS • CYBER MECH COMBAT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Daily Missions Button */}
          <button
            id="btn-lobby-missions"
            type="button"
            onClick={onOpenMissions}
            className="flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-cyan-300 font-cyber font-bold transition-all shadow-sm"
            title="Open Daily Missions"
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-black hidden sm:inline">MISSIONS</span>
          </button>

          {/* Leaderboard Button */}
          <button
            id="btn-lobby-leaderboard"
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-amber-300 font-cyber font-bold transition-all shadow-sm"
            title="Open Arena Leaderboards"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black hidden sm:inline">RANKS</span>
          </button>

          {/* Cash / Coins Display */}
          <button
            id="lobby-coins-display"
            type="button"
            onClick={() => onOpenShop('death-effects')}
            className="flex items-center gap-1.5 sm:gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-amber-400 font-cyber font-bold shadow-sm transition-all"
            title="Kill enemies to earn cash! Click to open shop"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-amber-300" />
            <span className="text-xs sm:text-sm font-black">${profile.coins} CASH</span>
          </button>

          {/* High Score */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300 font-cyber text-xs">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>BEST: {profile.highScore}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="btn-lobby-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-cyan-400" /> : <Maximize className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Download / Export Button */}
          {onOpenExport && (
            <button
              id="btn-lobby-export"
              type="button"
              onClick={onOpenExport}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/60 transition-colors"
              title="Download File / Export Project"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Center Showcase Landscape Grid */}
      <div className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-center py-3 z-10">
        {/* Left Column: Player Card & Deployment */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-cyber text-xs font-bold text-cyan-400 uppercase tracking-wider">
                PILOT CALLSIGN
              </span>
              <span className="text-[10px] text-slate-400 font-cyber">16 CHARS MAX</span>
            </div>

            <input
              id="input-player-name"
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Enter your name..."
              className="w-full bg-slate-950/90 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 font-cyber text-base sm:text-lg font-bold text-white tracking-wider outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Selected Skin Display & Shop Shortcut */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg border border-white/20 shadow-sm shrink-0"
                style={{ backgroundColor: selectedSkin.primaryColor }}
              />
              <div className="min-w-0">
                <span className="font-cyber text-[10px] text-slate-400 block">CYBER FRAME</span>
                <span className="font-cyber text-xs sm:text-sm font-black text-white truncate block">{selectedSkin.name}</span>
              </div>
            </div>

            <button
              id="btn-lobby-open-shop"
              type="button"
              onClick={() => onOpenShop('skins')}
              className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400 text-cyan-300 font-cyber text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all shrink-0"
            >
              <ShoppingBag className="w-3 h-3" />
              SKINS
            </button>
          </div>

          {/* Selected Death Effect Display & Shop Shortcut */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full border border-white/20 shadow-sm flex items-center justify-center text-xs shrink-0"
                style={{ backgroundColor: selectedDeathEffect.primaryColor }}
              >
                💥
              </div>
              <div className="min-w-0">
                <span className="font-cyber text-[10px] text-slate-400 block">DEATH EFFECT</span>
                <span className="font-cyber text-xs sm:text-sm font-black text-rose-300 truncate block">{selectedDeathEffect.name}</span>
              </div>
            </div>

            <button
              id="btn-lobby-open-effects"
              type="button"
              onClick={() => onOpenShop('death-effects')}
              className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400 text-rose-300 font-cyber text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all shrink-0"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              EFFECTS
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-2 text-center font-cyber">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[9px] text-slate-400 block uppercase">RECORD KILLS</span>
              <span className="text-base font-black text-rose-400">{profile.maxKills}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[9px] text-slate-400 block uppercase">KILL CASH BOUNTY</span>
              <span className="text-base font-black text-amber-400">+$50 / KILL</span>
            </div>
          </div>

          {/* DEPLOY BUTTON */}
          <button
            id="btn-start-game"
            type="button"
            onClick={onStartGame}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:brightness-110 text-slate-950 font-cyber text-lg sm:text-xl font-black tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            DEPLOY ARENA
          </button>

          {/* Secondary Quick Action Row: Missions & Ranks */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-cyber">
            <button
              id="btn-quick-missions"
              type="button"
              onClick={onOpenMissions}
              className="py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              MISSIONS
            </button>
            <button
              id="btn-quick-ranks"
              type="button"
              onClick={onOpenLeaderboard}
              className="py-2 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              LEADERBOARD
            </button>
          </div>
        </div>

        {/* Center: Live Snake² Interactive Showcase */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[340px] aspect-[4/3] flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="absolute top-3 left-4 font-cyber text-xs font-black tracking-widest text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SNAKE² CYBER MECH ACTIVE
            </div>
            <div className="w-full h-full pt-6">
              <SnakePreviewCanvas skin={selectedSkin} weaponType="ar" width={320} height={200} />
            </div>
            <div className="font-cyber text-[11px] text-slate-400 tracking-wider mt-1">
              Chamfered Armor Plates • Head Weapon Mount • Laser Sight
            </div>
          </div>
        </div>

        {/* Right: Battlefield Weapons Armory Specification Guide */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="font-cyber text-sm font-black text-white uppercase tracking-wider">
              BATTLEFIELD WEAPON LOOTS
            </h3>
          </div>

          <div className="space-y-2.5">
            {/* Grenade */}
            <div className="bg-slate-950/70 border border-amber-500/40 rounded-xl p-2.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
                <Bomb className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-cyber text-xs font-black text-amber-300 uppercase">
                    GRENADE (×2 AMMO)
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 font-cyber text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/40">
                    1-HIT KILL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  1-hit kill lethal shockwave if it explodes near other snakes!
                </p>
              </div>
            </div>

            {/* Pistol */}
            <div className="bg-slate-950/70 border border-sky-500/40 rounded-xl p-2.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 shrink-0">
                <Crosshair className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-cyber text-xs font-black text-sky-300 uppercase">
                    PISTOL (×10 AMMO)
                  </span>
                  <span className="bg-sky-500/20 text-sky-300 font-cyber text-[9px] font-black px-1.5 py-0.5 rounded border border-sky-500/40">
                    SHORT RANGE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  Fast snappy double-tap blaster for high-speed dogfights.
                </p>
              </div>
            </div>

            {/* AR */}
            <div className="bg-slate-950/70 border border-emerald-500/40 rounded-xl p-2.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-cyber text-xs font-black text-emerald-300 uppercase">
                    AR RIFLE (×30 AMMO)
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 font-cyber text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/40">
                    MID RANGE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  Rapid-fire automatic stream to shred armor and control zones.
                </p>
              </div>
            </div>

            {/* Sniper */}
            <div className="bg-slate-950/70 border border-rose-500/40 rounded-xl p-2.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-cyber text-xs font-black text-rose-300 uppercase">
                    SNIPER (×5 AMMO)
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 font-cyber text-[9px] font-black px-1.5 py-0.5 rounded border border-rose-500/40">
                    LONG RANGE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  High-velocity rail beam piercing targets from extreme distance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls Tip */}
      <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[11px] font-cyber text-slate-400 border-t border-slate-800/80 pt-3 z-10">
        <div className="flex items-center gap-4">
          <span>🕹️ JOYSTICK: Move & Aim</span>
          <span>🔴 FIRE: Shoot equipped weapon</span>
          <span>⚡ BOOST: Speed Dash</span>
        </div>
        <div className="text-cyan-400 font-bold">
          TIP: Grenade explosion eliminates any snake in 1-HIT!
        </div>
      </div>
    </div>
  );
};
