import React, { useState, useEffect } from 'react';
import { EmoteType } from '../types';
import { EMOTES } from '../utils/emotes';
import { MessageSquare, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { playRetroButtonClick } from '../utils/audio';

interface EmoteBarProps {
  onTriggerEmote: (emoteId: EmoteType) => void;
  disabled?: boolean;
}

export const EmoteBar: React.FC<EmoteBarProps> = ({ onTriggerEmote, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [activeEmoteId, setActiveEmoteId] = useState<EmoteType | null>(null);

  const handleEmote = (emoteId: EmoteType, e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (disabled || cooldown) return;

    playRetroButtonClick();
    setActiveEmoteId(emoteId);
    onTriggerEmote(emoteId);
    setCooldown(true);

    setTimeout(() => {
      setActiveEmoteId(null);
    }, 700);

    setTimeout(() => {
      setCooldown(false);
    }, 1200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkeys 1-6 when not typing in an input
      if (
        ['1', '2', '3', '4', '5', '6'].includes(e.key) &&
        !disabled &&
        !cooldown &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        const index = parseInt(e.key, 10) - 1;
        if (EMOTES[index]) {
          handleEmote(EMOTES[index].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, cooldown]);

  return (
    <div
      id="hud-emote-bar"
      className="pointer-events-auto select-none font-cyber flex flex-col items-start z-50 touch-manipulation"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Expanded Emote Menu */}
      {isOpen && (
        <div className="mb-2 p-2 rounded-2xl bg-slate-950/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.45)] backdrop-blur-md grid grid-cols-2 xs:grid-cols-3 gap-1.5 animate-in slide-in-from-bottom-2 duration-150 max-w-[340px]">
          {EMOTES.map((emote, idx) => {
            const isBroadcasting = activeEmoteId === emote.id;
            return (
              <button
                key={emote.id}
                type="button"
                onClick={(e) => handleEmote(emote.id, e)}
                disabled={cooldown}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-left transition-all active:scale-95 touch-manipulation cursor-pointer select-none ${
                  isBroadcasting
                    ? 'border-yellow-400 bg-yellow-500/30 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                    : 'border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-cyan-400 text-slate-200'
                } ${cooldown ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="text-xl shrink-0">{emote.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-white truncate">
                    {emote.badgeText.replace(/^[^\w\s]+/, '').trim()}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-400 font-mono">
                    HOTKEY [{idx + 1}]
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Bar Controls */}
      <div className="flex items-center gap-1.5">
        {/* Quick Taunt (Instant 1-tap broadcast of first / active taunt) */}
        <button
          type="button"
          id="btn-quick-taunt"
          onClick={(e) => handleEmote(EMOTES[0].id, e)}
          disabled={cooldown}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-cyber font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation select-none ${
            activeEmoteId === EMOTES[0].id
              ? 'bg-yellow-400 text-slate-950 border-yellow-300'
              : 'bg-slate-900/95 text-rose-300 border-rose-500/50 hover:border-rose-400 hover:bg-slate-800'
          } ${cooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Quick Broadcast Taunt [Hotkey 1]"
        >
          <span className="text-sm shrink-0">{EMOTES[0].icon}</span>
          <span className="text-[10px] sm:text-[11px] hidden xs:inline">{EMOTES[0].label || 'TAUNT'}</span>
        </button>

        {/* Toggle full Taunts Menu */}
        <button
          type="button"
          id="btn-toggle-taunts"
          onClick={(e) => {
            e.stopPropagation();
            playRetroButtonClick();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-cyber font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer touch-manipulation select-none ${
            isOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
              : 'bg-slate-900/95 text-cyan-300 border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-800'
          }`}
          title="Open Taunt Emotes Drawer [Hotkeys 1-6]"
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px]">ALL TAUNTS</span>
          <span className="px-1 py-0.2 rounded bg-cyan-950/60 text-cyan-300 font-mono text-[9px] border border-cyan-500/30 hidden xs:inline">
            [1-6]
          </span>
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};
