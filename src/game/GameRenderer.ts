import {
  Snake,
  FoodItem,
  LootItem,
  Projectile,
  ExplosionEffect,
  Particle,
  DamagePopup,
  MapObstacle,
  ShieldPowerup,
} from '../types';
import { getSkinById } from '../utils/skins';
import { WEAPONS } from '../utils/weapons';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public clear(width: number, height: number) {
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(0, 0, width, height);
  }

  // Draw cybernetic arena grid
  public drawGrid(
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number,
    worldSize: number
  ) {
    const ctx = this.ctx;
    const gridSize = 80;

    const startX = Math.max(0, Math.floor((cameraX - viewWidth / 2) / gridSize) * gridSize);
    const endX = Math.min(worldSize, Math.ceil((cameraX + viewWidth / 2) / gridSize) * gridSize);
    const startY = Math.max(0, Math.floor((cameraY - viewHeight / 2) / gridSize) * gridSize);
    const endY = Math.min(worldSize, Math.ceil((cameraY + viewHeight / 2) / gridSize) * gridSize);

    // Subtle dark cyber grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Secondary sub-grid dots
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    for (let x = startX; x <= endX; x += gridSize * 2) {
      for (let y = startY; y <= endY; y += gridSize * 2) {
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
    }

    // World bounds electric perimeter
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.strokeRect(0, 0, worldSize, worldSize);

    // Hazard corner markers
    ctx.fillStyle = '#ef4444';
    const markerSize = 50;
    ctx.fillRect(0, 0, markerSize, 6);
    ctx.fillRect(0, 0, 6, markerSize);
    ctx.fillRect(worldSize - markerSize, 0, markerSize, 6);
    ctx.fillRect(worldSize - 6, 0, 6, markerSize);
    ctx.fillRect(0, worldSize - 6, markerSize, 6);
    ctx.fillRect(0, worldSize - markerSize, 6, markerSize);
    ctx.fillRect(worldSize - markerSize, worldSize - 6, markerSize, 6);
    ctx.fillRect(worldSize - 6, worldSize - markerSize, 6, markerSize);
    ctx.restore();
  }

  // Draw food items & cash coins
  public drawFood(foods: FoodItem[]) {
    const ctx = this.ctx;
    for (const food of foods) {
      ctx.save();
      ctx.translate(food.x, food.y);

      if (food.isCashCoin) {
        // Shimmering 3D Gold Cash Coin
        const pulse = 1 + Math.sin(food.pulsePhase) * 0.2;
        const r = food.radius * pulse;

        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 16;

        // Outer gold coin rim
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing face
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Embossed Dollar sign
        ctx.fillStyle = '#78350f';
        ctx.font = `bold ${Math.max(10, Math.floor(r * 1.3))}px Chakra Petch, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1);

        // Floating cash label
        ctx.shadowBlur = 4;
        ctx.font = 'bold 9px Chakra Petch, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`+$${food.cashValue || 10}`, 0, -r - 5);

        ctx.restore();
        continue;
      }

      // Pulse effect for regular food
      const pulse = 1 + Math.sin(food.pulsePhase) * 0.15;
      const r = food.radius * pulse;

      // Glow aura
      ctx.shadowColor = food.color;
      ctx.shadowBlur = food.isSpecial ? 14 : 8;

      ctx.fillStyle = food.color;

      // Square/diamond geometric food for snake² style
      ctx.rotate(food.pulsePhase * 0.5);
      const half = r * 0.9;
      ctx.beginPath();
      ctx.roundRect(-half, -half, half * 2, half * 2, 3);
      ctx.fill();

      // Inner shiny core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Draw weapon loot crates
  public drawLoot(loots: LootItem[]) {
    const ctx = this.ctx;
    for (const loot of loots) {
      const config = WEAPONS[loot.type];
      if (!config) continue;

      ctx.save();
      const hoverY = loot.y + Math.sin(loot.pulsePhase) * 6;
      ctx.translate(loot.x, hoverY);

      // Rotating beacon ring
      ctx.save();
      ctx.rotate(loot.pulsePhase * 0.8);
      ctx.strokeStyle = config.glowColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 12;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, loot.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Supply pod base (squared sci-fi pod)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-loot.radius, -loot.radius, loot.radius * 2, loot.radius * 2, 6);
      ctx.fill();
      ctx.stroke();

      // Pod inner panel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-loot.radius + 5, -loot.radius + 5, (loot.radius - 5) * 2, (loot.radius - 5) * 2);

      // Draw weapon emblem inside pod
      ctx.fillStyle = config.color;
      ctx.shadowBlur = 6;
      if (loot.type === 'grenade') {
        // Bomb/grenade icon
        ctx.beginPath();
        ctx.arc(0, 3, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-3, -11, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -14, 2, 4);
      } else if (loot.type === 'pistol') {
        // Pistol silhouette
        ctx.fillRect(-8, -2, 16, 5);
        ctx.fillRect(-7, 3, 6, 8);
        ctx.fillRect(-2, 0, 4, 3);
      } else if (loot.type === 'ar') {
        // AR silhouette
        ctx.fillRect(-12, -3, 24, 5);
        ctx.fillRect(-10, 2, 5, 8);
        ctx.fillRect(2, 2, 4, 7);
        ctx.fillRect(9, -6, 3, 4);
      } else if (loot.type === 'sniper') {
        // Sniper long rail silhouette
        ctx.fillRect(-15, -2, 30, 4);
        ctx.fillRect(-4, -6, 12, 3); // scope
        ctx.fillRect(-10, 2, 5, 7);
      }

      // Name & ammo badge floating above
      ctx.shadowBlur = 0;
      ctx.font = 'bold 11px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(config.name.toUpperCase(), 0, -loot.radius - 12);

      ctx.fillStyle = config.color;
      ctx.font = 'bold 10px Chakra Petch, sans-serif';
      ctx.fillText(`×${config.ammo} AMMO`, 0, loot.radius + 18);

      ctx.restore();
    }
  }

  // Draw tactical defensive map obstacles (Bulletproof Bunkers, Forcefield Pillars, Blast Barricades)
  public drawObstacles(obstacles: MapObstacle[]) {
    const ctx = this.ctx;

    for (const obs of obstacles) {
      ctx.save();
      ctx.translate(obs.x, obs.y);
      if (obs.rotation) {
        ctx.rotate(obs.rotation);
      }

      const pulse = obs.hitPulse || 0;

      if (obs.shape === 'circle' && obs.radius) {
        const r = obs.radius;

        // Shockwave absorption aura on bullet hit
        if (pulse > 0.05) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4 + pulse * 6;
          ctx.shadowColor = obs.borderColor;
          ctx.shadowBlur = 24 * pulse;
          ctx.globalAlpha = pulse * 0.8;
          ctx.beginPath();
          ctx.arc(0, 0, r + 8 * pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Drop shadow for tactical depth
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(4, 6, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Outer fortress ring
        ctx.fillStyle = obs.color;
        ctx.strokeStyle = pulse > 0.1 ? '#ffffff' : obs.borderColor;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = obs.borderColor;
        ctx.shadowBlur = pulse > 0.1 ? 20 : 8;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner reinforced plating
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Cybernetic Forcefield Pillar core or Bunker Turret Hub
        if (obs.type === 'forcefield_pillar') {
          // Rotating energy ring
          ctx.save();
          ctx.rotate((Date.now() * 0.003) % (Math.PI * 2));
          ctx.setLineDash([8, 6]);
          ctx.strokeStyle = obs.borderColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Glowing glowing plasma core
          ctx.fillStyle = pulse > 0.1 ? '#ffffff' : obs.borderColor;
          ctx.shadowColor = obs.borderColor;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
          ctx.fill();

          // Core node symbol
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Heavy Bunker Blast Vault
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Cross crosshair spokes
          ctx.moveTo(-r * 0.65, 0);
          ctx.lineTo(r * 0.65, 0);
          ctx.moveTo(0, -r * 0.65);
          ctx.lineTo(0, r * 0.65);
          ctx.stroke();

          // Center reinforced dome
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = obs.borderColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = obs.borderColor;
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Perimeter Armor Rivets (8 rivets)
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const rx = Math.cos(a) * (r - 7);
          const ry = Math.sin(a) * (r - 7);
          ctx.beginPath();
          ctx.arc(rx, ry, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Floating label
        if (obs.label) {
          ctx.font = 'bold 9px Chakra Petch, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = obs.borderColor;
          ctx.fillText(obs.label, 0, -r - 7);
        }
      } else if (obs.shape === 'rect' && obs.width && obs.height) {
        const w = obs.width;
        const h = obs.height;
        const halfW = w / 2;
        const halfH = h / 2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-halfW + 4, -halfH + 6, w, h);

        // Flash aura on bullet impact
        if (pulse > 0.05) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4 + pulse * 6;
          ctx.shadowColor = obs.borderColor;
          ctx.shadowBlur = 20 * pulse;
          ctx.globalAlpha = pulse * 0.8;
          ctx.strokeRect(-halfW - 3 * pulse, -halfH - 3 * pulse, w + 6 * pulse, h + 6 * pulse);
          ctx.restore();
        }

        // Barricade Base Plate
        ctx.fillStyle = obs.color;
        ctx.strokeStyle = pulse > 0.1 ? '#ffffff' : obs.borderColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = obs.borderColor;
        ctx.shadowBlur = pulse > 0.1 ? 18 : 6;
        ctx.beginPath();
        ctx.roundRect(-halfW, -halfH, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // High-contrast Hazard Caution Stripes
        ctx.save();
        ctx.clip();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
        const stripeW = 16;
        for (let sx = -halfW - h; sx < halfW + h; sx += stripeW * 2) {
          ctx.beginPath();
          ctx.moveTo(sx, -halfH);
          ctx.lineTo(sx + stripeW, -halfH);
          ctx.lineTo(sx + stripeW - h, halfH);
          ctx.lineTo(sx - h, halfH);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Inner armor groove
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfW + 5, -halfH + 5, w - 10, h - 10);

        // Defensive cover rivets
        ctx.fillStyle = '#f8fafc';
        ctx.shadowBlur = 0;
        ctx.fillRect(-halfW + 4, -halfH + 4, 3, 3);
        ctx.fillRect(halfW - 7, -halfH + 4, 3, 3);
        ctx.fillRect(-halfW + 4, halfH - 7, 3, 3);
        ctx.fillRect(halfW - 7, halfH - 7, 3, 3);

        // Center protective shield icon or label
        if (obs.label) {
          ctx.font = 'bold 9px Chakra Petch, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(obs.label, 0, -halfH - 6);
        }
      }

      ctx.restore();
    }
  }

  // Draw Shield Defense Powerups
  public drawShields(shields: ShieldPowerup[]) {
    const ctx = this.ctx;

    for (const s of shields) {
      ctx.save();
      const hoverY = s.y + Math.sin(s.pulsePhase) * 5;
      ctx.translate(s.x, hoverY);

      // Rotating energetic cyan ring
      ctx.save();
      ctx.rotate(s.pulsePhase * 0.9);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 14;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, s.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Translucent forcefield sphere
      ctx.fillStyle = 'rgba(14, 165, 233, 0.22)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shield Hexagon / Emblem
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(9, -6);
      ctx.lineTo(9, 3);
      ctx.lineTo(0, 10);
      ctx.lineTo(-9, 3);
      ctx.lineTo(-9, -6);
      ctx.closePath();
      ctx.fill();

      // Bright inner crest
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(6, -4);
      ctx.lineTo(6, 2);
      ctx.lineTo(0, 7);
      ctx.lineTo(-6, 2);
      ctx.lineTo(-6, -4);
      ctx.closePath();
      ctx.fill();

      // Shield label
      ctx.shadowBlur = 4;
      ctx.font = 'bold 10px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SHIELD +100', 0, -s.radius - 10);

      ctx.restore();
    }
  }

  // Draw projectiles (Bullets and Grenades)
  public drawProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.isExplosive) {
        // Grenade projectile with spinning fuse and flashing light
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        // Shell
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(-10, -7, 20, 14, 4);
        ctx.fill();
        ctx.stroke();

        // Warning bands
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-4, -6, 4, 12);

        // Blinking red beacon
        const blink = Math.sin(Date.now() * 0.03) > 0;
        ctx.fillStyle = blink ? '#f87171' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(4, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Tracer bullet
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color;

        if (p.weaponType === 'sniper') {
          // Railgun hyper-beam
          ctx.fillRect(-18, -2.5, 36, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-12, -1, 24, 2);
        } else if (p.weaponType === 'ar') {
          // Sharp AR energy dart
          ctx.fillRect(-10, -2, 20, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-5, -1, 10, 2);
        } else {
          // Pistol rounded slug
          ctx.beginPath();
          ctx.roundRect(-7, -2, 14, 4, 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // Draw explosion shockwaves & blast rings (with custom death effect styles)
  public drawExplosions(explosions: ExplosionEffect[]) {
    const ctx = this.ctx;
    for (const exp of explosions) {
      const progress = exp.elapsed / exp.duration;
      const currentRadius = exp.radius + (exp.maxRadius - exp.radius) * progress;
      const alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.translate(exp.x, exp.y);

      if (exp.style === 'skull') {
        // Neon Skull Hologram Explosion
        ctx.strokeStyle = exp.color;
        ctx.lineWidth = 4 * (1 - progress);
        ctx.globalAlpha = alpha;
        ctx.shadowColor = exp.color;
        ctx.shadowBlur = 30;

        // Expanding skull cranium
        ctx.beginPath();
        ctx.arc(0, -currentRadius * 0.15, currentRadius * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        // Jaw
        ctx.strokeRect(-currentRadius * 0.22, currentRadius * 0.2, currentRadius * 0.44, currentRadius * 0.25);

        // Eye sockets
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-currentRadius * 0.16, -currentRadius * 0.1, currentRadius * 0.1, 0, Math.PI * 2);
        ctx.arc(currentRadius * 0.16, -currentRadius * 0.1, currentRadius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Shockwave ring
        ctx.strokeStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        continue;
      }

      if (exp.style === 'void') {
        // Void Singularity Black Hole Vortex
        ctx.globalAlpha = alpha;
        // Outer gravitational accretion disk
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 5 * (1 - progress);
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Event Horizon (Deep Black Void Core)
        ctx.fillStyle = '#05030a';
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Glowing purple vortex rings
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2;
        ctx.rotate(progress * Math.PI * 4);
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.35, 0, Math.PI * 1.5);
        ctx.stroke();

        ctx.restore();
        continue;
      }

      // Standard / Supernova / Plasma / Cash Shockwave
      ctx.strokeStyle = exp.color;
      ctx.lineWidth = (exp.style === 'supernova' ? 10 : 6) * (1 - progress);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = exp.color;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (exp.style === 'supernova') {
        // Double blast ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4 * (1 - progress);
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner explosive flash core
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius * 0.75);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      gradient.addColorStop(0.3, exp.color);
      gradient.addColorStop(0.7, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Cyber fragmentation squares flying out
      ctx.fillStyle = exp.color;
      const count = exp.style === 'supernova' ? 14 : 8;
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count + progress * 2;
        const dist = currentRadius * 0.85;
        const fx = Math.cos(angle) * dist;
        const fy = Math.sin(angle) * dist;
        ctx.fillRect(fx - 4, fy - 4, 8, 8);
      }

      ctx.restore();
    }
  }

  // Draw floating particles with rich shapes (dollar, skull, binary, lightning, star)
  public drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(p.x, p.y);
      if (p.rotation !== undefined) {
        ctx.rotate(p.rotation);
      }

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === 'dollar') {
        // Gold Cash Symbol
        ctx.font = `bold ${Math.max(12, Math.floor(p.size * 2.2))}px Chakra Petch, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
      } else if (p.shape === 'binary') {
        // Matrix Falling Binary
        ctx.font = `bold ${Math.max(10, Math.floor(p.size * 2))}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text || '1', 0, 0);
      } else if (p.shape === 'star') {
        // 4-Point Radiant Sparkle
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.25, -s * 0.25);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.25, s * 0.25);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.25, s * 0.25);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.25, -s * 0.25);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'lightning') {
        // Jagged electrical spark
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size);
        ctx.lineTo(0, 0);
        ctx.lineTo(-p.size * 0.5, p.size * 0.5);
        ctx.lineTo(p.size, p.size);
        ctx.stroke();
      } else if (p.shape === 'square') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Draw Damage & Cash Popups
  public drawDamagePopups(popups: DamagePopup[]) {
    const ctx = this.ctx;
    for (const dp of popups) {
      const alpha = dp.life / dp.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      const isCash = dp.text.includes('CASH') || dp.text.includes('$');
      ctx.font = isCash ? 'bold 18px Chakra Petch, sans-serif' : 'bold 16px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = dp.color;
      ctx.shadowColor = isCash ? '#eab308' : '#000000';
      ctx.shadowBlur = isCash ? 12 : 5;
      ctx.fillText(dp.text, dp.x, dp.y);
      ctx.restore();
    }
  }

  // Draw a Snake in full "Snake²" cyber-mech design
  public drawSnake(snake: Snake) {
    if (snake.isDead || snake.segments.length === 0) return;

    const ctx = this.ctx;
    const skin = getSkinById(snake.skinId);
    const segSize = 24 + Math.min(snake.length * 0.18, 20); // expands dynamically with length!
    const halfSeg = segSize / 2;

    // 1. Draw Body Segments (from tail to neck)
    for (let i = snake.segments.length - 1; i >= 1; i--) {
      const seg = snake.segments[i];
      ctx.save();
      ctx.translate(seg.x, seg.y);
      ctx.rotate(seg.angle);

      // Segment size taper towards the tail
      const taper = Math.max(0.65, 1 - (i / snake.segments.length) * 0.35);
      const currentHalf = halfSeg * taper;
      const curSize = currentHalf * 2;

      // Connecting joint to next segment
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-currentHalf - 4, -currentHalf * 0.4, 8, currentHalf * 0.8);

      // Snake² Outer Square Shell (Chamfered/rounded square plate)
      ctx.fillStyle = i % 2 === 0 ? skin.primaryColor : skin.secondaryColor;
      ctx.strokeStyle = skin.accentColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = skin.accentColor;
      ctx.shadowBlur = snake.isBoosting ? 10 : 3;

      ctx.beginPath();
      ctx.roundRect(-currentHalf, -currentHalf, curSize, curSize, 4 * taper);
      ctx.fill();
      ctx.stroke();

      // Snake² Inner Core Micro-Reactor
      ctx.fillStyle = skin.coreGlow;
      ctx.globalAlpha = 0.8;
      const coreSize = curSize * 0.38;
      ctx.fillRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize);

      // Corner Tech Rivets
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.6;
      const rivetOff = currentHalf - 3;
      ctx.fillRect(-rivetOff, -rivetOff, 2, 2);
      ctx.fillRect(rivetOff - 2, -rivetOff, 2, 2);
      ctx.fillRect(-rivetOff, rivetOff - 2, 2, 2);
      ctx.fillRect(rivetOff - 2, rivetOff - 2, 2, 2);

      ctx.restore();
    }

    // 2. Draw Snake² Command Head
    const head = snake.segments[0];
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    const headSize = segSize * 1.25;
    const halfHead = headSize / 2;

    // Boosting thrusters fire from back of head & tail
    if (snake.isBoosting) {
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-halfHead, -halfHead * 0.5);
      ctx.lineTo(-halfHead - 16, 0);
      ctx.lineTo(-halfHead, halfHead * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Armored Head Chassis (Beveled cyber-square)
    ctx.fillStyle = skin.primaryColor;
    ctx.strokeStyle = skin.accentColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = skin.accentColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    // Beveled wedge front
    ctx.moveTo(-halfHead, -halfHead);
    ctx.lineTo(halfHead * 0.6, -halfHead);
    ctx.lineTo(halfHead, -halfHead * 0.35);
    ctx.lineTo(halfHead, halfHead * 0.35);
    ctx.lineTo(halfHead * 0.6, halfHead);
    ctx.lineTo(-halfHead, halfHead);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cyber visor / Sensor Eyes
    ctx.fillStyle = skin.eyeColor;
    ctx.shadowColor = skin.eyeColor;
    ctx.shadowBlur = 8;
    // Left eye optic
    ctx.fillRect(halfHead * 0.2, -halfHead * 0.65, halfHead * 0.45, 4);
    // Right eye optic
    ctx.fillRect(halfHead * 0.2, halfHead * 0.65 - 4, halfHead * 0.45, 4);

    // Center visor scanner
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(halfHead * 0.45, -halfHead * 0.2, 4, halfHead * 0.4);

    // 3. Render Mounted Swivel Weapon Turret at the BACK of the Head!
    if (snake.weapon) {
      const weaponCfg = WEAPONS[snake.weapon];
      if (weaponCfg) {
        ctx.save();
        // Position turret mount at the BACK of the head chassis
        const mountDist = -halfHead * 0.45;
        ctx.translate(mountDist, 0);

        // Calculate relative aim angle so turret swivels towards target
        const aimAngle = snake.aimAngle !== undefined ? snake.aimAngle : head.angle;
        const turretRelAngle = aimAngle - head.angle;
        ctx.rotate(turretRelAngle);

        // Heavy armored turret swivel base ring
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = weaponCfg.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = weaponCfg.glowColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Center reactor core on turret (flashes red when locked on enemy)
        ctx.fillStyle = snake.targetLockedSnakeId ? '#ef4444' : weaponCfg.color;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Weapon barrels extending forward from the turret mount
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = weaponCfg.color;
        ctx.lineWidth = 2;

        if (snake.weapon === 'grenade') {
          // Heavy revolving grenade drum
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(4, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Barrel
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(8, -4, 12, 8);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(18, -3, 3, 6);
        } else if (snake.weapon === 'pistol') {
          // Twin high-energy blaster barrels
          ctx.fillRect(4, -6, 14, 4);
          ctx.fillRect(4, 2, 14, 4);
          ctx.fillStyle = weaponCfg.color;
          ctx.fillRect(16, -6, 3, 4);
          ctx.fillRect(16, 2, 3, 4);
        } else if (snake.weapon === 'ar') {
          // Dual assault rifle barrels with flash suppressors
          ctx.fillRect(4, -5, 18, 4);
          ctx.fillRect(4, 1, 18, 4);
          ctx.fillStyle = weaponCfg.color;
          ctx.fillRect(20, -5, 4, 4);
          ctx.fillRect(20, 1, 4, 4);
        } else if (snake.weapon === 'sniper') {
          // Long magnetic railgun cannon
          ctx.fillRect(4, -3, 26, 6);
          ctx.strokeStyle = weaponCfg.color;
          ctx.strokeRect(4, -3, 26, 6);
          // Energy capacitor node
          ctx.fillStyle = weaponCfg.color;
          ctx.beginPath();
          ctx.arc(28, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    ctx.restore();

    // 3.2. Active Energy Shield Forcefield Bubble
    if (snake.shieldHp && snake.shieldHp > 0) {
      ctx.save();
      ctx.translate(head.x, head.y);
      const shieldR = headSize * 0.95;
      const pulse = Math.sin(Date.now() * 0.007) * 3;
      const r = shieldR + pulse;

      // Outer glowing cyan energy shell
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating dashed energy barrier
      ctx.save();
      ctx.rotate((Date.now() * 0.002) % (Math.PI * 2));
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Shield node beacons (6 hexagonal satellites)
      ctx.fillStyle = '#38bdf8';
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + Date.now() * 0.001;
        ctx.fillRect(Math.cos(a) * r - 2, Math.sin(a) * r - 2, 4, 4);
      }

      ctx.restore();
    }

    // 3.5. Laser Sight Targeting Beam (rendered in world space for player)
    if (snake.isPlayer && snake.weapon) {
      const weaponCfg = WEAPONS[snake.weapon];
      if (weaponCfg) {
        ctx.save();
        // Weapon mount in world coordinates (back of head)
        const mountDist = 12;
        const mountX = head.x - Math.cos(head.angle) * mountDist;
        const mountY = head.y - Math.sin(head.angle) * mountDist;
        const aimAngle = snake.aimAngle !== undefined ? snake.aimAngle : head.angle;
        const isLocked = !!snake.targetLockedSnakeId;

        let endX = mountX + Math.cos(aimAngle) * weaponCfg.range;
        let endY = mountY + Math.sin(aimAngle) * weaponCfg.range;

        if (isLocked && snake.laserLockPoint) {
          endX = snake.laserLockPoint.x;
          endY = snake.laserLockPoint.y;
        }

        // Draw laser sight line
        if (isLocked) {
          // High-intensity CRIMSON RED lock-on laser
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.moveTo(mountX, mountY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Laser core white line
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mountX, mountY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Animated Lock-on Target Reticle on Enemy
          ctx.save();
          ctx.translate(endX, endY);
          const rot = (Date.now() * 0.005) % (Math.PI * 2);
          ctx.rotate(rot);

          // Outer lock diamond
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.strokeRect(-16, -16, 32, 32);

          // Inner crosshair
          ctx.beginPath();
          ctx.moveTo(-22, 0);
          ctx.lineTo(22, 0);
          ctx.moveTo(0, -22);
          ctx.lineTo(0, 22);
          ctx.stroke();
          ctx.restore();

          // Floating target lock banner
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.font = 'bold 11px Chakra Petch, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ AUTO-SHOOTING TARGET', endX, endY - 26);
        } else {
          // Ready scan laser beam (weapon colored / cyan dotted)
          ctx.strokeStyle = weaponCfg.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.55;
          ctx.setLineDash([8, 8]);
          ctx.shadowColor = weaponCfg.glowColor;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(mountX, mountY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // End-point laser crosshair
          ctx.fillStyle = weaponCfg.color;
          ctx.beginPath();
          ctx.arc(endX, endY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // 4. Draw Floating HP Bar and Name over Snake Head
    ctx.save();
    ctx.translate(head.x, head.y - halfHead - 24);

    // Name tag
    ctx.font = 'bold 12px Chakra Petch, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = snake.isPlayer ? '#38bdf8' : '#e2e8f0';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`${snake.name} [Lv.${Math.floor(snake.length / 5)}]`, 0, -8);

    // HP Bar
    const barWidth = 46;
    const barHeight = 5;
    const hpRatio = Math.max(0, Math.min(1, snake.hp / snake.maxHp));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(-barWidth / 2, 0, barWidth, barHeight);

    // Bar fill color
    let hpColor = '#22c55e';
    if (hpRatio < 0.35) hpColor = '#ef4444';
    else if (hpRatio < 0.65) hpColor = '#f59e0b';

    ctx.fillStyle = hpColor;
    ctx.fillRect(-barWidth / 2, 0, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barWidth / 2, 0, barWidth, barHeight);

    // Shield Bar (if active)
    if (snake.shieldHp && snake.shieldHp > 0) {
      const shieldRatio = Math.max(0, Math.min(1, snake.shieldHp / (snake.maxShieldHp || 100)));
      const shieldH = 3.5;
      const shieldY = barHeight + 2;

      ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
      ctx.fillRect(-barWidth / 2, shieldY, barWidth, shieldH);

      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 6;
      ctx.fillRect(-barWidth / 2, shieldY, barWidth * shieldRatio, shieldH);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-barWidth / 2, shieldY, barWidth, shieldH);
    }

    // If snake has weapon, show mini weapon badge above name
    if (snake.weapon) {
      const weaponCfg = WEAPONS[snake.weapon];
      if (weaponCfg) {
        ctx.fillStyle = weaponCfg.color;
        ctx.font = 'bold 10px Chakra Petch, sans-serif';
        ctx.fillText(`⚡ ${weaponCfg.name.toUpperCase()} (${snake.ammo})`, 0, -22);
      }
    }

    ctx.restore();
  }
}
