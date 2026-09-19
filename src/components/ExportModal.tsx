import React from 'react';
import { PlayerProfile } from '../types';
import { Download, X, FileCode, HardDrive, CheckCircle2, Terminal } from 'lucide-react';
import { playCashSound } from '../utils/audio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  const handleDownloadSave = () => {
    playCashSound();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `snake2-arena-profile-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      id="export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden font-cyber flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wider">DOWNLOAD & EXPORT</h2>
              <p className="text-[10px] text-slate-400">GET OFFLINE ASSETS & PROJECT ZIP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Option 1: AI Studio ZIP Export */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>1. Complete Source Code ZIP (AI Studio)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              To download the complete runnable codebase as a <strong>.ZIP file</strong>:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Click the <strong>Settings</strong> or <strong>Share / Export</strong> icon at top right</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Select <strong>Export to ZIP</strong> or <strong>Export to GitHub</strong></span>
              </div>
            </div>
          </div>

          {/* Option 2: Instant Player Save Download */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>2. Instant Profile & Cash Save (.JSON)</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Download your current player profile, unlocked skins, cash balance (${profile.coins}), and death effects:
            </p>
            <button
              type="button"
              onClick={handleDownloadSave}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD SAVE FILE (.JSON)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold tracking-wider transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
