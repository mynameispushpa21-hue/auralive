import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  Plus,
  Search,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Trophy,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Coins,
  Activity,
  Layers,
  Flame,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { GameItem, GameCategory, GameMultiplierSegment } from '../../types';
import { useAppState } from '../../services/stateStore';

export const AdminGamesTable: React.FC = () => {
  const {
    games,
    gameHistory,
    recentJackpotWinners,
    adminAddGame,
    adminUpdateGame,
    adminToggleGameStatus,
    adminDeleteGame,
    adminAdjustJackpot,
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'bets' | 'jackpots'>('catalog');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [adjustingJackpotGame, setAdjustingJackpotGame] = useState<GameItem | null>(null);
  const [newJackpotAmount, setNewJackpotAmount] = useState<number>(100000);

  // New Game Form State
  const [newGameForm, setNewGameForm] = useState<{
    name: string;
    category: GameCategory;
    icon: string;
    description: string;
    rtpPercent: number;
    houseEdgePercent: number;
    minBet: number;
    maxBet: number;
    jackpotPool: number;
    jackpotContributionPercent: number;
    isJackpotGame: boolean;
    isHot: boolean;
    badgeTag: string;
    status: 'active' | 'maintenance' | 'disabled';
    rules: string;
  }>({
    name: '',
    category: 'wheel',
    icon: '🎡',
    description: '',
    rtpPercent: 96,
    houseEdgePercent: 4,
    minBet: 50,
    maxBet: 50000,
    jackpotPool: 250000,
    jackpotContributionPercent: 2.0,
    isJackpotGame: true,
    isHot: true,
    badgeTag: 'NEW',
    status: 'active',
    rules: 'Select bet amount and tap spin to win multipliers.',
  });

  // Calculate High-level Analytics
  const totalWagerVolume = games.reduce((acc, g) => acc + g.totalWageredCoins, 0);
  const totalPayoutVolume = games.reduce((acc, g) => acc + g.totalPayoutCoins, 0);
  const totalGrossGamingRevenue = totalWagerVolume - totalPayoutVolume;
  const realizedMargin = totalWagerVolume > 0 ? ((totalGrossGamingRevenue / totalWagerVolume) * 100).toFixed(1) : '4.5';
  const totalJackpotPools = games.reduce((acc, g) => acc + g.jackpotPool, 0);
  const totalBetsPlaced = games.reduce((acc, g) => acc + g.totalBetsCount, 0);

  // Filtered games
  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    return g.category === selectedCategory;
  });

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameForm.name.trim()) return;

    const defaultMultipliers: GameMultiplierSegment[] = [
      { id: 'm1', label: '2x Double', multiplier: 2, probabilityWeight: 40, color: '#3B82F6' },
      { id: 'm2', label: '5x Mini', multiplier: 5, probabilityWeight: 20, color: '#10B981' },
      { id: 'm3', label: '10x Super', multiplier: 10, probabilityWeight: 10, color: '#F59E0B' },
      { id: 'm4', label: '50x Mega', multiplier: 50, probabilityWeight: 2, color: '#EC4899' },
      { id: 'm5', label: '100x Jackpot', multiplier: 100, probabilityWeight: 0.5, color: '#8B5CF6', isJackpot: true },
      { id: 'm6', label: 'Consolation', multiplier: 0.5, probabilityWeight: 50, color: '#64748B' },
    ];

    adminAddGame({
      name: newGameForm.name,
      category: newGameForm.category,
      icon: newGameForm.icon || '🎮',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      themeColor: '#7C3AED',
      description: newGameForm.description || 'Exciting interactive mini-game with provably fair multipliers.',
      rtpPercent: Number(newGameForm.rtpPercent),
      houseEdgePercent: Number(newGameForm.houseEdgePercent),
      minBet: Number(newGameForm.minBet),
      maxBet: Number(newGameForm.maxBet),
      jackpotPool: Number(newGameForm.jackpotPool),
      jackpotContributionPercent: Number(newGameForm.jackpotContributionPercent),
      isJackpotGame: Boolean(newGameForm.isJackpotGame),
      isHot: Boolean(newGameForm.isHot),
      badgeTag: (newGameForm.badgeTag as any) || undefined,
      status: newGameForm.status,
      rules: newGameForm.rules ? newGameForm.rules.split('\n').filter(Boolean) : ['Fair play certified algorithm.'],
      multipliers: defaultMultipliers,
    });

    setIsAddModalOpen(false);
    setNewGameForm({
      name: '',
      category: 'wheel',
      icon: '🎡',
      description: '',
      rtpPercent: 96,
      houseEdgePercent: 4,
      minBet: 50,
      maxBet: 50000,
      jackpotPool: 250000,
      jackpotContributionPercent: 2.0,
      isJackpotGame: true,
      isHot: true,
      badgeTag: 'NEW',
      status: 'active',
      rules: 'Select bet amount and tap spin to win multipliers.',
    });
  };

  const handleSaveEditGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    adminUpdateGame(editingGame.id, {
      name: editingGame.name,
      category: editingGame.category,
      icon: editingGame.icon,
      description: editingGame.description,
      rtpPercent: Number(editingGame.rtpPercent),
      houseEdgePercent: Number(editingGame.houseEdgePercent),
      minBet: Number(editingGame.minBet),
      maxBet: Number(editingGame.maxBet),
      status: editingGame.status,
      isHot: editingGame.isHot,
      isJackpotGame: editingGame.isJackpotGame,
      badgeTag: editingGame.badgeTag,
    });

    setEditingGame(null);
  };

  const handleApplyJackpotAdjustment = () => {
    if (!adjustingJackpotGame) return;
    adminAdjustJackpot(adjustingJackpotGame.id, newJackpotAmount);
    setAdjustingJackpotGame(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-violet-400" />
            Games & Arcade Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure provably fair mini-games, RTP algorithms, bet limits, and monitor jackpot pools.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-violet-600/30 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Game</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#141420] border border-[#232334] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold">Total Wager Volume</span>
            <div className="text-lg font-black text-white">🪙 {totalWagerVolume.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500">Across {totalBetsPlaced.toLocaleString()} bets</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141420] border border-[#232334] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold">Payouts Awarded</span>
            <div className="text-lg font-black text-emerald-400">🪙 {totalPayoutVolume.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400/80 font-bold">Player Wins Processed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141420] border border-[#232334] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold">Gross Gaming Revenue (GGR)</span>
            <div className="text-lg font-black text-amber-300">🪙 {totalGrossGamingRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-amber-400 font-bold">{realizedMargin}% Net House Edge</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141420] border border-[#232334] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold">Combined Jackpots Pool</span>
            <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
              🪙 {totalJackpotPools.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">{recentJackpotWinners.length} recent winners</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub navigation tabs */}
      <div className="flex items-center gap-2 border-b border-[#232334] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'catalog'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Game Catalog & Configuration ({games.length})
        </button>
        <button
          onClick={() => setActiveTab('bets')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'bets'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Live Bet Audit Stream ({gameHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('jackpots')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'jackpots'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Jackpot Hall of Fame ({recentJackpotWinners.length})
        </button>
      </div>

      {/* TAB 1: GAME CATALOG & MANAGEMENT */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#141420] border border-[#232334] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {['all', 'wheel', 'slots', 'crash', 'dice', 'cards'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-violet-600 text-white'
                      : 'bg-[#141420] border border-[#232334] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Games Table */}
          <div className="rounded-2xl bg-[#141420] border border-[#232334] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#10101A] border-b border-[#232334] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Game</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">RTP / House Edge</th>
                    <th className="py-3 px-3">Wager Limits</th>
                    <th className="py-3 px-3">Jackpot Reservoir</th>
                    <th className="py-3 px-3">Total Bets</th>
                    <th className="py-3 px-3">Total Volume</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C2C]">
                  {filteredGames.map((game) => {
                    const ggr = game.totalWageredCoins - game.totalPayoutCoins;

                    return (
                      <tr key={game.id} className="hover:bg-[#181828] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{game.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-extrabold">{game.name}</span>
                                {game.badgeTag && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-bold text-amber-300">
                                    {game.badgeTag}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">
                                {game.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#1C1C2A] text-[10px] font-bold text-slate-300">
                            {game.category.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <select
                            value={game.status}
                            onChange={(e) =>
                              adminToggleGameStatus(game.id, e.target.value as 'active' | 'maintenance' | 'disabled')
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border bg-[#10101A] cursor-pointer focus:outline-none ${
                              game.status === 'active'
                                ? 'border-emerald-500/40 text-emerald-400'
                                : game.status === 'maintenance'
                                ? 'border-amber-500/40 text-amber-400'
                                : 'border-rose-500/40 text-rose-400'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <span className="text-emerald-400 font-black">{game.rtpPercent}% RTP</span>
                            <span className="text-[10px] text-slate-500 block">({game.houseEdgePercent}% Edge)</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-[11px] font-semibold text-slate-300">
                            <span>🪙 {game.minBet.toLocaleString()}</span>
                            <span className="text-slate-500"> - </span>
                            <span>🪙 {game.maxBet.toLocaleString()}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-amber-300">
                              🪙 {game.jackpotPool.toLocaleString()}
                            </span>
                            <button
                              onClick={() => {
                                setAdjustingJackpotGame(game);
                                setNewJackpotAmount(game.jackpotPool);
                              }}
                              className="p-1 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                              title="Seed / Adjust Jackpot"
                            >
                              <Sparkles className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-slate-300">
                          {game.totalBetsCount.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white">🪙 {game.totalWageredCoins.toLocaleString()}</span>
                            <span className="text-[10px] text-emerald-400 font-bold block">
                              GGR: +{ggr.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingGame(game)}
                              className="p-1.5 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20 transition-all"
                              title="Edit Game Config"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete game "${game.name}"?`)) {
                                  adminDeleteGame(game.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600/20 transition-all"
                              title="Delete Game"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE BET AUDIT STREAM */}
      {activeTab === 'bets' && (
        <div className="rounded-2xl bg-[#141420] border border-[#232334] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#232334] flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Real-time Wager & Outcome Ledger
            </h3>
            <span className="text-xs text-slate-400 font-bold">{gameHistory.length} total entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#10101A] border-b border-[#232334] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Game</th>
                  <th className="py-3 px-3">Bet Amount</th>
                  <th className="py-3 px-3">Multiplier</th>
                  <th className="py-3 px-3">Payout</th>
                  <th className="py-3 px-3">Outcome Summary</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C2C]">
                {gameHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#181828] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.userAvatar}
                          alt={item.userName}
                          className="w-5 h-5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span>{item.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{item.gameName}</td>
                    <td className="py-3 px-3 font-bold text-amber-300">🪙 {item.betAmount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded-md bg-[#1F1F30] font-black text-violet-300">
                        {item.multiplier}x
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {item.isWin ? (
                        <span className="text-emerald-400">+{item.payoutAmount.toLocaleString()} 🪙</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.resultOutcome}</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-semibold">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JACKPOT HALL OF FAME */}
      {activeTab === 'jackpots' && (
        <div className="rounded-2xl bg-[#141420] border border-[#232334] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Grand Jackpot Awardees
            </h3>
            <span className="text-xs text-amber-400 font-bold">Live payout history</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentJackpotWinners.map((winner) => (
              <div
                key={winner.id}
                className="p-3.5 rounded-2xl bg-[#181826] border border-amber-500/30 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={winner.userAvatar}
                    alt={winner.userName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-extrabold text-white text-xs">{winner.userName}</h4>
                    <span className="text-[10px] text-slate-400">{winner.gameName}</span>
                    <span className="text-[9px] text-slate-500 block">{winner.timestamp}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-amber-300 block">
                    +{winner.jackpotAmount.toLocaleString()} 🪙
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                    JACKPOT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW GAME */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#12121C] border border-[#232334] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#232334]">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-400" />
                Add New Mini-Game
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Game Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Flush Frenzy"
                    value={newGameForm.name}
                    onChange={(e) => setNewGameForm({ ...newGameForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <select
                    value={newGameForm.category}
                    onChange={(e) => setNewGameForm({ ...newGameForm, category: e.target.value as GameCategory })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="wheel">Wheel / Spin</option>
                    <option value="slots">Slots / Reels</option>
                    <option value="crash">Crash / Rocket</option>
                    <option value="dice">Dice Royale</option>
                    <option value="cards">Cards / Dragon Tiger</option>
                    <option value="lottery">Lottery</option>
                    <option value="arcade">Arcade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Icon / Emoji</label>
                  <input
                    type="text"
                    value={newGameForm.icon}
                    onChange={(e) => setNewGameForm({ ...newGameForm, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">RTP %</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={newGameForm.rtpPercent}
                    onChange={(e) =>
                      setNewGameForm({
                        ...newGameForm,
                        rtpPercent: Number(e.target.value),
                        houseEdgePercent: 100 - Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">House Edge %</label>
                  <input
                    type="number"
                    disabled
                    value={newGameForm.houseEdgePercent}
                    className="w-full px-3 py-2 bg-[#101018] border border-[#202030] rounded-xl text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Min Bet (Coins)</label>
                  <input
                    type="number"
                    value={newGameForm.minBet}
                    onChange={(e) => setNewGameForm({ ...newGameForm, minBet: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Max Bet (Coins)</label>
                  <input
                    type="number"
                    value={newGameForm.maxBet}
                    onChange={(e) => setNewGameForm({ ...newGameForm, maxBet: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Initial Jackpot Pool</label>
                  <input
                    type="number"
                    value={newGameForm.jackpotPool}
                    onChange={(e) => setNewGameForm({ ...newGameForm, jackpotPool: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Status</label>
                  <select
                    value={newGameForm.status}
                    onChange={(e) =>
                      setNewGameForm({ ...newGameForm, status: e.target.value as 'active' | 'maintenance' | 'disabled' })
                    }
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short engaging description for user catalog..."
                  value={newGameForm.description}
                  onChange={(e) => setNewGameForm({ ...newGameForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232334]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181826] text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-extrabold shadow-md hover:brightness-110"
                >
                  Create Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GAME */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#12121C] border border-[#232334] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232334]">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-violet-400" />
                Edit Game: {editingGame.name}
              </h3>
              <button onClick={() => setEditingGame(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditGame} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Game Name</label>
                <input
                  type="text"
                  value={editingGame.name}
                  onChange={(e) => setEditingGame({ ...editingGame, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">RTP %</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={editingGame.rtpPercent}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        rtpPercent: Number(e.target.value),
                        houseEdgePercent: 100 - Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Status</label>
                  <select
                    value={editingGame.status}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        status: e.target.value as 'active' | 'maintenance' | 'disabled',
                      })
                    }
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Min Bet</label>
                  <input
                    type="number"
                    value={editingGame.minBet}
                    onChange={(e) => setEditingGame({ ...editingGame, minBet: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Max Bet</label>
                  <input
                    type="number"
                    value={editingGame.maxBet}
                    onChange={(e) => setEditingGame({ ...editingGame, maxBet: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232334]">
                <button
                  type="button"
                  onClick={() => setEditingGame(null)}
                  className="px-4 py-2 rounded-xl bg-[#181826] text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 text-white font-extrabold hover:bg-violet-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEED / ADJUST JACKPOT */}
      {adjustingJackpotGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#12121C] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232334]">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Seed Jackpot: {adjustingJackpotGame.name}
              </h3>
              <button onClick={() => setAdjustingJackpotGame(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#181826] border border-amber-500/20 text-center">
                <span className="text-[10px] text-slate-400">Current Jackpot Pool:</span>
                <span className="text-base font-black text-amber-300 block mt-0.5">
                  🪙 {adjustingJackpotGame.jackpotPool.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">New Jackpot Amount (Coins)</label>
                <input
                  type="number"
                  value={newJackpotAmount}
                  onChange={(e) => setNewJackpotAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#181826] border border-[#262638] rounded-xl text-white font-black focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[100000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewJackpotAmount(preset)}
                    className="py-1 rounded-lg bg-[#181826] border border-[#232334] text-[10px] font-bold text-amber-300 hover:bg-[#202030]"
                  >
                    {preset / 1000}k
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232334]">
                <button
                  type="button"
                  onClick={() => setAdjustingJackpotGame(null)}
                  className="px-4 py-2 rounded-xl bg-[#181826] text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyJackpotAdjustment}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md hover:brightness-110"
                >
                  Apply Reservoir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
