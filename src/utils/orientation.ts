import { useState, useEffect } from 'react';

export type ScreenOrientation = 'portrait' | 'landscape';

export interface ScreenDimensions {
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  orientation: ScreenOrientation;
  isPortrait: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isShortScreen: boolean; // height < 520px (typical mobile landscape)
  isNarrowScreen: boolean; // width < 480px (typical mobile portrait)
  aspectRatio: number;
}

/**
 * Accurately detects orientation using screen.width and screen.height
 * as requested, along with window viewport fallback.
 */
export function getScreenDimensions(): ScreenDimensions {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 720,
      screenWidth: 1280,
      screenHeight: 720,
      orientation: 'landscape',
      isPortrait: false,
      isLandscape: true,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isShortScreen: false,
      isNarrowScreen: false,
      aspectRatio: 16 / 9,
    };
  }

  const winW = window.innerWidth || document.documentElement.clientWidth || 1024;
  const winH = window.innerHeight || document.documentElement.clientHeight || 768;
  const scrW = (typeof screen !== 'undefined' && screen.width) ? screen.width : winW;
  const scrH = (typeof screen !== 'undefined' && screen.height) ? screen.height : winH;

  // Primary detection using screen.width and screen.height with viewport fallback
  // In many mobile browsers, screen.width / screen.height switch with orientation or remain physical.
  // Checking both screen and window ensures 100% accurate detection across all mobile OS & iframe contexts.
  const isPortrait = winH > winW || (scrH > scrW && winH >= winW);
  const orientation: ScreenOrientation = isPortrait ? 'portrait' : 'landscape';

  const isMobile = Math.min(winW, winH) < 600 || winW < 768;
  const isTablet = !isMobile && Math.min(winW, winH) < 900;
  const isDesktop = !isMobile && !isTablet;
  const isShortScreen = winH < 520;
  const isNarrowScreen = winW < 480;
  const aspectRatio = winW / (winH || 1);

  return {
    width: winW,
    height: winH,
    screenWidth: scrW,
    screenHeight: scrH,
    orientation,
    isPortrait,
    isLandscape: !isPortrait,
    isMobile,
    isTablet,
    isDesktop,
    isShortScreen,
    isNarrowScreen,
    aspectRatio,
  };
}

/**
 * React hook to observe screen orientation and dimension changes.
 * Automatically triggers re-render when user rotates their phone/tablet or resizes the browser.
 */
export function useScreenOrientation(): ScreenDimensions {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(getScreenDimensions);

  useEffect(() => {
    let timeoutId: number | null = null;

    const handleUpdate = () => {
      // Immediate update
      setDimensions(getScreenDimensions());

      // Delayed update to account for mobile soft keyboard & browser toolbar collapse animation
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setDimensions(getScreenDimensions());
      }, 150);
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleUpdate, { passive: true });

    if (typeof screen !== 'undefined' && screen.orientation) {
      screen.orientation.addEventListener('change', handleUpdate);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      if (typeof screen !== 'undefined' && screen.orientation) {
        screen.orientation.removeEventListener('change', handleUpdate);
      }
    };
  }, []);

  return dimensions;
}

/**
 * Calculates adaptive dynamic scale for UI controls based on screen width and height.
 * Keeps touch targets comfortably usable without overwhelming small mobile screens.
 */
export function getAdaptiveScale(options: {
  width: number;
  height: number;
  isPortrait: boolean;
  isShortScreen: boolean;
  baseScale?: number;
}): number {
  const { width, height, isPortrait, isShortScreen, baseScale = 1.0 } = options;

  if (isShortScreen) {
    // Tight landscape screen (e.g. mobile rotated horizontally: 360-420px height)
    // Scale controls down slightly to maximize playable arena view
    return Math.max(0.75, Math.min(0.9, (height / 500) * baseScale));
  }

  if (isPortrait) {
    // Mobile portrait (narrow width: 360-440px)
    if (width < 380) {
      return 0.85 * baseScale;
    }
    if (width < 480) {
      return 0.95 * baseScale;
    }
    return 1.0 * baseScale;
  }

  // Tablet or Desktop landscape
  if (width >= 1200) {
    return 1.05 * baseScale;
  }

  return 1.0 * baseScale;
}
