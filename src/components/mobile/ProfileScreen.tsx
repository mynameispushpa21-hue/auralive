import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Crown,
  Coins,
  DollarSign,
  Trophy,
  Settings,
  Edit3,
  Users,
  Heart,
  Eye,
  ChevronRight,
  Sparkles,
  Plus,
  X,
  Check,
  LogOut,
  UserPlus,
  Lock,
  Copy,
  Briefcase,
  History,
  Radio,
  Star,
  Globe,
  ShoppingBag,
  LayoutGrid,
  Grid2X2,
  List,
  Building2,
  Package,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { SocialListModal, SocialModalTab } from './SocialListModal';
import { LevelPrivilegesModal } from './LevelPrivilegesModal';
import { BackpackModal } from './BackpackModal';
import { StoreModal } from './StoreModal';
import { WalletRecordsModal } from './WalletRecordsModal';
import { AppSettingsModal } from './AppSettingsModal';
import { AgencyCenterModal } from './AgencyCenterModal';
import { SellerBadge } from '../reseller/SellerBadge';
import { audioEngine } from '../../services/audioEngine';

interface ProfileScreenProps {
  onOpenCoinStore: () => void;
  onOpenWithdrawal: () => void;
  onOpenVIPCenter: () => void;
  onOpenHostCenter: () => void;
  onOpenMissions: () => void;
  onOpenSellerDashboard?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
];

const COUNTRY_OPTIONS = [
  { name: 'United States', flag: '🇺🇸' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Philippines', flag: '🇵🇭' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'France', flag: '🇫🇷' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenCoinStore,
  onOpenWithdrawal,
  onOpenVIPCenter,
  onOpenHostCenter,
  onOpenMissions,
  onOpenSellerDashboard,
}) => {
  const {
    currentUser,
    updateCurrentUserProfile,
    allUsers,
    platformConfig,
    isAuthenticated,
    isGuest,
    logout,
    openAuthModal,
    removeCpPartner,
  } = useAppState();

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialModalTab, setSocialModalTab] = useState<SocialModalTab>('following');
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isBackpackModalOpen, setIsBackpackModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isAgencyCenterOpen, setIsAgencyCenterOpen] = useState(false);
  const [isWalletRecordsOpen, setIsWalletRecordsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [copiedIdToast, setCopiedIdToast] = useState(false);
  const [featureLayout, setFeatureLayout] = useState<'grid' | 'compact' | 'list'>('grid');

  // Edit form state
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editCountry, setEditCountry] = useState(currentUser.country || 'United States');
  const [editFlag, setEditFlag] = useState(currentUser.countryFlag || '🇺🇸');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>(currentUser.gender || 'female');

  // Keep edit form fields in sync with active user
  useEffect(() => {
    setEditName(currentUser.displayName);
    setEditBio(currentUser.bio || '');
    setEditAvatar(currentUser.avatar);
    setEditCountry(currentUser.country || 'United States');
    setEditFlag(currentUser.countryFlag || '🇺🇸');
    setEditGender(currentUser.gender || 'female');
  }, [currentUser]);

  const currentLevelXp = (currentUser.experiencePoints || 0) % 1000;
  const levelProgress = Math.min(100, Math.round((currentLevelXp / 1000) * 100));

  const handleCopyNumericId = () => {
    const idToCopy = currentUser.numericId || '948201';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(idToCopy);
    }
    setCopiedIdToast(true);
    audioEngine.playSoundEffect('chime');
    setTimeout(() => setCopiedIdToast(false), 2200);
  };

  const handleOpenSocialTab = (tab: SocialModalTab) => {
    setSocialModalTab(tab);
    setIsSocialModalOpen(true);
    audioEngine.playSoundEffect('chime');
  };

  const handleCountryChange = (countryName: string) => {
    const selected = COUNTRY_OPTIONS.find((c) => c.name === countryName);
    if (selected) {
      setEditCountry(selected.name);
      setEditFlag(selected.flag);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      displayName: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim(),
      country: editCountry,
      countryFlag: editFlag,
      gender: editGender,
    });
    audioEngine.playSoundEffect('fanfare');
    setIsEditModalOpen(false);
  };

  return (
    <div id="profile-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-transparent">
      {/* Top Action Buttons (Settings Gear, Edit & LogOut) */}
      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">My Profile</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 rounded-xl bg-[#121217] hover:bg-[#1A1A24] text-slate-300 hover:text-white border border-[#232332] transition-colors"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-[#121217] hover:bg-[#1A1A24] text-slate-300 hover:text-white border border-[#232332] transition-colors"
            title="App Settings & Audio"
          >
            <Settings className="w-4 h-4" />
          </button>
          {!currentUser.isGuest && (
            <button
              onClick={() => setIsSignOutModalOpen(true)}
              className="p-2 rounded-xl bg-[#121217] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-[#232332] transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Info Card */}
      <div className="p-4 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl relative overflow-hidden">
        {/* VIP Glow Background */}
        {currentUser.vipTier !== 'vip_0' && (
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        )}

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar & Frame */}
            <div className="relative cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-16 h-16 rounded-full object-cover ring-3 ring-violet-500 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-violet-600 text-white text-[9px] font-black shadow-xs">
                Lv.{currentUser.level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-extrabold text-white font-display">{currentUser.displayName}</h3>
                <SellerBadge user={currentUser} size="xs" />
                {currentUser.vipTier !== 'vip_0' && (
                  <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[9px] font-black text-white shadow-xs">
                    {currentUser.vipTier.toUpperCase()}
                  </span>
                )}
                <span>{currentUser.countryFlag}</span>
              </div>

              {/* Numeric ID with One-Tap Copy */}
              <button
                onClick={handleCopyNumericId}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mt-0.5 group"
                title="Click to copy ID"
              >
                <span>ID: <strong className="font-mono text-slate-300">{currentUser.numericId || '948201'}</strong></span>
                <Copy className="w-3 h-3 text-slate-500 group-hover:text-violet-400 transition-colors" />
                {copiedIdToast && (
                  <span className="text-[10px] text-emerald-400 font-bold ml-1 animate-pulse">Copied!</span>
                )}
              </button>

              <p className="text-[11px] text-slate-300 italic mt-0.5 line-clamp-1">
                {currentUser.bio || 'Voice stage lover & karaoke enthusiast 🎤'}
              </p>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar (Clickable for Level Privileges Modal) */}
        <div
          onClick={() => setIsLevelModalOpen(true)}
          className="mt-4 pt-3 border-t border-[#232332] cursor-pointer hover:bg-white/5 p-1.5 -mx-1.5 rounded-xl transition-colors group"
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-violet-300 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Level {currentUser.level} Star</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="text-slate-400">{currentLevelXp} / 1,000 XP ({levelProgress}%)</span>
          </div>
          <div className="w-full bg-[#1A1A24] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Interactive Social Counters Row */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#232332] text-center">
          <button
            onClick={() => handleOpenSocialTab('following')}
            className="p-1.5 rounded-xl hover:bg-white/5 transition-colors text-center"
          >
            <span className="text-sm font-black text-white block">{currentUser.followingCount}</span>
            <p className="text-[10px] text-slate-400">Following</p>
          </button>
          <button
            onClick={() => handleOpenSocialTab('followers')}
            className="p-1.5 rounded-xl hover:bg-white/5 transition-colors text-center"
          >
            <span className="text-sm font-black text-white block">{currentUser.followersCount.toLocaleString()}</span>
            <p className="text-[10px] text-slate-400">Followers</p>
          </button>
          <button
            onClick={() => handleOpenSocialTab('likes')}
            className="p-1.5 rounded-xl hover:bg-white/5 transition-colors text-center"
          >
            <span className="text-sm font-black text-pink-400 block">{(currentUser.likesReceived || 1280).toLocaleString()}</span>
            <p className="text-[10px] text-slate-400">Likes</p>
          </button>
          <button
            onClick={() => handleOpenSocialTab('visitors')}
            className="p-1.5 rounded-xl hover:bg-white/5 transition-colors text-center"
          >
            <span className="text-sm font-black text-violet-400 block">{(currentUser.visitorsCount || 342).toLocaleString()}</span>
            <p className="text-[10px] text-slate-400">Visitors</p>
          </button>
        </div>
      </div>

      {/* CP Partner Space */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-900/20 to-rose-900/20 border border-pink-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Heart className="w-16 h-16 text-pink-500" />
        </div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <h4 className="text-xs font-bold text-pink-100">CP Space</h4>
          </div>
          {currentUser.cpPartnerId && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to break up with your CP?")) {
                  removeCpPartner();
                }
              }}
              className="text-[10px] text-slate-400 hover:text-rose-400"
            >
              Break up
            </button>
          )}
        </div>
        <div className="relative z-10">
          {currentUser.cpPartnerId ? (() => {
            const partner = allUsers.find(u => u.id === currentUser.cpPartnerId);
            return (
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <img src={currentUser.avatar} alt="Me" className="w-12 h-12 rounded-full ring-2 ring-pink-500/50 object-cover" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-pink-200 bg-pink-500/20 px-2 py-0.5 rounded-full">Lv.{currentUser.cpLevel || 1}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <img src={partner?.avatar || 'https://i.pravatar.cc/150?u=unknown'} alt="Partner" className="w-12 h-12 rounded-full ring-2 ring-pink-500/50 object-cover" />
                </div>
              </div>
            );
          })() : (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <span className="text-xs text-slate-400 text-center">No CP yet. Go find your voice soulmate in the live rooms!</span>
              <span className="text-[10px] text-pink-400/70 border border-pink-500/20 rounded-full px-2 py-0.5">Costs 500 🪙 to propose</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Wallet Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div 
          className="relative overflow-hidden p-3.5 rounded-2xl border border-white/60 shadow-lg shadow-amber-500/20 flex flex-col justify-between"
          style={{ background: 'radial-gradient(circle at 55% 55%, #fff000 0%, #ffb300 45%, #ff8c00 75%, #ffdfc4 100%)' }}
        >
          {/* Glossy top sheen overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/5 pointer-events-none rounded-2xl" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 tracking-tight">My Coins</span>
            <span className="text-base drop-shadow-xs">🪙</span>
          </div>
          <span className="relative z-10 text-lg font-black text-slate-950 my-1 tracking-tight">{currentUser.coins.toLocaleString()}</span>
          <button
            onClick={onOpenCoinStore}
            className="relative z-10 w-full py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-950 text-white font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-sm border border-white/25 hover:brightness-110 active:scale-98 transition-all backdrop-blur-xs"
          >
            <Plus className="w-3 h-3 text-amber-400 stroke-[3]" />
            <span>Recharge Coins</span>
          </button>
        </div>

        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-br from-[#fba794] via-[#b69bf9] to-[#5fe3e8] border border-white/60 shadow-lg shadow-purple-500/20 flex flex-col justify-between">
          {/* Glossy top sheen overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/5 pointer-events-none rounded-2xl" />

          {/* Sparkle lens flare in bottom-right corner from image */}
          <div className="absolute bottom-1 right-1.5 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-5 h-5 bg-white/40 rounded-full blur-[2px] absolute" />
            <span className="text-white text-xs drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]">✦</span>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 tracking-tight">Host Diamonds</span>
            <span className="text-base drop-shadow-xs">💎</span>
          </div>
          <span className="relative z-10 text-lg font-black text-slate-950 my-1 tracking-tight">{currentUser.diamonds.toLocaleString()}</span>
          <button
            onClick={onOpenWithdrawal}
            className="relative z-10 w-full py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-950 text-white font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-sm border border-white/25 hover:brightness-110 active:scale-98 transition-all backdrop-blur-xs"
          >
            <DollarSign className="w-3 h-3 text-emerald-300" />
            <span>Cash Payout</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Conversion Banner */}
      {(isGuest || currentUser.isGuest) && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-violet-900/40 via-fuchsia-900/40 to-amber-900/40 border border-violet-500/40 text-center space-y-2.5 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">✨</span>
            <h4 className="text-xs font-black text-white">You're Exploring in Guest Mode</h4>
          </div>
          <p className="text-[11px] text-slate-300">
            Create a free AuraVoice account to claim <span className="text-amber-300 font-bold">1,000 Free Coins 🪙</span>, save your level progress, and unlock VIP privileges!
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => openAuthModal('login')}
              className="py-2 px-3 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-white border border-[#232332] text-xs font-bold transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:brightness-110 transition-all"
            >
              Sign Up (+1K 🪙)
            </button>
          </div>
        </div>
      )}

      {/* Navigation Feature Hubs - Grid View */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-violet-400" /> Services & Features
          </span>
        </div>

        {/* 2-Column Grid View (Default) */}
        {featureLayout === 'grid' && (
          <div className="grid grid-cols-2 gap-2.5">
            {/* VIP Privilege Center */}
            <button
              id="profile-vip-btn"
              onClick={() => {
                onOpenVIPCenter();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20 group-hover:scale-105 transition-transform">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  {currentUser.vipTier !== 'vip_0' && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-700 border border-teal-500/20">
                      {currentUser.vipTier.toUpperCase()}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">VIP Privilege Center</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">Manage badge, frames & entry</p>
              </div>
            </button>

            {/* Creator & Host Hub */}
            <button
              onClick={() => {
                onOpenHostCenter();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  {currentUser.isHost && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-500/30">
                      HOST
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">Creator & Host Hub</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">Live metrics & commission</p>
              </div>
            </button>

            {/* Missions & Task Rewards */}
            <button
              onClick={() => {
                onOpenMissions();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                    DAILY
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">Missions & Tasks</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">Earn free coins and XP</p>
              </div>
            </button>

            {/* Host Agency Center */}
            <button
              onClick={() => {
                setIsAgencyCenterOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-700 border border-indigo-500/30 group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">Agency Center</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">Join or create Host Agency</p>
              </div>
            </button>

            {/* Item Mall & Store */}
            <button
              onClick={() => {
                setIsStoreModalOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 text-[9px] font-black border border-amber-500/30">
                    LUXURY
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">Luxury Store</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">Frames, rides & thrones</p>
              </div>
            </button>

            {/* My Backpack & Wardrobe */}
            <button
              onClick={() => {
                setIsBackpackModalOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-fuchsia-500/15 text-fuchsia-700 border border-fuchsia-500/30 group-hover:scale-105 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">Backpack & Wardrobe</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">Equip avatar frames & rides</p>
              </div>
            </button>

            {/* Wallet Statement & Records */}
            <button
              onClick={() => {
                setIsWalletRecordsOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-700 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                  <History className="w-4 h-4" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">Wallet Records</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">Coin history, gifts & cashouts</p>
              </div>
            </button>

            {/* Coin Reseller & Agent Hub */}
            <button
              onClick={() => {
                onOpenSellerDashboard?.();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3.5 rounded-2xl border border-white/60 hover:border-teal-300 flex flex-col justify-between text-left transition-all duration-200 group active:scale-[0.98] shadow-md relative overflow-hidden min-h-[104px]"
              style={{
                background: 'radial-gradient(circle at 75% 70%, rgba(72, 206, 193, 0.6) 0%, rgba(255, 255, 255, 0.9) 60%, #ffffff 100%)'
              }}
            >
              <div className="flex items-center justify-between w-full mb-2 relative z-10">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-500/20 text-amber-900 uppercase border border-amber-500/30">
                    {currentUser.role === 'seller' || currentUser.role === 'agent' ? 'MERCHANT' : 'AGENCY'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1">Reseller & Agent Portal</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 group-hover:text-teal-700 transition-colors">
                  {currentUser.role === 'seller' || currentUser.role === 'agent'
                    ? `Inventory: ${currentUser.coins.toLocaleString()} 🪙`
                    : 'Wholesale coin minting & dispatches'}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Compact 4-Column Matrix View */}
        {featureLayout === 'compact' && (
          <div className="grid grid-cols-4 gap-2">
            {/* VIP Center */}
            <button
              onClick={() => {
                onOpenVIPCenter();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-violet-500/40 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">VIP Center</span>
            </button>

            {/* Creator Hub */}
            <button
              onClick={() => {
                onOpenHostCenter();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-amber-500/40 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">Host Hub</span>
            </button>

            {/* Missions */}
            <button
              onClick={() => {
                onOpenMissions();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-emerald-500/40 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">Missions</span>
            </button>

            {/* Agency */}
            <button
              onClick={() => {
                setIsAgencyCenterOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-indigo-500/40 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">Agency</span>
            </button>

            {/* Item Mall */}
            <button
              onClick={() => {
                setIsStoreModalOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-violet-950/20 border border-violet-500/30 hover:border-fuchsia-500/50 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[8px] font-black bg-amber-500 text-slate-950">
                NEW
              </span>
              <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 text-white mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white line-clamp-1 w-full">Item Mall</span>
            </button>

            {/* Backpack */}
            <button
              onClick={() => {
                setIsBackpackModalOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-fuchsia-500/40 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">Backpack</span>
            </button>

            {/* Wallet Records */}
            <button
              onClick={() => {
                setIsWalletRecordsOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-cyan-500/40 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform">
                <History className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">Records</span>
            </button>

            {/* Reseller Hub */}
            <button
              onClick={() => {
                onOpenSellerDashboard?.();
                audioEngine.playSoundEffect('chime');
              }}
              className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-400 flex flex-col items-center justify-center text-center transition-all group active:scale-95 relative"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-amber-300 line-clamp-1 w-full">Reseller</span>
            </button>
          </div>
        )}

        {/* List View (Classic Stacked) */}
        {featureLayout === 'list' && (
          <div className="space-y-2">
            {/* VIP Center */}
            <button
              onClick={() => {
                onOpenVIPCenter();
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-violet-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">VIP Privilege Center</h4>
                  <p className="text-[10px] text-slate-400">Manage badge, frames & entry effects</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* Creator & Host Hub */}
            <button
              onClick={() => {
                onOpenHostCenter();
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-amber-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Creator & Host Hub</h4>
                  <p className="text-[10px] text-slate-400">Live streaming metrics & commission share</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* Missions & Task Rewards */}
            <button
              onClick={() => {
                onOpenMissions();
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-emerald-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Missions & Task Rewards</h4>
                  <p className="text-[10px] text-slate-400">Earn free daily coins and leveling XP</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* Host Agency Center */}
            <button
              onClick={() => {
                setIsAgencyCenterOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-indigo-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Agency Center</h4>
                  <p className="text-[10px] text-slate-400">Join or create a Host Agency</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* Item Mall & Avatar Store */}
            <button
              onClick={() => {
                setIsStoreModalOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#151522] to-fuchsia-950/30 border border-violet-500/30 hover:border-violet-500/60 flex items-center justify-between transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 text-white group-hover:scale-105 transition-transform shadow-md shadow-fuchsia-500/20">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white">Item Mall & Store</h4>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">
                      NEW
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Buy avatar frames, entrance rides, bubbles & badges</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-violet-400 group-hover:text-white transition-colors" />
            </button>

            {/* My Backpack & Wardrobe */}
            <button
              onClick={() => {
                setIsBackpackModalOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-fuchsia-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 group-hover:scale-105 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">My Backpack & Wardrobe</h4>
                  <p className="text-[10px] text-slate-400">Equip avatar frames, entry rides & bubbles</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* Wallet Records & History */}
            <button
              onClick={() => {
                setIsWalletRecordsOpen(true);
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-cyan-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                  <History className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Wallet Statement & Records</h4>
                  <p className="text-[10px] text-slate-400">Past coin purchases, gift receipts & cashouts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* Coin Reseller & Agent Hub */}
            <button
              onClick={() => {
                onOpenSellerDashboard?.();
                audioEngine.playSoundEffect('chime');
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#161622] to-[#121217] border border-amber-500/40 hover:border-amber-400 flex items-center justify-between transition-all group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white">Coin Reseller & Agent Portal</h4>
                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-500 text-slate-950 uppercase">
                      {currentUser.role === 'seller' || currentUser.role === 'agent' ? 'MERCHANT' : 'AGENCY'}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-300/80">
                    {currentUser.role === 'seller' || currentUser.role === 'agent'
                      ? `Active Inventory: ${currentUser.coins.toLocaleString()} 🪙 • Wholesale Dispatches`
                      : 'Wholesale coin minting, direct transfers & live orders'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-[#121217] border border-[#232332] rounded-3xl p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
                <h3 className="font-bold text-sm text-white">Edit Profile Details</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5 my-4 text-xs">
                {/* Avatar Preview & Preset Selection */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">Avatar Image</label>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={editAvatar}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-violet-500 shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-[11px] text-slate-400 mb-1">Pick a preset or paste an image URL:</p>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                        {PRESET_AVATARS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditAvatar(url)}
                            className={`w-8 h-8 rounded-full overflow-hidden ring-2 shrink-0 transition-all ${
                              editAvatar === url ? 'ring-violet-400 scale-110' : 'ring-transparent opacity-70'
                            }`}
                          >
                            <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-[11px] focus:outline-hidden focus:border-violet-400"
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    maxLength={30}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Bio / Status</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={2}
                    maxLength={150}
                    placeholder="Tell everyone what you love to chat about..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                  />
                </div>

                {/* Country & Flag Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Country</label>
                    <select
                      value={editCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value as 'male' | 'female' | 'other')}
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                    >
                      <option value="female">👩 Female</option>
                      <option value="male">👨 Male</option>
                      <option value="other">✨ Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-black text-xs shadow-md hover:brightness-110 active:scale-98 transition-all"
                >
                  Save Profile Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {isSignOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-[#121217] border border-[#232332] rounded-3xl p-5 shadow-2xl text-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-black text-white">Log Out Confirmation</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to log out of <span className="text-white font-bold">{currentUser.displayName}</span>? You will enter guest mode.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsSignOutModalOpen(false)}
                  className="py-2.5 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 font-bold text-xs border border-[#232332]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsSignOutModalOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
                >
                  Confirm Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <SocialListModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        initialTab={socialModalTab}
      />

      <LevelPrivilegesModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
      />

      <BackpackModal
        isOpen={isBackpackModalOpen}
        onClose={() => setIsBackpackModalOpen(false)}
        onOpenVIPCenter={() => {
          setIsBackpackModalOpen(false);
          onOpenVIPCenter();
        }}
        onOpenStore={() => {
          setIsBackpackModalOpen(false);
          setIsStoreModalOpen(true);
        }}
      />

      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onOpenCoinStore={() => {
          setIsStoreModalOpen(false);
          onOpenCoinStore();
        }}
        onOpenBackpack={() => {
          setIsStoreModalOpen(false);
          setIsBackpackModalOpen(true);
        }}
      />

      <WalletRecordsModal
        isOpen={isWalletRecordsOpen}
        onClose={() => setIsWalletRecordsOpen(false)}
      />

      <AppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <AgencyCenterModal
        isOpen={isAgencyCenterOpen}
        onClose={() => setIsAgencyCenterOpen(false)}
      />
    </div>
  );
};
