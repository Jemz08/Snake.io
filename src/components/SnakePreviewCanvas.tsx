import React, { useRef, useEffect } from 'react';
import { SkinDef } from '../types';
import { GameRenderer } from '../game/GameRenderer';
import { Snake } from '../types';

interface SnakePreviewCanvasProps {
  skin: SkinDef;
  weaponType?: 'grenade' | 'pistol' | 'ar' | 'sniper' | null;
  width?: number;
  height?: number;
}

export const SnakePreviewCanvas: React.FC<SnakePreviewCanvasProps> = ({
  skin,
  weaponType = 'ar',
  width = 280,
  height = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const renderer = new GameRenderer(ctx);
    renderer.setViewport(width / 2, height / 2, width + 300, height + 300);

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, width, height);

      // Cyber backdrop grid
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const step = 25;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Generate slithering snake segments
      const segmentCount = 14;
      const segments = [];
      const centerX = width * 0.55;
      const centerY = height * 0.5;

      for (let i = 0; i < segmentCount; i++) {
        const offset = i * 14;
        const wave = Math.sin(time * 2 - i * 0.45) * 18;
        const x = centerX - offset;
        const y = centerY + wave;
        const angle = i === 0 ? Math.cos(time * 2) * 0.35 : Math.atan2(wave, 14);
        segments.push({ x, y, angle });
      }

      const mockSnake: Snake = {
        id: 'preview',
        name: skin.name,
        isPlayer: true,
        skinId: skin.id,
        archetype: skin.archetype,
        x: segments[0].x,
        y: segments[0].y,
        angle: segments[0].angle,
        targetAngle: segments[0].angle,
        speed: 3,
        baseSpeed: 3,
        boostSpeed: 6,
        length: segmentCount,
        targetLength: segmentCount,
        score: 1200,
        kills: 3,
        hp: 100,
        maxHp: 100,
        isDead: false,
        segments,
        weapon: weaponType,
        ammo: 15,
        lastFireTime: 0,
        isBoosting: false,
        color: skin.primaryColor,
        accentColor: skin.accentColor,
      };

      renderer.drawSnake(mockSnake);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [skin, weaponType, width, height]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-inner max-w-full w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block max-w-full h-auto"
        style={{ aspectRatio: `${width}/${height}`, maxHeight: `${height}px` }}
      />
      <div className="absolute bottom-2 right-2.5 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-cyber font-bold text-cyan-400 border border-cyan-500/30 backdrop-blur-sm pointer-events-none">
        PREVIEW
      </div>
    </div>
  );
};
