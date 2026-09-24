import React, { useRef, useEffect } from 'react';
import { DeathEffectDef } from '../types';
import { playDeathEffectSound } from '../utils/audio';

interface DeathEffectPreviewCanvasProps {
  effect: DeathEffectDef;
}

export const DeathEffectPreviewCanvas: React.FC<DeathEffectPreviewCanvasProps> = ({ effect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerRef = useRef<((withSound?: boolean) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
      maxLife: number;
      shape: string;
      text?: string;
      rotation?: number;
      vRot?: number;
    }> = [];

    let shockwaves: Array<{
      radius: number;
      maxRadius: number;
      color: string;
      life: number;
      maxLife: number;
      style?: string;
    }> = [];

    const triggerBlast = (withSound = false) => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (withSound) {
        playDeathEffectSound(effect.id);
      }

      shockwaves.push({
        radius: 10,
        maxRadius: 85,
        color: effect.primaryColor,
        life: 30,
        maxLife: 30,
        style: effect.style,
      });

      const count = Math.min(45, effect.particleCount);
      const comicWords = ['POW!', 'BOOM!', 'BAM!', 'CRASH!'];
      const glitchWords = ['0x00', 'ERR!', 'FATAL', 'NULL'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        const isBadge = effect.icon === 'comic' && i < 3;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: effect.icon === 'ghost' ? -Math.random() * 2 - 1 : Math.sin(angle) * speed,
          color: Math.random() > 0.4 ? effect.primaryColor : effect.secondaryColor,
          size: isBadge ? 12 : Math.random() * 6 + 3,
          life: Math.floor(Math.random() * 20 + 25),
          maxLife: 45,
          shape: isBadge ? 'comic' : effect.icon,
          text: effect.icon === 'comic' ? comicWords[i % comicWords.length] : effect.icon === 'glitch' ? glitchWords[i % glitchWords.length] : undefined,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    triggerRef.current = triggerBlast;
    triggerBlast(false);

    const interval = setInterval(() => triggerBlast(false), 2200);

    const render = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update & Draw Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        const progress = 1 - sw.life / sw.maxLife;
        const currentR = sw.radius + (sw.maxRadius - sw.radius) * progress;
        const alpha = sw.life / sw.maxLife;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 4 * alpha;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15;

        if (sw.style === 'retro-pixel-puff' || sw.style === 'retro-voxel-shatter') {
          ctx.strokeRect(-currentR * 0.6, -currentR * 0.6, currentR * 1.2, currentR * 1.2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, currentR, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();

        sw.life--;
        if (sw.life <= 0) shockwaves.splice(i, 1);
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;

        if (p.shape === 'ghost') {
          p.vy -= 0.03;
          p.vx += Math.sin(p.life * 0.25) * 0.05;
        } else if (p.shape === 'coin' || p.shape === 'voxel' || p.shape === 'slime') {
          p.vy += 0.04;
        }

        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot;
        }

        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.shape === 'coin') {
          // 8-bit coin
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (p.shape === 'ghost') {
          // Pacman style soul ghost
          const s = p.size;
          ctx.beginPath();
          ctx.arc(0, -s * 0.2, s * 0.7, Math.PI, 0);
          ctx.lineTo(s * 0.7, s * 0.6);
          ctx.lineTo(s * 0.35, s * 0.35);
          ctx.lineTo(0, s * 0.6);
          ctx.lineTo(-s * 0.35, s * 0.35);
          ctx.lineTo(-s * 0.7, s * 0.6);
          ctx.closePath();
          ctx.fill();
          // Eyes
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-s * 0.45, -s * 0.3, s * 0.3, s * 0.4);
          ctx.fillRect(s * 0.15, -s * 0.3, s * 0.3, s * 0.4);
        } else if (p.shape === 'comic') {
          // Comic badge
          const s = p.size;
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let k = 0; k < 12; k++) {
            const r = k % 2 === 0 ? s : s * 0.6;
            const a = (k * Math.PI) / 6;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.font = '900 8px Impact, Chakra Petch, sans-serif';
          ctx.fillStyle = '#dc2626';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text || 'POW!', 0, 0);
        } else if (p.shape === 'glitch') {
          const w = p.size * 2.5;
          const h = p.size * 0.8;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(-w / 2 + 2, -h / 2 + 1, w * 0.5, h * 0.5);
        } else if (p.shape === 'voxel') {
          // 3D Voxel
          const s = p.size;
          ctx.fillStyle = '#93c5fd';
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.86, -s * 0.5);
          ctx.lineTo(0, 0);
          ctx.lineTo(-s * 0.86, -s * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(-s * 0.86, -s * 0.5);
          ctx.lineTo(0, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.86, s * 0.5);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'vector') {
          const s = p.size;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s, 0);
          ctx.closePath();
          ctx.stroke();
        } else if (p.shape === 'slime') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'skull') {
          ctx.beginPath();
          ctx.arc(0, -2, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-p.size * 0.5, 2, p.size, p.size * 0.6);
        } else if (p.shape === 'star') {
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, -s * 0.3);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.3, s * 0.3);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.3, s * 0.3);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.3, -s * 0.3);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();

        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(interval);
    };
  }, [effect]);

  return (
    <div
      id={`death-effect-preview-${effect.id}`}
      onClick={() => triggerRef.current?.(true)}
      className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-slate-700/80 shadow-inner cursor-pointer group"
      title="Click to trigger blast & sound preview"
    >
      <canvas ref={canvasRef} width={340} height={200} className="w-full h-full block" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-cyber text-slate-400 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-700/60 pointer-events-none group-hover:text-cyan-300 transition-colors">
        <span>CLICK TO SIMULATE & LISTEN</span>
        <span className="text-cyan-400 font-bold">{effect.particleCount} PARTICLES</span>
      </div>
    </div>
  );
};

