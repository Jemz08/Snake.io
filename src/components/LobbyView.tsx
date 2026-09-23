import React, { useState, useEffect } from 'react';
import { PlayerProfile, SkinDef, SnakeArchetype } from '../types';
import { SKINS, getSkinById } from '../utils/skins';
import { WEAPONS } from '../utils/weapons';
import { getArchetypeAbility } from '../utils/archetypeAbilities';
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
  Download,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
  Sliders,
  Package,
  Settings as SettingsIcon,
} from 'lucide-react';
import { getSoundMuted, setSoundMuted } from '../utils/audio';
import { RARITY_CONFIG } from '../utils/skins';

interface LobbyViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: Partial<PlayerProfile>) => void;
  onStartGame: () => void;
  onOpenShop: (tab?: 'skins' | 'death-effects') => void;
  onOpenCrate?: () => void;
  onOpenLeaderboard: () => void;
  onOpenMissions: () => void;
  onOpenExport?: () => void;
  onOpenHudCustomizer?: () => void;
  onOpenSettings?: () => void;
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
    label: 'Void',
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
  {
    id: 'phoenix',
    label: 'Phoenix',
    icon: '🔥',
    premierSkinId: 'phoenix-prime',
    colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/40',
    activeBorder: 'border-orange-400 bg-orange-500/25 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-orange-200',
  },
  {
    id: 'frost',
    label: 'Frost',
    icon: '❄️',
    premierSkinId: 'frost-wyrm',
    colorClass: 'text-cyan-200 bg-cyan-400/10 border-cyan-400/40',
    activeBorder: 'border-cyan-300 bg-cyan-400/25 shadow-[0_0_15px_rgba(103,232,249,0.4)] text-cyan-100',
  },
  {
    id: 'venom',
    label: 'Venom',
    icon: '🧪',
    premierSkinId: 'venom-hydra',
    colorClass: 'text-lime-300 bg-lime-500/10 border-lime-400/40',
    activeBorder: 'border-lime-400 bg-lime-500/25 shadow-[0_0_15px_rgba(163,230,53,0.4)] text-lime-100',
  },
  {
    id: 'storm',
    label: 'Storm',
    icon: '⚡',
    premierSkinId: 'storm-tempest',
    colorClass: 'text-blue-300 bg-blue-500/10 border-blue-400/40',
    activeBorder: 'border-blue-400 bg-blue-500/25 shadow-[0_0_15px_rgba(96,165,250,0.4)] text-blue-100',
  },
  {
    id: 'phantom',
    label: 'Phantom',
    icon: '👻',
    premierSkinId: 'phantom-wraith',
    colorClass: 'text-indigo-300 bg-indigo-500/10 border-indigo-400/40',
    activeBorder: 'border-indigo-400 bg-indigo-500/25 shadow-[0_0_15px_rgba(129,140,248,0.4)] text-indigo-100',
  },
  {
    id: 'vampire',
    label: 'Vampire',
    icon: '🦇',
    premierSkinId: 'vampire-nosferatu',
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-400/40',
    activeBorder: 'border-rose-400 bg-rose-500/25 shadow-[0_0_15px_rgba(251,113,133,0.4)] text-rose-100',
  },
  {
    id: 'chrono',
    label: 'Chrono',
    icon: '⏳',
    premierSkinId: 'chrono-paradox',
    colorClass: 'text-amber-300 bg-amber-500/10 border-amber-400/40',
    activeBorder: 'border-amber-400 bg-amber-500/25 shadow-[0_0_15px_rgba(251,191,36,0.4)] text-amber-100',
  },
  {
    id: 'ninja',
    label: 'Ninja',
    icon: '🥷',
    premierSkinId: 'ninja-shinobi',
    colorClass: 'text-red-400 bg-red-500/10 border-red-400/40',
    activeBorder: 'border-red-400 bg-red-500/25 shadow-[0_0_15px_rgba(248,113,113,0.4)] text-red-100',
  },
  {
    id: 'crystal',
    label: 'Crystal',
    icon: '💎',
    premierSkinId: 'crystal-shard',
    colorClass: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/40',
    activeBorder: 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-cyan-100',
  },
  {
    id: 'alien',
    label: 'Alien',
    icon: '👽',
    premierSkinId: 'alien-xenomorph',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/40',
    activeBorder: 'border-emerald-400 bg-emerald-500/25 shadow-[0_0_15px_rgba(52,211,153,0.4)] text-emerald-100',
  },
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  profile,
  onUpdateProfile,
  onStartGame,
  onOpenShop,
  onOpenCrate,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenExport,
  onOpenHudCustomizer,
  onOpenSettings,
}) => {
  const [playerName, setPlayerName] = useState(profile.name);
  const [inspectingSkinId, setInspectingSkinId] = useState<string>(profile.selectedSkinId);
  const [previewWeaponIndex, setPreviewWeaponIndex] = useState(1);
  const [muted, setMuted] = useState(getSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const previewWeapons: Array<'grenade' | 'pistol' | 'ar' | 'sniper'> = ['grenade', 'pistol', 'ar', 'sniper'];

  useEffect(() => {
    setInspectingSkinId(profile.selectedSkinId);
  }, [profile.selectedSkinId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 16);
    setPlayerName(val);
    onUpdateProfile({ name: val });
  };

  const inspectingSkin = getSkinById(inspectingSkinId);
  const isSkinUnlocked = profile.unlockedSkinIds.includes(inspectingSkin.id);
  const isSkinEquipped = profile.selectedSkinId === inspectingSkin.id;

  // Cycle through archetype skins
  const currentArchetypeSkins = SKINS.filter(
    (s) => s.archetype === inspectingSkin.archetype
  );
  const currentSkinIndex = currentArchetypeSkins.findIndex((s) => s.id === inspectingSkin.id);

  const handlePrevSkin = () => {
    if (currentArchetypeSkins.length === 0) return;
    const prevIdx = (currentSkinIndex - 1 + currentArchetypeSkins.length) % currentArchetypeSkins.length;
    setInspectingSkinId(currentArchetypeSkins[prevIdx].id);
  };

  const handleNextSkin = () => {
    if (currentArchetypeSkins.length === 0) return;
    const nextIdx = (currentSkinIndex + 1) % currentArchetypeSkins.length;
    setInspectingSkinId(currentArchetypeSkins[nextIdx].id);
  };

  const handleSelectArchetype = (arch: (typeof ARCHETYPES)[0]) => {
    // Check if player has unlocked any skin of this archetype
    const archeSkins = SKINS.filter((s) => s.archetype === arch.id);
    const unlockedArcheSkin = archeSkins.find((s) => profile.unlockedSkinIds.includes(s.id));
    if (unlockedArcheSkin) {
      setInspectingSkinId(unlockedArcheSkin.id);
    } else {
      setInspectingSkinId(arch.premierSkinId);
    }
  };

  const toggleSound = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  const currentAbility = getArchetypeAbility(inspectingSkin.archetype);
  const currentRarity = inspectingSkin.rarity || 'common';
  const rarityConfig = RARITY_CONFIG[currentRarity];

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white font-cyber flex flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-2 sm:px-4 py-3 sm:py-5 select-none">
      {/* Dynamic Cyber Background Aura */}
      <DynamicCyberBackground archetype={inspectingSkin.archetype} />

      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between z-10 w-full max-w-5xl mx-auto gap-2 mb-3">
        {/* Brand / Title: Cyber Snake */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="font-cyber text-base sm:text-xl md:text-2xl font-black text-white tracking-widest uppercase flex items-center gap-1.5">
              <span>CYBER</span>
              <span className="text-cyan-400">SNAKE</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-cyber tracking-wider hidden xs:block">
              TACTICAL BATTLE ROYALE
            </p>
          </div>
        </div>

        {/* Right Top Bar Actions (Settings, Crate, Cash, Controls) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Settings Button (Opens Settings Modal) */}
          {onOpenSettings && (
            <button
              id="btn-lobby-settings"
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition-all shadow-sm flex items-center gap-1.5"
              title="Settings (FPS, Sound, Name, Mechanics)"
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden md:inline">SETTINGS</span>
            </button>
          )}

          {/* Supply Crate Button */}
          {onOpenCrate && (
            <button
              id="btn-lobby-crate"
              type="button"
              onClick={onOpenCrate}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-yellow-500/20 hover:from-amber-500/35 hover:to-yellow-500/35 border border-amber-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-amber-300 font-cyber font-black text-[11px] sm:text-xs shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all animate-pulse"
              title="Open Supply Crate (1,000 Coins) - Chance for SECRET skins!"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>CRATE</span>
              <span className="text-[9px] sm:text-[10px] text-amber-200/90 font-mono hidden xs:inline">(1k🪙)</span>
            </button>
          )}

          {/* Cash / Coins Display */}
          <button
            id="lobby-coins-display"
            type="button"
            onClick={() => onOpenShop('skins')}
            className="flex items-center gap-1 sm:gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-amber-400 font-cyber font-bold text-xs sm:text-sm shadow-sm transition-all"
            title="Kill enemies to earn cash! Click to open armory"
          >
            <Coins className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span className="font-black">${profile.coins.toLocaleString()}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={toggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* HUD Customizer */}
          {onOpenHudCustomizer && (
            <button
              id="btn-lobby-hud-layout"
              type="button"
              onClick={onOpenHudCustomizer}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/60 transition-colors"
              title="Customize Controls & HUD Layout"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            id="btn-lobby-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-cyan-400" /> : <Maximize className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Export / Download */}
          {onOpenExport && (
            <button
              id="btn-lobby-export"
              type="button"
              onClick={onOpenExport}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/60 transition-colors hidden sm:block"
              title="Download File / Export Project"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Center Stage (Auto-fit to Mobile Portrait & Landscape) */}
      <main className="w-full max-w-xl sm:max-w-2xl mx-auto flex flex-col items-center justify-center space-y-3 z-10">
        {/* Pilot Callsign Bar */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-cyber text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider shrink-0">
              PILOT:
            </span>
            <input
              id="input-player-name"
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Enter callsign..."
              className="w-full bg-transparent border-b border-slate-700 focus:border-cyan-400 px-1 py-0.5 font-cyber text-sm sm:text-base font-black text-white tracking-wider outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-cyber text-slate-400 shrink-0">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              🏆 BEST: <strong className="text-yellow-400">{profile.highScore}</strong>
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hidden xs:inline">
              💀 KILLS: <strong className="text-rose-400">{profile.maxKills}</strong>
            </span>
          </div>
        </div>

        {/* Snake Archetype Quick Selector */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="font-cyber text-[10px] font-bold text-cyan-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> SELECT WARFRAME TYPE ({ARCHETYPES.length})
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-cyber font-bold">
              {inspectingSkin.archetype}
            </span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-8 gap-1">
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
                  title={`Select ${arch.label} Warframe`}
                >
                  <span className="text-sm">{arch.icon}</span>
                  <span className="text-[8px] sm:text-[9px] leading-tight truncate mt-0.5">{arch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SNAKE PREVIEW CARD (DIRECTLY ABOVE "DEPLOY TO WAR") */}
        {/* ============================================================== */}
        <div className="relative w-full rounded-2xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur-md p-3 sm:p-4 flex flex-col items-center">
          {/* Top Bar inside Card */}
          <div className="w-full flex items-center justify-between px-1 mb-1 font-cyber">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span
                className="text-xs sm:text-sm font-black tracking-wider truncate"
                style={{ color: rarityConfig.color }}
              >
                {inspectingSkin.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded font-cyber"
                style={{
                  backgroundColor: `${rarityConfig.color}25`,
                  color: rarityConfig.color,
                  border: `1px solid ${rarityConfig.color}50`,
                }}
              >
                {rarityConfig.label}
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 uppercase font-black">
                {inspectingSkin.badge || inspectingSkin.archetype}
              </span>
            </div>
          </div>

          {/* Interactive Snake Canvas with Next/Prev Arrow Controls */}
          <div className="relative w-full flex items-center justify-center py-1">
            <button
              id="btn-prev-skin"
              type="button"
              onClick={handlePrevSkin}
              className="absolute left-1 z-20 p-2 sm:p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400 shadow-lg transition-all active:scale-95"
              title="Previous skin"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950/90 w-full flex items-center justify-center">
              <SnakePreviewCanvas
                skin={inspectingSkin}
                weaponType={previewWeapons[previewWeaponIndex]}
                width={360}
                height={160}
              />
            </div>

            <button
              id="btn-next-skin"
              type="button"
              onClick={handleNextSkin}
              className="absolute right-1 z-20 p-2 sm:p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400 shadow-lg transition-all active:scale-95"
              title="Next skin"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Skin Ownership & Weapon Selection Ribbon */}
          <div className="w-full flex items-center justify-between text-xs font-cyber mt-1 px-1">
            <div className="flex items-center gap-1.5">
              {isSkinEquipped ? (
                <span className="flex items-center gap-1 text-emerald-400 font-black text-[11px]">
                  <Check className="w-3.5 h-3.5" /> CURRENTLY EQUIPPED
                </span>
              ) : isSkinUnlocked ? (
                <button
                  type="button"
                  onClick={() => onUpdateProfile({ selectedSkinId: inspectingSkin.id })}
                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95"
                >
                  EQUIP THIS SKIN
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                    <Lock className="w-3.5 h-3.5" /> LOCKED
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenShop('skins')}
                    className="text-[10px] text-cyan-400 hover:underline font-bold"
                  >
                    View in Armory
                  </button>
                </div>
              )}
            </div>

            {/* Preview Weapon Held Switcher */}
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="hidden xs:inline">Weapon:</span>
              <button
                type="button"
                onClick={() => setPreviewWeaponIndex((prev) => (prev + 1) % previewWeapons.length)}
                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-bold hover:border-slate-500 transition-colors uppercase font-mono"
              >
                {previewWeapons[previewWeaponIndex]} ⇄
              </button>
            </div>
          </div>

          {/* Active & Passive Ability Showcase Card */}
          <div className="w-full mt-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-cyber">
            <div className="flex items-start gap-1.5">
              <div className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ⚡
              </div>
              <div>
                <span className="font-black text-cyan-300 block uppercase">
                  ACTIVE: {currentAbility.activeName} ({currentAbility.activeCooldown}s CD)
                </span>
                <span className="text-[10px] text-slate-400 leading-tight block">
                  {currentAbility.activeDesc}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✦
              </div>
              <div>
                <span className="font-black text-amber-300 block uppercase">
                  PASSIVE: {currentAbility.passiveName}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight block">
                  {currentAbility.passiveDesc}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DEPLOY TO WAR BUTTON (DIRECTLY BELOW THE SNAKE PREVIEW) */}
        {/* ============================================================== */}
        <button
          id="btn-start-game"
          type="button"
          onClick={onStartGame}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:brightness-110 text-slate-950 font-cyber text-lg sm:text-2xl font-black tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all active:scale-[0.98] border-2 border-cyan-300"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>DEPLOY TO WAR</span>
        </button>

        {/* ============================================================== */}
        {/* QUICK ACTION TABS (BELOW DEPLOY TO WAR BUTTON) */}
        {/* ============================================================== */}
        <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2.5 font-cyber">
          {/* Missions Tab */}
          <button
            id="btn-quick-missions"
            type="button"
            onClick={onOpenMissions}
            className="py-2.5 px-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
          >
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="font-black text-[10px] sm:text-xs">MISSIONS</span>
          </button>

          {/* Leaderboard Tab */}
          <button
            id="btn-quick-ranks"
            type="button"
            onClick={onOpenLeaderboard}
            className="py-2.5 px-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[10px] sm:text-xs">RANKS</span>
          </button>

          {/* Supply Crate Tab */}
          <button
            id="btn-quick-crate"
            type="button"
            onClick={onOpenCrate}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-b from-amber-500/20 to-yellow-600/20 hover:from-amber-500/35 hover:to-yellow-600/35 border border-amber-400 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all active:scale-95"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span className="font-black text-[10px] sm:text-xs">CRATE (1k)</span>
          </button>

          {/* Armory Shop Tab */}
          <button
            id="btn-quick-shop"
            type="button"
            onClick={() => onOpenShop('skins')}
            className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span className="font-black text-[10px] sm:text-xs">ARMORY</span>
          </button>
        </div>

        {/* Weapons Guide Quick Banner */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 text-center text-slate-400 text-[10px] font-cyber flex items-center justify-around">
          <span className="text-amber-400 font-bold">💣 GRENADE (1-HIT)</span>
          <span>•</span>
          <span className="text-lime-400 font-bold">🔫 PISTOL (28 DMG)</span>
          <span>•</span>
          <span className="text-sky-400 font-bold">⚡ AR (32 DMG)</span>
          <span>•</span>
          <span className="text-rose-400 font-bold">🎯 SNIPER (75 DMG)</span>
        </div>
      </main>
    </div>
  );
};
