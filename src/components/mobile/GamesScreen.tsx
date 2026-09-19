import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Flame,
  Search,
  Zap,
  RotateCcw,
  Coins,
  History,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
  Crown,
  Play,
  Percent,
} from 'lucide-react';
import { GameItem, GameCategory } from '../../types';
import { useAppState } from '../../services/stateStore';
import { MiniGamePlayerModal } from './MiniGamePlayerModal';

interface GamesScreenProps {
  onOpenCoinStore?: () => void;
  onOpenVIP?: () => void;
}

export const GamesScreen: React.FC<GamesScreenProps> = ({ onOpenCoinStore, onOpenVIP }) => {
  const { games, currentUser, recentJackpotWinners, gameHistory } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePlayGame, setActivePlayGame] = useState<GameItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Games', icon: '🎮' },
    { id: 'hot', label: 'Jackpot Hot', icon: '🔥' },
    { id: 'wheel', label: 'Wheel', icon: '🎡' },
    { id: 'slots', label: 'Slots', icon: '🎰' },
    { id: 'crash', label: 'Crash', icon: '🚀' },
    { id: 'dice', label: 'Dice', icon: '🎲' },
    { id: 'cards', label: 'Cards', icon: '🃏' },
  ];

  // Filter games based on search and category
  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'hot') return g.isHot || g.isJackpotGame;
    return g.category === selectedCategory;
  });

  // Calculate cumulative jackpot
  const totalCombinedJackpot = games.reduce((acc, g) => acc + g.jackpotPool, 0);

  // User gaming statistics
  const userBetHistory = gameHistory.filter((h) => h.userId === currentUser.id);
  const totalUserBets = userBetHistory.length;
  const totalUserWins = userBetHistory.filter((h) => h.isWin).length;
  const totalWonCoins = userBetHistory.reduce((acc, h) => acc + h.payoutAmount, 0);
  const winRate = totalUserBets > 0 ? Math.round((totalUserWins / totalUserBets) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-100 overflow-y-auto no-scrollbar pb-24">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 px-4 py-3 bg-[#0E0E16]/95 backdrop-blur-md border-b border-[#1E1E2C] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white font-display tracking-tight flex items-center gap-1.5">
              Arcade & Games
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-400">
                LIVE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Play provably fair mini-games & win coins</p>
          </div>
        </div>

        {/* User Balance Chip */}
        <div className="flex items-center gap-1.5">
          <div
            onClick={onOpenCoinStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181826] border border-amber-500/30 hover:border-amber-400/60 cursor-pointer transition-all shadow-xs"
          >
            <span className="text-xs">🪙</span>
            <span className="text-xs font-black text-amber-300">{currentUser.coins.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-400/20 px-1 rounded-full">+</span>
          </div>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-full bg-[#181826] border border-[#262638] text-slate-300 hover:text-white"
            title="My Gaming History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Mega Jackpot Reservoir Banner */}
        <div className="relative p-4 rounded-3xl bg-gradient-to-br from-[#1C1236] via-[#161026] to-[#0D091A] border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  MEGA JACKPOT POOL
                </span>
              </div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-display">
                🪙 {totalCombinedJackpot.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400">
                Grows with every bet • 100% Provably Fair RNG
              </p>
            </div>

            <button
              onClick={() => {
                const jackpotGame = games.find((g) => g.isJackpotGame) || games[0];
                if (jackpotGame) setActivePlayGame(jackpotGame);
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPIN NOW</span>
            </button>
          </div>

          {/* Recent Jackpot Winners Marquee */}
          {recentJackpotWinners.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px]">
              <span className="text-amber-400 font-bold shrink-0 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Winners:
              </span>
              <div className="flex items-center gap-3 shrink-0">
                {recentJackpotWinners.slice(0, 5).map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 border border-amber-500/20 text-slate-200"
                  >
                    <img
                      src={winner.userAvatar}
                      alt={winner.userName}
                      className="w-4 h-4 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-white truncate max-w-[70px]">{winner.userName}</span>
                    <span className="text-amber-300 font-extrabold">+{winner.jackpotAmount.toLocaleString()} 🪙</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search games, fruits, crash, dice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#141420] border border-[#232334] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-[#141420] text-slate-400 hover:text-white border border-[#222232]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredGames.map((game) => {
            const isJackpot = game.isJackpotGame;

            return (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePlayGame(game)}
                className={`relative p-3.5 rounded-3xl bg-[#13131E] border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg ${
                  isJackpot
                    ? 'border-amber-500/40 hover:border-amber-400 shadow-amber-500/10'
                    : 'border-[#222232] hover:border-violet-500/50'
                }`}
              >
                {/* Status or Hot Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{game.icon}</span>
                  {game.badgeTag ? (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-[9px] font-black text-white shadow-xs">
                      {game.badgeTag}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#1C1C2A] text-[9px] font-bold text-slate-400">
                      {game.category.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Game Title & Stats */}
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-white font-display flex items-center justify-between">
                    <span className="truncate">{game.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {game.description}
                  </p>
                </div>

                {/* Bottom Stats & Play Action */}
                <div className="mt-3 pt-2.5 border-t border-[#1F1F2E] flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-slate-400">Min: </span>
                    <span className="text-amber-300 font-bold">{game.minBet} 🪙</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span>{game.rtpPercent}% RTP</span>
                  </div>
                </div>

                {/* Play CTA Bar */}
                <div className="mt-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePlayGame(game);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all ${
                      game.status === 'active'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:brightness-110'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{game.status === 'active' ? 'PLAY' : 'MAINTENANCE'}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* User Gaming Summary Card */}
        <div className="p-4 rounded-3xl bg-[#141420] border border-[#222232] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h4 className="text-xs font-extrabold text-white">My Gaming Performance</h4>
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-[11px] font-bold text-violet-400 hover:underline"
            >
              View All Bets
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-[#0E0E16] border border-[#1E1E2C]">
              <span className="text-[10px] text-slate-400 block">Total Bets</span>
              <span className="text-xs font-black text-white">{totalUserBets}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#0E0E16] border border-[#1E1E2C]">
              <span className="text-[10px] text-slate-400 block">Wins</span>
              <span className="text-xs font-black text-emerald-400">{totalUserWins}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#0E0E16] border border-[#1E1E2C]">
              <span className="text-[10px] text-slate-400 block">Win Rate</span>
              <span className="text-xs font-black text-amber-400">{winRate}%</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#0E0E16] border border-[#1E1E2C]">
              <span className="text-[10px] text-slate-400 block">Total Payout</span>
              <span className="text-xs font-black text-amber-300">+{totalWonCoins.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Fair Play & RNG Compliance Notice */}
        <div className="p-3.5 rounded-2xl bg-[#101018] border border-[#1C1C28] flex items-center gap-3 text-slate-400 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-[10px] leading-relaxed">
            All gaming outcomes are verified through encrypted client-server RNG algorithms with guaranteed RTP rates. Play responsibly.
          </p>
        </div>
      </div>

      {/* Interactive Game Player Modal */}
      {activePlayGame && (
        <MiniGamePlayerModal
          isOpen={!!activePlayGame}
          onClose={() => setActivePlayGame(null)}
          game={activePlayGame}
          onOpenCoinStore={onOpenCoinStore}
        />
      )}

      {/* Full Bet Ledger Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-[380px] max-h-[85vh] bg-[#12121C] border border-[#232334] rounded-3xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#232334]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-extrabold text-white">Bet Ledger & History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-[#1A1A28] rounded-full"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto flex-1 no-scrollbar py-3 space-y-2">
              {gameHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No wager logs found.</p>
              ) : (
                gameHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-2xl bg-[#181826] border border-[#242436] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">{h.gameName}</span>
                        {h.isJackpot && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            JACKPOT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{h.resultOutcome}</span>
                      <span className="text-[9px] text-slate-500 block">{h.timestamp}</span>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-black ${
                          h.isWin ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {h.isWin ? `+${h.payoutAmount.toLocaleString()} 🪙` : `-${h.betAmount.toLocaleString()} 🪙`}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold">{h.multiplier}x Multiplier</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
