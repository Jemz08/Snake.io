import React, { useState, useEffect } from 'react';
import { Snake, LootItem, KillNotification } from '../types';
import { VirtualJoystick } from './VirtualJoystick';
import { FireControl } from './FireControl';
import { Minimap } from './Minimap';
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
} from 'lucide-react';
import { getSoundMuted, setSoundMuted } from '../utils/audio';

interface GameHudProps {
  player: Snake | null;
  snakes: Snake[];
  loots: LootItem[];
  worldSize: number;
  leaderboard: Array<{ rank: number; name: string; score: number; kills: number; isPlayer: boolean }>;
  killFeed: KillNotification[];
  onSteer: (angle: number) => void;
  onAim?: (angle: number, isAiming: boolean) => void;
  onFire: () => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  onExitToLobby: () => void;
  onOpenLeaderboard?: () => void;
  onOpenMissions?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  player,
  snakes,
  loots,
  worldSize,
  leaderboard,
  killFeed,
  onSteer,
  onAim,
  onFire,
  onBoostStart,
  onBoostEnd,
  onExitToLobby,
  onOpenLeaderboard,
  onOpenMissions,
}) => {
  const [muted, setMuted] = React.useState(getSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
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
      className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20"
      style={{
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingRight: 'max(10px, env(safe-area-inset-right, 10px))',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
        paddingLeft: 'max(10px, env(safe-area-inset-left, 10px))',
      }}
    >
      {/* Top HUD Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Player Vital Stats & Kill Feed */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {/* Stats Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/85 border border-slate-700/80 rounded-xl p-1.5 sm:p-2 shadow-lg backdrop-blur-md pointer-events-auto">
            <div className="px-2 sm:px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 font-cyber font-black text-cyan-300 text-[10px] sm:text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-ping" />
              SCORE: {player?.score || 0}
            </div>

            <div className="px-2 sm:px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-400 font-cyber font-black text-rose-300 text-[10px] sm:text-xs flex items-center gap-1">
              <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              KILLS: {player?.kills || 0}
            </div>

            <div className="hidden md:flex px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 font-cyber font-black text-emerald-300 text-xs items-center gap-1">
              LENGTH: {player ? Math.floor(player.length) : 0}
            </div>

            {/* Daily Missions Toggle */}
            {onOpenMissions && (
              <button
                id="btn-hud-missions"
                type="button"
                onClick={onOpenMissions}
                className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/70 text-cyan-300 transition-colors"
                title="Daily Missions"
              >
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </button>
            )}

            {/* Global Leaderboard Toggle */}
            {onOpenLeaderboard && (
              <button
                id="btn-hud-leaderboard"
                type="button"
                onClick={onOpenLeaderboard}
                className="p-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 hover:bg-amber-900/70 text-amber-300 transition-colors"
                title="Arena Leaderboard"
              >
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </button>
            )}

            {/* Sound Toggle */}
            <button
              id="btn-hud-sound"
              type="button"
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Sound"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="btn-hud-fullscreen"
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />}
            </button>

            {/* Exit to Lobby */}
            <button
              id="btn-hud-exit"
              type="button"
              onClick={onExitToLobby}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to Lobby"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Kill Feed */}
          <div id="kill-feed" className="flex flex-col gap-1 max-w-[220px] sm:max-w-[280px]">
            {killFeed.slice(0, 3).map((kf) => (
              <div
                key={kf.id}
                className="text-[10px] sm:text-[11px] font-cyber bg-slate-950/75 border border-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-slate-300 backdrop-blur-sm shadow flex items-center gap-1.5 animate-in fade-in slide-in-from-left duration-200"
              >
                <span className="font-bold text-cyan-400 truncate max-w-[70px] sm:max-w-[90px]">{kf.killer}</span>
                <span className="text-rose-400 font-bold shrink-0">
                  {kf.weapon === 'grenade' ? '💥 GRENADED' : '⚡ ELIMINATED'}
                </span>
                <span className="text-slate-400 truncate max-w-[70px] sm:max-w-[90px]">{kf.victim}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard & Minimap */}
        <div className="flex flex-col items-end gap-2 sm:gap-3">
          {/* Collapsible Leaderboard */}
          <div
            id="arena-leaderboard"
            className="w-40 sm:w-52 bg-slate-950/85 border border-slate-800/90 rounded-xl p-2 shadow-xl backdrop-blur-md pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => setShowLeaderboard((prev) => !prev)}
              className="w-full flex items-center justify-between border-b border-slate-800 pb-1 text-left"
            >
              <span className="font-cyber text-[10px] sm:text-[11px] font-black text-amber-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> TOP SNAKES²
              </span>
              <span className="text-slate-400 flex items-center text-[10px] font-cyber">
                {showLeaderboard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </button>

            {showLeaderboard && (
              <div className="space-y-1 mt-1.5 animate-in fade-in duration-150">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div
                    key={entry.name}
                    className={`flex items-center justify-between text-[10px] sm:text-xs font-cyber px-1 py-0.5 rounded ${
                      entry.isPlayer
                        ? 'bg-cyan-500/20 text-cyan-300 font-black border border-cyan-500/40'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 w-2.5">{entry.rank}.</span>
                      <span className="truncate max-w-[75px] sm:max-w-[95px]">{entry.name}</span>
                    </span>
                    <span className="text-slate-400 font-bold">{entry.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Minimap radar */}
          <div className="pointer-events-auto">
            <Minimap worldSize={worldSize} player={player} snakes={snakes} loots={loots} />
          </div>
        </div>
      </div>

      {/* Center Armed Weapon Banner (when equipped) */}
      {currentWeaponCfg && player && (
        <div
          className="self-center pointer-events-auto bg-slate-950/85 border border-current px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 sm:gap-3 text-white transition-all animate-in zoom-in-95"
          style={{ borderColor: currentWeaponCfg.color }}
        >
          <div className="font-cyber text-[10px] sm:text-xs font-black uppercase tracking-wider" style={{ color: currentWeaponCfg.color }}>
            ⚡ {currentWeaponCfg.name}
          </div>
          <div className="h-3 sm:h-4 w-[1px] bg-slate-700" />
          <div className="font-cyber text-[10px] sm:text-xs font-black text-white">
            AMMO: {player.ammo} / {currentWeaponCfg.ammo}
          </div>
          <div className="text-[9px] sm:text-[10px] font-cyber bg-white/10 px-1.5 py-0.5 rounded uppercase font-bold text-slate-300">
            {currentWeaponCfg.badge}
          </div>
        </div>
      )}

      {/* Bottom Controls Row: Virtual Joystick (Left) + Fire Controls (Right) */}
      <div className="flex items-end justify-between w-full pointer-events-none select-none px-1 sm:px-2">
        {/* Left: Virtual Analog Joystick */}
        <div className="pointer-events-auto">
          <VirtualJoystick onMove={onSteer} />
        </div>

        {/* Right: Fire & Boost Action Controls */}
        <div className="pointer-events-auto">
          <FireControl
            weapon={player?.weapon || null}
            ammo={player?.ammo || 0}
            targetLocked={!!player?.targetLockedSnakeId}
            onAim={onAim || (() => {})}
            onFire={onFire}
            onBoostStart={onBoostStart}
            onBoostEnd={onBoostEnd}
          />
        </div>
      </div>
    </div>
  );
};
