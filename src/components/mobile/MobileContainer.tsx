import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Compass,
  Radio,
  MessageSquare,
  User,
  Bell,
  Coins,
  Plus,
  Wifi,
  Battery,
  Maximize2,
  Mic,
  MicOff,
  X,
  Sparkles,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { HomeScreen } from './HomeScreen';
import { DiscoverScreen } from './DiscoverScreen';
import { WalletScreen } from './WalletScreen';
import { MessagesScreen } from './MessagesScreen';
import { ProfileScreen } from './ProfileScreen';
import { VIPCenterScreen } from './VIPCenterScreen';
import { HostCenterScreen } from './HostCenterScreen';
import { MissionsScreen } from './MissionsScreen';
import { EventsScreen } from './EventsScreen';
import { RankingsScreen } from './RankingsScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { VoiceRoomScreen } from './VoiceRoomScreen';
import { AuthScreen } from './AuthScreen';
import { GiftComboButton } from './GiftComboButton';
import { GiftModal } from './GiftModal';
import { CoinStoreModal } from './CoinStoreModal';
import { CreateRoomModal } from './CreateRoomModal';
import { WithdrawalModal } from './WithdrawalModal';
import { GiftAnimationOverlay } from '../animations/GiftAnimationOverlay';
import { AuthModal } from '../auth/AuthModal';
import { CoinSellerDashboard } from '../reseller/CoinSellerDashboard';
import { BuyCoinsFromSellerModal } from '../reseller/BuyCoinsFromSellerModal';
import { TransferCoinsModal } from '../reseller/TransferCoinsModal';
import { UserProfile } from '../../types';

export type MobileTab =
  | 'home'
  | 'discover'
  | 'messages'
  | 'profile'
  | 'wallet'
  | 'vip'
  | 'host_center'
  | 'missions'
  | 'events'
  | 'rankings'
  | 'notifications'
  | 'seller_dashboard';

export const MobileContainer: React.FC = () => {
  const {
    activeRoom,
    isRoomMinimized,
    minimizeRoom,
    leaveRoom,
    currentUser,
    notifications,
    joinRoom,
    activeGiftAnimation,
    clearGiftAnimation,
    toggleMuteSeat,
    isAuthenticated,
    isGuest,
    activeCombo,
    triggerComboGift,
    resetCombo,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isBuyCoinsFromSellerOpen, setIsBuyCoinsFromSellerOpen] = useState(false);
  const [isSellerTransferModalOpen, setIsSellerTransferModalOpen] = useState(false);
  const [giftTargetUser, setGiftTargetUser] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenGiftModal = (user?: UserProfile | null) => {
    setGiftTargetUser(user || null);
    setIsGiftModalOpen(true);
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
  };

  const currentUserSeat = activeRoom?.seats.find((s) => s.userId === currentUser.id);

  return (
    <div
      id="android-device-wrapper"
      className="relative w-full max-w-[430px] h-[880px] max-h-[95vh] bg-[#0B0B0F] rounded-[44px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] border-8 border-[#1A1A26] overflow-hidden flex flex-col font-sans select-none"
    >
      {/* Full-Screen Gift Animation Overlay (Broadcast across UI) */}
      <GiftAnimationOverlay
        giftAnimation={activeGiftAnimation}
        onDismiss={clearGiftAnimation}
      />

      {/* TOP STATUS BAR (Time, Notch, 5G, Battery) */}
      <div className="relative z-30 px-6 pt-3 pb-1 flex items-center justify-between text-xs text-slate-300 font-semibold bg-[#0B0B0F]/90 backdrop-blur-md">
        <span>{currentTime}</span>

        {/* Dynamic Island / Speaker Pill */}
        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>

        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-violet-400">5G</span>
          <Battery className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* TOP APP HEADER (Logo, Coin Pill, Notifications) */}
      {isAuthenticated && (!activeRoom || isRoomMinimized) && (
        <div className="relative z-20 px-4 py-2.5 bg-[#121217]/95 border-b border-[#232332] flex items-center justify-between">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-violet-600/30 font-black text-sm">
              A
            </div>
            <div>
              <span className="text-sm font-extrabold text-white font-display tracking-tight group-hover:text-violet-400 transition-colors">
                AuraVoice
              </span>
              <span className="text-[9px] font-bold text-violet-400 ml-1 px-1.5 py-0.5 rounded-sm bg-violet-500/10 border border-violet-500/20">LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCoinStoreOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A1A24] hover:bg-[#232332] border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-xs"
            >
              <span>🪙</span>
              <span>{currentUser.coins.toLocaleString()}</span>
              <span className="p-0.5 rounded-full bg-amber-500 text-slate-950 ml-0.5">
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-[#1A1A24] transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT ROUTER AREA */}
      <div className="relative flex-1 overflow-y-auto no-scrollbar bg-[#0B0B0F]">
        {!isAuthenticated ? (
          /* Enforced Login & Sign Up view on App Open when not authenticated */
          <AuthScreen />
        ) : activeRoom && !isRoomMinimized ? (
          /* If Active Room is open and NOT minimized -> Render full Voice Room Screen */
          <VoiceRoomScreen
            onOpenGiftModal={handleOpenGiftModal}
            onOpenCoinStore={() => setIsCoinStoreOpen(true)}
            onOpenBuyCoinsFromSeller={() => setIsBuyCoinsFromSellerOpen(true)}
          />
        ) : (
          /* Normal Tab Screen Navigation */
          <>
            {activeTab === 'home' && (
              <HomeScreen
                onJoinRoom={handleJoinRoom}
                onOpenCoinStore={() => setIsCoinStoreOpen(true)}
                onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
                onOpenVIPCenter={() => setActiveTab('vip')}
                onOpenEvents={() => setActiveTab('events')}
                onOpenRankings={() => setActiveTab('rankings')}
              />
            )}
            {activeTab === 'discover' && (
              <DiscoverScreen
                onJoinRoom={handleJoinRoom}
                onOpenRankings={() => setActiveTab('rankings')}
                onOpenEvents={() => setActiveTab('events')}
              />
            )}
            {activeTab === 'wallet' && (
              <WalletScreen
                onOpenCoinStore={() => setIsCoinStoreOpen(true)}
                onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
                onOpenSellerDashboard={() => setActiveTab('seller_dashboard')}
                onOpenBuyCoinsFromSeller={() => setIsBuyCoinsFromSellerOpen(true)}
                onBack={() => setActiveTab('profile')}
              />
            )}
            {activeTab === 'messages' && (
              <MessagesScreen onOpenGiftModal={handleOpenGiftModal} />
            )}
            {activeTab === 'profile' && (
              <ProfileScreen
                onOpenCoinStore={() => setIsCoinStoreOpen(true)}
                onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
                onOpenVIPCenter={() => setActiveTab('vip')}
                onOpenHostCenter={() => setActiveTab('host_center')}
                onOpenMissions={() => setActiveTab('missions')}
                onOpenSellerDashboard={() => setActiveTab('seller_dashboard')}
              />
            )}
            {activeTab === 'seller_dashboard' && (
              <CoinSellerDashboard onBack={() => setActiveTab('profile')} />
            )}
            {activeTab === 'vip' && (
              <VIPCenterScreen
                onOpenCoinStore={() => setIsCoinStoreOpen(true)}
                onBack={() => setActiveTab('profile')}
              />
            )}
            {activeTab === 'host_center' && (
              <HostCenterScreen
                onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
                onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
                onBack={() => setActiveTab('profile')}
              />
            )}
            {activeTab === 'missions' && <MissionsScreen onBack={() => setActiveTab('profile')} />}
            {activeTab === 'events' && (
              <EventsScreen onJoinRoom={handleJoinRoom} onBack={() => setActiveTab('discover')} />
            )}
            {activeTab === 'rankings' && <RankingsScreen onBack={() => setActiveTab('discover')} />}
            {activeTab === 'notifications' && <NotificationsScreen onBack={() => setActiveTab('home')} />}
          </>
        )}
      </div>

      {/* Floating Combo Button when active outside voice room (e.g. from messages/profile) */}
      {isAuthenticated && activeCombo && (!activeRoom || isRoomMinimized) && (
        <div className="absolute bottom-20 right-4 z-40">
          <GiftComboButton
            combo={activeCombo}
            onComboPress={() => triggerComboGift()}
            onExpire={() => resetCombo()}
          />
        </div>
      )}

      {/* FLOATING MINI-PLAYER (When Room is minimized) */}
      <AnimatePresence>
        {activeRoom && isRoomMinimized && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-16 left-3 right-3 z-30 p-2.5 rounded-2xl bg-[#121217]/95 border border-violet-500/40 shadow-2xl backdrop-blur-md flex items-center justify-between text-xs"
          >
            <div
              onClick={() => minimizeRoom(false)}
              className="flex items-center gap-2.5 flex-1 cursor-pointer truncate"
            >
              <div className="relative">
                <img
                  src={activeRoom.host.avatar}
                  alt={activeRoom.host.displayName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-400"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#121217] absolute bottom-0 right-0 animate-pulse" />
              </div>

              <div className="truncate">
                <p className="font-bold text-white truncate">{activeRoom.title}</p>
                <p className="text-[10px] text-violet-300 font-semibold">{activeRoom.category} • {activeRoom.audienceCount} Live</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {currentUserSeat && (
                <button
                  onClick={toggleMuteSeat}
                  className={`p-1.5 rounded-full ${
                    currentUserSeat.isMuted ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}
                  title="Toggle Mic"
                >
                  {currentUserSeat.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              )}

              <button
                onClick={() => minimizeRoom(false)}
                className="p-1.5 rounded-full bg-[#1A1A26] hover:bg-[#252538] text-slate-300"
                title="Expand Room"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={leaveRoom}
                className="p-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-300"
                title="Leave"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION BAR (Flutter standard 5-tab) */}
      {(!activeRoom || isRoomMinimized) && (
        <div className="relative z-20 px-4 py-2 bg-[#121217]/95 border-t border-[#232332] backdrop-blur-lg flex items-center justify-between text-slate-400">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'home' ? 'text-violet-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Party</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'discover' ? 'text-violet-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">Explore</span>
          </button>

          {/* Center Glow Go-Live Button */}
          <button
            onClick={() => setIsCreateRoomOpen(true)}
            className="-mt-5 p-3 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 text-white shadow-lg shadow-violet-500/30 active:scale-95 transition-transform ring-4 ring-[#0B0B0F]"
            title="Create Room"
          >
            <Radio className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'messages' ? 'text-violet-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'profile' ? 'text-violet-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Me</span>
          </button>
        </div>
      )}

      {/* MODALS */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        onOpenCoinStore={() => {
          setIsGiftModalOpen(false);
          setIsCoinStoreOpen(true);
        }}
        onOpenBuyCoinsFromSeller={() => {
          setIsGiftModalOpen(false);
          setIsBuyCoinsFromSellerOpen(true);
        }}
        targetUser={giftTargetUser}
      />

      <CoinStoreModal
        isOpen={isCoinStoreOpen}
        onClose={() => setIsCoinStoreOpen(false)}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

      <BuyCoinsFromSellerModal
        isOpen={isBuyCoinsFromSellerOpen}
        onClose={() => setIsBuyCoinsFromSellerOpen(false)}
      />

      <TransferCoinsModal
        isOpen={isSellerTransferModalOpen}
        onClose={() => setIsSellerTransferModalOpen(false)}
      />
    </div>
  );
};
