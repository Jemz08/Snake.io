import React, { useState, useEffect } from 'react';
import { PlayerProfile, SkinDef, SnakeArchetype, GameMode, BotDifficulty, TrailType, EmoteType } from '../types';
import { SKINS, getSkinById } from '../utils/skins';
import { WEAPONS } from '../utils/weapons';
import { getArchetypeAbility } from '../utils/archetypeAbilities';
import { SnakePreviewCanvas } from './SnakePreviewCanvas';
import { DynamicCyberBackground } from './DynamicCyberBackground';
import { TrailsModal } from './TrailsModal';
import { BattlePassModal } from './BattlePassModal';
import { BattlePassTracker } from './BattlePassTracker';
import { MasteryModal } from './MasteryModal';
import { TauntsModal } from './TauntsModal';
import { getBattlePassLevel, evaluateMasteryBadges } from '../utils/progression';
import { getTrailById } from '../utils/trails';
import { getEmoteById, EMOTES } from '../utils/emotes';
import { GAME_MODES, BOT_DIFFICULTIES } from '../utils/gameModes';
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
  Smartphone,
  RotateCcw,
  Award,
  Monitor,
  MessageSquare,
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
import { useScreenOrientation } from '../utils/orientation';
import { RARITY_CONFIG } from '../utils/skins';

interface LobbyViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: Partial<PlayerProfile>) => void;
  onStartGame: () => void;
  onOpenShop: (tab?: 'skins' | 'death-effects' | 'taunts') => void;
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
  const [showTrailsModal, setShowTrailsModal] = useState(false);
  const [showBattlePassModal, setShowBattlePassModal] = useState(false);
  const [showMasteryModal, setShowMasteryModal] = useState(false);
  const [showTauntsModal, setShowTauntsModal] = useState(false);

  // Manual orientation toggle with automatic initial detection
  const [isLandscapeMode, setIsLandscapeMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 || window.innerWidth > window.innerHeight;
    }
    return false;
  });

  const selectedMode = profile.selectedGameMode || 'battle_royale';
  const selectedDifficulty = profile.botDifficulty || 'tactical';
  const selectedBotCount = profile.botCount || 24;
  const passLevel = getBattlePassLevel(profile.battlePassXp || 0);
  const masteredCount = evaluateMasteryBadges(profile).filter((b) => b.unlocked).length;
  const activeTrail = getTrailById(profile.selectedTrailId || 'none');
  const activeEmote = getEmoteById(profile.selectedEmoteId || 'target');
  const activeModeDef = GAME_MODES.find((m) => m.id === selectedMode) || GAME_MODES[0];

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
    const archeSkins = SKINS.filter((s) => s.archetype === arch.id);
    if (archeSkins.length === 0) return;

    const unlockedArcheSkin = archeSkins.find((s) => profile.unlockedSkinIds.includes(s.id));
    if (unlockedArcheSkin) {
      setInspectingSkinId(unlockedArcheSkin.id);
      return;
    }

    const target = archeSkins.find((s) => s.id === arch.premierSkinId) || archeSkins[0];
    setInspectingSkinId(target.id);
  };

  const [bgmPlaying, setBgmPlaying] = useState<boolean>(() => isLobbyMusicPlaying());

  useEffect(() => {
    const unsub = subscribeMusicState((playing) => {
      setBgmPlaying(playing);
    });
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
    if (!next) {
      playRetroButtonClick();
    }
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

  const screenDim = useScreenOrientation();
  const currentAbility = getArchetypeAbility(inspectingSkin.archetype);
  const currentRarity = inspectingSkin.rarity || 'common';
  const rarityConfig = RARITY_CONFIG[currentRarity];

  // Dynamic preview canvas sizing based on mode
  const canvasHeight = isLandscapeMode ? 140 : 110;
  const canvasWidth = isLandscapeMode ? 380 : 320;

  // Render Subcomponents
  const renderCallsignBar = () => (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2.5 shadow-lg backdrop-blur-md shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-cyber text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider shrink-0">
          PILOT:
        </span>
        <input
          id="input-player-name"
          type="text"
          value={playerName}
          onChange={handleNameChange}
          placeholder="Enter callsign..."
          className="w-full bg-transparent border-b border-slate-700 focus:border-cyan-400 px-1.5 py-0.5 font-cyber text-xs sm:text-sm font-black text-white tracking-wider outline-none transition-colors"
        />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-cyber text-slate-400 shrink-0">
        <span className="bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
          🏆 BEST: <strong className="text-yellow-400 font-mono">{profile.highScore}</strong>
        </span>
        <span className="bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 hidden xs:inline">
          💀 KILLS: <strong className="text-rose-400 font-mono">{profile.maxKills}</strong>
        </span>
      </div>
    </div>
  );

  const renderCustomizationBar = () => (
    <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2 shrink-0 font-cyber">
      {/* Tail Trails Locker */}
      <button
        type="button"
        id="btn-lobby-trails"
        onClick={() => {
          playRetroButtonClick();
          setShowTrailsModal(true);
        }}
        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 transition-all shadow-sm active:scale-95 min-w-0 cursor-pointer"
        title="Open Serpent Tail Trails Locker"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold truncate">TRAILS</span>
        </div>
        <span className="text-xs shrink-0">{activeTrail.icon}</span>
      </button>

      {/* Pilot Mastery */}
      <button
        type="button"
        id="btn-lobby-mastery"
        onClick={() => {
          playRetroButtonClick();
          setShowMasteryModal(true);
        }}
        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900/90 border border-purple-500/40 hover:border-purple-400 text-purple-300 transition-all shadow-sm active:scale-95 min-w-0 cursor-pointer"
        title="Open Pilot Mastery Badges"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold truncate">MASTERY</span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] sm:text-[10px] font-black border border-purple-500/40 shrink-0">
          {masteredCount}/6
        </span>
      </button>

      {/* Combat Taunts */}
      <button
        type="button"
        id="btn-lobby-taunts"
        onClick={() => {
          playRetroButtonClick();
          setShowTauntsModal(true);
        }}
        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900/90 border border-rose-500/40 hover:border-rose-400 text-rose-300 transition-all shadow-sm active:scale-95 min-w-0 cursor-pointer"
        title="Open Combat Taunts & Emotes Locker"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <MessageSquare className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold truncate">TAUNTS</span>
        </div>
        <span className="text-xs shrink-0">{activeEmote.icon}</span>
      </button>
    </div>
  );

  const renderArchetypesCarousel = () => (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-lg backdrop-blur-md shrink-0">
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="font-cyber text-[11px] font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>SELECT CYBER SNAKES</span>
          <span className="text-slate-500 font-normal">({ARCHETYPES.length})</span>
        </span>
        <span className="text-[10px] text-slate-400 uppercase font-cyber font-bold flex items-center gap-1.5">
          <span className="text-cyan-300 font-black">{inspectingSkin.archetype}</span>
          {!isSkinUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 px-0.5">
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
              className={`relative shrink-0 min-w-[70px] sm:min-w-[76px] py-1.5 px-2 rounded-xl border font-cyber flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive ? arch.activeBorder : `${arch.colorClass} hover:brightness-125`
              }`}
              title={`Select ${arch.label} Cyber Snake ${hasUnlocked ? '(Unlocked)' : '(Locked)'}`}
            >
              <span className="text-base sm:text-lg leading-none">{arch.icon}</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-1 truncate max-w-full">
                {arch.label}
              </span>
              {!hasUnlocked && (
                <span className="absolute top-1 right-1 text-[8px] leading-none">
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSnakePreviewCard = () => (
    <div className="relative w-full rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md p-2.5 sm:p-3 flex flex-col items-center shrink-0">
      {/* Top Bar inside Card */}
      <div className="w-full flex items-center justify-between px-1 mb-1 font-cyber">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span
            className="text-xs sm:text-sm font-black tracking-wider truncate"
            style={{ color: rarityConfig.color }}
          >
            {inspectingSkin.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
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
          <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 uppercase font-black">
            {inspectingSkin.badge || inspectingSkin.archetype}
          </span>
        </div>
      </div>

      {/* Interactive Snake Canvas with Lock Overlay if Locked */}
      <div className="relative w-full flex items-center justify-center my-1">
        <button
          id="btn-prev-skin"
          type="button"
          onClick={handlePrevSkin}
          className="absolute left-1 z-30 p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400 shadow-lg transition-all active:scale-95 cursor-pointer"
          title="Previous skin"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950/90 w-full flex items-center justify-center transition-all"
          style={{ maxHeight: `${canvasHeight + 10}px` }}
        >
          <SnakePreviewCanvas
            skin={inspectingSkin}
            weaponType={previewWeapons[previewWeaponIndex]}
            width={canvasWidth}
            height={canvasHeight}
          />

          {!isSkinUnlocked && (
            <div className="absolute inset-0 z-20 bg-slate-950/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center pointer-events-none p-2 text-center select-none">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-1">
                <Lock className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <span className="font-cyber font-black text-xs text-amber-300 tracking-wider">
                LOCKED CYBER SNAKE
              </span>
              <span className="text-[10px] text-slate-300 font-mono mt-0.5">
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
          className="absolute right-1 z-30 p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400 shadow-lg transition-all active:scale-95 cursor-pointer"
          title="Next skin"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Skin Ownership & Weapon Selection Ribbon */}
      <div className="w-full flex items-center justify-between text-xs font-cyber mt-1 px-1">
        <div className="flex items-center gap-2">
          {isSkinEquipped ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-black text-xs">
              <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
            </span>
          ) : isSkinUnlocked ? (
            <button
              type="button"
              onClick={() => onUpdateProfile({ selectedSkinId: inspectingSkin.id })}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95 cursor-pointer"
            >
              EQUIP THIS SNAKE
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                <Lock className="w-3.5 h-3.5" /> LOCKED
              </span>
              <button
                type="button"
                onClick={() => onOpenShop('skins')}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold transition-colors cursor-pointer"
              >
                {inspectingSkin.crateExclusive ? 'Crate Only' : `Armory $${inspectingSkin.price.toLocaleString()}`}
              </button>
            </div>
          )}
        </div>

        {/* Preview Weapon Held Switcher */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="hidden xs:inline">Weapon:</span>
          <button
            type="button"
            onClick={() => setPreviewWeaponIndex((prev) => (prev + 1) % previewWeapons.length)}
            className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-bold hover:border-slate-500 transition-colors uppercase font-mono text-[10px] cursor-pointer"
          >
            {previewWeapons[previewWeaponIndex]} ⇄
          </button>
        </div>
      </div>

      {/* Active & Passive Ability Strip */}
      <div className="w-full mt-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 xs:grid-cols-2 gap-1.5 text-xs font-cyber">
        <div className="flex items-center gap-2 truncate">
          <span className="text-cyan-400 font-bold shrink-0">⚡</span>
          <span className="font-black text-cyan-300 uppercase truncate">
            ACTIVE: {currentAbility.activeName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">({currentAbility.activeCooldown}s)</span>
        </div>

        <div className="flex items-center gap-2 truncate">
          <span className="text-amber-400 font-bold shrink-0">✦</span>
          <span className="font-black text-amber-300 uppercase truncate">
            PASSIVE: {currentAbility.passiveName}
          </span>
        </div>
      </div>
    </div>
  );

  const renderGameModeHub = () => (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-lg backdrop-blur-md shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-cyber text-[10px] sm:text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
          <span>OPERATION MODE:</span>
          <span className="text-white font-black">{activeModeDef.name}</span>
        </span>
        <span className="text-[9px] sm:text-[10px] text-cyan-300 font-mono">
          {activeModeDef.multiplierText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {GAME_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                playRetroButtonClick();
                onUpdateProfile({ selectedGameMode: mode.id });
              }}
              className={`py-1.5 px-2 rounded-lg border text-left font-cyber flex items-center gap-1.5 transition-all cursor-pointer min-w-0 ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-sm shrink-0">{mode.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-[11px] font-black truncate">{mode.name.replace(': MECHA-HYDRA', '')}</div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMode !== 'horde' && selectedMode !== 'boss_raid' && (
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] font-cyber text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">BOT AI:</span>
            <div className="flex items-center gap-1">
              {Object.values(BOT_DIFFICULTIES).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    playRetroButtonClick();
                    onUpdateProfile({ botDifficulty: d.id });
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    selectedDifficulty === d.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">BOTS:</span>
            <div className="flex items-center gap-1">
              {[12, 24, 36].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    playRetroButtonClick();
                    onUpdateProfile({ botCount: count });
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    selectedBotCount === count
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDeployButton = () => (
    <button
      id="btn-start-game"
      type="button"
      onClick={() => {
        playRetroButtonClick();
        stopLobbyMusic(0.3);
        onStartGame();
      }}
      className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 hover:brightness-110 text-slate-950 font-cyber text-base sm:text-lg font-black tracking-widest uppercase flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] border border-cyan-300 shrink-0 cursor-pointer"
    >
      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
      <span>DEPLOY TO WAR</span>
    </button>
  );

  const renderQuickActionTabs = () => (
    <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 font-cyber shrink-0">
      {/* Missions Tab */}
      <button
        id="btn-quick-missions"
        type="button"
        onClick={onOpenMissions}
        className="py-2 px-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm active:scale-95 min-w-0 cursor-pointer"
      >
        <Target className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="font-black text-[9.5px] sm:text-xs truncate w-full text-center">MISSIONS</span>
      </button>

      {/* Leaderboard Tab */}
      <button
        id="btn-quick-ranks"
        type="button"
        onClick={onOpenLeaderboard}
        className="py-2 px-1 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm active:scale-95 min-w-0 cursor-pointer"
      >
        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-black text-[9.5px] sm:text-xs truncate w-full text-center">RANKS</span>
      </button>

      {/* Supply Crate Tab */}
      <button
        id="btn-quick-crate"
        type="button"
        onClick={onOpenCrate}
        className="py-1.5 px-1 rounded-xl bg-gradient-to-b from-amber-500/20 to-yellow-600/20 hover:from-amber-500/35 hover:to-yellow-600/35 border border-amber-400 text-amber-300 font-bold flex flex-col items-center justify-center gap-0.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-all active:scale-95 min-w-0 cursor-pointer"
      >
        <img
          src="/src/assets/images/scifi_weapon_crate_asset_1790341466198.jpg"
          alt="Crate"
          className="w-5 h-5 rounded object-cover shadow shrink-0"
          referrerPolicy="no-referrer"
        />
        <span className="font-black text-[9.5px] sm:text-xs truncate w-full text-center">CRATE (1k)</span>
      </button>

      {/* Armory Shop Tab */}
      <button
        id="btn-quick-shop"
        type="button"
        onClick={() => onOpenShop('skins')}
        className="py-2 px-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 min-w-0 cursor-pointer"
      >
        <ShoppingBag className="w-4 h-4 text-purple-400 shrink-0" />
        <span className="font-black text-[9.5px] sm:text-xs truncate w-full text-center">ARMORY</span>
      </button>
    </div>
  );

  return (
    <div
      id="lobby-view-container"
      className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-slate-950 text-white font-cyber flex flex-col justify-between overflow-x-hidden overflow-y-auto px-2 sm:px-4 py-1.5 sm:py-2 select-none"
      style={{
        paddingTop: 'max(6px, env(safe-area-inset-top, 6px))',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
        paddingLeft: 'max(6px, env(safe-area-inset-left, 6px))',
        paddingRight: 'max(6px, env(safe-area-inset-right, 6px))',
      }}
    >
      {/* Dynamic Cyber Background Aura */}
      <DynamicCyberBackground archetype={inspectingSkin.archetype} />

      {/* Top Bar Navigation */}
      <header
        id="lobby-header-anchor"
        className={`flex items-center justify-between z-10 w-full mx-auto gap-2 mb-1.5 shrink-0 ${
          isLandscapeMode ? 'max-w-6xl' : 'max-w-4xl'
        }`}
      >
        {/* Brand / Title: Cyber Snake */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] shrink-0">
            <Swords className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div>
            <h1 className="font-cyber text-sm sm:text-lg md:text-xl font-black text-white tracking-widest uppercase flex items-center gap-1 leading-none">
              <span>CYBER</span>
              <span className="text-cyan-400">SNAKE</span>
            </h1>
            <p className="text-[8px] sm:text-[9.5px] text-slate-400 font-cyber tracking-wider hidden xs:block mt-0.5">
              TACTICAL BATTLE ROYALE
            </p>
          </div>
        </div>

        {/* Right Top Bar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cash / Coins Display */}
          <button
            id="lobby-coins-display"
            type="button"
            onClick={() => onOpenShop('skins')}
            className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 px-2.5 py-1.5 rounded-xl text-amber-400 font-cyber font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Kill enemies to earn cash! Click to open armory"
          >
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-black">${profile.coins.toLocaleString()}</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={toggleSound}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-cyber text-xs transition-all cursor-pointer ${
              muted
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-400 hover:bg-rose-900/50'
                : 'bg-cyan-950/40 border-cyan-400/80 text-cyan-300 hover:bg-cyan-900/50'
            }`}
            title={muted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase hidden xs:inline">
              {muted ? 'MUTED' : 'SOUND'}
            </span>
          </button>

          {/* Lobby Music (BGM) Toggle Button */}
          <button
            id="btn-toggle-bgm"
            type="button"
            onClick={() => {
              playRetroButtonClick();
              toggleLobbyMusic();
            }}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 font-cyber text-xs cursor-pointer ${
              bgmPlaying
                ? 'bg-purple-950/40 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(192,132,252,0.3)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={bgmPlaying ? 'Pause Lobby Music' : 'Play Lobby Music'}
          >
            <Music className={`w-3.5 h-3.5 ${bgmPlaying ? 'animate-pulse text-purple-400' : 'text-slate-400'} shrink-0`} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase hidden xs:inline">
              {bgmPlaying ? 'BGM' : 'OFF'}
            </span>
          </button>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              id="btn-lobby-settings"
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 transition-all shadow-sm cursor-pointer"
              title="Settings (FPS, Sound, Name, Mechanics)"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            id="btn-lobby-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors hidden sm:block cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-cyan-400" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Landscape / Portrait Switch Button */}
          <button
            id="btn-lobby-orientation-toggle"
            type="button"
            onClick={() => {
              playRetroButtonClick();
              const next = !isLandscapeMode;
              setIsLandscapeMode(next);
              try {
                if (screen.orientation && 'lock' in screen.orientation) {
                  if (next) {
                    (screen.orientation as any).lock('landscape').catch(() => {});
                  } else {
                    (screen.orientation as any).lock('portrait').catch(() => {});
                  }
                }
              } catch {}
            }}
            className={`px-2 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-cyber text-xs transition-all shadow-sm active:scale-95 cursor-pointer ${
              isLandscapeMode
                ? 'bg-cyan-950/50 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-amber-950/50 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
            }`}
            title="Switch between Landscape widescreen cockpit layout and Portrait mobile layout"
          >
            {isLandscapeMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase">
                  LANDSCAPE
                </span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase">
                  PORTRAIT
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content: Dual-layout implementation */}
      {isLandscapeMode ? (
        /* ============================================================== */
        /* LANDSCAPE COCKPIT LAYOUT (Wide 2-Column Responsive Dashboard)  */
        /* ============================================================== */
        <main className="w-full max-w-6xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-y-auto z-10 my-auto py-1">
          {/* Left Column: Pilot, Pass, Customization, Snakes & Modes */}
          <div className="lg:col-span-6 flex flex-col gap-2.5">
            {renderCallsignBar()}
            <BattlePassTracker
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              onOpenPass={() => {
                playRetroButtonClick();
                setShowBattlePassModal(true);
              }}
            />
            {renderCustomizationBar()}
            {renderArchetypesCarousel()}
            {renderGameModeHub()}
          </div>

          {/* Right Column: Snake Preview, Deploy Button & Quick Tabs */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-2.5">
            {renderSnakePreviewCard()}
            <div className="flex flex-col gap-2 shrink-0">
              {renderDeployButton()}
              {renderQuickActionTabs()}
            </div>
          </div>
        </main>
      ) : (
        /* ============================================================== */
        /* PORTRAIT MOBILE LAYOUT (Clean Vertical Scroll, No Collisions)  */
        /* ============================================================== */
        <main className="w-full max-w-lg sm:max-w-xl mx-auto flex-1 flex flex-col gap-2 sm:gap-2.5 overflow-y-auto z-10 my-auto py-1">
          {renderCallsignBar()}
          <BattlePassTracker
            profile={profile}
            onUpdateProfile={onUpdateProfile}
            onOpenPass={() => {
              playRetroButtonClick();
              setShowBattlePassModal(true);
            }}
          />
          {renderCustomizationBar()}
          {renderArchetypesCarousel()}
          {renderSnakePreviewCard()}
          {renderGameModeHub()}
          <div className="flex flex-col gap-2 shrink-0">
            {renderDeployButton()}
            {renderQuickActionTabs()}
          </div>
        </main>
      )}

      {/* Trails Locker Modal */}
      {showTrailsModal && (
        <TrailsModal
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onClose={() => setShowTrailsModal(false)}
        />
      )}

      {/* Battle Pass Modal */}
      {showBattlePassModal && (
        <BattlePassModal
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onClose={() => setShowBattlePassModal(false)}
        />
      )}

      {/* Pilot Mastery Modal */}
      {showMasteryModal && (
        <MasteryModal
          profile={profile}
          onClose={() => setShowMasteryModal(false)}
        />
      )}

      {/* Combat Taunts & Emotes Modal */}
      {showTauntsModal && (
        <TauntsModal
          isOpen={showTauntsModal}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onClose={() => setShowTauntsModal(false)}
        />
      )}
    </div>
  );
};
