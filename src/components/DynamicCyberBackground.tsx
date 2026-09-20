import React, { useRef, useEffect } from 'react';
import { SnakeArchetype } from '../types';

interface DynamicCyberBackgroundProps {
  archetype?: SnakeArchetype;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
}

export const DynamicCyberBackground: React.FC<DynamicCyberBackgroundProps> = ({
  archetype = 'cyber',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palette based on snake archetype
    const getPalette = () => {
      switch (archetype) {
        case 'angel':
          return {
            bgGrad1: '#070b14',
            bgGrad2: '#131109',
            nodeColor: 'rgba(250, 204, 21, 0.4)',
            lineColor: 'rgba(254, 240, 138, 0.08)',
            colors: ['#ffffff', '#fef08a', '#facc15', '#38bdf8'],
            auraColor: 'rgba(250, 204, 21, 0.06)',
          };
        case 'devil':
          return {
            bgGrad1: '#090506',
            bgGrad2: '#140707',
            nodeColor: 'rgba(239, 68, 68, 0.45)',
            lineColor: 'rgba(239, 68, 68, 0.09)',
            colors: ['#ef4444', '#f97316', '#fbbf24', '#7f1d1d'],
            auraColor: 'rgba(239, 68, 68, 0.08)',
          };
        case 'blackhole':
          return {
            bgGrad1: '#030206',
            bgGrad2: '#0b0616',
            nodeColor: 'rgba(168, 85, 247, 0.45)',
            lineColor: 'rgba(168, 85, 247, 0.1)',
            colors: ['#a855f7', '#c084fc', '#38bdf8', '#818cf8'],
            auraColor: 'rgba(168, 85, 247, 0.07)',
          };
        case 'robot':
          return {
            bgGrad1: '#050c18',
            bgGrad2: '#091528',
            nodeColor: 'rgba(14, 165, 233, 0.45)',
            lineColor: 'rgba(56, 189, 248, 0.09)',
            colors: ['#38bdf8', '#0ea5e9', '#ef4444', '#94a3b8'],
            auraColor: 'rgba(14, 165, 233, 0.07)',
          };
        case 'dragon':
          return {
            bgGrad1: '#030d09',
            bgGrad2: '#061611',
            nodeColor: 'rgba(16, 185, 129, 0.45)',
            lineColor: 'rgba(16, 185, 129, 0.09)',
            colors: ['#10b981', '#34d399', '#fde047', '#059669'],
            auraColor: 'rgba(16, 185, 129, 0.07)',
          };
        case 'cyber':
        default:
          return {
            bgGrad1: '#050811',
            bgGrad2: '#0a1020',
            nodeColor: 'rgba(6, 182, 212, 0.4)',
            lineColor: 'rgba(6, 182, 212, 0.08)',
            colors: ['#06b6d4', '#22d3ee', '#38bdf8', '#a5f3fc'],
            auraColor: 'rgba(6, 182, 212, 0.06)',
          };
      }
    };

    const palette = getPalette();

    // Create particles
    const particleCount = Math.min(55, Math.floor(width / 30));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const color = palette.colors[Math.floor(Math.random() * palette.colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1.2,
        color,
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      const pal = getPalette();

      // Clear with rich gradient
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, pal.bgGrad2);
      grad.addColorStop(1, pal.bgGrad1);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Large ambient aura pulse in center
      const auraGrad = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 0.5) * 60,
        height / 2 + Math.cos(time * 0.5) * 40,
        10,
        width / 2,
        height / 2,
        width * 0.65
      );
      auraGrad.addColorStop(0, pal.auraColor);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid
      const gridSize = 70;
      const gridOffsetX = (time * 8) % gridSize;
      const gridOffsetY = (time * 5) % gridSize;

      ctx.strokeStyle = pal.lineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = gridOffsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = gridOffsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Constellation connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.18;
            ctx.strokeStyle = pal.nodeColor;
            ctx.globalAlpha = lineAlpha;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulse = Math.sin(time * 2 + i) * 0.3;
        const currentAlpha = Math.max(0.1, p.baseAlpha + pulse);

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();

        // Archetype specific particle geometry
        if (archetype === 'angel') {
          // Starlight cross / diamond
          const s = p.size * 1.5;
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.4, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.4, 0);
          ctx.closePath();
          ctx.fill();
        } else if (archetype === 'devil') {
          // Floating fiery diamond ember
          const s = p.size * 1.3;
          ctx.translate(p.x, p.y);
          ctx.rotate(time * 0.5 + i);
          ctx.fillRect(-s / 2, -s / 2, s, s);
        } else if (archetype === 'blackhole') {
          // Cosmic singularity particle with ring
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Square cyber mech tile
          ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [archetype]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};
