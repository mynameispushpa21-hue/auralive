import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Crown,
  Sparkles,
  ChevronRight,
  Flame,
  Radio,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface TopHostsLeaderboardProps {
  onOpenRankings?: () => void;
  onJoinRoom?: (roomId: string) => void;
}

export const TopHostsLeaderboard: React.FC<TopHostsLeaderboardProps> = ({
  onOpenRankings,
  onJoinRoom,
}) => {
  const { leaderboards, allUsers, currentUser, rooms } = useAppState();
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'All-Time'>('Daily');
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);

  // Derive top 5 hosts sorted by diamond earnings
  const topHosts = useMemo(() => {
    const baseHosts = [...(leaderboards.hosts || [])];

    // Merge with real-time allUsers & currentUser balances
    const merged = baseHosts.map((entry) => {
      const user =
        allUsers.find((u) => u.id === entry.userId) ||
        (currentUser.id === entry.userId ? currentUser : null);

      let diamonds = user ? user.diamonds : entry.score;

      // Adjust slightly by timeframe filter for realism
      if (timeframe === 'Daily') {
        diamonds = Math.round(diamonds * 0.28);
      } else if (timeframe === 'Weekly') {
        diamonds = Math.round(diamonds * 0.72);
      }

      // Check if this host has an active live room right now
      const activeRoom = rooms.find(
        (r) => r.host.id === entry.userId || r.host.displayName === entry.username
      );

      return {
        ...entry,
        diamonds,
        username: user?.displayName || entry.username,
        avatar: user?.avatar || entry.avatar,
        level: user?.level || entry.level,
        vipTier: user?.vipTier || entry.vipTier,
        countryFlag: user?.countryFlag || entry.countryFlag,
        activeRoomId: activeRoom?.id,
        activeRoomTitle: activeRoom?.title,
      };
    });

    // Sort descending by diamond earnings
    merged.sort((a, b) => b.diamonds - a.diamonds);

    const maxDiamonds = merged[0]?.diamonds || 1;

    return merged.slice(0, 5).map((host, idx) => ({
      ...host,
      rank: idx + 1,
      ratio: Math.min(100, Math.max(15, (host.diamonds / maxDiamonds) * 100)),
      formattedDiamonds:
        host.diamonds >= 1000
          ? `${(host.diamonds / 1000).toFixed(1)}K`
          : host.diamonds.toLocaleString(),
    }));
  }, [leaderboards.hosts, allUsers, currentUser, rooms, timeframe]);

  // Rank badge styling helper
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)]',
          ring: 'ring-2 ring-amber-400',
          crownColor: 'text-amber-300',
          containerBg: 'bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/30',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400 text-slate-950 font-black shadow-[0_0_10px_rgba(203,213,225,0.4)]',
          ring: 'ring-2 ring-slate-300',
          crownColor: 'text-slate-300',
          containerBg: 'bg-gradient-to-r from-slate-400/10 to-transparent border-slate-400/20',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-800 text-white font-black shadow-[0_0_10px_rgba(180,83,9,0.3)]',
          ring: 'ring-2 ring-amber-600',
          crownColor: 'text-amber-600',
          containerBg: 'bg-gradient-to-r from-amber-700/10 to-transparent border-amber-700/20',
        };
      default:
        return {
          bg: 'bg-[#1F1F2C] text-slate-400 font-bold border border-slate-700',
          ring: 'ring-1 ring-slate-700',
          crownColor: '',
          containerBg: 'bg-[#14141C] border-[#232332]',
        };
    }
  };

  return (
    <div
      id="top-hosts-leaderboard"
      className="mx-4 rounded-3xl bg-[#12121A] border border-[#232332] p-4 shadow-xl relative overflow-hidden"
    >
      {/* Subtle Ambient Background Flare */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative z-10 flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-violet-500/20 to-pink-500/20 border border-amber-500/30 flex items-center justify-center shadow-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white tracking-tight font-display">
                Top Hosts
              </h3>
              <span className="px-1.5 py-0.2 rounded-full bg-violet-500/15 border border-violet-500/30 text-[9px] font-black text-violet-300 uppercase tracking-wide">
                Diamonds
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Top 5 creators by diamond earnings</p>
          </div>
        </div>

        {/* View All Button */}
        {onOpenRankings && (
          <button
            onClick={onOpenRankings}
            className="group flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-[#1A1A26] hover:bg-[#252538] border border-[#2E2E44] text-[11px] font-bold text-violet-300 hover:text-violet-200 transition-all shadow-xs cursor-pointer"
            title="View Full Hall of Fame"
          >
            <span>All Ranks</span>
            <ChevronRight className="w-3.5 h-3.5 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* TIMEFRAME SELECTOR PILLS */}
      <div className="relative z-10 flex items-center justify-between gap-1 p-1 mb-3 rounded-2xl bg-[#0B0B11] border border-[#1E1E2C]">
        {(['Daily', 'Weekly', 'All-Time'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-center ${
              timeframe === t
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TOP 5 HOSTS LIST */}
      <div className="relative z-10 space-y-2">
        {topHosts.map((host) => {
          const style = getRankBadgeStyle(host.rank);
          const isSelected = selectedHostId === host.userId;

          return (
            <motion.div
              key={host.userId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                if (host.activeRoomId && onJoinRoom) {
                  onJoinRoom(host.activeRoomId);
                } else {
                  setSelectedHostId(isSelected ? null : host.userId);
                }
              }}
              className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${style.containerBg} hover:border-violet-500/40`}
            >
              {/* LEFT: Rank Indicator & Mini-Avatar */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Indicator Badge */}
                <div className="flex flex-col items-center justify-center shrink-0 w-6">
                  {host.rank === 1 && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 mb-0.5 animate-bounce" />
                  )}
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${style.bg}`}
                  >
                    #{host.rank}
                  </span>
                </div>

                {/* Mini-Avatar with Status Ring & Country Flag */}
                <div className="relative shrink-0">
                  <img
                    src={host.avatar}
                    alt={host.username}
                    className={`w-10 h-10 rounded-full object-cover ${style.ring}`}
                  />

                  {/* Country Flag badge */}
                  <span
                    className="absolute -bottom-1 -left-1 text-[11px] leading-none drop-shadow-xs"
                    title={host.countryFlag}
                  >
                    {host.countryFlag}
                  </span>

                  {/* Live Room Indicator if host is on air */}
                  {host.activeRoomId && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-600 text-white text-[8px] font-black tracking-tighter flex items-center gap-0.5 shadow-xs animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Host Info (Name, Level, VIP) */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[110px] sm:max-w-[140px]">
                      {host.username}
                    </span>
                    {host.vipTier && host.vipTier !== 'vip_0' && (
                      <span className="px-1.5 py-0.2 rounded-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-[8px] font-black text-slate-950 uppercase shadow-2xs">
                        {host.vipTier.replace('vip_', 'VIP ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300">
                      Lv.{host.level}
                    </span>
                    {host.activeRoomId ? (
                      <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-0.5 truncate">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        <span>Room #{host.activeRoomTitle || 'Voice'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Top Star Creator</span>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Diamond Earnings & Join / Action Pill */}
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A1A26] border border-cyan-500/30 shadow-xs">
                  <span className="text-xs drop-shadow-xs">💎</span>
                  <span className="text-xs font-black text-cyan-300 font-mono tracking-tight">
                    {host.formattedDiamonds}
                  </span>
                </div>

                {/* Subtle Relative Earnings Progress Bar */}
                <div className="w-16 h-1 rounded-full bg-slate-800/80 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${host.ratio}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FOOTER CALL-TO-ACTION */}
      <div className="mt-3 pt-2.5 border-t border-[#1F1F2C] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Hosts earn 70% direct diamond payout</span>
        </div>

        {onOpenRankings && (
          <button
            onClick={onOpenRankings}
            className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>Leaderboards</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
