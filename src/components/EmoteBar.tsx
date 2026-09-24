import React, { useState, useEffect } from 'react';
import { EmoteType } from '../types';
import { EMOTES } from '../utils/emotes';
import { MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { playRetroButtonClick } from '../utils/audio';

interface EmoteBarProps {
  onTriggerEmote: (emoteId: EmoteType) => void;
  disabled?: boolean;
}

export const EmoteBar: React.FC<EmoteBarProps> = ({ onTriggerEmote, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleEmote = (emoteId: EmoteType) => {
    if (disabled || cooldown) return;
    playRetroButtonClick();
    onTriggerEmote(emoteId);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkeys 1-6 when not in input
      if (['1', '2', '3', '4', '5', '6'].includes(e.key) && !disabled && !cooldown) {
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
    <div className="fixed bottom-20 left-4 z-40 flex flex-col items-start font-chakra select-none">
      {/* Expanded Emote Menu */}
      {isOpen && (
        <div className="mb-2 p-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md grid grid-cols-3 gap-1.5 animate-in slide-in-from-bottom-2 duration-150">
          {EMOTES.map((emote, idx) => (
            <button
              key={emote.id}
              onClick={() => handleEmote(emote.id)}
              disabled={cooldown}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-400 transition-all text-left group active:scale-95"
            >
              <span className="text-base group-hover:scale-125 transition-transform">
                {emote.icon}
              </span>
              <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 whitespace-nowrap">
                {emote.label || emote.name}
              </span>
              <span className="text-[9px] font-mono text-slate-500 ml-auto">[{idx + 1}]</span>
            </button>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => {
          playRetroButtonClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 shadow-md backdrop-blur-sm active:scale-95 transition-all text-xs font-bold"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Taunt Emotes</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
