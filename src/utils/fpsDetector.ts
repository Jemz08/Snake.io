import { useState, useEffect } from 'react';

export interface FpsInfo {
  currentFps: number;
  displayRefreshRate: number; // e.g. 60, 90, 120, 144, 240
  label: string; // e.g. "60 Hz", "90 Hz", "120 Hz", "144 Hz"
  isHighRefresh: boolean;
}

// Global cached detection
let cachedDisplayRate = 60;
let lastCalculatedFps = 60;
const listeners = new Set<(info: FpsInfo) => void>();
let animFrameId: number | null = null;
let lastTimestamp = 0;
let frameCount = 0;
let lastFpsUpdateTime = 0;
const intervals: number[] = [];

function determineDisplayRefreshRate(avgIntervalMs: number): number {
  const calculatedHz = 1000 / avgIntervalMs;
  if (calculatedHz < 45) return 30;
  if (calculatedHz < 70) return 60;
  if (calculatedHz < 82) return 75;
  if (calculatedHz < 105) return 90;
  if (calculatedHz < 132) return 120;
  if (calculatedHz < 190) return 144;
  return 240;
}

function tickFpsDetector(now: number) {
  if (lastTimestamp > 0) {
    const delta = now - lastTimestamp;
    if (delta > 0 && delta < 100) {
      intervals.push(delta);
      if (intervals.length > 80) intervals.shift();
    }
  }
  lastTimestamp = now;
  frameCount++;

  // Update FPS readout every 500ms
  if (now - lastFpsUpdateTime >= 500) {
    const elapsedSec = (now - lastFpsUpdateTime) / 1000;
    lastCalculatedFps = Math.round(frameCount / elapsedSec);
    frameCount = 0;
    lastFpsUpdateTime = now;

    if (intervals.length >= 25) {
      // Sort intervals and take median for clean refresh rate detection
      const sorted = [...intervals].sort((a, b) => a - b);
      const medianInterval = sorted[Math.floor(sorted.length / 2)];
      cachedDisplayRate = determineDisplayRefreshRate(medianInterval);
    }

    const info: FpsInfo = {
      currentFps: lastCalculatedFps,
      displayRefreshRate: cachedDisplayRate,
      label: `${cachedDisplayRate} Hz`,
      isHighRefresh: cachedDisplayRate >= 90,
    };

    listeners.forEach((listener) => listener(info));
  }

  animFrameId = requestAnimationFrame(tickFpsDetector);
}

function startGlobalFpsDetection() {
  if (animFrameId === null && typeof window !== 'undefined') {
    lastTimestamp = performance.now();
    lastFpsUpdateTime = performance.now();
    frameCount = 0;
    animFrameId = requestAnimationFrame(tickFpsDetector);
  }
}

export function subscribeFps(callback: (info: FpsInfo) => void): () => void {
  listeners.add(callback);
  startGlobalFpsDetection();
  // Immediately dispatch current cached
  callback({
    currentFps: lastCalculatedFps,
    displayRefreshRate: cachedDisplayRate,
    label: `${cachedDisplayRate} Hz`,
    isHighRefresh: cachedDisplayRate >= 90,
  });

  return () => {
    listeners.delete(callback);
  };
}

export function useFpsDetector(): FpsInfo {
  const [fpsInfo, setFpsInfo] = useState<FpsInfo>({
    currentFps: lastCalculatedFps || 60,
    displayRefreshRate: cachedDisplayRate || 60,
    label: `${cachedDisplayRate || 60} Hz`,
    isHighRefresh: (cachedDisplayRate || 60) >= 90,
  });

  useEffect(() => {
    return subscribeFps(setFpsInfo);
  }, []);

  return fpsInfo;
}
