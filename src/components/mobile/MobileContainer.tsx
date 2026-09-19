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
import { GamesScreen } from './GamesScreen';
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
import { SplashScreen } from './SplashScreen';
import { UserProfile } from '../../types';

export type MobileTab =
  | 'home'
  | 'discover'
  | 'games'
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
  const [showSplash, setShowSplash] = useState(true);
  const [giftTargetUser, setGiftTargetUser] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const handleTriggerSplash = () => setShowSplash(true);
    window.addEventListener('auravoice_trigger_splash', handleTriggerSplash);
    return () => window.removeEventListener('auravoice_trigger_splash', handleTriggerSplash);
  }, []);

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
      className="relative w-full max-w-[430px] h-[880px] max-h-[95vh] app-screens-bg rounded-[44px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] border-8 border-[#1A1A26] overflow-hidden flex flex-col font-sans select-none"
    >
      {/* Full-Screen Gift Animation Overlay (Broadcast across UI) */}
      <GiftAnimationOverlay
        giftAnimation={activeGiftAnimation}
        onDismiss={clearGiftAnimation}
      />

      {/* 5-SECOND SPLASH SCREEN WITH SKIP OPTION ON RIGHT */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            duration={5}
            onFinish={() => setShowSplash(false)}
          />
        )}
      </AnimatePresence>

      {/* TOP STATUS BAR (Time, Notch, 5G, Battery) */}
      <div
        className={`relative z-30 px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold ${
          !isAuthenticated
            ? 'text-[#231A4C] bg-[#FAF8FD] border-b border-[#EBE8F8]'
            : 'text-white bg-black/40 backdrop-blur-md border-b border-white/10'
        }`}
      >
        <span>{currentTime}</span>

        {/* Dynamic Island / Speaker Pill */}
        <div
          className={`w-24 h-4 rounded-full flex items-center justify-center gap-1.5 px-2 shadow-inner ${
            !isAuthenticated ? 'bg-slate-900 border border-slate-700/50' : 'bg-black/80 border border-white/10'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>

        <div className="flex items-center gap-1.5">
          <Wifi className={`w-3.5 h-3.5 ${!isAuthenticated ? 'text-[#3B3463]' : 'text-white/80'}`} />
          <span className={`text-[10px] font-bold ${!isAuthenticated ? 'text-[#5B5CEB]' : 'text-cyan-300'}`}>5G</span>
          <Battery className={`w-4 h-4 ${!isAuthenticated ? 'text-[#231A4C]' : 'text-emerald-400'}`} />
        </div>
      </div>

      {/* TOP APP HEADER (Logo, Coin Pill, Notifications) */}
      {isAuthenticated && (!activeRoom || isRoomMinimized) && (
        <div className="relative z-20 px-4 py-2.5 bg-black/45 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shadow-xs">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-violet-600/30 font-black text-sm">
              A
            </div>
            <div>
              <span className="text-sm font-extrabold text-white font-display tracking-tight group-hover:text-cyan-300 transition-colors drop-shadow-xs">
                Aura
              </span>
              <span className="text-[9px] font-bold text-rose-400 ml-1 px-1.5 py-0.5 rounded-sm bg-rose-500/20 border border-rose-500/30">LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Replay Splash Button */}
            <button
              onClick={() => setShowSplash(true)}
              className="p-1.5 rounded-full text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
              title="Preview Splash Screen"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => setIsCoinStoreOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/70 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all shadow-xs backdrop-blur-sm"
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
              className="relative p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
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
      <div className="relative flex-1 overflow-y-auto no-scrollbar bg-transparent">
        {!isAuthenticated ? (
          /* Enforced Login & Sign Up view on App Open when not authenticated */
          <AuthScreen />
        ) : activeRoom && !isRoomMinimized ? (
          /* If Active Room is open and NOT minimized -> Render full Voice Room Screen */
          <VoiceRoomScreen
            onOpenGiftModal={handleOpenGiftModal}
            onOpenCoinStore={() => setIsCoinStoreOpen(true)}
            onOpenBuyCoinsFromSeller={() => setIsBuyCoinsFromSellerOpen(true)}
            isGiftModalOpen={isGiftModalOpen}
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
                onOpenGames={() => setActiveTab('games')}
              />
            )}
            {activeTab === 'games' && (
              <GamesScreen
                onOpenCoinStore={() => setIsCoinStoreOpen(true)}
                onOpenVIP={() => setActiveTab('vip')}
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
                  onClick={() => toggleMuteSeat()}
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

      {/* BOTTOM NAVIGATION BAR - Capsule Floating Dock matching Screenshot */}
      {(!activeRoom || isRoomMinimized) && (
        <div className="relative z-20 px-3 pb-3 pt-1">
          <div className="relative px-3 py-1.5 rounded-[28px] bg-gradient-to-b from-[#0e1628] to-[#090e1c] border border-[#1e293b]/90 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex items-center justify-between">
            {/* 1. HOME TAB */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative py-1 transition-all group cursor-pointer"
            >
              <Home
                className={`w-[22px] h-[22px] transition-colors stroke-[2.2] ${
                  activeTab === 'home' ? 'text-[#00e5ff] drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors ${
                  activeTab === 'home' ? 'text-[#00e5ff] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                Home
              </span>
              {/* Active Cyan Dot Indicator */}
              <div className="h-1.5 flex items-center justify-center">
                {activeTab === 'home' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>

            {/* 2. DISCOVER TAB */}
            <button
              onClick={() => setActiveTab('discover')}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative py-1 transition-all group cursor-pointer"
            >
              <Compass
                className={`w-[22px] h-[22px] transition-colors stroke-[2] ${
                  activeTab === 'discover' ? 'text-[#00e5ff] drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors ${
                  activeTab === 'discover' ? 'text-[#00e5ff] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                Discover
              </span>
              <div className="h-1.5 flex items-center justify-center">
                {activeTab === 'discover' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>

            {/* 3. CENTER FLOATING ACTION '+' BUTTON */}
            <div className="flex-1 flex flex-col items-center justify-center relative -mt-6">
              {/* Radial Cyan Glow Aura behind button */}
              <div className="absolute inset-0 -m-1 rounded-full bg-[#00e5ff]/25 blur-lg pointer-events-none" />

              <button
                onClick={() => setIsCreateRoomOpen(true)}
                className="relative w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-tr from-[#00e5ff] via-[#38bdf8] to-[#c084fc] shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-90 transition-transform cursor-pointer"
                title="Create Room"
              >
                <div className="w-full h-full rounded-full bg-[#080d1a] flex items-center justify-center border border-cyan-400/20">
                  <Plus className="w-6 h-6 text-[#00e5ff] stroke-[2.8]" />
                </div>
              </button>
            </div>

            {/* 4. MESSAGES TAB */}
            <button
              onClick={() => setActiveTab('messages')}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative py-1 transition-all group cursor-pointer"
            >
              <div className="relative">
                <MessageSquare
                  className={`w-[22px] h-[22px] transition-colors stroke-[2] ${
                    activeTab === 'messages' ? 'text-[#00e5ff] drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {/* Red Circular Notification Badge with '2' */}
                <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#ff2d55] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,45,85,0.85)] border border-white/20 leading-none">
                  {unreadNotifCount > 0 ? unreadNotifCount : 2}
                </span>
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors ${
                  activeTab === 'messages' ? 'text-[#00e5ff] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                Messages
              </span>
              <div className="h-1.5 flex items-center justify-center">
                {activeTab === 'messages' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>

            {/* 5. PROFILE TAB */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative py-1 transition-all group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.displayName}
                  className={`w-[22px] h-[22px] rounded-full object-cover transition-all ring-1.5 ${
                    activeTab === 'profile'
                      ? 'ring-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                      : 'ring-slate-500/70 group-hover:ring-slate-300'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors ${
                  activeTab === 'profile' ? 'text-[#00e5ff] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                Profile
              </span>
              <div className="h-1.5 flex items-center justify-center">
                {activeTab === 'profile' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>
          </div>
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
