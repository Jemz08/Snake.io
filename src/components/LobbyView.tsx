import React, { useState, useEffect } from 'react';
import { PlayerProfile, SkinDef, SnakeArchetype } from '../types';
import { SKINS, getSkinById } from '../utils/skins';
import { getDeathEffectById } from '../utils/deathEffects';
import { WEAPONS } from '../utils/weapons';
import { SnakePreviewCanvas } from './SnakePreviewCanvas';
import { DynamicCyberBackground } from './DynamicCyberBackground';
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
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
  Sliders,
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
  onOpenHudCustomizer?: () => void;
}

const ARCHETYPES: Array<{
  id: SnakeArchetype;
  label: string;
  icon: string;
  premierSkinId: string;
  colorClass: string;
  activeBorder: string;
}> = [
  {
    id: 'angel',
    label: 'Angel',
    icon: '🪽',
    premierSkinId: 'angel-seraph',
    colorClass: 'text-amber-300 bg-amber-500/10 border-amber-400/40',
    activeBorder: 'border-yellow-400 bg-yellow-400/25 shadow-[0_0_15px_rgba(250,204,21,0.4)] text-yellow-200',
  },
  {
    id: 'devil',
    label: 'Devil',
    icon: '😈',
    premierSkinId: 'devil-infernal',
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/40',
    activeBorder: 'border-rose-500 bg-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.4)] text-rose-200',
  },
  {
    id: 'blackhole',
    label: 'Blackhole',
    icon: '🌌',
    premierSkinId: 'blackhole-void',
    colorClass: 'text-purple-300 bg-purple-500/10 border-purple-500/40',
    activeBorder: 'border-purple-400 bg-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-purple-200',
  },
  {
    id: 'robot',
    label: 'Robot',
    icon: '🤖',
    premierSkinId: 'robot-titan',
    colorClass: 'text-sky-300 bg-sky-500/10 border-sky-400/40',
    activeBorder: 'border-sky-400 bg-sky-500/25 shadow-[0_0_15px_rgba(56,189,248,0.4)] text-sky-100',
  },
  {
    id: 'dragon',
    label: 'Dragon',
    icon: '🐉',
    premierSkinId: 'dragon-wyrm',
    colorClass: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/40',
    activeBorder: 'border-emerald-400 bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-emerald-100',
  },
  {
    id: 'cyber',
    label: 'Cyber',
    icon: '⚡',
    premierSkinId: 'cyber-viper',
    colorClass: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/40',
    activeBorder: 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-100',
  },
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  profile,
  onUpdateProfile,
  onStartGame,
  onOpenShop,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenExport,
  onOpenHudCustomizer,
}) => {
  const [playerName, setPlayerName] = useState(profile.name);
  const [muted, setMuted] = useState(getSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inspectingSkinId, setInspectingSkinId] = useState<string>(profile.selectedSkinId);

  useEffect(() => {
    setInspectingSkinId(profile.selectedSkinId);
  }, [profile.selectedSkinId]);

  const inspectingSkin = getSkinById(inspectingSkinId);
  const isSkinUnlocked = profile.unlockedSkinIds.includes(inspectingSkin.id);
  const isSkinEquipped = profile.selectedSkinId === inspectingSkin.id;
  const canAffordSkin = profile.coins >= inspectingSkin.price;
  const selectedDeathEffect = getDeathEffectById(profile.selectedDeathEffectId || 'cyber-matrix');

  const currentSkinIdx = SKINS.findIndex((s) => s.id === inspectingSkin.id);

  const handlePrevSkin = () => {
    const nextIdx = (currentSkinIdx - 1 + SKINS.length) % SKINS.length;
    const skin = SKINS[nextIdx];
    setInspectingSkinId(skin.id);
    if (profile.unlockedSkinIds.includes(skin.id)) {
      onUpdateProfile({ selectedSkinId: skin.id });
    }
  };

  const handleNextSkin = () => {
    const nextIdx = (currentSkinIdx + 1) % SKINS.length;
    const skin = SKINS[nextIdx];
    setInspectingSkinId(skin.id);
    if (profile.unlockedSkinIds.includes(skin.id)) {
      onUpdateProfile({ selectedSkinId: skin.id });
    }
  };

  const handleSelectArchetype = (arch: (typeof ARCHETYPES)[number]) => {
    setInspectingSkinId(arch.premierSkinId);
    if (profile.unlockedSkinIds.includes(arch.premierSkinId)) {
      onUpdateProfile({ selectedSkinId: arch.premierSkinId });
    }
  };

  const handleEquipCurrentSkin = () => {
    if (isSkinUnlocked) {
      onUpdateProfile({ selectedSkinId: inspectingSkin.id });
    } else if (canAffordSkin) {
      onUpdateProfile({
        coins: profile.coins - inspectingSkin.price,
        unlockedSkinIds: [...profile.unlockedSkinIds, inspectingSkin.id],
        selectedSkinId: inspectingSkin.id,
      });
    } else {
      onOpenShop('skins');
    }
  };

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
      className="relative w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-slate-950"
      style={{
        paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
        paddingRight: 'max(14px, env(safe-area-inset-right, 14px))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        paddingLeft: 'max(14px, env(safe-area-inset-left, 14px))',
      }}
    >
      {/* Dynamic Thematic Background that shifts with selected snake archetype */}
      <DynamicCyberBackground archetype={inspectingSkin.archetype} />

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

          {/* HUD Layout & Controls Editor */}
          {onOpenHudCustomizer && (
            <button
              id="btn-lobby-hud-layout"
              type="button"
              onClick={onOpenHudCustomizer}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/60 transition-colors"
              title="Customize Controls & HUD Layout"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
            </button>
          )}

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
      <div className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center py-2 z-10">
        {/* Left Column: Player Card & Deployment */}
        <div className="lg:col-span-4 bg-slate-900/85 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-3">
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
              className="w-full bg-slate-950/90 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 font-cyber text-base sm:text-lg font-bold text-white tracking-wider outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Selected Skin Display & Shop Shortcut */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg border border-white/20 shadow-sm shrink-0"
                style={{ backgroundColor: inspectingSkin.primaryColor }}
              />
              <div className="min-w-0">
                <span className="font-cyber text-[10px] text-slate-400 block">SELECTED WARFRAME</span>
                <span className="font-cyber text-xs sm:text-sm font-black text-white truncate block">{inspectingSkin.name}</span>
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

        {/* Center: Live Snake² Interactive Showcase & Snake Type Archetype Selector */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-2.5">
          {/* Snake Archetype Quick Tabs */}
          <div className="w-full max-w-[360px] bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 backdrop-blur-md">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="font-cyber text-[10px] font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> CHOOSE SNAKE TYPE
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-cyber font-bold">
                {inspectingSkin.archetype}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1">
              {ARCHETYPES.map((arch) => {
                const isActive = inspectingSkin.archetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    id={`btn-archetype-${arch.id}`}
                    type="button"
                    onClick={() => handleSelectArchetype(arch)}
                    className={`py-1 px-0.5 rounded-lg border font-cyber text-[10px] font-black flex flex-col items-center justify-center transition-all ${
                      isActive ? arch.activeBorder : `${arch.colorClass} hover:brightness-125`
                    }`}
                    title={`Select ${arch.label} Snake`}
                  >
                    <span className="text-sm">{arch.icon}</span>
                    <span className="text-[9px] leading-tight truncate mt-0.5">{arch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Snake Preview Card with Carousel Arrows */}
          <div className="relative w-full max-w-[360px] p-2.5 rounded-2xl bg-slate-900/85 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col items-center">
            {/* Top Bar inside Card */}
            <div className="w-full flex items-center justify-between px-1 mb-1.5 font-cyber">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-black tracking-wider text-white truncate max-w-[170px]">
                  {inspectingSkin.name}
                </span>
              </div>
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                  inspectingSkin.archetype === 'angel'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                    : inspectingSkin.archetype === 'devil'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : inspectingSkin.archetype === 'blackhole'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : inspectingSkin.archetype === 'robot'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                    : inspectingSkin.archetype === 'dragon'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                }`}
              >
                {inspectingSkin.badge || inspectingSkin.archetype}
              </span>
            </div>

            {/* Live Slithering Snake Canvas with Carousel Prev / Next Controls */}
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden">
              <SnakePreviewCanvas skin={inspectingSkin} weaponType="ar" width={340} height={210} />

              {/* Prev Button */}
              <button
                id="btn-prev-skin"
                type="button"
                onClick={handlePrevSkin}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Previous Snake Skin"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                id="btn-next-skin"
                type="button"
                onClick={handleNextSkin}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Next Snake Skin"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Archetype Adornment & Aura Details */}
            <div className="w-full mt-2 px-1 flex items-center justify-between text-[10px] font-cyber text-slate-400">
              <span className="truncate max-w-[210px] text-cyan-300">
                ✨ {inspectingSkin.specialAura || inspectingSkin.headDetail}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/20"
                  style={{ backgroundColor: inspectingSkin.primaryColor }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/20"
                  style={{ backgroundColor: inspectingSkin.accentColor }}
                />
              </div>
            </div>

            {/* Quick Equip / Buy Action Button */}
            <div className="w-full mt-2">
              {isSkinEquipped ? (
                <button
                  disabled
                  className="w-full py-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 font-cyber font-bold text-xs tracking-wider uppercase cursor-default flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> EQUIPPED & READY
                </button>
              ) : isSkinUnlocked ? (
                <button
                  id="btn-lobby-equip-current"
                  type="button"
                  onClick={handleEquipCurrentSkin}
                  className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" /> EQUIP THIS SNAKE
                </button>
              ) : (
                <button
                  id="btn-lobby-buy-current"
                  type="button"
                  onClick={handleEquipCurrentSkin}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" /> UNLOCK FOR ${inspectingSkin.price} CASH
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Battlefield Weapons Armory Specification Guide */}
        <div className="lg:col-span-4 bg-slate-900/85 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="font-cyber text-sm font-black text-white uppercase tracking-wider">
              BATTLEFIELD WEAPON LOOTS
            </h3>
          </div>

          <div className="space-y-2">
            {/* Grenade */}
            <div className="bg-slate-950/70 border border-amber-500/40 rounded-xl p-2 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
                <Bomb className="w-4 h-4" />
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
            <div className="bg-slate-950/70 border border-sky-500/40 rounded-xl p-2 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 shrink-0">
                <Crosshair className="w-4 h-4" />
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
            <div className="bg-slate-950/70 border border-emerald-500/40 rounded-xl p-2 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-4 h-4" />
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
            <div className="bg-slate-950/70 border border-rose-500/40 rounded-xl p-2 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 shrink-0">
                <Target className="w-4 h-4" />
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

            {/* Tactical Defense: Shields & Obstacles */}
            <div className="bg-slate-950/70 border border-sky-500/40 rounded-xl p-2 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-cyber text-xs font-black text-sky-300 uppercase">
                    SHIELDS & DEFENSE COVER
                  </span>
                  <span className="bg-sky-500/20 text-sky-300 font-cyber text-[9px] font-black px-1.5 py-0.5 rounded border border-sky-500/40">
                    +100 HP BUFF
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  Collect shield bubbles for +100 HP. Hide behind bunkers to deflect bullets!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls Tip */}
      <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[11px] font-cyber text-slate-400 border-t border-slate-800/80 pt-2.5 z-10 gap-2">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span>🕹️ JOYSTICK: Move & Aim</span>
          <span>🔴 FIRE: Shoot weapon</span>
          <span>⚡ BOOST: Speed Dash</span>
          <span>🛡️ SHIELD: Absorbs damage</span>
          <span>🧱 BUNKERS: Deflect projectiles</span>
        </div>
        <div className="text-cyan-400 font-bold">
          TIP: Choose your archetype above • 5600px Arena • 24 Bots!
        </div>
      </div>
    </div>
  );
};
