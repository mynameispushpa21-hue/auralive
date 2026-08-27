import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Radio,
  Sparkles,
  Search,
  Flame,
  Users,
  Trophy,
  Crown,
  Zap,
  TrendingUp,
  Volume2,
  ChevronRight,
  Gift,
  Coins,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { VoiceRoom } from '../../types';

interface HomeScreenProps {
  onJoinRoom: (roomId: string) => void;
  onOpenCoinStore: () => void;
  onOpenCreateRoom: () => void;
  onOpenVIPCenter: () => void;
  onOpenEvents: () => void;
  onOpenRankings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onJoinRoom,
  onOpenCoinStore,
  onOpenCreateRoom,
  onOpenVIPCenter,
  onOpenEvents,
  onOpenRankings,
}) => {
  const { rooms, currentUser, events, leaderboards, allUsers } = useAppState();
  const [activeTab, setActiveTab] = useState<'Recommended' | 'Popular' | 'New' | 'VIP'>('Recommended');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Music', 'Chat', 'Gaming', 'Karaoke', 'Chill', 'Dating'];

  const filteredRooms = rooms.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.host.displayName.toLowerCase().includes(q) ||
        r.roomIdNumber.includes(q)
      );
    }
    if (activeTab === 'Popular') return r.hotScore > 5000;
    if (activeTab === 'VIP') return r.host.vipTier !== 'vip_0';
    return true;
  });

  return (
    <div id="home-screen" className="flex flex-col gap-4 pb-20 text-slate-100 bg-[#0B0B0F]">
      {/* Top Banner Carousel / Event Spotlight */}
      {events.length > 0 && (
        <div
          onClick={onOpenEvents}
          className="relative mx-4 mt-2 h-36 rounded-2xl overflow-hidden cursor-pointer group shadow-xl border border-violet-500/30"
        >
          <img
            src={events[0].bannerUrl}
            alt={events[0].title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/40 to-transparent p-3.5 flex flex-col justify-end">
            <span className="self-start px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] font-black uppercase tracking-wider mb-1 shadow-xs">
              🏆 Active Championship
            </span>
            <h3 className="text-sm font-extrabold text-white line-clamp-1">{events[0].title}</h3>
            <p className="text-xs text-violet-200 font-medium">Prize Pool: ${events[0].prizePoolUsd.toLocaleString()} USD • Tap to join</p>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Pills */}
      <div className="px-4 grid grid-cols-4 gap-2">
        <button
          onClick={onOpenRankings}
          className="p-2 rounded-2xl bg-[#121217] border border-[#232332] hover:border-amber-500/40 flex flex-col items-center justify-center hover:brightness-110 transition-all shadow-xs"
        >
          <span className="text-xl">🏆</span>
          <span className="text-[11px] font-bold text-amber-300 mt-1">Rankings</span>
        </button>

        <button
          onClick={onOpenVIPCenter}
          className="p-2 rounded-2xl bg-[#121217] border border-[#232332] hover:border-violet-500/40 flex flex-col items-center justify-center hover:brightness-110 transition-all shadow-xs"
        >
          <span className="text-xl">👑</span>
          <span className="text-[11px] font-bold text-violet-300 mt-1">VIP Club</span>
        </button>

        <button
          onClick={onOpenCoinStore}
          className="p-2 rounded-2xl bg-[#121217] border border-[#232332] hover:border-emerald-500/40 flex flex-col items-center justify-center hover:brightness-110 transition-all shadow-xs"
        >
          <span className="text-xl">🪙</span>
          <span className="text-[11px] font-bold text-emerald-300 mt-1">Recharge</span>
        </button>

        <button
          onClick={onOpenCreateRoom}
          className="p-2 rounded-2xl bg-[#121217] border border-[#232332] hover:border-rose-500/40 flex flex-col items-center justify-center hover:brightness-110 transition-all shadow-xs"
        >
          <span className="text-xl">🎙️</span>
          <span className="text-[11px] font-bold text-rose-300 mt-1">Go Live</span>
        </button>
      </div>

      {/* Top Voice Creators Podium Bar */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Top Voice Stars</h3>
          </div>
          <button onClick={onOpenRankings} className="text-xs text-violet-400 hover:underline flex items-center gap-0.5">
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {leaderboards.hosts.slice(0, 6).map((host, idx) => (
            <div key={host.userId} className="flex flex-col items-center shrink-0 cursor-pointer group">
              <div className="relative">
                <img
                  src={host.avatar}
                  alt={host.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-500 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-[9px] font-black text-white shadow-xs">
                  #{idx + 1}
                </span>
                <span className="absolute -bottom-1 -left-1 text-xs">{host.countryFlag}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-200 mt-1 truncate max-w-[60px] text-center">
                {host.username}
              </span>
              <span className="text-[9px] font-bold text-violet-400">{host.formattedScore}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="px-4 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms, hosts, or 6-digit ID..."
            className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-400"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-[#121217] text-slate-400 hover:bg-[#1A1A24] border border-[#232332]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs: Recommended / Popular / New / VIP */}
      <div className="px-4">
        <div className="flex items-center gap-4 border-b border-[#232332] pb-2">
          {(['Recommended', 'Popular', 'New', 'VIP'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold transition-colors relative pb-1 ${
                activeTab === tab ? 'text-violet-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="homeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Live Voice Rooms Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filteredRooms.map((room) => {
          const isLiveSpeaking = room.seats.some((s) => s.isSpeaking && !s.isMuted);

          return (
            <motion.div
              key={room.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onJoinRoom(room.id)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group bg-[#121217] border border-[#232332] hover:border-violet-500/50 transition-all shadow-md flex flex-col"
            >
              {/* Room Cover Photo */}
              <div className="relative h-28 w-full overflow-hidden">
                <img
                  src={room.coverUrl}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/20 to-transparent" />

                {/* Top Tags */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] font-bold text-violet-300 border border-violet-400/30">
                    {room.category}
                  </span>
                </div>

                {/* Hot Score & Audience */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>{room.audienceCount}</span>
                </div>

                {/* Speaking Wave Status */}
                {isLiveSpeaking && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-violet-600/90 text-white text-[9px] font-black shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>ON AIR</span>
                  </div>
                )}
              </div>

              {/* Room Info */}
              <div className="p-2.5 flex flex-col justify-between flex-1">
                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {room.title}
                </h4>

                <div className="mt-2 pt-2 border-t border-[#232332] flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <img
                      src={room.host.avatar}
                      alt={room.host.displayName}
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-violet-400"
                    />
                    <span className="truncate">{room.host.displayName}</span>
                  </div>
                  <span className="text-[10px] text-violet-300 font-bold shrink-0">{room.seats.filter(s => s.userId).length}/{room.seatCount} 🎙️</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
