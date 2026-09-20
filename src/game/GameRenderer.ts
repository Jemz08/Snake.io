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
  private viewport = { minX: 0, maxX: 6000, minY: 0, maxY: 6000 };

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setViewport(cameraX: number, cameraY: number, viewWidth: number, viewHeight: number) {
    const margin = 160;
    const halfW = viewWidth / 2 + margin;
    const halfH = viewHeight / 2 + margin;
    this.viewport.minX = cameraX - halfW;
    this.viewport.maxX = cameraX + halfW;
    this.viewport.minY = cameraY - halfH;
    this.viewport.maxY = cameraY + halfH;
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

  // Draw food items & cash coins (Ultra High Performance 144Hz Zero-Transform Fast Path)
  public drawFood(foods: FoodItem[]) {
    const ctx = this.ctx;
    const { minX, maxX, minY, maxY } = this.viewport;

    for (let idx = 0; idx < foods.length; idx++) {
      const food = foods[idx];

      // Viewport Frustum Culling - completely bypass offscreen foods!
      if (food.x < minX || food.x > maxX || food.y < minY || food.y > maxY) {
        continue;
      }

      if (food.isCashCoin) {
        // Shimmering 3D Gold Cash Coin
        const pulse = 1 + Math.sin(food.pulsePhase) * 0.2;
        const r = food.radius * pulse;

        // Outer rim
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(food.x, food.y, r + 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner gold face
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(food.x, food.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Top-left shiny highlight
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(food.x - r * 0.3, food.y - r * 0.3, r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Embossed Dollar sign
        ctx.fillStyle = '#78350f';
        ctx.font = `bold ${Math.max(9, Math.floor(r * 1.2))}px Chakra Petch, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', food.x, food.y + 1);

        // Floating cash label
        ctx.font = 'bold 9px Chakra Petch, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`+$${food.cashValue || 10}`, food.x, food.y - r - 5);
        continue;
      }

      // Standard / Special Food: Glowing 3D Snake.io energy orb (Zero-transform fast path)
      const pulse = 1 + Math.sin(food.pulsePhase) * 0.15;
      const r = food.radius * pulse;

      // Soft outer energy glow
      ctx.fillStyle = food.color;
      ctx.globalAlpha = food.isSpecial ? 0.38 : 0.2;
      ctx.beginPath();
      ctx.arc(food.x, food.y, r + (food.isSpecial ? 3.5 : 2), 0, Math.PI * 2);
      ctx.fill();

      // Main vibrant sphere body
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(food.x, food.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Special Food extra crisp white ring
      if (food.isSpecial) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(food.x, food.y, r * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3D Specular glossy bubble gleam (signature Snake.io sphere look)
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(food.x - r * 0.32, food.y - r * 0.32, r * 0.32, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1.0;
    }
  }

  // Draw weapon loot crates
  public drawLoot(loots: LootItem[]) {
    const ctx = this.ctx;
    const { minX, maxX, minY, maxY } = this.viewport;

    for (const loot of loots) {
      if (loot.x < minX - 60 || loot.x > maxX + 60 || loot.y < minY - 60 || loot.y > maxY + 60) {
        continue;
      }
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
    const { minX, maxX, minY, maxY } = this.viewport;

    for (const obs of obstacles) {
      if (obs.x < minX - 160 || obs.x > maxX + 160 || obs.y < minY - 160 || obs.y > maxY + 160) {
        continue;
      }
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
    const { minX, maxX, minY, maxY } = this.viewport;

    for (const s of shields) {
      if (s.x < minX - 60 || s.x > maxX + 60 || s.y < minY - 60 || s.y > maxY + 60) {
        continue;
      }
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

  // Draw a Snake in authentic 3D glossy rounded "Snake.io" Art Style (Zero-Transform Fast Path)
  public drawSnake(snake: Snake) {
    if (snake.isDead || snake.segments.length === 0) return;

    const head = snake.segments[0];
    const { minX, maxX, minY, maxY } = this.viewport;
    if (!snake.isPlayer) {
      const tail = snake.segments[snake.segments.length - 1];
      const botMinX = Math.min(head.x, tail.x);
      const botMaxX = Math.max(head.x, tail.x);
      const botMinY = Math.min(head.y, tail.y);
      const botMaxY = Math.max(head.y, tail.y);
      if (botMaxX < minX - 120 || botMinX > maxX + 120 || botMaxY < minY - 120 || botMinY > maxY + 120) {
        return;
      }
    }

    const ctx = this.ctx;
    const skin = getSkinById(snake.skinId);
    const archetype = skin.archetype || snake.archetype || 'cyber';
    // Base segment radius (scales gracefully with score/length)
    const baseRadius = 13 + Math.min(snake.length * 0.12, 10);

    // 1. Draw Body Segments (from tail to neck) using High-Speed Zero-Transform Sphere Batching
    // Circles are rotation-invariant: drawing directly at (seg.x, seg.y) eliminates 3,000+ matrix operations per frame!
    const totalSegs = snake.segments.length;
    for (let i = totalSegs - 1; i >= 1; i--) {
      const seg = snake.segments[i];
      // Organic smooth taper towards tail
      const taper = Math.max(0.42, 1 - (i / totalSegs) * 0.58);
      const r = baseRadius * taper;

      // 1.1 Subtle 3D Underbelly Drop Shadow (gives rounded depth against the arena floor)
      ctx.fillStyle = 'rgba(11, 15, 25, 0.45)';
      ctx.beginPath();
      ctx.arc(seg.x, seg.y + r * 0.18, r, 0, Math.PI * 2);
      ctx.fill();

      // 1.2 Main Glossy Spherical Bead (Alternating vibrant skin colors)
      ctx.fillStyle = i % 2 === 0 ? skin.primaryColor : skin.secondaryColor;
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, r, 0, Math.PI * 2);
      ctx.fill();

      // 1.3 Archetype / Spine Specialty Pattern
      if (archetype === 'angel') {
        // Celestial Holy Core
        ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'devil') {
        // Magma Fiery Seam
        ctx.fillStyle = i % 3 === 0 ? '#ef4444' : '#f97316';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.38, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'blackhole') {
        // Singularity Void Core
        ctx.fillStyle = '#030712';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (archetype === 'robot') {
        // Mecha Tech Power Ring
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (archetype === 'dragon') {
        // Reptilian Diamond Spine Plate
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cyber Glow Node
        ctx.fillStyle = skin.coreGlow;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 1.4 Signature 3D Glossy Specular Bubble Sheen (Upper-Left Reflection droplet)
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(seg.x - r * 0.3, seg.y - r * 0.3, r * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // 2. Draw Snake.io Organic Rounded Character Head
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    const headR = baseRadius * 1.35;

    // 2.1 Boosting Thruster Trails
    if (snake.isBoosting) {
      ctx.save();
      const flameLen = headR * (1.2 + Math.random() * 0.4);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-headR * 0.6, -headR * 0.5);
      ctx.lineTo(-headR * 0.6 - flameLen, 0);
      ctx.lineTo(-headR * 0.6, headR * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-headR * 0.6, -headR * 0.25);
      ctx.lineTo(-headR * 0.6 - flameLen * 0.6, 0);
      ctx.lineTo(-headR * 0.6, headR * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2.2 Smooth Organic Rounded Head Shape (Curved aerodynamic Snake.io contour)
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(headR * 0.15, 0, headR * 1.05, headR * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head 3D Specular Highlight (Soft curved glossy dome sheen)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.ellipse(headR * 0.05, -headR * 0.25, headR * 0.75, headR * 0.45, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 2.3 Big Expressive Snake.io Cartoon Eyes
    // Calculate pupil gaze tracking (towards aim angle or forward velocity)
    const aimAngle = snake.aimAngle !== undefined ? snake.aimAngle : head.angle;
    const relGaze = aimAngle - head.angle;
    const gazeDist = headR * 0.12;
    const pupilOffX = Math.cos(relGaze) * gazeDist + headR * 0.05;
    const pupilOffY = Math.sin(relGaze) * gazeDist;

    const eyeOffsetX = headR * 0.32;
    const eyeOffsetY = headR * 0.52;
    const eyeRadius = headR * 0.34;
    const pupilRadius = eyeRadius * 0.52;

    // Draw Left & Right Eyes
    [-eyeOffsetY, eyeOffsetY].forEach((eyeY, eyeIdx) => {
      // White glossy Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sclera subtle depth rim
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Vibrant Iris
      ctx.fillStyle = skin.eyeColor || skin.accentColor;
      ctx.beginPath();
      ctx.arc(eyeOffsetX + pupilOffX * 0.7, eyeY + pupilOffY * 0.7, eyeRadius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Pupil (looking towards velocity/aim direction)
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      if (archetype === 'dragon') {
        // Slitted reptilian dragon pupil
        ctx.ellipse(eyeOffsetX + pupilOffX, eyeY + pupilOffY, pupilRadius * 0.45, pupilRadius * 1.15, 0, 0, Math.PI * 2);
      } else {
        // Classic round Snake.io expressive pupil
        ctx.arc(eyeOffsetX + pupilOffX, eyeY + pupilOffY, pupilRadius, 0, Math.PI * 2);
      }
      ctx.fill();

      // Cute lively white gleam sparkle in pupil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeOffsetX + pupilOffX - pupilRadius * 0.35, eyeY + pupilOffY - pupilRadius * 0.35, pupilRadius * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Brow Ridge Curve
      ctx.strokeStyle = skin.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const browDir = eyeIdx === 0 ? -1 : 1;
      ctx.arc(eyeOffsetX - 2, eyeY - browDir * 2, eyeRadius * 1.1, browDir > 0 ? 0.3 : -1.8, browDir > 0 ? 1.8 : -0.3);
      ctx.stroke();
    });

    // 2.4 Archetype Specific Head Adornments (Behance Snake.io character art features)
    if (archetype === 'angel') {
      // 1. Divine Levitating Golden Angel Halo
      ctx.save();
      const haloFloat = Math.sin(Date.now() * 0.005) * 3;
      ctx.translate(0, -headR * 1.35 + haloFloat);
      ctx.scale(1.15, 0.42);

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.8 - 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 2. Celestial Feathered Wings on Head/Neck
      const wingFlap = Math.sin(Date.now() * 0.009) * 0.22;
      // Left Wing
      ctx.save();
      ctx.translate(-headR * 0.2, -headR * 0.85);
      ctx.rotate(-0.5 + wingFlap);
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-14, -20, -6, -32);
      ctx.quadraticCurveTo(8, -24, 12, -16);
      ctx.quadraticCurveTo(10, -8, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right Wing
      ctx.save();
      ctx.translate(-headR * 0.2, headR * 0.85);
      ctx.rotate(0.5 - wingFlap);
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-14, 20, -6, 32);
      ctx.quadraticCurveTo(8, 24, 12, 16);
      ctx.quadraticCurveTo(10, 8, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (archetype === 'devil') {
      // Demonic Obsidian Horns & Magma Vents
      ctx.save();
      // Left Horn
      ctx.save();
      ctx.translate(-headR * 0.15, -headR * 0.85);
      ctx.rotate(-0.55);
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.quadraticCurveTo(8, -14, 2, -26);
      ctx.quadraticCurveTo(-6, -16, -4, -3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Molten magma vein
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(2, -22);
      ctx.stroke();
      ctx.restore();

      // Right Horn
      ctx.save();
      ctx.translate(-headR * 0.15, headR * 0.85);
      ctx.rotate(0.55);
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.quadraticCurveTo(8, 14, 2, 26);
      ctx.quadraticCurveTo(-6, 16, -4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Molten magma vein
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(2, 22);
      ctx.stroke();
      ctx.restore();

      // Brimstone forehead crest
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(headR * 0.3, 0);
      ctx.lineTo(0, -6);
      ctx.lineTo(-headR * 0.2, 0);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (archetype === 'blackhole') {
      // Swirling Event Horizon Singularity Vortex Core
      ctx.save();
      const spin = (Date.now() * 0.004) % (Math.PI * 2);

      // Rotating Accretion Rings
      ctx.save();
      ctx.rotate(spin);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.82, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-spin * 2.3);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Black Hole Pure Event Horizon Singularity Center
      ctx.fillStyle = '#030712';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Photon sphere point
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(Math.cos(spin * 3) * (headR * 0.26), Math.sin(spin * 3) * (headR * 0.26), 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (archetype === 'robot') {
      // Dual Hydraulic Comms Antennas & Mecha Plates
      ctx.save();
      // Left antenna
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.3, -headR * 0.7);
      ctx.lineTo(-headR * 0.7, -headR * 1.35);
      ctx.stroke();
      // Blinking beacon LED
      ctx.fillStyle = (Math.floor(Date.now() / 250) % 2 === 0) ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(-headR * 0.7, -headR * 1.35, 3, 0, Math.PI * 2);
      ctx.fill();

      // Right antenna
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-headR * 0.3, headR * 0.7);
      ctx.lineTo(-headR * 0.7, headR * 1.35);
      ctx.stroke();
      ctx.fillStyle = (Math.floor(Date.now() / 250) % 2 === 0) ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(-headR * 0.7, headR * 1.35, 3, 0, Math.PI * 2);
      ctx.fill();

      // Center Laser Optic Scanner
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(headR * 0.42, -headR * 0.15, 3, headR * 0.3);
      ctx.restore();
    } else if (archetype === 'dragon') {
      // Draconic Crest Horns & Spines
      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#022c22';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.4, 0);
      ctx.lineTo(-headR * 0.95, -10);
      ctx.lineTo(-headR * 0.7, 0);
      ctx.lineTo(-headR * 0.95, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // Cyber Aero Canopy Ridge
      ctx.strokeStyle = skin.accentColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.4, 0);
      ctx.lineTo(headR * 0.3, 0);
      ctx.stroke();
    }

    // 3. Render Mounted Swivel Weapon Turret at the BACK of the Head!
    if (snake.weapon) {
      const weaponCfg = WEAPONS[snake.weapon];
      if (weaponCfg) {
        ctx.save();
        // Position turret mount at the BACK of the head chassis
        const mountDist = -headR * 0.45;
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
      const shieldR = headR * 1.5;
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
    ctx.translate(head.x, head.y - headR - 20);

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
