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
  archetype?: SnakeArchetype;
  // AABB Bounding Box for ultra-fast collision rejection
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  // Shield Defense System
  shieldHp?: number;
  maxShieldHp?: number;
  shieldTimer?: number;
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
  // Archetype Active & Passive Ability State
  abilityCooldownTimer?: number; // Countdown in seconds until active ability ready (0 = ready)
  abilityActiveTimer?: number; // Active duration timer in seconds
  abilityLevel?: number; // 1 or 2 (Lv.2 style upgrade unlocked)
  // Passive combat modifiers
  soulHarvestBonusDamage?: number; // Devil passive (+5% per kill)
  lastDamageTakenTime?: number; // Angel passive (out of combat health regen)
  autoRepairTimer?: number; // Robot passive (repair tick timer)
  isOverheated?: boolean; // Robot active penalty timer
  overheatTimer?: number;
  isWeaponJammed?: boolean; // Cyber passive weapon jam on attacker
  weaponJammedTimer?: number;
  // Glitch decoy afterimage coordinates
  decoyX?: number;
  decoyY?: number;
  decoyTimer?: number;
  decoyAngle?: number;
  // New Archetype fields
  hasRevived?: boolean; // Phoenix rebirth once per match
  trailDropTimer?: number; // Timer for dropping fire/ice/toxic trails
  freezeLevel?: number; // Frost stack (0 to 5)
  freezeTimer?: number;
  poisonTimer?: number; // Venom DoT timer
  poisonDamagePerSec?: number;
  poisonAttackerId?: string;
  isPhasing?: boolean; // Phantom phase through obstacles
  chronoBubbleActive?: boolean; // Chrono slow bubble
  smokeEscapeTimer?: number; // Ninja smoke bomb escape invisibility
  ninjaSlashCooldown?: number; // Ninja melee dash-slash cooldown
  isReflecting?: boolean; // Crystal bullet reflection
}

export interface TrailHazard {
  id: number;
  ownerId: string;
  x: number;
  y: number;
  radius: number;
  type: 'fire' | 'ice' | 'toxic';
  duration: number;
  maxDuration: number;
  color: string;
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
  duration?: number; // Lifetime duration in seconds before despawning (2-3s for snake drops)
  maxDuration?: number;
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

export interface ShieldPowerup {
  id: number;
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
  bobOffset: number;
  shieldAmount: number;
}

export type ObstacleShape = 'circle' | 'rect';

export interface MapObstacle {
  id: number;
  x: number;
  y: number;
  shape: ObstacleShape;
  radius?: number; // for circular bunkers / pillars
  width?: number;  // for rectangular blast barriers
  height?: number;
  rotation?: number; // optional orientation angle
  label?: string;    // optional tactical readout label
  type: 'titanium_bunker' | 'forcefield_pillar' | 'blast_barrier';
  color: string;
  borderColor: string;
  glowColor: string;
  hitPulse?: number; // visual deflection ripple when blocking bullets
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
  style?:
    | 'standard'
    | 'supernova'
    | 'void'
    | 'plasma'
    | 'skull'
    | 'cash'
    | 'bat-swarm'
    | 'retro-pixel-puff'
    | 'retro-crt-glitch'
    | 'retro-comic-pow'
    | 'retro-arcade-ghost'
    | 'retro-coin-shower'
    | 'retro-pixel-skull'
    | 'retro-synth-vector'
    | 'retro-voxel-shatter'
    | 'retro-slime-splat'
    | 'retro-black-hole';
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
  shape?:
    | 'square'
    | 'circle'
    | 'spark'
    | 'skull'
    | 'dollar'
    | 'binary'
    | 'star'
    | 'lightning'
    | 'bat'
    | 'snowflake'
    | 'gear'
    | 'fire-trail'
    | 'acid'
    | 'retro-coin'
    | 'retro-ghost'
    | 'retro-voxel'
    | 'retro-slime'
    | 'retro-vector'
    | 'retro-comic'
    | 'retro-glitch-bar'
    | 'retro-skull'
    | 'retro-flame-pixel';
  alpha?: number;
  text?: string;
  rotation?: number;
  vRot?: number;
  secondaryColor?: string;
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

export type SnakeArchetype =
  | 'angel'
  | 'devil'
  | 'blackhole'
  | 'robot'
  | 'dragon'
  | 'cyber'
  | 'phoenix'
  | 'frost'
  | 'venom'
  | 'storm'
  | 'phantom'
  | 'vampire'
  | 'chrono'
  | 'ninja'
  | 'crystal'
  | 'alien';

export type SkinRarity = 'common' | 'uncommon' | 'epic' | 'legendary' | 'mythic' | 'secret';

export interface SkinDef {
  id: string;
  name: string;
  archetype?: SnakeArchetype;
  rarity?: SkinRarity;
  badge?: string;
  price: number;
  crateExclusive?: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  coreGlow: string;
  eyeColor: string;
  pattern:
    | 'cyber'
    | 'stealth'
    | 'gold'
    | 'neon'
    | 'matrix'
    | 'plasma'
    | 'glacial'
    | 'celestial'
    | 'infernal'
    | 'cosmic_void'
    | 'mecha'
    | 'draconic'
    | 'phoenix'
    | 'frost'
    | 'venom'
    | 'storm'
    | 'phantom'
    | 'vampire'
    | 'chrono'
    | 'ninja'
    | 'crystal'
    | 'alien'
    | 'rainbow'
    | 'glitch';
  headDetail:
    | 'dual-cannon'
    | 'visor'
    | 'optic-sensor'
    | 'spikes'
    | 'angel-wings-halo'
    | 'devil-horns'
    | 'singularity-vortex'
    | 'mecha-visor-antennas'
    | 'dragon-crest'
    | 'phoenix-crest'
    | 'frost-horns'
    | 'venom-fangs'
    | 'storm-conductor'
    | 'phantom-cowl'
    | 'vampire-fangs'
    | 'chrono-gear'
    | 'ninja-mask'
    | 'crystal-facets'
    | 'alien-antennae';
  specialAura?: string;
  description: string;
}

export type DeathEffectType =
  | 'retro-pixel-kaboom'
  | 'retro-crt-glitch'
  | 'retro-comic-boom'
  | 'retro-arcade-ghost'
  | 'retro-coin-jackpot'
  | 'retro-pixel-skull'
  | 'retro-synth-vector'
  | 'retro-voxel-shatter'
  | 'retro-slime-splat'
  | 'retro-black-hole'
  | 'cyber-matrix'
  | 'nuclear-supernova'
  | 'neon-skull'
  | 'void-singularity'
  | 'golden-cash-storm'
  | 'plasma-storm'
  | 'laser-fireworks'
  | 'bat-swarm';

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
  style?: string;
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

export interface HudElementPosition {
  x: number; // Percent 0-100 or pixels
  y: number; // Percent 0-100 or pixels
  scale: number; // 0.6 to 1.6
  opacity: number; // 0.3 to 1.0
  visible?: boolean;
}

export interface HudLayoutConfig {
  isFloatingJoystick: boolean;
  joystick: HudElementPosition;
  firePad: HudElementPosition;
  boostBtn: HudElementPosition;
  abilityBtn: HudElementPosition;
  weaponGauge: HudElementPosition;
  statsBar: HudElementPosition;
  minimap: HudElementPosition;
  leaderboard: HudElementPosition;
}

