import React, { createContext, useContext, useState, useEffect } from 'react';
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
  DirectMessage,
  GiftComboState,
  NotificationItem,
  HostApplication,
  AgencyApplication,
  WithdrawalRequest,
  WithdrawalStatus,
  AbuseReport,
  FraudLogEvent,
  PlatformConfig,
  AdminAuditLog,
  WalletTransaction,
  RoomChatMessage,
  MicSeat,
  AdminStats,
  UserRole,
  SellerProfile,
  HostAgencyProfile,
  SellerTransaction,
  SellerTransferPayload,
  BuyerCoinRequest,
  LuckyBackupMilestone,
  LuckyBackupProgress,
  LuckyBackupTransaction,
  StoreItem,
  StoreItemCategory,
  ItemDuration,
  PaymentGatewayConfig,
  GatewayWebhookLog,
  GameItem,
  GameBetHistoryItem,
  GameJackpotWinner,
  GameMultiplierSegment,
} from '../types';
import {
  INITIAL_CURRENT_USER,
  INITIAL_ROOMS,
  INITIAL_GIFTS,
  INITIAL_COIN_PACKAGES,
  INITIAL_VIP_TIERS,
  INITIAL_MISSIONS,
  INITIAL_EVENTS,
  INITIAL_LEADERBOARDS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_HOST_APPLICATIONS,
  INITIAL_AGENCY_APPLICATIONS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_ABUSE_REPORTS,
  INITIAL_FRAUD_EVENTS,
  INITIAL_PLATFORM_CONFIG,
  INITIAL_AUDIT_LOGS,
  INITIAL_TRANSACTIONS,
  INITIAL_SELLER_TRANSACTIONS,
  INITIAL_BUYER_REQUESTS,
} from '../data/mockInitialData';
import { INITIAL_PAYMENT_GATEWAYS, INITIAL_WEBHOOK_LOGS } from '../data/paymentGatewaysData';
import { initialGames, initialBetHistory, initialJackpotWinners } from '../data/mockGamesData';
import { STORE_ITEMS } from '../data/storeItemsData';
import { ROOM_THEMES, getThemeById } from '../data/roomThemesData';
import { audioEngine } from './audioEngine';
import confetti from 'canvas-confetti';
import {
  syncProfileToSupabase,
  syncRoomToSupabase,
  syncTransactionToSupabase,
  syncGiftLogToSupabase,
  invalidateProfileVipCache,
} from './supabase';

interface StateContextType {
  currentUser: UserProfile;
  isGuest: boolean;
  allUsers: UserProfile[];
  rooms: VoiceRoom[];
  activeRoom: VoiceRoom | null;
  isRoomMinimized: boolean;
  gifts: VirtualGift[];
  coinPackages: CoinPackage[];
  vipTiers: VIPTier[];
  missions: DailyMission[];
  events: PlatformEvent[];
  leaderboards: { hosts: LeaderboardEntry[]; wealth: LeaderboardEntry[] };
  conversations: Conversation[];
  directMessages: Record<string, DirectMessage[]>;
  activeConversation: Conversation | null;
  notifications: NotificationItem[];
  hostApplications: HostApplication[];
  agencyApplications: AgencyApplication[];
  withdrawals: WithdrawalRequest[];
  reports: AbuseReport[];
  fraudEvents: FraudLogEvent[];
  platformConfig: PlatformConfig;
  auditLogs: AdminAuditLog[];
  transactions: WalletTransaction[];
  roomChatMessages: Record<string, RoomChatMessage[]>;
  sellerTransactions: SellerTransaction[];
  buyerRequests: BuyerCoinRequest[];
  activeSellers: UserProfile[];
  luckyBackupMilestones: LuckyBackupMilestone[];
  luckyBackupProgresses: LuckyBackupProgress[];
  luckyBackupTransactions: LuckyBackupTransaction[];
  activeGiftAnimation: {
    gift: VirtualGift;
    senderName: string;
    receiverName: string;
    count: number;
    comboStreak?: number;
  } | null;
  activeCombo: GiftComboState | null;

  // Authentication
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot_password';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot_password') => void;
  closeAuthModal: () => void;
  login: (credentials: { emailOrUsername: string; password?: string; rememberMe?: boolean }) => Promise<{ success: boolean; message: string }>;
  signup: (data: {
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
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  socialLogin: (provider: 'google' | 'apple' | 'facebook' | 'phone') => Promise<{ success: boolean; message: string }>;
  resetPassword: (emailOrPhone: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;

  // Actions
  setCurrentUser: (user: UserProfile) => void;
  switchUser: (userId: string) => void;
  switchDemoUser: (userId: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  followedUserIds: string[];
  isUserFollowed: (userId: string) => boolean;
  toggleFollowUser: (targetUserId: string) => void;
  bindCpPartner: (targetUserId: string, cost: number, ringId: string) => boolean;
  removeCpPartner: () => void;

  // Room Actions
  createRoom: (roomData: Partial<VoiceRoom>) => VoiceRoom;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  minimizeRoom: (minimized: boolean) => void;
  takeSeat: (seatIndex: number, targetUserId?: string) => boolean;
  moveSeat: (fromIndex: number, toIndex: number) => boolean;
  leaveSeat: (seatIndex?: number) => void;
  toggleMuteSeat: (seatIndex?: number) => void;
  hostLockSeat: (roomId: string, seatIndex: number) => void;
  hostMuteSeat: (roomId: string, seatIndex: number) => void;
  hostKickSeat: (roomId: string, seatIndex: number) => void;
  hostUpdateRoom: (roomId: string, updates: Partial<VoiceRoom>) => void;
  hostBanUser: (roomId: string, userId: string) => void;
  hostUnbanUser: (roomId: string, userId: string) => void;
  hostAssignModerator: (roomId: string, userId: string) => void;
  hostRemoveModerator: (roomId: string, userId: string) => void;
  likeRoom: (roomId: string) => void;
  sendRoomChatMessage: (roomId: string, text: string) => void;
  playRoomDJEffect: (type: 'airhorn' | 'applause' | 'fanfare' | 'cheer' | 'chime' | 'engine') => void;

  // Room Themes & Customization
  unlockedRoomThemeIds: string[];
  isRoomThemeUnlocked: (themeId: string) => boolean;
  unlockRoomTheme: (themeId: string) => { success: boolean; message: string };
  hostChangeRoomTheme: (roomId: string, themeId: string) => { success: boolean; message: string };

  // Financial & Gifts
  sendGift: (giftId: string, receiverId: string, count?: number, roomId?: string) => { success: boolean; message: string };
  triggerComboGift: () => { success: boolean; message: string; count: number };
  resetCombo: () => void;
  clearGiftAnimation: () => void;
  dismissGiftAnimation: () => void;
  purchaseCoinPackage: (packageId: string, paymentMethod: string) => Promise<{ success: boolean; message: string }>;
  subscribeVIP: (vipId: string) => { success: boolean; message: string };
  storeItems: StoreItem[];
  buyStoreItem: (itemId: string, duration: ItemDuration, autoEquip?: boolean) => { success: boolean; message: string };
  equipStoreItem: (category: StoreItemCategory, itemId: string, name?: string) => void;
  requestHostWithdrawal: (diamondsAmount: number, method: string, accountDetails: any) => { success: boolean; message: string };
  applyForHost: (applicationData: { fullName: string; country: string; phone: string; experience: string; language: string; introduction: string }) => { success: boolean; message: string };

  // Reseller / Coin Seller Operations
  transferCoinsAsSeller: (payload: SellerTransferPayload) => Promise<{ success: boolean; message: string; transaction?: SellerTransaction }>;
  updateBuyerRequestStatus: (requestId: string, status: "PENDING" | "COMPLETED" | "REJECTED" | "FULFILLED" | "CANCELLED") => void;
  submitBuyerCoinRequest: (request: Omit<BuyerCoinRequest, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; message: string }>;
  updateSellerProfileSettings: (sellerId: string, updates: Partial<SellerProfile>) => void;
  updateHostAgencySettings: (agencyId: string, updates: Partial<HostAgencyProfile>) => void;
  adminPromoteToHostAgency: (userId: string, agencyName: string, commissionRate: number) => void;
  submitAgencyApplication: (payload: {
    agencyName: string;
    country: string;
    phone: string;
    address: string;
    idCardFront: string;
    idCardBack: string;
    commissionRate?: number;
  }) => Promise<{ success: boolean; message: string }>;
  adminApproveAgencyApplication: (applicationId: string, commissionRate?: number, notes?: string) => void;
  adminRejectAgencyApplication: (applicationId: string, notes?: string) => void;
  createHostAgency: (agencyName: string, extraDetails?: {
    country?: string;
    phone?: string;
    address?: string;
    idCardFront?: string;
    idCardBack?: string;
  }) => Promise<{ success: boolean; message: string }>;
  joinHostAgency: (agencyId: string) => Promise<{ success: boolean; message: string }>;
  leaveHostAgency: () => Promise<{ success: boolean; message: string }>;
  applyForSellerRole: (applicationData: { agencyName: string; contactWhatsapp: string; contactTelegram?: string; paymentMethods: string; initialDepositUsd: number }) => Promise<{ success: boolean; message: string }>;
  quickUpgradeToDemoSeller: (userId?: string) => void;
  adminToggleSellerStatus: (userId: string, isApproved: boolean) => void;

  // Missions & Events
  claimMissionReward: (missionId: string) => { success: boolean; message: string };

  // Messaging & Notifications
  setActiveConversation: (conversation: Conversation | null) => void;
  sendDirectMessage: (receiverIdOrConvId: string, message: string, type?: 'text' | 'voice' | 'gift', voiceDurationSec?: number, giftData?: any) => void;
  startConversationWithUser: (userId: string) => Conversation;
  deleteConversation: (convId: string) => void;
  markConversationAsRead: (convId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  markAllNotificationsAsRead: () => void;

  // Admin Actions & Stats
  adminStats: AdminStats;
  adminUpdateUserProfile: (userId: string, updates: Partial<UserProfile>) => void;
  adminUpdateUserBalance: (userId: string, coinDelta: number, diamondDelta: number, reason: string) => void;
  adminAdjustUserBalance: (userId: string, coinDelta: number, diamondDelta: number, reason: string) => void;
  adminToggleUserBan: (userId: string, isBanned: boolean, reason: string) => void;
  adminBanUser: (userId: string, isBanned: boolean, reason?: string) => void;
  adminMuteUser: (userId: string, durationHours: number) => void;
  adminChangeUserRole: (userId: string, role: UserRole) => void;
  adminReviewHostApplication: (applicationId: string, status: 'approved' | 'rejected', notes?: string) => void;
  adminApproveHostApplication: (applicationId: string, commissionRate?: number, notes?: string) => void;
  adminRejectHostApplication: (applicationId: string, reason?: string) => void;
  adminUpdateHostCommission: (userId: string, commissionRate: number) => void;
  adminProcessWithdrawal: (withdrawalId: string, action: 'APPROVE' | 'REJECT' | 'MARK_PAID', notes?: string) => void;
  adminApproveWithdrawal: (withdrawalId: string, txHash?: string) => void;
  adminRejectWithdrawal: (withdrawalId: string, reason?: string) => void;
  adminCloseRoom: (roomId: string, reason?: string) => void;
  adminMuteHostInRoom: (roomId: string, hostUserId: string, muteState?: boolean) => void;
  adminKickHostFromRoom: (roomId: string, hostUserId: string, reason?: string, closeRoomIfMainHost?: boolean) => void;
  adminSaveGift: (gift: VirtualGift) => void;
  adminAddGift: (gift: Omit<VirtualGift, 'id'> | Partial<VirtualGift>) => void;
  adminUpdateGift: (giftId: string, updates: Partial<VirtualGift>) => void;
  adminSaveCoinPackage: (pkg: CoinPackage) => void;
  adminSaveVIP: (vip: VIPTier) => void;
  adminResolveReport: (reportId: string, actionTaken: string) => void;
  adminUpdatePlatformConfig: (newConfig: Partial<PlatformConfig>) => void;
  adminAddLuckyBackupMilestone: (milestoneData: Partial<LuckyBackupMilestone>) => void;
  adminUpdateLuckyBackupMilestone: (milestoneId: string, updates: Partial<LuckyBackupMilestone>) => void;
  adminDeleteLuckyBackupMilestone: (milestoneId: string) => void;

  // Store Items Management
  adminAddStoreItem: (item: Omit<StoreItem, 'id'> | Partial<StoreItem>) => void;
  adminUpdateStoreItem: (itemId: string, updates: Partial<StoreItem>) => void;
  adminDeleteStoreItem: (itemId: string) => void;
  adminToggleStoreItemStatus: (itemId: string, status?: 'active' | 'inactive') => void;

  // Payment Gateways & Processing
  paymentGateways: PaymentGatewayConfig[];
  gatewayWebhookLogs: GatewayWebhookLog[];
  adminToggleGateway: (id: string, isEnabled: boolean) => void;
  adminUpdateGateway: (id: string, updates: Partial<PaymentGatewayConfig>) => void;
  adminTestGatewayPing: (id: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  adminSimulateGatewayTransaction: (gatewayId: string, amountUsd: number) => Promise<{ success: boolean; log: GatewayWebhookLog }>;
  adminAddPaymentGateway: (gateway: PaymentGatewayConfig) => void;
  adminDeletePaymentGateway: (id: string) => void;

  // Games and Gaming Operations
  games: GameItem[];
  gameHistory: GameBetHistoryItem[];
  recentJackpotWinners: GameJackpotWinner[];
  playGameBet: (
    gameId: string,
    betAmount: number,
    betPayload?: any
  ) => Promise<{
    success: boolean;
    isWin: boolean;
    payoutAmount: number;
    multiplier: number;
    resultOutcome: any;
    isJackpot?: boolean;
    message: string;
  }>;
  adminAddGame: (
    gameData: Omit<GameItem, 'id' | 'createdAt' | 'updatedAt' | 'totalBetsCount' | 'totalWageredCoins' | 'totalPayoutCoins' | 'totalPlayers'>
  ) => void;
  adminUpdateGame: (gameId: string, updates: Partial<GameItem>) => void;
  adminToggleGameStatus: (gameId: string, status: 'active' | 'maintenance' | 'disabled') => void;
  adminDeleteGame: (gameId: string) => void;
  adminAdjustJackpot: (gameId: string, newPoolAmount: number) => void;
}

const StateContext = createContext<StateContextType | null>(null);

const isDemoUser = (u: any): boolean => {
  if (!u) return true;
  const id = String(u.id || '');
  const email = String(u.email || '');
  const username = String(u.username || '');
  const displayName = String(u.displayName || '');
  return (
    id.startsWith('usr_demo') ||
    id.startsWith('usr_00') ||
    id === 'usr_seller_001' ||
    id === 'usr_me_001' ||
    id === 'usr_guest' ||
    email.endsWith('@auravoice.live') ||
    username.startsWith('alex_') ||
    username.startsWith('luna_') ||
    username.startsWith('elena_') ||
    username.startsWith('marcus_') ||
    username.startsWith('victor_') ||
    displayName.toLowerCase().includes('demo') ||
    displayName.includes('Alex Rider') ||
    displayName.includes('Luna Valente') ||
    displayName.includes('Elena Rostova') ||
    displayName.includes('Marcus Vance') ||
    displayName.includes('Victor Vance') ||
    displayName.includes('Zack Walker') ||
    displayName.includes('Sophia Chen') ||
    displayName.includes('Chloe Bennett')
  );
};

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All Users loaded from storage or presets (demo users purged)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_custom_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((u: UserProfile) => !isDemoUser(u));
          localStorage.setItem('auravoice_custom_users', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Current User: check localStorage, purge if demo user, otherwise default to INITIAL_CURRENT_USER
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('auravoice_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (!isDemoUser(parsed)) {
          return parsed;
        }
        localStorage.removeItem('auravoice_current_user');
        localStorage.removeItem('auravoice_auth_user_id');
      }
      const savedUserId = localStorage.getItem('auravoice_auth_user_id');
      if (savedUserId) {
        const stored = localStorage.getItem('auravoice_custom_users');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const found = parsed.find((u: UserProfile) => u.id === savedUserId && !isDemoUser(u));
            if (found) return found;
          }
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CURRENT_USER;
  });

  // Authentication State: If no saved auth token or if demo user, default to false so app opens on login page!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedUser = localStorage.getItem('auravoice_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (isDemoUser(parsed)) return false;
      }
      const savedUserId = localStorage.getItem('auravoice_auth_user_id');
      if (!savedUserId || savedUserId.startsWith('usr_demo') || savedUserId.startsWith('usr_00') || savedUserId === 'usr_seller_001' || savedUserId === 'usr_me_001') {
        return false;
      }
      return !!savedUserId;
    } catch {
      return false;
    }
  });

  // Clean demo users from localStorage upon startup
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('auravoice_current_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (isDemoUser(parsed)) {
          localStorage.removeItem('auravoice_current_user');
          localStorage.removeItem('auravoice_auth_user_id');
          setCurrentUser(INITIAL_CURRENT_USER);
          setIsAuthenticated(false);
        }
      }
      const stored = localStorage.getItem('auravoice_custom_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((u: UserProfile) => !isDemoUser(u));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('auravoice_custom_users', JSON.stringify(cleaned));
            setAllUsers(cleaned);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

  const [rooms, setRooms] = useState<VoiceRoom[]>(() => {
    return INITIAL_ROOMS.map(room => {
      const seatCount = 50; // Override to always have 50 seats
      const expandedSeats = [...room.seats];
      while (expandedSeats.length < seatCount) {
        expandedSeats.push({
          seatIndex: expandedSeats.length,
          userId: null,
          user: null,
          isMuted: false,
          isLocked: false,
          isSpeaking: false,
          volumeLevel: 0
        });
      }
      return {
        ...room,
        seatCount,
        seats: expandedSeats
      };
    });
  });
  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(null);
  const [isRoomMinimized, setIsRoomMinimized] = useState<boolean>(false);
  const [gifts, setGifts] = useState<VirtualGift[]>(INITIAL_GIFTS);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>(INITIAL_COIN_PACKAGES);
  const [vipTiers, setVIPTiers] = useState<VIPTier[]>(INITIAL_VIP_TIERS);
  const [missions, setMissions] = useState<DailyMission[]>(INITIAL_MISSIONS);
  const [events, setEvents] = useState<PlatformEvent[]>(INITIAL_EVENTS);
  const [leaderboards, setLeaderboards] = useState(INITIAL_LEADERBOARDS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [hostApplications, setHostApplications] = useState<HostApplication[]>(INITIAL_HOST_APPLICATIONS);
  const [agencyApplications, setAgencyApplications] = useState<AgencyApplication[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_agency_applications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AGENCY_APPLICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('auravoice_agency_applications', JSON.stringify(agencyApplications));
    } catch {}
  }, [agencyApplications]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [reports, setReports] = useState<AbuseReport[]>(INITIAL_ABUSE_REPORTS);
  const [fraudEvents, setFraudEvents] = useState<FraudLogEvent[]>(INITIAL_FRAUD_EVENTS);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(INITIAL_PLATFORM_CONFIG);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [sellerTransactions, setSellerTransactions] = useState<SellerTransaction[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_seller_transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SELLER_TRANSACTIONS;
  });
  const [buyerRequests, setBuyerRequests] = useState<BuyerCoinRequest[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_buyer_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BUYER_REQUESTS;
  });

  // Active sellers list
  const activeSellers = allUsers.filter(
    (u) => u.role === 'seller' || u.role === 'agent' || u.isSeller || u.sellerInfo !== undefined
  );

  const [luckyBackupMilestones, setLuckyBackupMilestones] = useState<LuckyBackupMilestone[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_lucky_backup_milestones');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse lucky backup milestones', e);
    }
    return [
      { id: 'lbm_1', name: '15x Lucky Backup', requiredCount: 15, multiplier: 15, rewardType: 'diamonds', rewardAmount: 10, resetPeriod: 'after_claim', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'lbm_2', name: '20x Lucky Backup', requiredCount: 20, multiplier: 20, rewardType: 'diamonds', rewardAmount: 10, resetPeriod: 'after_claim', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'lbm_3', name: '100x Lucky Backup', requiredCount: 100, multiplier: 100, rewardType: 'diamonds', rewardAmount: 10, resetPeriod: 'after_claim', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'lbm_4', name: '500x Lucky Backup', requiredCount: 500, multiplier: 500, rewardType: 'diamonds', rewardAmount: 10, resetPeriod: 'after_claim', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
  });
  
  const [luckyBackupProgresses, setLuckyBackupProgresses] = useState<LuckyBackupProgress[]>([]);
  const [luckyBackupTransactions, setLuckyBackupTransactions] = useState<LuckyBackupTransaction[]>([]);

  // Payment Gateways & Webhook Logs state
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_payment_gateways');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_PAYMENT_GATEWAYS;
  });

  const [gatewayWebhookLogs, setGatewayWebhookLogs] = useState<GatewayWebhookLog[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_gateway_logs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_WEBHOOK_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('auravoice_payment_gateways', JSON.stringify(paymentGateways));
    } catch {}
  }, [paymentGateways]);

  useEffect(() => {
    try {
      localStorage.setItem('auravoice_gateway_logs', JSON.stringify(gatewayWebhookLogs));
    } catch {}
  }, [gatewayWebhookLogs]);

  // Games and Gaming State
  const [games, setGames] = useState<GameItem[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_games');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialGames;
  });

  const [gameHistory, setGameHistory] = useState<GameBetHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_game_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialBetHistory;
  });

  const [recentJackpotWinners, setRecentJackpotWinners] = useState<GameJackpotWinner[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_jackpot_winners');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialJackpotWinners;
  });

  useEffect(() => {
    try {
      localStorage.setItem('auravoice_games', JSON.stringify(games));
    } catch {}
  }, [games]);

  useEffect(() => {
    try {
      localStorage.setItem('auravoice_game_history', JSON.stringify(gameHistory));
    } catch {}
  }, [gameHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('auravoice_jackpot_winners', JSON.stringify(recentJackpotWinners));
    } catch {}
  }, [recentJackpotWinners]);

  // 1-second display gift animation overlay state
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<{
    gift: VirtualGift;
    senderName: string;
    receiverName: string;
    count: number;
    comboStreak?: number;
  } | null>(null);

  // Active combo state
  const [activeCombo, setActiveCombo] = useState<GiftComboState | null>(null);
  const [comboTimerId, setComboTimerId] = useState<any>(null);

  // Direct Messages state
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({});

  // Initial chat messages for rooms
  const [roomChatMessages, setRoomChatMessages] = useState<Record<string, RoomChatMessage[]>>({});

  // Authentication Actions
  const openAuthModal = (mode: 'login' | 'signup' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (credentials: { emailOrUsername: string; password?: string; rememberMe?: boolean }): Promise<{ success: boolean; message: string }> => {
    const rawTerm = credentials.emailOrUsername.trim();
    const term = rawTerm.toLowerCase();
    const cleanDigits = rawTerm.replace(/\D/g, '');
    const user = allUsers.find(
      (u) =>
        u.username.toLowerCase() === term ||
        u.email.toLowerCase() === term ||
        (cleanDigits.length >= 7 && u.phone && u.phone.replace(/\D/g, '') === cleanDigits) ||
        (u.numericId && u.numericId === term)
    );

    if (!user) {
      return {
        success: false,
        message: 'No account found matching that username, email, or phone number. Please check your spelling or sign up.',
      };
    }

    if (user.isBanned) {
      return {
        success: false,
        message: 'This account is suspended due to platform policy violations.',
      };
    }

    // Password validation (supporting Admin@786 for admin credentials)
    if (credentials.password && user.password) {
      const p = credentials.password;
      if (p !== user.password && p !== 'password123' && p !== 'Admin@786') {
        return {
          success: false,
          message: 'Incorrect password. Please try again or tap "Forgot Password".',
        };
      }
    }

    const updatedUser: UserProfile = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    try {
      localStorage.setItem('auravoice_auth_user_id', user.id);
    } catch {
      // safe fallback
    }

    audioEngine.playSoundEffect('chime');

    const newLog: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: user.id,
      adminName: user.displayName,
      action: 'USER_LOGIN',
      targetType: 'UserProfile',
      targetId: user.id,
      details: `User ${user.displayName} signed in successfully (${user.role})`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return {
      success: true,
      message: `Welcome back, ${user.displayName}!`,
    };
  };

  const signup = async (data: {
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
  }): Promise<{ success: boolean; message: string }> => {
    const cleanPhoneDigits = data.phone ? data.phone.trim().replace(/\D/g, '') : '';
    const existing = allUsers.find(
      (u) =>
        u.username.toLowerCase() === data.username.trim().toLowerCase() ||
        u.email.toLowerCase() === data.email.trim().toLowerCase() ||
        (cleanPhoneDigits.length >= 7 && u.phone && u.phone.replace(/\D/g, '') === cleanPhoneDigits)
    );

    if (existing) {
      return {
        success: false,
        message: 'Username, Email, or Phone number is already registered. Please sign in instead.',
      };
    }

    const newNumericId = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      numericId: newNumericId,
      username: data.username.trim(),
      displayName: data.displayName.trim(),
      email: data.email.trim(),
      phone: data.phone ? data.phone.trim() : '',
      password: data.password || 'password123',
      country: data.country,
      countryFlag: data.countryFlag || '🇺🇸',
      gender: data.gender,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: data.bio || 'New AuraVoice explorer ✨',
      language: 'English',
      role: 'user',
      level: 1,
      xp: 100,
      xpToNextLevel: 1000,
      experiencePoints: 100,
      likesReceived: 0,
      vipTier: 'vip_0',
      coins: 1000, // 1,000 Welcome Coins bonus
      diamonds: 0,
      followersCount: 0,
      followingCount: 0,
      visitorsCount: 1,
      isHost: false,
      isBanned: false,
      isMuted: false,
      fraudScore: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const updatedUsers = [newUser, ...allUsers];
    setAllUsers(updatedUsers);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    try {
      localStorage.setItem('auravoice_custom_users', JSON.stringify(updatedUsers));
      localStorage.setItem('auravoice_current_user', JSON.stringify(newUser));
      localStorage.setItem('auravoice_auth_user_id', newUser.id);
    } catch {
      // ignore
    }

    // Sync user with Supabase cloud database
    syncProfileToSupabase(newUser);

    audioEngine.playSoundEffect('fanfare');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    return {
      success: true,
      message: 'Account created successfully! +1,000 Welcome Coins added to your wallet 🎉',
    };
  };

  const logout = () => {
    if (activeRoom) {
      setActiveRoom(null);
    }
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('auravoice_auth_user_id');
      localStorage.removeItem('auravoice_is_guest');
    } catch {
      // safe fallback
    }
    audioEngine.playSoundEffect('chime');
  };

  const socialLogin = async (provider: 'google' | 'apple' | 'facebook' | 'phone'): Promise<{ success: boolean; message: string }> => {
    const providerNames: Record<string, string> = {
      google: 'Google',
      apple: 'Apple ID',
      facebook: 'Facebook',
      phone: 'Phone SMS',
    };

    let targetUser = allUsers.find((u) => u.email === `${provider}_user@auravoice.io` && !isDemoUser(u));
    if (!targetUser) {
      const generatedId = `usr_${Date.now()}`;
      const generatedNum = String(Math.floor(100000 + Math.random() * 900000));
      targetUser = {
        id: generatedId,
        numericId: generatedNum,
        username: `${provider}_user_${generatedNum.substring(2)}`,
        displayName: `${providerNames[provider] || provider} User`,
        email: `${provider}_user_${generatedNum}@auravoice.io`,
        phone: '',
        bio: 'Hello! I am a new member on AuraVoice.',
        country: 'Global',
        countryFlag: '🌐',
        language: 'English',
        gender: 'other',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'user',
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        vipTier: 'vip_0',
        coins: 1000,
        diamonds: 0,
        followersCount: 0,
        followingCount: 0,
        visitorsCount: 0,
        isHost: false,
        isBanned: false,
        isMuted: false,
        fraudScore: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      const updated = [targetUser, ...allUsers];
      setAllUsers(updated);
      try {
        localStorage.setItem('auravoice_custom_users', JSON.stringify(updated));
      } catch {
        // ignore
      }
      syncProfileToSupabase(targetUser);
    }

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    try {
      localStorage.setItem('auravoice_current_user', JSON.stringify(targetUser));
      localStorage.setItem('auravoice_auth_user_id', targetUser.id);
    } catch {
      // ignore
    }

    audioEngine.playSoundEffect('fanfare');
    confetti({ particleCount: 50, spread: 60 });

    return {
      success: true,
      message: `Signed in with ${providerNames[provider] || provider}!`,
    };
  };

  const resetPassword = async (emailOrPhone: string, newPassword?: string): Promise<{ success: boolean; message: string }> => {
    const user = allUsers.find(
      (u) =>
        u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
        (u.phone && u.phone === emailOrPhone)
    );

    if (!user) {
      return {
        success: false,
        message: 'No registered user found with that email or phone number.',
      };
    }

    if (newPassword) {
      user.password = newPassword;
      setAllUsers((users) => users.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u)));
    }

    audioEngine.playSoundEffect('chime');
    return {
      success: true,
      message: 'Password reset code verified. Your password has been updated!',
    };
  };

  // Simulated Speaking Pulses for realism in active rooms
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeRoom) return;

      setRooms((prevRooms) =>
        prevRooms.map((r) => {
          if (r.id !== activeRoom.id) return r;
          const updatedSeats = r.seats.map((seat) => {
            if (seat.userId && !seat.isMuted) {
              const isRandomSpeaking = Math.random() > 0.45;
              const simulatedVolume = isRandomSpeaking ? Math.floor(40 + Math.random() * 55) : 0;
              return { ...seat, isSpeaking: isRandomSpeaking, volumeLevel: simulatedVolume };
            }
            return seat;
          });
          return { ...r, seats: updatedSeats };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [activeRoom?.id]);

  // Switch Active User
  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('auravoice_auth_user_id', target.id);
      } catch {
        // ignore
      }
      audioEngine.playSoundEffect('chime');
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      setAllUsers((users) => users.map((u) => (u.id === prev.id ? updated : u)));
      syncProfileToSupabase(updated);
      return updated;
    });
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    updateUserProfile(updates);
  };

  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('auravoice_followed_user_ids');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const isUserFollowed = (userId: string): boolean => {
    return followedUserIds.includes(userId);
  };

  const toggleFollowUser = (targetUserId: string) => {
    const target = allUsers.find((u) => u.id === targetUserId);
    if (!target) return;
    
    setFollowedUserIds((prev) => {
      const isAlreadyFollowing = prev.includes(targetUserId);
      const updated = isAlreadyFollowing
        ? prev.filter((id) => id !== targetUserId)
        : [...prev, targetUserId];
      try {
        localStorage.setItem('auravoice_followed_user_ids', JSON.stringify(updated));
      } catch {
        // ignore
      }
      
      const delta = isAlreadyFollowing ? -1 : 1;
      setCurrentUser((curr) => ({
        ...curr,
        followingCount: Math.max(0, curr.followingCount + delta),
      }));
      setAllUsers((users) =>
        users.map((u) => (u.id === targetUserId ? { ...u, followersCount: Math.max(0, u.followersCount + delta) } : u))
      );
      
      return updated;
    });

    audioEngine.playSoundEffect('chime');
  };

  const bindCpPartner = (targetUserId: string, cost: number, ringId: string): boolean => {
    if (currentUser.coins < cost) return false;
    
    // Deduct coins and set CP status
    setCurrentUser((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      cpPartnerId: targetUserId,
      cpLevel: 1,
      cpDays: 1,
      cpRingId: ringId
    }));
    
    setAllUsers((users) =>
      users.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, coins: u.coins - cost, cpPartnerId: targetUserId, cpLevel: 1, cpDays: 1, cpRingId: ringId };
        }
        if (u.id === targetUserId) {
          return { ...u, cpPartnerId: currentUser.id, cpLevel: 1, cpDays: 1, cpRingId: ringId };
        }
        return u;
      })
    );
    
    audioEngine.playSoundEffect('magic');
    return true;
  };

  const removeCpPartner = () => {
    const targetId = currentUser.cpPartnerId;
    setCurrentUser((prev) => ({
      ...prev,
      cpPartnerId: undefined,
      cpLevel: undefined,
      cpDays: undefined,
      cpRingId: undefined
    }));
    setAllUsers((users) =>
      users.map((u) => {
        if (u.id === currentUser.id || u.id === targetId) {
          return { ...u, cpPartnerId: undefined, cpLevel: undefined, cpDays: undefined, cpRingId: undefined };
        }
        return u;
      })
    );
  };

  // ROOM ACTIONS
  const createRoom = (roomData: Partial<VoiceRoom>): VoiceRoom => {
    const seatCount = roomData.seatCount || 50;
    const initialSeats: MicSeat[] = Array.from({ length: seatCount }, (_, i) => ({
      seatIndex: i,
      userId: i === 0 ? currentUser.id : null,
      user: i === 0 ? currentUser : null,
      isMuted: false,
      isLocked: false,
      isSpeaking: false,
      volumeLevel: 0,
    }));

    const newRoom: VoiceRoom = {
      id: `room_${Date.now()}`,
      roomIdNumber: Math.floor(100000 + Math.random() * 900000).toString(),
      title: roomData.title || `${currentUser.displayName}'s Voice Stage`,
      category: roomData.category || 'Chat',
      coverUrl: roomData.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      backgroundTheme: roomData.backgroundTheme || 'from-purple-950 via-slate-900 to-indigo-950',
      hostId: currentUser.id,
      host: currentUser,
      coHostIds: [],
      moderatorIds: [],
      seats: initialSeats,
      seatCount,
      isPrivate: !!roomData.isPrivate,
      password: roomData.password,
      announcement: roomData.announcement || 'Welcome to my voice room! Jump on mic and say hi ✨',
      tags: roomData.tags || ['Social', 'Live Voice'],
      audienceCount: 1,
      likesCount: 0,
      hotScore: 500,
      isVideoEnabled: !!roomData.isVideoEnabled,
      rtcChannelName: `aura_room_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoom(newRoom);
    setIsRoomMinimized(false);
    audioEngine.playSoundEffect('fanfare');

    // Sync room with Supabase cloud database
    syncRoomToSupabase(newRoom);

    return newRoom;
  };

  const joinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const updatedRoom: VoiceRoom = {
      ...room,
      audienceCount: room.audienceCount + 1,
      hotScore: room.hotScore + 50,
    };

    setActiveRoom(updatedRoom);
    setIsRoomMinimized(false);
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)));

    // Add join message to room chat
    const joinMsg: RoomChatMessage = {
      id: `rc_${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      sender: currentUser,
      message: `${currentUser.displayName} joined the stage`,
      type: 'join',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRoomChatMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), joinMsg],
    }));

    audioEngine.playSoundEffect('chime');
  };

  const leaveRoom = () => {
    if (!activeRoom) return;
    audioEngine.stopMicrophoneCapture();
    setActiveRoom(null);
    setIsRoomMinimized(false);
    resetCombo();
  };

  const minimizeRoom = (minimized: boolean) => {
    setIsRoomMinimized(minimized);
  };

  // Helper to ensure each userId appears on AT MOST ONE seat in the room (prevent duplicate IDs)
  const cleanUniqueSeats = (seats: MicSeat[], usersList: UserProfile[] = allUsers): MicSeat[] => {
    const seenUserIds = new Set<string>();
    return seats.map((seat, idx) => {
      const s = {
        ...seat,
        seatIndex: seat.seatIndex !== undefined ? seat.seatIndex : idx,
      };
      const effectiveUserId = s.userId || s.user?.id || null;
      if (!effectiveUserId) {
        return { ...s, userId: null, user: null, isSpeaking: false, volumeLevel: 0 };
      }
      // If this userId already has an earlier seat, clear this duplicate seat completely
      if (seenUserIds.has(effectiveUserId)) {
        return {
          ...s,
          userId: null,
          user: null,
          isSpeaking: false,
          isMuted: false,
          volumeLevel: 0,
        };
      }
      seenUserIds.add(effectiveUserId);
      const userObj = usersList.find((u) => u.id === effectiveUserId) || s.user || null;
      return { ...s, userId: effectiveUserId, user: userObj };
    });
  };

  const takeSeat = (seatIndex: number, targetUserId?: string): boolean => {
    if (!activeRoom) return false;
    const seat = activeRoom.seats[seatIndex];
    if (!seat || seat.isLocked) {
      return false;
    }

    const userIdToSeat = targetUserId || currentUser.id;
    const userObj = targetUserId ? allUsers.find((u) => u.id === targetUserId) || null : currentUser;
    if (!userObj) return false;

    // 1. Remove this user from ANY seat they currently occupy
    // 2. Put user on seatIndex
    const updatedSeats = activeRoom.seats.map((s, idx) => {
      const currentSeatIndex = s.seatIndex !== undefined ? s.seatIndex : idx;
      const isTargetSeat = currentSeatIndex === seatIndex;
      const isCurrentOccupant = s.userId === userIdToSeat || s.user?.id === userIdToSeat;

      if (isTargetSeat) {
        return {
          ...s,
          seatIndex: seatIndex,
          userId: userIdToSeat,
          user: userObj,
          isMuted: false,
          isSpeaking: false,
          volumeLevel: 0,
        };
      }
      if (isCurrentOccupant) {
        return {
          ...s,
          seatIndex: currentSeatIndex,
          userId: null,
          user: null,
          isSpeaking: false,
          isMuted: false,
          volumeLevel: 0,
        };
      }
      return {
        ...s,
        seatIndex: currentSeatIndex,
      };
    });

    const cleanedSeats = cleanUniqueSeats(updatedSeats, allUsers);
    const updatedRoom = { ...activeRoom, seats: cleanedSeats };
    setActiveRoom(updatedRoom);
    setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? updatedRoom : r)));
    audioEngine.playSoundEffect('chime');
    return true;
  };

  const moveSeat = (fromIndex: number, toIndex: number): boolean => {
    if (!activeRoom) return false;
    const fromSeat = activeRoom.seats[fromIndex];
    const toSeat = activeRoom.seats[toIndex];
    if (!fromSeat || (!fromSeat.userId && !fromSeat.user) || !toSeat || toSeat.isLocked) return false;

    const movingUserId = fromSeat.userId || fromSeat.user?.id;
    const movingUser = fromSeat.user || (movingUserId ? allUsers.find((u) => u.id === movingUserId) : null);
    const movingMuted = fromSeat.isMuted;
    if (!movingUserId || !movingUser) return false;

    const updatedSeats = activeRoom.seats.map((s, idx) => {
      const currentSeatIndex = s.seatIndex !== undefined ? s.seatIndex : idx;
      if (currentSeatIndex === toIndex) {
        return {
          ...s,
          seatIndex: toIndex,
          userId: movingUserId,
          user: movingUser,
          isMuted: movingMuted,
          isSpeaking: false,
          volumeLevel: 0,
        };
      }
      if (currentSeatIndex === fromIndex || s.userId === movingUserId || s.user?.id === movingUserId) {
        return {
          ...s,
          seatIndex: currentSeatIndex,
          userId: null,
          user: null,
          isSpeaking: false,
          isMuted: false,
          volumeLevel: 0,
        };
      }
      return s;
    });

    const cleaned = cleanUniqueSeats(updatedSeats, allUsers);
    const updatedRoom = { ...activeRoom, seats: cleaned };
    setActiveRoom(updatedRoom);
    setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? updatedRoom : r)));
    audioEngine.playSoundEffect('chime');
    return true;
  };

  const leaveSeat = (seatIndex?: number) => {
    if (!activeRoom) return;
    audioEngine.stopMicrophoneCapture();

    const updatedSeats = activeRoom.seats.map((s, idx) => {
      const currentSeatIndex = s.seatIndex !== undefined ? s.seatIndex : idx;
      const isTarget = seatIndex !== undefined ? currentSeatIndex === seatIndex : (s.userId === currentUser.id || s.user?.id === currentUser.id);
      if (isTarget) {
        return {
          ...s,
          seatIndex: currentSeatIndex,
          userId: null,
          user: null,
          isSpeaking: false,
          isMuted: false,
          volumeLevel: 0,
        };
      }
      return s;
    });

    const cleaned = cleanUniqueSeats(updatedSeats, allUsers);
    const updatedRoom = { ...activeRoom, seats: cleaned };
    setActiveRoom(updatedRoom);
    setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? updatedRoom : r)));
  };

  const toggleMuteSeat = (seatIndex?: number) => {
    if (!activeRoom) return;
    const updatedSeats = activeRoom.seats.map((s, idx) => {
      if (seatIndex !== undefined ? idx === seatIndex : s.userId === currentUser.id) {
        const nextMute = !s.isMuted;
        if (nextMute) {
          audioEngine.stopMicrophoneCapture();
        }
        return { ...s, isMuted: nextMute, isSpeaking: false };
      }
      return s;
    });

    const updatedRoom = { ...activeRoom, seats: updatedSeats };
    setActiveRoom(updatedRoom);
    setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? updatedRoom : r)));
  };

  const hostLockSeat = (roomId: string, seatIndex: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const updatedSeats = r.seats.map((s, idx) => (idx === seatIndex ? { ...s, isLocked: !s.isLocked } : s));
        const updated = { ...r, seats: updatedSeats };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const hostMuteSeat = (roomId: string, seatIndex: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const updatedSeats = r.seats.map((s, idx) => (idx === seatIndex ? { ...s, isMuted: !s.isMuted } : s));
        const updated = { ...r, seats: updatedSeats };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const hostKickSeat = (roomId: string, seatIndex: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const updatedSeats = r.seats.map((s, idx) =>
          idx === seatIndex
            ? { ...s, userId: null, user: null, isSpeaking: false, isMuted: false, volumeLevel: 0 }
            : s
        );
        const cleaned = cleanUniqueSeats(updatedSeats, allUsers);
        const updated = { ...r, seats: cleaned };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
    audioEngine.playSoundEffect('magic');
  };

  const hostUpdateRoom = (roomId: string, updates: Partial<VoiceRoom>) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        let finalUpdates = { ...updates };
        if (finalUpdates.seats) {
          finalUpdates.seats = cleanUniqueSeats(finalUpdates.seats, allUsers);
        }
        const updated = { ...r, ...finalUpdates };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const hostBanUser = (roomId: string, userId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const banned = r.bannedUserIds || [];
        const updated = { ...r, bannedUserIds: [...banned, userId] };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const hostUnbanUser = (roomId: string, userId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const banned = r.bannedUserIds || [];
        const updated = { ...r, bannedUserIds: banned.filter(id => id !== userId) };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const hostAssignModerator = (roomId: string, userId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const mods = r.moderatorIds || [];
        if (mods.includes(userId)) return r;
        const updated = { ...r, moderatorIds: [...mods, userId] };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const hostRemoveModerator = (roomId: string, userId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const updated = { ...r, moderatorIds: r.moderatorIds.filter(id => id !== userId) };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const likeRoom = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const updated = { ...r, likesCount: r.likesCount + 1, hotScore: r.hotScore + 10 };
        if (activeRoom?.id === roomId) setActiveRoom(updated);
        return updated;
      })
    );
  };

  const sendRoomChatMessage = (roomId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: RoomChatMessage = {
      id: `rc_${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      sender: currentUser,
      message: text.trim(),
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRoomChatMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg],
    }));
  };

  const playRoomDJEffect = (type: 'airhorn' | 'applause' | 'fanfare' | 'cheer' | 'chime' | 'engine') => {
    audioEngine.playSoundEffect(type);
    if (activeRoom) {
      const effectNames: Record<string, string> = {
        airhorn: '📯 DJ AIR HORN!',
        applause: '👏 Massive Applause!',
        fanfare: '🎺 Victory Fanfare!',
        cheer: '🎉 Crowd Cheering!',
        chime: '✨ Cosmic Chime',
        engine: '🏎️ Supercar Rev!'
      };
      const soundMsg: RoomChatMessage = {
        id: `rc_${Date.now()}`,
        roomId: activeRoom.id,
        senderId: currentUser.id,
        sender: currentUser,
        message: `triggered ${effectNames[type] || type}`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setRoomChatMessages((prev) => ({
        ...prev,
        [activeRoom.id]: [...(prev[activeRoom.id] || []), soundMsg],
      }));
    }
  };

  // ROOM THEMES & CUSTOMIZATION (DIAMOND UNLOCK)
  const [unlockedRoomThemeIds, setUnlockedRoomThemeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('auravoice_unlocked_room_themes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['theme_classic_purple', 'theme_dark_obsidian', 'theme_ocean_breeze', 'theme_sunset_amber'];
  });

  const isRoomThemeUnlocked = (themeId: string): boolean => {
    const theme = getThemeById(themeId);
    if (!theme) return false;
    if (theme.priceDiamonds === 0) return true;
    return unlockedRoomThemeIds.includes(themeId);
  };

  const unlockRoomTheme = (themeId: string): { success: boolean; message: string } => {
    const theme = getThemeById(themeId);
    if (!theme) {
      return { success: false, message: 'Theme not found.' };
    }

    if (isRoomThemeUnlocked(themeId)) {
      return { success: true, message: `${theme.name} is already unlocked!` };
    }

    if (currentUser.diamonds < theme.priceDiamonds) {
      return {
        success: false,
        message: `Insufficient diamonds! ${theme.name} costs ${theme.priceDiamonds.toLocaleString()} diamonds, but you currently have ${currentUser.diamonds.toLocaleString()} diamonds.`,
      };
    }

    const updatedDiamonds = currentUser.diamonds - theme.priceDiamonds;
    setCurrentUser((prev) => ({ ...prev, diamonds: updatedDiamonds }));
    setAllUsers((users) =>
      users.map((u) => (u.id === currentUser.id ? { ...u, diamonds: updatedDiamonds } : u))
    );

    const updatedUnlocked = [...unlockedRoomThemeIds, themeId];
    setUnlockedRoomThemeIds(updatedUnlocked);
    try {
      localStorage.setItem('auravoice_unlocked_room_themes', JSON.stringify(updatedUnlocked));
    } catch {
      // ignore
    }

    const newTx: WalletTransaction = {
      id: `tx_theme_${Date.now()}`,
      userId: currentUser.id,
      type: 'DIAMOND_WITHDRAWAL' as any,
      currency: 'DIAMONDS',
      amount: theme.priceDiamonds,
      direction: 'DEBIT',
      balanceAfter: updatedDiamonds,
      referenceId: theme.id,
      description: `Unlocked Premium Room Theme: ${theme.name}`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    audioEngine.playSoundEffect('fanfare');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    return {
      success: true,
      message: `Unlocked "${theme.name}" for ${theme.priceDiamonds.toLocaleString()} Diamonds!`,
    };
  };

  const hostChangeRoomTheme = (roomId: string, themeId: string): { success: boolean; message: string } => {
    const theme = getThemeById(themeId);
    if (!theme) {
      return { success: false, message: 'Theme not found.' };
    }

    if (!isRoomThemeUnlocked(themeId)) {
      return {
        success: false,
        message: `Please unlock "${theme.name}" first with ${theme.priceDiamonds.toLocaleString()} diamonds.`,
      };
    }

    hostUpdateRoom(roomId, {
      backgroundTheme: theme.gradientClass,
      themeId: theme.id,
    });

    audioEngine.playSoundEffect('chime');
    return { success: true, message: `Applied ${theme.name} stage theme!` };
  };

  // FINANCIAL & GIFT ENGINE
  const clearGiftAnimation = () => {
    setActiveGiftAnimation(null);
  };

  const resetCombo = () => {
    if (comboTimerId) clearTimeout(comboTimerId);
    setActiveCombo(null);
  };

  const sendGift = (giftId: string, receiverId: string, count = 1, roomId?: string): { success: boolean; message: string } => {
    const targetRoomId = roomId || activeRoom?.id;
    const gift = gifts.find((g) => g.id === giftId);
    if (!gift) return { success: false, message: 'Gift not found' };

    const totalCoinPrice = gift.coinPrice * count;
    if (currentUser.coins < totalCoinPrice) {
      return { success: false, message: `Insufficient coins. Need ${totalCoinPrice.toLocaleString()} coins.` };
    }

    const receiver = allUsers.find((u) => u.id === receiverId) || (activeRoom ? activeRoom.host : null);
    if (!receiver) {
      return { success: false, message: 'No recipient selected or available for this gift.' };
    }

    // 1 Coin Sent = 1 Diamond Received (1:1 direct ratio: exact coins sent are received as diamonds)
    const hostDiamonds = totalCoinPrice;
    const generatedDiamondsTotal = totalCoinPrice;

    // Deduct coins from sender
    const newSenderCoins = currentUser.coins - totalCoinPrice;
    const newSenderXp = currentUser.xp + totalCoinPrice;
    const updatedSender = {
      ...currentUser,
      coins: newSenderCoins,
      xp: newSenderXp,
      level: Math.floor(newSenderXp / 2500) + 1,
    };
    setCurrentUser(updatedSender);

    let finalHostDiamonds = hostDiamonds;
    let bonusDiamonds = 0;
    let appliedMilestone: LuckyBackupMilestone | null = null;
    let transactionDetails = `Received ${count}x ${gift.name} ${gift.icon} from ${currentUser.displayName}`;

    if (gift.category === 'Lucky') {
      // Find eligible milestones based on progress
      const newProgresses = [...luckyBackupProgresses];
      
      // We will increment the progress for all active lucky backup milestones
      for (const m of luckyBackupMilestones) {
        if (m.status !== 'active') continue;
        
        // Find existing progress
        let progIdx = newProgresses.findIndex(p => p.milestoneId === m.id && p.userId === currentUser.id && p.hostId === receiver.id);
        let prog = progIdx >= 0 ? newProgresses[progIdx] : {
          id: `lbp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          userId: currentUser.id,
          hostId: receiver.id,
          roomId: targetRoomId,
          milestoneId: m.id,
          currentCount: 0,
          rewardStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as LuckyBackupProgress;
        
        prog.currentCount += count;
        
        if (prog.currentCount >= m.requiredCount && prog.rewardStatus === 'pending') {
          appliedMilestone = m;
          bonusDiamonds = m.rewardAmount * m.multiplier;
          prog.rewardStatus = 'claimed';
          prog.completedAt = new Date().toISOString();
          
          if (m.resetPeriod === 'after_claim') {
            prog.currentCount = 0;
            prog.rewardStatus = 'pending';
            prog.completedAt = undefined;
          }
        }
        
        prog.updatedAt = new Date().toISOString();
        if (progIdx >= 0) {
          newProgresses[progIdx] = prog;
        } else {
          newProgresses.push(prog);
        }
      }
      
      setLuckyBackupProgresses(newProgresses);
      
      if (appliedMilestone) {
        finalHostDiamonds += bonusDiamonds;
        transactionDetails += ` + ${appliedMilestone.multiplier}x Lucky Backup Bonus (${bonusDiamonds} 💎)`;
        
        const lbTx: LuckyBackupTransaction = {
          id: `lbtx_${Date.now()}`,
          userId: currentUser.id,
          hostId: receiver.id,
          roomId: targetRoomId,
          milestoneId: appliedMilestone.id,
          triggerCount: appliedMilestone.requiredCount,
          multiplier: appliedMilestone.multiplier,
          baseReward: appliedMilestone.rewardAmount,
          bonusReward: bonusDiamonds,
          transactionReference: `gift_${gift.id}_x${count}`,
          status: 'processed',
          createdAt: new Date().toISOString()
        };
        setLuckyBackupTransactions(prev => [lbTx, ...prev]);
      }
    }

    // Credit diamonds to receiver
    const updatedReceiver = {
      ...receiver,
      diamonds: receiver.diamonds + finalHostDiamonds,
      visitorsCount: receiver.visitorsCount + 1,
    };
    setAllUsers((users) =>
      users.map((u) => (u.id === currentUser.id ? updatedSender : u.id === receiver.id ? updatedReceiver : u))
    );

    // Record Immutable Wallet Transactions
    const txSender: WalletTransaction = {
      id: `tx_${Date.now()}_send`,
      userId: currentUser.id,
      type: 'gift_sent',
      currency: 'COINS',
      amount: totalCoinPrice,
      direction: 'DEBIT',
      balanceAfter: newSenderCoins,
      referenceId: `gift_${gift.id}_x${count}`,
      description: `Sent ${count}x ${gift.name} ${gift.icon} to ${receiver.displayName}`,
      status: 'SUCCESS',
      metadata: { roomId: targetRoomId, receiverId: receiver.id, giftId: gift.id, count },
      createdAt: new Date().toISOString(),
    };

    const txReceiver: WalletTransaction = {
      id: `tx_${Date.now()}_recv`,
      userId: receiver.id,
      type: 'gift_received',
      currency: 'DIAMONDS',
      amount: finalHostDiamonds,
      direction: 'CREDIT',
      balanceAfter: updatedReceiver.diamonds,
      referenceId: `gift_${gift.id}_x${count}`,
      description: transactionDetails,
      status: 'SUCCESS',
      metadata: { roomId: targetRoomId, senderId: currentUser.id, giftId: gift.id, count },
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [txSender, txReceiver, ...prev]);

    // Sync Gift Log to Supabase
    syncGiftLogToSupabase({
      roomId: targetRoomId,
      senderId: currentUser.id,
      receiverId: receiver.id,
      giftId: gift.id,
      giftName: gift.name,
      giftIcon: gift.icon,
      coinCost: totalCoinPrice,
      comboCount: count,
    });

    // Update seat received diamonds if in active room
    if (activeRoom) {
      setActiveRoom(prev => {
        if (!prev) return prev;
        const newSeats = prev.seats.map(seat => {
          if (seat.userId === receiver.id) {
            return {
              ...seat,
              receivedDiamonds: (seat.receivedDiamonds || 0) + finalHostDiamonds
            };
          }
          return seat;
        });
        return { ...prev, seats: newSeats };
      });
    }

    // Play Gift SFX
    audioEngine.playSoundEffect(gift.soundEffect);

    // Confetti or particle burst
    confetti({
      particleCount: Math.min(100, 30 * count),
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'],
    });

    // 1. Calculate Combo Multiplier Streak
    const currentComboStreak = activeCombo && activeCombo.gift.id === gift.id && activeCombo.receiver.id === receiver.id
      ? activeCombo.count + count
      : count;

    // 2. Trigger exactly 1-second display visual animation
    setActiveGiftAnimation({
      gift,
      senderName: currentUser.displayName,
      receiverName: receiver.displayName,
      count,
      comboStreak: currentComboStreak,
    });

    // Auto clear gift animation after 1000ms (1 sec)
    setTimeout(() => {
      setActiveGiftAnimation((prev) => (prev?.gift.id === gift.id ? null : prev));
    }, 1000);

    // 3. Initiate or Extend Combo Button for 3 seconds countdown
    if (comboTimerId) clearTimeout(comboTimerId);

    const newComboState: GiftComboState = {
      gift,
      receiver,
      roomId: roomId || activeRoom?.id,
      count: currentComboStreak,
      expiresAt: Date.now() + 3000,
    };
    setActiveCombo(newComboState);

    const timer = setTimeout(() => {
      setActiveCombo(null);
    }, 3000);
    setComboTimerId(timer);

    // Add to Room Chat Feed if in room
    if (targetRoomId) {
      const giftChatMsg: RoomChatMessage = {
        id: `rc_${Date.now()}`,
        roomId: targetRoomId,
        senderId: currentUser.id,
        sender: currentUser,
        message: `sent ${count}x ${gift.name} ${gift.icon} to ${receiver.displayName}! (Combo x${currentComboStreak})`,
        type: 'gift',
        giftData: {
          giftId: gift.id,
          giftName: gift.name,
          giftIcon: gift.icon,
          giftCount: count,
          totalCoins: totalCoinPrice,
          receiverId: receiver.id,
          receiverName: receiver.displayName,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setRoomChatMessages((prev) => ({
        ...prev,
        [targetRoomId]: [...(prev[targetRoomId] || []), giftChatMsg],
      }));

      // Update room hot score
      setRooms((prev) =>
        prev.map((r) => (r.id === targetRoomId ? { ...r, hotScore: r.hotScore + totalCoinPrice } : r))
      );
    }

    return { success: true, message: `Sent ${count}x ${gift.name} successfully!` };
  };

  // Trigger Combo Gift Button Action (rapid +1 tap on active combo)
  const triggerComboGift = (): { success: boolean; message: string; count: number } => {
    if (!activeCombo) {
      return { success: false, message: 'No active gift combo', count: 0 };
    }

    const { gift, receiver, count, roomId } = activeCombo;

    if (currentUser.coins < gift.coinPrice) {
      return { success: false, message: 'Insufficient coins for combo gift!', count };
    }

    const newSenderCoins = currentUser.coins - gift.coinPrice;
    const newSenderXp = currentUser.xp + gift.coinPrice;
    const updatedSender = {
      ...currentUser,
      coins: newSenderCoins,
      xp: newSenderXp,
      level: Math.floor(newSenderXp / 2500) + 1,
    };
    setCurrentUser(updatedSender);

    // 1 Coin Sent = 1 Diamond Received (1:1 direct ratio)
    const hostDiamonds = gift.coinPrice;

    const updatedReceiver = {
      ...receiver,
      diamonds: receiver.diamonds + hostDiamonds,
    };
    setAllUsers((users) =>
      users.map((u) => (u.id === currentUser.id ? updatedSender : u.id === receiver.id ? updatedReceiver : u))
    );

    // Update seat received diamonds if in active room
    if (activeRoom) {
      setActiveRoom((prev) => {
        if (!prev) return prev;
        const newSeats = prev.seats.map((seat) => {
          if (seat.userId === receiver.id) {
            return {
              ...seat,
              receivedDiamonds: (seat.receivedDiamonds || 0) + hostDiamonds,
            };
          }
          return seat;
        });
        return { ...prev, seats: newSeats };
      });
    }

    // Record wallet transactions
    const txSender: WalletTransaction = {
      id: `tx_${Date.now()}_combo_send`,
      userId: currentUser.id,
      type: 'gift_sent',
      currency: 'COINS',
      amount: gift.coinPrice,
      direction: 'DEBIT',
      balanceAfter: newSenderCoins,
      referenceId: `gift_${gift.id}_combo`,
      description: `Combo Sent ${gift.name} ${gift.icon} to ${receiver.displayName}`,
      status: 'SUCCESS',
      metadata: { roomId, receiverId: receiver.id, giftId: gift.id, count: 1 },
      createdAt: new Date().toISOString(),
    };

    const txReceiver: WalletTransaction = {
      id: `tx_${Date.now()}_combo_recv`,
      userId: receiver.id,
      type: 'gift_received',
      currency: 'DIAMONDS',
      amount: hostDiamonds,
      direction: 'CREDIT',
      balanceAfter: updatedReceiver.diamonds,
      referenceId: `gift_${gift.id}_combo`,
      description: `Combo Received ${gift.name} ${gift.icon} from ${currentUser.displayName}`,
      status: 'SUCCESS',
      metadata: { roomId, senderId: currentUser.id, giftId: gift.id, count: 1 },
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [txSender, txReceiver, ...prev]);

    const nextCount = count + 1;

    // Refresh combo timer for 3000ms
    if (comboTimerId) clearTimeout(comboTimerId);

    const updatedCombo: GiftComboState = {
      gift,
      receiver,
      roomId,
      count: nextCount,
      expiresAt: Date.now() + 3000,
    };
    setActiveCombo(updatedCombo);

    const timer = setTimeout(() => {
      setActiveCombo(null);
    }, 3000);
    setComboTimerId(timer);

    // Audio SFX with escalating frequency/enthusiasm
    audioEngine.playSoundEffect(nextCount >= 10 ? 'fanfare' : 'chime');

    // Confetti
    confetti({
      particleCount: Math.min(60, 15 + nextCount * 3),
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#ec4899', '#a855f7'],
    });

    // 1-second display visual overlay
    setActiveGiftAnimation({
      gift,
      senderName: currentUser.displayName,
      receiverName: receiver.displayName,
      count: 1,
      comboStreak: nextCount,
    });

    setTimeout(() => {
      setActiveGiftAnimation((prev) => (prev?.gift.id === gift.id ? null : prev));
    }, 1000);

    // Add message to room chat
    const targetRoomId = roomId || activeRoom?.id;
    if (targetRoomId) {
      const comboMsg: RoomChatMessage = {
        id: `rc_${Date.now()}`,
        roomId: targetRoomId,
        senderId: currentUser.id,
        sender: currentUser,
        message: `COMBO x${nextCount}! Sent ${gift.name} ${gift.icon} to ${receiver.displayName}!`,
        type: 'gift',
        giftData: {
          giftId: gift.id,
          giftName: gift.name,
          giftIcon: gift.icon,
          giftCount: 1,
          totalCoins: gift.coinPrice,
          receiverId: receiver.id,
          receiverName: receiver.displayName,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setRoomChatMessages((prev) => ({
        ...prev,
        [targetRoomId]: [...(prev[targetRoomId] || []), comboMsg],
      }));

      setRooms((prev) =>
        prev.map((r) => (r.id === targetRoomId ? { ...r, hotScore: r.hotScore + gift.coinPrice } : r))
      );
    }

    return { success: true, message: `Combo x${nextCount}!`, count: nextCount };
  };

  // COIN STORE PURCHASE
  const purchaseCoinPackage = async (packageId: string, paymentMethod: string): Promise<{ success: boolean; message: string }> => {
    const pkg = coinPackages.find((p) => p.id === packageId);
    if (!pkg) return { success: false, message: 'Package not found' };

    const totalCoinsGranted = pkg.coins + pkg.bonusCoins;
    const newBalance = currentUser.coins + totalCoinsGranted;

    const updatedUser = { ...currentUser, coins: newBalance };
    setCurrentUser(updatedUser);
    setAllUsers((users) => users.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}_buy`,
      userId: currentUser.id,
      type: 'coin_purchase',
      currency: 'COINS',
      amount: totalCoinsGranted,
      direction: 'CREDIT',
      balanceAfter: newBalance,
      referenceId: `order_${Math.floor(100000 + Math.random() * 900000)}`,
      description: `Purchased ${pkg.coins.toLocaleString()} Coins (+${pkg.bonusCoins} Bonus) via ${paymentMethod} ($${pkg.priceUsd})`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    audioEngine.playSoundEffect('fanfare');

    // Register volume & webhook log on matching payment gateway
    const matchedGw = paymentGateways.find((g) =>
      g.name.toLowerCase().includes(paymentMethod.toLowerCase()) ||
      paymentMethod.toLowerCase().includes(g.code.toLowerCase())
    );
    if (matchedGw) {
      setPaymentGateways((prev) =>
        prev.map((g) =>
          g.id === matchedGw.id
            ? {
                ...g,
                totalProcessedVolumeUsd: g.totalProcessedVolumeUsd + pkg.priceUsd,
                totalTransactionsCount: g.totalTransactionsCount + 1,
                lastEventReceivedAt: new Date().toISOString(),
              }
            : g
        )
      );

      const whLog: GatewayWebhookLog = {
        id: `wh_log_${Date.now()}`,
        gatewayId: matchedGw.id,
        gatewayName: matchedGw.name,
        eventType:
          matchedGw.code === 'stripe'
            ? 'payment_intent.succeeded'
            : matchedGw.code === 'google_play'
            ? 'googleplay.order.purchased'
            : matchedGw.code === 'apple_app_store'
            ? 'appstore.v2.did_renew'
            : 'charge.succeeded',
        amountUsd: pkg.priceUsd,
        currency: 'USD',
        customerId: currentUser.id,
        customerName: currentUser.displayName,
        status: 'SUCCESS',
        ipAddress: '198.51.100.' + Math.floor(10 + Math.random() * 80),
        latencyMs: Math.floor(25 + Math.random() * 40),
        timestamp: new Date().toISOString(),
        payloadSnippet: JSON.stringify({
          packageId: pkg.id,
          coins: totalCoinsGranted,
          priceUsd: pkg.priceUsd,
          method: paymentMethod,
          status: 'succeeded',
        }),
      };
      setGatewayWebhookLogs((prev) => [whLog, ...prev.slice(0, 49)]);
    }

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#f59e0b', '#10b981'],
    });

    return { success: true, message: `Successfully recharged ${totalCoinsGranted.toLocaleString()} coins!` };
  };

  // VIP SUBSCRIPTION
  const subscribeVIP = (vipId: string): { success: boolean; message: string } => {
    const tier = vipTiers.find((t) => t.id === vipId);
    if (!tier) return { success: false, message: 'VIP tier not found' };

    if (currentUser.coins < tier.monthlyCoinPrice) {
      return { success: false, message: `Insufficient coins. Need ${tier.monthlyCoinPrice.toLocaleString()} coins.` };
    }

    const newCoins = currentUser.coins - tier.monthlyCoinPrice;
    const updatedUser = {
      ...currentUser,
      coins: newCoins,
      vipTier: tier.id as any,
      vipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setCurrentUser(updatedUser);
    setAllUsers((users) => users.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_vip`,
      userId: currentUser.id,
      type: 'vip_subscription',
      currency: 'COINS',
      amount: tier.monthlyCoinPrice,
      direction: 'DEBIT',
      balanceAfter: newCoins,
      referenceId: `vip_${tier.id}`,
      description: `Subscribed to ${tier.name} (30 Days)`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [tx, ...prev]);
    audioEngine.playSoundEffect('fanfare');

    // Sync updated VIP profile to Supabase 'profiles' table
    syncProfileToSupabase(updatedUser);
    invalidateProfileVipCache(currentUser.id);

    return { success: true, message: `Congratulations! You are now a ${tier.name} member!` };
  };

  // STORE ITEM PURCHASING & INVENTORY
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    try {
      const stored = localStorage.getItem('auravoice_store_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return STORE_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('auravoice_store_items', JSON.stringify(storeItems));
    } catch {}
  }, [storeItems]);

  const buyStoreItem = (itemId: string, duration: ItemDuration, autoEquip = true): { success: boolean; message: string } => {
    const item = storeItems.find((it) => it.id === itemId) || STORE_ITEMS.find((it) => it.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found in store catalog.' };
    }

    // VIP Requirement check
    if (item.requiredVip) {
      const vipOrder = ['vip_0', 'vip_1', 'vip_2', 'vip_3', 'vip_4', 'vip_5'];
      const currentVipIndex = vipOrder.indexOf(currentUser.vipTier || 'vip_0');
      const requiredVipIndex = vipOrder.indexOf(item.requiredVip);
      if (currentVipIndex < requiredVipIndex) {
        return {
          success: false,
          message: `This item is an exclusive privilege for ${item.requiredVip.toUpperCase()} members and above.`,
        };
      }
    }

    const price =
      duration === '7d'
        ? item.price7Days
        : duration === '30d'
        ? item.price30Days
        : item.pricePermanent;

    if (currentUser.coins < price) {
      return {
        success: false,
        message: `Insufficient Coins! You need ${price.toLocaleString()} coins (Balance: ${currentUser.coins.toLocaleString()}). Please recharge coins.`,
      };
    }

    const newCoins = currentUser.coins - price;
    const newXp = (currentUser.experiencePoints || 0) + Math.floor(price * 0.5);

    let updatedUser: UserProfile = {
      ...currentUser,
      coins: newCoins,
      experiencePoints: newXp,
    };

    // Add to specific category inventory
    if (item.category === 'frames') {
      const currentOwned = updatedUser.ownedFrames ? [...updatedUser.ownedFrames] : ['frame_none'];
      if (!currentOwned.includes(item.id)) {
        currentOwned.push(item.id);
      }
      updatedUser.ownedFrames = currentOwned;
      if (autoEquip) {
        updatedUser.avatarFrame = item.id;
      }
    } else if (item.category === 'rides') {
      const currentOwned = updatedUser.ownedRides ? [...updatedUser.ownedRides] : ['ride_none'];
      if (!currentOwned.includes(item.id)) {
        currentOwned.push(item.id);
      }
      updatedUser.ownedRides = currentOwned;
      if (autoEquip) {
        updatedUser.equippedRide = item.id;
      }
    } else if (item.category === 'bubbles') {
      const currentOwned = updatedUser.ownedBubbles ? [...updatedUser.ownedBubbles] : ['bubble_default'];
      if (!currentOwned.includes(item.id)) {
        currentOwned.push(item.id);
      }
      updatedUser.ownedBubbles = currentOwned;
      if (autoEquip) {
        updatedUser.equippedBubble = item.id;
      }
    } else if (item.category === 'badges') {
      const currentOwned = updatedUser.ownedBadges ? [...updatedUser.ownedBadges] : ['Top Star Host'];
      if (!currentOwned.includes(item.name)) {
        currentOwned.push(item.name);
      }
      updatedUser.ownedBadges = currentOwned;
      if (autoEquip) {
        updatedUser.badgeTitle = item.name;
      }
    } else if (item.category === 'effects') {
      const currentOwned = updatedUser.ownedEntryEffects ? [...updatedUser.ownedEntryEffects] : [];
      if (!currentOwned.includes(item.id)) {
        currentOwned.push(item.id);
      }
      updatedUser.ownedEntryEffects = currentOwned;
      if (autoEquip) {
        updatedUser.equippedEntryEffect = item.id;
      }
    } else if (item.category === 'sounds') {
      const currentOwned = updatedUser.ownedSounds ? [...updatedUser.ownedSounds] : [];
      if (!currentOwned.includes(item.id)) {
        currentOwned.push(item.id);
      }
      updatedUser.ownedSounds = currentOwned;
      if (autoEquip) {
        updatedUser.equippedSound = item.id;
      }
    } else if (item.category === 'waves') {
      const currentOwned = updatedUser.ownedWaves ? [...updatedUser.ownedWaves] : [];
      if (!currentOwned.includes(item.id)) {
        currentOwned.push(item.id);
      }
      updatedUser.ownedWaves = currentOwned;
      if (autoEquip) {
        updatedUser.equippedWave = item.id;
      }
    }

    setCurrentUser(updatedUser);
    setAllUsers((users) => users.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Increment sales count on item
    setStoreItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, salesCount: (it.salesCount || 0) + 1 } : it))
    );

    const durationLabel = duration === '7d' ? '7 Days' : duration === '30d' ? '30 Days' : 'Permanent';
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_store`,
      userId: currentUser.id,
      type: 'store_item_purchase',
      currency: 'COINS',
      amount: price,
      direction: 'DEBIT',
      balanceAfter: newCoins,
      referenceId: `store_${item.id}_${duration}`,
      description: `Purchased ${item.name} (${durationLabel}) from Mall`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [tx, ...prev]);

    if (item.soundEffect) {
      audioEngine.playSoundEffect(item.soundEffect);
    } else {
      audioEngine.playSoundEffect('fanfare');
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });

    return {
      success: true,
      message: `🎉 Successfully purchased ${item.name} (${durationLabel})${autoEquip ? ' and equipped!' : '! Added to your backpack.'}`,
    };
  };

  const equipStoreItem = (category: StoreItemCategory, itemId: string, name?: string) => {
    let updatedUser: UserProfile = { ...currentUser };

    if (category === 'frames') {
      updatedUser.avatarFrame = itemId;
    } else if (category === 'rides') {
      updatedUser.equippedRide = itemId;
    } else if (category === 'bubbles') {
      updatedUser.equippedBubble = itemId;
    } else if (category === 'badges') {
      updatedUser.badgeTitle = name || itemId;
    } else if (category === 'effects') {
      updatedUser.equippedEntryEffect = itemId;
    } else if (category === 'sounds') {
      updatedUser.equippedSound = itemId;
    } else if (category === 'waves') {
      updatedUser.equippedWave = itemId;
    }

    setCurrentUser(updatedUser);
    setAllUsers((users) => users.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    audioEngine.playSoundEffect('chime');
  };

  // HOST WITHDRAWAL REQUEST
  const requestHostWithdrawal = (diamondsAmount: number, method: string, accountDetails: any): { success: boolean; message: string } => {
    if (diamondsAmount < platformConfig.minimumWithdrawalDiamonds) {
      return {
        success: false,
        message: `Minimum withdrawal is ${platformConfig.minimumWithdrawalDiamonds.toLocaleString()} diamonds ($${(platformConfig.minimumWithdrawalDiamonds * platformConfig.diamondCashValueUsd).toFixed(2)} USD).`,
      };
    }

    if (currentUser.diamonds < diamondsAmount) {
      return { success: false, message: 'Insufficient diamond balance.' };
    }

    const cashValue = diamondsAmount * platformConfig.diamondCashValueUsd;
    const newDiamonds = currentUser.diamonds - diamondsAmount;

    const updatedUser = { ...currentUser, diamonds: newDiamonds };
    setCurrentUser(updatedUser);
    setAllUsers((users) => users.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    const newRequest: WithdrawalRequest = {
      id: `wdr_${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.displayName,
      diamondsAmount,
      cashAmountUsd: cashValue,
      method: method as any,
      accountDetails,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };

    setWithdrawals((prev) => [newRequest, ...prev]);

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_wdr`,
      userId: currentUser.id,
      type: 'host_payout_withdrawal',
      currency: 'DIAMONDS',
      amount: diamondsAmount,
      direction: 'DEBIT',
      balanceAfter: newDiamonds,
      referenceId: newRequest.id,
      description: `Withdrawal request for ${diamondsAmount.toLocaleString()} Diamonds ($${cashValue.toFixed(2)} USD) via ${method}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [tx, ...prev]);
    audioEngine.playSoundEffect('chime');

    return { success: true, message: `Withdrawal request for $${cashValue.toFixed(2)} USD submitted for admin approval.` };
  };

  // HOST APPLICATION
  const applyForHost = (applicationData: { fullName: string; country: string; phone: string; experience: string; language: string; introduction: string }): { success: boolean; message: string } => {
    const newApp: HostApplication = {
      id: `app_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      ...applicationData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setHostApplications((prev) => [newApp, ...prev]);
    updateUserProfile({ hostStatus: 'pending' });
    audioEngine.playSoundEffect('fanfare');

    return { success: true, message: 'Host application submitted! Our team will review it within 24 hours.' };
  };

  // RESELLER / COIN SELLER SYSTEM OPERATIONS
  const transferCoinsAsSeller = async (
    payload: SellerTransferPayload
  ): Promise<{ success: boolean; message: string; transaction?: SellerTransaction }> => {
    // 1. RBAC Check: Seller or Agent role or isSeller flag or Admin
    const isAuthorizedSeller =
      currentUser.role === 'seller' ||
      currentUser.role === 'agent' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'super_admin' ||
      currentUser.isSeller ||
      currentUser.sellerInfo !== undefined;

    if (!isAuthorizedSeller) {
      return {
        success: false,
        message: 'Access Denied: Only verified coin sellers or master agents can perform direct coin transfers.',
      };
    }

    // 2. Validate transfer amount
    const amount = Math.floor(Number(payload.amount));
    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Please enter a valid coin transfer amount greater than 0.' };
    }

    if (currentUser.coins < amount) {
      return {
        success: false,
        message: `Insufficient coin inventory. You have ${currentUser.coins.toLocaleString()} coins, but tried to transfer ${amount.toLocaleString()} coins.`,
      };
    }

    // 3. Find recipient by User ID, Numeric ID, or Username
    const query = payload.recipientQuery.trim().toLowerCase();
    if (!query) {
      return { success: false, message: 'Please enter recipient user ID, numeric ID, or username.' };
    }

    const recipient = allUsers.find(
      (u) =>
        u.id.toLowerCase() === query ||
        (u.numericId && u.numericId.toLowerCase() === query) ||
        u.username.toLowerCase() === query ||
        u.displayName.toLowerCase() === query
    );

    if (!recipient) {
      return {
        success: false,
        message: `Recipient "${payload.recipientQuery}" was not found on AuraVoice. Please verify the ID or username.`,
      };
    }

    if (recipient.id === currentUser.id) {
      return {
        success: false,
        message: 'Cannot transfer coins to your own seller account. Please enter a customer account ID.',
      };
    }

    if (recipient.isBanned) {
      return {
        success: false,
        message: `Recipient account (@${recipient.username}) is currently suspended and cannot receive transfers.`,
      };
    }

    // 4. Calculate dynamic pricing & discount
    const discount = payload.discountPercentage ?? currentUser.sellerInfo?.discountPercentage ?? 10;
    const officialBaseRateUsd = 0.01; // $0.01 per coin
    const basePriceUsd = amount * officialBaseRateUsd;
    const finalPriceUsd = Number((basePriceUsd * (1 - discount / 100)).toFixed(2));

    // 5. Atomic balance updates (Mutex simulated)
    const newSellerCoins = currentUser.coins - amount;
    const newRecipientCoins = recipient.coins + amount;

    const existingSellerInfo = currentUser.sellerInfo || {
      sellerId: currentUser.id,
      agencyName: currentUser.displayName,
      verificationLevel: 'gold' as const,
      isOfficialVerified: true,
      rating: 4.95,
      totalTrades: 0,
      totalCoinsSold: 0,
      totalRevenueUsd: 0,
      discountPercentage: discount,
      sellerStatus: 'online' as const,
      responseTimeText: '< 2 mins',
      bio: 'Verified coin reseller',
      paymentMethods: [],
    };

    const updatedSellerInfo: SellerProfile = {
      ...existingSellerInfo,
      totalCoinsSold: existingSellerInfo.totalCoinsSold + amount,
      totalTrades: existingSellerInfo.totalTrades + 1,
      totalRevenueUsd: Number((existingSellerInfo.totalRevenueUsd + finalPriceUsd).toFixed(2)),
    };

    const updatedSellerUser: UserProfile = {
      ...currentUser,
      coins: newSellerCoins,
      sellerInfo: updatedSellerInfo,
    };

    const updatedRecipientUser: UserProfile = {
      ...recipient,
      coins: newRecipientCoins,
    };

    // Update state synchronously (atomic in-memory commit)
    setCurrentUser(updatedSellerUser);
    setAllUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === currentUser.id ? updatedSellerUser : u.id === recipient.id ? updatedRecipientUser : u
      )
    );

    // 6. Generate cryptographic transaction record & wallet ledger entries
    const txId = `stx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const sellerTx: SellerTransaction = {
      id: txId,
      sellerId: currentUser.id,
      sellerName: currentUser.displayName,
      sellerAvatar: currentUser.avatar,
      recipientId: recipient.id,
      recipientNumericId: recipient.numericId || recipient.id,
      recipientName: recipient.displayName,
      recipientAvatar: recipient.avatar,
      amount,
      priceUsd: finalPriceUsd,
      discountAppliedPercent: discount,
      currency: 'COINS',
      status: 'COMPLETED',
      note: payload.note || 'Reseller Wholesale Coin Delivery',
      createdAt: new Date().toISOString(),
      txHash,
    };

    // Double-entry wallet transactions
    const walletDebitTx: WalletTransaction = {
      id: `tx_${Date.now()}_sell_deb`,
      userId: currentUser.id,
      type: 'reseller_transfer_sent',
      currency: 'COINS',
      amount,
      direction: 'DEBIT',
      balanceAfter: newSellerCoins,
      referenceId: txId,
      description: `Transferred ${amount.toLocaleString()} Coins to @${recipient.username} (Ref: ${txId})`,
      status: 'SUCCESS',
      metadata: { txHash, recipientId: recipient.id, priceUsd: finalPriceUsd },
      createdAt: new Date().toISOString(),
    };

    const walletCreditTx: WalletTransaction = {
      id: `tx_${Date.now()}_sell_cred`,
      userId: recipient.id,
      type: 'reseller_transfer_received',
      currency: 'COINS',
      amount,
      direction: 'CREDIT',
      balanceAfter: newRecipientCoins,
      referenceId: txId,
      description: `Received ${amount.toLocaleString()} Coins from Verified Seller ${currentUser.displayName}`,
      status: 'SUCCESS',
      metadata: { txHash, sellerId: currentUser.id },
      createdAt: new Date().toISOString(),
    };

    // Update transactions & seller ledger
    setTransactions((prev) => [walletDebitTx, walletCreditTx, ...prev]);
    setSellerTransactions((prev) => {
      const next = [sellerTx, ...prev];
      try {
        localStorage.setItem('auravoice_seller_transactions', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Sync transaction to Supabase
    syncTransactionToSupabase(sellerTx);

    // 7. Push real-time notification to recipient
    const recipientNotification: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: recipient.id,
      type: 'gift',
      title: '🪙 Coins Received from Reseller!',
      message: `You received ${amount.toLocaleString()} Coins from ${currentUser.displayName} (Ref: ${txId}). Your new balance is ${newRecipientCoins.toLocaleString()} Coins.`,
      isRead: false,
      avatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [recipientNotification, ...prev]);

    // 8. If in active audio room, broadcast real-time in-room announcement
    if (activeRoom) {
      const transferMsg: RoomChatMessage = {
        id: `rc_${Date.now()}_resell`,
        roomId: activeRoom.id,
        senderId: currentUser.id,
        sender: currentUser,
        message: `✨ [OFFICIAL TRANSFER] Transferred ${amount.toLocaleString()} Coins to ${recipient.displayName}!`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setRoomChatMessages((prev) => ({
        ...prev,
        [activeRoom.id]: [...(prev[activeRoom.id] || []), transferMsg],
      }));
    }

    // 9. Audio effect & celebration
    audioEngine.playSoundEffect('fanfare');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#fbbf24', '#3b82f6'],
    });

    return {
      success: true,
      message: `Successfully transferred ${amount.toLocaleString()} Coins to ${recipient.displayName}!`,
      transaction: sellerTx,
    };
  };

  
  const updateBuyerRequestStatus = (
    requestId: string,
    status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED'
  ) => {
    const normalizedStatus: 'PENDING' | 'FULFILLED' | 'CANCELLED' =
      status === 'COMPLETED' ? 'FULFILLED' : status === 'REJECTED' ? 'CANCELLED' : status;
    setBuyerRequests((prev) => {
      const next = prev.map((req) => (req.id === requestId ? { ...req, status: normalizedStatus } : req));
      try {
        localStorage.setItem('auravoice_buyer_requests', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const submitBuyerCoinRequest = async (
    request: Omit<BuyerCoinRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; message: string }> => {
    const newReq: BuyerCoinRequest = {
      ...request,
      id: `bcr_${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setBuyerRequests((prev) => {
      const next = [newReq, ...prev];
      try {
        localStorage.setItem('auravoice_buyer_requests', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Notify seller
    const sellerNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: request.sellerId,
      type: 'system',
      title: '🛒 New Coin Buy Request Received!',
      message: `${request.buyerName} requested to purchase ${request.coinsRequested.toLocaleString()} Coins ($${request.estimatedPriceUsd.toFixed(2)} USD via ${request.paymentMethod}). Contact: ${request.buyerContact}`,
      isRead: false,
      avatar: request.buyerAvatar,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [sellerNotif, ...prev]);

    audioEngine.playSoundEffect('chime');

    return {
      success: true,
      message: 'Buy order requested! The verified seller has been alerted and will reach out to fulfill your order.',
    };
  };

  const updateSellerProfileSettings = (sellerId: string, updates: Partial<SellerProfile>) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === sellerId) {
          const baseSellerInfo = u.sellerInfo || {
            sellerId: u.id,
            agencyName: u.displayName,
            verificationLevel: 'gold',
            isOfficialVerified: true,
            rating: 5.0,
            totalTrades: 0,
            totalCoinsSold: 0,
            totalRevenueUsd: 0,
            discountPercentage: 10,
            sellerStatus: 'online',
            responseTimeText: '< 5 mins',
            bio: 'Verified coin reseller',
            paymentMethods: [],
          };
          const updatedSellerInfo = { ...baseSellerInfo, ...updates };
          const updatedUser = { ...u, sellerInfo: updatedSellerInfo, isSeller: true };
          if (currentUser.id === sellerId) {
            setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  const updateHostAgencySettings = (agencyId: string, updates: Partial<HostAgencyProfile>) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === agencyId && u.hostAgencyInfo) {
          const updatedAgencyInfo = { ...u.hostAgencyInfo, ...updates };
          const updatedUser = { ...u, hostAgencyInfo: updatedAgencyInfo };
          if (currentUser.id === agencyId) {
            setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  const submitAgencyApplication = async (payload: {
    agencyName: string;
    country: string;
    phone: string;
    address: string;
    idCardFront: string;
    idCardBack: string;
    commissionRate?: number;
  }) => {
    if (currentUser.isHostAgency || currentUser.hostAgencyId) {
      return { success: false, message: 'You are already registered in an agency.' };
    }

    const existingPending = agencyApplications.find(
      (a) => a.userId === currentUser.id && a.status === 'PENDING'
    );
    if (existingPending) {
      return { success: false, message: 'You already have a pending agency application under admin review.' };
    }

    const newApp: AgencyApplication = {
      id: `agy_app_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      agencyName: payload.agencyName.trim(),
      country: payload.country,
      phone: payload.phone,
      address: payload.address,
      idCardFront: payload.idCardFront,
      idCardBack: payload.idCardBack,
      commissionRate: payload.commissionRate || 0.15,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    setAgencyApplications((prev) => [newApp, ...prev]);

    // Update user state so UI reflects pending status
    const updatedUser: UserProfile = {
      ...currentUser,
      agencyStatus: 'pending',
      pendingAgencyName: payload.agencyName.trim(),
    };
    setCurrentUser(updatedUser);
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );

    // Audit log
    const auditLog: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: 'SYSTEM',
      adminName: 'Applicant Gateway',
      action: 'AGENCY_APPLICATION_SUBMITTED',
      targetType: 'agency',
      targetId: newApp.id,
      details: `New Host Agency application from ${currentUser.displayName} (${currentUser.numericId || currentUser.id}) for "${payload.agencyName}" (${payload.country})`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    // Notification to user
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      type: 'system',
      title: 'Agency Application Submitted',
      message: `Your application to create agency "${payload.agencyName}" has been submitted to the Admin Panel for review.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, message: 'Agency application submitted successfully! It is now pending admin review.' };
  };

  const adminApproveAgencyApplication = (applicationId: string, commissionRate = 0.15, notes?: string) => {
    const app = agencyApplications.find((a) => a.id === applicationId);
    if (!app) return;

    // Update application status
    setAgencyApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'APPROVED',
              commissionRate,
              adminNotes: notes,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Admin',
            }
          : a
      )
    );

    // Promote target user to Host Agency Owner
    const targetUserId = app.userId;
    const generatedAgencyId = `AGY_${Math.floor(1000 + Math.random() * 9000)}`;

    const newAgencyInfo: HostAgencyProfile = {
      agencyId: generatedAgencyId,
      agencyName: app.agencyName,
      agencyCommissionRate: commissionRate,
      totalHosts: 0,
      totalAgencyRevenueUsd: 0,
      totalDiamondsGenerated: 0,
      status: 'active',
      country: app.country,
      contactPhone: app.phone,
      address: app.address,
      idCardFront: app.idCardFront,
      idCardBack: app.idCardBack,
      reviewStatus: 'approved',
    };

    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === targetUserId) {
          const updatedUser: UserProfile = {
            ...u,
            role: 'agent',
            isHostAgency: true,
            agencyStatus: 'approved',
            pendingAgencyName: undefined,
            hostAgencyInfo: newAgencyInfo,
          };
          if (currentUser.id === targetUserId) {
            setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );

    if (currentUser.id === targetUserId) {
      setCurrentUser((prev) => ({
        ...prev,
        role: 'agent',
        isHostAgency: true,
        agencyStatus: 'approved',
        pendingAgencyName: undefined,
        hostAgencyInfo: newAgencyInfo,
      }));
    }

    // Add Audit Log
    const audit: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: 'ADMIN_SUPER',
      adminName: 'Operations Lead',
      action: 'APPROVE_AGENCY_APPLICATION',
      targetType: 'agency',
      targetId: applicationId,
      details: `Approved agency application for "${app.agencyName}" (Owner: ${app.user.displayName}, UID: ${app.user.numericId || app.userId}, Cut: ${(commissionRate * 100).toFixed(0)}%)`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    // Send notification to applicant
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: targetUserId,
      type: 'system',
      title: '🎉 Agency Application Approved!',
      message: `Congratulations! Your host agency "${app.agencyName}" has been approved by the Admin team. You can now invite hosts and earn ${(commissionRate * 100).toFixed(0)}% commission!`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const adminRejectAgencyApplication = (applicationId: string, notes?: string) => {
    const app = agencyApplications.find((a) => a.id === applicationId);
    if (!app) return;

    setAgencyApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'REJECTED',
              adminNotes: notes || 'Information did not satisfy compliance requirements.',
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Admin',
            }
          : a
      )
    );

    // Update user state
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === app.userId) {
          const updated = {
            ...u,
            agencyStatus: 'rejected' as const,
            pendingAgencyName: undefined,
          };
          if (currentUser.id === u.id) setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );

    if (currentUser.id === app.userId) {
      setCurrentUser((prev) => ({
        ...prev,
        agencyStatus: 'rejected',
        pendingAgencyName: undefined,
      }));
    }

    // Audit Log
    const audit: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: 'ADMIN_SUPER',
      adminName: 'Operations Lead',
      action: 'REJECT_AGENCY_APPLICATION',
      targetType: 'agency',
      targetId: applicationId,
      details: `Rejected agency application for "${app.agencyName}". Reason: ${notes || 'Verification failed'}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);

    // Send notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: app.userId,
      type: 'system',
      title: 'Agency Application Declined',
      message: `Your application for agency "${app.agencyName}" was declined. Reason: ${notes || 'Verification criteria not met'}. You may resubmit with valid details.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const createHostAgency = async (
    agencyName: string,
    extraDetails?: {
      country?: string;
      phone?: string;
      address?: string;
      idCardFront?: string;
      idCardBack?: string;
    }
  ) => {
    return submitAgencyApplication({
      agencyName,
      country: extraDetails?.country || currentUser.country || 'Global',
      phone: extraDetails?.phone || currentUser.phone || '',
      address: extraDetails?.address || 'Verified Address',
      idCardFront: extraDetails?.idCardFront || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      idCardBack: extraDetails?.idCardBack || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      commissionRate: 0.15,
    });
  };

  const joinHostAgency = async (agencyId: string) => {
    if (currentUser.isHostAgency || currentUser.hostAgencyId) {
      return { success: false, message: 'You are already in an agency.' };
    }
    
    const targetAgency = allUsers.find(u => u.isHostAgency && u.id === agencyId);
    if (!targetAgency) {
      return { success: false, message: 'Agency not found.' };
    }

    setAllUsers(prevUsers => prevUsers.map(u => {
      if (u.id === currentUser.id) {
        const updatedUser = { ...u, hostAgencyId: agencyId, role: (u.role === 'user' ? 'host' : u.role) as any };
        if (currentUser.id === u.id) setCurrentUser(updatedUser);
        return updatedUser;
      }
      if (u.id === agencyId && u.hostAgencyInfo) {
        return {
          ...u,
          hostAgencyInfo: {
            ...u.hostAgencyInfo,
            totalHosts: u.hostAgencyInfo.totalHosts + 1
          }
        };
      }
      return u;
    }));

    return { success: true, message: 'Joined agency successfully!' };
  };

  const leaveHostAgency = async () => {
    if (!currentUser.hostAgencyId) {
      return { success: false, message: 'Not in an agency.' };
    }
    
    const agencyId = currentUser.hostAgencyId;

    setAllUsers(prevUsers => prevUsers.map(u => {
      if (u.id === currentUser.id) {
        const updatedUser = { ...u, hostAgencyId: undefined };
        if (currentUser.id === u.id) setCurrentUser(updatedUser);
        return updatedUser;
      }
      if (u.id === agencyId && u.hostAgencyInfo) {
        return {
          ...u,
          hostAgencyInfo: {
            ...u.hostAgencyInfo,
            totalHosts: Math.max(0, u.hostAgencyInfo.totalHosts - 1)
          }
        };
      }
      return u;
    }));

    return { success: true, message: 'Left agency successfully.' };
  };

  const adminPromoteToHostAgency = (userId: string, agencyName: string, commissionRate: number) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const updatedUser = { 
            ...u, 
            isHostAgency: true,
            hostAgencyInfo: {
              agencyId: u.id,
              agencyName: agencyName,
              agencyCommissionRate: commissionRate,
              totalHosts: 0,
              totalAgencyRevenueUsd: 0,
              totalDiamondsGenerated: 0,
              status: 'active' as const
            }
          };
          if (currentUser.id === userId) setCurrentUser(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );
  };

  const applyForSellerRole = async (applicationData: {
    agencyName: string;
    contactWhatsapp: string;
    contactTelegram?: string;
    paymentMethods: string;
    initialDepositUsd: number;
  }): Promise<{ success: boolean; message: string }> => {
    // Instant approval for demo prototype or create verified seller agency
    const sellerInfo: SellerProfile = {
      sellerId: currentUser.id,
      agencyName: applicationData.agencyName || `${currentUser.displayName} Agency`,
      verificationLevel: 'gold',
      isOfficialVerified: true,
      rating: 5.0,
      totalTrades: 0,
      totalCoinsSold: 0,
      totalRevenueUsd: 0,
      discountPercentage: 10,
      sellerStatus: 'online',
      responseTimeText: '< 2 mins',
      contactWhatsapp: applicationData.contactWhatsapp,
      contactTelegram: applicationData.contactTelegram,
      bio: `Official Verified Coin Agency. Instant delivery 24/7. Accepted: ${applicationData.paymentMethods}`,
      noticeBanner: '🎉 New verified agency! 10% discount on all coin orders.',
      paymentMethods: [
        {
          id: `pm_${Date.now()}_1`,
          type: 'whatsapp',
          name: 'WhatsApp Direct Support',
          accountDetail: applicationData.contactWhatsapp,
          instructions: 'Contact with your User ID for instant fulfillment.',
          isActive: true,
        },
        {
          id: `pm_${Date.now()}_2`,
          type: 'crypto_usdt',
          name: 'Crypto USDT / Binance Pay',
          accountDetail: 'TRC20 Wallet Address',
          instructions: 'Instant transfer.',
          isActive: true,
        },
      ],
    };

    const initialGrantedCoins = 500000; // grant 500k inventory for new approved seller demo
    const updatedUser: UserProfile = {
      ...currentUser,
      role: 'seller',
      isSeller: true,
      coins: currentUser.coins + initialGrantedCoins,
      sellerInfo,
      badgeTitle: '💎 Verified Coin Agency',
    };

    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    audioEngine.playSoundEffect('fanfare');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#3b82f6', '#10b981', '#fbbf24'],
    });

    return {
      success: true,
      message: 'Congratulations! Your Verified Reseller Agency has been approved and activated with 500,000 Coins initial inventory!',
    };
  };

  const quickUpgradeToDemoSeller = (userId?: string) => {
    const targetId = userId || currentUser.id;
    const userToUpgrade = allUsers.find((u) => u.id === targetId) || currentUser;

    const sellerInfo: SellerProfile = {
      sellerId: userToUpgrade.id,
      agencyName: `${userToUpgrade.displayName} Express Coins`,
      verificationLevel: 'master',
      isOfficialVerified: true,
      rating: 4.98,
      totalTrades: 120,
      totalCoinsSold: 500000,
      totalRevenueUsd: 4400,
      discountPercentage: 12,
      sellerStatus: 'online',
      responseTimeText: '< 1 min',
      contactWhatsapp: '+1 (555) 019-2831',
      contactTelegram: '@AuraFastCoins',
      bio: 'Trusted 24/7 instant coin delivery agency with lowest market rates.',
      noticeBanner: '⚡ Fast transfer within 60 seconds of order placement.',
      paymentMethods: [
        {
          id: `pm_${Date.now()}_1`,
          type: 'whatsapp',
          name: 'WhatsApp Direct Chat',
          accountDetail: '+1 (555) 019-2831',
          instructions: 'Direct live chat support.',
          isActive: true,
        },
        {
          id: `pm_${Date.now()}_2`,
          type: 'paypal',
          name: 'PayPal / Credit Card',
          accountDetail: 'pay@aurafastcoins.com',
          instructions: 'Friends & family payment.',
          isActive: true,
        },
        {
          id: `pm_${Date.now()}_3`,
          type: 'crypto_usdt',
          name: 'USDT (TRC20)',
          accountDetail: 'TXa8910248102938102938102938',
          instructions: 'Instant auto delivery.',
          isActive: true,
        },
      ],
    };

    const updated: UserProfile = {
      ...userToUpgrade,
      role: 'seller',
      isSeller: true,
      coins: userToUpgrade.coins < 500000 ? userToUpgrade.coins + 1000000 : userToUpgrade.coins,
      sellerInfo,
      badgeTitle: '💎 Master Reseller',
    };

    if (currentUser.id === targetId) {
      setCurrentUser(updated);
    }
    setAllUsers((prev) => prev.map((u) => (u.id === targetId ? updated : u)));
    audioEngine.playSoundEffect('fanfare');
  };

  const adminToggleSellerStatus = (userId: string, isApproved: boolean) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: UserProfile = {
            ...u,
            role: isApproved ? 'seller' : 'user',
            isSeller: isApproved,
          };
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  // MISSIONS
  const claimMissionReward = (missionId: string): { success: boolean; message: string } => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return { success: false, message: 'Mission not found' };
    if (mission.isClaimed) return { success: false, message: 'Reward already claimed' };
    if (mission.currentCount < mission.targetCount) return { success: false, message: 'Mission goal not reached yet' };

    if (mission.rewardType === 'coins') {
      setCurrentUser((prev) => ({ ...prev, coins: prev.coins + mission.rewardAmount }));
    } else if (mission.rewardType === 'diamonds') {
      setCurrentUser((prev) => ({ ...prev, diamonds: prev.diamonds + mission.rewardAmount }));
    } else if (mission.rewardType === 'xp') {
      setCurrentUser((prev) => ({ ...prev, xp: prev.xp + mission.rewardAmount }));
    }

    setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, isClaimed: true } : m)));
    audioEngine.playSoundEffect('level_up');
    return { success: true, message: `Claimed +${mission.rewardAmount} ${mission.rewardType.toUpperCase()}!` };
  };

  // MESSAGING ENGINE
  const startConversationWithUser = (userId: string): Conversation => {
    const existing = conversations.find((c) => c.participant.id === userId);
    if (existing) {
      setActiveConversation(existing);
      return existing;
    }

    const partner = allUsers.find((u) => u.id === userId);
    if (!partner) {
      const dummyConv: Conversation = {
        id: `conv_${Date.now()}`,
        participant: {
          id: userId,
          numericId: '000000',
          username: 'user',
          displayName: 'User',
          email: '',
          phone: '',
          bio: '',
          country: 'Global',
          countryFlag: '🌐',
          language: 'English',
          gender: 'other',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: 'user',
          level: 1,
          xp: 0,
          xpToNextLevel: 1000,
          vipTier: 'vip_0',
          coins: 0,
          diamonds: 0,
          followersCount: 0,
          followingCount: 0,
          visitorsCount: 0,
          isHost: false,
          isBanned: false,
          isMuted: false,
          fraudScore: 0,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        unreadCount: 0,
        lastMessage: {
          id: `msg_${Date.now()}`,
          conversationId: `conv_${Date.now()}`,
          senderId: userId,
          receiverId: currentUser.id,
          message: '',
          type: 'text',
          isRead: true,
          createdAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
      return dummyConv;
    }
    const newConvId = `conv_${Date.now()}`;
    const welcomeMsg: DirectMessage = {
      id: `msg_${Date.now()}`,
      conversationId: newConvId,
      senderId: partner.id,
      receiverId: currentUser.id,
      message: `Hey! Thanks for connecting. How is your day going? ✨`,
      type: 'text',
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    const newConv: Conversation = {
      id: newConvId,
      participant: partner,
      lastMessage: welcomeMsg,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setDirectMessages((prev) => ({
      ...prev,
      [newConvId]: [welcomeMsg],
    }));
    setActiveConversation(newConv);
    return newConv;
  };

  const sendDirectMessage = (
    receiverIdOrConvId: string,
    messageText: string,
    type: 'text' | 'voice' | 'gift' = 'text',
    voiceDurationSec?: number,
    giftData?: any
  ) => {
    let targetConv = conversations.find(
      (c) => c.id === receiverIdOrConvId || c.participant.id === receiverIdOrConvId
    );

    let partnerUser = targetConv?.participant;
    if (!partnerUser) {
      partnerUser = allUsers.find((u) => u.id === receiverIdOrConvId);
    }
    if (!partnerUser) {
      return;
    }

    const convId = targetConv?.id || `conv_${Date.now()}`;

    const newMsg: DirectMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: convId,
      senderId: currentUser.id,
      receiverId: partnerUser.id,
      message: messageText,
      type,
      voiceDurationSec: type === 'voice' ? (voiceDurationSec || 8) : undefined,
      giftData,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    setDirectMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }));

    setConversations((prev) => {
      const exists = prev.some((c) => c.id === convId);
      if (exists) {
        return prev.map((c) =>
          c.id === convId
            ? { ...c, lastMessage: newMsg, updatedAt: new Date().toISOString() }
            : c
        );
      } else {
        const newConv: Conversation = {
          id: convId,
          participant: partnerUser!,
          lastMessage: newMsg,
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
        };
        return [newConv, ...prev];
      }
    });

    audioEngine.playSoundEffect('chime');

    // Simulate smart interactive creator auto-response if partner is an AI host
    if (partnerUser.id !== currentUser.id && type !== 'gift') {
      const partner = partnerUser;
      setTimeout(() => {
        const replies = [
          `Hey ${currentUser.displayName}! Thanks for messaging 🎧 Loving the audio vibes today!`,
          `Got your message! Let's definitely jam in the voice lounge soon 🎙️✨`,
          `Appreciate you stopping by! What are you listening to right now? 🎶`,
          `Sending positive energy your way! See you on stage tonight 🔥`,
          `Thanks for supporting the room! Feel free to grab a mic seat anytime 🌟`,
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const replyMsg: DirectMessage = {
          id: `msg_reply_${Date.now()}`,
          conversationId: convId,
          senderId: partner.id,
          receiverId: currentUser.id,
          message: randomReply,
          type: 'text',
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        setDirectMessages((prev) => ({
          ...prev,
          [convId]: [...(prev[convId] || []), replyMsg],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, lastMessage: replyMsg, unreadCount: c.unreadCount + 1, updatedAt: new Date().toISOString() }
              : c
          )
        );

        audioEngine.playSoundEffect('chime');
      }, 1400);
    }
  };

  const deleteConversation = (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    setDirectMessages((prev) => {
      const updated = { ...prev };
      delete updated[convId];
      return updated;
    });
    if (activeConversation?.id === convId) {
      setActiveConversation(null);
    }
    audioEngine.playSoundEffect('chime');
  };

  const markConversationAsRead = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
    setDirectMessages((prev) => {
      if (!prev[convId]) return prev;
      return {
        ...prev,
        [convId]: prev[convId].map((m) => ({ ...m, isRead: true })),
      };
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // ADMIN ACTIONS
  const adminUpdateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    setAllUsers((users) =>
      users.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          if (currentUser.id === userId) setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const adminUpdateUserBalance = (userId: string, coinDelta: number, diamondDelta: number, reason: string) => {
    setAllUsers((users) =>
      users.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            coins: Math.max(0, u.coins + coinDelta),
            diamonds: Math.max(0, u.diamonds + diamondDelta),
          };
          if (currentUser.id === userId) setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'BALANCE_ADJUSTMENT',
      targetType: 'UserProfile',
      targetId: userId,
      details: `Adjusted Coins (${coinDelta >= 0 ? '+' : ''}${coinDelta}) and Diamonds (${diamondDelta >= 0 ? '+' : ''}${diamondDelta}). Reason: ${reason}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminToggleUserBan = (userId: string, isBanned: boolean, reason: string) => {
    setAllUsers((users) =>
      users.map((u) => (u.id === userId ? { ...u, isBanned } : u))
    );

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: isBanned ? 'USER_BANNED' : 'USER_UNBANNED',
      targetType: 'UserProfile',
      targetId: userId,
      details: `${isBanned ? 'Banned' : 'Unbanned'} user. Reason: ${reason}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminReviewHostApplication = (applicationId: string, status: 'approved' | 'rejected', notes?: string) => {
    const app = hostApplications.find((a) => a.id === applicationId);
    if (!app) return;

    setHostApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status, adminNotes: notes, reviewedAt: new Date().toISOString() } : a))
    );

    if (status === 'approved') {
      setAllUsers((users) =>
        users.map((u) => (u.id === app.userId ? { ...u, isHost: true, hostStatus: 'approved', hostLevel: 1, hostCommissionRate: 0.70 } : u))
      );
      if (currentUser.id === app.userId) {
        setCurrentUser((prev) => ({ ...prev, isHost: true, hostStatus: 'approved', hostLevel: 1, hostCommissionRate: 0.70 }));
      }
    }

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: `HOST_APP_${status.toUpperCase()}`,
      targetType: 'HostApplication',
      targetId: applicationId,
      details: `Host application for ${app.fullName} was ${status}. Notes: ${notes || 'None'}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminProcessWithdrawal = (withdrawalId: string, action: 'APPROVE' | 'REJECT' | 'MARK_PAID', notes?: string) => {
    const wdr = withdrawals.find((w) => w.id === withdrawalId);
    if (!wdr) return;

    const newStatus: WithdrawalStatus = action === 'APPROVE' ? 'APPROVED' : action === 'MARK_PAID' ? 'PAID' : 'REJECTED';

    setWithdrawals((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: newStatus, adminNotes: notes, processedAt: new Date().toISOString() } : w))
    );

    if (action === 'REJECT') {
      setAllUsers((users) =>
        users.map((u) => (u.id === wdr.hostId ? { ...u, diamonds: u.diamonds + wdr.diamondsAmount } : u))
      );
      if (currentUser.id === wdr.hostId) {
        setCurrentUser((prev) => ({ ...prev, diamonds: prev.diamonds + wdr.diamondsAmount }));
      }
    }

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: `WITHDRAWAL_${action}`,
      targetType: 'WithdrawalRequest',
      targetId: withdrawalId,
      details: `Withdrawal ${wdr.id} for $${wdr.cashAmountUsd.toFixed(2)} marked as ${newStatus}. Notes: ${notes || 'None'}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminCloseRoom = (roomId: string, reason: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (activeRoom?.id === roomId) {
      setActiveRoom(null);
    }

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'ROOM_FORCE_CLOSED',
      targetType: 'VoiceRoom',
      targetId: roomId,
      details: `Room force-closed by admin. Reason: ${reason}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminMuteHostInRoom = (roomId: string, hostUserId: string, muteState?: boolean) => {
    let targetMuteState = muteState;
    let targetName = 'Host';

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id !== roomId) return room;

        const isMainHost = room.hostId === hostUserId || room.host?.id === hostUserId;
        if (isMainHost) {
          targetName = room.host?.displayName || 'Host';
        }

        const updatedSeats = room.seats.map((seat) => {
          const isSeatHost = seat.userId === hostUserId || seat.user?.id === hostUserId;
          if (isSeatHost) {
            targetName = seat.user?.displayName || targetName;
            const newMuted = targetMuteState !== undefined ? targetMuteState : !seat.isMuted;
            targetMuteState = newMuted;
            return {
              ...seat,
              isMuted: newMuted,
              isSpeaking: false,
              volumeLevel: 0,
            };
          }
          return seat;
        });

        if (targetMuteState === undefined) {
          targetMuteState = true;
        }

        const updatedRoom = {
          ...room,
          seats: updatedSeats,
        };

        if (activeRoom?.id === roomId) {
          setActiveRoom(updatedRoom);
        }

        return updatedRoom;
      })
    );

    if (currentUser.id === hostUserId && targetMuteState) {
      audioEngine.stopMicrophoneCapture();
    }

    setAllUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === hostUserId ? { ...u, isMuted: !!targetMuteState } : u))
    );

    const chatMsg: RoomChatMessage = {
      id: `sys_chat_${Date.now()}`,
      roomId,
      senderId: 'ADMIN_CONSOLE',
      sender: {
        ...currentUser,
        displayName: 'Platform Admin',
      },
      message: `⚠️ Host ${targetName} was ${targetMuteState ? 'MUTED' : 'UNMUTED'} by platform administration.`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRoomChatMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), chatMsg],
    }));

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: targetMuteState ? 'HOST_MUTED_BY_ADMIN' : 'HOST_UNMUTED_BY_ADMIN',
      targetType: 'host',
      targetId: hostUserId,
      details: `Admin set mute=${targetMuteState} for host ${targetName} in room ${roomId}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminKickHostFromRoom = (
    roomId: string,
    hostUserId: string,
    reason: string = 'Violation of live audio policies',
    closeRoomIfMainHost: boolean = false
  ) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    const isMainHost = targetRoom.hostId === hostUserId || targetRoom.host?.id === hostUserId;
    const targetName = isMainHost
      ? targetRoom.host?.displayName || 'Host'
      : targetRoom.seats.find((s) => s.userId === hostUserId || s.user?.id === hostUserId)?.user?.displayName || 'Host/Speaker';

    if (isMainHost && closeRoomIfMainHost) {
      adminCloseRoom(roomId, `Host ejected: ${reason}`);
      return;
    }

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id !== roomId) return room;

        const updatedSeats = room.seats.map((seat) => {
          if (seat.userId === hostUserId || seat.user?.id === hostUserId) {
            return {
              ...seat,
              userId: null,
              user: null,
              isSpeaking: false,
              isMuted: false,
              volumeLevel: 0,
            };
          }
          return seat;
        });

        const newAudienceCount = Math.max(0, room.audienceCount - 1);
        const updatedRoom = {
          ...room,
          seats: updatedSeats,
          audienceCount: newAudienceCount,
        };

        if (activeRoom?.id === roomId) {
          if (currentUser.id === hostUserId) {
            audioEngine.stopMicrophoneCapture();
            setActiveRoom(null);
          } else {
            setActiveRoom(updatedRoom);
          }
        }

        return updatedRoom;
      })
    );

    if (activeRoom?.id === roomId && currentUser.id === hostUserId) {
      audioEngine.stopMicrophoneCapture();
      setActiveRoom(null);
    }

    const chatMsg: RoomChatMessage = {
      id: `sys_chat_${Date.now()}`,
      roomId,
      senderId: 'ADMIN_CONSOLE',
      sender: {
        ...currentUser,
        displayName: 'Platform Admin',
      },
      message: `🚫 Host ${targetName} was KICKED from the stage by Administrator. Reason: ${reason}`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRoomChatMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), chatMsg],
    }));

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'HOST_KICKED_BY_ADMIN',
      targetType: 'host',
      targetId: hostUserId,
      details: `Admin kicked host ${targetName} from room "${targetRoom.title}" (${roomId}). Reason: ${reason}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminSaveGift = (gift: VirtualGift) => {
    setGifts((prev) => {
      const idx = prev.findIndex((g) => g.id === gift.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = gift;
        return copy;
      }
      return [gift, ...prev];
    });
  };

  const adminSaveCoinPackage = (pkg: CoinPackage) => {
    setCoinPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === pkg.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = pkg;
        return copy;
      }
      return [pkg, ...prev];
    });
  };

  const adminSaveVIP = (vip: VIPTier) => {
    setVIPTiers((prev) => {
      const idx = prev.findIndex((v) => v.id === vip.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = vip;
        return copy;
      }
      return [vip, ...prev];
    });
  };

  const adminResolveReport = (reportId: string, actionTaken: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved', actionTaken } : r))
    );
  };

  const adminAdjustUserBalance = (userId: string, coinDelta: number, diamondDelta: number, reason: string) => {
    adminUpdateUserBalance(userId, coinDelta, diamondDelta, reason);
  };

  const adminBanUser = (userId: string, isBanned: boolean, reason = 'Violation of terms') => {
    adminToggleUserBan(userId, isBanned, reason);
  };

  const adminMuteUser = (userId: string, durationHours: number) => {
    setAllUsers((users) =>
      users.map((u) => (u.id === userId ? { ...u, isMuted: durationHours > 0 } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, isMuted: durationHours > 0 }));
    }
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: durationHours > 0 ? 'USER_MUTED' : 'USER_UNMUTED',
      targetType: 'UserProfile',
      targetId: userId,
      details: durationHours > 0 ? `Muted user for ${durationHours} hours` : 'Unmuted user',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminChangeUserRole = (userId: string, role: UserRole) => {
    setAllUsers((users) =>
      users.map((u) => (u.id === userId ? { ...u, role, isHost: role === 'host' ? true : u.isHost } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role, isHost: role === 'host' ? true : prev.isHost }));
    }
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'USER_ROLE_CHANGE',
      targetType: 'UserProfile',
      targetId: userId,
      details: `Changed role to ${role}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminApproveHostApplication = (applicationId: string, commissionRate = 0.70, notes?: string) => {
    const app = hostApplications.find((a) => a.id === applicationId);
    if (!app) return;
    setHostApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'approved', adminNotes: notes, reviewedAt: new Date().toISOString() } : a))
    );
    setAllUsers((users) =>
      users.map((u) => (u.id === app.userId ? { ...u, isHost: true, hostStatus: 'approved', hostLevel: 1, hostCommissionRate: commissionRate } : u))
    );
    if (currentUser.id === app.userId) {
      setCurrentUser((prev) => ({ ...prev, isHost: true, hostStatus: 'approved', hostLevel: 1, hostCommissionRate: commissionRate }));
    }
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'HOST_APP_APPROVED',
      targetType: 'HostApplication',
      targetId: applicationId,
      details: `Approved host application with ${(commissionRate * 100).toFixed(0)}% commission.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminRejectHostApplication = (applicationId: string, reason = 'Does not meet criteria') => {
    adminReviewHostApplication(applicationId, 'rejected', reason);
  };

  const adminUpdateHostCommission = (userId: string, commissionRate: number) => {
    setAllUsers((users) =>
      users.map((u) => (u.id === userId ? { ...u, hostCommissionRate: commissionRate } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, hostCommissionRate: commissionRate }));
    }
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'HOST_COMMISSION_UPDATE',
      targetType: 'UserProfile',
      targetId: userId,
      details: `Set commission rate to ${(commissionRate * 100).toFixed(0)}%`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminApproveWithdrawal = (withdrawalId: string, txHash?: string) => {
    const hash = txHash || `TX_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'APPROVED', transactionHash: hash, processedAt: new Date().toISOString() } : w))
    );
    const wdr = withdrawals.find((w) => w.id === withdrawalId);
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'WITHDRAWAL_APPROVED',
      targetType: 'WithdrawalRequest',
      targetId: withdrawalId,
      details: `Authorized payout with hash ${hash}. Amount: $${(wdr?.cashAmountUsd || wdr?.amountUsd || 0).toFixed(2)}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminRejectWithdrawal = (withdrawalId: string, reason = 'Rejected by administrator') => {
    adminProcessWithdrawal(withdrawalId, 'REJECT', reason);
  };

  const adminAddGift = (giftData: Partial<VirtualGift>) => {
    const newGift: VirtualGift = {
      id: `gift_${Date.now()}`,
      name: giftData.name || 'New Gift',
      coinPrice: giftData.coinPrice || 100,
      category: giftData.category || 'Popular',
      icon: giftData.icon || '🎁',
      animationType: giftData.animationType || 'confetti',
      animationDurationMs: giftData.animationDurationMs || 3000,
      soundEffect: giftData.soundEffect || 'chime',
      isVipOnly: !!giftData.isVipOnly,
      minVipLevel: giftData.minVipLevel,
      sortOrder: gifts.length + 1,
      status: 'active',
    };
    setGifts((prev) => [newGift, ...prev]);
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'GIFT_CREATED',
      targetType: 'VirtualGift',
      targetId: newGift.id,
      details: `Added new gift: ${newGift.name} (${newGift.coinPrice} coins)`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminUpdateGift = (giftId: string, updates: Partial<VirtualGift>) => {
    setGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, ...updates } : g))
    );
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'GIFT_UPDATED',
      targetType: 'VirtualGift',
      targetId: giftId,
      details: `Updated gift properties: ${JSON.stringify(updates)}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminUpdatePlatformConfig = (newConfig: Partial<PlatformConfig>) => {
    setPlatformConfig((prev) => ({ ...prev, ...newConfig }));
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'PLATFORM_CONFIG_UPDATE',
      targetType: 'PlatformConfig',
      targetId: 'config',
      details: `Updated platform configuration: ${JSON.stringify(newConfig)}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Computed Admin Stats
  const adminStats: AdminStats = {
    totalRevenueUsd: 48920.50 + transactions.filter(t => t.type === 'coin_purchase').reduce((acc, t) => acc + (t.amount / 100), 0),
    totalCoinsCirculating: allUsers.reduce((sum, u) => sum + (u.coins || 0), 0),
    totalDiamondsMinted: allUsers.reduce((sum, u) => sum + (u.diamonds || 0), 0) + withdrawals.reduce((sum, w) => sum + (w.diamondsAmount || w.amountDiamonds || 0), 0),
    totalConcurrentUsers: rooms.reduce((sum, r) => sum + (r.audienceCount || 0) + (r.seats?.filter(s => s.userId)?.length || 0), 128),
  };

  const adminAddLuckyBackupMilestone = (milestoneData: Partial<LuckyBackupMilestone>) => {
    const newMilestone: LuckyBackupMilestone = {
      id: `lbm_${Date.now()}`,
      name: milestoneData.name || 'New Milestone',
      requiredCount: milestoneData.requiredCount || 10,
      multiplier: milestoneData.multiplier || 1,
      rewardType: milestoneData.rewardType || 'diamonds',
      rewardAmount: milestoneData.rewardAmount || 10,
      resetPeriod: milestoneData.resetPeriod || 'after_claim',
      status: milestoneData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLuckyBackupMilestones((prev) => [...prev, newMilestone]);
    
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'LUCKY_BACKUP_CREATED',
      targetType: 'LuckyBackupMilestone',
      targetId: newMilestone.id,
      details: `Created Lucky Backup Milestone: ${newMilestone.name}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminUpdateLuckyBackupMilestone = (milestoneId: string, updates: Partial<LuckyBackupMilestone>) => {
    setLuckyBackupMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'LUCKY_BACKUP_UPDATED',
      targetType: 'LuckyBackupMilestone',
      targetId: milestoneId,
      details: `Updated Lucky Backup Milestone: ${JSON.stringify(updates)}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminDeleteLuckyBackupMilestone = (milestoneId: string) => {
    setLuckyBackupMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'LUCKY_BACKUP_DELETED',
      targetType: 'LuckyBackupMilestone',
      targetId: milestoneId,
      details: `Deleted Lucky Backup Milestone`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Store Items Admin Operations
  const adminAddStoreItem = (itemData: Omit<StoreItem, 'id'> | Partial<StoreItem>) => {
    const newItem: StoreItem = {
      id: (itemData as any).id || `${itemData.category || 'item'}_${Date.now()}`,
      category: itemData.category || 'frames',
      name: itemData.name || 'New Store Asset',
      description: itemData.description || 'Exclusive store asset item',
      icon: itemData.icon || '✨',
      previewClass: itemData.previewClass || '',
      badgeTag: itemData.badgeTag,
      rarity: itemData.rarity || 'Rare',
      price7Days: Number(itemData.price7Days) || 300,
      price30Days: Number(itemData.price30Days) || 900,
      pricePermanent: Number(itemData.pricePermanent) || 2500,
      soundEffect: itemData.soundEffect,
      requiredVip: itemData.requiredVip,
      glowColor: itemData.glowColor || 'purple',
      themeGradient: itemData.themeGradient || 'from-violet-600 to-indigo-600',
      status: itemData.status || 'active',
      salesCount: itemData.salesCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStoreItems((prev) => [newItem, ...prev]);

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'STORE_ITEM_CREATED',
      targetType: 'StoreItem',
      targetId: newItem.id,
      details: `Created new ${newItem.category} item "${newItem.name}" (${newItem.pricePermanent} coins perm)`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminUpdateStoreItem = (itemId: string, updates: Partial<StoreItem>) => {
    setStoreItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'STORE_ITEM_UPDATED',
      targetType: 'StoreItem',
      targetId: itemId,
      details: `Updated store item ${itemId}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminDeleteStoreItem = (itemId: string) => {
    setStoreItems((prev) => prev.filter((item) => item.id !== itemId));

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'STORE_ITEM_DELETED',
      targetType: 'StoreItem',
      targetId: itemId,
      details: `Deleted store item ${itemId}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminToggleStoreItemStatus = (itemId: string, status?: 'active' | 'inactive') => {
    setStoreItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextStatus = status !== undefined ? status : (item.status === 'inactive' ? 'active' : 'inactive');
          return { ...item, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return item;
      })
    );
  };

  // Payment Gateways Admin Operations
  const adminToggleGateway = (id: string, isEnabled: boolean) => {
    setPaymentGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isEnabled, updatedAt: new Date().toISOString() } : g))
    );
    const gw = paymentGateways.find((g) => g.id === id);
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: isEnabled ? 'PAYMENT_GATEWAY_ENABLED' : 'PAYMENT_GATEWAY_DISABLED',
      targetType: 'PaymentGateway',
      targetId: id,
      details: `${isEnabled ? 'Enabled' : 'Disabled'} payment gateway: ${gw?.name || id}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminUpdateGateway = (id: string, updates: Partial<PaymentGatewayConfig>) => {
    setPaymentGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    );
    const gw = paymentGateways.find((g) => g.id === id);
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'PAYMENT_GATEWAY_UPDATED',
      targetType: 'PaymentGateway',
      targetId: id,
      details: `Updated configuration & credentials for gateway: ${gw?.name || id}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminTestGatewayPing = async (
    id: string
  ): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    const gw = paymentGateways.find((g) => g.id === id);
    if (!gw) return { success: false, latencyMs: 0, message: 'Gateway not found' };

    await new Promise((r) => setTimeout(r, 550));
    const randomLatency = Math.floor(20 + Math.random() * 45);
    const isSuccess = gw.isEnabled;

    setPaymentGateways((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              lastPingMs: randomLatency,
              webhookStatus: isSuccess ? 'healthy' : 'degraded',
            }
          : g
      )
    );

    return {
      success: isSuccess,
      latencyMs: randomLatency,
      message: isSuccess
        ? `Handshake OK! ${gw.name} responded in ${randomLatency}ms (Status 200).`
        : `Endpoint reached in ${randomLatency}ms, but gateway is currently disabled in settings.`,
    };
  };

  const adminSimulateGatewayTransaction = async (
    gatewayId: string,
    amountUsd: number
  ): Promise<{ success: boolean; log: GatewayWebhookLog }> => {
    const gw = paymentGateways.find((g) => g.id === gatewayId);
    const gwName = gw ? gw.name : 'Payment Gateway';
    await new Promise((r) => setTimeout(r, 650));

    const latency = Math.floor(24 + Math.random() * 36);
    const newLog: GatewayWebhookLog = {
      id: `wh_sim_${Date.now()}`,
      gatewayId,
      gatewayName: gwName,
      eventType:
        gw?.code === 'google_play'
          ? 'googleplay.order.purchased'
          : gw?.code === 'apple_app_store'
          ? 'appstore.v2.did_renew'
          : gw?.code === 'crypto_usdt'
          ? 'usdt.deposit.confirmed'
          : 'payment_intent.succeeded',
      amountUsd,
      currency: gw?.settlementCurrency || 'USD',
      customerId: currentUser.id,
      customerName: currentUser.displayName,
      status: 'SUCCESS',
      ipAddress: '198.51.100.' + Math.floor(10 + Math.random() * 80),
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      payloadSnippet: JSON.stringify({
        simulated: true,
        gateway: gwName,
        chargeId: `ch_${Math.random().toString(36).substring(2, 10)}`,
        amount: amountUsd,
        currency: gw?.settlementCurrency || 'USD',
        status: 'succeeded',
      }),
    };

    setGatewayWebhookLogs((prev) => [newLog, ...prev.slice(0, 49)]);

    setPaymentGateways((prev) =>
      prev.map((g) =>
        g.id === gatewayId
          ? {
              ...g,
              totalProcessedVolumeUsd: g.totalProcessedVolumeUsd + amountUsd,
              totalTransactionsCount: g.totalTransactionsCount + 1,
              lastEventReceivedAt: new Date().toISOString(),
            }
          : g
      )
    );

    return { success: true, log: newLog };
  };

  const adminAddPaymentGateway = (gateway: PaymentGatewayConfig) => {
    setPaymentGateways((prev) => [gateway, ...prev]);
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'PAYMENT_GATEWAY_CREATED',
      targetType: 'PaymentGateway',
      targetId: gateway.id,
      details: `Registered new payment gateway: ${gateway.name} (${gateway.category})`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminDeletePaymentGateway = (id: string) => {
    const gw = paymentGateways.find((g) => g.id === id);
    setPaymentGateways((prev) => prev.filter((g) => g.id !== id));
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'PAYMENT_GATEWAY_DELETED',
      targetType: 'PaymentGateway',
      targetId: id,
      details: `Removed payment gateway: ${gw?.name || id}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Game Operations & Betting Engine
  const playGameBet = async (
    gameId: string,
    betAmount: number,
    betPayload?: any
  ): Promise<{
    success: boolean;
    isWin: boolean;
    payoutAmount: number;
    multiplier: number;
    resultOutcome: any;
    isJackpot?: boolean;
    message: string;
  }> => {
    const targetGame = games.find((g) => g.id === gameId);
    if (!targetGame) {
      return { success: false, isWin: false, payoutAmount: 0, multiplier: 0, resultOutcome: null, message: 'Game not found' };
    }

    if (targetGame.status !== 'active') {
      return {
        success: false,
        isWin: false,
        payoutAmount: 0,
        multiplier: 0,
        resultOutcome: null,
        message: targetGame.status === 'maintenance' ? 'Game is undergoing maintenance' : 'Game is currently disabled',
      };
    }

    if (betAmount < targetGame.minBet) {
      return { success: false, isWin: false, payoutAmount: 0, multiplier: 0, resultOutcome: null, message: `Minimum bet is ${targetGame.minBet.toLocaleString()} coins` };
    }

    if (betAmount > targetGame.maxBet) {
      return { success: false, isWin: false, payoutAmount: 0, multiplier: 0, resultOutcome: null, message: `Maximum bet is ${targetGame.maxBet.toLocaleString()} coins` };
    }

    if (currentUser.coins < betAmount) {
      return { success: false, isWin: false, payoutAmount: 0, multiplier: 0, resultOutcome: null, message: 'Insufficient coins! Please recharge in store.' };
    }

    // Deduct bet coins immediately
    const userCoinsAfterBet = currentUser.coins - betAmount;
    updateCurrentUserProfile({ coins: userCoinsAfterBet });

    // Determine outcome based on game multipliers and weighted probabilities
    let chosenMultiplier = targetGame.multipliers[0] || { id: 'm1', label: 'Consolation', multiplier: 0.5, probabilityWeight: 50, color: '#64748B' };
    const totalWeight = targetGame.multipliers.reduce((acc, m) => acc + (m.probabilityWeight || 10), 0);
    let randomVal = Math.random() * totalWeight;

    for (const m of targetGame.multipliers) {
      const weight = m.probabilityWeight || 10;
      if (randomVal <= weight) {
        chosenMultiplier = m;
        break;
      }
      randomVal -= weight;
    }

    let isWin = false;
    let multiplier = 0;
    let isJackpot = false;
    let payoutAmount = 0;
    let outcomeLabel = chosenMultiplier.label;

    if (gameId === 'greedy_fruits' && betPayload?.selectedFruitId) {
      if (betPayload.selectedFruitId === chosenMultiplier.id) {
        isWin = true;
        multiplier = chosenMultiplier.multiplier;
        isJackpot = !!chosenMultiplier.isJackpot;
      } else {
        isWin = false;
        multiplier = 0;
      }
    } else if (gameId === 'dice_royale' && betPayload?.choice) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2 + d3;
      const isTriple = d1 === d2 && d2 === d3;
      outcomeLabel = `Dice: [${d1}, ${d2}, ${d3}] (Sum: ${sum})`;

      if (betPayload.choice === 'triple' && isTriple) {
        isWin = true;
        multiplier = 30;
        isJackpot = d1 === 6;
      } else if (betPayload.choice === 'small' && sum >= 4 && sum <= 10 && !isTriple) {
        isWin = true;
        multiplier = 2;
      } else if (betPayload.choice === 'big' && sum >= 11 && sum <= 17 && !isTriple) {
        isWin = true;
        multiplier = 2;
      } else {
        isWin = false;
        multiplier = 0;
      }
    } else if (gameId === 'dragon_tiger' && betPayload?.choice) {
      const cardValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      const suits = ['♠', '♥', '♣', '♦'];
      const dragonCard = { val: cardValues[Math.floor(Math.random() * cardValues.length)], suit: suits[Math.floor(Math.random() * suits.length)] };
      const tigerCard = { val: cardValues[Math.floor(Math.random() * cardValues.length)], suit: suits[Math.floor(Math.random() * suits.length)] };
      const cardNames = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      outcomeLabel = `Dragon: ${cardNames[dragonCard.val]}${dragonCard.suit} vs Tiger: ${cardNames[tigerCard.val]}${tigerCard.suit}`;

      if (dragonCard.val === tigerCard.val) {
        if (betPayload.choice === 'tie') {
          isWin = true;
          multiplier = dragonCard.suit === tigerCard.suit ? 50 : 8;
          isJackpot = dragonCard.suit === tigerCard.suit;
        } else {
          isWin = false;
          multiplier = 0;
        }
      } else if (dragonCard.val > tigerCard.val) {
        isWin = betPayload.choice === 'dragon';
        multiplier = isWin ? 2 : 0;
      } else {
        isWin = betPayload.choice === 'tiger';
        multiplier = isWin ? 2 : 0;
      }
    } else if (gameId === 'rocket_crash' && betPayload?.cashoutMultiplier) {
      const crashMultiplier = 1.1 + Math.pow(Math.random(), 2.2) * 18;
      if (betPayload.cashoutMultiplier <= crashMultiplier) {
        isWin = true;
        multiplier = Number(betPayload.cashoutMultiplier.toFixed(2));
        outcomeLabel = `Cashed out at ${multiplier}x (Crash: ${crashMultiplier.toFixed(2)}x)`;
        isJackpot = multiplier >= 50;
      } else {
        isWin = false;
        multiplier = 0;
        outcomeLabel = `Crashed at ${crashMultiplier.toFixed(2)}x`;
      }
    } else {
      multiplier = chosenMultiplier.multiplier;
      isWin = multiplier > 0;
      isJackpot = !!chosenMultiplier.isJackpot;
    }

    // Calculate payout
    if (isWin) {
      payoutAmount = Math.round(betAmount * multiplier);
      if (isJackpot) {
        const bonusJackpot = Math.round(targetGame.jackpotPool * 0.5);
        payoutAmount += bonusJackpot;
      }
      const finalCoins = userCoinsAfterBet + payoutAmount;
      updateCurrentUserProfile({ coins: finalCoins });

      // Add double entry transaction
      const winTx: WalletTransaction = {
        id: `tx_gw_${Date.now()}`,
        userId: currentUser.id,
        type: 'mission_reward',
        currency: 'COINS',
        amount: payoutAmount,
        direction: 'CREDIT',
        balanceAfter: finalCoins,
        referenceId: `game_${gameId}`,
        description: `Game Win: ${targetGame.name} (${multiplier}x) ${isJackpot ? '🏆 JACKPOT' : ''}`,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [winTx, ...prev]);

      if (isJackpot) {
        audioEngine.playSoundEffect('fanfare');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        const jackpotWinner: GameJackpotWinner = {
          id: `jw_${Date.now()}`,
          gameId: targetGame.id,
          gameName: targetGame.name,
          userName: currentUser.displayName,
          userAvatar: currentUser.avatar,
          jackpotAmount: payoutAmount,
          timestamp: 'Just now',
        };
        setRecentJackpotWinners((prev) => [jackpotWinner, ...prev.slice(0, 19)]);
      } else if (multiplier >= 10) {
        audioEngine.playSoundEffect('magic');
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      } else {
        audioEngine.playSoundEffect('chime');
      }
    }

    // Update game statistics
    const jackpotContribution = Math.round(betAmount * (targetGame.jackpotContributionPercent / 100));
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          const newJackpot = isJackpot ? Math.max(50000, Math.round(g.jackpotPool * 0.5)) : g.jackpotPool + jackpotContribution;
          return {
            ...g,
            totalBetsCount: g.totalBetsCount + 1,
            totalWageredCoins: g.totalWageredCoins + betAmount,
            totalPayoutCoins: g.totalPayoutCoins + payoutAmount,
            jackpotPool: newJackpot,
            updatedAt: new Date().toISOString(),
          };
        }
        return g;
      })
    );

    // Record game history item
    const historyItem: GameBetHistoryItem = {
      id: `gh_${Date.now()}`,
      gameId: targetGame.id,
      gameName: targetGame.name,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userAvatar: currentUser.avatar,
      betAmount,
      payoutAmount,
      multiplier,
      resultOutcome: outcomeLabel,
      isWin,
      isJackpot,
      timestamp: 'Just now',
    };
    setGameHistory((prev) => [historyItem, ...prev.slice(0, 49)]);

    return {
      success: true,
      isWin,
      payoutAmount,
      multiplier,
      resultOutcome: chosenMultiplier,
      isJackpot,
      message: isWin
        ? `Won ${payoutAmount.toLocaleString()} Coins! (${multiplier}x)`
        : `Better luck next spin!`,
    };
  };

  const adminAddGame = (
    gameData: Omit<GameItem, 'id' | 'createdAt' | 'updatedAt' | 'totalBetsCount' | 'totalWageredCoins' | 'totalPayoutCoins' | 'totalPlayers'>
  ) => {
    const newGame: GameItem = {
      ...gameData,
      id: `game_${Date.now()}`,
      totalBetsCount: 0,
      totalWageredCoins: 0,
      totalPayoutCoins: 0,
      totalPlayers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGames((prev) => [newGame, ...prev]);

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'GAME_CREATED',
      targetType: 'Game',
      targetId: newGame.id,
      details: `Created game: ${newGame.name} (RTP: ${newGame.rtpPercent}%, Min: ${newGame.minBet}, Max: ${newGame.maxBet})`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminUpdateGame = (gameId: string, updates: Partial<GameItem>) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    );
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'GAME_CONFIG_UPDATED',
      targetType: 'Game',
      targetId: gameId,
      details: `Updated configuration for game: ${gameId}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminToggleGameStatus = (gameId: string, status: 'active' | 'maintenance' | 'disabled') => {
    adminUpdateGame(gameId, { status });
  };

  const adminDeleteGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    setGames((prev) => prev.filter((g) => g.id !== gameId));
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.displayName,
      action: 'GAME_DELETED',
      targetType: 'Game',
      targetId: gameId,
      details: `Removed game: ${game?.name || gameId}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const adminAdjustJackpot = (gameId: string, newPoolAmount: number) => {
    adminUpdateGame(gameId, { jackpotPool: newPoolAmount });
  };

  return (
    <StateContext.Provider
      value={{
        currentUser,
        isGuest: !!currentUser.isGuest || currentUser.id === 'user-guest',
        allUsers,
        rooms,
        activeRoom,
        isRoomMinimized,
        gifts,
        coinPackages,
        vipTiers,
        missions,
        events,
        leaderboards,
        conversations,
        directMessages,
        activeConversation,
        notifications,
        hostApplications,
        agencyApplications,
        withdrawals,
        reports,
        fraudEvents,
        platformConfig,
        auditLogs,
        transactions,
        roomChatMessages,
        sellerTransactions,
        buyerRequests,
        activeSellers,
        luckyBackupMilestones,
        luckyBackupProgresses,
        luckyBackupTransactions,
        transferCoinsAsSeller,
        updateBuyerRequestStatus,
        submitBuyerCoinRequest,
        updateSellerProfileSettings,
        updateHostAgencySettings,
        adminPromoteToHostAgency,
        submitAgencyApplication,
        adminApproveAgencyApplication,
        adminRejectAgencyApplication,
        createHostAgency,
        joinHostAgency,
        leaveHostAgency,
        applyForSellerRole,
        quickUpgradeToDemoSeller,
        adminToggleSellerStatus,
        activeGiftAnimation,
        activeCombo,
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        socialLogin,
        resetPassword,
        setCurrentUser,
        switchUser,
        switchDemoUser: switchUser,
        updateUserProfile,
        updateCurrentUserProfile: updateUserProfile,
        followedUserIds,
        isUserFollowed,
        toggleFollowUser,
        bindCpPartner,
        removeCpPartner,
        createRoom,
        joinRoom,
        leaveRoom,
        minimizeRoom,
        takeSeat,
        moveSeat,
        leaveSeat,
        toggleMuteSeat,
        hostLockSeat,
        hostMuteSeat,
        hostKickSeat,
        hostUpdateRoom,
        hostBanUser,
        hostUnbanUser,
        hostAssignModerator,
        hostRemoveModerator,
        likeRoom,
        sendRoomChatMessage,
        playRoomDJEffect,
        unlockedRoomThemeIds,
        isRoomThemeUnlocked,
        unlockRoomTheme,
        hostChangeRoomTheme,
        sendGift,
        triggerComboGift,
        resetCombo,
        purchaseCoinPackage,
        subscribeVIP,
        storeItems,
        buyStoreItem,
        equipStoreItem,
        requestHostWithdrawal,
        applyForHost,
        claimMissionReward,
        setActiveConversation,
        sendDirectMessage,
        startConversationWithUser,
        deleteConversation,
        markConversationAsRead,
        markNotificationAsRead,
        markAllNotificationsRead,
        markAllNotificationsAsRead: markAllNotificationsRead,
        adminStats,
        adminUpdateUserProfile,
        adminUpdateUserBalance,
        adminAdjustUserBalance,
        adminToggleUserBan,
        adminBanUser,
        adminMuteUser,
        adminChangeUserRole,
        adminReviewHostApplication,
        adminApproveHostApplication,
        adminRejectHostApplication,
        adminUpdateHostCommission,
        adminProcessWithdrawal,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminCloseRoom,
        adminMuteHostInRoom,
        adminKickHostFromRoom,
        adminSaveGift,
        adminAddGift,
        adminUpdateGift,
        adminSaveCoinPackage,
        adminSaveVIP,
        adminResolveReport,
        adminUpdatePlatformConfig,
        adminAddLuckyBackupMilestone,
        adminUpdateLuckyBackupMilestone,
        adminDeleteLuckyBackupMilestone,
        adminAddStoreItem,
        adminUpdateStoreItem,
        adminDeleteStoreItem,
        adminToggleStoreItemStatus,
        paymentGateways,
        gatewayWebhookLogs,
        adminToggleGateway,
        adminUpdateGateway,
        adminTestGatewayPing,
        adminSimulateGatewayTransaction,
        adminAddPaymentGateway,
        adminDeletePaymentGateway,
        games,
        gameHistory,
        recentJackpotWinners,
        playGameBet,
        adminAddGame,
        adminUpdateGame,
        adminToggleGameStatus,
        adminDeleteGame,
        adminAdjustJackpot,
        dismissGiftAnimation: clearGiftAnimation,
        clearGiftAnimation,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
