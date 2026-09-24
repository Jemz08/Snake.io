import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameRenderer } from '../game/GameRenderer';
import { GameHud } from './GameHud';
import { Snake, LootItem, KillNotification, WeaponType, MapObstacle, ShieldPowerup } from '../types';
import { recordRenderFrame } from '../utils/fpsDetector';

interface GameCanvasProps {
  engine: GameEngine;
  onExitToLobby: () => void;
  onOpenLeaderboard?: () => void;
  onOpenMissions?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  onExitToLobby,
  onOpenLeaderboard,
  onOpenMissions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // HUD States
  const [playerSnake, setPlayerSnake] = React.useState<Snake | null>(engine.playerSnake);
  const [allSnakes, setAllSnakes] = React.useState<Snake[]>(engine.snakes);
  const [loots, setLoots] = React.useState<LootItem[]>(engine.loots);
  const [shields, setShields] = React.useState<ShieldPowerup[]>(engine.shields);
  const [leaderboard, setLeaderboard] = React.useState(engine.getLeaderboard());
  const [killFeed, setKillFeed] = React.useState<KillNotification[]>([]);
  const [currentWave, setCurrentWave] = React.useState(engine.currentWave);
  const [waveAnnouncement, setWaveAnnouncement] = React.useState<string | null>(engine.waveAnnouncement);
  const [pelletRushTimer, setPelletRushTimer] = React.useState(engine.pelletRushTimer);
  const [waveEnemiesRemaining, setWaveEnemiesRemaining] = React.useState(engine.waveEnemiesRemaining);

  // Main Render & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let lastHudUpdate = 0;
    const renderer = new GameRenderer(ctx);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const loop = (currentTime: number) => {
      // Record frame timestamp for hardware-accurate FPS detection (supports 120Hz/144Hz)
      recordRenderFrame(currentTime);

      // Delta time calculation with safety clamp to prevent physics jumps or frame skips
      const dt = lastTime > 0 ? (currentTime - lastTime) / 1000 : 0.016;
      lastTime = currentTime;
      const safeDt = Math.min(dt, 0.04);

      // 1. Update Game Simulation
      engine.update(safeDt);

      // 2. Render Frame
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const player = engine.playerSnake;

      // Camera coordinates (centered on player or world center if dead)
      const cameraX = player && !player.isDead ? player.x : engine.worldSize / 2;
      const cameraY = player && !player.isDead ? player.y : engine.worldSize / 2;

      // Mobile portrait auto-fit: slightly zoom out camera so horizontal vision is not compromised
      const isPortrait = width < height;
      const cameraZoom = isPortrait ? 0.86 : 1.0;

      // Update renderer viewport for ultra-fast frustum culling (vital for 120Hz/144Hz!)
      renderer.setViewport(cameraX, cameraY, width / cameraZoom, height / cameraZoom);

      renderer.clear(canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);
      // Translate camera to center on player with auto-fit zoom
      ctx.translate(width / 2, height / 2);
      ctx.scale(cameraZoom, cameraZoom);
      ctx.translate(-cameraX, -cameraY);

      // Draw Grid & Perimeter
      renderer.drawGrid(cameraX, cameraY, width, height, engine.worldSize);

      // Draw Elemental Hazard Trails (Phoenix fire, Frost ice, Venom toxic)
      renderer.drawTrailHazards(engine.trailHazards);

      // Draw Foods & Dead Snake Drops
      renderer.drawFood(engine.foods);

      // Draw Tactical Defensive Obstacles (Bulletproof Bunkers & Barricades)
      renderer.drawObstacles(engine.obstacles);

      // Draw Shield Defense Powerups
      renderer.drawShields(engine.shields);

      // Draw Weapon Loot Pods
      renderer.drawLoot(engine.loots);

      // Draw Projectiles
      renderer.drawProjectiles(engine.projectiles);

      // Draw Explosions Shockwaves
      renderer.drawExplosions(engine.explosions);

      // Draw Particles
      renderer.drawParticles(engine.particles);

      // Draw All Snakes²
      for (const snake of engine.snakes) {
        renderer.drawSnake(snake);
      }

      // Draw Damage Popups
      renderer.drawDamagePopups(engine.damagePopups);

      ctx.restore();

      // 3. Time-based HUD synchronization (throttled to ~11Hz)
      // This eliminates React render thrashing & GC pauses on 120Hz/144Hz displays!
      if (currentTime - lastHudUpdate > 90) {
        lastHudUpdate = currentTime;
        setPlayerSnake(engine.playerSnake ? { ...engine.playerSnake } : null);
        setAllSnakes([...engine.snakes]);
        setLoots([...engine.loots]);
        setShields([...engine.shields]);
        setLeaderboard(engine.getLeaderboard());
        setKillFeed([...engine.killFeed]);
        setCurrentWave(engine.currentWave);
        setWaveAnnouncement(engine.waveAnnouncement);
        setPelletRushTimer(engine.pelletRushTimer);
        setWaveEnemiesRemaining(engine.waveEnemiesRemaining);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      resizeObserver.disconnect();
    };
  }, [engine]);

  // Desktop Mouse Steering Fallback
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current || !engine.playerSnake || engine.playerSnake.isDead) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      if (Math.hypot(dx, dy) > 20) {
        engine.setPlayerSteering(Math.atan2(dy, dx));
      }
    },
    [engine]
  );

  const handleFire = useCallback(() => {
    if (engine.playerSnake) {
      engine.fireWeapon(engine.playerSnake);
    }
  }, [engine]);

  const handleAim = useCallback(
    (angle: number, isAiming: boolean) => {
      engine.setPlayerAim(angle, isAiming);
    },
    [engine]
  );

  const handleSteer = useCallback(
    (angle: number) => {
      engine.setPlayerSteering(angle);
    },
    [engine]
  );

  const handleBoostStart = useCallback(() => {
    engine.setPlayerBoosting(true);
  }, [engine]);

  const handleBoostEnd = useCallback(() => {
    engine.setPlayerBoosting(false);
  }, [engine]);

  const handleAbility = useCallback(() => {
    engine.triggerPlayerAbility();
  }, [engine]);

  // Keyboard shortcut listener for space (boost) / E or F (ability)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F') {
        engine.triggerPlayerAbility();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  return (
    <div
      id="game-canvas-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none touch-none"
    >
      <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />

      {/* Overlay HUD with Virtual Joystick, Ability Button, and Dedicated Fire Controls */}
      <GameHud
        player={playerSnake}
        snakes={allSnakes}
        loots={loots}
        obstacles={engine.obstacles}
        shields={shields}
        worldSize={engine.worldSize}
        leaderboard={leaderboard}
        killFeed={killFeed}
        gameMode={engine.gameMode}
        wave={currentWave}
        waveAnnouncement={waveAnnouncement}
        pelletRushTimer={pelletRushTimer}
        enemiesRemaining={waveEnemiesRemaining}
        onTriggerEmote={(emoteId) => engine.triggerEmote('player', emoteId)}
        onSteer={handleSteer}
        onAim={handleAim}
        onFire={handleFire}
        onAbility={handleAbility}
        onBoostStart={handleBoostStart}
        onBoostEnd={handleBoostEnd}
        onExitToLobby={onExitToLobby}
        onOpenLeaderboard={onOpenLeaderboard}
        onOpenMissions={onOpenMissions}
      />
    </div>
  );
};
