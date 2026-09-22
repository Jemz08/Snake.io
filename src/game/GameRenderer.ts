import {
  Snake,
  SkinDef,
  FoodItem,
  LootItem,
  Projectile,
  ExplosionEffect,
  Particle,
  DamagePopup,
  MapObstacle,
  ShieldPowerup,
  TrailHazard,
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

  // Draw fire, ice, and toxic hazard trails left behind by Phoenix, Frost, and Venom
  public drawTrailHazards(hazards: TrailHazard[]) {
    if (!hazards || hazards.length === 0) return;
    const ctx = this.ctx;
    const { minX, maxX, minY, maxY } = this.viewport;

    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      if (h.x < minX - 50 || h.x > maxX + 50 || h.y < minY - 50 || h.y > maxY + 50) {
        continue;
      }

      const lifeRatio = Math.max(0, h.duration / h.maxDuration);
      ctx.save();
      ctx.globalAlpha = Math.min(0.85, lifeRatio * 1.1);
      ctx.translate(h.x, h.y);

      if (h.type === 'fire') {
        const flicker = 1 + Math.sin(Date.now() * 0.015 + h.id) * 0.15;
        const r = h.radius * flicker;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, '#f97316');
        grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.6)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'ice') {
        const r = h.radius;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, '#e0f2fe');
        grad.addColorStop(0.4, '#38bdf8');
        grad.addColorStop(0.8, 'rgba(14, 165, 233, 0.4)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3;
          ctx.lineTo(Math.cos(a) * (r * 0.65), Math.sin(a) * (r * 0.65));
        }
        ctx.closePath();
        ctx.stroke();
      } else if (h.type === 'toxic') {
        const r = h.radius;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, '#d9f99d');
        grad.addColorStop(0.4, '#84cc16');
        grad.addColorStop(0.8, 'rgba(101, 163, 13, 0.45)');
        grad.addColorStop(1, 'rgba(101, 163, 13, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
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
      let durationAlpha = 1.0;
      let durationScale = 1.0;
      if (food.duration !== undefined) {
        if (food.duration < 0.9) {
          // Rapid expiration blink in final 0.9s
          durationAlpha = Math.max(0.2, food.duration / 0.9);
          if (Math.sin(food.duration * 25) < 0) {
            durationAlpha *= 0.35;
          }
          durationScale = 0.55 + 0.45 * (food.duration / 0.9);
        }
      }

      const pulse = 1 + Math.sin(food.pulsePhase) * 0.15;
      const r = food.radius * pulse * durationScale;

      // Soft outer energy glow
      ctx.fillStyle = food.color;
      ctx.globalAlpha = (food.isSpecial ? 0.38 : 0.2) * durationAlpha;
      ctx.beginPath();
      ctx.arc(food.x, food.y, r + (food.isSpecial ? 3.5 : 2), 0, Math.PI * 2);
      ctx.fill();

      // Main vibrant sphere body
      ctx.globalAlpha = 0.95 * durationAlpha;
      ctx.beginPath();
      ctx.arc(food.x, food.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Special Food extra crisp white ring
      if (food.isSpecial) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9 * durationAlpha;
        ctx.beginPath();
        ctx.arc(food.x, food.y, r * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3D Specular glossy bubble gleam (signature Snake.io sphere look)
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85 * durationAlpha;
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
      } else if (p.shape === 'bat') {
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.2);
        ctx.quadraticCurveTo(s * 0.5, -s * 0.8, s, -s * 0.3);
        ctx.quadraticCurveTo(s * 0.6, 0.2 * s, 0, s * 0.5);
        ctx.quadraticCurveTo(-s * 0.6, 0.2 * s, -s, -s * 0.3);
        ctx.quadraticCurveTo(-s * 0.5, -s * 0.8, 0, s * 0.2);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'snowflake') {
        const s = p.size;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 3; a++) {
          ctx.beginPath();
          const ang = (a * Math.PI) / 3;
          ctx.moveTo(-Math.cos(ang) * s, -Math.sin(ang) * s);
          ctx.lineTo(Math.cos(ang) * s, Math.sin(ang) * s);
          ctx.stroke();
        }
      } else if (p.shape === 'gear') {
        const s = p.size;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const ang = (k * Math.PI) / 4;
          const rInner = s * 0.65;
          const rOuter = s;
          ctx.lineTo(Math.cos(ang - 0.15) * rOuter, Math.sin(ang - 0.15) * rOuter);
          ctx.lineTo(Math.cos(ang + 0.15) * rOuter, Math.sin(ang + 0.15) * rOuter);
          ctx.lineTo(Math.cos(ang + 0.25) * rInner, Math.sin(ang + 0.25) * rInner);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'acid') {
        const s = p.size;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-s * 0.3, -s * 0.3, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
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

  // Controlled, non-blinding ambient aura surrounding the snake contour
  private drawSnakeControlledAura(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    skin: SkinDef,
    archetype: string,
    leftPoints: Array<{ x: number; y: number }>,
    rightPoints: Array<{ x: number; y: number }>,
    splineIndices: number[],
    splineCount: number,
    tailTipX: number,
    tailTipY: number,
    baseRadius: number
  ) {
    if (splineCount < 2) return;
    const firstIdx = splineIndices[0];

    // Controlled, tasteful aura color mapped to archetype / skin
    let auraColor = skin.accentColor || skin.coreGlow || '#38bdf8';
    if (archetype === 'phoenix') auraColor = '#f97316';
    else if (archetype === 'frost') auraColor = '#38bdf8';
    else if (archetype === 'venom') auraColor = '#84cc16';
    else if (archetype === 'storm') auraColor = '#60a5fa';
    else if (archetype === 'phantom') auraColor = '#818cf8';
    else if (archetype === 'vampire') auraColor = '#ef4444';
    else if (archetype === 'chrono') auraColor = '#f59e0b';
    else if (archetype === 'ninja') auraColor = '#f43f5e';
    else if (archetype === 'crystal') auraColor = '#22d3ee';
    else if (archetype === 'alien') auraColor = '#10b981';
    else if (archetype === 'angel') auraColor = '#fde047';
    else if (archetype === 'devil') auraColor = '#f97316';
    else if (archetype === 'blackhole') auraColor = '#c084fc';
    else if (archetype === 'robot') auraColor = '#0ea5e9';
    else if (archetype === 'dragon') auraColor = '#34d399';
    else if (archetype === 'cyber') auraColor = '#06b6d4';

    // Rhythmic organic breathing pulse (subtle, 0.20 - 0.28 alpha)
    const seed = (snake.id.charCodeAt(0) || 1) + (snake.id.charCodeAt(snake.id.length - 1) || 2);
    const breath = 0.22 + Math.sin(Date.now() * 0.0035 + seed) * 0.06;

    ctx.save();
    // Non-blinding glow: controlled shadowBlur 8px (avoids blinding bloom)
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = Math.max(3.2, baseRadius * 0.32);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = breath;

    ctx.beginPath();
    ctx.moveTo(leftPoints[firstIdx].x, leftPoints[firstIdx].y);
    for (let k = 1; k < splineCount; k++) {
      const prev = leftPoints[splineIndices[k - 1]];
      const cur = leftPoints[splineIndices[k]];
      const midX = (prev.x + cur.x) * 0.5;
      const midY = (prev.y + cur.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.lineTo(tailTipX, tailTipY);
    for (let k = splineCount - 1; k >= 1; k--) {
      const prev = rightPoints[splineIndices[k]];
      const next = rightPoints[splineIndices[k - 1]];
      const midX = (prev.x + next.x) * 0.5;
      const midY = (prev.y + next.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.lineTo(rightPoints[firstIdx].x, rightPoints[firstIdx].y);
    ctx.closePath();
    ctx.stroke();

    // Crisp inner energy fringe
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = breath * 1.3;
    ctx.stroke();

    ctx.restore();
  }

  // Unique archetype dorsal spikes, flank blades, crystals, horns, and vents along the body
  private drawArchetypeBodySpikes(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    skin: SkinDef,
    archetype: string,
    segRadii: number[],
    segAngles: number[],
    leftPoints: Array<{ x: number; y: number }>,
    rightPoints: Array<{ x: number; y: number }>,
    totalSegs: number
  ) {
    if (totalSegs < 3) return;
    const stride = totalSegs > 60 ? 3 : totalSegs > 25 ? 2 : 1;

    for (let i = 1; i < totalSegs - 1; i += stride) {
      const seg = snake.segments[i];
      const r = segRadii[i];
      const ang = segAngles[i];
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      const nx = -sin;
      const ny = cos;

      const lp = leftPoints[i];
      const rp = rightPoints[i];

      if (archetype === 'crystal') {
        // Protruding faceted 3D diamond crystal spikes
        const spikeLen = r * 0.75;
        const spikeBase = r * 0.42;

        const tipLX = lp.x + nx * spikeLen - cos * (spikeLen * 0.35);
        const tipLY = lp.y + ny * spikeLen - sin * (spikeLen * 0.35);
        const b1LX = lp.x - cos * spikeBase;
        const b1LY = lp.y - sin * spikeBase;
        const b2LX = lp.x + cos * spikeBase;
        const b2LY = lp.y + sin * spikeBase;

        ctx.fillStyle = '#0891b2';
        ctx.beginPath();
        ctx.moveTo(b1LX, b1LY);
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(lp.x, lp.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(b2LX, b2LY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(tipLX, tipLY);
        ctx.stroke();

        const tipRX = rp.x - nx * spikeLen - cos * (spikeLen * 0.35);
        const tipRY = rp.y - ny * spikeLen - sin * (spikeLen * 0.35);
        const b1RX = rp.x - cos * spikeBase;
        const b1RY = rp.y - sin * spikeBase;
        const b2RX = rp.x + cos * spikeBase;
        const b2RY = rp.y + sin * spikeBase;

        ctx.fillStyle = '#0891b2';
        ctx.beginPath();
        ctx.moveTo(b1RX, b1RY);
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(rp.x, rp.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.moveTo(rp.x, rp.y);
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(b2RX, b2RY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rp.x, rp.y);
        ctx.lineTo(tipRX, tipRY);
        ctx.stroke();

        // Dorsal crystal shard on spine
        ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#a5f3fc';
        ctx.beginPath();
        ctx.moveTo(seg.x - cos * (r * 0.45), seg.y - sin * (r * 0.45));
        ctx.lineTo(seg.x + nx * (r * 0.35), seg.y + ny * (r * 0.35));
        ctx.lineTo(seg.x + cos * (r * 0.45), seg.y + sin * (r * 0.45));
        ctx.lineTo(seg.x - nx * (r * 0.35), seg.y - ny * (r * 0.35));
        ctx.closePath();
        ctx.fill();
      } else if (archetype === 'devil') {
        // Jagged obsidian magma spikes with molten tips
        const spikeLen = r * 0.8;
        const tipLX = lp.x + nx * spikeLen - cos * (spikeLen * 0.55);
        const tipLY = lp.y + ny * spikeLen - sin * (spikeLen * 0.55);
        const tipRX = rp.x - nx * spikeLen - cos * (spikeLen * 0.55);
        const tipRY = rp.y - ny * spikeLen - sin * (spikeLen * 0.55);

        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.35), lp.y - sin * (r * 0.35));
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.35), lp.y + sin * (r * 0.35));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.35), rp.y - sin * (r * 0.35));
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.35), rp.y + sin * (r * 0.35));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Molten glowing tips
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(tipLX, tipLY, 2.2, 0, Math.PI * 2);
        ctx.arc(tipRX, tipRY, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal spine magma crest
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(seg.x - cos * (r * 0.5), seg.y - sin * (r * 0.5));
        ctx.lineTo(seg.x, seg.y);
        ctx.lineTo(seg.x - cos * (r * 0.3) + nx * 2, seg.y - sin * (r * 0.3) + ny * 2);
        ctx.closePath();
        ctx.fill();
      } else if (archetype === 'frost') {
        // Sub-zero glacial icicle spikes
        const spikeLen = r * 0.78;
        const tipLX = lp.x + nx * spikeLen - cos * (spikeLen * 0.6);
        const tipLY = lp.y + ny * spikeLen - sin * (spikeLen * 0.6);
        const tipRX = rp.x - nx * spikeLen - cos * (spikeLen * 0.6);
        const tipRY = rp.y - ny * spikeLen - sin * (spikeLen * 0.6);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.3), lp.y + sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.3), rp.y + sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ice diamond center scale
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'venom') {
        // Toxic quills with glowing venom glands
        const spikeLen = r * 0.72;
        const tipLX = lp.x + nx * spikeLen - cos * (spikeLen * 0.65);
        const tipLY = lp.y + ny * spikeLen - sin * (spikeLen * 0.65);
        const tipRX = rp.x - nx * spikeLen - cos * (spikeLen * 0.65);
        const tipRY = rp.y - ny * spikeLen - sin * (spikeLen * 0.65);

        ctx.strokeStyle = '#4d7c0f';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(tipLX, tipLY);
        ctx.moveTo(rp.x, rp.y);
        ctx.lineTo(tipRX, tipRY);
        ctx.stroke();

        // Dripping venom gland at stinger base
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 2.8, 0, Math.PI * 2);
        ctx.arc(rp.x, rp.y, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal toxic node
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'storm') {
        // High-voltage Tesla conductor needles
        const spikeLen = r * 0.75;
        const tipLX = lp.x + nx * spikeLen - cos * (spikeLen * 0.4);
        const tipLY = lp.y + ny * spikeLen - sin * (spikeLen * 0.4);
        const tipRX = rp.x - nx * spikeLen - cos * (spikeLen * 0.4);
        const tipRY = rp.y - ny * spikeLen - sin * (spikeLen * 0.4);

        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(tipLX, tipLY);
        ctx.moveTo(rp.x, rp.y);
        ctx.lineTo(tipRX, tipRY);
        ctx.stroke();

        // Spark cap
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tipLX, tipLY, 2, 0, Math.PI * 2);
        ctx.arc(tipRX, tipRY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal lightning chevron
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(seg.x - cos * (r * 0.4), seg.y - sin * (r * 0.4));
        ctx.lineTo(seg.x + nx * (r * 0.25), seg.y + ny * (r * 0.25));
        ctx.lineTo(seg.x + cos * (r * 0.4), seg.y + sin * (r * 0.4));
        ctx.closePath();
        ctx.fill();
      } else if (archetype === 'phoenix') {
        // Solar feathered fire quills
        const quillLen = r * 0.8;
        const tipLX = lp.x + nx * quillLen - cos * (quillLen * 0.5);
        const tipLY = lp.y + ny * quillLen - sin * (quillLen * 0.5);
        const tipRX = rp.x - nx * quillLen - cos * (quillLen * 0.5);
        const tipRY = rp.y - ny * quillLen - sin * (quillLen * 0.5);

        ctx.fillStyle = '#f97316';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.35), lp.y - sin * (r * 0.35));
        ctx.quadraticCurveTo(lp.x + nx * (quillLen * 0.5), lp.y + ny * (quillLen * 0.5), tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.2), lp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.35), rp.y - sin * (r * 0.35));
        ctx.quadraticCurveTo(rp.x - nx * (quillLen * 0.5), rp.y - ny * (quillLen * 0.5), tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.2), rp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sun ember spine node
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'ninja') {
        // Razor-sharp shuriken blade fins
        const bladeLen = r * 0.7;
        const tipLX = lp.x + nx * bladeLen - cos * (bladeLen * 0.45);
        const tipLY = lp.y + ny * bladeLen - sin * (bladeLen * 0.45);
        const tipRX = rp.x - nx * bladeLen - cos * (bladeLen * 0.45);
        const tipRY = rp.y - ny * bladeLen - sin * (bladeLen * 0.45);

        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.3), lp.y + sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.3), rp.y + sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Steel edge glint
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lp.x + cos * (r * 0.3), lp.y + sin * (r * 0.3));
        ctx.lineTo(tipLX, tipLY);
        ctx.moveTo(rp.x + cos * (r * 0.3), rp.y + sin * (r * 0.3));
        ctx.lineTo(tipRX, tipRY);
        ctx.stroke();
      } else if (archetype === 'alien') {
        // Curved Xenomorph ribcage exoskeleton spikes
        const ribLen = r * 0.72;
        const tipLX = lp.x + nx * ribLen - cos * (ribLen * 0.35);
        const tipLY = lp.y + ny * ribLen - sin * (ribLen * 0.35);
        const tipRX = rp.x - nx * ribLen - cos * (ribLen * 0.35);
        const tipRY = rp.y - ny * ribLen - sin * (ribLen * 0.35);

        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.quadraticCurveTo(lp.x + nx * ribLen, lp.y + ny * ribLen, tipLX, tipLY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x, rp.y);
        ctx.quadraticCurveTo(rp.x - nx * ribLen, rp.y - ny * ribLen, tipRX, tipRY);
        ctx.stroke();

        // Bio-luminescent acid vertebrae dot
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'chrono') {
        // Clockwork gear teeth along flanks
        const toothLen = r * 0.55;
        const toothW = r * 0.32;
        const tipLX = lp.x + nx * toothLen;
        const tipLY = lp.y + ny * toothLen;
        const tipRX = rp.x - nx * toothLen;
        const tipRY = rp.y - ny * toothLen;

        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * toothW, lp.y - sin * toothW);
        ctx.lineTo(tipLX - cos * (toothW * 0.7), tipLY - sin * (toothW * 0.7));
        ctx.lineTo(tipLX + cos * (toothW * 0.7), tipLY + sin * (toothW * 0.7));
        ctx.lineTo(lp.x + cos * toothW, lp.y + sin * toothW);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * toothW, rp.y - sin * toothW);
        ctx.lineTo(tipRX - cos * (toothW * 0.7), tipRY - sin * (toothW * 0.7));
        ctx.lineTo(tipRX + cos * (toothW * 0.7), tipRY + sin * (toothW * 0.7));
        ctx.lineTo(rp.x + cos * toothW, rp.y + sin * toothW);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Spine brass cogwheel
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'vampire') {
        // Gothic gargoyle spine spikes
        const spikeLen = r * 0.75;
        const tipLX = lp.x + nx * spikeLen - cos * (spikeLen * 0.5);
        const tipLY = lp.y + ny * spikeLen - sin * (spikeLen * 0.5);
        const tipRX = rp.x - nx * spikeLen - cos * (spikeLen * 0.5);
        const tipRY = rp.y - ny * spikeLen - sin * (spikeLen * 0.5);

        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.3), lp.y + sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.3), rp.y + sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Blood ruby spine drop
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'phantom') {
        // Ethereal phase blade ribbons
        const ribbonLen = r * 0.7;
        const tipLX = lp.x + nx * ribbonLen - cos * (ribbonLen * 0.4);
        const tipLY = lp.y + ny * ribbonLen - sin * (ribbonLen * 0.4);
        const tipRX = rp.x - nx * ribbonLen - cos * (ribbonLen * 0.4);
        const tipRY = rp.y - ny * ribbonLen - sin * (ribbonLen * 0.4);

        ctx.fillStyle = 'rgba(129, 140, 248, 0.45)';
        ctx.strokeStyle = 'rgba(199, 210, 254, 0.6)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.quadraticCurveTo(lp.x + nx * ribbonLen, lp.y + ny * ribbonLen, tipLX, tipLY);
        ctx.lineTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x, rp.y);
        ctx.quadraticCurveTo(rp.x - nx * ribbonLen, rp.y - ny * ribbonLen, tipRX, tipRY);
        ctx.lineTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (archetype === 'dragon') {
        // Draconic dorsal ridge fin & flank scales
        const finLen = r * 0.7;
        const tipLX = lp.x + nx * (finLen * 0.6) - cos * (finLen * 0.4);
        const tipLY = lp.y + ny * (finLen * 0.6) - sin * (finLen * 0.4);
        const tipRX = rp.x - nx * (finLen * 0.6) - cos * (finLen * 0.4);
        const tipRY = rp.y - ny * (finLen * 0.6) - sin * (finLen * 0.4);

        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.2), lp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.2), rp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Continuous dragon ridge spine diamond
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'robot') {
        // Segmented titanium plating & blue heat exhausts
        const plateW = r * 0.45;
        const plateOut = r * 0.48;

        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.rect(lp.x - plateW * 0.5, lp.y - plateW * 0.5, plateOut, plateW);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(rp.x - plateOut + plateW * 0.5, rp.y - plateW * 0.5, plateOut, plateW);
        ctx.fill();
        ctx.stroke();

        // Glowing reactor exhaust slit
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(seg.x - 2, seg.y - r * 0.35, 4, r * 0.7);
      } else if (archetype === 'angel') {
        // Celestial feathered winglet plumes
        const wingLen = r * 0.72;
        const tipLX = lp.x + nx * wingLen - cos * (wingLen * 0.5);
        const tipLY = lp.y + ny * wingLen - sin * (wingLen * 0.5);
        const tipRX = rp.x - nx * wingLen - cos * (wingLen * 0.5);
        const tipRY = rp.y - ny * wingLen - sin * (wingLen * 0.5);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.quadraticCurveTo(lp.x + nx * (wingLen * 0.5), lp.y + ny * (wingLen * 0.5), tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.2), lp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.quadraticCurveTo(rp.x - nx * (wingLen * 0.5), rp.y - ny * (wingLen * 0.5), tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.2), rp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Starlight golden spine glyph
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.26, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'blackhole') {
        // Gravitational dark matter spikes
        const warpLen = r * 0.65;
        const tipLX = lp.x + nx * warpLen - cos * (warpLen * 0.5);
        const tipLY = lp.y + ny * warpLen - sin * (warpLen * 0.5);
        const tipRX = rp.x - nx * warpLen - cos * (warpLen * 0.5);
        const tipRY = rp.y - ny * warpLen - sin * (warpLen * 0.5);

        ctx.fillStyle = '#030712';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.quadraticCurveTo(lp.x + nx * (warpLen * 0.6), lp.y + ny * (warpLen * 0.6), tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.2), lp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.quadraticCurveTo(rp.x - nx * (warpLen * 0.6), rp.y - ny * (warpLen * 0.6), tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.2), rp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Singularity core
        ctx.fillStyle = '#030712';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cyber aero composite chevron fins
        const finLen = r * 0.65;
        const tipLX = lp.x + nx * finLen - cos * (finLen * 0.5);
        const tipLY = lp.y + ny * finLen - sin * (finLen * 0.5);
        const tipRX = rp.x - nx * finLen - cos * (finLen * 0.5);
        const tipRY = rp.y - ny * finLen - sin * (finLen * 0.5);

        ctx.fillStyle = '#0e7490';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(lp.x - cos * (r * 0.3), lp.y - sin * (r * 0.3));
        ctx.lineTo(tipLX, tipLY);
        ctx.lineTo(lp.x + cos * (r * 0.2), lp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rp.x - cos * (r * 0.3), rp.y - sin * (r * 0.3));
        ctx.lineTo(tipRX, tipRY);
        ctx.lineTo(rp.x + cos * (r * 0.2), rp.y + sin * (r * 0.2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Neon core dot
        ctx.fillStyle = skin.accentColor || '#38bdf8';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Sculpted archetype-specific head crests, horns, antennae, crowns, and accessories
  private drawArchetypeHeadCrest(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    skin: SkinDef,
    archetype: string,
    headR: number
  ) {
    if (archetype === 'angel') {
      // Divine Levitating Golden Angel Halo
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

      // Celestial Feathered Wings on Head/Neck
      const wingFlap = Math.sin(Date.now() * 0.009) * 0.22;
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
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(2, -22);
      ctx.stroke();
      ctx.restore();

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
    } else if (archetype === 'phoenix') {
      // 3-Plume Blazing Solar Phoenix Flame Crest
      const flicker = Math.sin(Date.now() * 0.012) * 2;
      ctx.save();
      // Center sweeping flame plume
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.2, 0);
      ctx.quadraticCurveTo(-headR * 0.8, -headR * 0.4 + flicker, -headR * 1.5, 0);
      ctx.quadraticCurveTo(-headR * 0.8, headR * 0.4 - flicker, -headR * 0.2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White-hot core in center plume
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-headR * 0.7, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Left flame plume
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-headR * 0.3, -headR * 0.3);
      ctx.quadraticCurveTo(-headR * 0.9, -headR * 0.9, -headR * 1.3, -headR * 0.6 + flicker);
      ctx.quadraticCurveTo(-headR * 0.6, -headR * 0.2, -headR * 0.3, -headR * 0.3);
      ctx.closePath();
      ctx.fill();

      // Right flame plume
      ctx.beginPath();
      ctx.moveTo(-headR * 0.3, headR * 0.3);
      ctx.quadraticCurveTo(-headR * 0.9, headR * 0.9, -headR * 1.3, headR * 0.6 - flicker);
      ctx.quadraticCurveTo(-headR * 0.6, headR * 0.2, -headR * 0.3, headR * 0.3);
      ctx.closePath();
      ctx.fill();

      // Raptor beak supraocular brow
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(headR * 0.8, -headR * 0.3);
      ctx.lineTo(headR * 1.25, 0);
      ctx.lineTo(headR * 0.8, headR * 0.3);
      ctx.stroke();
      ctx.restore();
    } else if (archetype === 'frost') {
      // Twin Jagged Glacial Icicle Horns & Frozen Diamond Brow
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.2, -headR * 0.6);
      ctx.lineTo(-headR * 0.9, -headR * 1.3);
      ctx.lineTo(-headR * 0.6, -headR * 0.9);
      ctx.lineTo(-headR * 1.2, -headR * 1.6);
      ctx.lineTo(-headR * 0.35, -headR * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-headR * 0.2, headR * 0.6);
      ctx.lineTo(-headR * 0.9, headR * 1.3);
      ctx.lineTo(-headR * 0.6, headR * 0.9);
      ctx.lineTo(-headR * 1.2, headR * 1.6);
      ctx.lineTo(-headR * 0.35, headR * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crystalline diamond brow gem
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(headR * 0.35, 0);
      ctx.lineTo(headR * 0.1, -headR * 0.25);
      ctx.lineTo(-headR * 0.15, 0);
      ctx.lineTo(headR * 0.1, headR * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (archetype === 'venom') {
      // Flared Cobra Venom Hood Frills & Dripping Fangs
      ctx.save();
      ctx.fillStyle = '#3f6212';
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.4, -headR * 0.6);
      ctx.quadraticCurveTo(-headR * 0.7, -headR * 1.2, -headR * 0.95, -headR * 0.75);
      ctx.quadraticCurveTo(-headR * 0.75, -headR * 0.3, -headR * 0.5, 0);
      ctx.quadraticCurveTo(-headR * 0.75, headR * 0.3, -headR * 0.95, headR * 0.75);
      ctx.quadraticCurveTo(-headR * 0.7, headR * 1.2, -headR * 0.4, headR * 0.6);
      ctx.stroke();

      // Dual venom fangs at snout
      ctx.fillStyle = '#86efac';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headR * 1.15, -headR * 0.2);
      ctx.lineTo(headR * 1.45, -headR * 0.28);
      ctx.lineTo(headR * 1.22, -headR * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headR * 1.15, headR * 0.2);
      ctx.lineTo(headR * 1.45, headR * 0.28);
      ctx.lineTo(headR * 1.22, headR * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Toxic forehead emblem
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(headR * 0.1, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (archetype === 'storm') {
      // Dual Tesla Lightning Conductor Prongs & Electric Arc
      ctx.save();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(-headR * 0.15, -headR * 0.7);
      ctx.lineTo(-headR * 0.6, -headR * 1.2);
      ctx.lineTo(-headR * 0.85, -headR * 1.1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-headR * 0.15, headR * 0.7);
      ctx.lineTo(-headR * 0.6, headR * 1.2);
      ctx.lineTo(-headR * 0.85, headR * 1.1);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-headR * 0.85, -headR * 1.1, 3, 0, Math.PI * 2);
      ctx.arc(-headR * 0.85, headR * 1.1, 3, 0, Math.PI * 2);
      ctx.fill();

      // Crackling electric arc between electrodes
      if (Math.random() < 0.65) {
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-headR * 0.85, -headR * 1.1);
        const midOff = (Math.random() - 0.5) * 12;
        ctx.lineTo(-headR * 0.95 + midOff, 0);
        ctx.lineTo(-headR * 0.85, headR * 1.1);
        ctx.stroke();
      }

      // Forehead lightning bolt badge
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(headR * 0.35, -headR * 0.1);
      ctx.lineTo(headR * 0.05, headR * 0.15);
      ctx.lineTo(headR * 0.12, 0);
      ctx.lineTo(-headR * 0.15, headR * 0.15);
      ctx.lineTo(headR * 0.1, -headR * 0.15);
      ctx.lineTo(headR * 0.05, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (archetype === 'phantom') {
      // Ethereal Spectral Wraith Cowl Horns
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = '#6366f1';
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1.5;

      const float = Math.sin(Date.now() * 0.007) * 4;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.2, -headR * 0.65);
      ctx.quadraticCurveTo(-headR * 0.8, -headR * 1.2 + float, -headR * 1.4, -headR * 0.9);
      ctx.quadraticCurveTo(-headR * 0.7, -headR * 0.3, -headR * 0.3, 0);
      ctx.quadraticCurveTo(-headR * 0.7, headR * 0.3, -headR * 1.4, headR * 0.9);
      ctx.quadraticCurveTo(-headR * 0.8, headR * 1.2 - float, -headR * 0.2, headR * 0.65);
      ctx.stroke();

      // Hollow void forehead wisp
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(-headR * 0.1, 0, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (archetype === 'vampire') {
      // Gothic Bat-Wing Ear Crests & Blood Ruby Forehead Gem
      ctx.save();
      ctx.fillStyle = '#450a0a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.moveTo(-headR * 0.2, -headR * 0.7);
      ctx.lineTo(-headR * 0.7, -headR * 1.35);
      ctx.quadraticCurveTo(-headR * 0.5, -headR * 1.05, -headR * 0.3, -headR * 1.15);
      ctx.quadraticCurveTo(-headR * 0.35, -headR * 0.85, -headR * 0.1, -headR * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-headR * 0.2, headR * 0.7);
      ctx.lineTo(-headR * 0.7, headR * 1.35);
      ctx.quadraticCurveTo(-headR * 0.5, headR * 1.05, -headR * 0.3, headR * 1.15);
      ctx.quadraticCurveTo(-headR * 0.35, headR * 0.85, -headR * 0.1, headR * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Elongated vampire fangs
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(headR * 1.1, -headR * 0.25);
      ctx.lineTo(headR * 1.4, -headR * 0.32);
      ctx.lineTo(headR * 1.18, -headR * 0.18);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(headR * 1.1, headR * 0.25);
      ctx.lineTo(headR * 1.4, headR * 0.32);
      ctx.lineTo(headR * 1.18, headR * 0.18);
      ctx.closePath();
      ctx.fill();

      // Blood-ruby forehead gem
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headR * 0.25, 0);
      ctx.lineTo(headR * 0.05, -headR * 0.2);
      ctx.lineTo(-headR * 0.12, 0);
      ctx.lineTo(headR * 0.05, headR * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (archetype === 'chrono') {
      // Clockwork Pendulum Dial & Rotating Cog Horns
      ctx.save();
      const tickAngle = (Date.now() * 0.003) % (Math.PI * 2);

      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(tickAngle) * (headR * 0.3), Math.sin(tickAngle) * (headR * 0.3));
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(tickAngle * 0.2) * (headR * 0.2), Math.sin(tickAngle * 0.2) * (headR * 0.2));
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-headR * 0.3, -headR * 0.75, headR * 0.28, 0, Math.PI * 2);
      ctx.arc(-headR * 0.3, headR * 0.75, headR * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (archetype === 'ninja') {
      // Shinobi Forehead Protector Plate & Red Fluttering Scarf Streamers
      ctx.save();
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(headR * 0.1, -headR * 0.35, headR * 0.28, headR * 0.7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headR * 0.24, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      const scarfWave1 = Math.sin(Date.now() * 0.015) * 5;
      const scarfWave2 = Math.cos(Date.now() * 0.015) * 5;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-headR * 0.65, -3);
      ctx.quadraticCurveTo(-headR * 1.1, -8 + scarfWave1, -headR * 1.6, -14 + scarfWave2);
      ctx.lineTo(-headR * 1.5, -9 + scarfWave2);
      ctx.quadraticCurveTo(-headR * 1.0, -4 + scarfWave1, -headR * 0.65, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-headR * 0.65, 0);
      ctx.quadraticCurveTo(-headR * 1.1, 8 - scarfWave2, -headR * 1.7, 12 - scarfWave1);
      ctx.lineTo(-headR * 1.55, 7 - scarfWave1);
      ctx.quadraticCurveTo(-headR * 1.0, 4 - scarfWave2, -headR * 0.65, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (archetype === 'crystal') {
      // 5-Spike Faceted Diamond Crystal Crown
      ctx.save();
      const crownSpikes = [
        { angle: -0.65, len: headR * 1.25, w: 5 },
        { angle: -0.32, len: headR * 1.45, w: 6 },
        { angle: 0, len: headR * 1.6, w: 7 },
        { angle: 0.32, len: headR * 1.45, w: 6 },
        { angle: 0.65, len: headR * 1.25, w: 5 },
      ];

      for (const sp of crownSpikes) {
        ctx.save();
        ctx.translate(-headR * 0.2, 0);
        ctx.rotate(sp.angle);

        ctx.fillStyle = '#0891b2';
        ctx.beginPath();
        ctx.moveTo(0, -sp.w);
        ctx.lineTo(-sp.len, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-sp.len, 0);
        ctx.lineTo(0, sp.w);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-sp.len, 0);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    } else if (archetype === 'alien') {
      // Swept-Back Xenomorph Cranial Carapace & Bio-Luminescent Antennae
      ctx.save();
      ctx.fillStyle = '#022c22';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.3, -headR * 0.55);
      ctx.quadraticCurveTo(-headR * 1.1, -headR * 0.45, -headR * 1.65, 0);
      ctx.quadraticCurveTo(-headR * 1.1, headR * 0.45, -headR * 0.3, headR * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.2;
      for (let b = 1; b <= 3; b++) {
        const bx = -headR * (0.4 + b * 0.3);
        ctx.beginPath();
        ctx.moveTo(bx, -headR * 0.35);
        ctx.lineTo(bx, headR * 0.35);
        ctx.stroke();
      }

      const antWiggle = Math.sin(Date.now() * 0.008) * 3;
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headR * 0.3, -headR * 0.5);
      ctx.quadraticCurveTo(headR * 0.7, -headR * 0.95 + antWiggle, headR * 1.05, -headR * 0.8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headR * 0.3, headR * 0.5);
      ctx.quadraticCurveTo(headR * 0.7, headR * 0.95 - antWiggle, headR * 1.05, headR * 0.8);
      ctx.stroke();

      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.arc(headR * 1.05, -headR * 0.8, 3.2, 0, Math.PI * 2);
      ctx.arc(headR * 1.05, headR * 0.8, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (archetype === 'blackhole') {
      // Accretion Disk Rings & Photon Sphere
      ctx.save();
      const spin = (Date.now() * 0.004) % (Math.PI * 2);
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

      ctx.fillStyle = '#030712';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (archetype === 'robot') {
      // Hydraulic Comms Antennas & Mecha Plates
      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.3, -headR * 0.7);
      ctx.lineTo(-headR * 0.7, -headR * 1.35);
      ctx.moveTo(-headR * 0.3, headR * 0.7);
      ctx.lineTo(-headR * 0.7, headR * 1.35);
      ctx.stroke();

      ctx.fillStyle = Math.floor(Date.now() / 250) % 2 === 0 ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(-headR * 0.7, -headR * 1.35, 3, 0, Math.PI * 2);
      ctx.arc(-headR * 0.7, headR * 1.35, 3, 0, Math.PI * 2);
      ctx.fill();

      // Center Laser Optic Scanner
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(headR * 0.42, -headR * 0.15, 3, headR * 0.3);
      ctx.restore();
    } else if (archetype === 'dragon') {
      // Draconic Crest Horns, Whiskers & Spines
      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#022c22';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.4, 0);
      ctx.lineTo(-headR * 1.1, -14);
      ctx.lineTo(-headR * 0.75, 0);
      ctx.lineTo(-headR * 1.1, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const whiskerWiggle = Math.sin(Date.now() * 0.009) * 4;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headR * 1.1, -headR * 0.2);
      ctx.quadraticCurveTo(headR * 1.5, -headR * 0.6 + whiskerWiggle, headR * 1.7, -headR * 0.3);
      ctx.moveTo(headR * 1.1, headR * 0.2);
      ctx.quadraticCurveTo(headR * 1.5, headR * 0.6 - whiskerWiggle, headR * 1.7, headR * 0.3);
      ctx.stroke();
      ctx.restore();
    } else {
      // Cyber Tactical HUD Visor & Aero Canopy Ridge
      ctx.save();
      ctx.strokeStyle = skin.accentColor || '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.4, 0);
      ctx.lineTo(headR * 0.4, 0);
      ctx.stroke();

      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.rect(headR * 0.15, -headR * 0.3, headR * 0.25, headR * 0.6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draw a Snake in authentic 3D glossy rounded "Snake.io" Art Style (Zero-Transform Fast Path)
  public drawSnake(snake: Snake) {
    if (snake.isDead || snake.segments.length === 0) return;

    const head = snake.segments[0];
    const { minX, maxX, minY, maxY } = this.viewport;
    if (!snake.isPlayer) {
      if (snake.minX !== undefined && snake.maxX !== undefined && snake.minY !== undefined && snake.maxY !== undefined) {
        if (snake.maxX < minX - 100 || snake.minX > maxX + 100 || snake.maxY < minY - 100 || snake.minY > maxY + 100) {
          return;
        }
      } else {
        const tail = snake.segments[snake.segments.length - 1];
        const botMinX = Math.min(head.x, tail.x);
        const botMaxX = Math.max(head.x, tail.x);
        const botMinY = Math.min(head.y, tail.y);
        const botMaxY = Math.max(head.y, tail.y);
        if (botMaxX < minX - 120 || botMinX > maxX + 120 || botMaxY < minY - 120 || botMinY > maxY + 120) {
          return;
        }
      }
    }

    const ctx = this.ctx;
    const skin = getSkinById(snake.skinId);
    const archetype = skin.archetype || snake.archetype || 'cyber';
    const isPhasing = !!(snake.isPhasing || (archetype === 'phantom' && (snake.abilityActiveTimer || 0) > 0));

    // Phasing and bio-luminescent aura wrapper
    ctx.save();
    if (isPhasing) {
      ctx.globalAlpha = 0.38;
    }

    // Base segment radius (scales gracefully with score/length)
    const baseRadius = 13 + Math.min(snake.length * 0.12, 10);
    const totalSegs = snake.segments.length;
    if (totalSegs < 2) {
      ctx.restore();
      return;
    }

    // 0. Compute Organic Taper Radii & Tangent Normals along the Serpentine Spine
    // An actual snake has a neck constriction behind the broad viper head,
    // a strong muscular chest/torso, and tapers smoothly to a slender pointed tail tip.
    const segRadii: number[] = new Array(totalSegs);
    for (let i = 0; i < totalSegs; i++) {
      if (i === 0) {
        segRadii[i] = baseRadius * 1.05;
      } else if (i <= 3) {
        // Muscular torso / hood behind the neck
        const t = i / 3;
        segRadii[i] = baseRadius * (0.96 + t * 0.12);
      } else {
        // Continuous organic taper down to a sleek pointed tail tip
        const t = (i - 3) / Math.max(1, totalSegs - 4);
        const taperFactor = Math.pow(1 - t, 0.88);
        segRadii[i] = Math.max(2.8, baseRadius * 1.08 * (0.16 + 0.84 * taperFactor));
      }
    }

    // Precalculate spine tangents, normals, and left/right skin contours
    const leftPoints: Array<{ x: number; y: number }> = new Array(totalSegs);
    const rightPoints: Array<{ x: number; y: number }> = new Array(totalSegs);
    const segAngles: number[] = new Array(totalSegs);

    for (let i = 0; i < totalSegs; i++) {
      const cur = snake.segments[i];
      let dx = 0;
      let dy = 0;

      if (i === 0) {
        const next = snake.segments[1];
        dx = cur.x - next.x;
        dy = cur.y - next.y;
      } else if (i === totalSegs - 1) {
        const prev = snake.segments[i - 1];
        dx = prev.x - cur.x;
        dy = prev.y - cur.y;
      } else {
        const prev = snake.segments[i - 1];
        const next = snake.segments[i + 1];
        dx = prev.x - next.x;
        dy = prev.y - next.y;
      }

      let len = Math.hypot(dx, dy);
      if (len < 0.001) {
        dx = Math.cos(cur.angle || 0);
        dy = Math.sin(cur.angle || 0);
        len = 1;
      }

      const angle = Math.atan2(dy, dx);
      segAngles[i] = angle;

      // Normal perpendicular to spine (pointing left of movement direction)
      const nx = -dy / len;
      const ny = dx / len;
      const r = segRadii[i];

      leftPoints[i] = { x: cur.x + nx * r, y: cur.y + ny * r };
      rightPoints[i] = { x: cur.x - nx * r, y: cur.y - ny * r };
    }

    // Adaptive spline decimation for large snakes to eliminate framedrops
    const splineIndices: number[] = [];
    const splineStep = totalSegs > 80 ? 3 : totalSegs > 35 ? 2 : 1;
    for (let i = 0; i < totalSegs; i++) {
      if (i <= 3 || i >= totalSegs - 2 || i % splineStep === 0) {
        splineIndices.push(i);
      }
    }
    const splineCount = splineIndices.length;

    // Direction pointing backwards away from the tail
    const tailSeg = snake.segments[totalSegs - 1];
    const prevTailSeg = snake.segments[Math.max(0, totalSegs - 2)];
    const tailExhaustAngle = Math.atan2(tailSeg.y - prevTailSeg.y, tailSeg.x - prevTailSeg.x);
    const tailR = segRadii[totalSegs - 1];
    const tailTipDist = tailR * 1.6;
    const tailTipX = tailSeg.x + Math.cos(tailExhaustAngle) * tailTipDist;
    const tailTipY = tailSeg.y + Math.sin(tailExhaustAngle) * tailTipDist;

    // 1. BOOST THRUSTER AT THE TAIL!
    // User requirement: "Also if i click the boost make the boost is at the tail."
    if (snake.isBoosting) {
      ctx.save();
      ctx.translate(tailTipX, tailTipY);
      ctx.rotate(tailExhaustAngle);

      const flicker = Math.sin(Date.now() * 0.045 + (snake.id.charCodeAt(0) || 0)) * 5;
      const flameLen = 32 + baseRadius * 1.4 + flicker + Math.random() * 8;
      const flameW = Math.max(9, tailR * 2.6);

      // Pulsing thrust shockwave diamond rings drifting backwards
      const pulsePhase = (Date.now() * 0.009) % 1;
      for (let ring = 0; ring < 2; ring++) {
        const ringT = (pulsePhase + ring * 0.5) % 1;
        const ringX = ringT * flameLen * 0.85;
        const ringAlpha = (1 - ringT) * 0.7;
        ctx.strokeStyle = skin.accentColor || '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = ringAlpha;
        ctx.beginPath();
        ctx.ellipse(ringX, 0, 3, flameW * (0.35 + ringT * 0.45), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer roaring jet flame
      const grad = ctx.createLinearGradient(0, 0, flameLen, 0);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.35, '#facc15');
      grad.addColorStop(0.75, '#38bdf8');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.globalAlpha = 0.88;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -flameW * 0.5);
      ctx.quadraticCurveTo(flameLen * 0.45, -flameW * 0.65, flameLen, 0);
      ctx.quadraticCurveTo(flameLen * 0.45, flameW * 0.65, 0, flameW * 0.5);
      ctx.closePath();
      ctx.fill();

      // Blistering white-hot inner energy core
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -flameW * 0.22);
      ctx.lineTo(flameLen * 0.55, 0);
      ctx.lineTo(0, flameW * 0.22);
      ctx.closePath();
      ctx.fill();

      // Exhaust nozzle ring at tail tip
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = skin.accentColor || '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(3.5, tailR * 1.1), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // 1.5 Balanced Controlled Ambient Aura ("Glowing but not too glowy")
    this.drawSnakeControlledAura(
      ctx,
      snake,
      skin,
      archetype,
      leftPoints,
      rightPoints,
      splineIndices,
      splineCount,
      tailTipX,
      tailTipY,
      baseRadius
    );

    // 2. Continuous Organic Underbelly Ground Shadow (using optimized spline sampling)
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.45)';
    const shadowOffX = baseRadius * 0.15;
    const shadowOffY = baseRadius * 0.26;
    ctx.beginPath();
    const firstIdx = splineIndices[0];
    ctx.moveTo(leftPoints[firstIdx].x + shadowOffX, leftPoints[firstIdx].y + shadowOffY);
    for (let k = 1; k < splineCount; k++) {
      const prev = leftPoints[splineIndices[k - 1]];
      const cur = leftPoints[splineIndices[k]];
      const midX = (prev.x + cur.x) * 0.5 + shadowOffX;
      const midY = (prev.y + cur.y) * 0.5 + shadowOffY;
      ctx.quadraticCurveTo(prev.x + shadowOffX, prev.y + shadowOffY, midX, midY);
    }
    ctx.lineTo(tailTipX + shadowOffX, tailTipY + shadowOffY);
    for (let k = splineCount - 1; k >= 1; k--) {
      const prev = rightPoints[splineIndices[k]];
      const next = rightPoints[splineIndices[k - 1]];
      const midX = (prev.x + next.x) * 0.5 + shadowOffX;
      const midY = (prev.y + next.y) * 0.5 + shadowOffY;
      ctx.quadraticCurveTo(prev.x + shadowOffX, prev.y + shadowOffY, midX, midY);
    }
    ctx.lineTo(rightPoints[firstIdx].x + shadowOffX, rightPoints[firstIdx].y + shadowOffY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Continuous Seamless Serpentine Body Contour (No disconnected circles or square blocks!)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(leftPoints[firstIdx].x, leftPoints[firstIdx].y);
    for (let k = 1; k < splineCount; k++) {
      const prev = leftPoints[splineIndices[k - 1]];
      const cur = leftPoints[splineIndices[k]];
      const midX = (prev.x + cur.x) * 0.5;
      const midY = (prev.y + cur.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    // Sleek pointed tail tip
    ctx.lineTo(tailTipX, tailTipY);
    for (let k = splineCount - 1; k >= 1; k--) {
      const prev = rightPoints[splineIndices[k]];
      const next = rightPoints[splineIndices[k - 1]];
      const midX = (prev.x + next.x) * 0.5;
      const midY = (prev.y + next.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.lineTo(rightPoints[firstIdx].x, rightPoints[firstIdx].y);
    ctx.closePath();

    // Main continuous skin fill
    ctx.fillStyle = skin.primaryColor;
    ctx.fill();

    // Subtle 3D serpent body boundary rim
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // 3.5 Unique Archetype Body Spikes, Fins, Crystals, Horns & Dorsal Plates
    this.drawArchetypeBodySpikes(
      ctx,
      snake,
      skin,
      archetype,
      segRadii,
      segAngles,
      leftPoints,
      rightPoints,
      totalSegs
    );

    // 4. Authentic Snake Markings & Scales along the Continuous Body
    // 4.1 Ventral Underbelly Pale Scutes / Plates
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(snake.segments[0].x, snake.segments[0].y);
    for (let k = 1; k < splineCount - 1; k++) {
      const p1 = snake.segments[splineIndices[k - 1]];
      const p2 = snake.segments[splineIndices[k]];
      const midX = (p1.x + p2.x) * 0.5;
      const midY = (p1.y + p2.y) * 0.5;
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    ctx.strokeStyle = skin.secondaryColor;
    ctx.lineWidth = baseRadius * 0.5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.restore();

    // 4.2 Dorsal Diamondback / Chevron Saddle Scales & Archetype Texture (Zero-Transform Fast Path)
    // Avoids hundreds of ctx.save/restore calls per frame to eliminate lag
    const scaleStep = totalSegs > 80 ? 3 : totalSegs > 35 ? 2 : 1;
    for (let i = 1; i < totalSegs - 1; i += scaleStep) {
      const seg = snake.segments[i];
      const r = segRadii[i];
      const ang = segAngles[i];
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);

      // Authentic Reptilian Diamondback Scale Saddle computed directly in world space
      const diamondLen = r * 0.95;
      const diamondW = r * 0.72;
      const halfL = diamondLen * 0.55;
      const halfW = diamondW * 0.5;

      ctx.fillStyle = i % 2 === 0 ? skin.secondaryColor : (skin.accentColor || skin.primaryColor);
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      // Back vertex
      ctx.moveTo(seg.x - halfL * cos, seg.y - halfL * sin);
      // Right vertex
      ctx.lineTo(seg.x + halfW * sin, seg.y - halfW * cos);
      // Front vertex
      ctx.lineTo(seg.x + halfL * cos, seg.y + halfL * sin);
      // Left vertex
      ctx.lineTo(seg.x - halfW * sin, seg.y + halfW * cos);
      ctx.closePath();
      ctx.fill();

      // Archetype Spine Specialization
      if (archetype === 'dragon') {
        ctx.fillStyle = '#facc15';
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'angel') {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.26, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'devil') {
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#f97316';
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (archetype === 'robot') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(seg.x - halfL * 0.8 * cos, seg.y - halfL * 0.8 * sin);
        ctx.lineTo(seg.x + halfL * 0.8 * cos, seg.y + halfL * 0.8 * sin);
        ctx.stroke();
      } else if (archetype === 'blackhole') {
        ctx.fillStyle = '#030712';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = skin.coreGlow;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }

      // Transverse Ventral Plate Groove
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(seg.x - r * 0.65 * sin, seg.y + r * 0.65 * cos);
      ctx.lineTo(seg.x + r * 0.65 * sin, seg.y - r * 0.65 * cos);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 4.3 Smooth 3D Cylindrical Dorsal Sheen (Glossy spine highlight)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(snake.segments[0].x, snake.segments[0].y);
    for (let k = 1; k < splineCount - 1; k++) {
      const p1 = snake.segments[splineIndices[k - 1]];
      const p2 = snake.segments[splineIndices[k]];
      const midX = (p1.x + p2.x) * 0.5;
      const midY = (p1.y + p2.y) * 0.5;
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = baseRadius * 0.28;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.22;
    ctx.stroke();
    ctx.restore();

    // 5. Authentic Sculpted Viper / Serpent Head
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    const headR = baseRadius * 1.35;

    // 5.1 Animated Forked Tongue (Bifid tongue flicks out to sample scents!)
    const tongueCycle = (Date.now() + (snake.id.charCodeAt(0) || 0) * 120) % 2200;
    if (tongueCycle < 680) {
      const tProgress = tongueCycle < 340 ? tongueCycle / 340 : (680 - tongueCycle) / 340;
      const tongueReach = headR * (0.7 + tProgress * 0.95);
      const tongueStart = headR * 1.32;
      const quiver = Math.sin(Date.now() * 0.05) * 2;

      ctx.save();
      ctx.strokeStyle = '#e11d48'; // deep serpent crimson
      ctx.fillStyle = '#e11d48';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tongueStart, 0);
      const forkBase = tongueStart + tongueReach * 0.62;
      ctx.lineTo(forkBase, quiver);

      // Bifurcated forked tines
      const forkSpread = headR * 0.32 * tProgress;
      const tineLen = tongueReach * 0.38;
      ctx.lineTo(forkBase + tineLen, quiver - forkSpread);
      ctx.moveTo(forkBase, quiver);
      ctx.lineTo(forkBase + tineLen, quiver + forkSpread);
      ctx.stroke();
      ctx.restore();
    }

    // 5.2 Sculpted Viper Skull Silhouette (Wedge-shaped with broad venom cheek lobes and tapered snout)
    ctx.beginPath();
    // Snout rostral tip
    ctx.moveTo(headR * 1.35, 0);
    // Upper snout to supraocular eye brow
    ctx.quadraticCurveTo(headR * 1.15, -headR * 0.38, headR * 0.55, -headR * 0.58);
    // Supraocular flare above eye
    ctx.quadraticCurveTo(headR * 0.2, -headR * 0.74, -headR * 0.15, -headR * 0.84);
    // Broad posterior venom gland cheek lobe
    ctx.quadraticCurveTo(-headR * 0.55, -headR * 0.8, -headR * 0.72, -headR * 0.42);
    // Neck constriction base
    ctx.quadraticCurveTo(-headR * 0.82, -headR * 0.15, -headR * 0.82, 0);
    // Lower half (symmetrical)
    ctx.quadraticCurveTo(-headR * 0.82, headR * 0.15, -headR * 0.72, headR * 0.42);
    ctx.quadraticCurveTo(-headR * 0.55, headR * 0.8, -headR * 0.15, headR * 0.84);
    ctx.quadraticCurveTo(headR * 0.2, headR * 0.74, headR * 0.55, headR * 0.58);
    ctx.quadraticCurveTo(headR * 1.15, headR * 0.38, headR * 1.35, 0);
    ctx.closePath();

    // Fill authentic viper skull
    ctx.fillStyle = skin.primaryColor;
    ctx.fill();

    // Viper jawline & skull rim outline
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5.3 Crown Armor Shield Plates (Frontal and Parietal Scales)
    ctx.save();
    ctx.strokeStyle = skin.accentColor || skin.secondaryColor;
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.45;
    // Frontal crown scale
    ctx.beginPath();
    ctx.moveTo(headR * 0.7, 0);
    ctx.lineTo(headR * 0.2, -headR * 0.32);
    ctx.lineTo(-headR * 0.3, -headR * 0.25);
    ctx.lineTo(-headR * 0.45, 0);
    ctx.lineTo(-headR * 0.3, headR * 0.25);
    ctx.lineTo(headR * 0.2, headR * 0.32);
    ctx.closePath();
    ctx.stroke();

    // Snout dorsal ridge
    ctx.beginPath();
    ctx.moveTo(headR * 0.7, 0);
    ctx.lineTo(headR * 1.25, 0);
    ctx.stroke();
    ctx.restore();

    // 5.4 Dual Nostrils / Loreal Pit Organs
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(headR * 1.05, -headR * 0.22, headR * 0.075, 0, Math.PI * 2);
    ctx.arc(headR * 1.05, headR * 0.22, headR * 0.075, 0, Math.PI * 2);
    ctx.fill();

    // Head 3D Specular Highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.24;
    ctx.beginPath();
    ctx.ellipse(headR * 0.1, -headR * 0.22, headR * 0.65, headR * 0.32, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 5.5 Menacing Reptilian Predator Eyes (Slit pupils & hooded supraocular brow)
    const aimAngle = snake.aimAngle !== undefined ? snake.aimAngle : head.angle;
    const relGaze = aimAngle - head.angle;
    const gazeDist = headR * 0.1;
    const pupilOffX = Math.cos(relGaze) * gazeDist + headR * 0.04;
    const pupilOffY = Math.sin(relGaze) * gazeDist;

    const eyeOffsetX = headR * 0.34;
    const eyeOffsetY = headR * 0.54;
    const eyeRadiusX = headR * 0.34;
    const eyeRadiusY = headR * 0.24;

    [-eyeOffsetY, eyeOffsetY].forEach((eyeY, eyeIdx) => {
      const isLeft = eyeIdx === 0;
      const eyeSlant = isLeft ? -0.2 : 0.2;

      ctx.save();
      ctx.translate(eyeOffsetX, eyeY);
      ctx.rotate(eyeSlant);

      // Almond Reptilian Eye Socket Sclera
      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vibrant Glowing Predator Iris
      const irisGrad = ctx.createRadialGradient(pupilOffX * 0.5, pupilOffY * 0.5, 1, 0, 0, eyeRadiusX);
      irisGrad.addColorStop(0, skin.eyeColor || skin.accentColor || '#facc15');
      irisGrad.addColorStop(0.7, skin.accentColor || '#eab308');
      irisGrad.addColorStop(1, '#0b0f19');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeRadiusX * 0.88, eyeRadiusY * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slit Reptilian Predator Pupil (oriented vertically like a true viper/cobra)
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      const pX = Math.max(-eyeRadiusX * 0.35, Math.min(eyeRadiusX * 0.35, pupilOffX));
      const pY = Math.max(-eyeRadiusY * 0.35, Math.min(eyeRadiusY * 0.35, pupilOffY));
      ctx.ellipse(pX, pY, eyeRadiusX * 0.22, eyeRadiusY * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glossy corneal specular reflection
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(pX - eyeRadiusX * 0.22, pY - eyeRadiusY * 0.3, eyeRadiusX * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Heavy Hooded Supraocular Brow Scale Ridge
      ctx.strokeStyle = skin.accentColor || skin.secondaryColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      const browDir = isLeft ? -1 : 1;
      ctx.arc(0, browDir * eyeRadiusY * 0.25, eyeRadiusX * 1.12, browDir > 0 ? 0.3 : -1.85, browDir > 0 ? 1.85 : -0.3);
      ctx.stroke();

      ctx.restore();
    });

    // 2.4 Archetype Specific Sculpted Head Adornments (Horns, Crests, Cowls, Halos, Antennae)
    this.drawArchetypeHeadCrest(ctx, snake, skin, archetype, headR);

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

    // 3.5 Render Archetype Active Ability Visual Auras
    if ((snake.abilityActiveTimer || 0) > 0) {
      ctx.save();
      const archetype = snake.archetype || 'cyber';
      const headR = 17;

      if (archetype === 'angel') {
        // Angel Divine Shield Halo Bubble
        const pulse = Math.sin(Date.now() * 0.01) * 3;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.18)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 18 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Halo Ring tilted above head
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(head.x, head.y - headR - 12, 16, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (archetype === 'devil') {
        // Devil Hellfire Burst Fiery Orbiting Ring
        const rot = (Date.now() * 0.005) % (Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        // Flame spurs
        for (let sp = 0; sp < 6; sp++) {
          const spAngle = rot + (sp * Math.PI) / 3;
          const sx = head.x + Math.cos(spAngle) * (headR + 24);
          const sy = head.y + Math.sin(spAngle) * (headR + 24);
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (archetype === 'blackhole') {
        // Singularity Void Aura
        const rot = (Date.now() * -0.004) % (Math.PI * 2);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 9;
        ctx.fillStyle = 'rgba(88, 28, 135, 0.2)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 15, rot, rot + Math.PI);
        ctx.stroke();
      } else if (archetype === 'robot') {
        // Robot Overclock Turbine Plasma Ring
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (archetype === 'dragon') {
        // Dragon Flame Breath Active Fiery Head Glow
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (archetype === 'chrono') {
        // Chrono Time Dilation Bubble with Clock-Gear Visuals
        const rot = (Date.now() * 0.003) % (Math.PI * 2);
        const chronoR = 75;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, chronoR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Outer rotating gear teeth
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(rot);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (chronoR - 8), Math.sin(a) * (chronoR - 8));
          ctx.lineTo(Math.cos(a) * (chronoR + 6), Math.sin(a) * (chronoR + 6));
          ctx.stroke();
        }
        ctx.restore();
      } else if (archetype === 'crystal') {
        // Crystal Prismatic Reflection Shield
        const rot = (Date.now() * 0.004) % (Math.PI * 2);
        const cryR = headR + 20;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 9;
        ctx.fillStyle = 'rgba(34, 211, 238, 0.16)';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = rot + (i * Math.PI) / 3;
          const x = head.x + Math.cos(a) * cryR;
          const y = head.y + Math.sin(a) * cryR;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (archetype === 'vampire') {
        // Vampire Crimson Swirl
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#991b1b';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (archetype === 'storm') {
        // Storm Electric Surge
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 9;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.16)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (archetype === 'alien') {
        // Alien Bio-Luminescent Acid Surge
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 9;
        ctx.fillStyle = 'rgba(132, 204, 22, 0.18)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, headR + 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // Cyber Decoy Hologram Rendering
    if (snake.decoyTimer && snake.decoyTimer > 0 && snake.decoyX !== undefined && snake.decoyY !== undefined) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.75, snake.decoyTimer / 1.5);
      ctx.translate(snake.decoyX, snake.decoyY);
      ctx.rotate(snake.decoyAngle || 0);

      // Holographic head decoy
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hologram scan lines
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 9px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('[DECOY]', 0, -22);

      ctx.restore();
    }

    // Restore body phasing / alien glow wrapper before drawing UI elements
    ctx.restore();

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
