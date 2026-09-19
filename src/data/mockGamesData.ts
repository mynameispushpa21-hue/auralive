import { GameItem, GameBetHistoryItem, GameJackpotWinner } from '../types';

export const initialGames: GameItem[] = [
  {
    id: 'lucky_wheel',
    name: 'Lucky Fortune Wheel',
    category: 'wheel',
    description: 'Spin the golden wheel for instant coin multipliers and grand jackpot bonuses!',
    icon: '🎡',
    bannerUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    themeColor: '#8B5CF6',
    badgeTag: 'HOT',
    minBet: 50,
    maxBet: 50000,
    rtpPercent: 96,
    houseEdgePercent: 4,
    jackpotPool: 450000,
    jackpotContributionPercent: 2,
    status: 'active',
    totalBetsCount: 14820,
    totalWageredCoins: 3820000,
    totalPayoutCoins: 3667200,
    totalPlayers: 2840,
    rules: [
      'Select your bet amount and tap SPIN to turn the wheel.',
      'The wheel features 8 segments with multipliers ranging from 0.5x to 50x plus GRAND JACKPOT.',
      'If you land on JACKPOT, you win 100% of the game jackpot pool + 100x your bet!',
      'Free Spin gives you an immediate extra spin at your current bet value with 2x boosted multipliers.'
    ],
    multipliers: [
      { id: 'm1', label: '2x Double', multiplier: 2, probabilityWeight: 30, color: '#3B82F6', icon: '✨' },
      { id: 'm2', label: '5x Big Win', multiplier: 5, probabilityWeight: 18, color: '#EC4899', icon: '⭐' },
      { id: 'm3', label: '0.5x Consolation', multiplier: 0.5, probabilityWeight: 22, color: '#64748B', icon: '🪙' },
      { id: 'm4', label: '10x Mega', multiplier: 10, probabilityWeight: 10, color: '#F59E0B', icon: '🔥' },
      { id: 'm5', label: '20x Super', multiplier: 20, probabilityWeight: 6, color: '#10B981', icon: '💎' },
      { id: 'm6', label: '50x Epic', multiplier: 50, probabilityWeight: 3, color: '#6366F1', icon: '👑' },
      { id: 'm7', label: 'Free Spin (3x)', multiplier: 3, probabilityWeight: 9, color: '#06B6D4', icon: '🔄' },
      { id: 'm8', label: '🏆 GRAND JACKPOT', multiplier: 100, probabilityWeight: 2, color: '#EAB308', icon: '🏆', isJackpot: true }
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-09-04T08:30:00Z'
  },
  {
    id: 'greedy_fruits',
    name: 'Greedy Fruit Slot',
    category: 'slots',
    description: 'The iconic Asian voice room fruit betting arena with 8 fruit multipliers and jackpot light trail.',
    icon: '🍒',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    themeColor: '#EC4899',
    badgeTag: 'HOT',
    minBet: 50,
    maxBet: 100000,
    rtpPercent: 95.5,
    houseEdgePercent: 4.5,
    jackpotPool: 780000,
    jackpotContributionPercent: 2.5,
    status: 'active',
    totalBetsCount: 22450,
    totalWageredCoins: 7420000,
    totalPayoutCoins: 7086100,
    totalPlayers: 4120,
    rules: [
      'Bet on any combination of 8 classic fruit and casino symbols.',
      'Tap ROLL to start the neon cursor racing around the fruit matrix.',
      'If the cursor lands on your chosen symbol, you win your bet multiplied by that symbol payout (2x up to 100x BAR).',
      'Landing on Diamond activates the Full Orchard Jackpot bonus with triple payouts!'
    ],
    multipliers: [
      { id: 'f1', label: 'Apple (2x)', multiplier: 2, probabilityWeight: 32, color: '#EF4444', icon: '🍎' },
      { id: 'f2', label: 'Orange (5x)', multiplier: 5, probabilityWeight: 20, color: '#F97316', icon: '🍊' },
      { id: 'f3', label: 'Watermelon (10x)', multiplier: 10, probabilityWeight: 14, color: '#10B981', icon: '🍉' },
      { id: 'f4', label: 'Bell (15x)', multiplier: 15, probabilityWeight: 10, color: '#EAB308', icon: '🔔' },
      { id: 'f5', label: 'Star (20x)', multiplier: 20, probabilityWeight: 8, color: '#8B5CF6', icon: '⭐' },
      { id: 'f6', label: 'Lucky 777 (40x)', multiplier: 40, probabilityWeight: 6, color: '#EC4899', icon: '7️⃣' },
      { id: 'f7', label: 'Golden BAR (75x)', multiplier: 75, probabilityWeight: 4, color: '#F59E0B', icon: '🍫' },
      { id: 'f8', label: 'Diamond Jackpot (100x)', multiplier: 100, probabilityWeight: 2, color: '#06B6D4', icon: '💎', isJackpot: true }
    ],
    createdAt: '2026-01-12T12:00:00Z',
    updatedAt: '2026-09-04T09:15:00Z'
  },
  {
    id: 'rocket_crash',
    name: 'Lucky Rocket Crash',
    category: 'crash',
    description: 'Watch the rocket soar and multiplier climb! Cash out your profit before the sudden crash!',
    icon: '🚀',
    bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    themeColor: '#F59E0B',
    badgeTag: 'POPULAR',
    minBet: 100,
    maxBet: 25000,
    rtpPercent: 97,
    houseEdgePercent: 3,
    jackpotPool: 320000,
    jackpotContributionPercent: 1.5,
    status: 'active',
    totalBetsCount: 19800,
    totalWageredCoins: 5120000,
    totalPayoutCoins: 4966400,
    totalPlayers: 3600,
    rules: [
      'Enter your bet and launch the rocket into orbit.',
      'The multiplier starts at 1.00x and ascends exponentially in real-time.',
      'Tap CASH OUT at any time to claim your multiplied winnings.',
      'If the rocket crashes before you tap cash out, your bet is lost. Multiplier can reach over 100x!'
    ],
    multipliers: [
      { id: 'r1', label: 'Low Orbit (1.2x - 2x)', multiplier: 1.5, probabilityWeight: 45, color: '#10B981' },
      { id: 'r2', label: 'Stratosphere (2x - 5x)', multiplier: 3.5, probabilityWeight: 30, color: '#3B82F6' },
      { id: 'r3', label: 'Mesosphere (5x - 15x)', multiplier: 8.0, probabilityWeight: 15, color: '#8B5CF6' },
      { id: 'r4', label: 'Deep Space (15x - 50x)', multiplier: 25.0, probabilityWeight: 8, color: '#EC4899' },
      { id: 'r5', label: 'Intergalactic (100x+)', multiplier: 100.0, probabilityWeight: 2, color: '#EAB308', isJackpot: true }
    ],
    createdAt: '2026-02-01T15:00:00Z',
    updatedAt: '2026-09-04T07:45:00Z'
  },
  {
    id: 'dice_royale',
    name: 'Dice Royale High-Low',
    category: 'dice',
    description: 'Roll three lucky golden dice. Bet on Big, Small, Triples, or Exact Sum totals.',
    icon: '🎲',
    bannerUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&auto=format&fit=crop&q=80',
    themeColor: '#10B981',
    badgeTag: 'NEW',
    minBet: 50,
    maxBet: 50000,
    rtpPercent: 96.5,
    houseEdgePercent: 3.5,
    jackpotPool: 290000,
    jackpotContributionPercent: 2,
    status: 'active',
    totalBetsCount: 11200,
    totalWageredCoins: 2890000,
    totalPayoutCoins: 2788850,
    totalPlayers: 2100,
    rules: [
      'Choose your prediction: Small (Sum 4-10, 2x), Big (Sum 11-17, 2x), Odd/Even (2x), or Exact Triple (30x).',
      'Tap ROLL DICE to shake and reveal the 3 golden dice results.',
      'Three of a kind (e.g. 6-6-6) on Triple pays 30x your bet + bonus jackpot diamonds!'
    ],
    multipliers: [
      { id: 'd1', label: 'Small (4-10)', multiplier: 2, probabilityWeight: 42, color: '#3B82F6', icon: '🔹' },
      { id: 'd2', label: 'Big (11-17)', multiplier: 2, probabilityWeight: 42, color: '#EF4444', icon: '🔺' },
      { id: 'd3', label: 'Double Match', multiplier: 5, probabilityWeight: 10, color: '#F59E0B', icon: '🎲' },
      { id: 'd4', label: 'Lucky Triple 777', multiplier: 30, probabilityWeight: 4, color: '#8B5CF6', icon: '👑' },
      { id: 'd5', label: 'All 6s Grand Slam', multiplier: 60, probabilityWeight: 2, color: '#EAB308', icon: '🏆', isJackpot: true }
    ],
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-09-04T06:20:00Z'
  },
  {
    id: 'dragon_tiger',
    name: 'Dragon vs Tiger Duel',
    category: 'cards',
    description: 'High-energy fast card showdown. Bet on Dragon, Tiger, or Tie with live animated flips.',
    icon: '🐉',
    bannerUrl: 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=800&auto=format&fit=crop&q=80',
    themeColor: '#EF4444',
    badgeTag: 'FEATURED',
    minBet: 100,
    maxBet: 50000,
    rtpPercent: 96.2,
    houseEdgePercent: 3.8,
    jackpotPool: 360000,
    jackpotContributionPercent: 2,
    status: 'active',
    totalBetsCount: 9400,
    totalWageredCoins: 3100000,
    totalPayoutCoins: 2982200,
    totalPlayers: 1850,
    rules: [
      'Bet on Dragon, Tiger, or Tie.',
      'One card is dealt to Dragon and one to Tiger. Highest card value wins (King is high, Ace is low).',
      'Dragon or Tiger win pays 2x. Tie pays 8x. Suited Tie pays 50x!'
    ],
    multipliers: [
      { id: 'dt1', label: 'Dragon (2x)', multiplier: 2, probabilityWeight: 46, color: '#EF4444', icon: '🐉' },
      { id: 'dt2', label: 'Tiger (2x)', multiplier: 2, probabilityWeight: 46, color: '#F59E0B', icon: '🐅' },
      { id: 'dt3', label: 'Tie (8x)', multiplier: 8, probabilityWeight: 6, color: '#10B981', icon: '⚔️' },
      { id: 'dt4', label: 'Suited Royal Tie (50x)', multiplier: 50, probabilityWeight: 2, color: '#8B5CF6', icon: '👑', isJackpot: true }
    ],
    createdAt: '2026-03-01T14:00:00Z',
    updatedAt: '2026-09-04T05:10:00Z'
  },
  {
    id: 'golden_slots_777',
    name: '777 Golden Triple Slots',
    category: 'casino',
    description: 'Classic Vegas 3-reel spinning slots with cherries, bars, diamonds, and 777 jackpot fever.',
    icon: '🎰',
    bannerUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&auto=format&fit=crop&q=80',
    themeColor: '#EAB308',
    badgeTag: 'JACKPOT',
    minBet: 50,
    maxBet: 100000,
    rtpPercent: 95.8,
    houseEdgePercent: 4.2,
    jackpotPool: 890000,
    jackpotContributionPercent: 3,
    status: 'active',
    totalBetsCount: 16500,
    totalWageredCoins: 6300000,
    totalPayoutCoins: 6035400,
    totalPlayers: 3400,
    rules: [
      'Spin the 3 vintage slot reels and line up matching symbols across the payline.',
      '3x Cherries: 5x | 3x Bells: 15x | 3x Bars: 30x | 3x Diamonds: 60x | 3x 777: 150x + MEGA JACKPOT!'
    ],
    multipliers: [
      { id: 's1', label: '1 Cherry (1.5x)', multiplier: 1.5, probabilityWeight: 35, color: '#EF4444', icon: '🍒' },
      { id: 's2', label: '3x Cherries (5x)', multiplier: 5, probabilityWeight: 25, color: '#F97316', icon: '🍒' },
      { id: 's3', label: '3x Bells (15x)', multiplier: 15, probabilityWeight: 18, color: '#EAB308', icon: '🔔' },
      { id: 's4', label: '3x BARs (30x)', multiplier: 30, probabilityWeight: 12, color: '#8B5CF6', icon: '🍫' },
      { id: 's5', label: '3x Diamonds (60x)', multiplier: 60, probabilityWeight: 7, color: '#06B6D4', icon: '💎' },
      { id: 's6', label: '3x 777 MEGA JACKPOT (150x)', multiplier: 150, probabilityWeight: 3, color: '#EC4899', icon: '7️⃣', isJackpot: true }
    ],
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-09-04T08:00:00Z'
  }
];

export const initialBetHistory: GameBetHistoryItem[] = [];

export const initialJackpotWinners: GameJackpotWinner[] = [];
