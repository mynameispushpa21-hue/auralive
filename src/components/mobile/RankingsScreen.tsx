import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Flame, Coins, Sparkles, ChevronLeft } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface RankingsScreenProps {
  onBack?: () => void;
}

export const RankingsScreen: React.FC<RankingsScreenProps> = ({ onBack }) => {
  const { leaderboards } = useAppState();
  const [boardType, setBoardType] = useState<'hosts' | 'wealth'>('hosts');
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const currentList = boardType === 'hosts' ? leaderboards.hosts : leaderboards.wealth;
  const topThree = currentList.slice(0, 3);
  const remaining = currentList.slice(3);

  return (
    <div id="rankings-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-[#0B0B0F]">
      {/* Header */}
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
          <h2 className="text-xl font-bold font-display text-white">Global Hall of Fame</h2>
          <p className="text-xs text-slate-400">Honoring top creators and premier gift patrons</p>
        </div>
      </div>

      {/* Main Switcher: Star Hosts vs Wealth Patrons */}
      <div className="grid grid-cols-2 gap-2 bg-[#121217] p-1 rounded-2xl border border-[#232332]">
        <button
          onClick={() => setBoardType('hosts')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            boardType === 'hosts'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Star Hosts (Diamonds)</span>
        </button>

        <button
          onClick={() => setBoardType('wealth')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            boardType === 'wealth'
              ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Wealth Patrons (Coins)</span>
        </button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center justify-center gap-2">
        {(['Daily', 'Weekly', 'Monthly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              timeframe === t
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-[#121217] text-slate-400 hover:text-slate-200 border border-[#232332]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* PODIUM DISPLAY (1st in center, 2nd on left, 3rd on right) */}
      <div className="my-2 py-4 px-2 rounded-3xl bg-[#121217] border border-violet-500/20 shadow-2xl flex items-end justify-center gap-3">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <img
                src={topThree[1].avatar}
                alt={topThree[1].username}
                className="w-14 h-14 rounded-full object-cover ring-3 ring-slate-400 shadow-lg"
              />
              <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full bg-slate-400 text-slate-950 text-[10px] font-black">
                #2
              </span>
            </div>
            <span className="text-xs font-bold text-slate-200 mt-1.5 truncate max-w-[80px] text-center">
              {topThree[1].username}
            </span>
            <span className="text-[11px] font-black text-slate-300 mt-0.5">{topThree[1].formattedScore}</span>
            <div className="w-full h-16 mt-2 rounded-t-xl bg-[#1A1A24] border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-400 text-sm">
              2nd
            </div>
          </div>
        )}

        {/* 1st Place (Center Champion) */}
        {topThree[0] && (
          <div className="flex flex-col items-center flex-1 -mt-4">
            <div className="relative">
              <Crown className="w-6 h-6 text-amber-300 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
              <img
                src={topThree[0].avatar}
                alt={topThree[0].username}
                className="w-18 h-18 rounded-full object-cover ring-4 ring-amber-400 shadow-2xl shadow-violet-500/40"
              />
              <span className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                #1
              </span>
            </div>
            <span className="text-xs font-black text-amber-200 mt-1.5 truncate max-w-[90px] text-center">
              {topThree[0].username}
            </span>
            <span className="text-xs font-black text-amber-400 mt-0.5">{topThree[0].formattedScore}</span>
            <div className="w-full h-22 mt-2 rounded-t-2xl bg-gradient-to-t from-violet-600/30 to-amber-500/40 border-t-2 border-amber-300 flex items-center justify-center font-black text-amber-200 text-base shadow-lg">
              1st 🏆
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <img
                src={topThree[2].avatar}
                alt={topThree[2].username}
                className="w-14 h-14 rounded-full object-cover ring-3 ring-amber-700 shadow-lg"
              />
              <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[10px] font-black">
                #3
              </span>
            </div>
            <span className="text-xs font-bold text-slate-200 mt-1.5 truncate max-w-[80px] text-center">
              {topThree[2].username}
            </span>
            <span className="text-[11px] font-black text-amber-500 mt-0.5">{topThree[2].formattedScore}</span>
            <div className="w-full h-12 mt-2 rounded-t-xl bg-[#1A1A24] border-t-2 border-amber-700 flex items-center justify-center font-black text-amber-500 text-sm">
              3rd
            </div>
          </div>
        )}
      </div>

      {/* Remaining Ranks (4 - 10) */}
      <div className="space-y-2">
        {remaining.map((item, idx) => (
          <div
            key={item.userId}
            className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 font-black text-slate-500 text-center">#{idx + 4}</span>
              <img src={item.avatar} alt={item.username} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700" />
              <div>
                <p className="font-bold text-white flex items-center gap-1">
                  <span>{item.username}</span>
                  <span>{item.countryFlag}</span>
                </p>
                <span className="text-[10px] text-slate-400">Level {item.level}</span>
              </div>
            </div>
            <span className="font-black text-violet-400">{item.formattedScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
