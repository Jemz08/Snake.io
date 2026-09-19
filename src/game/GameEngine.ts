import {
  Snake,
  FoodItem,
  LootItem,
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
} from '../utils/audio';
import { SKINS } from '../utils/skins';
import { DEATH_EFFECTS } from '../utils/deathEffects';
import { updateMissionProgress } from '../utils/missions';
import { recordPlayerScore } from '../utils/leaderboard';

const WORLD_SIZE = 3600;
const MAX_FOOD = 380;
const MAX_LOOT = 16;
const BOT_COUNT = 9;

const BOT_NAMES = [
  'Viper²',
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
];

export class GameEngine {
  public worldSize = WORLD_SIZE;
  public snakes: Snake[] = [];
  public foods: FoodItem[] = [];
  public loots: LootItem[] = [];
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
    this.projectiles = [];
    this.explosions = [];
    this.particles = [];
    this.damagePopups = [];
    this.killFeed = [];

    // Spawn initial food
    for (let i = 0; i < MAX_FOOD; i++) {
      this.spawnFood();
    }

    // Spawn initial loot crates
    for (let i = 0; i < MAX_LOOT; i++) {
      this.spawnLoot();
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
      color: '#06b6d4',
      accentColor: '#22d3ee',
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

  private spawnFood(atX?: number, atY?: number, isSpecial = false) {
    const colors = ['#38bdf8', '#4ade80', '#f472b6', '#facc15', '#a855f7', '#fb923c'];
    const x = atX !== undefined ? atX + (Math.random() * 60 - 30) : 50 + Math.random() * (WORLD_SIZE - 100);
    const y = atY !== undefined ? atY + (Math.random() * 60 - 30) : 50 + Math.random() * (WORLD_SIZE - 100);

    this.foods.push({
      id: this.nextEntityId++,
      x: Math.max(30, Math.min(WORLD_SIZE - 30, x)),
      y: Math.max(30, Math.min(WORLD_SIZE - 30, y)),
      radius: isSpecial ? 7 : 4.5,
      value: isSpecial ? 5 : 1,
      exp: isSpecial ? 8 : 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulsePhase: Math.random() * Math.PI * 2,
      isSpecial,
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
            closestHitDist = dist;
            targetSnake = other;
            lockPoint = { x: seg.x, y: seg.y };
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

    // 5. Update Particles & Popups
    this.updateEffects();

    // 6. Respawn depleted food and loots
    if (this.foods.length < MAX_FOOD) {
      if (Math.random() < 0.6) this.spawnFood();
    }
    if (this.loots.length < MAX_LOOT) {
      if (Math.random() < 0.08) this.spawnLoot();
    }

    // Respawn dead bots
    const livingBots = this.snakes.filter((s) => !s.isPlayer && !s.isDead);
    if (livingBots.length < BOT_COUNT) {
      if (Math.random() < 0.05) {
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
      // Check distance to head
      const head = snake.segments[0];
      if (Math.hypot(p.x - head.x, p.y - head.y) < p.blastRadius) {
        inBlast = true;
      } else {
        // Check body segments
        for (const seg of snake.segments) {
          if (Math.hypot(p.x - seg.x, p.y - seg.y) < p.blastRadius) {
            inBlast = true;
            break;
          }
        }
      }

      if (inBlast) {
        // 1-HIT KILL LETHAL DAMAGE (999)
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
    snake.hp -= damage;

    // Damage popup text
    const head = snake.segments[0];
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

    // Turn victim body into mass amounts of glowing food and EXP!
    for (let i = 0; i < victim.segments.length; i++) {
      const seg = victim.segments[i];
      // Every segment drops high-value food drops
      this.spawnFood(seg.x, seg.y, true);
      if (i % 2 === 0) {
        this.spawnFood(seg.x + (Math.random() * 20 - 10), seg.y + (Math.random() * 20 - 10), true);
      }
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
        // Boosting consumes slight length / mass
        if (Math.random() < 0.25) {
          snake.length = Math.max(8, snake.length - 0.08);
          // Drop tiny food behind tail
          const tail = snake.segments[snake.segments.length - 1];
          this.particles.push({
            x: tail.x,
            y: tail.y,
            vx: -Math.cos(tail.angle) * 3 + (Math.random() - 0.5),
            vy: -Math.sin(tail.angle) * 3 + (Math.random() - 0.5),
            color: snake.accentColor,
            size: 3,
            life: 18,
            maxLife: 18,
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

      // Update Segments
      const head = snake.segments[0];
      head.x = snake.x;
      head.y = snake.y;
      head.angle = snake.angle;

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
      }

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
    const headRadius = 14;

    for (const other of this.snakes) {
      if (other.isDead || other.id === snake.id) continue;

      // Check collision with other snake's body segments
      for (let s = 1; s < other.segments.length; s++) {
        const seg = other.segments[s];
        const dist = Math.hypot(head.x - seg.x, head.y - seg.y);
        if (dist < headRadius + 10) {
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
    for (const snake of this.snakes) {
      if (snake.isDead) continue;
      const head = snake.segments[0];
      const eatRadius = 22 + Math.min(snake.length * 0.15, 15);

      // Check Food & Cash Coin Pickups
      for (let i = this.foods.length - 1; i >= 0; i--) {
        const food = this.foods[i];
        const dist = Math.hypot(head.x - food.x, head.y - food.y);

        if (dist < eatRadius + food.radius) {
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
        }
      }

      // Check Loot Crates Pickups
      for (let i = this.loots.length - 1; i >= 0; i--) {
        const loot = this.loots[i];
        const dist = Math.hypot(head.x - loot.x, head.y - loot.y);

        if (dist < eatRadius + loot.radius) {
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
    }
  }

  private updateEffects() {
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
        rank: idx + 1,
        name: s.name,
        score: s.score,
        length: Math.floor(s.length),
        kills: s.kills,
        isPlayer: s.isPlayer,
      }));
  }
}
