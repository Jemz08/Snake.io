import React, { useRef, useEffect, useState } from 'react';
import { Snake, LootItem, MapObstacle, ShieldPowerup } from '../types';
import { WEAPONS } from '../utils/weapons';
import { Maximize2, Minimize2, Radio, Shield } from 'lucide-react';

interface MinimapProps {
  worldSize: number;
  player: Snake | null;
  snakes: Snake[];
  loots: LootItem[];
  obstacles?: MapObstacle[];
  shields?: ShieldPowerup[];
}

export const Minimap: React.FC<MinimapProps> = ({
  worldSize,
  player,
  snakes,
  loots,
  obstacles = [],
  shields = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const sweepAngleRef = useRef(0);

  const mapSize = isExpanded ? 180 : 108;

  useEffect(() => {
    let animId: number;

    const render = () => {
      sweepAngleRef.current = (sweepAngleRef.current + 0.035) % (Math.PI * 2);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = mapSize;
      const scale = size / worldSize;
      const center = size / 2;

      // Dark tactical radar background
      ctx.fillStyle = 'rgba(7, 12, 22, 0.88)';
      ctx.fillRect(0, 0, size, size);

      // Radar Concentric Circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 0.95].forEach((pct) => {
        ctx.beginPath();
        ctx.arc(center, center, (size / 2) * pct, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshair Axes
      ctx.beginPath();
      ctx.moveTo(center, 4);
      ctx.lineTo(center, size - 4);
      ctx.moveTo(4, center);
      ctx.lineTo(size - 4, center);
      ctx.stroke();

      // Rotating Radar Sweep Beam
      const sweepAngle = sweepAngleRef.current;
      const sweepGradient = ctx.createConicGradient(sweepAngle, center, center);
      sweepGradient.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
      sweepGradient.addColorStop(0.12, 'rgba(6, 182, 212, 0.05)');
      sweepGradient.addColorStop(0.2, 'rgba(6, 182, 212, 0)');
      sweepGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(center, center, (size / 2) * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Draw Defensive Map Obstacles (Bunkers & Barricades)
      for (const obs of obstacles) {
        const ox = obs.x * scale;
        const oy = obs.y * scale;

        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.strokeStyle = obs.borderColor || '#0ea5e9';
        ctx.lineWidth = 1;

        if (obs.shape === 'circle' && obs.radius) {
          const r = Math.max(2, obs.radius * scale);
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (obs.shape === 'rect' && obs.width && obs.height) {
          const w = Math.max(3, obs.width * scale);
          const h = Math.max(3, obs.height * scale);
          ctx.save();
          ctx.translate(ox, oy);
          if (obs.rotation) ctx.rotate(obs.rotation);
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeRect(-w / 2, -h / 2, w, h);
          ctx.restore();
        }
      }

      // Draw Shield Powerups
      for (const s of shields) {
        const sx = s.x * scale;
        const sy = s.y * scale;

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Draw Loot Weapon Crates
      for (const loot of loots) {
        const lx = loot.x * scale;
        const ly = loot.y * scale;
        const cfg = WEAPONS[loot.type];
        const color = cfg ? cfg.color : '#f59e0b';

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillRect(lx - 2, ly - 2, 4, 4);
      }
      ctx.shadowBlur = 0;

      // Draw Other Snakes
      for (const s of snakes) {
        if (s.isDead || s.isPlayer) continue;
        const sx = s.x * scale;
        const sy = s.y * scale;
        const isArmed = !!s.weapon;

        // Draw faint trail of segments
        if (isExpanded && s.segments.length > 5) {
          ctx.strokeStyle = isArmed ? 'rgba(244, 63, 94, 0.35)' : 'rgba(251, 146, 60, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          const step = Math.max(2, Math.floor(s.segments.length / 6));
          for (let i = step; i < s.segments.length; i += step) {
            ctx.lineTo(s.segments[i].x * scale, s.segments[i].y * scale);
          }
          ctx.stroke();
        }

        // Snake Head Blip
        const blipRadius = isArmed ? 3.5 : 2.5;
        ctx.fillStyle = isArmed ? '#f43f5e' : '#fb923c';
        ctx.shadowColor = isArmed ? '#f43f5e' : '#fb923c';
        ctx.shadowBlur = isArmed ? 8 : 4;

        ctx.beginPath();
        if (isArmed) {
          // Diamond for armed enemy
          ctx.moveTo(sx, sy - blipRadius);
          ctx.lineTo(sx + blipRadius, sy);
          ctx.lineTo(sx, sy + blipRadius);
          ctx.lineTo(sx - blipRadius, sy);
          ctx.closePath();
        } else {
          ctx.arc(sx, sy, blipRadius, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Draw Player Snake
      if (player && !player.isDead) {
        const px = player.x * scale;
        const py = player.y * scale;

        // Draw Player Tail trail
        if (player.segments.length > 2) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          const step = Math.max(1, Math.floor(player.segments.length / 8));
          for (let i = step; i < player.segments.length; i += step) {
            ctx.lineTo(player.segments[i].x * scale, player.segments[i].y * scale);
          }
          ctx.stroke();
        }

        // Directional Heading Arrow / Chevron
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(player.angle);

        // Pulsing radar ping ring
        const pingRadius = 6 + Math.sin(Date.now() / 200) * 2;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, pingRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Player directional arrow
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(5.5, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Border frame
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, size, size);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [worldSize, player, snakes, loots, obstacles, shields, mapSize, isExpanded]);

  const activeEnemies = snakes.filter((s) => !s.isDead && !s.isPlayer).length;

  return (
    <div
      id="tactical-minimap"
      className="relative rounded-xl overflow-hidden border border-cyan-500/50 shadow-2xl backdrop-blur-md bg-slate-950/80 transition-all duration-300 pointer-events-auto"
      style={{ width: mapSize, height: mapSize }}
    >
      <canvas ref={canvasRef} width={mapSize} height={mapSize} className="block w-full h-full" />

      {/* Top Header Bar */}
      <div className="absolute top-1 left-2 right-1.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1 font-cyber text-[9px] font-black text-cyan-400 tracking-wider">
          <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-300" />
          <span>RADAR</span>
          <span className="text-[8px] text-slate-400 font-mono">({activeEnemies})</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="pointer-events-auto text-cyan-400 hover:text-white p-0.5 rounded bg-slate-900/60 border border-cyan-500/30 transition-colors"
          title={isExpanded ? 'Minimize Radar' : 'Expand Radar'}
        >
          {isExpanded ? <Minimize2 className="w-2.5 h-2.5" /> : <Maximize2 className="w-2.5 h-2.5" />}
        </button>
      </div>

      {/* Bottom Coordinates Readout */}
      {player && (
        <div className="absolute bottom-1 left-2 font-mono text-[8px] text-cyan-300/80 pointer-events-none">
          {Math.round(player.x)},{Math.round(player.y)}
        </div>
      )}

      {/* Legend Dots in Expanded Mode */}
      {isExpanded && (
        <div className="absolute bottom-1 right-2 flex items-center gap-1.5 text-[8px] font-cyber text-slate-300 pointer-events-none bg-slate-900/80 px-1 py-0.5 rounded border border-slate-700/50">
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" /> You
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Armed
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" /> Shield
          </span>
        </div>
      )}
    </div>
  );
};
