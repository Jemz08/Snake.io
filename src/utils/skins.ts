import { SkinDef } from '../types';

export const SKINS: SkinDef[] = [
  {
    id: 'angel-seraph',
    name: 'Seraphim Angel²',
    archetype: 'angel',
    badge: 'DIVINE',
    price: 0,
    primaryColor: '#f8fafc', // Divine pure white
    secondaryColor: '#fef08a', // Pale gold
    accentColor: '#eab308', // Radiant gold
    coreGlow: '#ffffff',
    eyeColor: '#38bdf8', // Seraphic cyan
    pattern: 'celestial',
    headDetail: 'angel-wings-halo',
    specialAura: 'Holy Starlight Aura',
    description: 'Divine celestial entity crowned with a levitating golden halo and radiant feathered wings.',
  },
  {
    id: 'devil-infernal',
    name: 'Infernal Devil²',
    archetype: 'devil',
    badge: 'DEMON',
    price: 0,
    primaryColor: '#18181b', // Obsidian charcoal
    secondaryColor: '#7f1d1d', // Deep blood crimson
    accentColor: '#ef4444', // Fiery scarlet
    coreGlow: '#f97316', // Molten lava orange
    eyeColor: '#fbbf24', // Blazing brimstone
    pattern: 'infernal',
    headDetail: 'devil-horns',
    specialAura: 'Hellfire Lava Vents',
    description: 'Demonic underworld titan with curved obsidian battle horns, magma fissures, and molten embers.',
  },
  {
    id: 'blackhole-void',
    name: 'Black Hole Void²',
    archetype: 'blackhole',
    badge: 'COSMIC',
    price: 0,
    primaryColor: '#030712', // Pure cosmic void
    secondaryColor: '#2e1065', // Dark matter violet
    accentColor: '#a855f7', // Accretion disk purple
    coreGlow: '#c084fc',
    eyeColor: '#38bdf8', // Event horizon cyan
    pattern: 'cosmic_void',
    headDetail: 'singularity-vortex',
    specialAura: 'Gravitational Singularity',
    description: 'Cosmic gravitational anomaly that warps space with a swirling event horizon singularity vortex.',
  },
  {
    id: 'robot-titan',
    name: 'Robot Titan MK-IV²',
    archetype: 'robot',
    badge: 'MECHA',
    price: 0,
    primaryColor: '#334155', // Heavy titanium steel
    secondaryColor: '#0f172a', // Industrial matte black
    accentColor: '#0ea5e9', // Cyber neon blue
    coreGlow: '#38bdf8',
    eyeColor: '#ef4444', // Scanning laser ocular
    pattern: 'mecha',
    headDetail: 'mecha-visor-antennas',
    specialAura: 'High-Voltage Discharge',
    description: 'Military-grade cybernetic warframe armed with hydraulic comms antennas and sweeping laser visor.',
  },
  {
    id: 'dragon-wyrm',
    name: 'Emerald Dragon²',
    archetype: 'dragon',
    badge: 'MYTHIC',
    price: 100,
    primaryColor: '#065f46', // Jade scales
    secondaryColor: '#022c22', // Dark emerald
    accentColor: '#10b981', // Dragonfire neon green
    coreGlow: '#6ee7b7',
    eyeColor: '#fde047', // Golden reptilian gaze
    pattern: 'draconic',
    headDetail: 'dragon-crest',
    specialAura: 'Dragonfire Flare',
    description: 'Ancient armored wyrm adorned with swept dragon crest horns and incandescent draconic plating.',
  },
  {
    id: 'cyber-viper',
    name: 'Cyber Viper²',
    archetype: 'cyber',
    badge: 'CYBER',
    price: 0,
    primaryColor: '#06b6d4', // Cyan
    secondaryColor: '#0e7490',
    accentColor: '#22d3ee',
    coreGlow: '#67e8f9',
    eyeColor: '#a5f3fc',
    pattern: 'cyber',
    headDetail: 'optic-sensor',
    description: 'Standard issue high-tech combat frame with reactive square armor tiles.',
  },
  {
    id: 'crimson-dread',
    name: 'Crimson Dread²',
    archetype: 'cyber',
    badge: 'ASSAULT',
    price: 150,
    primaryColor: '#ef4444', // Red
    secondaryColor: '#991b1b',
    accentColor: '#f87171',
    coreGlow: '#fca5a5',
    eyeColor: '#fef08a',
    pattern: 'plasma',
    headDetail: 'dual-cannon',
    description: 'Heavy assault chassis with heat-sink vents and blazing thermal scales.',
  },
  {
    id: 'acid-matrix',
    name: 'Acid Matrix²',
    archetype: 'cyber',
    badge: 'STEALTH',
    price: 180,
    primaryColor: '#22c55e', // Toxic neon green
    secondaryColor: '#15803d',
    accentColor: '#4ade80',
    coreGlow: '#86efac',
    eyeColor: '#d9f99d',
    pattern: 'matrix',
    headDetail: 'visor',
    description: 'Encrypted digital warrior loaded with glowing binary data streams.',
  },
  {
    id: 'void-stalker',
    name: 'Void Stalker²',
    archetype: 'blackhole',
    badge: 'VOID',
    price: 220,
    primaryColor: '#a855f7', // Purple
    secondaryColor: '#6b21a8',
    accentColor: '#c084fc',
    coreGlow: '#e9d5ff',
    eyeColor: '#f472b6',
    pattern: 'stealth',
    headDetail: 'spikes',
    description: 'Stealth-coated obsidian body with dark matter energy cells.',
  },
  {
    id: 'glacial-prime',
    name: 'Glacial Prime²',
    archetype: 'cyber',
    badge: 'CRYO',
    price: 250,
    primaryColor: '#38bdf8', // Ice blue
    secondaryColor: '#1e3a8a',
    accentColor: '#93c5fd',
    coreGlow: '#ffffff',
    eyeColor: '#67e8f9',
    pattern: 'glacial',
    headDetail: 'optic-sensor',
    description: 'Cryo-hardened crystalline plating designed for zero-kelvin battlefields.',
  },
  {
    id: 'solar-destroyer',
    name: 'Solar Destroyer²',
    archetype: 'cyber',
    badge: 'SOLAR',
    price: 320,
    primaryColor: '#f97316', // Orange
    secondaryColor: '#c2410c',
    accentColor: '#fb923c',
    coreGlow: '#fde047',
    eyeColor: '#ffffff',
    pattern: 'plasma',
    headDetail: 'dual-cannon',
    description: 'Thermonuclear fusion engine core emitting blinding solar flares.',
  },
  {
    id: 'golden-mecha',
    name: 'Golden Mecha²',
    archetype: 'robot',
    badge: 'PRESTIGE',
    price: 450,
    primaryColor: '#eab308', // Gold
    secondaryColor: '#854d0e',
    accentColor: '#fde047',
    coreGlow: '#fef9c3',
    eyeColor: '#ef4444',
    pattern: 'gold',
    headDetail: 'dual-cannon',
    description: 'Elite royal prestige armor forged with reinforced auric alloy.',
  },
];

export function getSkinById(id: string): SkinDef {
  return SKINS.find((s) => s.id === id) || SKINS[0];
}
