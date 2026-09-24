import { GameMode, GameModeDef, BotDifficulty } from '../types';

export const GAME_MODES: GameModeDef[] = [
  {
    id: 'battle_royale',
    name: 'Battle Royale',
    tagline: 'Last Serpent Standing',
    description: 'Classic open-arena survival combat. Collect weapon crates, eliminate rival snakes, and climb the leaderboard.',
    icon: '👑',
    badgeColor: 'border-amber-500/50 text-amber-400 bg-amber-950/40',
    multiplierText: '1.0x Rewards',
  },
  {
    id: 'boss_raid',
    name: 'Boss Raid: MECHA-HYDRA',
    tagline: 'Titan Class Asymmetric Encounter',
    description: 'Raid battle against the colossal MECHA-HYDRA 9000! Destroy power turrets, dodge sweeping plasma lasers, and breach its exposed singularity core.',
    icon: '🤖',
    badgeColor: 'border-amber-500/60 text-amber-300 bg-amber-950/50',
    multiplierText: '4.0x Boss Caches & XP',
  },
  {
    id: 'bounty_hunt',
    name: 'Cyber Bounty Hunter',
    tagline: 'Eliminate High-Value Targets',
    description: 'Track marked High-Value Targets with 360° radar compass beacons. Claim huge cash bounties, or become the Most Wanted and survive the arena hunt!',
    icon: '🎯',
    badgeColor: 'border-yellow-500/60 text-yellow-300 bg-yellow-950/50',
    multiplierText: '3.5x Bounty Gold',
  },
  {
    id: 'horde',
    name: 'Horde Waves (PvE)',
    tagline: 'Defend Against Rogue Drone Worms',
    description: 'Survive intensifying waves of rogue AI drone worms and explosive swarmers. Face the Dreadnought Boss at Wave 5!',
    icon: '👾',
    badgeColor: 'border-red-500/50 text-red-400 bg-red-950/40',
    multiplierText: '2.0x XP & Cash',
  },
  {
    id: 'instant_death',
    name: 'Hardcore 1-Hit',
    tagline: 'Lethal Precision Combat',
    description: 'Zero margin for error. A single direct projectile or head-on ram obliterates any snake instantly. Reflexes decide all.',
    icon: '⚡',
    badgeColor: 'border-purple-500/50 text-purple-400 bg-purple-950/40',
    multiplierText: '2.5x Bounty Cash',
  },
  {
    id: 'pellet_rush',
    name: 'Pellet Rush 90s',
    tagline: 'Frenetic High-Speed Time Attack',
    description: '90-second countdown! Pellets yield 3x points and hyper-speed energy orbs spawn in massive clusters. Race against time!',
    icon: '⏱️',
    badgeColor: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40',
    multiplierText: '3.0x Score Rush',
  },
];

export function getGameModeById(id?: GameMode): GameModeDef {
  return GAME_MODES.find((m) => m.id === id) || GAME_MODES[0];
}

export interface BotDifficultyConfig {
  id: BotDifficulty;
  name: string;
  tagline: string;
  speedScale: number;
  aimPrecision: number;
  fireCooldownMultiplier: number;
  reactionDelay: number;
  color: string;
}

export const BOT_DIFFICULTIES: Record<BotDifficulty, BotDifficultyConfig> = {
  casual: {
    id: 'casual',
    name: 'Casual',
    tagline: 'Relaxed AI behavior, forgiving targeting',
    speedScale: 0.9,
    aimPrecision: 0.6,
    fireCooldownMultiplier: 1.5,
    reactionDelay: 0.6,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
  },
  tactical: {
    id: 'tactical',
    name: 'Tactical',
    tagline: 'Balanced combat AI with tactical flanking',
    speedScale: 1.0,
    aimPrecision: 0.85,
    fireCooldownMultiplier: 1.0,
    reactionDelay: 0.35,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
  },
  nightmare: {
    id: 'nightmare',
    name: 'Nightmare',
    tagline: 'Aggressive hunter AI, predictive aim & rapid boosting',
    speedScale: 1.15,
    aimPrecision: 0.98,
    fireCooldownMultiplier: 0.75,
    reactionDelay: 0.15,
    color: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
  },
};
