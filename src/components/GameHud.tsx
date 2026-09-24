import React, { useState, useEffect } from 'react';
import { Snake, LootItem, KillNotification, MapObstacle, ShieldPowerup, HudLayoutConfig } from '../types';
import { VirtualJoystick } from './VirtualJoystick';
import { FireControl } from './FireControl';
import { AbilityButton } from './AbilityButton';
import { Minimap } from './Minimap';
import { HudCustomizerModal } from './HudCustomizerModal';
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
} from 'lucide-react';
import { getSoundMuted, setSoundMuted } from '../utils/audio';
import { useFpsDetector } from '../utils/fpsDetector';

interface GameHudProps {
  player: Snake | null;
  snakes: Snake[];
  loots: LootItem[];
  obstacles?: MapObstacle[];
  shields?: ShieldPowerup[];
  worldSize: number;
  leaderboard: Array<{ id?: string; rank: number; name: string; score: number; kills: number; isPlayer: boolean }>;
  killFeed: KillNotification[];
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
  const [showLeaderboard, setShowLeaderboard] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

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
        paddingRight: 'max(8px, env(safe-area-inset-right, 8px))',
        paddingBottom: 'max(4px, env(safe-area-inset-bottom, 4px))',
        paddingLeft: 'max(8px, env(safe-area-inset-left, 8px))',
      }}
    >
      {/* Top Header Row: Vital Stats & Minimap/Leaderboard */}
      <div className="absolute top-1 sm:top-2 left-2 right-2 flex items-start justify-between pointer-events-none z-20">
        {/* Left: Player Vital Stats & Kill Feed */}
        <div className="flex flex-col gap-1 sm:gap-1.5 pointer-events-none">
          {/* Stats Bar */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/85 border border-slate-700/80 rounded-xl p-1 sm:p-1.5 shadow-lg backdrop-blur-md pointer-events-auto">
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 font-cyber font-black text-cyan-300 text-[10px] sm:text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              SCORE: {player?.score || 0}
            </div>

            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-rose-500/20 border border-rose-400 font-cyber font-black text-rose-300 text-[10px] sm:text-xs flex items-center gap-1">
              <Swords className="w-3 h-3 text-rose-400" />
              KILLS: {player?.kills || 0}
            </div>

            <div className="hidden lg:flex px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 font-cyber font-black text-emerald-300 text-xs items-center gap-1">
              LENGTH: {player ? Math.floor(player.length) : 0}
            </div>

            {/* Active Shield Defense Status */}
            {player?.shieldHp && player.shieldHp > 0 ? (
              <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-sky-500/25 border border-sky-400 font-cyber font-black text-sky-300 text-[10px] sm:text-xs flex items-center gap-1 shadow-lg shadow-sky-500/20 animate-pulse">
                <Shield className="w-3 h-3 text-sky-300 fill-sky-400/40" />
                SHIELD: {Math.round(player.shieldHp)}
                {player.shieldTimer !== undefined && (
                  <span className="text-[9px] text-sky-200/80 font-mono">({Math.ceil(player.shieldTimer)}s)</span>
                )}
              </div>
            ) : null}

            {/* Real-time Device FPS & Refresh Rate Detector */}
            <div
              id="hud-fps-detector"
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border font-cyber font-black text-[10px] sm:text-xs flex items-center gap-1.5 transition-colors ${
                fpsInfo.currentFps >= 55
                  ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300'
                  : fpsInfo.currentFps >= 30
                  ? 'bg-amber-500/15 border-amber-400/60 text-amber-300'
                  : 'bg-rose-500/15 border-rose-400/60 text-rose-300'
              }`}
              title={`Device FPS: ${fpsInfo.currentFps} | Screen Refresh: ${fpsInfo.label}`}
            >
              <Activity className={`w-3 h-3 ${fpsInfo.currentFps >= 55 ? 'text-emerald-400' : fpsInfo.currentFps >= 30 ? 'text-amber-400' : 'text-rose-400'}`} />
              <span>FPS: {fpsInfo.currentFps}</span>
              <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">({fpsInfo.label})</span>
            </div>

            {/* Daily Missions Toggle */}
            {onOpenMissions && (
              <button
                id="btn-hud-missions"
                type="button"
                onClick={onOpenMissions}
                className="p-1 sm:p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/70 text-cyan-300 transition-colors"
                title="Daily Missions"
              >
                <Target className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}

            {/* Global Leaderboard Toggle */}
            {onOpenLeaderboard && (
              <button
                id="btn-hud-leaderboard"
                type="button"
                onClick={onOpenLeaderboard}
                className="p-1 sm:p-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 hover:bg-amber-900/70 text-amber-300 transition-colors"
                title="Arena Leaderboard"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            {/* Sound Toggle */}
            <button
              id="btn-hud-sound"
              type="button"
              onClick={toggleSound}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Sound"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="btn-hud-fullscreen"
              type="button"
              onClick={toggleFullscreen}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            {/* Configure HUD / Controls Layout */}
            <button
              id="btn-hud-customize"
              type="button"
              onClick={() => setShowHudCustomizer(true)}
              className="p-1 sm:p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/70 text-cyan-300 transition-colors"
              title="Customize Controls & HUD Layout"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Exit to Lobby */}
            <button
              id="btn-hud-exit"
              type="button"
              onClick={onExitToLobby}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to Lobby"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Kill Feed (compact) */}
          <div id="kill-feed" className="flex flex-col gap-1 max-w-[200px] sm:max-w-[260px] pointer-events-none">
            {killFeed.slice(0, 2).map((kf) => (
              <div
                key={kf.id}
                className="text-[9px] sm:text-[10px] font-cyber bg-slate-950/75 border border-slate-800/80 px-2 py-0.5 rounded-lg text-slate-300 backdrop-blur-sm shadow flex items-center gap-1 animate-in fade-in slide-in-from-left duration-150"
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

        {/* Right: Leaderboard & Minimap */}
        <div className="flex flex-col items-end gap-1.5 pointer-events-none">
          {/* Collapsible Leaderboard Header */}
          <div
            id="arena-leaderboard"
            className="w-36 sm:w-48 bg-slate-950/85 border border-slate-800/90 rounded-xl p-1.5 shadow-xl backdrop-blur-md pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => setShowLeaderboard((prev) => !prev)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="font-cyber text-[10px] sm:text-[11px] font-black text-amber-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" /> TOP CYBER SNAKES
              </span>
              <span className="text-slate-400 flex items-center text-[10px] font-cyber">
                {showLeaderboard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </button>

            {showLeaderboard && (
              <div className="space-y-0.5 mt-1 border-t border-slate-800 pt-1 animate-in fade-in duration-150">
                {leaderboard.slice(0, 4).map((entry, idx) => (
                  <div
                    key={entry.id || `${entry.name}-${entry.rank || idx}-${entry.isPlayer ? 'player' : 'bot'}`}
                    className={`flex items-center justify-between text-[9px] sm:text-[10px] font-cyber px-1 py-0.5 rounded ${
                      entry.isPlayer
                        ? 'bg-cyan-500/20 text-cyan-300 font-black border border-cyan-500/40'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1">
                      <span className="text-[8px] text-slate-500 w-2.5">{entry.rank}.</span>
                      <span className="truncate max-w-[65px] sm:max-w-[85px]">{entry.name}</span>
                    </span>
                    <span className="text-slate-400 font-bold">{entry.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Minimap radar */}
          <div
            className="pointer-events-auto origin-top-right transition-transform"
            style={{
              transform: `scale(${hudConfig.minimap.scale})`,
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
      </div>

      {/* Left-Side Vertical Weapon Indicator (placed on the left side of the screen, vertical) */}
      {currentWeaponCfg && player && (
        <div
          id="left-vertical-weapon-indicator"
          className="absolute left-2 sm:left-3 top-20 sm:top-24 pointer-events-auto flex flex-col items-center bg-slate-950/92 border-2 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-left duration-200 z-20 origin-top-left"
          style={{
            borderColor: currentWeaponCfg.color,
            boxShadow: `0 0 16px ${currentWeaponCfg.color}35`,
            transform: `scale(${hudConfig.weaponGauge.scale})`,
            opacity: hudConfig.weaponGauge.opacity,
          }}
        >
          {/* Glowing Weapon Icon Header */}
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

          {/* Vertical Segmented Ammo Gauge (visual pips) */}
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

          {/* Rotated Vertical Weapon Title */}
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

      {/* Bottom Controls Row: Virtual Joystick (Left) + Fire Controls & Ability (Right) */}
      <div className="absolute bottom-1 sm:bottom-2 left-2 right-2 flex items-end justify-between pointer-events-none select-none z-30">
        {/* Left: Virtual Analog Joystick (Floating follow or fixed) */}
        <div className="pointer-events-auto">
          <VirtualJoystick
            onMove={onSteer}
            isFloating={hudConfig.isFloatingJoystick}
            scale={hudConfig.joystick.scale}
            opacity={hudConfig.joystick.opacity}
          />
        </div>

        {/* Right: Archetype Active Ability + Fire & Boost Action Controls */}
        <div className="pointer-events-auto flex items-end gap-2.5 sm:gap-3">
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
