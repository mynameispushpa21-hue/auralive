import React, { useState, useMemo } from 'react';
import { X, Crown, Trophy, Coins, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../../services/stateStore';

interface RoomLeaderboardModalProps {
  roomId: string;
  onClose: () => void;
}

export const RoomLeaderboardModal: React.FC<RoomLeaderboardModalProps> = ({ roomId, onClose }) => {
  const { transactions, allUsers } = useAppState();
  const [activeTab, setActiveTab] = useState<'receivers' | 'senders'>('receivers');
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const leaderboardData = useMemo(() => {
    const roomTxs = transactions.filter(t => t.metadata?.roomId === roomId);
    
    // Filter by time
    const now = new Date();
    const filteredTxs = roomTxs.filter(t => {
      const txDate = new Date(t.createdAt);
      if (timeFilter === 'daily') {
        return txDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      } else {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return txDate >= monthAgo;
      }
    });

    const userTotals: Record<string, number> = {};

    filteredTxs.forEach(tx => {
      if (activeTab === 'receivers' && tx.type === 'gift_received') {
        userTotals[tx.userId] = (userTotals[tx.userId] || 0) + tx.amount;
      } else if (activeTab === 'senders' && tx.type === 'gift_sent') {
        userTotals[tx.userId] = (userTotals[tx.userId] || 0) + tx.amount;
      }
    });

    const sortedUsers = Object.entries(userTotals)
      .map(([userId, score]) => {
        const user = allUsers.find(u => u.id === userId);
        return { userId, score, user };
      })
      .filter(item => item.user)
      .sort((a, b) => b.score - a.score);

    return sortedUsers;
  }, [transactions, roomId, activeTab, timeFilter, allUsers]);

  const top3 = leaderboardData.slice(0, 3);
  const restList = leaderboardData.slice(3);

  // Reorder top3 for podium: [2nd, 1st, 3rd]
  const podium = [];
  if (top3[1]) podium.push({ ...top3[1], rank: 2 });
  if (top3[0]) podium.push({ ...top3[0], rank: 1 });
  if (top3[2]) podium.push({ ...top3[2], rank: 3 });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full h-[85vh] sm:h-[600px] sm:max-w-md bg-[#0B0B0F] rounded-t-3xl sm:rounded-3xl border border-[#232332] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header Tabs */}
        <div className="pt-6 px-4 pb-4 border-b border-[#232332] bg-[#121217]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Room Leaderboard</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-[#1A1A24] text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex bg-[#1A1A24] rounded-xl p-1 mb-4">
            <button
              onClick={() => setActiveTab('receivers')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'receivers' ? 'bg-violet-600 text-white' : 'text-slate-400'
              }`}
            >
              <Crown className="w-4 h-4" />
              Star Hosts (Diamonds)
            </button>
            <button
              onClick={() => setActiveTab('senders')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'senders' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              <Coins className="w-4 h-4" />
              Wealth Patrons (Coins)
            </button>
          </div>

          <div className="flex justify-center gap-2">
            {['daily', 'weekly', 'monthly'].map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                  timeFilter === filter 
                    ? 'bg-violet-600 text-white border-2 border-violet-500' 
                    : 'bg-[#1A1A24] text-slate-400 border-2 border-transparent'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {leaderboardData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Trophy className="w-12 h-12 mb-3 opacity-20" />
              <p>No activity found for this period</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              <div className="flex items-end justify-center h-48 mb-6 gap-2">
                {podium.map((item, idx) => {
                  const isFirst = item.rank === 1;
                  const isSecond = item.rank === 2;
                  
                  return (
                    <div key={item.userId} className={`flex flex-col items-center relative ${isFirst ? 'z-10' : 'z-0'}`}>
                      {isFirst && <Crown className="w-6 h-6 text-amber-400 absolute -top-8 animate-bounce" />}
                      <div className="relative mb-2">
                        <img 
                          src={item.user!.avatar} 
                          alt={item.user!.displayName} 
                          className={`rounded-full object-cover border-2 ${
                            isFirst ? 'w-20 h-20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 
                            isSecond ? 'w-16 h-16 border-slate-300' : 'w-16 h-16 border-amber-600'
                          }`} 
                        />
                        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md ${
                          isFirst ? 'bg-amber-400 text-amber-950' : 
                          isSecond ? 'bg-slate-300 text-slate-900' : 'bg-amber-600 text-white'
                        }`}>
                          #{item.rank}
                        </div>
                      </div>
                      
                      <div className="text-center mt-2 w-20">
                        <p className="text-white font-bold text-xs truncate">{item.user!.displayName}</p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <span className={`text-[10px] font-black ${activeTab === 'receivers' ? 'text-violet-300' : 'text-amber-400'}`}>
                            {item.score >= 1000 ? (item.score / 1000).toFixed(1) + 'K' : item.score}
                          </span>
                          {activeTab === 'receivers' ? <span className="text-[10px]">💎</span> : <span className="text-[10px]">🪙</span>}
                        </div>
                      </div>

                      <div className={`w-20 rounded-t-xl mt-3 flex items-center justify-center font-black text-white/50 ${
                        isFirst ? 'h-16 bg-gradient-to-t from-amber-500/40 to-amber-500/10' :
                        isSecond ? 'h-10 bg-gradient-to-t from-slate-400/40 to-slate-400/10' :
                        'h-8 bg-gradient-to-t from-amber-700/40 to-amber-700/10'
                      }`}>
                        {item.rank}{item.rank === 1 ? 'st' : item.rank === 2 ? 'nd' : 'rd'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* List */}
              <div className="space-y-2">
                {restList.map((item, index) => (
                  <div key={item.userId} className="flex items-center justify-between p-3 rounded-2xl bg-[#1A1A24] border border-[#232332]">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-bold w-6 text-center">#{index + 4}</span>
                      <img src={item.user!.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold text-white">{item.user!.displayName}</p>
                        <p className="text-[10px] text-slate-400">Level {item.user!.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-black ${activeTab === 'receivers' ? 'text-violet-300' : 'text-amber-400'}`}>
                        {item.score >= 1000 ? (item.score / 1000).toFixed(1) + 'K' : item.score}
                      </span>
                      {activeTab === 'receivers' ? <span className="text-[10px]">💎</span> : <span className="text-[10px]">🪙</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
