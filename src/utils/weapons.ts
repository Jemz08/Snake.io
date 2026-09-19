import { WeaponDef, WeaponType } from '../types';

export const WEAPONS: Record<Exclude<WeaponType, null>, WeaponDef> = {
  grenade: {
    id: 'grenade',
    name: 'Tactical Grenade',
    ammo: 2,
    range: 480,
    speed: 7.5,
    fireCooldown: 850,
    damage: 999, // 1-hit kill if it explodes near other snakes!
    blastRadius: 180,
    isExplosive: true,
    color: '#f59e0b',
    glowColor: '#fbbf24',
    description: 'Launches an explosive payload. 1-HIT ELIMINATION in blast radius! (x2 Ammo)',
    badge: '1-HIT KILL',
  },
  pistol: {
    id: 'pistol',
    name: 'Pulse Pistol',
    ammo: 10,
    range: 360,
    speed: 15,
    fireCooldown: 250,
    damage: 32,
    isExplosive: false,
    color: '#38bdf8',
    glowColor: '#7dd3fc',
    description: 'Quick close-quarters sidearm with sharp velocity. (x10 Ammo, Short Range)',
    badge: 'SHORT RANGE',
  },
  ar: {
    id: 'ar',
    name: 'Assault Rifle',
    ammo: 30,
    range: 580,
    speed: 18,
    fireCooldown: 120,
    damage: 18,
    isExplosive: false,
    color: '#4ade80',
    glowColor: '#86efac',
    description: 'Rapid-fire combat rifle for sustained suppression. (x30 Ammo, Mid Range)',
    badge: 'MID RANGE',
  },
  sniper: {
    id: 'sniper',
    name: 'Rail Sniper',
    ammo: 5,
    range: 1150,
    speed: 30,
    fireCooldown: 800,
    damage: 85,
    isExplosive: false,
    color: '#f43f5e',
    glowColor: '#fda4af',
    description: 'High-velocity armor-piercing beam with extreme reach. (x5 Ammo, Long Range)',
    badge: 'LONG RANGE',
  },
};

export function getWeaponConfig(type: WeaponType): WeaponDef | null {
  if (!type) return null;
  return WEAPONS[type] || null;
}
