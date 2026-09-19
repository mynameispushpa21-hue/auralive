import React from 'react';
import { Trophy, Flame, Calendar, Sparkles, Award, ChevronLeft } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface EventsScreenProps {
  onJoinRoom?: (roomId: string) => void;
  onBack?: () => void;
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ onJoinRoom, onBack }) => {
  const { events, rooms } = useAppState();

  return (
    <div id="events-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-transparent">
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
          <h2 className="text-xl font-bold font-display text-white">Tournaments & Seasonal Events</h2>
          <p className="text-xs text-slate-400">Compete for cash prize pools, exclusive avatar frames & badges</p>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          return (
            <div
              key={event.id}
              className="rounded-3xl bg-[#121217] border border-violet-500/30 overflow-hidden shadow-xl flex flex-col"
            >
              {/* Event Cover Image */}
              <div className="relative h-40 w-full overflow-hidden">
                <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/30 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
                  Active Event
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <h3 className="text-base font-black text-white">{event.title}</h3>
                  <span className="text-xs font-black text-violet-300 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    ${event.prizePoolUsd.toLocaleString()} USD Pool
                  </span>
                </div>
              </div>

              {/* Event Details & Rules */}
              <div className="p-4 space-y-3 text-xs">
                <p className="text-slate-300">{event.description}</p>

                <div className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-1.5">
                  <span className="font-bold text-violet-400 block uppercase tracking-wider text-[10px]">
                    Contest Rules & Gifting Boosts
                  </span>
                  {event.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>

                {/* Leaderboard Participants in Event */}
                <div>
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">
                    Current Top Contenders
                  </h4>
                  <div className="space-y-1.5">
                    {event.leaderboard.map((item) => (
                      <div
                        key={item.userId}
                        className="p-2 rounded-xl bg-[#1A1A24] border border-[#232332]/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              item.rank === 1
                                ? 'bg-amber-400 text-slate-950'
                                : item.rank === 2
                                ? 'bg-slate-300 text-slate-950'
                                : 'bg-amber-700 text-white'
                            }`}
                          >
                            #{item.rank}
                          </span>
                          <img src={item.avatar} alt={item.displayName} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold text-slate-200">{item.displayName}</span>
                        </div>
                        <span className="font-black text-violet-400">{item.score.toLocaleString()} pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Join Tournament Action */}
                <button
                  onClick={() => {
                    if (rooms.length > 0 && onJoinRoom) onJoinRoom(rooms[0].id);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-black text-xs hover:brightness-110 active:scale-98 transition-all shadow-md"
                >
                  Enter Event Live Stages
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
