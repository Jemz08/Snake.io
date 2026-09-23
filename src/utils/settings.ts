import { setMasterVolume, setSfxVolume, setSoundMuted, getSoundMuted, getMasterVolume, getSfxVolume } from './audio';

export type TargetFpsOption = 60 | 90 | 120 | 144 | 'unlimited';

export interface GameSettings {
  targetFps: TargetFpsOption;
  masterVolume: number; // 0-100
  sfxVolume: number; // 0-100
  soundMuted: boolean;
  highPerformanceMode: boolean; // lowers DPR on high-DPI screens for smooth 120Hz/144Hz
  screenShake: boolean;
  graphicsQuality: 'performance' | 'balanced' | 'high';
}

const SETTINGS_KEY = 'cyber_snake_game_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  targetFps: 120, // Default to 120 FPS for high-refresh devices like Dimensity 8350 Ultimate!
  masterVolume: 80,
  sfxVolume: 80,
  soundMuted: false,
  highPerformanceMode: false,
  screenShake: true,
  graphicsQuality: 'balanced',
};

let currentSettings: GameSettings = { ...DEFAULT_SETTINGS };

// Load settings on startup
export function loadGameSettings(): GameSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    currentSettings = { ...DEFAULT_SETTINGS };
  }

  // Sync with audio subsystem
  setMasterVolume(currentSettings.masterVolume / 100);
  setSfxVolume(currentSettings.sfxVolume / 100);
  setSoundMuted(currentSettings.soundMuted);

  return currentSettings;
}

export function getGameSettings(): GameSettings {
  return currentSettings;
}

export const getSettings = getGameSettings;
export const saveSettings = saveGameSettings;

export function saveGameSettings(settings: Partial<GameSettings>): GameSettings {
  currentSettings = { ...currentSettings, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
    } catch {
      // ignore
    }
  }

  // Apply to audio engine
  if (settings.masterVolume !== undefined) {
    setMasterVolume(settings.masterVolume / 100);
  }
  if (settings.sfxVolume !== undefined) {
    setSfxVolume(settings.sfxVolume / 100);
  }
  if (settings.soundMuted !== undefined) {
    setSoundMuted(settings.soundMuted);
  }

  // Notify listeners
  listeners.forEach((fn) => fn(currentSettings));

  return currentSettings;
}

type SettingsListener = (s: GameSettings) => void;
const listeners = new Set<SettingsListener>();

export function subscribeSettings(callback: SettingsListener): () => void {
  listeners.add(callback);
  callback(currentSettings);
  return () => {
    listeners.delete(callback);
  };
}
