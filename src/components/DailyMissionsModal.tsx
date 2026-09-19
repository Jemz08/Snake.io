import React, { useState, useEffect } from 'react';
import { DailyMission } from '../types';
import {
  getDailyMissions,
  claimMission,
  getTimeUntilNextReset,
} from '../utils/missions';
import {
  Target,
  Coins,
  CheckCircle2,
  Clock,
  X,
  Swords,
  Crosshair,
  Zap,
  Maximize,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { playCashSound } from '../utils/audio';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (cash: number) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
}) => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextReset());

  useEffect(() => {
    if (isOpen) {
      setMissions(getDailyMissions());
    }
  }, [isOpen]);

  // Tick countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextReset());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClaim = (missionId: string) => {
    const res = claimMission(missionId);
    if (res.success && res.cashReward > 0) {
      playCashSound();
      onClaimReward(res.cashReward);
      setMissions(getDailyMissions());
    }
  };

  if (!isOpen) return null;

  const completedCount = missions.filter((m) => m.current >= m.target).length;

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Swords':
        return <Swords className="w-5 h-5 text-cyan-400" />;
      case 'Crosshair':
        return <Crosshair className="w-5 h-5 text-rose-400" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Maximize':
        return <Maximize className="w-5 h-5 text-sky-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      default:
        return <Target className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div
      id="missions-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="daily-missions-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cyber text-lg sm:text-xl font-black text-white tracking-wider flex items-center gap-2">
                DAILY MISSIONS
              </h2>
              <p className="font-cyber text-[10px] sm:text-xs text-slate-400">
                Complete daily objectives to claim cash bounties
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown timer */}
            <div
              className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 px-2.5 py-1 rounded-lg text-slate-300 font-cyber text-xs"
              title="Time until next daily reset"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <button
              id="btn-close-missions"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress summary banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between font-cyber text-xs">
          <span className="text-slate-300">
            COMPLETED MISSIONS: <strong className="text-cyan-400">{completedCount} / {missions.length}</strong>
          </span>
          <span className="text-amber-400 flex items-center gap-1 font-bold">
            <Coins className="w-3.5 h-3.5" /> REWARDS RESET AT MIDNIGHT
          </span>
        </div>

        {/* Missions list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
          {missions.map((mission) => {
            const isCompleted = mission.current >= mission.target;
            const progressRatio = Math.min(1, mission.current / mission.target);

            return (
              <div
                key={mission.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all ${
                  mission.isClaimed
                    ? 'bg-slate-950/30 border-slate-800 opacity-60'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Icon & Description */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      {renderIcon(mission.iconName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-cyber text-sm sm:text-base font-bold text-white truncate">
                          {mission.title}
                        </span>
                        {mission.isClaimed && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-cyber px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> CLAIMED
                          </span>
                        )}
                      </div>
                      <p className="font-cyber text-[11px] sm:text-xs text-slate-400 truncate">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Cash Reward & Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-cyber">
                      <span className="text-[9px] text-slate-400 uppercase block">BOUNTY</span>
                      <span className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" /> +${mission.rewardCash}
                      </span>
                    </div>

                    {!mission.isClaimed && isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(mission.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-cyber text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all active:scale-95 animate-pulse"
                      >
                        CLAIM
                      </button>
                    ) : !mission.isClaimed ? (
                      <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-cyber text-[10px] font-bold uppercase">
                        {mission.current} / {mission.target}
                      </div>
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {!mission.isClaimed && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-cyber text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Complete daily missions every day for steady Cash flow!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
