import { BattlePassTier, MasteryBadge, PlayerProfile } from '../types';

export const XP_PER_TIER = 1000;

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  {
    tier: 1,
    requiredXp: 1000,
    rewardType: 'coins',
    rewardValue: 800,
    rewardName: '800 Cyber Cash',
    rewardIcon: '💰',
  },
  {
    tier: 2,
    requiredXp: 2000,
    rewardType: 'trail',
    rewardValue: 'matrix',
    rewardName: 'Matrix Digital Rain Trail',
    rewardIcon: '💻',
  },
  {
    tier: 3,
    requiredXp: 3000,
    rewardType: 'coins',
    rewardValue: 1200,
    rewardName: '1,200 Cyber Cash',
    rewardIcon: '💰',
  },
  {
    tier: 4,
    requiredXp: 4000,
    rewardType: 'trail',
    rewardValue: 'bubbles',
    rewardName: 'Neon Cyber Bubbles Trail',
    rewardIcon: '🫧',
  },
  {
    tier: 5,
    requiredXp: 5000,
    rewardType: 'skin',
    rewardValue: 'cyber-hazard',
    rewardName: 'Toxic Cyber Hazard² Skin',
    rewardIcon: '☣️',
  },
  {
    tier: 6,
    requiredXp: 6000,
    rewardType: 'coins',
    rewardValue: 1600,
    rewardName: '1,600 Cyber Cash',
    rewardIcon: '💰',
  },
  {
    tier: 7,
    requiredXp: 7000,
    rewardType: 'trail',
    rewardValue: 'lightning',
    rewardName: 'Plasma Lightning Trail',
    rewardIcon: '⚡',
  },
  {
    tier: 8,
    requiredXp: 8000,
    rewardType: 'coins',
    rewardValue: 2000,
    rewardName: '2,000 Cyber Cash',
    rewardIcon: '💰',
  },
  {
    tier: 9,
    requiredXp: 9000,
    rewardType: 'trail',
    rewardValue: 'fire',
    rewardName: 'Inferno Afterburner Trail',
    rewardIcon: '🔥',
  },
  {
    tier: 10,
    requiredXp: 10000,
    rewardType: 'skin',
    rewardValue: 'neon-overlord',
    rewardName: 'Neon Synth Overlord² Skin',
    rewardIcon: '👑',
  },
  {
    tier: 11,
    requiredXp: 11000,
    rewardType: 'coins',
    rewardValue: 2500,
    rewardName: '2,500 Cyber Cash',
    rewardIcon: '💰',
  },
  {
    tier: 12,
    requiredXp: 12000,
    rewardType: 'trail',
    rewardValue: 'rainbow',
    rewardName: 'Vaporwave Rainbow Trail',
    rewardIcon: '🌈',
  },
  {
    tier: 13,
    requiredXp: 13000,
    rewardType: 'coins',
    rewardValue: 3000,
    rewardName: '3,000 Cyber Cash',
    rewardIcon: '💰',
  },
  {
    tier: 14,
    requiredXp: 14000,
    rewardType: 'trail',
    rewardValue: 'stardust',
    rewardName: 'Cosmic Stardust Trail',
    rewardIcon: '✨',
  },
  {
    tier: 15,
    requiredXp: 15000,
    rewardType: 'skin',
    rewardValue: 'quantum-god',
    rewardName: '★ QUANTUM OMNI-DEITY ★ Skin',
    rewardIcon: '🌌',
  },
];

export function getBattlePassLevel(xp: number): {
  currentTier: number;
  xpIntoCurrentTier: number;
  xpNeededForNextTier: number;
  percentToNextTier: number;
  isMaxTier: boolean;
} {
  const currentTier = Math.min(15, Math.floor(xp / XP_PER_TIER));
  const isMaxTier = currentTier >= 15;
  const xpIntoCurrentTier = isMaxTier ? XP_PER_TIER : xp % XP_PER_TIER;
  const xpNeededForNextTier = isMaxTier ? 0 : XP_PER_TIER - xpIntoCurrentTier;
  const percentToNextTier = isMaxTier ? 100 : Math.floor((xpIntoCurrentTier / XP_PER_TIER) * 100);

  return {
    currentTier,
    xpIntoCurrentTier,
    xpNeededForNextTier,
    percentToNextTier,
    isMaxTier,
  };
}

export function calculateMatchXp(
  statsOrScore: number | { score: number; kills: number; gameMode?: string; wave?: number },
  optionalKills?: number,
  optionalMode?: string,
  optionalWave?: number
): number {
  let score = 0;
  let kills = 0;
  let mode = 'battle_royale';
  let wave = 1;

  if (typeof statsOrScore === 'object') {
    score = statsOrScore.score || 0;
    kills = statsOrScore.kills || 0;
    mode = statsOrScore.gameMode || 'battle_royale';
    wave = statsOrScore.wave || 1;
  } else {
    score = statsOrScore;
    kills = optionalKills || 0;
    mode = optionalMode || 'battle_royale';
    wave = optionalWave || 1;
  }

  let xp = Math.floor(score * 0.15) + kills * 120;
  if (mode === 'horde' && wave) {
    xp += wave * 250;
  } else if (mode === 'instant_death') {
    xp = Math.floor(xp * 1.5);
  } else if (mode === 'pellet_rush') {
    xp = Math.floor(xp * 1.25);
  }
  return Math.max(50, xp);
}

export const PILOT_MASTERY_BADGES: MasteryBadge[] = [
  {
    id: 'sharpshooter',
    name: 'Tactical Sharpshooter',
    icon: '🎯',
    description: 'Eliminate 15 rival snakes using the Railgun Sniper rifle.',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
    category: 'Combat',
  },
  {
    id: 'apex_predator',
    name: 'Apex Predator',
    icon: '👑',
    description: 'Achieve 8 or more eliminations in a single match.',
    unlocked: false,
    progress: 0,
    maxProgress: 8,
    category: 'Combat',
  },
  {
    id: 'titan',
    name: 'Titan Class Serpent',
    icon: '🛡️',
    description: 'Grow your serpent to a target length of 80 segments or more.',
    unlocked: false,
    progress: 0,
    maxProgress: 80,
    category: 'Growth',
  },
  {
    id: 'wave_slayer',
    name: 'Wave Slayer',
    icon: '👾',
    description: 'Survive to Wave 5 in Horde Waves PvE mode.',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    category: 'Survival',
  },
  {
    id: 'high_roller',
    name: 'Cyber Tycoon',
    icon: '💰',
    description: 'Accumulate 10,000 Cyber Cash coins.',
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
    category: 'Economy',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Score 2,500 or more in Pellet Rush 90s time attack.',
    unlocked: false,
    progress: 0,
    maxProgress: 2500,
    category: 'Speed',
  },
];

export function evaluateMasteryBadges(profile: PlayerProfile): MasteryBadge[] {
  return PILOT_MASTERY_BADGES.map((badge) => {
    let progress = 0;
    if (badge.id === 'sharpshooter') {
      progress = profile.totalSniperKills || 0;
    } else if (badge.id === 'apex_predator') {
      progress = profile.maxKills || 0;
    } else if (badge.id === 'titan') {
      progress = Math.min(badge.maxProgress, Math.floor((profile.highScore || 0) / 25));
    } else if (badge.id === 'wave_slayer') {
      progress = profile.totalHordeWavesBeaten || 0;
    } else if (badge.id === 'high_roller') {
      progress = profile.coins || 0;
    } else if (badge.id === 'speed_demon') {
      progress = profile.modeHighScores?.pellet_rush || 0;
    }

    const unlocked =
      (profile.unlockedMasteryBadges && profile.unlockedMasteryBadges.includes(badge.id)) ||
      progress >= badge.maxProgress;

    return {
      ...badge,
      progress: Math.min(progress, badge.maxProgress),
      unlocked,
    };
  });
}
