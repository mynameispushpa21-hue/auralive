export type UserRole = 'user' | 'host' | 'moderator' | 'admin' | 'super_admin' | 'seller' | 'agent';

export type VIPLevelId = 'vip_0' | 'vip_1' | 'vip_2' | 'vip_3' | 'vip_4' | 'vip_5';

export interface VIPTier {
  id: VIPLevelId;
  level: number;
  name: string;
  monthlyCoinPrice: number;
  badgeUrl: string;
  frameColor: string;
  chatColor: string;
  entryAnimation: string;
  giftDiscountPercent: number;
  perks: string[];
  maxDailyGiftLimitBonus: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  email: string;
  phone?: string;
  password?: string;
  country: string;
  countryFlag: string;
  language: string;
  gender: 'male' | 'female' | 'other';
  role: UserRole;
  level: number;
  xp: number;
  xpToNextLevel: number;
  experiencePoints?: number;
  numericId?: string;
  likesReceived?: number;
  muteRemainingHours?: number;
  isOnline?: boolean;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  vipTier: VIPLevelId;
  cpPartnerId?: string;
  cpLevel?: number;
  cpDays?: number;
  cpRingId?: string;
  vipExpiresAt?: string;
  coins: number;
  diamonds: number;
  followersCount: number;
  followingCount: number;
  visitorsCount: number;
  isHost: boolean;
  hostStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';
  hostLevel?: number;
  hostCommissionRate?: number; // e.g. 0.70 (70%)
  hostAgencyId?: string; // If host belongs to an agency
  isSeller?: boolean;
  sellerInfo?: SellerProfile;
  isHostAgency?: boolean;
  hostAgencyInfo?: HostAgencyProfile;
  agencyStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  pendingAgencyName?: string;
  isBanned: boolean;
  isMuted: boolean;
  isGuest?: boolean;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  fraudScore: number;
  createdAt: string;
  lastLoginAt: string;
  badgeTitle?: string;
  roomCover?: string;
  avatarFrame?: string;
  equippedRide?: string;
  equippedBubble?: string;
  equippedEntryEffect?: string;
  equippedSound?: string;
  equippedWave?: string;
  ownedFrames?: string[];
  ownedRides?: string[];
  ownedBubbles?: string[];
  ownedBadges?: string[];
  ownedEntryEffects?: string[];
  ownedSounds?: string[];
  ownedWaves?: string[];
}

export interface EmailOtpRecord {
  id: string;
  email: string;
  otpCode: string;
  purpose: 'signup' | 'login' | 'reset_password';
  attempts: number;
  isVerified: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface SignupPayload {
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  password?: string;
  country: string;
  countryFlag?: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  bio?: string;
}

export type StoreItemCategory = 'frames' | 'rides' | 'sounds' | 'waves' | 'bubbles' | 'badges' | 'effects' | 'thrones';

export type ItemDuration = '7d' | '30d' | 'perm';

export interface StoreItem {
  id: string;
  category: StoreItemCategory;
  name: string;
  description: string;
  icon: string;
  previewClass?: string;
  badgeTag?: 'HOT' | 'NEW' | 'EXCLUSIVE' | 'VIP' | 'POPULAR';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  price7Days: number;
  price30Days: number;
  pricePermanent: number;
  soundEffect?: 'engine' | 'fanfare' | 'magic' | 'explosion' | 'chime' | 'cheer' | 'airhorn' | 'applause';
  requiredVip?: VIPLevelId;
  glowColor?: string;
  themeGradient?: string;
  status?: 'active' | 'inactive';
  salesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SellerPaymentMethod {
  id: string;
  type: 'whatsapp' | 'telegram' | 'paypal' | 'bank_transfer' | 'crypto_usdt' | 'zelle' | 'binance_pay';
  name: string;
  accountDetail: string;
  instructions?: string;
  icon?: string;
  isActive: boolean;
}

export interface HostAgencyProfile {
  agencyId: string;
  agencyName: string;
  agencyCommissionRate: number; // e.g. 0.15 (15% cut from hosts)
  totalHosts: number;
  totalAgencyRevenueUsd: number;
  totalDiamondsGenerated: number;
  status: 'active' | 'suspended';
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  address?: string;
  idCardFront?: string;
  idCardBack?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}

export interface SellerProfile {
  sellerId: string;
  agencyName: string;
  verificationLevel: 'gold' | 'diamond' | 'master' | 'standard';
  isOfficialVerified: boolean;
  rating: number; // e.g. 4.95
  totalTrades: number;
  totalCoinsSold: number;
  totalRevenueUsd: number;
  discountPercentage: number; // e.g. 10 (10% off official store price)
  sellerStatus: 'online' | 'busy' | 'away' | 'offline';
  responseTimeText: string; // e.g. "< 2 mins"
  contactWhatsapp?: string;
  contactTelegram?: string;
  paymentMethods: SellerPaymentMethod[];
  bio: string;
  noticeBanner?: string;
  securityPinHash?: string;
}

export interface SellerTransferPayload {
  sellerId: string;
  recipientQuery: string; // User ID, Numeric ID, or Username
  amount: number;
  discountPercentage?: number;
  note?: string;
  securityPin?: string;
}

export interface SellerTransaction {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  recipientId: string;
  recipientNumericId: string;
  recipientName: string;
  recipientAvatar: string;
  amount: number;
  priceUsd: number;
  discountAppliedPercent: number;
  currency: 'COINS';
  status: 'COMPLETED' | 'PENDING' | 'FLAGGED' | 'REVERTED';
  note?: string;
  createdAt: string;
  txHash: string;
}

export interface BuyerCoinRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerNumericId: string;
  sellerId: string;
  coinsRequested: number;
  estimatedPriceUsd: number;
  paymentMethod: string;
  buyerContact: string;
  status: 'PENDING' | 'CONTACTED' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

export type AuthModalMode = 'login' | 'signup' | 'forgot_password';

export interface LoginCredentials {
  emailOrUsername: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  username: string;
  displayName: string;
  email: string;
  password?: string;
  country: string;
  countryFlag?: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  bio?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  token?: string;
  authError?: string;
}

export type SeatLayout = '4_seats' | '6_seats' | '8_seats' | '9_seats' | '12_seats';

export interface MicSeat {
  seatIndex: number;
  userId: string | null;
  user: UserProfile | null;
  isMuted: boolean;
  isLocked: boolean;
  isSpeaking: boolean;
  volumeLevel: number;
  receivedDiamonds?: number;
  joinedAt?: string;
}

export interface RoomTheme {
  id: string;
  name: string;
  category: 'free' | 'premium' | 'luxury';
  priceDiamonds: number;
  gradientClass: string;
  previewGradient: string;
  accentColor: string;
  description: string;
  badge?: string;
  isAnimated?: boolean;
}

export interface VoiceRoom {
  id: string;
  roomIdNumber: string; // 6-digit display ID
  title: string;
  category: 'Music' | 'Chat' | 'Gaming' | 'Dating' | 'Karaoke' | 'Chill' | 'Talent' | 'Language';
  coverUrl: string;
  backgroundTheme: string;
  themeId?: string;
  hostId: string;
  host: UserProfile;
  coHostIds: string[];
  moderatorIds: string[];
  bannedUserIds?: string[];
  seats: MicSeat[];
  seatCount: number;
  isPrivate: boolean;
  password?: string;
  announcement: string;
  tags: string[];
  audienceCount: number;
  likesCount: number;
  hotScore: number;
  isVideoEnabled: boolean;
  rtcChannelName: string;
  rtcToken?: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'closed';
}

export interface RoomChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender: UserProfile;
  message: string;
  type: 'text' | 'gift' | 'system' | 'join' | 'like' | 'seat_change';
  giftData?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    giftCount: number;
    totalCoins: number;
    receiverId: string;
    receiverName: string;
  };
  timestamp: string;
}

export type GiftCategory = 'Popular' | 'Luxury' | 'Romance' | 'Special' | 'Effects' | 'VIP' | 'Lucky';

export interface VirtualGift {
  id: string;
  name: string;
  coinPrice: number;
  category: GiftCategory;
  icon: string;
  animationType: 'confetti' | 'rocket' | 'dragon' | 'sports_car' | 'crown' | 'diamond_rain' | 'galaxy' | 'firework' | 'rose_shower';
  animationDurationMs: number;
  soundEffect: 'chime' | 'applause' | 'engine' | 'magic' | 'fanfare' | 'explosion';
  isVipOnly?: boolean;
  minVipLevel?: number;
  sortOrder: number;
  status: 'active' | 'inactive';
  luckyCoinToDiamondRate?: number; // e.g. 20 (for lucky gifts)
  luckyDiamondReward?: number; // calculated reward based on rate
}

export interface LuckyBackupMilestone {
  id: string;
  name: string;
  requiredCount: number;
  multiplier: number;
  rewardType: 'diamonds' | 'coins';
  rewardAmount: number; // base reward to multiply
  resetPeriod: 'never' | 'daily' | 'weekly' | 'monthly' | 'after_claim' | 'event_end';
  status: 'active' | 'inactive';
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LuckyBackupProgress {
  id: string;
  userId?: string;
  hostId?: string;
  roomId?: string;
  milestoneId: string;
  currentCount: number;
  completedAt?: string;
  rewardStatus: 'pending' | 'claimed' | 'none';
  createdAt: string;
  updatedAt: string;
}

export interface LuckyBackupTransaction {
  id: string;
  userId: string;
  hostId: string;
  roomId?: string;
  milestoneId: string;
  triggerCount: number;
  multiplier: number;
  baseReward: number;
  bonusReward: number;
  transactionReference: string;
  status: 'processed' | 'failed';
  createdAt: string;
}

export interface GiftTransaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  roomId?: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  quantity: number;
  coinPricePerUnit: number;
  totalCoins: number;
  diamondsGenerated: number;
  hostShareDiamonds: number;
  platformShareDiamonds: number;
  timestamp: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  priceUsd: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  badge?: string;
}

export type TransactionType = 
  | 'coin_purchase'
  | 'gift_sent'
  | 'gift_received'
  | 'vip_subscription'
  | 'store_item_purchase'
  | 'host_payout_withdrawal'
  | 'mission_reward'
  | 'event_reward'
  | 'admin_adjustment'
  | 'refund'
  | 'reseller_transfer_sent'
  | 'reseller_transfer_received'
  | 'COIN_PURCHASE'
  | 'GIFT_SENT'
  | 'GIFT_RECEIVED'
  | 'DIAMOND_WITHDRAWAL'
  | 'VIP_PURCHASE'
  | 'LUCKY_BACKUP_CONVERSION';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: 'COINS' | 'DIAMONDS' | 'USD';
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  balanceAfter: number;
  referenceId: string;
  description: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERTED';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface HostApplication {
  id: string;
  userId: string;
  user: UserProfile;
  fullName: string;
  country: string;
  phone: string;
  experience: string;
  language: string;
  introduction: string;
  sampleAudioUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface AgencyApplication {
  id: string;
  userId: string;
  user: UserProfile;
  agencyName: string;
  country: string;
  phone: string;
  address: string;
  idCardFront: string;
  idCardBack: string;
  commissionRate: number; // e.g. 0.15 (15%)
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface HostEarningsSummary {
  hostId: string;
  todayDiamonds: number;
  weekDiamonds: number;
  monthDiamonds: number;
  totalDiamonds: number;
  withdrawnDiamonds: number;
  availableDiamonds: number;
  liveHoursToday: number;
  totalLiveHours: number;
  visitorsToday: number;
  totalGiftsReceived: number;
  rank: number;
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';

export interface WithdrawalRequest {
  id: string;
  hostId: string;
  hostName: string;
  diamondsAmount: number;
  cashAmountUsd: number;
  method: 'bank_transfer' | 'paypal' | 'wise' | 'mobile_wallet' | 'crypto_usdt';
  accountDetails: {
    accountName: string;
    accountNumberOrEmail: string;
    bankName?: string;
    routingOrIban?: string;
    cryptoAddress?: string;
  };
  status: WithdrawalStatus;
  adminNotes?: string;
  transactionHash?: string;
  requestedAt: string;
  createdAt?: string;
  processedAt?: string;
  // Compatibility fields
  userId?: string;
  userName?: string;
  amountDiamonds?: number;
  amountUsd?: number;
  payoutMethod?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'achievement';
  targetCount: number;
  currentCount: number;
  progress?: number;
  target?: number;
  type?: string;
  rewardType: 'coins' | 'diamonds' | 'xp' | 'vip_points';
  rewardAmount: number;
  rewardCoins?: number;
  rewardXp?: number;
  isClaimed: boolean;
  iconName: string;
}

export interface PlatformEvent {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  category: 'host_battle' | 'gift_rush' | 'voice_star' | 'festival';
  startDate: string;
  endDate: string;
  prizePoolUsd: number;
  status: 'upcoming' | 'active' | 'ended';
  rules: string[];
  leaderboard?: any[];
  topParticipants: {
    userId: string;
    username: string;
    avatar: string;
    score: number;
    rank: number;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  vipTier: VIPLevelId;
  level: number;
  countryFlag: string;
  score: number;
  formattedScore: string;
  isHost?: boolean;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'text' | 'voice' | 'image' | 'gift';
  voiceDurationSec?: number;
  giftData?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    coinPrice: number;
    count: number;
  };
  isRead: boolean;
  createdAt: string;
}

export interface GiftComboState {
  gift: VirtualGift;
  receiver: UserProfile;
  roomId?: string;
  count: number;
  expiresAt: number;
}

export interface Conversation {
  id: string;
  participant: UserProfile;
  lastMessage?: DirectMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'gift' | 'follower' | 'room_invite' | 'host_approved' | 'withdrawal_update' | 'system' | 'mission';
  title: string;
  message: string;
  isRead: boolean;
  body?: string;
  avatar?: string;
  link?: string;
  createdAt: string;
}

export interface AbuseReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'room' | 'message' | 'host';
  targetId: string;
  targetName: string;
  category: 'Harassment' | 'Spam' | 'Fraud' | 'Inappropriate Audio' | 'Hate Speech' | 'Impersonation' | 'Other';
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  assignedTo?: string;
  actionTaken?: string;
  createdAt: string;
}

export interface FraudLogEvent {
  id: string;
  userId: string;
  userName: string;
  eventType: 'velocity_spike' | 'device_multi_account' | 'rapid_balance_change' | 'high_chargeback_risk' | 'ip_anomaly';
  riskScoreDelta: number;
  currentRiskScore: number;
  details: string;
  timestamp: string;
  status: 'flagged' | 'cleared' | 'blocked';
}

export interface PlatformConfig {
  appName: string;
  supportEmail: string;
  coinToDiamondRate: number; // e.g. 0.5 (100 coins spent => 50 diamonds total)
  hostCommissionPercent: number; // e.g. 70 (Host gets 70% of diamonds, platform keeps 30%)
  defaultHostCommissionRate?: number; // e.g. 0.70
  diamondCashValueUsd: number; // e.g. 0.01 (100 diamonds = $1.00 USD)
  minimumWithdrawalDiamonds: number; // e.g. 2000 diamonds ($20 USD)
  dailyWithdrawalLimitDiamonds: number; // e.g. 100000 diamonds ($1,000 USD)
  vipSystemEnabled: boolean;
  voiceRoomsEnabled: boolean;
  videoRoomsEnabled: boolean;
  registrationEnabled: boolean;
  guestLoginEnabled: boolean;
  maintenanceMode: boolean;
  rtcProvider?: 'agora' | 'zego' | 'livekit' | 'webrtc';
}

export interface AdminStats {
  totalRevenueUsd: number;
  totalCoinsCirculating: number;
  totalDiamondsMinted: number;
  totalConcurrentUsers: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export type PaymentGatewayType = 
  | 'google_play'
  | 'apple_app_store'
  | 'stripe'
  | 'paypal'
  | 'razorpay'
  | 'crypto_usdt'
  | 'bank_transfer'
  | 'custom';

export type GatewayCategory = 
  | 'in_app_purchase'
  | 'card_processor'
  | 'digital_wallet'
  | 'crypto_web3'
  | 'bank_direct';

export interface PaymentGatewayCredentials {
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  clientId?: string;
  clientSecret?: string;
  appStoreSharedSecret?: string;
  serviceAccountEmail?: string;
  serviceAccountKeyJson?: string;
  cryptoWalletAddress?: string;
  cryptoSupportedNetworks?: string[];
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  bankSwift?: string;
  bankName?: string;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  code: PaymentGatewayType | string;
  category: GatewayCategory;
  iconName: string; // 'GooglePlay' | 'Apple' | 'CreditCard' | 'PayPal' | 'IndianRupee' | 'Bitcoin' | 'Building2'
  description: string;
  isEnabled: boolean;
  isSandbox: boolean;
  settlementCurrency: string;
  feePercent: number; // e.g. 2.9 (2.9%)
  feeFixedUsd: number; // e.g. 0.30 ($0.30)
  minAmountUsd: number;
  maxAmountUsd: number;
  supportedCurrencies: string[];
  credentials: PaymentGatewayCredentials;
  webhookUrl: string;
  webhookStatus: 'healthy' | 'degraded' | 'failing' | 'unconfigured';
  lastPingMs?: number;
  lastEventReceivedAt?: string;
  totalProcessedVolumeUsd: number;
  totalTransactionsCount: number;
  successRatePercent: number;
  chargebackRatePercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayWebhookLog {
  id: string;
  gatewayId: string;
  gatewayName: string;
  eventType: string;
  amountUsd: number;
  currency: string;
  customerId: string;
  customerName: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  ipAddress: string;
  latencyMs: number;
  timestamp: string;
  payloadSnippet: string;
}

// Mini-Games and Admin Game Management System
export type GameCategory = 'all' | 'casino' | 'slots' | 'wheel' | 'crash' | 'dice' | 'cards' | 'arcade';

export interface GameMultiplierSegment {
  id: string;
  label: string;
  multiplier: number;
  probabilityWeight: number; // For simulation
  color: string;
  icon?: string;
  isJackpot?: boolean;
}

export interface GameItem {
  id: string;
  name: string;
  category: GameCategory;
  description: string;
  icon: string;
  bannerUrl: string;
  themeColor: string;
  isHot?: boolean;
  isJackpotGame?: boolean;
  badgeTag?: 'HOT' | 'JACKPOT' | 'NEW' | 'POPULAR' | 'FEATURED';
  minBet: number;
  maxBet: number;
  rtpPercent: number; // Return to player percentage (e.g. 96%)
  houseEdgePercent: number; // (e.g. 4%)
  jackpotPool: number;
  jackpotContributionPercent: number; // % of each bet added to jackpot (e.g. 2%)
  status: 'active' | 'maintenance' | 'disabled';
  totalBetsCount: number;
  totalWageredCoins: number;
  totalPayoutCoins: number;
  totalPlayers: number;
  rules: string[];
  multipliers: GameMultiplierSegment[];
  createdAt: string;
  updatedAt: string;
}

export interface GameBetHistoryItem {
  id: string;
  gameId: string;
  gameName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  betAmount: number;
  payoutAmount: number;
  multiplier: number;
  resultOutcome: string;
  isWin: boolean;
  isJackpot?: boolean;
  timestamp: string;
}

export interface GameJackpotWinner {
  id: string;
  gameId: string;
  gameName: string;
  userName: string;
  userAvatar: string;
  jackpotAmount: number;
  timestamp: string;
}

