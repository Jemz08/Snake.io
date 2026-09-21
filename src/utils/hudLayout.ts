import { HudLayoutConfig } from '../types';

const STORAGE_KEY = 'snake2_hud_layout_v1';

export const DEFAULT_HUD_LAYOUT: HudLayoutConfig = {
  isFloatingJoystick: true,
  joystick: {
    x: 18, // 18% from left
    y: 80, // 80% from top
    scale: 1.0,
    opacity: 0.9,
    visible: true,
  },
  firePad: {
    x: 82, // 82% from left
    y: 78, // 78% from top
    scale: 1.0,
    opacity: 0.95,
    visible: true,
  },
  boostBtn: {
    x: 92,
    y: 78,
    scale: 1.0,
    opacity: 0.95,
    visible: true,
  },
  weaponGauge: {
    x: 4,
    y: 35,
    scale: 1.0,
    opacity: 0.95,
    visible: true,
  },
  statsBar: {
    x: 5,
    y: 2,
    scale: 1.0,
    opacity: 1.0,
    visible: true,
  },
  minimap: {
    x: 94,
    y: 12,
    scale: 1.0,
    opacity: 0.95,
    visible: true,
  },
  leaderboard: {
    x: 94,
    y: 2,
    scale: 1.0,
    opacity: 0.95,
    visible: true,
  },
};

export function loadHudLayout(): HudLayoutConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_HUD_LAYOUT };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_HUD_LAYOUT,
      ...parsed,
      joystick: { ...DEFAULT_HUD_LAYOUT.joystick, ...parsed.joystick },
      firePad: { ...DEFAULT_HUD_LAYOUT.firePad, ...parsed.firePad },
      boostBtn: { ...DEFAULT_HUD_LAYOUT.boostBtn, ...parsed.boostBtn },
      weaponGauge: { ...DEFAULT_HUD_LAYOUT.weaponGauge, ...parsed.weaponGauge },
      statsBar: { ...DEFAULT_HUD_LAYOUT.statsBar, ...parsed.statsBar },
      minimap: { ...DEFAULT_HUD_LAYOUT.minimap, ...parsed.minimap },
      leaderboard: { ...DEFAULT_HUD_LAYOUT.leaderboard, ...parsed.leaderboard },
    };
  } catch {
    return { ...DEFAULT_HUD_LAYOUT };
  }
}

export function saveHudLayout(config: HudLayoutConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function resetHudLayout(): HudLayoutConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_HUD_LAYOUT };
}
