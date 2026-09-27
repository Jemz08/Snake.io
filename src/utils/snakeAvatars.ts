import { SnakeArchetype } from '../types';

export type SnakeAvatarId =
  | 'angel'
  | 'devil'
  | 'void'
  | 'robot'
  | 'dragon'
  | 'cyber'
  | 'phoenix'
  | 'frost'
  | 'venom'
  | 'storm'
  | 'vampire'
  | 'chrono'
  | 'ninja'
  | 'crystal'
  | 'alien';

export interface SnakeAvatarDef {
  id: SnakeAvatarId;
  name: string;
  archetype: SnakeArchetype;
  archetypeLabel: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string; // Emoji / shorthand
  themeColor: string; // Primary accent
  glowColor: string;
  borderColor: string;
  cardBg: string;
  eyeColor: string;
  category: 'celestial' | 'elemental' | 'tech' | 'shadow';
  description: string;
}

export const SNAKE_AVATARS: SnakeAvatarDef[] = [
  // 1. ANGEL
  {
    id: 'angel',
    name: 'Seraphim Angel²',
    archetype: 'angel',
    archetypeLabel: 'ANGEL',
    title: 'DIVINE GUARDIAN',
    subtitle: 'Sacred Wings & Starlight Halo',
    badge: 'DIVINE',
    icon: '🪽',
    themeColor: '#38bdf8',
    glowColor: '#facc15',
    borderColor: '#38bdf8',
    cardBg: 'from-sky-950/90 via-slate-900/90 to-amber-950/50',
    eyeColor: '#38bdf8',
    category: 'celestial',
    description: 'Celestial entity crowned with a levitating golden halo, feathered wings, and holy starlight gaze.',
  },
  // 2. DEVIL
  {
    id: 'devil',
    name: 'Brimstone Devil²',
    archetype: 'devil',
    archetypeLabel: 'DEVIL',
    title: 'HELLFIRE OVERLORD',
    subtitle: 'Obsidian Spikes & Magma Horns',
    badge: 'INFERNAL',
    icon: '😈',
    themeColor: '#ef4444',
    glowColor: '#f97316',
    borderColor: '#ef4444',
    cardBg: 'from-rose-950/90 via-slate-900/90 to-red-950/60',
    eyeColor: '#facc15',
    category: 'shadow',
    description: 'Demonic abyss fiend forged from volcanic obsidian with twin jagged horns and soul harvest fury.',
  },
  // 3. VOID
  {
    id: 'void',
    name: 'Cosmic Singularity²',
    archetype: 'blackhole',
    archetypeLabel: 'VOID',
    title: 'EVENT HORIZON',
    subtitle: 'Dark Matter & Graviton Rings',
    badge: 'SINGULARITY',
    icon: '🌌',
    themeColor: '#c084fc',
    glowColor: '#a855f7',
    borderColor: '#a855f7',
    cardBg: 'from-purple-950/90 via-slate-900/90 to-fuchsia-950/60',
    eyeColor: '#f0abfc',
    category: 'celestial',
    description: 'Deep-space black hole anomaly encased in spinning accretion disks and pure cosmic dark matter.',
  },
  // 4. ROBOT
  {
    id: 'robot',
    name: 'Titan Colossus²',
    archetype: 'robot',
    archetypeLabel: 'ROBOT',
    title: 'HEAVY AUTOMATON',
    subtitle: 'Titanium Armor & Sensor Visor',
    badge: 'ARMORED',
    icon: '🤖',
    themeColor: '#38bdf8',
    glowColor: '#0ea5e9',
    borderColor: '#0284c7',
    cardBg: 'from-cyan-950/90 via-slate-900/90 to-sky-950/60',
    eyeColor: '#38bdf8',
    category: 'tech',
    description: 'Heavy military combat chassis reinforced with hydraulic antennas and high-power laser optic scanners.',
  },
  // 5. DRAGON
  {
    id: 'dragon',
    name: 'Solar Wyrm²',
    archetype: 'dragon',
    archetypeLabel: 'DRAGON',
    title: 'INFERNO DRAGON',
    subtitle: 'Golden Crest & Blazing Scales',
    badge: 'DRACONIC',
    icon: '🐉',
    themeColor: '#f97316',
    glowColor: '#facc15',
    borderColor: '#ea580c',
    cardBg: 'from-amber-950/90 via-slate-900/90 to-orange-950/60',
    eyeColor: '#fef08a',
    category: 'elemental',
    description: 'Ancient draconic sovereign adorned with sweeping golden horns, whiskers, and apocalyptic fire breath.',
  },
  // 6. CYBER
  {
    id: 'cyber',
    name: 'Neon Glitch²',
    archetype: 'cyber',
    archetypeLabel: 'CYBER',
    title: 'QUANTUM MATRIX',
    subtitle: 'RGB Circuitry & Chromatic Split',
    badge: 'OVERLOAD',
    icon: '⚡',
    themeColor: '#e879f9',
    glowColor: '#06b6d4',
    borderColor: '#c026d3',
    cardBg: 'from-fuchsia-950/90 via-slate-900/90 to-cyan-950/60',
    eyeColor: '#22d3ee',
    category: 'tech',
    description: 'High-speed synthetic netrunner coursing with hot neon circuitry, pixel tearing, and EMP disruption.',
  },
  // 7. PHOENIX
  {
    id: 'phoenix',
    name: 'Solar Phoenix²',
    archetype: 'phoenix',
    archetypeLabel: 'PHOENIX',
    title: 'IMMORTAL REBIRTH',
    subtitle: 'Sun Plumes & Blazing Feathers',
    badge: 'REBIRTH',
    icon: '🔥',
    themeColor: '#f97316',
    glowColor: '#fbbf24',
    borderColor: '#f97316',
    cardBg: 'from-orange-950/90 via-slate-900/90 to-amber-950/60',
    eyeColor: '#ffffff',
    category: 'elemental',
    description: 'Legendary firebird serpent with radiant solar quills that rises from its own ashes once per match.',
  },
  // 8. FROST
  {
    id: 'frost',
    name: 'Glacial Wyrm²',
    archetype: 'frost',
    archetypeLabel: 'FROST',
    title: 'ABSOLUTE ZERO',
    subtitle: 'Icicle Horns & Diamond Brow',
    badge: 'GLACIAL',
    icon: '❄️',
    themeColor: '#38bdf8',
    glowColor: '#bae6fd',
    borderColor: '#38bdf8',
    cardBg: 'from-sky-950/90 via-slate-900/90 to-cyan-950/60',
    eyeColor: '#e0f2fe',
    category: 'elemental',
    description: 'Arctic frost serpent carved from permafrost diamonds, leaving freezing blizzards in its wake.',
  },
  // 9. VENOM
  {
    id: 'venom',
    name: 'Toxic Cobra²',
    archetype: 'venom',
    archetypeLabel: 'VENOM',
    title: 'BIOHAZARD ACID',
    subtitle: 'Corrosive Fangs & Hood Frills',
    badge: 'CORROSIVE',
    icon: '☣️',
    themeColor: '#84cc16',
    glowColor: '#a3e635',
    borderColor: '#65a30d',
    cardBg: 'from-lime-950/90 via-slate-900/90 to-emerald-950/60',
    eyeColor: '#bef264',
    category: 'elemental',
    description: 'Venomous king cobra equipped with flared biohazard hood frills and acid-dripping tungsten fangs.',
  },
  // 10. STORM
  {
    id: 'storm',
    name: 'Tesla Storm²',
    archetype: 'storm',
    archetypeLabel: 'STORM',
    title: 'CHAIN LIGHTNING',
    subtitle: 'Dual Electrodes & Electric Arcs',
    badge: 'VOLTAGE',
    icon: '⚡',
    themeColor: '#60a5fa',
    glowColor: '#facc15',
    borderColor: '#2563eb',
    cardBg: 'from-blue-950/90 via-slate-900/90 to-sky-950/60',
    eyeColor: '#93c5fd',
    category: 'elemental',
    description: 'High-voltage electric powerhouse flanked by Tesla coil conductor prongs and continuous lightning arcs.',
  },
  // 11. VAMPIRE
  {
    id: 'vampire',
    name: 'Gothic Vampire²',
    archetype: 'vampire',
    archetypeLabel: 'VAMPIRE',
    title: 'BLOOD LUST',
    subtitle: 'Bat Crests & Blood Ruby Gem',
    badge: 'LIFESTEAL',
    icon: '🦇',
    themeColor: '#ef4444',
    glowColor: '#b91c1c',
    borderColor: '#dc2626',
    cardBg: 'from-red-950/90 via-slate-900/90 to-rose-950/60',
    eyeColor: '#fca5a5',
    category: 'shadow',
    description: 'Nocturnal apex predator crowned with bat wing cowl crests and elongated lifesteal fangs.',
  },
  // 12. CHRONO
  {
    id: 'chrono',
    name: 'Temporal Chrono²',
    archetype: 'chrono',
    archetypeLabel: 'CHRONO',
    title: 'TIME BENDER',
    subtitle: 'Clockwork Gears & Quantum Dial',
    badge: 'TEMPORAL',
    icon: '⏱️',
    themeColor: '#38bdf8',
    glowColor: '#fbbf24',
    borderColor: '#0284c7',
    cardBg: 'from-cyan-950/90 via-slate-900/90 to-amber-950/50',
    eyeColor: '#fef08a',
    category: 'tech',
    description: 'Master of temporal mechanics equipped with rotating brass gear teeth and slow-motion chronosphere.',
  },
  // 13. NINJA
  {
    id: 'ninja',
    name: 'Shadow Shinobi²',
    archetype: 'ninja',
    archetypeLabel: 'NINJA',
    title: 'SHADOW ASSASSIN',
    subtitle: 'Shuriken Fins & Crimson Optic',
    badge: 'STEALTH',
    icon: '🥷',
    themeColor: '#a855f7',
    glowColor: '#ef4444',
    borderColor: '#7e22ce',
    cardBg: 'from-purple-950/90 via-slate-900/90 to-neutral-950/80',
    eyeColor: '#ef4444',
    category: 'shadow',
    description: 'Covert shinobi serpent cloaked in darkness with razor shuriken blade fins and sudden dash-slash strike.',
  },
  // 14. CRYSTAL
  {
    id: 'crystal',
    name: 'Prism Crystal²',
    archetype: 'crystal',
    archetypeLabel: 'CRYSTAL',
    title: 'DEFLECTIVE PRISM',
    subtitle: 'Faceted Diamond & Sapphire Shards',
    badge: 'REFLECT',
    icon: '💎',
    themeColor: '#818cf8',
    glowColor: '#67e8f9',
    borderColor: '#6366f1',
    cardBg: 'from-indigo-950/90 via-slate-900/90 to-cyan-950/60',
    eyeColor: '#a5f3fc',
    category: 'celestial',
    description: 'Resplendent geode crystal serpent reflecting enemy projectiles with impenetrable faceted prisms.',
  },
  // 15. ALIEN
  {
    id: 'alien',
    name: 'Bio Xenomorph²',
    archetype: 'alien',
    archetypeLabel: 'ALIEN',
    title: 'XENOMORPH HIVE',
    subtitle: 'Ribbed Carapace & Acid Antennae',
    badge: 'EXTRATERRESTRIAL',
    icon: '👽',
    themeColor: '#22c55e',
    glowColor: '#86efac',
    borderColor: '#16a34a',
    cardBg: 'from-emerald-950/90 via-slate-900/90 to-lime-950/60',
    eyeColor: '#4ade80',
    category: 'shadow',
    description: 'Alien biomechanical hunter with segmented ribcage exoskeleton and omnidirectional acid spray.',
  },
];

export function getSnakeAvatarById(id: string | undefined): SnakeAvatarDef {
  if (!id) return SNAKE_AVATARS[0];
  const found = SNAKE_AVATARS.find((a) => a.id === id || a.archetype === id);
  if (found) return found;

  // If skin ID passed like "angel-seraph" or "devil-infernal"
  if (id.includes('angel')) return SNAKE_AVATARS[0];
  if (id.includes('devil')) return SNAKE_AVATARS[1];
  if (id.includes('blackhole') || id.includes('void')) return SNAKE_AVATARS[2];
  if (id.includes('robot') || id.includes('mecha')) return SNAKE_AVATARS[3];
  if (id.includes('dragon')) return SNAKE_AVATARS[4];
  if (id.includes('cyber')) return SNAKE_AVATARS[5];
  if (id.includes('phoenix')) return SNAKE_AVATARS[6];
  if (id.includes('frost')) return SNAKE_AVATARS[7];
  if (id.includes('venom')) return SNAKE_AVATARS[8];
  if (id.includes('storm')) return SNAKE_AVATARS[9];
  if (id.includes('vampire')) return SNAKE_AVATARS[10];
  if (id.includes('chrono')) return SNAKE_AVATARS[11];
  if (id.includes('ninja')) return SNAKE_AVATARS[12];
  if (id.includes('crystal')) return SNAKE_AVATARS[13];
  if (id.includes('alien')) return SNAKE_AVATARS[14];

  return SNAKE_AVATARS[0];
}
