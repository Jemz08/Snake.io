import { DeathEffectDef, DeathEffectType } from '../types';

export const DEATH_EFFECTS: DeathEffectDef[] = [
  {
    id: 'retro-pixel-kaboom',
    name: '8-Bit Arcade Kaboom',
    price: 0,
    badge: '8-BIT CLASSIC',
    description: 'Classic 8-bit multi-stage arcade explosion with chunky fire puffs, pixel smoke plumes, and flying pixel shrapnel.',
    primaryColor: '#f97316',
    secondaryColor: '#facc15',
    icon: 'kaboom',
    particleCount: 48,
  },
  {
    id: 'retro-crt-glitch',
    name: 'CRT Fatal Glitch 0x00',
    price: 150,
    badge: 'CYBER CRT',
    description: 'Fatal system crash decompiler: RGB chromatic aberration split, horizontal scanline tear, and cascading ERROR hex blocks.',
    primaryColor: '#22c55e',
    secondaryColor: '#ec4899',
    icon: 'glitch',
    particleCount: 52,
  },
  {
    id: 'retro-comic-boom',
    name: 'Comic Pop POW! Burst',
    price: 250,
    badge: 'POW! COMIC',
    description: 'Golden comic pop-art starburst blast with halftone dot rings and bold floating cartoon "POW!" and "KABOOM!" stamps.',
    primaryColor: '#f43f5e',
    secondaryColor: '#fbbf24',
    icon: 'comic',
    particleCount: 50,
  },
  {
    id: 'retro-arcade-ghost',
    name: '8-Bit Ghost Ascension',
    price: 350,
    badge: 'SOUL GHOST',
    description: 'Classic retro arcade soul release: snake dissolves into pixel dust while a glowing 8-bit ghost ascends with halo rings.',
    primaryColor: '#38bdf8',
    secondaryColor: '#a855f7',
    icon: 'ghost',
    particleCount: 42,
  },
  {
    id: 'retro-coin-jackpot',
    name: 'Arcade Jackpot 777',
    price: 450,
    badge: 'JACKPOT 777',
    description: 'Fabulous arcade payout eruption! High-speed spinning 8-bit gold coins, lucky 777 badges, and chiptune starbursts.',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    icon: 'coin',
    particleCount: 58,
  },
  {
    id: 'retro-pixel-skull',
    name: '16-Bit Doom Skull',
    price: 550,
    badge: 'DOOM SKULL',
    description: 'Sinister 16-bit boss skull erupts from the wreckage with crimson eye lasers, bone pixel shards, and expanding jaw blast.',
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    icon: 'skull',
    particleCount: 54,
  },
  {
    id: 'retro-synth-vector',
    name: 'Neon Synth Vector Grid',
    price: 650,
    badge: '80S VECTOR',
    description: '80s arcade vector cabinet wireframe rupture! Polygon wireframe geometries shatter into radiant neon laser spikes.',
    primaryColor: '#06b6d4',
    secondaryColor: '#f43f5e',
    icon: 'vector',
    particleCount: 50,
  },
  {
    id: 'retro-voxel-shatter',
    name: '3D Voxel Shrapnel Collapse',
    price: 750,
    badge: '3D VOXEL',
    description: 'The victim physically crumbles into dozens of tumbling 3D isometric pixel cubes (voxels) that bounce and scatter.',
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    icon: 'voxel',
    particleCount: 56,
  },
  {
    id: 'retro-slime-splat',
    name: 'Toxic Slime Meltdown',
    price: 850,
    badge: 'BIO-SLIME',
    description: 'Retro platformer bio-hazard meltdown: sizzling lime acid globules splatter with bubbling caustic vapor fumes.',
    primaryColor: '#84cc16',
    secondaryColor: '#10b981',
    icon: 'slime',
    particleCount: 48,
  },
  {
    id: 'retro-black-hole',
    name: '16-Bit Cosmic Void Rift',
    price: 1000,
    badge: 'COSMIC RIFT',
    description: '16-bit space shooter singularity: gravitational lensing accretion disc draws space inward before an antimatter rupture.',
    primaryColor: '#8b5cf6',
    secondaryColor: '#c084fc',
    icon: 'void',
    particleCount: 64,
  },
];

export const LEGACY_EFFECT_MAP: Record<string, DeathEffectType> = {
  'cyber-matrix': 'retro-pixel-kaboom',
  'nuclear-supernova': 'retro-pixel-kaboom',
  'neon-skull': 'retro-pixel-skull',
  'void-singularity': 'retro-black-hole',
  'golden-cash-storm': 'retro-coin-jackpot',
  'plasma-storm': 'retro-synth-vector',
  'laser-fireworks': 'retro-comic-boom',
  'bat-swarm': 'retro-arcade-ghost',
};

export function normalizeDeathEffectId(id: string | undefined | null): DeathEffectType {
  if (!id) return 'retro-pixel-kaboom';
  if (LEGACY_EFFECT_MAP[id]) return LEGACY_EFFECT_MAP[id];
  const found = DEATH_EFFECTS.find((e) => e.id === id);
  if (found) return found.id;
  return 'retro-pixel-kaboom';
}

export function getDeathEffectById(id: string): DeathEffectDef {
  const normId = normalizeDeathEffectId(id);
  return DEATH_EFFECTS.find((e) => e.id === normId) || DEATH_EFFECTS[0];
}
