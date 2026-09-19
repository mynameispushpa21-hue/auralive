import {
  UserProfile,
  VoiceRoom,
  VirtualGift,
  CoinPackage,
  VIPTier,
  DailyMission,
  PlatformEvent,
  LeaderboardEntry,
  Conversation,
  NotificationItem,
  HostApplication,
  AgencyApplication,
  WithdrawalRequest,
  AbuseReport,
  FraudLogEvent,
  PlatformConfig,
  AdminAuditLog,
  WalletTransaction,
  SellerProfile,
  SellerTransaction,
  BuyerCoinRequest
} from '../types';

export const INITIAL_CURRENT_USER: UserProfile = {
  id: 'usr_guest',
  numericId: '000000',
  username: 'guest',
  displayName: 'Guest User',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  bio: 'Welcome to AuraVoice! Sign up or sign in to get started.',
  email: '',
  phone: '',
  country: 'Global',
  countryFlag: '🌐',
  language: 'English',
  gender: 'other',
  role: 'user',
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  coins: 0,
  diamonds: 0,
  followersCount: 0,
  followingCount: 0,
  visitorsCount: 0,
  isHost: false,
  isSeller: false,
  isBanned: false,
  isMuted: false,
  isGuest: true,
  fraudScore: 0,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  vipTier: 'vip_0',
};

export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_VIP_TIERS: VIPTier[] = [
  {
    id: 'vip_1',
    level: 1,
    name: 'Bronze VIP',
    monthlyCoinPrice: 500,
    badgeUrl: '🥉',
    frameColor: '#cd7f32',
    chatColor: '#f59e0b',
    entryAnimation: 'Subtle Golden Ring',
    giftDiscountPercent: 2,
    perks: ['Bronze Profile Frame', 'VIP 1 Chat Badge', '2% Gift Coin Bonus', 'Join Room Sound FX'],
    maxDailyGiftLimitBonus: 5000,
  },
  {
    id: 'vip_2',
    level: 2,
    name: 'Silver VIP',
    monthlyCoinPrice: 1500,
    badgeUrl: '🥈',
    frameColor: '#94a3b8',
    chatColor: '#38bdf8',
    entryAnimation: 'Silver Sparkle Particle',
    giftDiscountPercent: 5,
    perks: ['Silver Animated Avatar Frame', 'VIP 2 Badge', '5% Gift Discount', 'Custom Room Entrance Announcement', 'Kick Immunity against normal guests'],
    maxDailyGiftLimitBonus: 15000,
  },
  {
    id: 'vip_3',
    level: 3,
    name: 'Gold VIP',
    monthlyCoinPrice: 4500,
    badgeUrl: '🥇',
    frameColor: '#fbbf24',
    chatColor: '#facc15',
    entryAnimation: 'Golden Phoenix Entry',
    giftDiscountPercent: 8,
    perks: ['Gold Neon Avatar Halo', 'VIP 3 Crown Badge', '8% Gift Coin Discount', 'Priority Mic Seat Access', 'Exclusive Gold Gifting FX'],
    maxDailyGiftLimitBonus: 50000,
  },
  {
    id: 'vip_4',
    level: 4,
    name: 'Platinum VIP',
    monthlyCoinPrice: 12000,
    badgeUrl: '💎',
    frameColor: '#38bdf8',
    chatColor: '#c084fc',
    entryAnimation: 'Diamond Supercar Drive-in',
    giftDiscountPercent: 12,
    perks: ['Platinum Hologram Frame', 'VIP 4 Diamond Badge', '12% Gift Discount', 'Room Seat Lock Bypass', 'Custom Font Color in Chats', 'Personal Dedicated Concierge'],
    maxDailyGiftLimitBonus: 150000,
  },
  {
    id: 'vip_5',
    level: 5,
    name: 'Diamond King VIP',
    monthlyCoinPrice: 30000,
    badgeUrl: '👑',
    frameColor: '#ec4899',
    chatColor: '#f43f5e',
    entryAnimation: 'Imperial Dragon Thunder Burst',
    giftDiscountPercent: 18,
    perks: ['Mythic Dragon Frame with Particles', 'VIP 5 Imperial Crown', '18% Gift Discount', 'Global Banner Announcement on Room Join', 'Exclusive VIP-only gifts unlock', 'Full Room Moderation Privileges'],
    maxDailyGiftLimitBonus: 500000,
  }
];

export const INITIAL_GIFTS: VirtualGift[] = [
  {
    id: 'gift_09',
    name: 'Space Rocket',
    coinPrice: 15000,
    category: 'Effects',
    icon: '🚀',
    animationType: 'rocket',
    animationDurationMs: 5500,
    soundEffect: 'explosion',
    sortOrder: 1,
    status: 'active',
  },
  {
    id: 'gift_10',
    name: 'Imperial Dragon',
    coinPrice: 38888,
    category: 'VIP',
    icon: '🐉',
    animationType: 'dragon',
    animationDurationMs: 6500,
    soundEffect: 'explosion',
    isVipOnly: true,
    minVipLevel: 3,
    sortOrder: 2,
    status: 'active',
  },
  {
    id: 'gift_11',
    name: 'Cosmic Galaxy',
    coinPrice: 50000,
    category: 'VIP',
    icon: '🌌',
    animationType: 'galaxy',
    animationDurationMs: 7000,
    soundEffect: 'fanfare',
    isVipOnly: true,
    minVipLevel: 4,
    sortOrder: 3,
    status: 'active',
  },
  {
    id: 'gift_lucky_1',
    name: 'Lucky Coin',
    coinPrice: 50,
    category: 'Lucky',
    icon: '🪙',
    animationType: 'confetti',
    animationDurationMs: 2000,
    soundEffect: 'chime',
    sortOrder: 4,
    status: 'active',
  },
  {
    id: 'gift_lucky_2',
    name: 'Fortune Chest',
    coinPrice: 500,
    category: 'Lucky',
    icon: '🧰',
    animationType: 'diamond_rain',
    animationDurationMs: 3000,
    soundEffect: 'magic',
    sortOrder: 5,
    status: 'active',
  },
  {
    id: 'gift_lucky_3',
    name: 'Golden Dragon',
    coinPrice: 5000,
    category: 'Lucky',
    icon: '🐉',
    animationType: 'dragon',
    animationDurationMs: 5000,
    soundEffect: 'fanfare',
    sortOrder: 6,
    status: 'active',
  },
  {
    id: 'gift_lucky_4',
    name: 'Lucky Clover',
    coinPrice: 100,
    category: 'Lucky',
    icon: '🍀',
    animationType: 'confetti',
    animationDurationMs: 2200,
    soundEffect: 'magic',
    sortOrder: 6.1,
    status: 'active',
  },
  {
    id: 'gift_lucky_5',
    name: 'Fortune Wheel',
    coinPrice: 1000,
    category: 'Lucky',
    icon: '🎡',
    animationType: 'crown',
    animationDurationMs: 3800,
    soundEffect: 'fanfare',
    sortOrder: 6.2,
    status: 'active',
  },
  {
    id: 'gift_lucky_6',
    name: 'Pot of Gold',
    coinPrice: 10000,
    category: 'Lucky',
    icon: '🏺',
    animationType: 'diamond_rain',
    animationDurationMs: 5000,
    soundEffect: 'fanfare',
    sortOrder: 6.3,
    status: 'active',
  },
  {
    id: 'gift_01',
    name: 'Rose Bouquet',
    coinPrice: 10,
    category: 'Popular',
    icon: '🌹',
    animationType: 'rose_shower',
    animationDurationMs: 2000,
    soundEffect: 'chime',
    sortOrder: 7,
    status: 'active',
  },
  {
    id: 'gift_02',
    name: 'Ice Coffee',
    coinPrice: 25,
    category: 'Popular',
    icon: '🧋',
    animationType: 'confetti',
    animationDurationMs: 1800,
    soundEffect: 'chime',
    sortOrder: 8,
    status: 'active',
  },
  {
    id: 'gift_03',
    name: 'Sparkle Heart',
    coinPrice: 99,
    category: 'Romance',
    icon: '💖',
    animationType: 'confetti',
    animationDurationMs: 2500,
    soundEffect: 'magic',
    sortOrder: 9,
    status: 'active',
  },
  {
    id: 'gift_08',
    name: 'Sports Supercar',
    coinPrice: 8888,
    category: 'Luxury',
    icon: '🏎️',
    animationType: 'sports_car',
    animationDurationMs: 5000,
    soundEffect: 'engine',
    sortOrder: 14,
    status: 'active',
  }
];

export const INITIAL_COIN_PACKAGES: CoinPackage[] = [
  { id: 'pkg_1', coins: 100, bonusCoins: 0, priceUsd: 0.99 },
  { id: 'pkg_2', coins: 500, bonusCoins: 50, priceUsd: 4.99, isPopular: true, badge: '+10% Bonus' },
  { id: 'pkg_3', coins: 1000, bonusCoins: 150, priceUsd: 9.99, badge: '+15% Bonus' },
  { id: 'pkg_4', coins: 5000, bonusCoins: 1000, priceUsd: 49.99, isBestValue: true, badge: 'HOT +20%' },
  { id: 'pkg_5', coins: 10000, bonusCoins: 2500, priceUsd: 99.99, badge: '+25% Extra' },
  { id: 'pkg_6', coins: 50000, bonusCoins: 15000, priceUsd: 499.99, badge: '👑 VIP WHALE +30%' },
];

export const INITIAL_ROOMS: VoiceRoom[] = [];

export const INITIAL_MISSIONS: DailyMission[] = [
  {
    id: 'msn_01',
    title: 'Daily Check-in',
    description: 'Log in today to claim your daily activity bonus',
    category: 'daily',
    targetCount: 1,
    currentCount: 1,
    rewardType: 'coins',
    rewardAmount: 30,
    isClaimed: false,
    iconName: 'Calendar',
  },
  {
    id: 'msn_02',
    title: 'Party Explorer',
    description: 'Join and listen in at least 3 voice party rooms',
    category: 'daily',
    targetCount: 3,
    currentCount: 2,
    rewardType: 'xp',
    rewardAmount: 150,
    isClaimed: false,
    iconName: 'Radio',
  },
  {
    id: 'msn_03',
    title: 'Generous Heart',
    description: 'Send 5 virtual gifts to any voice room hosts',
    category: 'daily',
    targetCount: 5,
    currentCount: 3,
    rewardType: 'coins',
    rewardAmount: 100,
    isClaimed: false,
    iconName: 'Gift',
  },
  {
    id: 'msn_04',
    title: 'Community Builder',
    description: 'Follow 3 new talented audio creators',
    category: 'daily',
    targetCount: 3,
    currentCount: 3,
    rewardType: 'diamonds',
    rewardAmount: 50,
    isClaimed: true,
    iconName: 'UserPlus',
  },
  {
    id: 'msn_05',
    title: 'Host Spotlight',
    description: 'Host your own voice party room for at least 30 minutes',
    category: 'weekly',
    targetCount: 30,
    currentCount: 45,
    rewardType: 'vip_points',
    rewardAmount: 500,
    isClaimed: false,
    iconName: 'Mic',
  },
  {
    id: 'msn_06',
    title: 'Super Gifter Milestone',
    description: 'Send a total of 1,000 coins in gifts across the platform',
    category: 'weekly',
    targetCount: 1000,
    currentCount: 850,
    rewardType: 'coins',
    rewardAmount: 250,
    isClaimed: false,
    iconName: 'Sparkles',
  }
];

export const INITIAL_EVENTS: PlatformEvent[] = [
  {
    id: 'evt_01',
    title: '🌟 Global Voice Star Championship 2026',
    description: 'Compete for the #1 Audio Crown! Top 3 hosts split the $10,000 USD prize pool + custom 3D avatar halo.',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    category: 'voice_star',
    startDate: '2026-08-20T00:00:00Z',
    endDate: '2026-08-30T23:59:59Z',
    prizePoolUsd: 10000,
    status: 'active',
    rules: [
      'Every 1 Diamond earned equals 1 Event Championship Point',
      'Host battle matches give a 2.5x point multiplier during golden hours (20:00 - 23:00 UTC)',
      'Top 10 ranked creators win exclusive VIP 5 badges and verified golden badges.'
    ],
    topParticipants: []
  },
  {
    id: 'evt_02',
    title: '🏎️ Neon Supercar Gifting Rush',
    description: 'Send luxury sports car gifts during the weekend to trigger 3D server-wide animations and bonus coin cashback!',
    bannerUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    category: 'gift_rush',
    startDate: '2026-08-22T00:00:00Z',
    endDate: '2026-08-24T23:59:59Z',
    prizePoolUsd: 3500,
    status: 'active',
    rules: [
      'Sending the Sports Supercar gift awards 100 Gifting Rush trophies',
      'Receiving hosts get 10% extra bonus diamonds directly into wallet'
    ],
    topParticipants: []
  }
];

export const INITIAL_LEADERBOARDS: {
  hosts: LeaderboardEntry[];
  wealth: LeaderboardEntry[];
} = {
  hosts: [],
  wealth: []
};

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_HOST_APPLICATIONS: HostApplication[] = [];

export const INITIAL_AGENCY_APPLICATIONS: AgencyApplication[] = [];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [];

export const INITIAL_ABUSE_REPORTS: AbuseReport[] = [];

export const INITIAL_FRAUD_EVENTS: FraudLogEvent[] = [];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

export const INITIAL_PLATFORM_CONFIG: PlatformConfig = {
  appName: 'AuraVoice Live',
  supportEmail: 'support@auravoice.live',
  coinToDiamondRate: 1.0, // 100 Coins spent = 100 Diamonds created (1:1 direct ratio)
  hostCommissionPercent: 100, // Host receives 100% of diamonds (1 Coin = 1 Diamond received)
  defaultHostCommissionRate: 1.0,
  diamondCashValueUsd: 0.01, // 100 Diamonds = $1.00 USD cash payout
  minimumWithdrawalDiamonds: 2000, // Min 2,000 diamonds ($20 USD)
  dailyWithdrawalLimitDiamonds: 100000, // Max $1,000 USD / day
  vipSystemEnabled: true,
  voiceRoomsEnabled: true,
  videoRoomsEnabled: true,
  registrationEnabled: true,
  guestLoginEnabled: true,
  maintenanceMode: false,
  rtcProvider: 'livekit',
};

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [];

export const INITIAL_SELLER_TRANSACTIONS: SellerTransaction[] = [];

export const INITIAL_BUYER_REQUESTS: BuyerCoinRequest[] = [];
