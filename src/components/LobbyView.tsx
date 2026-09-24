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
  Music,
  Radio,
} from 'lucide-react';
import {
  getSoundMuted,
  setSoundMuted,
  startLobbyMusic,
  stopLobbyMusic,
  toggleLobbyMusic,
  isLobbyMusicPlaying,
  subscribeMusicState,
  playRetroButtonClick,
} from '../utils/audio';
import { getGameSettings } from '../utils/settings';
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
    premierSkinId: 'venom-viper',
    colorClass: 'text-lime-300 bg-lime-500/10 border-lime-400/40',
    activeBorder: 'border-lime-400 bg-lime-500/25 shadow-[0_0_15px_rgba(163,230,53,0.4)] text-lime-100',
  },
  {
    id: 'storm',
    label: 'Storm',
    icon: '⚡',
    premierSkinId: 'storm-breaker',
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
    premierSkinId: 'ninja-shadow',
    colorClass: 'text-red-400 bg-red-500/10 border-red-400/40',
    activeBorder: 'border-red-400 bg-red-500/25 shadow-[0_0_15px_rgba(248,113,113,0.4)] text-red-100',
  },
  {
    id: 'crystal',
    label: 'Crystal',
    icon: '💎',
    premierSkinId: 'crystal-diamond',
    colorClass: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/40',
    activeBorder: 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-cyan-100',
  },
  {
    id: 'alien',
    label: 'Alien',
    icon: '👽',
    premierSkinId: 'alien-xeno',
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
    playRetroButtonClick();
    // Find all skins for this archetype
    const archeSkins = SKINS.filter((s) => s.archetype === arch.id);
    if (archeSkins.length === 0) return;

    // 1. Check if user owns any skin in this archetype
    const unlockedArcheSkin = archeSkins.find((s) => profile.unlockedSkinIds.includes(s.id));
    if (unlockedArcheSkin) {
      setInspectingSkinId(unlockedArcheSkin.id);
      return;
    }

    // 2. Otherwise select featured premier skin or first skin in archetype
    const target = archeSkins.find((s) => s.id === arch.premierSkinId) || archeSkins[0];
    setInspectingSkinId(target.id);
  };

  const [bgmPlaying, setBgmPlaying] = useState<boolean>(() => isLobbyMusicPlaying());

  useEffect(() => {
    const unsub = subscribeMusicState((playing) => {
      setBgmPlaying(playing);
    });
    // Auto-start music if not muted
    const settings = getGameSettings();
    if (!settings.soundMuted && !settings.musicMuted) {
      startLobbyMusic();
    }
    return unsub;
  }, []);

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
    <div
      className="relative w-full min-h-[100dvh] bg-slate-950 text-white font-cyber flex flex-col justify-between overflow-x-hidden overflow-y-auto px-2 sm:px-4 py-1.5 sm:py-3 select-none"
      style={{
        paddingTop: 'max(6px, env(safe-area-inset-top, 6px))',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
        paddingLeft: 'max(6px, env(safe-area-inset-left, 6px))',
        paddingRight: 'max(6px, env(safe-area-inset-right, 6px))',
      }}
    >
      {/* Dynamic Cyber Background Aura */}
      <DynamicCyberBackground archetype={inspectingSkin.archetype} />

      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between z-10 w-full max-w-5xl mx-auto gap-2 mb-1.5 sm:mb-2 shrink-0">
        {/* Brand / Title: Cyber Snake */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Swords className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="font-cyber text-sm sm:text-xl md:text-2xl font-black text-white tracking-widest uppercase flex items-center gap-1.5 leading-none">
              <span>CYBER</span>
              <span className="text-cyan-400">SNAKE</span>
            </h1>
            <p className="text-[8px] sm:text-[10px] text-slate-400 font-cyber tracking-wider hidden xs:block mt-0.5">
              TACTICAL BATTLE ROYALE
            </p>
          </div>
        </div>

        {/* Right Top Bar Actions (Settings, Crate, Cash, Controls) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Settings Button (Opens Settings Modal) */}
          {onOpenSettings && (
            <button
              id="btn-lobby-settings"
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition-all shadow-sm flex items-center gap-1"
              title="Settings (FPS, Sound, Name, Mechanics)"
            >
              <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-[11px] font-bold hidden md:inline">SETTINGS</span>
            </button>
          )}

          {/* Supply Crate Button */}
          {onOpenCrate && (
            <button
              id="btn-lobby-crate"
              type="button"
              onClick={onOpenCrate}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-yellow-500/20 hover:from-amber-500/35 hover:to-yellow-500/35 border border-amber-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-amber-300 font-cyber font-black text-[10px] sm:text-xs shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all animate-pulse"
              title="Open Supply Crate (1,000 Coins) - Chance for SECRET skins!"
            >
              <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
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
            <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse text-amber-300" />
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
            {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
          </button>

          {/* Lobby Music (BGM) Toggle */}
          <button
            id="btn-toggle-bgm"
            type="button"
            onClick={() => {
              playRetroButtonClick();
              toggleLobbyMusic();
            }}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              bgmPlaying
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={bgmPlaying ? 'Pause Lobby BGM' : 'Play Lobby BGM'}
          >
            <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${bgmPlaying ? 'animate-pulse text-cyan-400' : ''}`} />
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
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
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
      <main className="w-full max-w-xl sm:max-w-2xl mx-auto flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5 z-10 my-auto">
        {/* Pilot Callsign Bar */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="font-cyber text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider shrink-0">
              PILOT:
            </span>
            <input
              id="input-player-name"
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Enter callsign..."
              className="w-full bg-transparent border-b border-slate-700 focus:border-cyan-400 px-1 py-0.5 font-cyber text-xs sm:text-sm font-black text-white tracking-wider outline-none transition-colors"
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
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 sm:p-2 shadow-lg backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="font-cyber text-[10px] font-bold text-cyan-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> SELECT CYBER SNAKES ({ARCHETYPES.length})
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-cyber font-bold flex items-center gap-1">
              <span>{inspectingSkin.archetype}</span>
              {!isSkinUnlocked && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1">
            {ARCHETYPES.map((arch) => {
              const isActive = inspectingSkin.archetype === arch.id;
              const archSkins = SKINS.filter((s) => s.archetype === arch.id);
              const hasUnlocked = archSkins.some((s) => profile.unlockedSkinIds.includes(s.id));

              return (
                <button
                  key={arch.id}
                  id={`btn-archetype-${arch.id}`}
                  type="button"
                  onClick={() => handleSelectArchetype(arch)}
                  className={`relative py-1 px-0.5 rounded-lg border font-cyber text-[9px] font-black flex flex-col items-center justify-center transition-all ${
                    isActive ? arch.activeBorder : `${arch.colorClass} hover:brightness-125`
                  }`}
                  title={`Select ${arch.label} Cyber Snake ${hasUnlocked ? '(Unlocked)' : '(Locked)'}`}
                >
                  <span className="text-xs sm:text-sm">{arch.icon}</span>
                  <span className="text-[7.5px] sm:text-[8.5px] leading-tight truncate mt-0.5">{arch.label}</span>
                  {!hasUnlocked && (
                    <span className="absolute top-0.5 right-0.5 text-[8px] leading-none">
                      🔒
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SNAKE PREVIEW CARD (DIRECTLY ABOVE "DEPLOY TO WAR") */}
        {/* ============================================================== */}
        <div className="relative w-full rounded-xl sm:rounded-2xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur-md p-2 sm:p-3 flex flex-col items-center shrink-0">
          {/* Top Bar inside Card */}
          <div className="w-full flex items-center justify-between px-1 mb-1 font-cyber">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span
                className="text-xs sm:text-sm font-black tracking-wider truncate"
                style={{ color: rarityConfig.color }}
              >
                {inspectingSkin.name}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span
                className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-cyber"
                style={{
                  backgroundColor: `${rarityConfig.color}25`,
                  color: rarityConfig.color,
                  border: `1px solid ${rarityConfig.color}50`,
                }}
              >
                {rarityConfig.label}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 uppercase font-black">
                {inspectingSkin.badge || inspectingSkin.archetype}
              </span>
            </div>
          </div>

          {/* Interactive Snake Canvas with Lock Overlay if Locked */}
          <div className="relative w-full flex items-center justify-center py-0.5">
            <button
              id="btn-prev-skin"
              type="button"
              onClick={handlePrevSkin}
              className="absolute left-1 z-30 p-1.5 sm:p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400 shadow-lg transition-all active:scale-95"
              title="Previous skin"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950/90 w-full flex items-center justify-center max-h-[120px] sm:max-h-[145px]">
              <SnakePreviewCanvas
                skin={inspectingSkin}
                weaponType={previewWeapons[previewWeaponIndex]}
                width={340}
                height={115}
              />

              {/* LOCK OVERLAY IF NOT YET UNLOCKED */}
              {!isSkinUnlocked && (
                <div className="absolute inset-0 z-20 bg-slate-950/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center pointer-events-none p-2 text-center select-none">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-1">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
                  </div>
                  <span className="font-cyber font-black text-xs sm:text-sm text-amber-300 tracking-wider">
                    LOCKED CYBER SNAKE
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-300 font-mono mt-0.5">
                    {inspectingSkin.crateExclusive
                      ? '★ SUPPLY CRATE EXCLUSIVE ★'
                      : `UNLOCK IN ARMORY (${inspectingSkin.price.toLocaleString()} CASH)`}
                  </span>
                </div>
              )}
            </div>

            <button
              id="btn-next-skin"
              type="button"
              onClick={handleNextSkin}
              className="absolute right-1 z-30 p-1.5 sm:p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400 shadow-lg transition-all active:scale-95"
              title="Next skin"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skin Ownership & Weapon Selection Ribbon */}
          <div className="w-full flex items-center justify-between text-xs font-cyber mt-1 px-1">
            <div className="flex items-center gap-1.5">
              {isSkinEquipped ? (
                <span className="flex items-center gap-1 text-emerald-400 font-black text-[10px] sm:text-[11px]">
                  <Check className="w-3.5 h-3.5" /> CURRENTLY EQUIPPED
                </span>
              ) : isSkinUnlocked ? (
                <button
                  type="button"
                  onClick={() => onUpdateProfile({ selectedSkinId: inspectingSkin.id })}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95"
                >
                  EQUIP THIS SNAKE
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-amber-400 font-bold text-[10px] sm:text-[11px]">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenShop('skins')}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold transition-colors"
                  >
                    {inspectingSkin.crateExclusive ? 'Crate Only' : `Armory $${inspectingSkin.price.toLocaleString()}`}
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
                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-bold hover:border-slate-500 transition-colors uppercase font-mono text-[9px] sm:text-[10px]"
              >
                {previewWeapons[previewWeaponIndex]} ⇄
              </button>
            </div>
          </div>

          {/* Active & Passive Ability Showcase Strip (Ultra-compact & Informative) */}
          <div className="w-full mt-1.5 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 grid grid-cols-1 xs:grid-cols-2 gap-1 text-[10px] sm:text-[11px] font-cyber">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-cyan-400 font-bold shrink-0">⚡</span>
              <span className="font-black text-cyan-300 uppercase truncate">
                ACTIVE: {currentAbility.activeName}
              </span>
              <span className="text-[9px] text-slate-400 font-mono shrink-0">({currentAbility.activeCooldown}s)</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-400 font-bold shrink-0">✦</span>
              <span className="font-black text-amber-300 uppercase truncate">
                PASSIVE: {currentAbility.passiveName}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DEPLOY TO WAR BUTTON (DIRECTLY BELOW THE SNAKE PREVIEW) */}
        {/* ============================================================== */}
        <button
          id="btn-start-game"
          type="button"
          onClick={() => {
            playRetroButtonClick();
            stopLobbyMusic(0.3);
            onStartGame();
          }}
          className="w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:brightness-110 text-slate-950 font-cyber text-base sm:text-xl font-black tracking-widest uppercase flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all active:scale-[0.98] border-2 border-cyan-300 shrink-0"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          <span>DEPLOY TO WAR</span>
        </button>

        {/* ============================================================== */}
        {/* QUICK ACTION TABS (BELOW DEPLOY TO WAR BUTTON) */}
        {/* ============================================================== */}
        <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 font-cyber shrink-0">
          {/* Missions Tab */}
          <button
            id="btn-quick-missions"
            type="button"
            onClick={onOpenMissions}
            className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all shadow-sm active:scale-95"
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="font-black text-[9px] sm:text-xs">MISSIONS</span>
          </button>

          {/* Leaderboard Tab */}
          <button
            id="btn-quick-ranks"
            type="button"
            onClick={onOpenLeaderboard}
            className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all shadow-sm active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="font-black text-[9px] sm:text-xs">RANKS</span>
          </button>

          {/* Supply Crate Tab */}
          <button
            id="btn-quick-crate"
            type="button"
            onClick={onOpenCrate}
            className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-xl bg-gradient-to-b from-amber-500/20 to-yellow-600/20 hover:from-amber-500/35 hover:to-yellow-600/35 border border-amber-400 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 sm:gap-1 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all active:scale-95"
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="font-black text-[9px] sm:text-xs">CRATE (1k)</span>
          </button>

          {/* Armory Shop Tab */}
          <button
            id="btn-quick-shop"
            type="button"
            onClick={() => onOpenShop('skins')}
            className="py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span className="font-black text-[9px] sm:text-xs">ARMORY</span>
          </button>
        </div>

        {/* Weapons Guide Quick Banner */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-1 px-2 text-center text-slate-400 text-[9px] sm:text-[10px] font-cyber hidden xs:flex items-center justify-around shrink-0">
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
