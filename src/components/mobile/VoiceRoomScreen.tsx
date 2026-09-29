import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Heart,
  Gift,
  Share2,
  ChevronDown,
  Music,
  Radio,
  Send,
  Sparkles,
  Users,
  Shield,
  MoreVertical,
  Plus,
  Flame,
  X,
  Crown,
  Disc,
  Copy,
  Zap,
  Palette,
  Gem,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { audioEngine } from '../../services/audioEngine';
import { MicSeat, UserProfile } from '../../types';
import { GiftComboButton } from './GiftComboButton';
import { SellerBadge } from '../reseller/SellerBadge';
import { RoomSettingsModal } from './RoomSettingsModal';
import { ShareRoomModal } from './ShareRoomModal';
import { RoomLeaderboardModal } from './RoomLeaderboardModal';
import { RoomAudienceModal } from './RoomAudienceModal';
import { CoupleMicSeatPair } from './CoupleMicSeatPair';
import { Settings, Trophy } from 'lucide-react';

interface VoiceRoomScreenProps {
  onOpenGiftModal: (targetUser?: UserProfile | null) => void;
  onOpenGiftMarketplace?: (targetUser?: UserProfile | null) => void;
  onOpenCoinStore: () => void;
  onOpenBuyCoinsFromSeller?: () => void;
  isGiftModalOpen?: boolean;
}

export const VoiceRoomScreen: React.FC<VoiceRoomScreenProps> = ({
  onOpenGiftModal,
  onOpenGiftMarketplace,
  onOpenCoinStore,
  onOpenBuyCoinsFromSeller,
  isGiftModalOpen = false,
}) => {
  const {
    activeRoom,
    currentUser,
    leaveRoom,
    minimizeRoom,
    takeSeat,
    leaveSeat,
    toggleMuteSeat,
    hostLockSeat,
    hostMuteSeat,
    hostKickSeat,
    hostBanUser,
    likeRoom,
    sendRoomChatMessage,
    playRoomDJEffect,
    roomChatMessages,
    toggleFollowUser,
    isUserFollowed,
    activeCombo,
    triggerComboGift,
    resetCombo,
    bindCpPartner,
    allUsers,
    hostUpdateRoom,
    activeGiftAnimation,
  } = useAppState();

  const [chatInput, setChatInput] = useState('');
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [selectedSeatForAction, setSelectedSeatForAction] = useState<MicSeat | null>(null);
  const [cpWireLightPairs, setCpWireLightPairs] = useState<Record<number, boolean>>({});
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [floatingGifts, setFloatingGifts] = useState<
    {
      id: number;
      icon: string;
      senderName: string;
      receiverName: string;
      giftName: string;
      count: number;
      startX: number;
    }[]
  >([]);

  useEffect(() => {
    if (activeGiftAnimation) {
      const count = activeGiftAnimation.comboStreak || activeGiftAnimation.count || 1;
      const countToSpawn = Math.min(Math.max(count, 1), 6);
      const newItems = Array.from({ length: countToSpawn }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        icon: activeGiftAnimation.gift.icon,
        senderName: activeGiftAnimation.senderName,
        receiverName: activeGiftAnimation.receiverName,
        giftName: activeGiftAnimation.gift.name,
        count: count,
        startX: 12 + Math.random() * 76,
      }));
      setFloatingGifts((prev) => [...prev.slice(-14), ...newItems]);
    }
  }, [activeGiftAnimation]);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isRealMicActive, setIsRealMicActive] = useState(false);
  const [localMicVolume, setLocalMicVolume] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInitialView, setSettingsInitialView] = useState<'main' | 'moderators' | 'banned' | 'background'>('main');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [copiedIdToast, setCopiedIdToast] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeRoom) return;
    const idToCopy = String(activeRoom.roomIdNumber || activeRoom.host.numericId || '201650');
    navigator.clipboard?.writeText(idToCopy);
    setCopiedIdToast(true);
    setTimeout(() => setCopiedIdToast(false), 2000);
  };

  if (!activeRoom) return null;

  const messages = roomChatMessages[activeRoom.id] || [];
  const isHost = activeRoom.hostId === currentUser.id;
  const isCoHost = activeRoom.coHostIds.includes(currentUser.id);
  const isModerator = isHost || isCoHost || activeRoom.moderatorIds.includes(currentUser.id);

  const currentUserSeat = activeRoom.seats.find((s) => s.userId === currentUser.id);
  const isOnSeat = !!currentUserSeat;

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Handle Like Animation
  const handleLike = () => {
    likeRoom(activeRoom.id);
    const newHeart = { id: Date.now() + Math.random(), x: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts((prev) => [...prev.slice(-15), newHeart]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendRoomChatMessage(activeRoom.id, chatInput.trim());
    setChatInput('');
  };

  // Toggle Real Microphone
  const handleToggleRealMic = async () => {
    if (isRealMicActive) {
      audioEngine.stopMicrophoneCapture();
      setIsRealMicActive(false);
      setLocalMicVolume(0);
    } else {
      const ok = await audioEngine.startMicrophoneCapture((vol, isSpeaking) => {
        setLocalMicVolume(vol);
      });
      setIsRealMicActive(ok);
    }
  };

  const handleToggleAmbient = () => {
    const next = audioEngine.toggleAmbientMusic();
    setIsAmbientPlaying(next);
  };

  // Ensure each user ID appears on at most ONE seat in the room (strictly deduplicate)
  const sanitizedSeats = React.useMemo(() => {
    if (!activeRoom || !activeRoom.seats) return [];
    const seenUserIds = new Set<string>();
    return activeRoom.seats.map((seat, index) => {
      const s = { ...seat, seatIndex: seat.seatIndex !== undefined ? seat.seatIndex : index };
      const effectiveUserId = s.userId || s.user?.id || null;
      if (!effectiveUserId) {
        return { ...s, userId: null, user: null, isSpeaking: false, volumeLevel: 0 };
      }
      if (seenUserIds.has(effectiveUserId)) {
        // DUPLICATE USER ID DETECTED: Automatically vacate this duplicate seat!
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
      const userObj = allUsers.find((u) => u.id === effectiveUserId) || s.user || null;
      return { ...s, userId: effectiveUserId, user: userObj };
    });
  }, [activeRoom?.seats, allUsers]);

  // Group sanitized seats into couple pairs (NO. 1 & NO. 2, NO. 3 & NO. 4, etc. matching screenshot)
  const seatPairs = React.useMemo(() => {
    const pairs: { seatLeft: MicSeat; seatRight?: MicSeat; pairIndex: number }[] = [];
    for (let i = 0; i < sanitizedSeats.length; i += 2) {
      pairs.push({
        seatLeft: sanitizedSeats[i],
        seatRight: sanitizedSeats[i + 1],
        pairIndex: Math.floor(i / 2),
      });
    }
    return pairs;
  }, [sanitizedSeats]);

  const toggleCpWireLight = (pairIdx: number) => {
    setCpWireLightPairs((prev) => {
      const next = !prev[pairIdx];
      if (next) {
        audioEngine.playSoundEffect('magic');
      }
      return { ...prev, [pairIdx]: next };
    });
  };

  const handleSeatCpPartner = (targetSeatIndex: number) => {
    if (!activeRoom) return;
    const partnerId = currentUser.cpPartnerId;
    const partner = partnerId ? allUsers.find((u) => u.id === partnerId) : null;
    if (partner) {
      // 1. Remove partner from ANY existing seat first so their ID never shows twice!
      // 2. Assign partner to targetSeatIndex
      const updatedSeats = activeRoom.seats.map((s, idx) => {
        const currentSeatIndex = s.seatIndex !== undefined ? s.seatIndex : idx;
        if (currentSeatIndex === targetSeatIndex) {
          return {
            ...s,
            seatIndex: targetSeatIndex,
            userId: partner.id,
            user: partner,
            isMuted: false,
            isSpeaking: false,
            volumeLevel: 0,
          };
        }
        if (s.userId === partner.id || s.user?.id === partner.id) {
          return {
            ...s,
            seatIndex: currentSeatIndex,
            userId: null,
            user: null,
            isMuted: false,
            isSpeaking: false,
            volumeLevel: 0,
          };
        }
        return {
          ...s,
          seatIndex: currentSeatIndex,
        };
      });
      hostUpdateRoom(activeRoom.id, { seats: updatedSeats });
      audioEngine.playSoundEffect('magic');
    }
  };

  return (
    <div
      id="voice-room-container"
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden ${
        activeRoom.backgroundTheme.startsWith('from-')
          ? `bg-gradient-to-b ${activeRoom.backgroundTheme}`
          : activeRoom.backgroundTheme
      } text-slate-100 select-none`}
    >
      {/* Floating Hearts Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ y: '100%', opacity: 1, scale: 0.8, x: `${h.x}%` }}
            animate={{ y: '-20%', opacity: 0, scale: 1.4, x: `${h.x + (Math.random() * 20 - 10)}%` }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute bottom-16 text-2xl"
          >
            {['❤️', '💖', '🔥', '✨', '🌟', '🎉'][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>

      {/* Floating Gifts Layer during Live Voice Session */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
        {floatingGifts.map((fg) => (
          <motion.div
            key={fg.id}
            initial={{ y: '100%', opacity: 0, scale: 0.6, x: `${fg.startX}%` }}
            animate={{
              y: '-25%',
              opacity: [0, 1, 1, 0.9, 0],
              scale: [0.6, 1.25, 1.1, 0.9],
              x: `${fg.startX + (Math.random() * 20 - 10)}%`,
            }}
            transition={{ duration: 3.2, ease: 'easeOut' }}
            className="absolute bottom-20 flex flex-col items-center pointer-events-none"
          >
            <div className="relative">
              <span className="text-4xl drop-shadow-[0_0_14px_rgba(245,158,11,0.9)] animate-bounce inline-block">
                {fg.icon}
              </span>
              {fg.count > 1 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[9px] shadow-md border border-white/60">
                  x{fg.count}
                </span>
              )}
            </div>
            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#0a0a14]/85 backdrop-blur-md border border-violet-500/40 text-[10px] font-bold text-amber-300 whitespace-nowrap shadow-lg flex items-center gap-1">
              <span className="text-violet-200">{fg.senderName}</span>
              <span className="text-amber-400">🎁</span>
              <span className="text-pink-300">{fg.receiverName}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TOP BAR: Room Header & Host Info (Styled to match requested design) */}
      <div className="relative z-10 px-3 pt-3 pb-2 flex items-center justify-between bg-[#060c18]/85 backdrop-blur-md border-b border-[#0f1d36]/60">
        {/* Host Avatar & Details Capsule */}
        <div className="flex items-center gap-2 bg-[#091528]/90 border border-[#143054] rounded-full pl-1.5 pr-2.5 py-1 backdrop-blur-md shadow-xs max-w-[56%]">
          <div className="relative shrink-0">
            <img
              src={activeRoom.host.avatar}
              alt={activeRoom.host.displayName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#00e5ff] shadow-sm"
            />
          </div>

          <div className="text-left flex flex-col justify-center min-w-0 pr-0.5">
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-xs font-bold text-white truncate max-w-[65px]">
                {activeRoom.host.displayName}
              </span>
              <span className="text-amber-400 text-xs select-none">⚡</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#00e5ff] font-medium leading-tight mt-0.5">
              <span>ID:</span>
              <span className="font-mono">{activeRoom.roomIdNumber || activeRoom.host.numericId || '201650'}</span>
              <button
                onClick={handleCopyId}
                className="p-0.5 text-[#00e5ff]/80 hover:text-white transition-colors"
                title="Copy ID"
              >
                <Copy className="w-2.5 h-2.5 inline" />
              </button>
            </div>
          </div>

          {/* Host Action Button: Only displays "Joined" if user follows this host, otherwise "+ Follow" */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (activeRoom.hostId !== currentUser.id) {
                toggleFollowUser(activeRoom.hostId);
              }
            }}
            className={`ml-auto shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              activeRoom.hostId === currentUser.id
                ? 'bg-[#182338]/80 text-slate-400 border-slate-700/30 cursor-default'
                : isUserFollowed(activeRoom.hostId)
                ? 'bg-[#182338] hover:bg-[#202e48] text-slate-300 border-slate-700/40 shadow-xs'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00e5ff] border-cyan-500/50 shadow-xs active:scale-95'
            }`}
            title={
              activeRoom.hostId === currentUser.id
                ? 'Host'
                : isUserFollowed(activeRoom.hostId)
                ? 'Unfollow Host'
                : 'Follow Host'
            }
          >
            {activeRoom.hostId === currentUser.id
              ? 'Host'
              : isUserFollowed(activeRoom.hostId)
              ? 'Joined'
              : '+ Follow'}
          </button>
        </div>

        {/* Right Info: Audience, Zap/Boost, Settings, Exit */}
        <div className="flex items-center gap-2">
          {/* Audience pill */}
          <button
            onClick={() => setShowAudienceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#091528]/90 border border-[#143054] text-[#00e5ff] text-xs font-semibold hover:bg-[#0d1e38] transition-colors shadow-xs"
            title="Live Audience"
          >
            <Users className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>{activeRoom.audienceCount}</span>
          </button>

          {/* Lightning Zap Boost button */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="w-8 h-8 rounded-full bg-[#091528]/90 border border-cyan-500/60 flex items-center justify-center text-pink-500 hover:border-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-xs"
            title="Room Hot Ranking & Boost"
          >
            <Zap className="w-4 h-4 text-pink-500 fill-pink-500/20" />
          </button>

          {/* Room Theme Customization (Host only) */}
          {isHost && (
            <button
              onClick={() => {
                setSettingsInitialView('background');
                setShowSettings(true);
              }}
              className="w-8 h-8 rounded-full bg-[#091528]/90 border border-violet-500/60 flex items-center justify-center text-violet-300 hover:text-white hover:border-violet-400 hover:scale-105 active:scale-95 transition-all shadow-xs"
              title="Stage Themes & Backgrounds"
            >
              <Palette className="w-4 h-4 text-violet-400" />
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-full bg-[#091528]/90 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 hover:scale-105 active:scale-95 transition-all shadow-xs"
            title="Room Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Exit / Close button */}
          <button
            onClick={() => setShowExitDialog(true)}
            className="w-8 h-8 rounded-full bg-[#35101a]/95 border border-rose-600/50 flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-900/80 hover:scale-105 active:scale-95 transition-all shadow-xs"
            title="Exit / Minimize Room"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ROOM TITLE BANNER */}
      <div className="relative z-10 px-4 py-2 bg-gradient-to-r from-transparent via-[#121217]/90 to-transparent flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-black text-white">{activeRoom.title}</h2>
      </div>

      {/* ANNOUNCEMENT BANNER */}
      {activeRoom.announcement && (
        <div className="relative z-10 px-4 py-1.5 bg-violet-950/40 border-b border-violet-500/20 flex items-center justify-between text-xs text-violet-200">
          <div className="flex items-center gap-1.5 truncate">
            <Radio className="w-3.5 h-3.5 text-violet-400 shrink-0 animate-pulse" />
            <span className="truncate">{activeRoom.announcement}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded-xs shrink-0">
            {activeRoom.category}
          </span>
        </div>
      )}

      {/* STAGE: COUPLE MICROPHONE SEATS GRID (Matching screenshot: 2-column paired capsules with wire light) */}
      <div className="relative z-10 flex-1 px-3 py-2 flex flex-col justify-start overflow-y-auto min-h-0">
        {/* CP Status Header */}
        <div className="flex items-center justify-between px-2 mb-2 max-w-sm mx-auto w-full shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#c8b7a4]">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]" />
            <span className="tracking-wide">Couple Mic Seats</span>
          </div>
          <button
            onClick={() => toggleCpWireLight(0)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
              cpWireLightPairs[0]
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : 'bg-[#221c17]/90 text-amber-200/90 border-[#3f3427] hover:border-pink-500/50'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 text-pink-300" />
            <span>{cpWireLightPairs[0] ? 'Wire Light: ON 💕' : 'CP Wire Light'}</span>
          </button>
        </div>

        {/* 2-Column Couple Capsules */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 max-w-sm mx-auto w-full pb-4 pt-0.5">
          {seatPairs.map((pair) => (
            <CoupleMicSeatPair
              key={`pair-${pair.pairIndex}`}
              pairIndex={pair.pairIndex}
              seatLeft={pair.seatLeft}
              seatRight={pair.seatRight}
              currentUser={currentUser}
              isRealMicActive={isRealMicActive}
              localMicVolume={localMicVolume}
              isModerator={isModerator}
              isSimulatedCp={cpWireLightPairs[pair.pairIndex] || false}
              onSelectSeatForAction={(seat) => setSelectedSeatForAction(seat)}
              onTakeSeat={(seatIndex) => takeSeat(seatIndex)}
            />
          ))}
        </div>
      </div>

      {/* SEAT ACTION POPUP (When tapping an occupied seat) */}
      <AnimatePresence>
        {selectedSeatForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-[#121217] border border-[#232332] rounded-2xl p-4 shadow-2xl text-slate-100 text-center"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedSeatForAction(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedSeatForAction.user ? (
                <div className="flex flex-col items-center mb-3">
                  <div className="relative mb-2">
                    <img
                      src={selectedSeatForAction.user.avatar}
                      alt={selectedSeatForAction.user.displayName}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-500"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                      NO. {selectedSeatForAction.seatIndex + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center flex-wrap">
                    <h4 className="font-bold text-sm text-white">{selectedSeatForAction.user.displayName}</h4>
                    <SellerBadge user={selectedSeatForAction.user} size="xs" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono text-slate-300 bg-[#1A1A24] px-2 py-0.5 rounded-full border border-slate-700/50">
                      UID: {selectedSeatForAction.user.numericId || selectedSeatForAction.user.id}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded-full">
                      Lv.{selectedSeatForAction.user.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px] truncate">{selectedSeatForAction.user.bio || 'Voice room enthusiast'}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-[#251d18] border border-[#3e3227] flex items-center justify-center text-amber-200/90 mb-2 shadow-inner">
                    <span className="font-bold text-sm">NO. {selectedSeatForAction.seatIndex + 1}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Seat NO. {selectedSeatForAction.seatIndex + 1} (Vacant)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Microphone seat is currently open</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-bold">
                {/* Empty Seat Options */}
                {!selectedSeatForAction.userId && (
                  <>
                    {!selectedSeatForAction.isLocked && (
                      <button
                        onClick={() => {
                          takeSeat(selectedSeatForAction.seatIndex);
                          setSelectedSeatForAction(null);
                        }}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white col-span-2 shadow-md hover:brightness-110 flex items-center justify-center gap-1.5"
                      >
                        <Mic className="w-4 h-4" />
                        <span>
                          {isOnSeat
                            ? `Switch to Seat NO. ${selectedSeatForAction.seatIndex + 1}`
                            : `Sit in Seat NO. ${selectedSeatForAction.seatIndex + 1}`}
                        </span>
                      </button>
                    )}

                    {/* Seat CP Partner on this vacant seat */}
                    <button
                      onClick={() => {
                        handleSeatCpPartner(selectedSeatForAction.seatIndex);
                        setSelectedSeatForAction(null);
                      }}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white flex items-center justify-center gap-1.5 col-span-2 shadow-md hover:brightness-110"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Seat My CP Partner ({allUsers.find((u) => u.id === currentUser.cpPartnerId)?.displayName || 'Partner'}) Here 💕</span>
                    </button>
                  </>
                )}

                {/* CP Wire Light Toggle */}
                <button
                  onClick={() => {
                    const pIdx = Math.floor(selectedSeatForAction.seatIndex / 2);
                    toggleCpWireLight(pIdx);
                    setSelectedSeatForAction(null);
                  }}
                  className="p-2 rounded-xl bg-[#221a18] hover:bg-[#2e2320] text-amber-200 border border-[#48372b] col-span-2 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Toggle Wire Light (Pair {Math.floor(selectedSeatForAction.seatIndex / 2) + 1})</span>
                </button>

                {!selectedSeatForAction.userId && isModerator && (
                  <button
                    onClick={() => {
                      hostLockSeat(activeRoom.id, selectedSeatForAction.seatIndex);
                      setSelectedSeatForAction(null);
                    }}
                    className="p-2.5 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-200 border border-[#232332] col-span-2"
                  >
                    {selectedSeatForAction.isLocked ? 'Unlock Seat' : 'Lock Seat'}
                  </button>
                )}

                {selectedSeatForAction.user && (
                  <button
                    onClick={() => {
                      if (selectedSeatForAction.user) {
                        onOpenGiftModal(selectedSeatForAction.user);
                        setSelectedSeatForAction(null);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white flex items-center justify-center gap-1.5 col-span-2 shadow-md hover:brightness-110"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Send Gift to Speaker</span>
                  </button>
                )}

                {(selectedSeatForAction.user?.role === 'seller' || selectedSeatForAction.user?.role === 'agent' || selectedSeatForAction.user?.isSeller) && (
                  <button
                    onClick={() => {
                      if (onOpenBuyCoinsFromSeller) {
                        onOpenBuyCoinsFromSeller();
                      } else {
                        onOpenCoinStore();
                      }
                      setSelectedSeatForAction(null);
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black flex items-center justify-center gap-1.5 col-span-2 shadow-md hover:brightness-110"
                  >
                    <span>🪙</span>
                    <span>Buy Coins from Verified Merchant (-20%)</span>
                  </button>
                )}

                {/* CP Partner Active or Propose */}
                {selectedSeatForAction.user && selectedSeatForAction.userId !== currentUser.id && (
                  selectedSeatForAction.user.id === currentUser.cpPartnerId || selectedSeatForAction.user.cpPartnerId === currentUser.id ? (
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-pink-950/80 to-rose-950/80 border border-pink-500/70 text-pink-200 col-span-2 flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                      <Heart className="w-4 h-4 fill-pink-500 text-pink-300" />
                      <span>CP Partner Connected 💕 (Wire Light Active)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedSeatForAction.user) {
                          const success = bindCpPartner(selectedSeatForAction.user.id, 500, 'ring_1');
                          if (success) {
                             alert(`Congratulations! You are now CP with ${selectedSeatForAction.user.displayName}`);
                          } else {
                             alert('Not enough coins to form CP! (Costs 500 coins)');
                          }
                          setSelectedSeatForAction(null);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center gap-1.5 col-span-2 shadow-md hover:brightness-110"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Propose CP (500 🪙)</span>
                    </button>
                  )
                )}

                {selectedSeatForAction.userId === currentUser.id && (
                  <button
                    onClick={() => {
                      leaveSeat();
                      setSelectedSeatForAction(null);
                    }}
                    className="p-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-rose-400 border border-rose-500/30 col-span-2"
                  >
                    Leave Microphone Seat
                  </button>
                )}

                {isModerator && selectedSeatForAction.userId !== currentUser.id && (
                  <>
                    <button
                      onClick={() => {
                        hostMuteSeat(activeRoom.id, selectedSeatForAction.seatIndex);
                        setSelectedSeatForAction(null);
                      }}
                      className="p-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-200 border border-[#232332]"
                    >
                      {selectedSeatForAction.isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    </button>

                    <button
                      onClick={() => {
                        hostKickSeat(activeRoom.id, selectedSeatForAction.seatIndex);
                        setSelectedSeatForAction(null);
                      }}
                      className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800"
                    >
                      Kick to Audience
                    </button>

                    <button
                      onClick={() => {
                        if (selectedSeatForAction.userId) {
                          hostBanUser(activeRoom.id, selectedSeatForAction.userId);
                          hostKickSeat(activeRoom.id, selectedSeatForAction.seatIndex);
                          setSelectedSeatForAction(null);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 col-span-2"
                    >
                      Ban User from Room
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DJ SOUNDBOARD TRAY (Synthesized audio effects) */}
      <AnimatePresence>
        {showSoundboard && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 px-4 py-2 bg-[#0B0B0F]/90 border-t border-[#232332] backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-violet-300 flex items-center gap-1">
                <Disc className="w-3.5 h-3.5 animate-spin text-violet-400" /> DJ Room Soundboard
              </span>
              <button
                onClick={handleToggleAmbient}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                  isAmbientPlaying
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#1A1A24] border-[#232332] text-slate-400'
                }`}
              >
                {isAmbientPlaying ? '🎵 Chill Synth ON' : '🔇 Chill Synth OFF'}
              </button>
            </div>

            <div className="grid grid-cols-6 gap-1.5 text-center">
              {[
                { type: 'airhorn', icon: '📯', label: 'Air Horn' },
                { type: 'applause', icon: '👏', label: 'Applause' },
                { type: 'cheer', icon: '🎉', label: 'Cheer' },
                { type: 'fanfare', icon: '🎺', label: 'Fanfare' },
                { type: 'engine', icon: '🏎️', label: 'Supercar' },
                { type: 'chime', icon: '✨', label: 'Magic' },
              ].map((fx) => (
                <button
                  key={fx.type}
                  onClick={() => playRoomDJEffect(fx.type as any)}
                  className="p-1.5 rounded-xl bg-[#1A1A24] hover:bg-violet-600/30 border border-[#232332] hover:border-violet-500 transition-all flex flex-col items-center justify-center active:scale-90"
                >
                  <span className="text-base">{fx.icon}</span>
                  <span className="text-[9px] font-semibold text-slate-300 truncate w-full">{fx.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT MESSAGES FEED */}
      <div className="relative z-10 px-4 py-2 h-36 overflow-y-auto no-scrollbar flex flex-col gap-1.5 mask-gradient" ref={chatScrollRef}>
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="text-[11px] font-semibold text-violet-300/90 bg-violet-950/30 px-2.5 py-1 rounded-lg self-start border border-violet-500/20 backdrop-blur-2xs">
                📢 {msg.message}
              </div>
            );
          }

          if (msg.type === 'join') {
            return (
              <div key={msg.id} className="text-[10px] font-medium text-slate-300 bg-[#0B0B0F]/60 px-2 py-0.5 rounded-full self-start border border-[#232332]/50">
                👋 {msg.message}
              </div>
            );
          }

          if (msg.type === 'gift' && msg.giftData) {
            return (
              <div
                key={msg.id}
                className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-amber-500/30 px-2.5 py-1 rounded-xl self-start border border-violet-500/40 shadow-xs"
              >
                <span className="text-base">{msg.giftData.giftIcon}</span>
                <span className="text-violet-300">{msg.sender.displayName}</span>
                <span className="text-slate-300">sent {msg.giftData.giftCount}x {msg.giftData.giftName} to</span>
                <span className="text-fuchsia-300">{msg.giftData.receiverName}</span>
              </div>
            );
          }

          const bubbleSkin =
            msg.sender.equippedBubble === 'bubble_neon'
              ? 'bg-violet-950/80 border-violet-500/50 text-violet-100'
              : msg.sender.equippedBubble === 'bubble_gold'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-100'
              : msg.sender.equippedBubble === 'bubble_sakura'
              ? 'bg-pink-950/80 border-pink-500/50 text-pink-100'
              : msg.sender.equippedBubble === 'bubble_cyber'
              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-100'
              : msg.sender.equippedBubble === 'bubble_dragon'
              ? 'bg-red-950/80 border-red-500/50 text-red-100'
              : 'bg-[#0B0B0F]/60 border-[#232332]/40 text-slate-100';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-1.5 text-xs px-2.5 py-1 rounded-xl self-start max-w-[85%] backdrop-blur-2xs border ${bubbleSkin}`}
            >
              <span className="font-bold text-violet-300 shrink-0">{msg.sender.displayName}:</span>
              <span className="break-words">{msg.message}</span>
            </div>
          );
        })}
      </div>

      {/* Floating Gift Combo Button (shown in voice room when gift store modal is not active) */}
      {activeCombo && !isGiftModalOpen && (
        <div className="absolute bottom-16 right-4 z-40">
          <GiftComboButton
            combo={activeCombo}
            onComboPress={() => triggerComboGift()}
            onExpire={() => resetCombo()}
          />
        </div>
      )}

      {/* BOTTOM CONTROLS & CHAT INPUT BAR */}
      <div className="relative z-10 px-3 py-2 bg-[#0B0B0F]/80 border-t border-[#232332] backdrop-blur-lg flex items-center gap-2">
        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="flex-1 flex items-center bg-[#1A1A24] rounded-full px-3 py-1.5 border border-[#232332] focus-within:border-violet-500">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Say something friendly..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-hidden"
          />
          <button type="submit" className="text-violet-400 hover:text-violet-300 ml-1">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Mic Control */}
        {isOnSeat ? (
          <button
            onClick={() => {
              toggleMuteSeat();
              handleToggleRealMic();
            }}
            className={`p-2 rounded-full transition-all shadow-md ${
              currentUserSeat?.isMuted
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-500 text-slate-950 font-bold'
            }`}
            title={currentUserSeat?.isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {currentUserSeat?.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        ) : (
          <button
            onClick={() => takeSeat(0)}
            className="p-2 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-violet-300 border border-violet-500/40"
            title="Request Mic Seat"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        {/* DJ Soundboard button */}
        <button
          onClick={() => setShowSoundboard(!showSoundboard)}
          className={`p-2 rounded-full border transition-all ${
            showSoundboard
              ? 'bg-violet-600 border-violet-500 text-white'
              : 'bg-[#1A1A24] border-[#232332] text-slate-300 hover:text-white'
          }`}
          title="DJ Soundboard"
        >
          <Music className="w-4 h-4" />
        </button>


        {/* Gift Marketplace Modal Button */}
        <button
          id="voice-room-gift-marketplace-button"
          onClick={() => (onOpenGiftMarketplace ? onOpenGiftMarketplace(null) : onOpenGiftModal(null))}
          className="p-2 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-amber-300 border border-amber-500/40 shadow-inner active:scale-95 transition-transform"
          title="Gift Marketplace (Browse & Animations)"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Gift Button */}
        <button
          id="voice-room-gift-button"
          onClick={() => onOpenGiftModal(null)}
          className="p-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white shadow-lg shadow-violet-500/25 active:scale-95 transition-transform"
          title="Send Gifts"
        >
          <Gift className="w-4 h-4" />
        </button>

        {/* Like Heart Button */}
        <button
          onClick={handleLike}
          className="p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-400 active:scale-90 transition-transform"
          title="Send Love"
        >
          <Heart className="w-4 h-4 fill-rose-500/60" />
        </button>
      </div>
      {/* ROOM SETTINGS MODAL */}
      {showSettings && (
        <RoomSettingsModal
          room={activeRoom}
          initialView={settingsInitialView}
          onClose={() => {
            setShowSettings(false);
            setSettingsInitialView('main');
          }}
        />
      )}
      <ShareRoomModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} room={activeRoom} />
      <RoomAudienceModal isOpen={showAudienceModal} onClose={() => setShowAudienceModal(false)} />
      {showLeaderboard && <RoomLeaderboardModal roomId={activeRoom.id} onClose={() => setShowLeaderboard(false)} />}

      {/* Toast for ID Copied */}
      {copiedIdToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-[#091528]/95 border border-cyan-500/50 text-[#00e5ff] text-xs font-semibold shadow-xl backdrop-blur-md animate-fade-in flex items-center gap-1.5">
          <span>✓</span>
          <span>Room ID Copied to clipboard!</span>
        </div>
      )}

      {/* Exit / Minimize Options Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-xs p-5 rounded-3xl bg-[#091528] border border-[#143054] shadow-2xl text-center space-y-3 text-white"
          >
            <h3 className="font-bold text-sm text-white">Leave or Minimize?</h3>
            <p className="text-xs text-slate-400">Keep listening in the background or exit the voice room?</p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowExitDialog(false);
                  minimizeRoom(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-cyan-600/20 border border-cyan-500/50 text-[#00e5ff] font-bold text-xs hover:bg-cyan-600/30 transition-colors"
              >
                Minimize Window (Keep Listening)
              </button>
              <button
                onClick={() => {
                  setShowExitDialog(false);
                  leaveRoom();
                }}
                className="w-full py-2.5 rounded-2xl bg-rose-600/20 border border-rose-500/50 text-rose-300 font-bold text-xs hover:bg-rose-600/30 transition-colors"
              >
                Exit Room
              </button>
              <button
                onClick={() => setShowExitDialog(false)}
                className="w-full py-2 rounded-2xl bg-[#142034] text-slate-400 text-xs font-medium hover:bg-[#1b2b46] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
