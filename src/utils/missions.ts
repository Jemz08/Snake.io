import { DailyMission, MissionType } from '../types';

const MISSIONS_STORAGE_KEY_PREFIX = 'snake2_daily_missions_';

// Helper to get today's date key: YYYY-MM-DD
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimeUntilNextReset(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

const TEMPLATE_MISSIONS: Omit<DailyMission, 'current' | 'isClaimed'>[] = [
  {
    id: 'play-arena',
    title: 'Arena Combatant',
    description: 'Deploy into the cyber arena 3 times',
    type: 'play_games',
    target: 3,
    rewardCash: 150,
    iconName: 'Swords',
  },
  {
    id: 'slay-enemies',
    title: 'Snake Hunter',
    description: 'Destroy 5 enemy snakes with laser or crashes',
    type: 'kills',
    target: 5,
    rewardCash: 250,
    iconName: 'Crosshair',
  },
  {
    id: 'collect-cash',
    title: 'High Roller',
    description: 'Collect $200 in cash bounties and gold coins',
    type: 'earn_cash',
    target: 200,
    rewardCash: 200,
    iconName: 'Coins',
  },
  {
    id: 'weapon-slayer',
    title: 'Heavy Ordinance',
    description: 'Eliminate 2 enemy snakes using armed weapons',
    type: 'kills_with_weapon',
    target: 2,
    rewardCash: 300,
    iconName: 'Zap',
  },
  {
    id: 'grow-serpent',
    title: 'Colossal Serpent',
    description: 'Grow your snake to a length of 35 or more',
    type: 'reach_length',
    target: 35,
    rewardCash: 200,
    iconName: 'Maximize',
  },
  {
    id: 'apex-score',
    title: 'Apex Predator',
    description: 'Achieve a score of 2,000 points in a match',
    type: 'reach_score',
    target: 2000,
    rewardCash: 350,
    iconName: 'Trophy',
  },
];

export function getDailyMissions(): DailyMission[] {
  const dateKey = getTodayDateKey();
  const storageKey = `${MISSIONS_STORAGE_KEY_PREFIX}${dateKey}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Initialize fresh missions for today
  const fresh: DailyMission[] = TEMPLATE_MISSIONS.map((tpl) => ({
    ...tpl,
    current: 0,
    isClaimed: false,
  }));

  saveDailyMissions(fresh);
  return fresh;
}

export function saveDailyMissions(missions: DailyMission[]): void {
  const dateKey = getTodayDateKey();
  const storageKey = `${MISSIONS_STORAGE_KEY_PREFIX}${dateKey}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(missions));
  } catch {
    // ignore
  }
}

// Track progress on all matching missions
export function updateMissionProgress(
  type: MissionType,
  amount: number,
  mode: 'add' | 'max' = 'add'
): { updatedMissions: DailyMission[]; newlyCompleted: DailyMission[] } {
  const missions = getDailyMissions();
  const newlyCompleted: DailyMission[] = [];

  const updated = missions.map((m) => {
    if (m.type === type) {
      const prevVal = m.current;
      const nextVal = mode === 'max' ? Math.max(prevVal, amount) : prevVal + amount;
      const finalVal = Math.min(m.target, nextVal);

      if (prevVal < m.target && finalVal >= m.target) {
        newlyCompleted.push({ ...m, current: finalVal });
      }

      return {
        ...m,
        current: finalVal,
      };
    }
    return m;
  });

  saveDailyMissions(updated);
  return { updatedMissions: updated, newlyCompleted };
}

export function claimMission(missionId: string): { success: boolean; cashReward: number } {
  const missions = getDailyMissions();
  const mission = missions.find((m) => m.id === missionId);

  if (!mission || mission.current < mission.target || mission.isClaimed) {
    return { success: false, cashReward: 0 };
  }

  const updated = missions.map((m) =>
    m.id === missionId ? { ...m, isClaimed: true } : m
  );

  saveDailyMissions(updated);
  return { success: true, cashReward: mission.rewardCash };
}
