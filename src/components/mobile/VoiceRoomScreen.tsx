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

} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { audioEngine } from '../../services/audioEngine';
import { MicSeat, UserProfile } from '../../types';
import { GiftComboButton } from './GiftComboButton';
import { SellerBadge } from '../reseller/SellerBadge';
import { RoomSettingsModal } from './RoomSettingsModal';
import { ShareRoomModal } from './ShareRoomModal';
import { RoomAudienceModal } from './RoomAudienceModal';
import { Settings } from 'lucide-react';

interface VoiceRoomScreenProps {
  onOpenGiftModal: (targetUser?: UserProfile | null) => void;
  onOpenCoinStore: () => void;
  onOpenBuyCoinsFromSeller?: () => void;
}

export const VoiceRoomScreen: React.FC<VoiceRoomScreenProps> = ({
  onOpenGiftModal,
  onOpenCoinStore,
  onOpenBuyCoinsFromSeller,
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
    activeCombo,
    triggerComboGift,
    resetCombo,
    bindCpPartner,
  } = useAppState();

  const [chatInput, setChatInput] = useState('');
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [selectedSeatForAction, setSelectedSeatForAction] = useState<MicSeat | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isRealMicActive, setIsRealMicActive] = useState(false);
  const [localMicVolume, setLocalMicVolume] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
    audioEngine.playSoundEffect('chime');
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

  // Render Seat Grid Class based on seat count
  const getGridColsClass = () => {
    if (activeRoom.seatCount % 5 === 0) return 'grid-cols-5';
    if (activeRoom.seatCount <= 4) return 'grid-cols-4';
    if (activeRoom.seatCount <= 6) return 'grid-cols-3';
    if (activeRoom.seatCount <= 8) return 'grid-cols-4';
    if (activeRoom.seatCount <= 9) return 'grid-cols-3';
    if (activeRoom.seatCount <= 12) return 'grid-cols-4';
    return 'grid-cols-5';
  };

  const isManySeats = activeRoom.seatCount > 12;
  const avatarSizeClass = isManySeats ? 'w-10 h-10' : 'w-14 h-14';
  const labelTextClass = isManySeats ? 'text-[9px]' : 'text-[11px]';

  return (
    <div
      id="voice-room-container"
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b ${activeRoom.backgroundTheme} text-slate-100 select-none`}
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

      {/* TOP BAR: Room Header & Host Info */}
      <div className="relative z-10 px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#232332] bg-[#0B0B0F]/70 backdrop-blur-md">
        {/* Host Avatar & Details */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => minimizeRoom(true)}
            className="p-1.5 rounded-full bg-[#161620]/80 hover:bg-[#232332] text-white/80 transition-colors border border-[#232332]"
            title="Minimize Room"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-[#121217]/90 pr-3 p-1 rounded-full border border-[#232332]">
            <div className="relative">
              <img
                src={activeRoom.host.avatar}
                alt={activeRoom.host.displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500"
              />
              <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-violet-600 text-[8px] font-black text-white">
                Lv{activeRoom.host.level}
              </span>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white max-w-[90px] truncate">
                  {activeRoom.host.displayName}
                </span>
                <Crown className="w-3 h-3 text-amber-400 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-300 flex items-center gap-1">
                <span>{activeRoom.host.countryFlag}</span>
                <span>ID: {activeRoom.roomIdNumber}</span>
              </p>
            </div>

            {activeRoom.hostId !== currentUser.id && (
              <button
                onClick={() => toggleFollowUser(activeRoom.hostId)}
                className="ml-1 p-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105 transition-transform"
                title="Follow Host"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            )}
          </div>
        </div>

        {/* Right Info: Live Audience & Likes */}
        <div className="flex items-center gap-2">
          {/* Audience pill */}
          <button 
            onClick={() => setShowAudienceModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#121217]/90 border border-[#232332] text-xs font-bold hover:bg-[#1A1A24] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Users className="w-3 h-3 text-slate-300" />
            <span>{activeRoom.audienceCount}</span>
          </button>

          {/* Hot Score */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold">
            <Flame className="w-3 h-3 text-violet-400 fill-violet-400" />
            <span>{activeRoom.hotScore.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-300 transition-colors"
            title="Share Room"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {(isHost || isModerator) && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-300 transition-colors"
              title="Room Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={leaveRoom}
            className="p-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 transition-colors"
            title="Leave Room"
          >
            <X className="w-4 h-4" />
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

      {/* STAGE: MICROPHONE SEATS GRID */}
      <div className="relative z-10 flex-1 px-4 py-3 flex flex-col justify-start overflow-y-auto no-scrollbar mask-gradient">
        <div className={`grid ${getGridColsClass()} ${isManySeats ? 'gap-2' : 'gap-3'} max-w-full mx-auto w-full pb-4`}>
          {activeRoom.seats.map((seat) => {
            const isUserHere = seat.userId === currentUser.id;
            const isHostSeat = seat.seatIndex === 0;
            const effectiveSpeaking = isUserHere && isRealMicActive ? localMicVolume > 15 : seat.isSpeaking;

            return (
              <div
                key={seat.seatIndex}
                className="flex flex-col items-center justify-center cursor-pointer group"
                onClick={() => {
                  if (seat.userId || isModerator) {
                    setSelectedSeatForAction(seat);
                  } else {
                    if (!seat.isLocked) {
                      takeSeat(seat.seatIndex);
                    }
                  }
                }}
              >
                {/* Seat Avatar or Empty Circle */}
                <div className="relative flex items-center justify-center">
                  {/* Speaking Wave Ripple */}
                  {effectiveSpeaking && !seat.isMuted && (
                    <div className="absolute -inset-2 rounded-full border-2 border-violet-400/80 animate-ping pointer-events-none" />
                  )}

                  {seat.user ? (
                    <motion.div
                      key={`user-${seat.user.id}`}
                      initial={{ opacity: 0, y: 15, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="relative"
                    >
                      <img
                        src={seat.user.avatar}
                        alt={seat.user.displayName}
                        className={`${avatarSizeClass} rounded-full object-cover shadow-lg transition-transform group-hover:scale-105 ${
                          effectiveSpeaking && !seat.isMuted
                            ? 'ring-4 ring-violet-500 shadow-violet-500/50'
                            : 'ring-2 ring-[#2B2B3D]'
                        }`}
                      />

                      {/* VIP Badge */}
                      {seat.user.vipTier !== 'vip_0' && (
                        <span className="absolute -top-1.5 -right-1 px-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[8px] font-black text-white shadow-xs">
                          VIP
                        </span>
                      )}

                      {/* Verified Seller Pin */}
                      {(seat.user.role === 'seller' || seat.user.role === 'agent' || seat.user.isSeller) && (
                        <span className="absolute -top-1.5 -left-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[7px] font-black tracking-tight shadow-md flex items-center gap-0.5">
                          <span>✓</span>
                          <span>SELLER</span>
                        </span>
                      )}

                      {/* Mic Status Pill */}
                      <div
                        className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-md text-white text-[10px] ${
                          seat.isMuted ? 'bg-rose-600' : 'bg-emerald-500'
                        }`}
                      >
                        {seat.isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                      </div>

                      {isHostSeat && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[9px] font-black tracking-tight">
                          HOST
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <div
                      className={`${avatarSizeClass} rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                        seat.isLocked
                          ? 'border-[#232332] bg-[#0B0B0F]/60 text-slate-500'
                          : 'border-white/20 bg-[#121217]/50 hover:border-violet-500 hover:bg-[#1A1A24] text-slate-300'
                      }`}
                    >
                      {seat.isLocked ? (
                        <Lock className={`${isManySeats ? 'w-3 h-3' : 'w-4 h-4'} text-slate-500`} />
                      ) : (
                        <>
                          <Mic className={`${isManySeats ? 'w-3 h-3' : 'w-4 h-4'} opacity-60`} />
                          {!isManySeats && <span className="text-[9px] font-bold mt-0.5">{seat.seatIndex + 1}</span>}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Seat Label */}
                <span className={`mt-1.5 ${labelTextClass} font-semibold text-slate-200 truncate ${isManySeats ? 'max-w-[40px]' : 'max-w-[70px]'} text-center`}>
                  {seat.user ? seat.user.displayName : `Seat ${seat.seatIndex + 1}`}
                </span>
              </div>
            );
          })}
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

              {selectedSeatForAction.user && (
                <div className="flex flex-col items-center mb-3">
                  <div className="relative mb-2">
                    <img
                      src={selectedSeatForAction.user.avatar}
                      alt={selectedSeatForAction.user.displayName}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 justify-center flex-wrap">
                    <h4 className="font-bold text-sm text-white">{selectedSeatForAction.user.displayName}</h4>
                    <SellerBadge user={selectedSeatForAction.user} size="xs" />
                  </div>
                  <p className="text-xs text-slate-400">{selectedSeatForAction.user.bio || 'Voice enthusiast'}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-bold">
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

                {selectedSeatForAction.userId !== currentUser.id && (
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

          return (
            <div key={msg.id} className="flex items-start gap-1.5 text-xs bg-[#0B0B0F]/60 px-2.5 py-1 rounded-xl self-start max-w-[85%] backdrop-blur-2xs border border-[#232332]/40">
              <span className="font-bold text-violet-300 shrink-0">{msg.sender.displayName}:</span>
              <span className="text-slate-100 break-words">{msg.message}</span>
            </div>
          );
        })}
      </div>

      {/* Floating Gift Combo Button */}
      {activeCombo && (
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


        {/* Gift Button */}
        <button
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
        <RoomSettingsModal room={activeRoom} onClose={() => setShowSettings(false)} />
      )}
      <ShareRoomModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} room={activeRoom} />
      <RoomAudienceModal isOpen={showAudienceModal} onClose={() => setShowAudienceModal(false)} />
    </div>
  );
};
