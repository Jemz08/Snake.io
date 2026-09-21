import {
  Snake,
  FoodItem,
  LootItem,
  ShieldPowerup,
  MapObstacle,
  Projectile,
  ExplosionEffect,
  Particle,
  DamagePopup,
  KillNotification,
  WeaponType,
  DeathEffectType,
} from '../types';
import { WEAPONS, getWeaponConfig } from '../utils/weapons';
import {
  playShootSound,
  playExplosionSound,
  playEatSound,
  playLootPickupSound,
  playKillSound,
  playCashSound,
  playDeathEffectSound,
  playShieldPickupSound,
  playShieldDeflectSound,
  playObstacleHitSound,
} from '../utils/audio';
import { SKINS, getSkinById } from '../utils/skins';
import { DEATH_EFFECTS } from '../utils/deathEffects';
import { updateMissionProgress } from '../utils/missions';
import { recordPlayerScore } from '../utils/leaderboard';

const WORLD_SIZE = 5600;
const MAX_FOOD = 300;
const MAX_LOOT = 24;
const MAX_SHIELDS = 14;
const BOT_COUNT = 24;

const BOT_NAMES = [
  'AeroViper',
  'Mecha-X',
  'Apex-9',
  'GlitchFang',
  'IronHydra',
  'VoltSurge',
  'Phantom²',
  'Slayer-01',
  'NeonBite',
  'CyberWorm',
  'TitanMech',
  'ShadowCobra',
  'NullPointer',
  'CryoStalker',
  'RazorBack',
  'QuantumFang',
  'DarkByte',
  'Vortex-7',
  'PulseReaper',
  'OmegaSerpent',
  'ByteVenom',
  'Warhound-X',
  'ZeroCool',
  'Hyperion-0',
  'VectorStriker',
  'SolarRaptor',
  'ExoGoliath',
  'Spectre-X',
];

export class GameEngine {
  public worldSize = WORLD_SIZE;
  public snakes: Snake[] = [];
  public foods: FoodItem[] = [];
  public loots: LootItem[] = [];
  public shields: ShieldPowerup[] = [];
  public obstacles: MapObstacle[] = [];
  public projectiles: Projectile[] = [];
  public explosions: ExplosionEffect[] = [];
  public particles: Particle[] = [];
  public damagePopups: DamagePopup[] = [];
  public killFeed: KillNotification[] = [];

  private nextEntityId = 1;
  public playerSnake: Snake | null = null;
  public onPlayerDeath?: (stats: { score: number; kills: number; coins: number; length: number }) => void;
  public onKill?: (victim: string, weapon: WeaponType, cashEarned: number) => void;
  public onCashEarned?: (amount: number, reason: string) => void;

  private isRunning = false;
  private lastTime = 0;
  private animFrameId: number | null = null;

  constructor() {
    this.initWorld();
  }

  public initWorld() {
    this.foods = [];
    this.loots = [];
    this.shields = [];
    this.projectiles = [];
    this.explosions = [];
    this.particles = [];
    this.damagePopups = [];
    this.killFeed = [];

    // Initialize battlefield defensive obstacles
    this.initObstacles();

    // Spawn initial food across the expanded map
    for (let i = 0; i < MAX_FOOD; i++) {
      this.spawnFood();
    }

    // Spawn initial loot crates
    for (let i = 0; i < MAX_LOOT; i++) {
      this.spawnLoot();
    }

    // Spawn initial shield powerups
    for (let i = 0; i < MAX_SHIELDS; i++) {
      this.spawnShield();
    }
  }

  public initObstacles() {
    this.obstacles = [];
    const C = WORLD_SIZE / 2; // Central coords (2800)

    // 1. Central Citadel:
    // Core titanium bunker
    this.obstacles.push({
      id: this.nextEntityId++,
      x: C,
      y: C,
      shape: 'circle',
      radius: 80,
      type: 'titanium_bunker',
      color: '#1e293b',
      borderColor: '#38bdf8',
      glowColor: '#0284c7',
      hitPulse: 0,
    });

    // 4 Corner blast barricades around central citadel
    this.obstacles.push(
      {
        id: this.nextEntityId++,
        x: C - 220,
        y: C,
        shape: 'rect',
        width: 42,
        height: 180,
        type: 'blast_barrier',
        color: '#0f172a',
        borderColor: '#06b6d4',
        glowColor: '#0891b2',
        hitPulse: 0,
      },
      {
        id: this.nextEntityId++,
        x: C + 220,
        y: C,
        shape: 'rect',
        width: 42,
        height: 180,
        type: 'blast_barrier',
        color: '#0f172a',
        borderColor: '#06b6d4',
        glowColor: '#0891b2',
        hitPulse: 0,
      },
      {
        id: this.nextEntityId++,
        x: C,
        y: C - 220,
        shape: 'rect',
        width: 180,
        height: 42,
        type: 'blast_barrier',
        color: '#0f172a',
        borderColor: '#06b6d4',
        glowColor: '#0891b2',
        hitPulse: 0,
      },
      {
        id: this.nextEntityId++,
        x: C,
        y: C + 220,
        shape: 'rect',
        width: 180,
        height: 42,
        type: 'blast_barrier',
        color: '#0f172a',
        borderColor: '#06b6d4',
        glowColor: '#0891b2',
        hitPulse: 0,
      }
    );

    // 4 Diagonal Forcefield Pillars around Citadel
    const diagOffsets = [-360, 360];
    for (const dx of diagOffsets) {
      for (const dy of diagOffsets) {
        this.obstacles.push({
          id: this.nextEntityId++,
          x: C + dx,
          y: C + dy,
          shape: 'circle',
          radius: 50,
          type: 'forcefield_pillar',
          color: '#1e1b4b',
          borderColor: '#818cf8',
          glowColor: '#6366f1',
          hitPulse: 0,
        });
      }
    }

    // 2. Cardinal Outpost Garrisons (North, South, West, East)
    const cardinalOutposts = [
      { x: C, y: C - 1400 },
      { x: C, y: C + 1400 },
      { x: C - 1400, y: C },
      { x: C + 1400, y: C },
    ];

    for (const outpost of cardinalOutposts) {
      this.obstacles.push({
        id: this.nextEntityId++,
        x: outpost.x,
        y: outpost.y,
        shape: 'circle',
        radius: 65,
        type: 'titanium_bunker',
        color: '#1e293b',
        borderColor: '#f59e0b',
        glowColor: '#d97706',
        hitPulse: 0,
      });
      // Flanking barricades
      this.obstacles.push(
        {
          id: this.nextEntityId++,
          x: outpost.x - 140,
          y: outpost.y,
          shape: 'rect',
          width: 36,
          height: 140,
          type: 'blast_barrier',
          color: '#0f172a',
          borderColor: '#f59e0b',
          glowColor: '#d97706',
          hitPulse: 0,
        },
        {
          id: this.nextEntityId++,
          x: outpost.x + 140,
          y: outpost.y,
          shape: 'rect',
          width: 36,
          height: 140,
          type: 'blast_barrier',
          color: '#0f172a',
          borderColor: '#f59e0b',
          glowColor: '#d97706',
          hitPulse: 0,
        }
      );
    }

    // 3. Quadrant Fortresses (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
    const quadrantForts = [
      { x: C - 1500, y: C - 1500 },
      { x: C + 1500, y: C - 1500 },
      { x: C - 1500, y: C + 1500 },
      { x: C + 1500, y: C + 1500 },
    ];

    for (const qf of quadrantForts) {
      this.obstacles.push({
        id: this.nextEntityId++,
        x: qf.x,
        y: qf.y,
        shape: 'circle',
        radius: 68,
        type: 'titanium_bunker',
        color: '#1e293b',
        borderColor: '#10b981',
        glowColor: '#059669',
        hitPulse: 0,
      });
      // L-shape cover walls
      this.obstacles.push(
        {
          id: this.nextEntityId++,
          x: qf.x,
          y: qf.y - 130,
          shape: 'rect',
          width: 150,
          height: 34,
          type: 'blast_barrier',
          color: '#0f172a',
          borderColor: '#10b981',
          glowColor: '#059669',
          hitPulse: 0,
        },
        {
          id: this.nextEntityId++,
          x: qf.x - 130,
          y: qf.y,
          shape: 'rect',
          width: 34,
          height: 150,
          type: 'blast_barrier',
          color: '#0f172a',
          borderColor: '#10b981',
          glowColor: '#059669',
          hitPulse: 0,
        }
      );
    }

    // 4. Sector Defense Pillars scattered across mid-range lanes
    const scatteredPillars = [
      { x: C - 750, y: C - 750 },
      { x: C + 750, y: C - 750 },
      { x: C - 750, y: C + 750 },
      { x: C + 750, y: C + 750 },
      { x: C - 2100, y: C - 750 },
      { x: C + 2100, y: C - 750 },
      { x: C - 2100, y: C + 750 },
      { x: C + 2100, y: C + 750 },
      { x: C - 750, y: C - 2100 },
      { x: C + 750, y: C - 2100 },
      { x: C - 750, y: C + 2100 },
      { x: C + 750, y: C + 2100 },
    ];

    for (const p of scatteredPillars) {
      this.obstacles.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y,
        shape: 'circle',
        radius: 46,
        type: 'forcefield_pillar',
        color: '#1e1b4b',
        borderColor: '#a855f7',
        glowColor: '#9333ea',
        hitPulse: 0,
      });
    }

    // 5. Perimeter Blast Defense walls (for snipers to take cover near the edge)
    const edgeWalls = [
      { x: C, y: 350, w: 220, h: 36 },
      { x: C, y: WORLD_SIZE - 350, w: 220, h: 36 },
      { x: 350, y: C, w: 36, h: 220 },
      { x: WORLD_SIZE - 350, y: C, w: 36, h: 220 },
    ];
    for (const ew of edgeWalls) {
      this.obstacles.push({
        id: this.nextEntityId++,
        x: ew.x,
        y: ew.y,
        shape: 'rect',
        width: ew.w,
        height: ew.h,
        type: 'blast_barrier',
        color: '#0f172a',
        borderColor: '#f43f5e',
        glowColor: '#e11d48',
        hitPulse: 0,
      });
    }
  }

  public start(playerName: string, playerSkinId: string, playerDeathEffectId: DeathEffectType = 'cyber-matrix') {
    this.initWorld();
    this.snakes = [];

    // Create Player Snake
    const startX = WORLD_SIZE / 2 + (Math.random() * 400 - 200);
    const startY = WORLD_SIZE / 2 + (Math.random() * 400 - 200);
    const startAngle = Math.random() * Math.PI * 2;

    this.playerSnake = this.createSnake(
      'player',
      playerName || 'Player²',
      true,
      playerSkinId,
      startX,
      startY,
      startAngle,
      playerDeathEffectId
    );
    this.snakes.push(this.playerSnake);

    // Create Initial Bots
    for (let i = 0; i < BOT_COUNT; i++) {
      this.spawnBot(i);
    }

    this.isRunning = true;
    this.lastTime = performance.now();

    // Track daily missions for deploying into arena
    updateMissionProgress('play_games', 1);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private createSnake(
    id: string,
    name: string,
    isPlayer: boolean,
    skinId: string,
    x: number,
    y: number,
    angle: number,
    deathEffectId: DeathEffectType = 'cyber-matrix'
  ): Snake {
    const skin = getSkinById(skinId);
    const initialLen = 12;
    const segments = [];
    const segSpacing = 16;

    for (let i = 0; i < initialLen; i++) {
      segments.push({
        x: x - Math.cos(angle) * i * segSpacing,
        y: y - Math.sin(angle) * i * segSpacing,
        angle: angle,
      });
    }

    return {
      id,
      name,
      isPlayer,
      skinId,
      archetype: skin.archetype || 'cyber',
      deathEffectId,
      x,
      y,
      angle,
      targetAngle: angle,
      aimAngle: angle,
      isAiming: false,
      targetLockedSnakeId: null,
      laserLockPoint: null,
      speed: 3.4,
      baseSpeed: 3.4,
      boostSpeed: 6.2,
      length: initialLen,
      targetLength: initialLen,
      score: 0,
      kills: 0,
      hp: 100,
      maxHp: 100,
      isDead: false,
      segments,
      weapon: null,
      ammo: 0,
      lastFireTime: 0,
      isBoosting: false,
      color: skin.primaryColor,
      accentColor: skin.accentColor,
      shieldHp: 0,
      maxShieldHp: 100,
      shieldTimer: 0,
      invincibleTimer: 60, // Brief immunity on spawn
      botTurnTimer: 0,
      botFireTimer: 0,
    };
  }

  private spawnBot(index: number) {
    const name = BOT_NAMES[index % BOT_NAMES.length];
    const skin = SKINS[Math.floor(Math.random() * SKINS.length)];
    const effectList: DeathEffectType[] = [
      'cyber-matrix',
      'nuclear-supernova',
      'neon-skull',
      'void-singularity',
      'golden-cash-storm',
      'plasma-storm',
      'laser-fireworks',
    ];
    const deathEffectId = effectList[Math.floor(Math.random() * effectList.length)];
    const margin = 300;
    const x = margin + Math.random() * (WORLD_SIZE - margin * 2);
    const y = margin + Math.random() * (WORLD_SIZE - margin * 2);
    const angle = Math.random() * Math.PI * 2;

    const bot = this.createSnake(
      `bot_${this.nextEntityId++}`,
      name,
      false,
      skin.id,
      x,
      y,
      angle,
      deathEffectId
    );
    // Give some bots starting weapon or slight length variance
    if (Math.random() < 0.4) {
      const wepTypes: Array<Exclude<WeaponType, null>> = ['pistol', 'ar', 'sniper', 'grenade'];
      const pick = wepTypes[Math.floor(Math.random() * wepTypes.length)];
      bot.weapon = pick;
      bot.ammo = WEAPONS[pick].ammo;
    }
    this.snakes.push(bot);
  }

  private spawnCashCoin(atX: number, atY: number, cashValue = 10) {
    this.foods.push({
      id: this.nextEntityId++,
      x: Math.max(30, Math.min(WORLD_SIZE - 30, atX)),
      y: Math.max(30, Math.min(WORLD_SIZE - 30, atY)),
      radius: 8.5,
      value: 8,
      exp: 10,
      color: '#facc15',
      pulsePhase: Math.random() * Math.PI * 2,
      isSpecial: true,
      isCashCoin: true,
      cashValue,
    });
  }

  private spawnFood(atX?: number, atY?: number, isSpecial = false, duration?: number, valueMult = 1) {
    const colors = ['#38bdf8', '#4ade80', '#f472b6', '#facc15', '#a855f7', '#fb923c'];
    const x = atX !== undefined ? atX + (Math.random() * 24 - 12) : 50 + Math.random() * (WORLD_SIZE - 100);
    const y = atY !== undefined ? atY + (Math.random() * 24 - 12) : 50 + Math.random() * (WORLD_SIZE - 100);

    this.foods.push({
      id: this.nextEntityId++,
      x: Math.max(30, Math.min(WORLD_SIZE - 30, x)),
      y: Math.max(30, Math.min(WORLD_SIZE - 30, y)),
      radius: isSpecial ? 7.5 : 4.5,
      value: (isSpecial ? 5 : 1) * valueMult,
      exp: (isSpecial ? 8 : 2) * valueMult,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulsePhase: Math.random() * Math.PI * 2,
      isSpecial,
      duration,
      maxDuration: duration,
    });
  }

  private spawnLoot(atX?: number, atY?: number) {
    const wepTypes: Array<Exclude<WeaponType, null>> = ['pistol', 'ar', 'sniper', 'grenade'];
    // Weighted selection: pistol (30%), ar (35%), sniper (20%), grenade (15%)
    const roll = Math.random();
    let type: Exclude<WeaponType, null> = 'pistol';
    if (roll < 0.18) type = 'grenade';
    else if (roll < 0.45) type = 'sniper';
    else if (roll < 0.75) type = 'ar';
    else type = 'pistol';

    const x = atX !== undefined ? atX : 200 + Math.random() * (WORLD_SIZE - 400);
    const y = atY !== undefined ? atY : 200 + Math.random() * (WORLD_SIZE - 400);

    this.loots.push({
      id: this.nextEntityId++,
      x,
      y,
      type,
      radius: 18,
      pulsePhase: Math.random() * Math.PI * 2,
      bobOffset: Math.random() * 10,
    });
  }

  private spawnShield(atX?: number, atY?: number) {
    const x = atX !== undefined ? atX : 250 + Math.random() * (WORLD_SIZE - 500);
    const y = atY !== undefined ? atY : 250 + Math.random() * (WORLD_SIZE - 500);

    this.shields.push({
      id: this.nextEntityId++,
      x,
      y,
      radius: 18,
      pulsePhase: Math.random() * Math.PI * 2,
      bobOffset: Math.random() * 10,
      shieldAmount: 100,
    });
  }

  // Player input actions
  public setPlayerSteering(angle: number) {
    if (this.playerSnake && !this.playerSnake.isDead) {
      this.playerSnake.targetAngle = angle;
    }
  }

  public setPlayerBoosting(boosting: boolean) {
    if (this.playerSnake && !this.playerSnake.isDead) {
      this.playerSnake.isBoosting = boosting;
    }
  }

  public setPlayerAim(angle: number, isAiming: boolean) {
    if (this.playerSnake && !this.playerSnake.isDead) {
      this.playerSnake.aimAngle = angle;
      this.playerSnake.isAiming = isAiming;
    }
  }

  public fireWeapon(snake: Snake, customAngle?: number) {
    if (!snake.weapon || snake.ammo <= 0 || snake.isDead) return;

    const config = WEAPONS[snake.weapon];
    if (!config) return;

    const now = performance.now();
    if (now - snake.lastFireTime < config.fireCooldown) return;

    snake.lastFireTime = now;
    snake.ammo--;

    // 1. Mount location at the BACK of the head chassis
    const head = snake.segments[0];
    const mountDist = 12; // offset backwards along head angle
    const mountX = head.x - Math.cos(head.angle) * mountDist;
    const mountY = head.y - Math.sin(head.angle) * mountDist;

    // 2. Base Aim angle (from drag laser control or default snake direction)
    const baseAngle =
      customAngle !== undefined
        ? customAngle
        : snake.aimAngle !== undefined
        ? snake.aimAngle
        : head.angle;

    // 3. Barrel length extending forward from rear mount
    const barrelLength = 22;
    const muzzleX = mountX + Math.cos(baseAngle) * barrelLength;
    const muzzleY = mountY + Math.sin(baseAngle) * barrelLength;

    // Slight spread for AR
    let spread = 0;
    if (snake.weapon === 'ar') {
      spread = (Math.random() - 0.5) * 0.12;
    }
    const fireAngle = baseAngle + spread;

    this.projectiles.push({
      id: this.nextEntityId++,
      ownerId: snake.id,
      isPlayer: snake.isPlayer,
      weaponType: snake.weapon,
      x: muzzleX,
      y: muzzleY,
      startX: muzzleX,
      startY: muzzleY,
      vx: Math.cos(fireAngle) * config.speed,
      vy: Math.sin(fireAngle) * config.speed,
      distanceTraveled: 0,
      maxDistance: config.range,
      damage: config.damage,
      isExplosive: !!config.isExplosive,
      blastRadius: config.blastRadius || 180,
      color: config.color,
      radius: config.isExplosive ? 7 : 4,
    });

    if (snake.isPlayer) {
      playShootSound(snake.weapon);
    }

    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(fireAngle + (Math.random() - 0.5) * 0.6) * (Math.random() * 4 + 2),
        vy: Math.sin(fireAngle + (Math.random() - 0.5) * 0.6) * (Math.random() * 4 + 2),
        color: config.glowColor,
        size: 3,
        life: 12,
        maxLife: 12,
        shape: 'square',
      });
    }

    // If ammo depleted, unequip
    if (snake.ammo <= 0) {
      snake.weapon = null;
      snake.targetLockedSnakeId = null;
      snake.laserLockPoint = null;
    }
  }

  // Check line of sight through map obstacles (defensive bulletproof cover)
  public isLineBlockedByObstacle(x1: number, y1: number, x2: number, y2: number): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return false;
    const len = Math.sqrt(lenSq);

    for (const obs of this.obstacles) {
      if (obs.shape === 'circle' && obs.radius) {
        // Distance from circle center to line segment
        const t = Math.max(0, Math.min(1, ((obs.x - x1) * dx + (obs.y - y1) * dy) / lenSq));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        const dist = Math.hypot(obs.x - projX, obs.y - projY);
        if (dist <= obs.radius) {
          return true;
        }
      } else if (obs.shape === 'rect' && obs.width && obs.height) {
        const halfW = obs.width / 2;
        const halfH = obs.height / 2;
        const left = obs.x - halfW;
        const right = obs.x + halfW;
        const top = obs.y - halfH;
        const bottom = obs.y + halfH;

        const steps = Math.max(4, Math.ceil(len / 20));
        for (let s = 0; s <= steps; s++) {
          const px = x1 + (dx * s) / steps;
          const py = y1 + (dy * s) / steps;
          if (px >= left && px <= right && py >= top && py <= bottom) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Laser detection indicator & Auto-Shoot mechanic
  private updateLaserTargetingAndAutoFire(snake: Snake) {
    if (!snake.weapon || snake.ammo <= 0 || snake.isDead) {
      snake.targetLockedSnakeId = null;
      snake.laserLockPoint = null;
      return;
    }

    const head = snake.segments[0];
    const weaponCfg = WEAPONS[snake.weapon];
    if (!weaponCfg) return;

    // Rear turret mount point
    const mountDist = 12;
    const mountX = head.x - Math.cos(head.angle) * mountDist;
    const mountY = head.y - Math.sin(head.angle) * mountDist;

    const aimAngle = snake.aimAngle !== undefined ? snake.aimAngle : head.angle;
    const maxRange = weaponCfg.range;

    let closestHitDist = maxRange;
    let targetSnake: Snake | null = null;
    let lockPoint: { x: number; y: number } | null = null;

    // Scan all other living snakes in arena
    for (const other of this.snakes) {
      if (other.isDead || other.id === snake.id) continue;
      if (other.invincibleTimer && other.invincibleTimer > 0) continue;

      for (let s = 0; s < other.segments.length; s++) {
        const seg = other.segments[s];
        const dx = seg.x - mountX;
        const dy = seg.y - mountY;
        const dist = Math.hypot(dx, dy);

        if (dist < closestHitDist && dist > 10) {
          // Angle from mount to target segment
          const angleToSeg = Math.atan2(dy, dx);
          let angleDiff = Math.abs(aimAngle - angleToSeg);
          while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

          // Cross-track distance (perpendicular distance to laser beam line)
          const perpDist = dist * Math.sin(angleDiff);
          const alongDist = dist * Math.cos(angleDiff);

          // Generous targeting corridor (~32px beam width) for smooth lock-on
          if (alongDist > 0 && perpDist < 32) {
            // Defensive Cover Rule: If an obstacle blocks line of sight, cannot target through wall!
            if (!this.isLineBlockedByObstacle(mountX, mountY, seg.x, seg.y)) {
              closestHitDist = dist;
              targetSnake = other;
              lockPoint = { x: seg.x, y: seg.y };
            }
          }
        }
      }
    }

    if (targetSnake && lockPoint) {
      snake.targetLockedSnakeId = targetSnake.id;
      snake.laserLockPoint = lockPoint;

      // AUTO-SHOOTS ENEMY SNAKES WHEN DETECTED BY LASER!
      this.fireWeapon(snake, aimAngle);
    } else {
      snake.targetLockedSnakeId = null;
      snake.laserLockPoint = null;

      // Check if laser beam stops on a defensive obstacle in front
      const steps = Math.floor(maxRange / 25);
      for (let s = 1; s <= steps; s++) {
        const rx = mountX + Math.cos(aimAngle) * (s * 25);
        const ry = mountY + Math.sin(aimAngle) * (s * 25);
        for (const obs of this.obstacles) {
          let hit = false;
          if (obs.shape === 'circle' && obs.radius) {
            if (Math.hypot(rx - obs.x, ry - obs.y) <= obs.radius) hit = true;
          } else if (obs.shape === 'rect' && obs.width && obs.height) {
            if (Math.abs(rx - obs.x) <= obs.width / 2 && Math.abs(ry - obs.y) <= obs.height / 2) hit = true;
          }
          if (hit) {
            snake.laserLockPoint = { x: rx, y: ry };
            return;
          }
        }
      }
    }
  }

  // Update loop
  public update(deltaTime: number) {
    if (!this.isRunning) return;

    // 1. Update Projectiles
    this.updateProjectiles();

    // 2. Update Explosions
    this.updateExplosions();

    // 3. Update Snakes (Movement, Segment tracking, Bot AI, Boosting)
    this.updateSnakes();

    // 4. Check Food & Loot collection
    this.checkPickups();

    // 4b. Update temporary snake-drop food lifetimes (2-3s duration)
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      if (food.duration !== undefined) {
        food.duration -= deltaTime;
        if (food.duration <= 0) {
          this.foods.splice(i, 1);
        }
      }
    }

    // 5. Update Particles & Popups
    this.updateEffects();

    // 6. Respawn depleted food, loots, and shields
    if (this.foods.length < MAX_FOOD) {
      if (Math.random() < 0.6) this.spawnFood();
    }
    if (this.loots.length < MAX_LOOT) {
      if (Math.random() < 0.08) this.spawnLoot();
    }
    if (this.shields.length < MAX_SHIELDS) {
      if (Math.random() < 0.05) this.spawnShield();
    }

    // Decay obstacle hit pulses
    for (const obs of this.obstacles) {
      if (obs.hitPulse && obs.hitPulse > 0) {
        obs.hitPulse = Math.max(0, obs.hitPulse - 0.04);
      }
    }

    // Respawn dead bots
    const livingBots = this.snakes.filter((s) => !s.isPlayer && !s.isDead);
    if (livingBots.length < BOT_COUNT) {
      if (Math.random() < 0.08) {
        this.spawnBot(Math.floor(Math.random() * BOT_NAMES.length));
      }
    }
  }

  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.distanceTraveled += Math.hypot(p.vx, p.vy);

      // Boundary check
      if (p.x < 0 || p.x > WORLD_SIZE || p.y < 0 || p.y > WORLD_SIZE) {
        if (p.isExplosive) {
          this.detonateGrenade(p);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with defensive map obstacles (Bulletproof Cover!)
      let hitObstacle = false;
      for (const obs of this.obstacles) {
        let coll = false;
        if (obs.shape === 'circle' && obs.radius) {
          const d = Math.hypot(p.x - obs.x, p.y - obs.y);
          if (d <= obs.radius + p.radius) {
            coll = true;
          }
        } else if (obs.shape === 'rect' && obs.width && obs.height) {
          if (
            Math.abs(p.x - obs.x) <= obs.width / 2 + p.radius &&
            Math.abs(p.y - obs.y) <= obs.height / 2 + p.radius
          ) {
            coll = true;
          }
        }

        if (coll) {
          hitObstacle = true;
          obs.hitPulse = 1.0;
          playObstacleHitSound();
          if (p.isExplosive) {
            this.detonateGrenade(p);
          } else {
            // Deflection sparks
            for (let k = 0; k < 8; k++) {
              const sparkAngle = Math.atan2(p.y - obs.y, p.x - obs.x) + (Math.random() - 0.5) * 1.5;
              const spd = 3 + Math.random() * 4;
              this.particles.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(sparkAngle) * spd,
                vy: Math.sin(sparkAngle) * spd,
                color: obs.borderColor,
                size: 3,
                life: 16,
                maxLife: 16,
                shape: 'square',
              });
            }
          }
          this.projectiles.splice(i, 1);
          break;
        }
      }
      if (hitObstacle) continue;

      // Check collision with snakes
      let hit = false;
      for (const snake of this.snakes) {
        if (snake.isDead || snake.id === p.ownerId) continue;
        if (snake.invincibleTimer && snake.invincibleTimer > 0) continue;

        // Check head hit
        const head = snake.segments[0];
        const headDist = Math.hypot(p.x - head.x, p.y - head.y);
        const headRadius = 24;

        if (headDist < headRadius + p.radius) {
          hit = true;
          this.applyDamageToSnake(snake, p.damage, p.ownerId, p.weaponType, p.isExplosive);
          break;
        }

        // Check body segments hit
        for (let s = 1; s < snake.segments.length; s++) {
          const seg = snake.segments[s];
          const segDist = Math.hypot(p.x - seg.x, p.y - seg.y);
          if (segDist < 16 + p.radius) {
            hit = true;
            this.applyDamageToSnake(snake, p.damage, p.ownerId, p.weaponType, p.isExplosive);
            break;
          }
        }
        if (hit) break;
      }

      if (hit) {
        if (p.isExplosive) {
          this.detonateGrenade(p);
        } else {
          // Bullet spark
          for (let k = 0; k < 6; k++) {
            this.particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: p.color,
              size: 2.5,
              life: 14,
              maxLife: 14,
              shape: 'square',
            });
          }
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      // Max distance reach
      if (p.distanceTraveled >= p.maxDistance) {
        if (p.isExplosive) {
          this.detonateGrenade(p);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private detonateGrenade(p: Projectile) {
    playExplosionSound();

    // Shockwave explosion effect
    this.explosions.push({
      id: this.nextEntityId++,
      x: p.x,
      y: p.y,
      radius: 20,
      maxRadius: p.blastRadius,
      color: '#f59e0b',
      alpha: 1,
      duration: 320,
      elapsed: 0,
    });

    // Spawn massive fiery debris
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? '#fbbf24' : '#ef4444',
        size: Math.random() * 5 + 3,
        life: Math.random() * 25 + 15,
        maxLife: 40,
        shape: 'square',
      });
    }

    // Damage all snakes in blast radius!
    // Critical rule from user: "for the grenade make it 1 hit if it explodes near the other snakes"
    for (const snake of this.snakes) {
      if (snake.isDead) continue;
      // Immunity check
      if (snake.invincibleTimer && snake.invincibleTimer > 0) continue;

      let inBlast = false;
      // Check distance to head and line of sight behind cover
      const head = snake.segments[0];
      if (Math.hypot(p.x - head.x, p.y - head.y) < p.blastRadius) {
        if (!this.isLineBlockedByObstacle(p.x, p.y, head.x, head.y)) {
          inBlast = true;
        }
      } else {
        // Check body segments and cover
        for (const seg of snake.segments) {
          if (Math.hypot(p.x - seg.x, p.y - seg.y) < p.blastRadius) {
            if (!this.isLineBlockedByObstacle(p.x, p.y, seg.x, seg.y)) {
              inBlast = true;
              break;
            }
          }
        }
      }

      if (inBlast) {
        // 1-HIT KILL LETHAL DAMAGE (999) - Unless defended by active Energy Shield!
        this.applyDamageToSnake(snake, 999, p.ownerId, 'grenade', true);
      }
    }
  }

  private applyDamageToSnake(
    snake: Snake,
    damage: number,
    attackerId: string,
    weaponType: WeaponType,
    isExplosive = false
  ) {
    const head = snake.segments[0];

    // SHIELD DEFENSE SYSTEM ABSORPTION
    if (snake.shieldHp && snake.shieldHp > 0) {
      if (snake.shieldHp >= damage) {
        snake.shieldHp -= damage;
        if (snake.isPlayer) {
          playShieldDeflectSound();
        }
        this.damagePopups.push({
          id: this.nextEntityId++,
          x: head.x + (Math.random() * 20 - 10),
          y: head.y - 25,
          text: `🛡️ BLOCKED (-${Math.round(damage)})`,
          color: '#38bdf8',
          life: 30,
          maxLife: 30,
        });

        // Shield energy deflection sparks
        for (let k = 0; k < 7; k++) {
          this.particles.push({
            x: head.x,
            y: head.y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            color: '#38bdf8',
            size: 3,
            life: 16,
            maxLife: 16,
            shape: 'square',
          });
        }
        return; // Full damage absorbed by energy shield!
      } else {
        // Partial absorption then shield breaks
        damage -= snake.shieldHp;
        snake.shieldHp = 0;
        if (snake.isPlayer) {
          playShieldDeflectSound();
        }
        this.damagePopups.push({
          id: this.nextEntityId++,
          x: head.x,
          y: head.y - 30,
          text: `🛡️ SHIELD BROKEN!`,
          color: '#f43f5e',
          life: 40,
          maxLife: 40,
        });
      }
    }

    snake.hp -= damage;

    // Damage popup text
    const isOneHit = isExplosive && damage >= 900;
    this.damagePopups.push({
      id: this.nextEntityId++,
      x: head.x + (Math.random() * 30 - 15),
      y: head.y - 20,
      text: isOneHit ? '💥 1-HIT KILL!' : `-${Math.round(damage)}`,
      color: isOneHit ? '#f59e0b' : '#ef4444',
      life: 30,
      maxLife: 30,
    });

    if (snake.hp <= 0 && !snake.isDead) {
      this.killSnake(snake, attackerId, weaponType);
    }
  }

  private killSnake(victim: Snake, killerId: string, weapon: WeaponType) {
    victim.isDead = true;

    // Find killer snake
    const killer = this.snakes.find((s) => s.id === killerId);
    let killCash = 0;
    if (killer) {
      killer.kills++;
      killer.score += 250;
      if (killer.isPlayer) {
        killCash = 50;
        playKillSound();
        updateMissionProgress('kills', 1);
        if (weapon) {
          updateMissionProgress('kills_with_weapon', 1);
        }
        updateMissionProgress('earn_cash', killCash);
        if (this.onCashEarned) {
          this.onCashEarned(killCash, `Eliminated ${victim.name}`);
        }
        this.damagePopups.push({
          id: this.nextEntityId++,
          x: victim.segments[0].x,
          y: victim.segments[0].y - 35,
          text: `💰 +$${killCash} CASH! (KILL)`,
          color: '#facc15',
          life: 55,
          maxLife: 55,
        });
        if (this.onKill) {
          this.onKill(victim.name, weapon, killCash);
        }
      }
    }

    // Add to kill feed
    this.killFeed.unshift({
      id: this.nextEntityId++,
      killer: killer ? killer.name : 'Arena Hazard',
      victim: victim.name,
      weapon,
      rewardCoins: killCash > 0 ? killCash : undefined,
      time: Date.now(),
    });
    if (this.killFeed.length > 5) this.killFeed.pop();

    // Turn victim body into rich glowing food drops with 2.8s duration to eliminate lag!
    // User request: "Also make the snakedrop when killed have durations to avoid causing lags. Like for 2-3 seconds"
    const totalSegs = victim.segments.length;
    const step = Math.max(2, Math.floor(totalSegs / 18));
    const dropDuration = 2.8; // 2.8 seconds lifetime
    const valueMultiplier = Math.max(1.5, Math.min(6, step * 1.2));

    for (let i = 0; i < totalSegs; i += step) {
      const seg = victim.segments[i];
      this.spawnFood(seg.x, seg.y, true, dropDuration, valueMultiplier);
    }

    // Drop special golden cash coins! Every kill generates cash pickups
    const cashCoinCount = killer && killer.isPlayer ? 5 : 3;
    for (let c = 0; c < cashCoinCount; c++) {
      this.spawnCashCoin(
        victim.segments[0].x + (Math.random() * 80 - 40),
        victim.segments[0].y + (Math.random() * 80 - 40),
        10
      );
    }

    // If victim had a weapon with remaining ammo, drop a loot crate!
    if (victim.weapon && victim.ammo > 0) {
      this.spawnLoot(victim.segments[0].x, victim.segments[0].y);
    }

    // Trigger Custom Death Effect!
    const effectType: DeathEffectType = killer?.deathEffectId || victim.deathEffectId || 'cyber-matrix';
    this.triggerDeathEffect(effectType, victim.segments[0].x, victim.segments[0].y, victim.color);

    if (victim.isPlayer) {
      recordPlayerScore(victim.name, victim.score, victim.kills, victim.skinId);
      if (this.onPlayerDeath) {
        this.onPlayerDeath({
          score: victim.score,
          kills: victim.kills,
          coins: Math.floor(victim.score / 15) + victim.kills * 20,
          length: Math.floor(victim.length),
        });
      }
    }
  }

  private triggerDeathEffect(type: DeathEffectType, x: number, y: number, fallbackColor: string) {
    playDeathEffectSound(type);

    if (type === 'nuclear-supernova') {
      this.explosions.push({
        id: this.nextEntityId++,
        x,
        y,
        radius: 30,
        maxRadius: 140,
        color: '#f97316',
        alpha: 1,
        duration: 650,
        elapsed: 0,
        style: 'supernova',
      });
      for (let i = 0; i < 55; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 11 + 3;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.4 ? '#ef4444' : '#facc15',
          size: Math.random() * 7 + 4,
          life: Math.floor(Math.random() * 25 + 25),
          maxLife: 50,
          shape: 'square',
        });
      }
    } else if (type === 'neon-skull') {
      this.explosions.push({
        id: this.nextEntityId++,
        x,
        y,
        radius: 25,
        maxRadius: 120,
        color: '#06b6d4',
        alpha: 1,
        duration: 600,
        elapsed: 0,
        style: 'skull',
      });
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? '#22d3ee' : '#f43f5e',
          size: Math.random() * 6 + 3,
          life: 35,
          maxLife: 35,
          shape: 'square',
        });
      }
    } else if (type === 'void-singularity') {
      this.explosions.push({
        id: this.nextEntityId++,
        x,
        y,
        radius: 15,
        maxRadius: 110,
        color: '#a855f7',
        alpha: 1,
        duration: 750,
        elapsed: 0,
        style: 'void',
      });
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 2;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? '#c084fc' : '#e9d5ff',
          size: Math.random() * 5 + 3,
          life: 40,
          maxLife: 40,
          shape: 'circle',
        });
      }
    } else if (type === 'golden-cash-storm') {
      this.explosions.push({
        id: this.nextEntityId++,
        x,
        y,
        radius: 20,
        maxRadius: 95,
        color: '#facc15',
        alpha: 1,
        duration: 550,
        elapsed: 0,
        style: 'cash',
      });
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.4 ? '#facc15' : '#fbbf24',
          size: Math.random() * 6 + 4,
          life: Math.floor(Math.random() * 20 + 25),
          maxLife: 45,
          shape: 'dollar',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }
    } else if (type === 'plasma-storm') {
      this.explosions.push({
        id: this.nextEntityId++,
        x,
        y,
        radius: 20,
        maxRadius: 105,
        color: '#c084fc',
        alpha: 1,
        duration: 500,
        elapsed: 0,
        style: 'plasma',
      });
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 3;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? '#a855f7' : '#ec4899',
          size: Math.random() * 8 + 4,
          life: 25,
          maxLife: 25,
          shape: 'lightning',
        });
      }
    } else if (type === 'laser-fireworks') {
      this.explosions.push({
        id: this.nextEntityId++,
        x,
        y,
        radius: 15,
        maxRadius: 100,
        color: '#38bdf8',
        alpha: 1,
        duration: 500,
        elapsed: 0,
      });
      const starColors = ['#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#4ade80'];
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 3;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          size: Math.random() * 7 + 4,
          life: Math.floor(Math.random() * 20 + 20),
          maxLife: 40,
          shape: 'star',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.15,
        });
      }
    } else {
      // Default: cyber-matrix
      this.explosions.push({
        id: this.nextEntityId++,
        x,
        y,
        radius: 15,
        maxRadius: 85,
        color: '#22c55e',
        alpha: 1,
        duration: 450,
        elapsed: 0,
      });
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? '#22c55e' : '#86efac',
          size: Math.random() * 5 + 3,
          life: 30,
          maxLife: 30,
          shape: 'binary',
          text: Math.random() > 0.5 ? '1' : '0',
        });
      }
    }
  }

  private updateExplosions() {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.elapsed += 16;
      if (exp.elapsed >= exp.duration) {
        this.explosions.splice(i, 1);
      }
    }
  }

  private updateSnakes() {
    for (let idx = 0; idx < this.snakes.length; idx++) {
      const snake = this.snakes[idx];
      if (snake.isDead) continue;

      if (snake.invincibleTimer && snake.invincibleTimer > 0) {
        snake.invincibleTimer--;
      }

      // 1. Bot AI Decision
      if (!snake.isPlayer) {
        this.updateBotAI(snake);
      }

      // 2. Smooth angle turning
      let diff = snake.targetAngle - snake.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      const maxTurn = 0.12;
      snake.angle += Math.max(-maxTurn, Math.min(maxTurn, diff));

      // 3. Speed & Boosting
      let currentSpeed = snake.baseSpeed;
      if (snake.isBoosting && snake.length > 8) {
        currentSpeed = snake.boostSpeed;
        const tail = snake.segments[snake.segments.length - 1];
        const prev = snake.segments[Math.max(0, snake.segments.length - 2)];
        const exhaustAngle = Math.atan2(tail.y - prev.y, tail.x - prev.x);

        // Continuous fiery tail propulsion exhaust particles
        if (Math.random() < 0.85) {
          const pAngle = exhaustAngle + (Math.random() - 0.5) * 0.65;
          const pSpeed = 3.5 + Math.random() * 5;
          this.particles.push({
            x: tail.x,
            y: tail.y,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            color: Math.random() > 0.4 ? '#f59e0b' : (snake.accentColor || '#38bdf8'),
            size: Math.random() * 3 + 2,
            life: 14 + Math.floor(Math.random() * 8),
            maxLife: 22,
            shape: 'square',
          });
        }

        // Boosting consumes slight length / mass
        if (Math.random() < 0.25) {
          snake.length = Math.max(8, snake.length - 0.08);
          // Drop food pellet remnant behind tail
          this.particles.push({
            x: tail.x + Math.cos(exhaustAngle) * 8,
            y: tail.y + Math.sin(exhaustAngle) * 8,
            vx: Math.cos(exhaustAngle) * 2 + (Math.random() - 0.5),
            vy: Math.sin(exhaustAngle) * 2 + (Math.random() - 0.5),
            color: snake.accentColor,
            size: 3.5,
            life: 20,
            maxLife: 20,
            shape: 'square',
          });
        }
      }

      // Move head
      snake.x += Math.cos(snake.angle) * currentSpeed;
      snake.y += Math.sin(snake.angle) * currentSpeed;

      // Arena boundary collision clamp / bounce
      const padding = 20;
      if (snake.x < padding) {
        snake.x = padding;
        snake.targetAngle = 0;
      } else if (snake.x > WORLD_SIZE - padding) {
        snake.x = WORLD_SIZE - padding;
        snake.targetAngle = Math.PI;
      }
      if (snake.y < padding) {
        snake.y = padding;
        snake.targetAngle = Math.PI / 2;
      } else if (snake.y > WORLD_SIZE - padding) {
        snake.y = WORLD_SIZE - padding;
        snake.targetAngle = -Math.PI / 2;
      }

      // Decay Shield Timer
      if (snake.shieldTimer && snake.shieldTimer > 0) {
        snake.shieldTimer -= 1 / 60;
        if (snake.shieldTimer <= 0) {
          snake.shieldHp = 0;
        }
      }

      // Deflect snake head smoothly around defensive map obstacles (sliding cover)
      for (const obs of this.obstacles) {
        if (obs.shape === 'circle' && obs.radius) {
          const d = Math.hypot(snake.x - obs.x, snake.y - obs.y);
          const minDist = obs.radius + 18;
          if (d < minDist && d > 0.001) {
            const pushAngle = Math.atan2(snake.y - obs.y, snake.x - obs.x);
            snake.x = obs.x + Math.cos(pushAngle) * minDist;
            snake.y = obs.y + Math.sin(pushAngle) * minDist;
          }
        } else if (obs.shape === 'rect' && obs.width && obs.height) {
          const halfW = obs.width / 2 + 18;
          const halfH = obs.height / 2 + 18;
          const dx = snake.x - obs.x;
          const dy = snake.y - obs.y;
          if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) {
            const overlapX = halfW - Math.abs(dx);
            const overlapY = halfH - Math.abs(dy);
            if (overlapX < overlapY) {
              snake.x = obs.x + (dx > 0 ? halfW : -halfW);
            } else {
              snake.y = obs.y + (dy > 0 ? halfH : -halfH);
            }
          }
        }
      }

      // Update Segments & compute snake AABB bounding box for fast collision rejection
      const head = snake.segments[0];
      head.x = snake.x;
      head.y = snake.y;
      head.angle = snake.angle;

      let sMinX = head.x;
      let sMaxX = head.x;
      let sMinY = head.y;
      let sMaxY = head.y;

      const segDist = 14;
      for (let i = 1; i < snake.segments.length; i++) {
        const prev = snake.segments[i - 1];
        const cur = snake.segments[i];
        const dx = prev.x - cur.x;
        const dy = prev.y - cur.y;
        const dist = Math.hypot(dx, dy);

        if (dist > segDist) {
          const ratio = (dist - segDist) / dist;
          cur.x += dx * ratio;
          cur.y += dy * ratio;
          cur.angle = Math.atan2(dy, dx);
        }

        if (cur.x < sMinX) sMinX = cur.x;
        else if (cur.x > sMaxX) sMaxX = cur.x;
        if (cur.y < sMinY) sMinY = cur.y;
        else if (cur.y > sMaxY) sMaxY = cur.y;
      }

      snake.minX = sMinX;
      snake.maxX = sMaxX;
      snake.minY = sMinY;
      snake.maxY = sMaxY;

      // Dynamic length growth / shrink
      const targetSegments = Math.floor(snake.length);
      while (snake.segments.length < targetSegments) {
        const tail = snake.segments[snake.segments.length - 1];
        snake.segments.push({
          x: tail.x - Math.cos(tail.angle) * segDist,
          y: tail.y - Math.sin(tail.angle) * segDist,
          angle: tail.angle,
        });
      }
      while (snake.segments.length > targetSegments && snake.segments.length > 6) {
        snake.segments.pop();
      }

      // 3.8 Update Laser Targeting & Auto-Shoot mechanic for equipped snakes
      if (snake.weapon && snake.ammo > 0) {
        this.updateLaserTargetingAndAutoFire(snake);
      }

      // Track ongoing mission progress for player
      if (snake.isPlayer) {
        updateMissionProgress('reach_length', Math.floor(snake.length), 'max');
        updateMissionProgress('reach_score', snake.score, 'max');
      }

      // 4. Check Head-to-Body Collision with other snakes (Classic Snake.io kill!)
      this.checkSnakeCollisions(snake);
    }
  }

  private checkSnakeCollisions(snake: Snake) {
    if (snake.isDead) return;
    if (snake.invincibleTimer && snake.invincibleTimer > 0) return;

    const head = snake.segments[0];
    const reach = 14 + 10;
    const reachSq = reach * reach;

    for (let oIdx = 0; oIdx < this.snakes.length; oIdx++) {
      const other = this.snakes[oIdx];
      if (other.isDead || other.id === snake.id) continue;

      // Fast AABB bounding box check - instantly reject entire snake if head is nowhere near
      if (
        other.minX !== undefined &&
        (head.x < other.minX - reach ||
          head.x > (other.maxX || WORLD_SIZE) + reach ||
          head.y < (other.minY || 0) - reach ||
          head.y > (other.maxY || WORLD_SIZE) + reach)
      ) {
        continue;
      }

      // Adaptive segment step for long snakes to eliminate framedrops
      const segStep = other.segments.length > 50 ? 2 : 1;

      // Check collision with other snake's body segments
      for (let s = 1; s < other.segments.length; s += segStep) {
        const seg = other.segments[s];
        const dx = head.x - seg.x;
        if (Math.abs(dx) > reach) continue;
        const dy = head.y - seg.y;
        if (Math.abs(dy) > reach) continue;

        if (dx * dx + dy * dy < reachSq) {
          // Crash! snake dies and other snake gets credit!
          this.killSnake(snake, other.id, null);
          return;
        }
      }
    }
  }

  private updateBotAI(bot: Snake) {
    bot.botTurnTimer = (bot.botTurnTimer || 0) - 1;
    bot.botFireTimer = (bot.botFireTimer || 0) - 1;

    // Scan for nearest threats / food / loot
    if (bot.botTurnTimer <= 0) {
      bot.botTurnTimer = Math.floor(Math.random() * 15 + 10);

      // Avoid walls
      const wallDist = 200;
      if (bot.x < wallDist) {
        bot.targetAngle = 0 + (Math.random() - 0.5) * 0.5;
        return;
      } else if (bot.x > WORLD_SIZE - wallDist) {
        bot.targetAngle = Math.PI + (Math.random() - 0.5) * 0.5;
        return;
      } else if (bot.y < wallDist) {
        bot.targetAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        return;
      } else if (bot.y > WORLD_SIZE - wallDist) {
        bot.targetAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        return;
      }

      // Avoid getting trapped directly inside/facing map obstacles
      for (const obs of this.obstacles) {
        const d = Math.hypot(bot.x - obs.x, bot.y - obs.y);
        const obsR = obs.radius || Math.max(obs.width || 60, obs.height || 60) / 2;
        if (d < obsR + 80) {
          bot.targetAngle = Math.atan2(bot.y - obs.y, bot.x - obs.x) + (Math.random() - 0.5) * 0.6;
          return;
        }
      }

      // If low shield/hp, consider seeking nearest shield powerup
      if ((!bot.shieldHp || bot.shieldHp <= 0) && this.shields.length > 0) {
        let closestShield: ShieldPowerup | null = null;
        let minShieldDist = 600;
        for (const s of this.shields) {
          const d = Math.hypot(s.x - bot.x, s.y - bot.y);
          if (d < minShieldDist) {
            minShieldDist = d;
            closestShield = s;
          }
        }
        if (closestShield && Math.random() < 0.65) {
          bot.targetAngle = Math.atan2(closestShield.y - bot.y, closestShield.x - bot.x);
          return;
        }
      }

      // If no weapon, seek nearest loot crate
      if (!bot.weapon && this.loots.length > 0) {
        let closestLoot: LootItem | null = null;
        let minDist = 700;
        for (const loot of this.loots) {
          const d = Math.hypot(loot.x - bot.x, loot.y - bot.y);
          if (d < minDist) {
            minDist = d;
            closestLoot = loot;
          }
        }
        if (closestLoot) {
          bot.targetAngle = Math.atan2(closestLoot.y - bot.y, closestLoot.x - bot.x);
          return;
        }
      }

      // If armed, search for enemy to engage
      if (bot.weapon) {
        const weaponCfg = WEAPONS[bot.weapon];
        let targetSnake: Snake | null = null;
        let targetDist = weaponCfg.range * 0.9;

        for (const other of this.snakes) {
          if (other.isDead || other.id === bot.id) continue;
          const d = Math.hypot(other.x - bot.x, other.y - bot.y);
          if (d < targetDist) {
            targetDist = d;
            targetSnake = other;
          }
        }

        if (targetSnake) {
          const aimAngle = Math.atan2(targetSnake.y - bot.y, targetSnake.x - bot.x);
          bot.targetAngle = aimAngle;

          // Fire if aligned
          const angleDiff = Math.abs(bot.angle - aimAngle);
          if (angleDiff < 0.35 && bot.botFireTimer <= 0) {
            this.fireWeapon(bot);
            bot.botFireTimer = Math.floor(weaponCfg.fireCooldown / 16) + 4;
          }
          return;
        }
      }

      // Otherwise seek closest cluster of food
      let nearestFood: FoodItem | null = null;
      let minFoodDist = 500;
      for (const food of this.foods) {
        const d = Math.hypot(food.x - bot.x, food.y - bot.y);
        if (d < minFoodDist) {
          minFoodDist = d;
          nearestFood = food;
        }
      }

      if (nearestFood) {
        bot.targetAngle = Math.atan2(nearestFood.y - bot.y, nearestFood.x - bot.x);
      }
    }
  }

  private checkPickups() {
    if (this.foods.length === 0 && this.loots.length === 0 && this.shields.length === 0) return;

    // 1. Gather all living snakes' head positions & reach once
    const eaters: Array<{
      snake: Snake;
      head: { x: number; y: number };
      reach: number;
    }> = [];

    for (let sIdx = 0; sIdx < this.snakes.length; sIdx++) {
      const s = this.snakes[sIdx];
      if (!s.isDead && s.segments.length > 0) {
        eaters.push({
          snake: s,
          head: s.segments[0],
          reach: 22 + Math.min(s.length * 0.15, 15),
        });
      }
    }

    if (eaters.length === 0) return;

    // 2. Check Food & Cash Coin Pickups (Single-pass reverse iteration, 10x faster!)
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];

      for (let eIdx = 0; eIdx < eaters.length; eIdx++) {
        const { snake, head, reach } = eaters[eIdx];
        const totalReach = reach + food.radius;
        const dx = head.x - food.x;
        if (Math.abs(dx) > totalReach) continue;
        const dy = head.y - food.y;
        if (Math.abs(dy) > totalReach) continue;

        if (dx * dx + dy * dy < totalReach * totalReach) {
          if (food.isCashCoin) {
            // Cash coin collected!
            const cash = food.cashValue || 10;
            if (snake.isPlayer) {
              playCashSound();
              updateMissionProgress('earn_cash', cash);
              if (this.onCashEarned) {
                this.onCashEarned(cash, 'Cash Coin Pickup');
              }
              this.damagePopups.push({
                id: this.nextEntityId++,
                x: head.x + (Math.random() * 20 - 10),
                y: head.y - 25,
                text: `+$${cash} CASH!`,
                color: '#facc15',
                life: 40,
                maxLife: 40,
              });
            }
            snake.score += 25;
          } else {
            // Eat regular food
            snake.length += food.isSpecial ? 0.8 : 0.25;
            snake.score += food.isSpecial ? 15 : 3;
            if (snake.hp < snake.maxHp) {
              snake.hp = Math.min(snake.maxHp, snake.hp + (food.isSpecial ? 6 : 2));
            }

            if (snake.isPlayer) {
              playEatSound();
            }
          }

          this.foods.splice(i, 1);
          break; // Food item consumed, move to next food
        }
      }
    }

    // 3. Check Loot Crates & Shields Pickups
    for (let eIdx = 0; eIdx < eaters.length; eIdx++) {
      const { snake, head, reach: eatRadius } = eaters[eIdx];
      for (let i = this.loots.length - 1; i >= 0; i--) {
        const loot = this.loots[i];
        const reach = eatRadius + loot.radius;
        const dx = head.x - loot.x;
        if (Math.abs(dx) > reach) continue;
        const dy = head.y - loot.y;
        if (Math.abs(dy) > reach) continue;

        if (dx * dx + dy * dy < reach * reach) {
          const config = WEAPONS[loot.type];
          snake.weapon = loot.type;
          snake.ammo = config.ammo; // Give full ammo for picked weapon

          if (snake.isPlayer) {
            playLootPickupSound();
            this.damagePopups.push({
              id: this.nextEntityId++,
              x: head.x,
              y: head.y - 30,
              text: `EQUIPPED ${config.name.toUpperCase()} (×${config.ammo})`,
              color: config.color,
              life: 45,
              maxLife: 45,
            });
          }

          this.loots.splice(i, 1);
        }
      }

      // Check Shield Powerup Pickups (Fast AABB + Squared distance)
      for (let i = this.shields.length - 1; i >= 0; i--) {
        const shield = this.shields[i];
        const reach = eatRadius + shield.radius;
        const dx = head.x - shield.x;
        if (Math.abs(dx) > reach) continue;
        const dy = head.y - shield.y;
        if (Math.abs(dy) > reach) continue;

        if (dx * dx + dy * dy < reach * reach) {
          snake.shieldHp = Math.min(100, (snake.shieldHp || 0) + shield.shieldAmount);
          snake.maxShieldHp = 100;
          snake.shieldTimer = 30; // 30 seconds active defense

          if (snake.isPlayer) {
            playShieldPickupSound();
            this.damagePopups.push({
              id: this.nextEntityId++,
              x: head.x,
              y: head.y - 30,
              text: `🛡️ DEFENSE SHIELD ACTIVATED (+100 HP)`,
              color: '#38bdf8',
              life: 50,
              maxLife: 50,
            });
            for (let k = 0; k < 12; k++) {
              const a = (k / 12) * Math.PI * 2;
              this.particles.push({
                x: head.x,
                y: head.y,
                vx: Math.cos(a) * 4,
                vy: Math.sin(a) * 4,
                color: '#38bdf8',
                size: 3.5,
                life: 20,
                maxLife: 20,
                shape: 'circle',
              });
            }
          }

          this.shields.splice(i, 1);
        }
      }
    }
  }

  private updateEffects() {
    // Keep particles pool strictly bounded to prevent frame drops during massive chain explosions
    if (this.particles.length > 220) {
      this.particles.splice(0, this.particles.length - 220);
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot;
      }
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Damage popups pool cap
    if (this.damagePopups.length > 35) {
      this.damagePopups.splice(0, this.damagePopups.length - 35);
    }

    // Damage popups
    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      const dp = this.damagePopups[i];
      dp.y -= 0.8;
      dp.life--;
      if (dp.life <= 0) {
        this.damagePopups.splice(i, 1);
      }
    }

    // Phase animation for foods and loots
    for (const f of this.foods) {
      f.pulsePhase += 0.06;
    }
    for (const l of this.loots) {
      l.pulsePhase += 0.05;
    }
  }

  public getLeaderboard() {
    return [...this.snakes]
      .filter((s) => !s.isDead)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map((s, idx) => ({
        id: s.id,
        rank: idx + 1,
        name: s.name,
        score: s.score,
        length: Math.floor(s.length),
        kills: s.kills,
        isPlayer: s.isPlayer,
      }));
  }
}
