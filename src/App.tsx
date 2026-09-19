import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameCanvas } from './components/GameCanvas';
import { LobbyView } from './components/LobbyView';
import { SkinShopModal } from './components/SkinShopModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { ExportModal } from './components/ExportModal';
import { PlayerProfile, SkinDef, DeathEffectDef, DeathEffectType } from './types';
import { SKINS } from './utils/skins';
import { Smartphone } from 'lucide-react';

const STORAGE_KEY = 'snake2_armed_profile_v2';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Viper²',
  coins: 100, // Starter cash
  highScore: 0,
  maxKills: 0,
  selectedSkinId: 'cyber-viper',
  unlockedSkinIds: ['cyber-viper'],
  selectedDeathEffectId: 'cyber-matrix',
  unlockedDeathEffectIds: ['cyber-matrix'],
};

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('snake2_armed_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          selectedDeathEffectId: parsed.selectedDeathEffectId || 'cyber-matrix',
          unlockedDeathEffectIds: parsed.unlockedDeathEffectIds || ['cyber-matrix'],
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
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    kills: number;
    coins: number;
    length: number;
    isHighScore: boolean;
  } | null>(null);

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
    setGameOverData(null);
    engine.start(
      profile.name,
      profile.selectedSkinId,
      profile.selectedDeathEffectId || 'cyber-matrix'
    );
    setScreen('playing');
  }, [engine, profile.name, profile.selectedSkinId, profile.selectedDeathEffectId]);

  const handlePlayAgain = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  const handleReturnLobby = useCallback(() => {
    engine.stop();
    setGameOverData(null);
    setScreen('lobby');
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

  return (
    <div
      id="app-root"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-cyber text-white select-none"
    >
      {/* Landscape Advisor Banner */}
      {!isLandscape && (
        <div
          id="landscape-advisor-banner"
          className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-cyan-950/90 border border-cyan-400/80 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-cyber text-cyan-300 backdrop-blur-md animate-pulse pointer-events-none"
        >
          <Smartphone className="w-4 h-4 rotate-90 text-cyan-400" />
          <span>Rotate to Landscape for optimal battle view</span>
        </div>
      )}

      {/* Main Screens */}
      {screen === 'lobby' && (
        <LobbyView
          profile={profile}
          onUpdateProfile={updateProfile}
          onStartGame={handleStartGame}
          onOpenShop={handleOpenShop}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
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
        initialTab={shopTab}
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

      {/* Download & Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        profile={profile}
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
