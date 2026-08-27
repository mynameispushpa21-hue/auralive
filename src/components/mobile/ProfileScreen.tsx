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
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Plus,
  RefreshCw,
  X,
  Check,
  LogOut,
  LogIn,
  KeyRound,
  UserPlus,
  Lock,
  Copy,
  Briefcase,
  History,
  Radio,
  Star,
  Globe,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { SocialListModal, SocialModalTab } from './SocialListModal';
import { LevelPrivilegesModal } from './LevelPrivilegesModal';
import { BackpackModal } from './BackpackModal';
import { WalletRecordsModal } from './WalletRecordsModal';
import { AppSettingsModal } from './AppSettingsModal';
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
    switchDemoUser,
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
  const [isWalletRecordsOpen, setIsWalletRecordsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [copiedIdToast, setCopiedIdToast] = useState(false);

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
    <div id="profile-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-[#0B0B0F]">
      {/* Top Action Buttons (Settings Gear & Edit) */}
      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">My Profile</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-[#121217] hover:bg-[#1A1A24] text-slate-300 hover:text-white border border-[#232332] transition-colors"
            title="App Settings & Audio"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 rounded-xl bg-[#121217] hover:bg-[#1A1A24] text-slate-300 hover:text-white border border-[#232332] transition-colors"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
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
        <div className="p-3.5 rounded-2xl bg-[#121217] border border-[#232332] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">My Coins</span>
            <span className="text-base">🪙</span>
          </div>
          <span className="text-lg font-black text-white my-1">{currentUser.coins.toLocaleString()}</span>
          <button
            onClick={onOpenCoinStore}
            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs hover:brightness-110 active:scale-98 transition-all"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Recharge Coins</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121217] border border-[#232332] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300">Host Diamonds</span>
            <span className="text-base">💎</span>
          </div>
          <span className="text-lg font-black text-white my-1">{currentUser.diamonds.toLocaleString()}</span>
          <button
            onClick={onOpenWithdrawal}
            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs hover:brightness-110 active:scale-98 transition-all"
          >
            <DollarSign className="w-3 h-3" />
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

      {/* Navigation Feature Hubs */}
      <div className="space-y-2">
        {/* Coin Reseller & Agent Hub */}
        <button
          onClick={onOpenSellerDashboard}
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

        {/* VIP Center */}
        <button
          onClick={onOpenVIPCenter}
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
          onClick={onOpenHostCenter}
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
          onClick={onOpenMissions}
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

        {/* My Backpack & Wardrobe */}
        <button
          onClick={() => setIsBackpackModalOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-fuchsia-500/40 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
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
          onClick={() => setIsWalletRecordsOpen(true)}
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
      </div>

      {/* Switch Demo Persona */}
      <div className="p-3.5 rounded-2xl bg-[#121217] border border-[#232332]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-violet-400" /> Switch Demo Persona
          </span>
          <span className="text-[10px] text-slate-500">Live Testing Role</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {allUsers.slice(0, 4).map((u) => (
            <button
              key={u.id}
              onClick={() => switchDemoUser(u.id)}
              className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                currentUser.id === u.id
                  ? 'bg-violet-600/20 border-violet-500 text-white shadow-xs'
                  : 'bg-[#1A1A24] border-[#232332] text-slate-400 hover:text-slate-200'
              }`}
            >
              <img src={u.avatar} alt={u.displayName} className="w-7 h-7 rounded-full object-cover shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold truncate text-white">{u.displayName}</p>
                <p className="text-[9px] text-violet-300 font-semibold">{u.isHost ? 'Host' : u.vipTier.toUpperCase()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Account & Security Section */}
      <div className="p-4 rounded-3xl bg-[#121217] border border-[#232332] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Account & Security
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            {currentUser.isGuest ? 'Guest User' : 'Verified'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1A1A24] border border-[#232332]/60">
            <span className="text-slate-400 text-[11px]">Email</span>
            <span className="font-bold text-slate-200">{currentUser.email}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1A1A24] border border-[#232332]/60">
            <span className="text-slate-400 text-[11px]">Username</span>
            <span className="font-bold text-violet-300">@{currentUser.username}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1A1A24] border border-[#232332]/60">
            <span className="text-slate-400 text-[11px]">Country</span>
            <span className="font-bold text-slate-200 flex items-center gap-1">
              <span>{currentUser.countryFlag}</span>
              <span>{currentUser.country || 'United States'}</span>
            </span>
          </div>
        </div>

        {/* Account Actions: Reset Password & Switch Account */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => openAuthModal('forgot_password')}
            className="py-2.5 px-3 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Password</span>
          </button>

          <button
            onClick={() => openAuthModal('login')}
            className="py-2.5 px-3 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-violet-400" />
            <span>Switch Account</span>
          </button>
        </div>

        {/* Sign Out Trigger */}
        {!currentUser.isGuest && (
          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of AuraVoice</span>
          </button>
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
      />

      <WalletRecordsModal
        isOpen={isWalletRecordsOpen}
        onClose={() => setIsWalletRecordsOpen(false)}
      />

      <AppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
