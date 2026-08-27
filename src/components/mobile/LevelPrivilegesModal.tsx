import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Sparkles, Star, Award, Zap, ChevronRight, Check } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface LevelPrivilegesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LevelPrivilegesModal: React.FC<LevelPrivilegesModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAppState();

  if (!isOpen) return null;

  const currentLevel = currentUser.level;
  const currentXp = (currentUser.experiencePoints || 0) % 1000;
  const progressPercent = Math.min(100, Math.round((currentXp / 1000) * 100));

  const levelTiers = [
    {
      level: 1,
      title: 'Bronze Star',
      badge: '🥉',
      color: 'from-amber-700 to-amber-900',
      perks: ['Join any public voice room', 'Send standard gifts', 'Custom profile bio'],
    },
    {
      level: 5,
      title: 'Silver Star',
      badge: '🥈',
      color: 'from-slate-400 to-slate-600',
      perks: ['Unlock dynamic chat bubble', 'Host private 8-seat rooms', '5% more mission rewards'],
    },
    {
      level: 10,
      title: 'Gold Star',
      badge: '🥇',
      color: 'from-amber-400 to-amber-600',
      perks: ['Exclusive Gold Star entry badge', 'Unlock 12-seat room layout', 'Priority customer support'],
    },
    {
      level: 20,
      title: 'Diamond Master',
      badge: '💎',
      color: 'from-cyan-400 to-blue-600',
      perks: ['Full-screen broadcast animation on entrance', 'Direct agency partner access', 'Personalized numeric ID'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm bg-[#121217] border border-[#232332] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#232332] flex items-center justify-between bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-violet-600/30 text-violet-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Level & Prestige Perks</h3>
              <p className="text-[10px] text-slate-400">Level up by gifting, hosting & chatting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level XP Card */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-950/60 via-[#1A1A24] to-amber-950/40 border border-violet-500/40 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-black shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Level {currentLevel} Star</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-300">Current Progress</span>
                <span className="text-amber-300">{currentXp} / 1,000 XP</span>
              </div>
              <div className="w-full bg-[#0B0B0F] h-2.5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Earn <strong className="text-violet-300">{1000 - currentXp} more XP</strong> to reach Level {currentLevel + 1}
              </p>
            </div>
          </div>

          {/* How to Earn XP */}
          <div className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-2">
            <h4 className="font-black text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ways to Earn XP
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-[#121217] border border-white/5">
                <span className="font-bold text-amber-300 block">🎁 Send Gifts</span>
                <span className="text-slate-400 text-[10px]">1 Coin = 1 XP</span>
              </div>
              <div className="p-2 rounded-xl bg-[#121217] border border-white/5">
                <span className="font-bold text-violet-300 block">🎙️ Host & Mic</span>
                <span className="text-slate-400 text-[10px]">10 mins = 50 XP</span>
              </div>
              <div className="p-2 rounded-xl bg-[#121217] border border-white/5">
                <span className="font-bold text-emerald-300 block">✨ Daily Missions</span>
                <span className="text-slate-400 text-[10px]">Up to 300 XP/day</span>
              </div>
              <div className="p-2 rounded-xl bg-[#121217] border border-white/5">
                <span className="font-bold text-pink-300 block">👑 VIP Bonus</span>
                <span className="text-slate-400 text-[10px]">2x XP Multiplier</span>
              </div>
            </div>
          </div>

          {/* Milestone Tiers */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-300 text-[11px] uppercase tracking-wider">Level Milestones & Privileges</h4>
            {levelTiers.map((tier) => {
              const isUnlocked = currentLevel >= tier.level;

              return (
                <div
                  key={tier.level}
                  className={`p-3 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-[#1A1A24] border-violet-500/50'
                      : 'bg-[#121217] border-[#232332] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tier.badge}</span>
                      <div>
                        <span className="font-black text-white">{tier.title} (Lv.{tier.level})</span>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-bold">
                        Requires Lv.{tier.level}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pl-7">
                    {tier.perks.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <Check className="w-2.5 h-2.5 text-violet-400 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
