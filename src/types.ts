export type WeaponType = 'grenade' | 'pistol' | 'ar' | 'sniper' | null;

export interface WeaponDef {
  id: WeaponType;
  name: string;
  ammo: number;
  range: number;
  speed: number;
  fireCooldown: number; // ms
  damage: number;
  blastRadius?: number;
  isExplosive?: boolean;
  color: string;
  glowColor: string;
  description: string;
  badge: string;
}

export interface SnakeSegment {
  x: number;
  y: number;
  angle: number;
}

export interface Snake {
  id: string;
  name: string;
  isPlayer: boolean;
  skinId: string;
  x: number;
  y: number;
  angle: number;
  targetAngle: number;
  speed: number;
  baseSpeed: number;
  boostSpeed: number;
  length: number;
  targetLength: number;
  score: number;
  kills: number;
  hp: number;
  maxHp: number;
  isDead: boolean;
  segments: SnakeSegment[];
  weapon: WeaponType;
  ammo: number;
  lastFireTime: number;
  isBoosting: boolean;
  color: string;
  accentColor: string;
  deathEffectId?: DeathEffectType;
  // Weapon Aiming & Laser Targeting fields (mounted at back of head)
  aimAngle?: number;
  isAiming?: boolean;
  targetLockedSnakeId?: string | null;
  laserLockPoint?: { x: number; y: number } | null;
  // Bot AI fields
  botTargetX?: number;
  botTargetY?: number;
  botTurnTimer?: number;
  botFireTimer?: number;
  invincibleTimer?: number;
}

export interface FoodItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  value: number;
  exp: number;
  color: string;
  pulsePhase: number;
  isSpecial?: boolean;
  isCashCoin?: boolean;
  cashValue?: number;
}

export interface LootItem {
  id: number;
  x: number;
  y: number;
  type: Exclude<WeaponType, null>;
  radius: number;
  pulsePhase: number;
  bobOffset: number;
}

export interface Projectile {
  id: number;
  ownerId: string;
  isPlayer: boolean;
  weaponType: Exclude<WeaponType, null>;
  x: number;
  y: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  distanceTraveled: number;
  maxDistance: number;
  damage: number;
  isExplosive: boolean;
  blastRadius: number;
  color: string;
  radius: number;
}

export interface ExplosionEffect {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  duration: number;
  elapsed: number;
  style?: 'standard' | 'supernova' | 'void' | 'plasma' | 'skull' | 'cash';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape?: 'square' | 'circle' | 'spark' | 'skull' | 'dollar' | 'binary' | 'star' | 'lightning';
  alpha?: number;
  text?: string;
  rotation?: number;
  vRot?: number;
}

export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale?: number;
}

export interface KillNotification {
  id: number;
  killer: string;
  victim: string;
  weapon: WeaponType;
  time: number;
  rewardCoins?: number;
}

export interface SkinDef {
  id: string;
  name: string;
  price: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  coreGlow: string;
  eyeColor: string;
  pattern: 'cyber' | 'stealth' | 'gold' | 'neon' | 'matrix' | 'plasma' | 'glacial';
  headDetail: 'dual-cannon' | 'visor' | 'optic-sensor' | 'spikes';
  description: string;
}

export type DeathEffectType =
  | 'cyber-matrix'
  | 'nuclear-supernova'
  | 'neon-skull'
  | 'void-singularity'
  | 'golden-cash-storm'
  | 'plasma-storm'
  | 'laser-fireworks';

export interface DeathEffectDef {
  id: DeathEffectType;
  name: string;
  price: number;
  description: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  icon: string;
  particleCount: number;
}

export interface PlayerProfile {
  name: string;
  coins: number;
  highScore: number;
  maxKills: number;
  selectedSkinId: string;
  unlockedSkinIds: string[];
  selectedDeathEffectId: DeathEffectType;
  unlockedDeathEffectIds: DeathEffectType[];
}

export type MissionType =
  | 'play_games'
  | 'kills'
  | 'earn_cash'
  | 'kills_with_weapon'
  | 'reach_length'
  | 'reach_score';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;
  current: number;
  rewardCash: number;
  isClaimed: boolean;
  iconName: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  kills: number;
  skinId: string;
  badge?: string;
  date?: string;
  isPlayer?: boolean;
}

