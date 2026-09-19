import { LeaderboardEntry } from '../types';
import { getTodayDateKey } from './missions';

const LEADERBOARD_STORAGE_KEY = 'snake2_arena_leaderboards_v1';

const DEFAULT_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'V01D_REAPER', score: 14850, kills: 24, skinId: 'void-phantom', badge: 'CHAMPION', date: '2026-09-17' },
  { rank: 2, name: 'CYBER_NEXUS', score: 12200, kills: 19, skinId: 'plasma-god', badge: 'ELITE', date: '2026-09-18' },
  { rank: 3, name: 'GLITCH_KING', score: 10450, kills: 16, skinId: 'neon-shredder', badge: 'WARLORD', date: '2026-09-16' },
  { rank: 4, name: 'AURA_99', score: 8900, kills: 14, skinId: 'golden-emperor', badge: 'MASTER', date: '2026-09-15' },
  { rank: 5, name: 'TITAN_FANG', score: 7600, kills: 12, skinId: 'crimson-warlord', badge: 'DIAMOND', date: '2026-09-18' },
  { rank: 6, name: 'SHADOW_MECH', score: 6400, kills: 11, skinId: 'cyber-viper', badge: 'PLATINUM', date: '2026-09-17' },
  { rank: 7, name: 'ZERO_VECTOR', score: 5250, kills: 9, skinId: 'glacial-apex', badge: 'GOLD', date: '2026-09-18' },
  { rank: 8, name: 'PULSE_CORONA', score: 4100, kills: 7, skinId: 'plasma-god', badge: 'SILVER', date: '2026-09-16' },
  { rank: 9, name: 'NIGHT_STRYKE', score: 3450, kills: 6, skinId: 'neon-shredder', badge: 'SILVER', date: '2026-09-18' },
  { rank: 10, name: 'HEX_VIPER', score: 2800, kills: 5, skinId: 'cyber-viper', badge: 'BRONZE', date: '2026-09-18' },
];

const DEFAULT_DAILY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'CYBER_NEXUS', score: 9400, kills: 15, skinId: 'plasma-god', badge: 'DAILY #1' },
  { rank: 2, name: 'TITAN_FANG', score: 7600, kills: 12, skinId: 'crimson-warlord', badge: 'DAILY #2' },
  { rank: 3, name: 'ZERO_VECTOR', score: 5250, kills: 9, skinId: 'glacial-apex', badge: 'DAILY #3' },
  { rank: 4, name: 'NIGHT_STRYKE', score: 3450, kills: 6, skinId: 'neon-shredder' },
  { rank: 5, name: 'HEX_VIPER', score: 2800, kills: 5, skinId: 'cyber-viper' },
  { rank: 6, name: 'CYBER_VIPER_X', score: 2100, kills: 4, skinId: 'cyber-viper' },
  { rank: 7, name: 'GHOST_RUNNER', score: 1850, kills: 3, skinId: 'void-phantom' },
  { rank: 8, name: 'SUB_ATOMIC', score: 1400, kills: 2, skinId: 'glacial-apex' },
];

export interface LeaderboardStore {
  global: LeaderboardEntry[];
  daily: { [dateKey: string]: LeaderboardEntry[] };
}

export function loadLeaderboards(): LeaderboardStore {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.global && parsed.daily) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  const initialStore: LeaderboardStore = {
    global: DEFAULT_GLOBAL_LEADERBOARD,
    daily: {
      [getTodayDateKey()]: DEFAULT_DAILY_LEADERBOARD,
    },
  };

  saveLeaderboards(initialStore);
  return initialStore;
}

export function saveLeaderboards(store: LeaderboardStore): void {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

// Update leaderboards with player's latest match stats
export function recordPlayerScore(
  playerName: string,
  score: number,
  kills: number,
  skinId: string
): { globalRank: number; dailyRank: number; isNewRecord: boolean } {
  if (score <= 0) return { globalRank: -1, dailyRank: -1, isNewRecord: false };

  const store = loadLeaderboards();
  const dateKey = getTodayDateKey();

  if (!store.daily[dateKey]) {
    store.daily[dateKey] = [...DEFAULT_DAILY_LEADERBOARD];
  }

  // Check or update in Global
  const playerGlobalIdx = store.global.findIndex((e) => e.isPlayer);
  let isNewRecord = false;

  if (playerGlobalIdx >= 0) {
    if (score > store.global[playerGlobalIdx].score) {
      store.global[playerGlobalIdx].score = score;
      store.global[playerGlobalIdx].kills = Math.max(store.global[playerGlobalIdx].kills, kills);
      store.global[playerGlobalIdx].skinId = skinId;
      store.global[playerGlobalIdx].name = playerName;
      isNewRecord = true;
    }
  } else {
    store.global.push({
      rank: 0,
      name: playerName,
      score,
      kills,
      skinId,
      badge: 'CONTENDER',
      isPlayer: true,
      date: dateKey,
    });
    isNewRecord = true;
  }

  // Sort and assign ranks
  store.global.sort((a, b) => b.score - a.score);
  store.global.forEach((e, i) => {
    e.rank = i + 1;
  });

  // Check or update in Daily
  const dailyList = store.daily[dateKey];
  const playerDailyIdx = dailyList.findIndex((e) => e.isPlayer);

  if (playerDailyIdx >= 0) {
    if (score > dailyList[playerDailyIdx].score) {
      dailyList[playerDailyIdx].score = score;
      dailyList[playerDailyIdx].kills = Math.max(dailyList[playerDailyIdx].kills, kills);
      dailyList[playerDailyIdx].skinId = skinId;
      dailyList[playerDailyIdx].name = playerName;
    }
  } else {
    dailyList.push({
      rank: 0,
      name: playerName,
      score,
      kills,
      skinId,
      isPlayer: true,
      badge: 'CONTENDER',
      date: dateKey,
    });
  }

  dailyList.sort((a, b) => b.score - a.score);
  dailyList.forEach((e, i) => {
    e.rank = i + 1;
  });

  saveLeaderboards(store);

  const globalRank = store.global.findIndex((e) => e.isPlayer) + 1;
  const dailyRank = dailyList.findIndex((e) => e.isPlayer) + 1;

  return { globalRank, dailyRank, isNewRecord };
}

export function getGlobalLeaderboard(): LeaderboardEntry[] {
  const store = loadLeaderboards();
  return store.global;
}

export function getDailyLeaderboard(): LeaderboardEntry[] {
  const store = loadLeaderboards();
  const dateKey = getTodayDateKey();
  return store.daily[dateKey] || DEFAULT_DAILY_LEADERBOARD;
}

export function getKillsLeaderboard(): LeaderboardEntry[] {
  const store = loadLeaderboards();
  const all = [...store.global];
  all.sort((a, b) => b.kills - a.kills || b.score - a.score);
  return all.map((e, idx) => ({
    ...e,
    rank: idx + 1,
  }));
}
