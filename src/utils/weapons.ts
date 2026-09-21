import { WeaponDef, WeaponType } from '../types';

export const WEAPONS: Record<Exclude<WeaponType, null>, WeaponDef> = {
  grenade: {
    id: 'grenade',
    name: 'Tactical Grenade',
    ammo: 2,
    range: 460,
    speed: 7.2,
    fireCooldown: 950,
    damage: 130, // Balanced heavy explosive damage (not auto 999 cheat kill)
    blastRadius: 155,
    isExplosive: true,
    color: '#f59e0b',
    glowColor: '#fbbf24',
    description: 'Launches an explosive payload. Deals massive 130 AoE blast damage! (x2 Ammo)',
    badge: 'HEAVY BLAST',
  },
  pistol: {
    id: 'pistol',
    name: 'Pulse Pistol',
    ammo: 10,
    range: 350,
    speed: 14.5,
    fireCooldown: 280,
    damage: 20, // Nerfed from 32 (takes ~5 hits instead of 3 to eliminate 100 HP snake)
    isExplosive: false,
    color: '#38bdf8',
    glowColor: '#7dd3fc',
    description: 'Quick close-quarters sidearm with sharp velocity. (x10 Ammo, Short Range)',
    badge: 'SHORT RANGE',
  },
  ar: {
    id: 'ar',
    name: 'Assault Rifle',
    ammo: 28, // Reduced from 30
    range: 540,
    speed: 17,
    fireCooldown: 140, // Nerfed cadence from 120ms
    damage: 11, // Nerfed from 18 to stop instantaneous melting
    isExplosive: false,
    color: '#4ade80',
    glowColor: '#86efac',
    description: 'Rapid-fire combat rifle for sustained suppression. (x28 Ammo, Mid Range)',
    badge: 'MID RANGE',
  },
  sniper: {
    id: 'sniper',
    name: 'Rail Sniper',
    ammo: 4, // Reduced from 5
    range: 1050,
    speed: 28,
    fireCooldown: 900,
    damage: 55, // Nerfed from 85 (takes 2 direct precision hits to down a full HP snake)
    isExplosive: false,
    color: '#f43f5e',
    glowColor: '#fda4af',
    description: 'High-velocity armor-piercing beam with extreme reach. (x4 Ammo, Long Range)',
    badge: 'LONG RANGE',
  },
};

export function getWeaponConfig(type: WeaponType): WeaponDef | null {
  if (!type) return null;
  return WEAPONS[type] || null;
}
