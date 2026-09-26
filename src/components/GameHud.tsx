import React, { useState, useEffect } from 'react';
import { Snake, LootItem, KillNotification, MapObstacle, ShieldPowerup, HudLayoutConfig, GameMode, EmoteType, BossRaidInfo, BountyInfo } from '../types';
import { VirtualJoystick } from './VirtualJoystick';
import { FireControl } from './FireControl';
import { AbilityButton } from './AbilityButton';
import { Minimap } from './Minimap';
import { HudCustomizerModal } from './HudCustomizerModal';
import { EmoteBar } from './EmoteBar';
import { loadHudLayout } from '../utils/hudLayout';
import { WEAPONS } from '../utils/weapons';
import {
  Trophy,
  Swords,
  Volume2,
  VolumeX,
  Home,
  Maximize,
  Minimize,
  ChevronDown,
  ChevronUp,
  Target,
  Shield,
  Bomb,
  Crosshair,
  Zap,
  Sliders,
  Activity,
  Smartphone,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { getSoundMuted, setSoundMuted } from '../utils/audio';
import { useFpsDetector } from '../utils/fpsDetector';
import { useScreenOrientation, getAdaptiveScale } from '../utils/orientation';

interface GameHudProps {
  player: Snake | null;
  snakes: Snake[];
  loots: LootItem[];
  obstacles?: MapObstacle[];
  shields?: ShieldPowerup[];
  worldSize: number;
  leaderboard: Array<{ id?: string; rank: number; name: string; score: number; kills: number; isPlayer: boolean }>;
  killFeed: KillNotification[];
  gameMode?: GameMode;
  wave?: number;
  waveAnnouncement?: string | null;
  pelletRushTimer?: number;
  enemiesRemaining?: number;
  bossRaidInfo?: BossRaidInfo | null;
  bountyInfo?: BountyInfo | null;
  onTriggerEmote?: (emoteId: EmoteType) => void;
  onSteer: (angle: number) => void;
  onAim?: (angle: number, isAiming: boolean) => void;
  onFire: () => void;
  onAbility?: () => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  onExitToLobby: () => void;
  onOpenLeaderboard?: () => void;
  onOpenMissions?: () => void;
  onOpenHudCustomizer?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  player,
  snakes,
  loots,
  obstacles = [],
  shields = [],
  worldSize,
  leaderboard,
  killFeed,
  gameMode = 'battle_royale',
  wave = 1,
  waveAnnouncement = null,
  pelletRushTimer = 90,
  enemiesRemaining = 0,
  bossRaidInfo = null,
  bountyInfo = null,
  onTriggerEmote,
  onSteer,
  onAim,
  onFire,
  onAbility,
  onBoostStart,
  onBoostEnd,
  onExitToLobby,
  onOpenLeaderboard,
  onOpenMissions,
}) => {
  const [hudConfig, setHudConfig] = useState<HudLayoutConfig>(loadHudLayout);
  const [showHudCustomizer, setShowHudCustomizer] = useState(false);
  const [muted, setMuted] = React.useState(getSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fpsInfo = useFpsDetector();

  // Screen orientation and dynamic viewport dimensions
  const screenDim = useScreenOrientation();
  const adaptiveScale = getAdaptiveScale({
    width: screenDim.width,
    height: screenDim.height,
    isPortrait: screenDim.isPortrait,
    isShortScreen: screenDim.isShortScreen,
  });

  // In portrait mode, default to collapsed leaderboard to keep narrow screens clean
  const [showLeaderboard, setShowLeaderboard] = useState(() => {
    if (typeof window !== 'undefined') {
      const isPort = window.innerHeight > window.innerWidth;
      return !isPort && window.innerWidth >= 768;
    }
    return false;
  });

  // Sync leaderboard default collapse state when orientation flips
  useEffect(() => {
    if (screenDim.isPortrait) {
      setShowLeaderboard(false);
    }
  }, [screenDim.isPortrait]);

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

  const currentWeaponCfg = player?.weapon ? WEAPONS[player.weapon] : null;

  return (
    <div
      id="game-hud-overlay"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-20"
      style={{
        paddingTop: 'max(4px, env(safe-area-inset-top, 4px))',
        paddingRight: 'max(6px, env(safe-area-inset-right, 6px))',
        paddingBottom: 'max(4px, env(safe-area-inset-bottom, 4px))',
        paddingLeft: 'max(6px, env(safe-area-inset-left, 6px))',
      }}
    >
      {/* ============================================================== */}
      {/* 1. TOP-LEFT CORNER ANCHOR: Vital Stats & Controls Toolbar      */}
      {/* ============================================================== */}
      <div
        id="hud-anchor-top-left"
        className="absolute top-1 sm:top-2 left-1.5 sm:left-2 flex flex-col gap-1.5 pointer-events-none z-20"
        style={{
          top: 'max(6px, env(safe-area-inset-top, 6px))',
          left: 'max(8px, env(safe-area-inset-left, 8px))',
        }}
      >
        {/* Row 1: Vital Combat Stats */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/90 border border-slate-700/80 rounded-xl p-1 sm:p-1.5 shadow-lg backdrop-blur-md pointer-events-auto">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 font-cyber font-black text-cyan-300 text-[10px] sm:text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>SCORE: {player?.score || 0}</span>
          </div>

          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-rose-500/20 border border-rose-400 font-cyber font-black text-rose-300 text-[10px] sm:text-xs flex items-center gap-1">
            <Swords className="w-3 h-3 text-rose-400" />
            <span>KILLS: {player?.kills || 0}</span>
          </div>

          {/* Length: Enabled in Landscape mode on larger viewports */}
          {screenDim.isLandscape && screenDim.width >= 640 && (
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 font-cyber font-black text-emerald-300 text-[10px] sm:text-xs flex items-center gap-1 animate-in fade-in duration-150">
              <span>LENGTH: {player ? Math.floor(player.length) : 0}</span>
            </div>
          )}

          {/* Active Shield Defense Status */}
          {player?.shieldHp && player.shieldHp > 0 ? (
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-sky-500/25 border border-sky-400 font-cyber font-black text-sky-300 text-[10px] sm:text-xs flex items-center gap-1 shadow-lg shadow-sky-500/20 animate-pulse">
              <Shield className="w-3 h-3 text-sky-300 fill-sky-400/40" />
              <span>SHIELD: {Math.round(player.shieldHp)}</span>
              {player.shieldTimer !== undefined && (
                <span className="text-[9px] text-sky-200/80 font-mono">({Math.ceil(player.shieldTimer)}s)</span>
              )}
            </div>
          ) : null}

          {/* Real-time Device FPS Detector */}
          <div
            id="hud-fps-detector"
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border font-cyber font-black text-[9px] sm:text-xs flex items-center gap-1 transition-colors ${
              fpsInfo.currentFps >= 55
                ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300'
                : fpsInfo.currentFps >= 30
                ? 'bg-amber-500/15 border-amber-400/60 text-amber-300'
                : 'bg-rose-500/15 border-rose-400/60 text-rose-300'
            }`}
            title={`Device FPS: ${fpsInfo.currentFps} | Screen Refresh: ${fpsInfo.label} | ${screenDim.orientation.toUpperCase()} mode`}
          >
            <Activity className={`w-3 h-3 ${fpsInfo.currentFps >= 55 ? 'text-emerald-400' : fpsInfo.currentFps >= 30 ? 'text-amber-400' : 'text-rose-400'}`} />
            <span>{fpsInfo.currentFps} FPS</span>
          </div>
        </div>

        {/* Row 2: In-Game Action Controls Toolbar */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 rounded-xl p-1 shadow-md backdrop-blur-md pointer-events-auto self-start">
          {/* Sound Toggle */}
          <button
            id="btn-hud-sound"
            type="button"
            onClick={toggleSound}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 transition-colors"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Daily Missions Toggle */}
          {onOpenMissions && (
            <button
              id="btn-hud-missions"
              type="button"
              onClick={onOpenMissions}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 transition-colors"
              title="Daily Missions"
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          {/* Arena Leaderboard Toggle */}
          {onOpenLeaderboard && (
            <button
              id="btn-hud-leaderboard"
              type="button"
              onClick={onOpenLeaderboard}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 flex items-center justify-center text-amber-300 transition-colors"
              title="Arena Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {/* Configure HUD / Controls Layout */}
          <button
            id="btn-hud-customize"
            type="button"
            onClick={() => setShowHudCustomizer(true)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-300 transition-colors hidden xs:flex"
            title="Customize Controls & HUD Layout"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="btn-hud-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize className="w-3.5 h-3.5 text-slate-300" />}
          </button>

          {/* Exit to Lobby */}
          <button
            id="btn-hud-exit"
            type="button"
            onClick={onExitToLobby}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-rose-300 hover:text-rose-200 transition-colors"
            title="Return to Lobby"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Kill Feed: Quiet, single/double notification that doesn't obstruct view */}
        <div id="kill-feed" className="flex flex-col gap-1 max-w-[200px] sm:max-w-[260px] pointer-events-none">
          {killFeed.slice(0, screenDim.isPortrait ? 1 : 2).map((kf) => (
            <div
              key={kf.id}
              className="text-[9px] sm:text-[10px] font-cyber bg-slate-950/75 border border-slate-800/80 px-2 py-0.5 rounded-lg text-slate-300 backdrop-blur-sm shadow flex items-center gap-1.5 animate-in fade-in slide-in-from-left duration-150"
            >
              <span className="font-bold text-cyan-400 truncate max-w-[65px] sm:max-w-[80px]">{kf.killer}</span>
              <span className="text-rose-400 font-bold shrink-0 text-[8px]">
                {kf.weapon === 'grenade' ? '💥 GRENADED' : '⚡ ELIMINATED'}
              </span>
              <span className="text-slate-400 truncate max-w-[65px] sm:max-w-[80px]">{kf.victim}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TOP-CENTER TACTICAL MODE & ANNOUNCEMENT ANCHOR                 */}
      {/* ============================================================== */}
      <div
        id="hud-anchor-top-center"
        className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 font-cyber max-w-[90vw]"
        style={{
          top: 'max(4px, env(safe-area-inset-top, 4px))',
        }}
      >
        {/* Mode & Timer Badge */}
        {gameMode === 'horde' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/85 border border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md">
            <span className="text-xs">👾</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-purple-200">
              WAVE {wave}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              • {enemiesRemaining} DRONES LEFT
            </span>
          </div>
        ) : gameMode === 'boss_raid' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/85 border border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md">
            <span className="text-xs">🤖</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-200">
              TITAN BOSS RAID
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">
              • PHASE {bossRaidInfo?.phase || 1}/3
            </span>
          </div>
        ) : gameMode === 'bounty_hunt' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/85 border border-yellow-500/50 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)] backdrop-blur-md">
            <span className="text-xs">🎯</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-yellow-200">
              CYBER BOUNTY HUNT (3.5X CASH)
            </span>
          </div>
        ) : gameMode === 'pellet_rush' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/85 border border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md">
            <span className="text-xs">⚡</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-200">
              PELLET RUSH (3X VALUE)
            </span>
            <span className="text-[10px] sm:text-[11px] text-amber-400 font-mono font-bold">
              • ⏱️ {Math.ceil(pelletRushTimer)}s
            </span>
          </div>
        ) : gameMode === 'instant_death' ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/85 border border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] backdrop-blur-md animate-pulse">
            <span className="text-xs">☠️</span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-200">
              INSTANT DEATH (1-HIT LETHAL)
            </span>
          </div>
        ) : null}

        {/* Colossal Boss Raid Health & Shield Bar */}
        {bossRaidInfo && (
          <div className="mt-1 w-[88vw] max-w-sm sm:max-w-md bg-slate-950/92 border-2 border-amber-500/60 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-1 pointer-events-auto">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-cyber">
              <span className="font-black text-amber-300 flex items-center gap-2 truncate">
                <img
                  src="/src/assets/images/scifi_mecha_hydra_boss_1790341479724.jpg"
                  alt="MECHA-HYDRA 9000 Boss"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-rose-500/80 object-cover shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate">{bossRaidInfo.name}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black border border-amber-500/40 shrink-0">
                PHASE {bossRaidInfo.phase}/3 {bossRaidInfo.isEnraged ? '🔥 OVERDRIVE' : ''}
              </span>
            </div>

            {/* Shield Bar if active */}
            {bossRaidInfo.shieldHp > 0 && (
              <div className="relative w-full h-1.5 sm:h-2 rounded-full bg-slate-900 border border-sky-500/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                  style={{ width: `${Math.min(100, (bossRaidInfo.shieldHp / bossRaidInfo.maxShieldHp) * 100)}%` }}
                />
              </div>
            )}

            {/* Colossal HP Bar */}
            <div className="relative w-full h-2.5 sm:h-3 rounded-full bg-slate-900 border border-rose-500/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(244,63,94,0.6)] transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, (bossRaidInfo.hp / bossRaidInfo.maxHp) * 100))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
              <span>HP: {Math.max(0, bossRaidInfo.hp)} / {bossRaidInfo.maxHp}</span>
              <span>CORES: {bossRaidInfo.coresRemaining} / {bossRaidInfo.totalCores}</span>
            </div>

            {/* Boss Threat Telegraph Alert Banner */}
            {bossRaidInfo.telegraph && (
              <div className="mt-0.5 text-center text-[9px] sm:text-[10px] font-cyber font-black text-rose-300 bg-rose-950/60 py-0.5 px-2 rounded-lg border border-rose-500/50 animate-pulse">
                {bossRaidInfo.telegraph}
              </div>
            )}
          </div>
        )}

        {/* 360° Compass Radar HUD Beacon for Most Wanted Target */}
        {bountyInfo && (
          <div className="mt-1 flex flex-col items-center pointer-events-auto">
            {bountyInfo.isPlayer ? (
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 border-2 border-yellow-400 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.6)] backdrop-blur-md flex items-center gap-2 animate-pulse font-cyber">
                <img
                  src="/src/assets/images/scifi_cyber_bounty_hvt_1790341500582.jpg"
                  alt="Wanted"
                  className="w-5 h-5 rounded-full border border-yellow-400 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  YOU ARE MOST WANTED! SURVIVE: {bountyInfo.survivalTimer || 20}s
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-yellow-200 bg-yellow-950/60 px-1.5 py-0.5 rounded border border-yellow-400/40">
                  +$350 BONUS
                </span>
              </div>
            ) : (
              <div className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-950/90 border border-yellow-500/60 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)] backdrop-blur-md flex items-center gap-1.5 sm:gap-2 font-cyber text-[9px] sm:text-xs">
                <img
                  src="/src/assets/images/scifi_cyber_bounty_hvt_1790341500582.jpg"
                  alt="Target"
                  className="w-5 h-5 rounded-full border border-yellow-400 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="w-4 h-4 flex items-center justify-center transition-transform duration-100"
                  style={{ transform: `rotate(${bountyInfo.angleToTarget + Math.PI / 2}rad)` }}
                  title="Bearing towards Most Wanted target"
                >
                  <span className="text-yellow-400 text-xs">▲</span>
                </div>
                <span className="text-yellow-400/90 font-bold">MOST WANTED:</span>
                <span className="font-black text-white truncate max-w-[80px] sm:max-w-[110px]">
                  {bountyInfo.targetName}
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {bountyInfo.distance}m
                </span>
                <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-mono font-black border border-yellow-400/40">
                  {'★'.repeat(bountyInfo.stars)} ${bountyInfo.bountyValue}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Large Central Holographic Wave Announcement Banner */}
        {waveAnnouncement && (
          <div className="mt-2 px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-amber-400 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.6)] backdrop-blur-lg animate-in zoom-in-95 duration-200 text-center">
            <span className="font-cyber font-black text-sm sm:text-base tracking-widest uppercase">
              {waveAnnouncement}
            </span>
          </div>
        )}
      </div>

      {/* In-Game Taunt Emote Bar */}
      {onTriggerEmote && (
        <EmoteBar onTriggerEmote={onTriggerEmote} disabled={!player || player.isDead} />
      )}

      {/* ============================================================== */}
      {/* 2. TOP-RIGHT CORNER ANCHOR: Leaderboard & Minimap Radar        */}
      {/* ============================================================== */}
      <div
        id="hud-anchor-top-right"
        className="absolute top-1 sm:top-2 right-1.5 sm:right-2 flex flex-col items-end gap-1.5 pointer-events-none z-20"
        style={{
          top: 'max(4px, env(safe-area-inset-top, 4px))',
          right: 'max(6px, env(safe-area-inset-right, 6px))',
        }}
      >
        {/* Collapsible Arena Leaderboard: Compact in Portrait, Expanded in Landscape */}
        <div
          id="arena-leaderboard"
          className="w-32 sm:w-44 bg-slate-950/85 border border-slate-800/90 rounded-xl p-1 sm:p-1.5 shadow-xl backdrop-blur-md pointer-events-auto transition-all"
        >
          <button
            type="button"
            onClick={() => setShowLeaderboard((prev) => !prev)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="font-cyber text-[9px] sm:text-[10px] font-black text-amber-400 flex items-center gap-1 truncate">
              <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{screenDim.isPortrait && !showLeaderboard ? 'RANKS' : 'TOP SNAKES'}</span>
            </span>
            <span className="text-slate-400 flex items-center text-[10px] font-cyber ml-1">
              {showLeaderboard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </button>

          {showLeaderboard && (
            <div className="space-y-0.5 mt-1 border-t border-slate-800 pt-1 animate-in fade-in duration-150">
              {leaderboard.slice(0, 4).map((entry, idx) => (
                <div
                  key={entry.id || `${entry.name}-${entry.rank || idx}-${entry.isPlayer ? 'player' : 'bot'}`}
                  className={`flex items-center justify-between text-[8px] sm:text-[9px] font-cyber px-1 py-0.5 rounded ${
                    entry.isPlayer
                      ? 'bg-cyan-500/20 text-cyan-300 font-black border border-cyan-500/40'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="truncate flex items-center gap-0.5">
                    <span className="text-[8px] text-slate-500 w-2.5">{entry.rank}.</span>
                    <span className="truncate max-w-[55px] sm:max-w-[75px]">{entry.name}</span>
                  </span>
                  <span className="text-slate-400 font-bold ml-1">{entry.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minimap radar: Resizes dynamically with screen height and width */}
        <div
          id="hud-minimap-container"
          className="pointer-events-auto origin-top-right transition-transform"
          style={{
            transform: `scale(${hudConfig.minimap.scale * (screenDim.isPortrait ? 0.88 : 1.0) * adaptiveScale})`,
            opacity: hudConfig.minimap.opacity,
          }}
        >
          <Minimap
            worldSize={worldSize}
            player={player}
            snakes={snakes}
            loots={loots}
            obstacles={obstacles}
            shields={shields}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MID-LEFT EDGE ANCHOR: Vertical Tactical Weapon Gauge        */}
      {/* ============================================================== */}
      {currentWeaponCfg && player && (
        <div
          id="hud-anchor-mid-left-weapon"
          className="absolute pointer-events-auto flex flex-col items-center bg-slate-950/92 border-2 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-left duration-200 z-20 origin-top-left"
          style={{
            left: 'max(6px, env(safe-area-inset-left, 6px))',
            top: screenDim.isPortrait ? 'clamp(68px, 14vh, 105px)' : 'clamp(58px, 18vh, 95px)',
            borderColor: currentWeaponCfg.color,
            boxShadow: `0 0 16px ${currentWeaponCfg.color}35`,
            transform: `scale(${hudConfig.weaponGauge.scale * (screenDim.isPortrait ? 0.9 : 1.0) * adaptiveScale})`,
            opacity: hudConfig.weaponGauge.opacity,
          }}
        >
          {/* Weapon Icon */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-inner"
            style={{
              backgroundColor: `${currentWeaponCfg.color}25`,
              border: `1px solid ${currentWeaponCfg.color}60`,
            }}
          >
            {player.weapon === 'grenade' && <Bomb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
            {player.weapon === 'pistol' && <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />}
            {player.weapon === 'ar' && <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            {player.weapon === 'sniper' && <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />}
          </div>

          {/* Ammo Numeric Count */}
          <div className="text-center my-0.5">
            <div className="font-cyber font-black text-xs sm:text-sm text-white tracking-tight leading-none">
              {player.ammo}
            </div>
            <div className="font-mono text-[8px] text-slate-400 uppercase tracking-tighter">
              /{currentWeaponCfg.ammo}
            </div>
          </div>

          {/* Vertical Segmented Ammo Gauge (pips) */}
          <div className="flex flex-col-reverse gap-0.5 my-1 w-2.5 sm:w-3 bg-slate-900/90 rounded p-0.5 border border-slate-800">
            {Array.from({ length: Math.min(currentWeaponCfg.ammo, 6) }).map((_, idx) => {
              const threshold = (idx + 1) * (currentWeaponCfg.ammo / Math.min(currentWeaponCfg.ammo, 6));
              const filled = player.ammo >= threshold;
              return (
                <div
                  key={idx}
                  className="w-full h-1 sm:h-1.5 rounded-sm transition-all"
                  style={{
                    backgroundColor: filled ? currentWeaponCfg.color : 'rgba(51, 65, 85, 0.3)',
                    boxShadow: filled ? `0 0 4px ${currentWeaponCfg.color}` : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Vertical Weapon Title */}
          <div
            className="font-cyber font-black text-[9px] uppercase tracking-widest text-center my-1 select-none"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              color: currentWeaponCfg.color,
            }}
          >
            {currentWeaponCfg.name.replace('TACTICAL ', '')}
          </div>

          {/* Weapon Trait Badge */}
          <div className="mt-0.5 px-1 py-0.5 rounded bg-white/10 text-[7px] sm:text-[8px] font-cyber font-bold text-slate-300 text-center uppercase tracking-tighter leading-tight max-w-[42px]">
            {currentWeaponCfg.badge}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BOTTOM-LEFT CORNER ANCHOR: Virtual Joystick                 */}
      {/* ============================================================== */}
      <div
        id="hud-anchor-bottom-left"
        className="absolute pointer-events-auto select-none z-30 origin-bottom-left"
        style={{
          bottom: 'max(4px, env(safe-area-inset-bottom, 4px))',
          left: 'max(6px, env(safe-area-inset-left, 6px))',
          transform: `scale(${hudConfig.joystick.scale * adaptiveScale})`,
        }}
      >
        <VirtualJoystick
          onMove={onSteer}
          isFloating={hudConfig.isFloatingJoystick}
          scale={hudConfig.joystick.scale}
          opacity={hudConfig.joystick.opacity}
        />
      </div>

      {/* ============================================================== */}
      {/* 5. BOTTOM-RIGHT CORNER ANCHOR: Ability + Fire & Boost Controls */}
      {/* ============================================================== */}
      <div
        id="hud-anchor-bottom-right"
        className="absolute pointer-events-auto flex items-end gap-2 sm:gap-3 select-none z-30 origin-bottom-right"
        style={{
          bottom: 'max(4px, env(safe-area-inset-bottom, 4px))',
          right: 'max(6px, env(safe-area-inset-right, 6px))',
          transform: `scale(${adaptiveScale})`,
        }}
      >
        {/* Active Archetype Ability Button */}
        {hudConfig.abilityBtn?.visible !== false && (
          <div className="mb-1">
            <AbilityButton
              player={player}
              onTrigger={onAbility || (() => {})}
              scale={hudConfig.abilityBtn?.scale || 1.0}
              opacity={hudConfig.abilityBtn?.opacity || 0.95}
            />
          </div>
        )}

        <FireControl
          weapon={player?.weapon || null}
          ammo={player?.ammo || 0}
          targetLocked={!!player?.targetLockedSnakeId}
          onAim={onAim || (() => {})}
          onFire={onFire}
          onBoostStart={onBoostStart}
          onBoostEnd={onBoostEnd}
          padScale={hudConfig.firePad.scale}
          padOpacity={hudConfig.firePad.opacity}
          boostScale={hudConfig.boostBtn.scale}
          boostOpacity={hudConfig.boostBtn.opacity}
        />
      </div>

      {/* HUD Layout & Controls Customizer Modal */}
      {showHudCustomizer && (
        <HudCustomizerModal
          layout={hudConfig}
          onSave={(newLayout) => {
            setHudConfig(newLayout);
          }}
          onClose={() => setShowHudCustomizer(false)}
        />
      )}
    </div>
  );
};

