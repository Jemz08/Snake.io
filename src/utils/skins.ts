import { SkinDef } from '../types';

export const SKINS: SkinDef[] = [
  {
    id: 'cyber-viper',
    name: 'Cyber Viper²',
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
