import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameCanvas } from './components/GameCanvas';
import { LobbyView } from './components/LobbyView';
import { SkinShopModal } from './components/SkinShopModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { ExportModal } from './components/ExportModal';
import { HudCustomizerModal } from './components/HudCustomizerModal';
import { CrateOpeningModal } from './components/CrateOpeningModal';
import { SettingsModal } from './components/SettingsModal';
import { getSettings, saveSettings, GameSettings } from './utils/settings';
import { loadHudLayout, saveHudLayout } from './utils/hudLayout';
import { PlayerProfile, SkinDef, DeathEffectDef, DeathEffectType, HudLayoutConfig } from './types';
import { SKINS } from './utils/skins';
import { normalizeDeathEffectId } from './utils/deathEffects';
import { startLobbyMusic, stopLobbyMusic, playRetroGameOverSound } from './utils/audio';
import { Smartphone } from 'lucide-react';

const STORAGE_KEY = 'snake2_armed_profile_v2';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Viper²',
  coins: 1000, // Starter cash allows immediate crate rolling test!
  highScore: 0,
  maxKills: 0,
  selectedSkinId: 'angel-seraph',
  unlockedSkinIds: ['angel-seraph', 'devil-infernal', 'blackhole-void', 'robot-titan', 'cyber-viper'],
  selectedDeathEffectId: 'retro-pixel-kaboom',
  unlockedDeathEffectIds: ['retro-pixel-kaboom'],
};

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('snake2_armed_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const starterSkins = ['angel-seraph', 'devil-infernal', 'blackhole-void', 'robot-titan', 'cyber-viper'];
        const existingUnlocked = Array.isArray(parsed.unlockedSkinIds) ? parsed.unlockedSkinIds : ['cyber-viper'];
        const mergedSkins = Array.from(new Set([...starterSkins, ...existingUnlocked]));

        // Normalize death effects for backwards compatibility
        const normSelected = normalizeDeathEffectId(parsed.selectedDeathEffectId);
        const normUnlocked = Array.from(
          new Set([
            'retro-pixel-kaboom' as DeathEffectType,
            ...(Array.isArray(parsed.unlockedDeathEffectIds)
              ? parsed.unlockedDeathEffectIds.map((id: string) => normalizeDeathEffectId(id))
              : []),
          ])
        );

        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          unlockedSkinIds: mergedSkins,
          selectedDeathEffectId: normSelected,
          unlockedDeathEffectIds: normUnlocked,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  const [screen, setScreen] = useState<'lobby' | 'playing'>('lobby');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<'skins' | 'death-effects'>('skins');
  const [isCrateOpen, setIsCrateOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHudCustomizerOpen, setIsHudCustomizerOpen] = useState(false);
  const [hudLayout, setHudLayout] = useState<HudLayoutConfig>(loadHudLayout);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(getSettings);
  const [isLandscape, setIsLandscape] = useState(true);
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    kills: number;
    coins: number;
    length: number;
    isHighScore: boolean;
  } | null>(null);

  const handleUpdateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const handleUpdatePlayerName = useCallback((newName: string) => {
    setProfile((prev) => ({ ...prev, name: newName }));
  }, []);

  const handleClaimMissionReward = useCallback((cash: number) => {
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + cash,
    }));
  }, []);

  // Save profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Check aspect ratio for landscape hint
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth >= window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const engine = useMemo(() => new GameEngine(), []);

  // Real-time Cash Collection & Player Death Listeners
  useEffect(() => {
    // Whenever player collects cash coins or gets a kill bounty in-game
    engine.onCashEarned = (amount) => {
      setProfile((prev) => ({
        ...prev,
        coins: prev.coins + amount,
      }));
    };

    engine.onPlayerDeath = (stats) => {
      const isHighScore = stats.score > profile.highScore;

      playRetroGameOverSound();

      setProfile((prev) => ({
        ...prev,
        coins: prev.coins + stats.coins,
        highScore: Math.max(prev.highScore, stats.score),
        maxKills: Math.max(prev.maxKills, stats.kills),
      }));

      setGameOverData({
        score: stats.score,
        kills: stats.kills,
        coins: stats.coins,
        length: stats.length,
        isHighScore,
      });
    };
  }, [engine, profile.highScore]);

  const updateProfile = useCallback((partial: Partial<PlayerProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleStartGame = useCallback(() => {
    stopLobbyMusic(0.3);
    setGameOverData(null);
    engine.start(
      profile.name,
      profile.selectedSkinId,
      profile.selectedDeathEffectId || 'cyber-matrix'
    );
    setScreen('playing');
  }, [engine, profile.name, profile.selectedSkinId, profile.selectedDeathEffectId]);

  const handlePlayAgain = useCallback(() => {
    stopLobbyMusic(0.3);
    handleStartGame();
  }, [handleStartGame]);

  const handleReturnLobby = useCallback(() => {
    engine.stop();
    setGameOverData(null);
    setScreen('lobby');
    startLobbyMusic();
  }, [engine]);

  const handleOpenShop = useCallback((tab: 'skins' | 'death-effects' = 'skins') => {
    setShopTab(tab);
    setIsShopOpen(true);
  }, []);

  const handleSelectSkin = useCallback(
    (skinId: string) => {
      updateProfile({ selectedSkinId: skinId });
    },
    [updateProfile]
  );

  const handleBuySkin = useCallback(
    (skin: SkinDef) => {
      if (profile.coins >= skin.price && !profile.unlockedSkinIds.includes(skin.id)) {
        updateProfile({
          coins: profile.coins - skin.price,
          unlockedSkinIds: [...profile.unlockedSkinIds, skin.id],
          selectedSkinId: skin.id,
        });
      }
    },
    [profile.coins, profile.unlockedSkinIds, updateProfile]
  );

  const handleSelectDeathEffect = useCallback(
    (effectId: DeathEffectType) => {
      updateProfile({ selectedDeathEffectId: effectId });
    },
    [updateProfile]
  );

  const handleBuyDeathEffect = useCallback(
    (effect: DeathEffectDef) => {
      const unlocked = profile.unlockedDeathEffectIds || ['cyber-matrix'];
      if (profile.coins >= effect.price && !unlocked.includes(effect.id)) {
        updateProfile({
          coins: profile.coins - effect.price,
          unlockedDeathEffectIds: [...unlocked, effect.id],
          selectedDeathEffectId: effect.id,
        });
      }
    },
    [profile.coins, profile.unlockedDeathEffectIds, updateProfile]
  );

  const handleDeductCoins = useCallback(
    (amount: number): boolean => {
      if (profile.coins < amount) return false;
      updateProfile({ coins: profile.coins - amount });
      return true;
    },
    [profile.coins, updateProfile]
  );

  const handleUnlockSkinFromCrate = useCallback(
    (skinId: string, cashbackCoins?: number) => {
      if (cashbackCoins) {
        updateProfile({ coins: profile.coins + cashbackCoins });
      } else {
        const nextUnlocked = profile.unlockedSkinIds.includes(skinId)
          ? profile.unlockedSkinIds
          : [...profile.unlockedSkinIds, skinId];
        updateProfile({ unlockedSkinIds: nextUnlocked });
      }
    },
    [profile.coins, profile.unlockedSkinIds, updateProfile]
  );

  return (
    <div
      id="app-root"
      className="fixed inset-0 w-full h-full h-[100dvh] w-[100dvw] overflow-hidden bg-slate-950 font-cyber text-white select-none"
    >
      {/* Main Screens */}
      {screen === 'lobby' && (
        <LobbyView
          profile={profile}
          onUpdateProfile={updateProfile}
          onStartGame={handleStartGame}
          onOpenShop={handleOpenShop}
          onOpenCrate={() => setIsCrateOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenHudCustomizer={() => setIsHudCustomizerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {screen === 'playing' && (
        <GameCanvas
          engine={engine}
          onExitToLobby={handleReturnLobby}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
        />
      )}

      {/* Armory & Death Effects Shop Modal */}
      <SkinShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={profile.coins}
        selectedSkinId={profile.selectedSkinId}
        unlockedSkinIds={profile.unlockedSkinIds}
        selectedDeathEffectId={profile.selectedDeathEffectId || 'cyber-matrix'}
        unlockedDeathEffectIds={profile.unlockedDeathEffectIds || ['cyber-matrix']}
        onSelectSkin={handleSelectSkin}
        onBuySkin={handleBuySkin}
        onSelectDeathEffect={handleSelectDeathEffect}
        onBuyDeathEffect={handleBuyDeathEffect}
        onOpenCrate={() => {
          setIsShopOpen(false);
          setIsCrateOpen(true);
        }}
        initialTab={shopTab}
      />

      {/* Cyber Supply Crate Opening Roulette Modal */}
      <CrateOpeningModal
        isOpen={isCrateOpen}
        onClose={() => setIsCrateOpen(false)}
        coins={profile.coins}
        unlockedSkinIds={profile.unlockedSkinIds}
        selectedSkinId={profile.selectedSkinId}
        onUnlockSkin={handleUnlockSkinFromCrate}
        onEquipSkin={handleSelectSkin}
        onDeductCoins={handleDeductCoins}
      />

      {/* Daily Missions Modal */}
      <DailyMissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        onClaimReward={handleClaimMissionReward}
      />

      {/* Global Leaderboards Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentPlayerName={profile.name}
      />

      {/* HUD Layout & Controls Customizer Modal */}
      {isHudCustomizerOpen && (
        <HudCustomizerModal
          layout={hudLayout}
          onSave={(newLayout) => {
            setHudLayout(newLayout);
            saveHudLayout(newLayout);
          }}
          onClose={() => setIsHudCustomizerOpen(false)}
        />
      )}

      {/* Download & Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        profile={profile}
      />

      {/* Settings Modal (FPS, Audio Levels, Pilot Name, Mechanics) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        playerName={profile.name}
        onUpdatePlayerName={handleUpdatePlayerName}
      />

      {/* Game Over Modal */}
      {gameOverData && (
        <GameOverModal
          isOpen={!!gameOverData}
          score={gameOverData.score}
          kills={gameOverData.kills}
          length={gameOverData.length}
          coinsEarned={gameOverData.coins}
          isHighScore={gameOverData.isHighScore}
          onPlayAgain={handlePlayAgain}
          onReturnLobby={handleReturnLobby}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}
    </div>
  );
}
