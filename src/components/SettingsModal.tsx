import React, { useState, useEffect } from 'react';
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
  Music,
  Radio,
  Image as ImageIcon,
  RotateCw,
  Layers,
} from 'lucide-react';
import { GameSettings, TargetFpsOption, saveGameSettings } from '../utils/settings';
import {
  playTestSound,
  startLobbyMusic,
  stopLobbyMusic,
  isLobbyMusicPlaying,
  playRetroCoinSound,
  playRetroLaserSound,
  playRetroPowerupSound,
  playRetroVictoryFanfare,
  playRetroButtonClick,
} from '../utils/audio';
import { FpsInfo, useFpsDetector } from '../utils/fpsDetector';
import { SNAKE_AVATARS, SnakeAvatarDef, getSnakeAvatarById } from '../utils/snakeAvatars';
import { SnakeAvatar } from './SnakeAvatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  playerName: string;
  onUpdatePlayerName: (newName: string) => void;
  selectedAvatarId?: string;
  onUpdateAvatarId?: (newAvatarId: string) => void;
  selectedSkinId?: string;
  initialTab?: 'performance' | 'audio' | 'profile' | 'mechanics';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  playerName,
  onUpdatePlayerName,
  selectedAvatarId = 'angel',
  onUpdateAvatarId,
  selectedSkinId,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'audio' | 'profile' | 'mechanics'>(
    initialTab || 'performance'
  );
  const [localName, setLocalName] = useState(playerName);
  const [nameSaved, setNameSaved] = useState(false);
  const [currentAvatarId, setCurrentAvatarId] = useState<string>(selectedAvatarId);
  const [avatarCategory, setAvatarCategory] = useState<'all' | 'celestial' | 'elemental' | 'tech' | 'shadow'>('all');
  const [avatarView, setAvatarView] = useState<'portrait' | 'card'>('portrait');
  const [avatarSavedFeedback, setAvatarSavedFeedback] = useState<string | null>(null);
  const fpsInfo = useFpsDetector();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    setCurrentAvatarId(selectedAvatarId);
  }, [selectedAvatarId]);

  useEffect(() => {
    setLocalName(playerName);
  }, [playerName]);

  if (!isOpen) return null;

  const handleSelectAvatar = (avatar: SnakeAvatarDef) => {
    playRetroButtonClick();
    setCurrentAvatarId(avatar.id);
    if (onUpdateAvatarId) {
      onUpdateAvatarId(avatar.id);
    }
    setAvatarSavedFeedback(avatar.name);
    setTimeout(() => {
      setAvatarSavedFeedback(null);
    }, 2500);
  };

  const handleSyncWithEquippedSkin = () => {
    if (!selectedSkinId) return;
    const matched = getSnakeAvatarById(selectedSkinId);
    handleSelectAvatar(matched);
  };

  const filteredAvatars = SNAKE_AVATARS.filter((av) => {
    if (avatarCategory === 'all') return true;
    return av.category === avatarCategory;
  });

  const activeAvatarDef = getSnakeAvatarById(currentAvatarId);

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

          {/* TAB 2: SOUND LEVELS & MUSIC */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              {/* Mute Toggle */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${settings.soundMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {settings.soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">Mute All Audio</span>
                    <span className="text-xs text-slate-400">Silences weapons, explosions, music, and crate roulette</span>
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
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
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

              {/* LOBBY MUSIC SECTION */}
              <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-cyan-300 block">Lobby Chiptune Music</span>
                      <span className="text-[11px] text-slate-400">Retro 8-bit / 16-bit cyber arcade lobby soundtrack</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newMuted = !settings.musicMuted;
                      onUpdateSettings({ musicMuted: newMuted });
                      if (newMuted) {
                        stopLobbyMusic(0.2);
                      } else {
                        startLobbyMusic();
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      !settings.musicMuted ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                        !settings.musicMuted ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Music Volume */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-slate-400 uppercase text-[11px]">MUSIC VOLUME</span>
                    <span className="text-cyan-400 font-mono text-xs">{settings.musicVolume ?? 70}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume ?? 70}
                    onChange={(e) => onUpdateSettings({ musicVolume: Number(e.target.value) })}
                    className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    disabled={settings.soundMuted || settings.musicMuted}
                  />
                </div>

                {/* Music Action button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Plays automatically in the war room</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isLobbyMusicPlaying()) {
                        stopLobbyMusic(0.2);
                      } else {
                        startLobbyMusic();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Music className="w-3.5 h-3.5" />
                    {isLobbyMusicPlaying() ? 'PAUSE BGM' : 'PLAY BGM'}
                  </button>
                </div>
              </div>

              {/* SFX & WEAPONS VOLUME */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
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

              {/* RETRO 8-BIT SOUND EFFECTS MODE */}
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-amber-300 block flex items-center gap-1.5">
                      <span>👾 Retro Game Sound Effects</span>
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Authentic Pixabay/arcade-style 8-bit audio: dual-chime coins, laser blaster, powerups, roulette ticks
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ retroSfxMode: !settings.retroSfxMode })}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-3 ${
                      settings.retroSfxMode ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                        settings.retroSfxMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Test Sound Effect Samples */}
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Test Retro Sound Effects</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={playRetroCoinSound}
                      className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      🪙 Coin Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => playRetroLaserSound('ar')}
                      className="px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      ⚡ 8-Bit Laser
                    </button>
                    <button
                      type="button"
                      onClick={playRetroPowerupSound}
                      className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      🌟 Powerup Arp
                    </button>
                    <button
                      type="button"
                      onClick={playRetroVictoryFanfare}
                      className="px-2 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      🏆 Victory Fanfare
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PILOT IDENTITY & CYBER SNAKE PROFILE PICS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Active Pilot Profile Showcase Card */}
              <div
                className="bg-slate-950/90 border-2 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl"
                style={{
                  borderColor: `${activeAvatarDef.borderColor}80`,
                  boxShadow: `0 0 25px ${activeAvatarDef.glowColor}25`,
                }}
              >
                {/* Subtle cyber background grid */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(${activeAvatarDef.borderColor} 1px, transparent 1px), linear-gradient(to right, ${activeAvatarDef.borderColor} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }}
                />

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                  {/* Active Snake Avatar Profile Pic */}
                  <div className="relative group shrink-0">
                    <SnakeAvatar
                      avatarId={currentAvatarId}
                      size="xl"
                      showGlow
                      showBadge
                      rounded="2xl"
                      className="border-2 shadow-2xl transition-transform duration-200 group-hover:scale-105"
                    />
                    <div
                      className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full text-[9px] font-cyber font-black tracking-wider uppercase border shadow-md flex items-center gap-1"
                      style={{
                        backgroundColor: '#090d16',
                        borderColor: activeAvatarDef.borderColor,
                        color: activeAvatarDef.themeColor,
                      }}
                    >
                      <Check className="w-2.5 h-2.5" /> ACTIVE PFP
                    </div>
                  </div>

                  {/* Callsign & Profile Info */}
                  <div className="flex-1 min-w-0 w-full space-y-2.5 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-cyber uppercase tracking-widest text-slate-400 block font-bold">
                          PILOT PROFILE PICTURE
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-1.5 truncate">
                          <span>{activeAvatarDef.name}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded border font-mono font-bold"
                            style={{
                              borderColor: `${activeAvatarDef.borderColor}60`,
                              backgroundColor: `${activeAvatarDef.borderColor}20`,
                              color: activeAvatarDef.themeColor,
                            }}
                          >
                            {activeAvatarDef.archetypeLabel}
                          </span>
                        </h3>
                      </div>

                      {/* Quick Sync Button */}
                      {selectedSkinId && (
                        <button
                          type="button"
                          onClick={handleSyncWithEquippedSkin}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] font-cyber font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                          title="Set profile pic to match currently equipped in-game snake"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                          <span>SYNC WITH SNAKE</span>
                        </button>
                      )}
                    </div>

                    {/* Change Callsign Form */}
                    <form onSubmit={handleNameSubmit} className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <input
                          type="text"
                          value={localName}
                          onChange={(e) => setLocalName(e.target.value.slice(0, 16))}
                          placeholder="Enter pilot callsign..."
                          className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 font-cyber text-sm font-bold text-white outline-none transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
                      >
                        {nameSaved ? <Check className="w-3.5 h-3.5 text-slate-950" /> : null}
                        {nameSaved ? 'SAVED' : 'SAVE CALLSIGN'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Feedback toast when avatar is equipped */}
              {avatarSavedFeedback && (
                <div className="bg-cyan-500/20 border border-cyan-400/60 rounded-xl px-3.5 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-cyber font-bold text-cyan-200">
                      EQUIPPED <strong>{avatarSavedFeedback}</strong> AS YOUR PROFILE PICTURE!
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">SAVED INSTANTLY</span>
                </div>
              )}

              {/* CYBER SNAKE PROFILE PICTURES SELECTOR */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
                {/* Section Header & View Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-cyber font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span>SELECT SNAKE PROFILE PICTURE</span>
                        <span className="text-cyan-400 font-mono text-xs">({filteredAvatars.length}/15)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Choose any cyber snake as your in-game battle avatar & callsign portrait
                      </p>
                    </div>
                  </div>

                  {/* View Mode Toggle: Portrait Avatars vs Full Cards */}
                  <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setAvatarView('portrait')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-cyber font-bold flex items-center gap-1 transition-all ${
                        avatarView === 'portrait'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>PORTRAITS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarView('card')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-cyber font-bold flex items-center gap-1 transition-all ${
                        avatarView === 'card'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>FULL CARDS</span>
                    </button>
                  </div>
                </div>

                {/* Filter Categories (Zero-pill discipline, segmented button bar) */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {(
                    [
                      { id: 'all', label: 'ALL SNAKES (15)' },
                      { id: 'celestial', label: 'CELESTIAL & VOID' },
                      { id: 'elemental', label: 'FIRE & ICE' },
                      { id: 'tech', label: 'CYBER TECH' },
                      { id: 'shadow', label: 'SHADOW & BIO' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAvatarCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-cyber font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                        avatarCategory === cat.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Grid of Avatars: PORTRAIT MODE */}
                {avatarView === 'portrait' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {filteredAvatars.map((av) => {
                      const isEquipped = currentAvatarId === av.id;
                      return (
                        <div
                          key={av.id}
                          onClick={() => handleSelectAvatar(av)}
                          className={`group relative rounded-xl p-2.5 border-2 transition-all duration-200 cursor-pointer flex flex-col items-center text-center select-none ${
                            isEquipped
                              ? 'bg-slate-900 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.35)] scale-102'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                          }`}
                          style={{
                            borderColor: isEquipped ? av.borderColor : undefined,
                          }}
                        >
                          {/* Top Tag */}
                          <div className="w-full flex items-center justify-between text-[9px] font-cyber mb-1.5">
                            <span className="font-bold truncate" style={{ color: av.themeColor }}>
                              {av.archetypeLabel}
                            </span>
                            {isEquipped ? (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-[8px] font-black">
                                ACTIVE
                              </span>
                            ) : null}
                          </div>

                          {/* Snake Avatar Head */}
                          <div className="my-1">
                            <SnakeAvatar
                              avatarId={av.id}
                              size="lg"
                              showGlow={isEquipped}
                              showBadge
                              rounded="xl"
                              className="group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Snake Name & Elemental Title */}
                          <span className="font-cyber font-bold text-xs text-white block truncate w-full mt-1">
                            {av.name.replace('²', '')}
                          </span>
                          <span
                            className="font-cyber text-[9px] font-semibold block truncate w-full"
                            style={{ color: av.themeColor }}
                          >
                            {av.title}
                          </span>

                          {/* Action Button / Indicator */}
                          <div className="w-full mt-2 pt-1 border-t border-slate-800/80">
                            {isEquipped ? (
                              <span className="w-full py-0.5 rounded bg-cyan-500 text-slate-950 font-cyber font-black text-[10px] uppercase flex items-center justify-center gap-1 shadow-sm">
                                <Check className="w-3 h-3 text-slate-950" /> EQUIPPED
                              </span>
                            ) : (
                              <span className="w-full py-0.5 rounded bg-slate-800/80 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 font-cyber font-bold text-[10px] uppercase flex items-center justify-center transition-colors">
                                CHOOSE PFP
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Grid of Avatars: FULL CARD SHOWCASE (Matching reference image) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {filteredAvatars.map((av) => {
                      const isEquipped = currentAvatarId === av.id;
                      return (
                        <div
                          key={av.id}
                          onClick={() => handleSelectAvatar(av)}
                          className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
                            isEquipped ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-102' : ''
                          }`}
                        >
                          <SnakeAvatar
                            avatarId={av.id}
                            variant="card"
                            showGlow={isEquipped}
                            className="w-full"
                          />
                          {isEquipped && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-cyber font-black text-[9px] shadow-lg flex items-center gap-1 z-30">
                              <Check className="w-2.5 h-2.5" /> EQUIPPED
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

              {/* 4. CyberSnake Archetypes & Abilities */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <h3 className="text-sm font-black text-purple-400 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 4. 16 CYBER SNAKE ARCHETYPES
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Every cyber snake features unique active and passive abilities:
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
