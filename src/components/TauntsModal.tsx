import React, { useState } from 'react';
import { EMOTES } from '../utils/emotes';
import { EmoteType, PlayerProfile } from '../types';
import {
  MessageSquare,
  X,
  Volume2,
  Sparkles,
  Check,
  Radio,
  Award,
} from 'lucide-react';
import {
  playRetroButtonClick,
  playAbilitySound,
  playCashSound,
  playShieldDeflectSound,
} from '../utils/audio';

interface TauntsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: PlayerProfile;
  onUpdateProfile?: (profile: Partial<PlayerProfile>) => void;
  onSelectEmote?: (emoteId: EmoteType) => void;
}

export const TauntsModal: React.FC<TauntsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSelectEmote,
}) => {
  const [testedEmote, setTestedEmote] = useState<EmoteType | null>(null);
  const currentEquippedId = profile?.selectedEmoteId || 'target';

  if (!isOpen) return null;

  const playTauntAudio = (emoteId: EmoteType) => {
    if (emoteId === 'target') playAbilitySound('robot');
    else if (emoteId === 'gg') playCashSound();
    else if (emoteId === 'overload') playAbilitySound('storm');
    else if (emoteId === 'fire') playAbilitySound('devil');
    else if (emoteId === 'shield') playShieldDeflectSound();
    else if (emoteId === 'dust') playAbilitySound('phoenix');
    else playRetroButtonClick();
  };

  const handleTestTaunt = (emoteId: EmoteType, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setTestedEmote(emoteId);
    playTauntAudio(emoteId);

    setTimeout(() => {
      setTestedEmote((prev) => (prev === emoteId ? null : prev));
    }, 2200);
  };

  const handleEquipTaunt = (emoteId: EmoteType, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    playRetroButtonClick();
    playTauntAudio(emoteId);
    setTestedEmote(emoteId);

    if (onUpdateProfile) {
      onUpdateProfile({ selectedEmoteId: emoteId });
    }
    if (onSelectEmote) {
      onSelectEmote(emoteId);
    }
  };

  return (
    <div
      id="taunts-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-cyber"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900/95 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 shadow-sm shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cyber text-sm sm:text-base font-black text-white tracking-wider uppercase flex items-center gap-2">
                <span>COMBAT TAUNTS & EMOTES</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/40">
                  {EMOTES.length} UNLOCKED
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Broadcast holographic banners in battle via the Taunts button or Hotkeys [1-6]
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-400 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Close Taunts Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Banner Hologram Preview */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-center min-h-[62px]">
          {testedEmote ? (
            (() => {
              const active = EMOTES.find((e) => e.id === testedEmote);
              if (!active) return null;
              return (
                <div
                  className="px-4 py-1.5 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-black tracking-wider shadow-lg animate-bounce"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: active.color,
                    color: active.color,
                    boxShadow: `0 0 25px ${active.color}50`,
                  }}
                >
                  <span className="text-xl">{active.icon}</span>
                  <span className="text-white font-black">{active.badgeText}</span>
                  <span className="text-[10px] font-mono text-cyan-300 ml-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                    [BROADCASTING]
                  </span>
                </div>
              );
            })()
          ) : (
            <div className="text-slate-400 text-xs flex items-center gap-2 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Tap any taunt below to test holographic audio and badge!</span>
            </div>
          )}
        </div>

        {/* Taunts Grid */}
        <div className="p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto">
          {EMOTES.map((emote, idx) => {
            const isEquipped = currentEquippedId === emote.id;
            const isTesting = testedEmote === emote.id;

            return (
              <div
                key={emote.id}
                onClick={(e) => handleTestTaunt(emote.id, e)}
                className={`relative p-3 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer select-none active:scale-[0.99] group ${
                  isEquipped
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : isTesting
                    ? 'border-yellow-400 bg-yellow-950/30'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Top Row: Icon & Hotkey */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {emote.icon}
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {emote.label || emote.badgeText}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[9.5px] font-bold">
                    HOTKEY [{idx + 1}]
                  </span>
                </div>

                {/* Badge text preview */}
                <div
                  className="px-2.5 py-1 rounded-lg border text-xs font-black uppercase tracking-wider text-center"
                  style={{
                    backgroundColor: `${emote.color}15`,
                    borderColor: `${emote.color}50`,
                    color: emote.color,
                  }}
                >
                  {emote.badgeText}
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleTestTaunt(emote.id, e)}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-cyan-300 py-1 px-2 rounded-lg bg-slate-950/60 border border-slate-800 transition-colors"
                  >
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    <span>TEST SOUND</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleEquipTaunt(emote.id, e)}
                    className={`flex items-center gap-1 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg border transition-all ${
                      isEquipped
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400 text-cyan-300'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>PRIMARY</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-3 h-3" />
                        <span>EQUIP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>In-Arena: Click the Taunts button or use keyboard hotkeys 1-6</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black tracking-wider transition-all text-xs uppercase cursor-pointer"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
