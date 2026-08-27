import React, { useState } from 'react';
import { Search, Globe, Flame, Music, Gamepad2, Mic, HeartHandshake, Sparkles, ChevronRight } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface DiscoverScreenProps {
  onJoinRoom: (roomId: string) => void;
  onOpenRankings: () => void;
  onOpenEvents: () => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onJoinRoom,
  onOpenRankings,
  onOpenEvents,
}) => {
  const { rooms, events, leaderboards } = useAppState();
  const [selectedCountry, setSelectedCountry] = useState('All');

  const countries = [
    { name: 'All', flag: '🌍' },
    { name: 'United States', flag: '🇺🇸' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'UAE', flag: '🇦🇪' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'France', flag: '🇫🇷' },
  ];

  const categoryCards = [
    { title: 'Acoustic & Live Singing', icon: <Music className="w-5 h-5 text-amber-400" />, count: '142 Rooms', bg: 'from-amber-950 to-slate-900', border: 'border-amber-500/30' },
    { title: 'Karaoke & Talent Contests', icon: <Mic className="w-5 h-5 text-purple-400" />, count: '86 Rooms', bg: 'from-purple-950 to-slate-900', border: 'border-purple-500/30' },
    { title: 'Gaming & Co-op Squads', icon: <Gamepad2 className="w-5 h-5 text-cyan-400" />, count: '94 Rooms', bg: 'from-cyan-950 to-slate-900', border: 'border-cyan-500/30' },
    { title: 'Late Night Chill & Dating', icon: <HeartHandshake className="w-5 h-5 text-rose-400" />, count: '118 Rooms', bg: 'from-rose-950 to-slate-900', border: 'border-rose-500/30' },
  ];

  return (
    <div id="discover-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-[#0B0B0F]">
      {/* Search Header */}
      <div className="mt-2">
        <h2 className="text-xl font-bold font-display text-white mb-2">Discover Audio Stage</h2>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search channels, topics, or hosts..."
            className="w-full pl-9.5 pr-4 py-2.5 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-400"
          />
        </div>
      </div>

      {/* Country Filter */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Globe className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Explore by Region</h3>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {countries.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCountry(c.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCountry === c.name
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-[#121217] text-slate-300 border border-[#232332] hover:bg-[#1A1A24]'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discover Category Tiles */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Popular Audio Genres</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {categoryCards.map((card) => (
            <div
              key={card.title}
              onClick={() => {
                if (rooms.length > 0) onJoinRoom(rooms[0].id);
              }}
              className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-violet-500/50 cursor-pointer hover:brightness-110 transition-all shadow-md flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-xl bg-black/40 backdrop-blur-xs">{card.icon}</div>
                <span className="text-[10px] text-slate-400 font-semibold">{card.count}</span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{card.title}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Active Tournament Highlight */}
      {events.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#121217] border border-violet-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Featured Contest
            </span>
            <button onClick={onOpenEvents} className="text-xs text-violet-400 hover:underline">
              Rules & Prizes
            </button>
          </div>
          <h4 className="text-sm font-extrabold text-white">{events[0].title}</h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{events[0].description}</p>
        </div>
      )}

      {/* Trending Rooms List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-4 h-4 text-violet-400 fill-violet-400" /> Hot Trending Stages
          </h3>
          <button onClick={onOpenRankings} className="text-xs text-violet-400 hover:underline">
            Leaderboards
          </button>
        </div>

        <div className="space-y-2">
          {rooms.slice(0, 3).map((room, idx) => (
            <div
              key={room.id}
              onClick={() => onJoinRoom(room.id)}
              className="p-2.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-violet-500/40 cursor-pointer transition-all flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-violet-400 w-4 text-center">#{idx + 1}</span>
                <img src={room.coverUrl} alt={room.title} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{room.title}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{room.host.displayName}</span>
                    <span>•</span>
                    <span className="text-violet-300">{room.category}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-400">{room.audienceCount} Live</span>
                <p className="text-[10px] text-slate-400">{room.seatCount} Seats</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
