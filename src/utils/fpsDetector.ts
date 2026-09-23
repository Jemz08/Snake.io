import { useState, useEffect } from 'react';

export interface FpsInfo {
  currentFps: number;
  displayRefreshRate: number; // e.g. 60, 90, 120, 144, 240
  label: string; // e.g. "60 Hz", "90 Hz", "120 Hz", "144 Hz"
  isHighRefresh: boolean;
}

// Global cached detection
let cachedDisplayRate = 120; // Default optimistic high-refresh for modern chipsets (Dimensity 8350, etc.)
let lastCalculatedFps = 120;
const listeners = new Set<(info: FpsInfo) => void>();
let animFrameId: number | null = null;
let lastTimestamp = 0;
let frameCount = 0;
let lastFpsUpdateTime = 0;
const intervals: number[] = [];

function determineDisplayRefreshRate(avgIntervalMs: number): number {
  const calculatedHz = 1000 / avgIntervalMs;
  if (calculatedHz < 45) return 30;
  if (calculatedHz < 72) return 60;
  if (calculatedHz < 85) return 75;
  if (calculatedHz < 105) return 90;
  if (calculatedHz < 135) return 120;
  if (calculatedHz < 190) return 144;
  return 240;
}

export function recordRenderFrame(now: number) {
  if (lastTimestamp > 0) {
    const delta = now - lastTimestamp;
    if (delta > 0 && delta < 100) {
      intervals.push(delta);
      if (intervals.length > 60) intervals.shift();
    }
  }
  lastTimestamp = now;
  frameCount++;

  // Update FPS readout every 400ms
  if (now - lastFpsUpdateTime >= 400) {
    const elapsedSec = (now - lastFpsUpdateTime) / 1000;
    lastCalculatedFps = Math.max(1, Math.round(frameCount / elapsedSec));
    frameCount = 0;
    lastFpsUpdateTime = now;

    if (intervals.length >= 15) {
      // Sort intervals and take median for clean refresh rate detection
      const sorted = [...intervals].sort((a, b) => a - b);
      // Look at lower percentiles for true hardware refresh capability
      const bestInterval = sorted[Math.floor(sorted.length * 0.25)];
      cachedDisplayRate = determineDisplayRefreshRate(bestInterval);
    }

    const info: FpsInfo = {
      currentFps: lastCalculatedFps,
      displayRefreshRate: cachedDisplayRate,
      label: `${cachedDisplayRate} Hz`,
      isHighRefresh: cachedDisplayRate >= 90,
    };

    listeners.forEach((listener) => listener(info));
  }
}

// Fallback background detection when not in game
function tickFallback(now: number) {
  recordRenderFrame(now);
  animFrameId = requestAnimationFrame(tickFallback);
}

export function startGlobalFpsDetection() {
  if (animFrameId === null && typeof window !== 'undefined') {
    lastTimestamp = performance.now();
    lastFpsUpdateTime = performance.now();
    frameCount = 0;
    animFrameId = requestAnimationFrame(tickFallback);
  }
}

export function stopGlobalFpsDetection() {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

export function subscribeFps(callback: (info: FpsInfo) => void): () => void {
  listeners.add(callback);
  if (listeners.size === 1 && animFrameId === null) {
    startGlobalFpsDetection();
  }

  // Immediately dispatch current cached
  callback({
    currentFps: lastCalculatedFps,
    displayRefreshRate: cachedDisplayRate,
    label: `${cachedDisplayRate} Hz`,
    isHighRefresh: cachedDisplayRate >= 90,
  });

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      stopGlobalFpsDetection();
    }
  };
}

export function useFpsDetector(): FpsInfo {
  const [fpsInfo, setFpsInfo] = useState<FpsInfo>({
    currentFps: lastCalculatedFps || 120,
    displayRefreshRate: cachedDisplayRate || 120,
    label: `${cachedDisplayRate || 120} Hz`,
    isHighRefresh: (cachedDisplayRate || 120) >= 90,
  });

  useEffect(() => {
    return subscribeFps(setFpsInfo);
  }, []);

  return fpsInfo;
}
