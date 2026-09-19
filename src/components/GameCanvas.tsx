import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameRenderer } from '../game/GameRenderer';
import { GameHud } from './GameHud';
import { Snake, LootItem, KillNotification, WeaponType } from '../types';

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
  const [leaderboard, setLeaderboard] = React.useState(engine.getLeaderboard());
  const [killFeed, setKillFeed] = React.useState<KillNotification[]>([]);

  // Main Render & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let hudTimer = 0;
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

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // 1. Update Game Simulation
      engine.update(dt);

      // 2. Render Frame
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const player = engine.playerSnake;

      // Camera coordinates (centered on player or world center if dead)
      const cameraX = player && !player.isDead ? player.x : engine.worldSize / 2;
      const cameraY = player && !player.isDead ? player.y : engine.worldSize / 2;

      renderer.clear(canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);
      // Translate camera to center on player
      ctx.translate(width / 2 - cameraX, height / 2 - cameraY);

      // Draw Grid & Perimeter
      renderer.drawGrid(cameraX, cameraY, width, height, engine.worldSize);

      // Draw Foods & Dead Snake Drops
      renderer.drawFood(engine.foods);

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

      // 3. Throttle HUD state sync every 4 frames for maximum 60FPS performance
      hudTimer++;
      if (hudTimer % 4 === 0) {
        setPlayerSnake(engine.playerSnake ? { ...engine.playerSnake } : null);
        setAllSnakes([...engine.snakes]);
        setLoots([...engine.loots]);
        setLeaderboard(engine.getLeaderboard());
        setKillFeed([...engine.killFeed]);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
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

  return (
    <div
      id="game-canvas-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none touch-none"
    >
      <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />

      {/* Overlay HUD with Virtual Joystick and Dedicated Fire Controls */}
      <GameHud
        player={playerSnake}
        snakes={allSnakes}
        loots={loots}
        worldSize={engine.worldSize}
        leaderboard={leaderboard}
        killFeed={killFeed}
        onSteer={handleSteer}
        onAim={handleAim}
        onFire={handleFire}
        onBoostStart={handleBoostStart}
        onBoostEnd={handleBoostEnd}
        onExitToLobby={onExitToLobby}
        onOpenLeaderboard={onOpenLeaderboard}
        onOpenMissions={onOpenMissions}
      />
    </div>
  );
};
