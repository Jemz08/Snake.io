import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SkinDef, SkinRarity } from '../types';
import { SKINS, RARITY_CONFIG, rollSkinFromCrate } from '../utils/skins';
import { SnakePreviewCanvas } from './SnakePreviewCanvas';
import { playCrateTickSound, playCrateWinSound, playRetroButtonClick } from '../utils/audio';
import {
  X,
  Coins,
  Sparkles,
  Package,
  RotateCcw,
  Check,
  Info,
  Zap,
  Award,
  BookOpen,
} from 'lucide-react';

interface CrateOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  unlockedSkinIds: string[];
  selectedSkinId: string;
  onUnlockSkin: (skinId: string, cashbackCoins?: number) => void;
  onEquipSkin: (skinId: string) => void;
  onDeductCoins: (amount: number) => boolean;
}

const CRATE_PRICE = 1000;
const REEL_CARD_WIDTH = 118; // width of each card in pixels
const REEL_CARD_GAP = 10; // gap between cards
const TOTAL_CARD_STRIDE = REEL_CARD_WIDTH + REEL_CARD_GAP;
const REEL_TOTAL_ITEMS = 50;
const WINNER_INDEX = 40; // Winner placed at index 40 for optimal suspense

export const CrateOpeningModal: React.FC<CrateOpeningModalProps> = ({
  isOpen,
  onClose,
  coins,
  unlockedSkinIds,
  selectedSkinId,
  onUnlockSkin,
  onEquipSkin,
  onDeductCoins,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [fastRoll, setFastRoll] = useState(false);
  const [showOddsModal, setShowOddsModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [reelItems, setReelItems] = useState<SkinDef[]>([]);
  const [winnerSkin, setWinnerSkin] = useState<SkinDef | null>(null);
  const [showWinReveal, setShowWinReveal] = useState(false);
  const [duplicateCashback, setDuplicateCashback] = useState<number | null>(null);

  const reelContainerRef = useRef<HTMLDivElement>(null);
  const reelTrackRef = useRef<HTMLDivElement>(null);
  const lastTickCardRef = useRef<number>(-1);
  const animFrameRef = useRef<number | null>(null);

  // Initialize a preview strip on modal open
  useEffect(() => {
    if (isOpen && reelItems.length === 0) {
      generateInitialStrip();
    }
    if (!isOpen) {
      setShowWinReveal(false);
      setIsRolling(false);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }
  }, [isOpen]);

  // Keyboard shortcut (Escape to close or dismiss sub-modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRolling && isOpen) {
        if (showWinReveal) {
          setShowWinReveal(false);
        } else if (showOddsModal) {
          setShowOddsModal(false);
        } else if (showCatalogModal) {
          setShowCatalogModal(false);
        } else {
          playRetroButtonClick();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRolling, showWinReveal, showOddsModal, showCatalogModal, onClose]);

  const generateInitialStrip = () => {
    const initial: SkinDef[] = [];
    for (let i = 0; i < REEL_TOTAL_ITEMS; i++) {
      initial.push(rollSkinFromCrate().skin);
    }
    setReelItems(initial);
  };

  const handleStartRoll = () => {
    if (isRolling) return;
    if (coins < CRATE_PRICE) return;

    // Deduct coins
    const success = onDeductCoins(CRATE_PRICE);
    if (!success) return;

    setIsRolling(true);
    setShowWinReveal(false);
    setDuplicateCashback(null);

    // Roll the winning skin
    const { skin: winner } = rollSkinFromCrate();
    setWinnerSkin(winner);

    // Build the 50-item reel with the winner at index WINNER_INDEX
    const newItems: SkinDef[] = [];
    for (let i = 0; i < REEL_TOTAL_ITEMS; i++) {
      if (i === WINNER_INDEX) {
        newItems.push(winner);
      } else {
        newItems.push(rollSkinFromCrate().skin);
      }
    }
    setReelItems(newItems);
    lastTickCardRef.current = -1;

    if (fastRoll) {
      // Instant roll
      handleRollComplete(winner);
      return;
    }

    // Measure viewport center
    const container = reelContainerRef.current;
    const track = reelTrackRef.current;
    if (!container || !track) {
      handleRollComplete(winner);
      return;
    }

    const viewportWidth = container.clientWidth;
    const centerOffset = viewportWidth / 2;
    // Slight random offset within the winning card (-20px to +20px) for organic casino feel
    const randomCardJitter = (Math.random() - 0.5) * 40;
    const targetTranslateX =
      WINNER_INDEX * TOTAL_CARD_STRIDE + REEL_CARD_WIDTH / 2 - centerOffset + randomCardJitter;

    // Reset position to 0
    track.style.transition = 'none';
    track.style.transform = `translateX(0px)`;

    // Force layout reflow
    void track.offsetHeight;

    const startTime = performance.now();
    const duration = 4600; // 4.6s high suspense roll

    // Custom quintic deceleration: starts fast, sweeps, then decelerates dramatically
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quintic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4.2);
      const currentX = targetTranslateX * easeOut;

      track.style.transform = `translateX(-${currentX}px)`;

      // Tick sound as each card boundary crosses the center pointer
      const currentCenterCard = Math.floor((currentX + centerOffset) / TOTAL_CARD_STRIDE);
      if (currentCenterCard !== lastTickCardRef.current && currentCenterCard >= 0) {
        lastTickCardRef.current = currentCenterCard;
        playCrateTickSound();
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        handleRollComplete(winner);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleRollComplete = (winner: SkinDef) => {
    setIsRolling(false);
    setShowWinReveal(true);

    const rarity = winner.rarity || 'common';
    playCrateWinSound(rarity);

    const isAlreadyUnlocked = unlockedSkinIds.includes(winner.id);
    if (isAlreadyUnlocked) {
      const cashback = RARITY_CONFIG[rarity].cashback;
      setDuplicateCashback(cashback);
      onUnlockSkin(winner.id, cashback);
    } else {
      setDuplicateCashback(null);
      onUnlockSkin(winner.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="crate-opening-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRolling) {
          playRetroButtonClick();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col max-h-[96vh] overflow-hidden">
        {/* ============================================================== */}
        {/* TOP HEADER - RESPONSIVE, BULLETPROOF ALIGNMENT & ACCESSIBILITY */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          {/* Left: Crate Branding */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
              <img
                src="/src/assets/images/scifi_weapon_crate_asset_1790341466198.jpg"
                alt="Supply Crate"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-cyber text-sm sm:text-lg md:text-xl font-black text-amber-300 tracking-wider uppercase truncate">
                  SUPPLY CRATE
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
                  SERIES 2
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block truncate">
                96 Unique Skins • All Rarities • Guaranteed Duplicate Cashback
              </p>
            </div>
          </div>

          {/* Right: Coins + Info + Bulletproof Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Player Cash Balance */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-cyber font-black text-xs sm:text-sm shadow-inner shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span>{coins.toLocaleString()}</span>
              <span className="text-[10px] text-amber-400/70 font-normal hidden xs:inline">🪙</span>
            </div>

            {/* Drop Odds Info Button */}
            <button
              id="btn-crate-odds"
              type="button"
              onClick={() => {
                playRetroButtonClick();
                setShowOddsModal(true);
              }}
              className="p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors shrink-0 flex items-center justify-center shadow-sm"
              title="View Drop Odds & Rates"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Close Button - ALWAYS VISIBLE, NEVER SQUEEZED, EASY TOUCH TARGET */}
            <button
              id="btn-close-crate-modal"
              type="button"
              disabled={isRolling}
              onClick={() => {
                playRetroButtonClick();
                onClose();
              }}
              className="p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-400 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shrink-0 shadow-md"
              title="Close Supply Crate"
              aria-label="Close Supply Crate"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN CRATE STAGE */}
        {/* ============================================================== */}
        <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-3">
          {/* Crate Visual Presentation Box */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-3 sm:p-4 overflow-hidden flex flex-col items-center justify-center min-h-[180px] sm:min-h-[210px]">
            {/* Ambient Background Grid & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            {/* THE HORIZONTAL ROULETTE REEL VIEWPORT */}
            <div className="w-full relative py-2">
              {/* Center Pointer / Laser Needle Indicator (Top) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[11px] border-t-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
                <div className="w-0.5 h-3 bg-gradient-to-b from-amber-400 to-transparent" />
              </div>

              {/* Center Pointer / Laser Needle Indicator (Bottom) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                <div className="w-0.5 h-3 bg-gradient-to-t from-amber-400 to-transparent" />
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[11px] border-b-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
              </div>

              {/* Laser Center Axis Line Across Reel */}
              <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-0.5 bg-amber-400/35 z-20 pointer-events-none shadow-[0_0_10px_rgba(251,191,36,0.5)]" />

              {/* Reel Container */}
              <div
                ref={reelContainerRef}
                className="w-full overflow-hidden relative rounded-xl border border-slate-700/70 bg-slate-950/90 shadow-2xl py-2 px-1"
              >
                {/* Reel Track */}
                <div
                  ref={reelTrackRef}
                  className="flex items-center will-change-transform"
                  style={{ gap: `${REEL_CARD_GAP}px` }}
                >
                  {reelItems.map((item, idx) => {
                    const rarity = item.rarity || 'common';
                    const config = RARITY_CONFIG[rarity];
                    const isWinner = winnerSkin?.id === item.id && idx === WINNER_INDEX;

                    return (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`shrink-0 rounded-xl p-2 flex flex-col items-center justify-between border-2 transition-all relative overflow-hidden ${
                          config.borderColor
                        } ${config.bgColor} ${
                          isWinner && showWinReveal
                            ? 'scale-105 shadow-[0_0_25px_rgba(245,158,11,0.8)] z-10 ring-2 ring-amber-400'
                            : ''
                        }`}
                        style={{
                          width: `${REEL_CARD_WIDTH}px`,
                          height: '118px',
                        }}
                      >
                        {/* Top Line: Rarity Pill + Archetype Short Tag (Clean Alignment, No Wrapping) */}
                        <div className="w-full flex items-center justify-between gap-1 overflow-hidden">
                          <span
                            className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded truncate shrink-0 max-w-[62px]"
                            style={{
                              backgroundColor: `${config.color}25`,
                              color: config.color,
                            }}
                          >
                            {config.label}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400 uppercase truncate text-right">
                            {(item.archetype || 'cyber').slice(0, 4)}
                          </span>
                        </div>

                        {/* Color Swatch / Skin Thumbnail Representation */}
                        <div className="relative my-0.5 flex items-center justify-center">
                          <div
                            className="w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-md transition-transform"
                            style={{
                              backgroundColor: item.primaryColor,
                              borderColor: item.accentColor,
                              boxShadow: `0 0 12px ${item.coreGlow}`,
                            }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full border"
                              style={{
                                backgroundColor: item.secondaryColor,
                                borderColor: item.eyeColor,
                              }}
                            />
                          </div>
                        </div>

                        {/* Skin Name */}
                        <div className="w-full text-center px-0.5">
                          <p
                            className="text-[10px] font-bold truncate leading-tight"
                            style={{ color: config.color }}
                            title={item.name}
                          >
                            {item.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Status / Instructions */}
            <div className="mt-2 text-center">
              {isRolling ? (
                <div className="flex items-center justify-center gap-1.5 text-xs font-cyber font-black text-amber-300 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DECELERATING REEL... LOCKING TARGET...</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-cyber">
                  Click <strong className="text-amber-300">OPEN CRATE (1,000 🪙)</strong> to spin the 50-skin roulette!
                </p>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* ACTION CONTROL PANEL - CLEAN SPACING, TOUCH-FRIENDLY BUTTONS */}
          {/* ============================================================== */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5 shrink-0">
            {/* Utilities Row: Fast Roll + Odds + 96 Skins Catalog */}
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              {/* Fast Roll Toggle Pill */}
              <button
                type="button"
                disabled={isRolling}
                onClick={() => {
                  playRetroButtonClick();
                  setFastRoll(!fastRoll);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-cyber font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                  fastRoll
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${fastRoll ? 'text-amber-400 fill-amber-400' : ''}`} />
                <span>FAST ROLL: {fastRoll ? 'ON' : 'OFF'}</span>
              </button>

              {/* Catalog & Odds Shortcuts */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playRetroButtonClick();
                    setShowCatalogModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-cyber font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ALL 96 SKINS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playRetroButtonClick();
                    setShowOddsModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-cyber font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>ODDS</span>
                </button>
              </div>
            </div>

            {/* Big Primary Open Crate Button */}
            <button
              id="btn-open-supply-crate"
              type="button"
              disabled={isRolling || coins < CRATE_PRICE}
              onClick={handleStartRoll}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-cyber font-black tracking-widest text-base sm:text-lg uppercase shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${
                coins >= CRATE_PRICE
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-amber-300 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <img
                src="/src/assets/images/scifi_weapon_crate_asset_1790341466198.jpg"
                alt="Crate"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover shadow shrink-0"
                referrerPolicy="no-referrer"
              />
              <span>
                {coins >= CRATE_PRICE ? 'OPEN CRATE (1,000 🪙)' : 'NEED 1,000 COINS TO ROLL'}
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* REVEAL DIALOG POPUP WHEN WINNER IS LANDED */}
        {/* ============================================================== */}
        {showWinReveal && winnerSkin && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in zoom-in-95 duration-200">
            <div
              className={`relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl p-4 sm:p-5 border-2 shadow-2xl flex flex-col items-center text-center ${
                RARITY_CONFIG[winnerSkin.rarity || 'common'].borderColor
              } ${RARITY_CONFIG[winnerSkin.rarity || 'common'].bgColor}`}
              style={{
                boxShadow: `0 0 50px ${
                  RARITY_CONFIG[winnerSkin.rarity || 'common'].glowColor
                }`,
              }}
            >
              {/* Close (X) Button - Easy to dismiss reveal dialog */}
              <button
                type="button"
                onClick={() => {
                  playRetroButtonClick();
                  setShowWinReveal(false);
                }}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all z-30 shadow-md"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Rarity Pill Badge (Top Left) */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-md flex items-center gap-1 bg-slate-950/90 border-slate-800">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin-slow" />
                <span
                  style={{
                    color: RARITY_CONFIG[winnerSkin.rarity || 'common'].color,
                  }}
                >
                  {RARITY_CONFIG[winnerSkin.rarity || 'common'].label}
                </span>
              </div>

              {/* Slithering Snake Preview Canvas */}
              <div className="w-full flex items-center justify-center mt-6 mb-2">
                <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                  <SnakePreviewCanvas
                    skin={winnerSkin}
                    weaponType="ar"
                    width={220}
                    height={110}
                  />
                </div>
              </div>

              {/* Skin Title & Archetype Badge */}
              <h3
                className="font-cyber text-lg sm:text-xl font-black mt-1 tracking-wide"
                style={{
                  color: RARITY_CONFIG[winnerSkin.rarity || 'common'].color,
                }}
              >
                {winnerSkin.name}
              </h3>

              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300 uppercase font-cyber">
                  {winnerSkin.archetype} ARCHETYPE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-400/40 text-amber-300 font-cyber">
                  {winnerSkin.badge}
                </span>
              </div>

              {/* Lore / Description */}
              <p className="text-[11px] text-slate-300 mt-1.5 px-2 leading-relaxed line-clamp-2">
                {winnerSkin.description}
              </p>

              {/* Special Aura Readout */}
              {winnerSkin.specialAura && (
                <div className="mt-1.5 text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Aura: {winnerSkin.specialAura}</span>
                </div>
              )}

              {/* Duplicate Handling Note */}
              {duplicateCashback !== null ? (
                <div className="mt-2 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold font-cyber flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    DUPLICATE! +{duplicateCashback.toLocaleString()} Coins Cashback!
                  </span>
                </div>
              ) : (
                <div className="mt-2 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold font-cyber flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>★ NEW SKIN UNLOCKED! ★</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full mt-3 font-cyber">
                <button
                  type="button"
                  onClick={() => {
                    playRetroButtonClick();
                    onEquipSkin(winnerSkin.id);
                    setShowWinReveal(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {selectedSkinId === winnerSkin.id ? 'EQUIPPED' : 'EQUIP NOW'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={coins < CRATE_PRICE}
                  onClick={() => {
                    playRetroButtonClick();
                    setShowWinReveal(false);
                    handleStartRoll();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase shadow-md transition-all active:scale-95 ${
                    coins >= CRATE_PRICE
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ROLL AGAIN (1k)</span>
                </button>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => {
                  playRetroButtonClick();
                  setShowWinReveal(false);
                }}
                className="mt-2 text-xs text-slate-400 hover:text-white underline py-1 font-cyber"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ODDS & RARITY MODAL */}
        {/* ============================================================== */}
        {showOddsModal && (
          <div
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                playRetroButtonClick();
                setShowOddsModal(false);
              }
            }}
          >
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-300 font-cyber font-bold text-sm sm:text-base">
                  <Info className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>CRATE DROP ODDS & CASHBACK</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playRetroButtonClick();
                    setShowOddsModal(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Close Odds"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {(
                  Object.keys(RARITY_CONFIG) as SkinRarity[]
                ).map((key) => {
                  const cfg = RARITY_CONFIG[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 rounded-xl border bg-slate-950/70 gap-2"
                      style={{ borderColor: `${cfg.color}40` }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: cfg.color,
                            boxShadow: `0 0 8px ${cfg.color}`,
                          }}
                        />
                        <span
                          className="font-cyber font-bold text-xs sm:text-sm uppercase tracking-wide truncate"
                          style={{ color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                        <span className="text-white font-bold">
                          {cfg.dropRate.toFixed(1)}% Chance
                        </span>
                        <span className="text-amber-400/90">
                          +{cfg.cashback} 🪙
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Every roll costs exactly <strong>1,000 Coins</strong>. Unlocked duplicates are automatically refunded with coin cashback so no roll is ever wasted!
              </p>

              <button
                type="button"
                onClick={() => {
                  playRetroButtonClick();
                  setShowOddsModal(false);
                }}
                className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-cyber font-bold rounded-xl text-xs uppercase"
              >
                Back to Supply Crate
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SKIN CATALOG SUMMARY MODAL */}
        {/* ============================================================== */}
        {showCatalogModal && (
          <div
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                playRetroButtonClick();
                setShowCatalogModal(false);
              }
            }}
          >
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold text-sm sm:text-base">
                  <Award className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>ALL 96 CRATE SKINS CATALOG</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playRetroButtonClick();
                    setShowCatalogModal(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Close Catalog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-4">
                {(
                  Object.keys(RARITY_CONFIG) as SkinRarity[]
                ).map((rKey) => {
                  const cfg = RARITY_CONFIG[rKey];
                  const raritySkins = SKINS.filter((s) => s.rarity === rKey);

                  return (
                    <div key={rKey} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-cyber font-black uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${cfg.color}25`,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label} ({raritySkins.length} SKINS)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {cfg.dropRate}% DROP RATE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {raritySkins.map((s) => {
                          const isUnlocked = unlockedSkinIds.includes(s.id);
                          return (
                            <div
                              key={s.id}
                              className={`p-2 rounded-lg border text-left flex items-center justify-between gap-1.5 ${
                                isUnlocked
                                  ? 'bg-slate-950 border-slate-700'
                                  : 'bg-slate-950/40 border-slate-800 opacity-60'
                              }`}
                            >
                              <div className="truncate min-w-0">
                                <p
                                  className="text-[11px] font-bold truncate font-cyber"
                                  style={{ color: cfg.color }}
                                >
                                  {s.name}
                                </p>
                                <p className="text-[9px] text-slate-400 uppercase font-mono">
                                  {s.archetype}
                                </p>
                              </div>
                              {isUnlocked && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
                                  OWNED
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  playRetroButtonClick();
                  setShowCatalogModal(false);
                }}
                className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-cyber font-bold rounded-xl text-xs uppercase shrink-0"
              >
                Back to Supply Crate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
