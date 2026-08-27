import React, { useState } from 'react';
import { Target, Gift, Check, Sparkles, Trophy, Flame, ChevronLeft } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface MissionsScreenProps {
  onBack?: () => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({ onBack }) => {
  const { missions, claimMissionReward } = useAppState();
  const [claimNotice, setClaimNotice] = useState<string | null>(null);

  const handleClaim = (missionId: string) => {
    const res = claimMissionReward(missionId);
    if (res.success) {
      setClaimNotice(res.message);
      setTimeout(() => setClaimNotice(null), 3000);
    }
  };

  return (
    <div id="missions-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-[#0B0B0F]">
      <div className="mt-2 flex items-center gap-2.5">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-[#1A1A24] border border-[#232332] text-slate-300 hover:text-white transition-colors"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold font-display text-white">Daily & Weekly Missions</h2>
          <p className="text-xs text-slate-400">Complete challenges to earn free Coins & Level XP</p>
        </div>
      </div>

      {claimNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{claimNotice}</span>
        </div>
      )}

      {/* Missions List */}
      <div className="space-y-3">
        {missions.map((m) => {
          const isComplete = m.progress >= m.target;
          const progressPercent = Math.min(100, Math.round((m.progress / m.target) * 100));

          return (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl bg-[#121217] border border-[#232332] flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">{m.title}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#1A1A26] border border-[#2B2B3D] text-[10px] font-semibold text-slate-300">
                    {m.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{m.description}</p>

                {/* Progress bar */}
                <div className="w-full bg-[#1A1A26] h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Progress: {m.progress}/{m.target} ({progressPercent}%)
                </span>
              </div>

              {/* Reward & Claim */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <span>+{m.rewardCoins} 🪙</span>
                  <span className="text-violet-300 font-bold">+{m.rewardXp} XP</span>
                </span>

                <button
                  onClick={() => handleClaim(m.id)}
                  disabled={!isComplete || m.isClaimed}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    m.isClaimed
                      ? 'bg-[#1A1A24] text-slate-500 border border-[#232332] cursor-default'
                      : isComplete
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:brightness-110 active:scale-95 animate-pulse'
                      : 'bg-[#1A1A24] text-slate-400 border border-[#232332]'
                  }`}
                >
                  {m.isClaimed ? 'Claimed ✓' : isComplete ? 'Claim Reward' : 'In Progress'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
