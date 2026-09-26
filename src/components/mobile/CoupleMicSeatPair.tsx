import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Lock, Heart, Crown, Sparkles } from 'lucide-react';
import { MicSeat, UserProfile } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { VIPBadge } from './VIPBadge';

// Cozy rounded Armchair icon exactly matching the screenshot
export const ArmchairIcon: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6 text-[#c4b5a5]',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rounded Backrest */}
    <path
      d="M10 5.5 C10 4.2 11.2 3.2 12.8 3.2 L19.2 3.2 C20.8 3.2 22 4.2 22 5.5 L22 17 C22 17.5 21.5 18 21 18 L11 18 C10.5 18 10 17.5 10 17 Z"
      opacity="0.95"
    />
    {/* Left Armrest */}
    <path
      d="M6 12 C6 10.3 7.3 9 9 9 L10.5 9 C11.3 9 12 9.7 12 10.5 L12 21 C12 21.8 11.3 22.5 10.5 22.5 L8.5 22.5 C7.1 22.5 6 21.4 6 20 Z"
    />
    {/* Right Armrest */}
    <path
      d="M21.5 9 L23 9 C24.7 9 26 10.3 26 12 L26 20 C26 21.4 24.9 22.5 23.5 22.5 L21.5 22.5 C20.7 22.5 20 21.8 20 21 L20 10.5 C20 9.7 20.7 9 21.5 9 Z"
    />
    {/* Center Seat Cushion */}
    <path
      d="M9.8 14.5 L22.2 14.5 C22.9 14.5 23.6 15.1 23.6 15.8 L23.6 19.5 C23.6 21 22.3 22.2 20.8 22.2 L11.2 22.2 C9.7 22.2 8.4 21 8.4 19.5 L8.4 15.8 C8.4 15.1 9.1 14.5 9.8 14.5 Z"
    />
    {/* Legs */}
    <rect x="8.5" y="22.2" width="2.2" height="2.8" rx="1" opacity="0.85" />
    <rect x="21.3" y="22.2" width="2.2" height="2.8" rx="1" opacity="0.85" />
  </svg>
);

interface CoupleMicSeatPairProps {
  seatLeft: MicSeat;
  seatRight?: MicSeat;
  pairIndex: number;
  currentUser: UserProfile;
  isRealMicActive: boolean;
  localMicVolume: number;
  isModerator: boolean;
  isSimulatedCp?: boolean;
  onSelectSeatForAction: (seat: MicSeat) => void;
  onTakeSeat: (seatIndex: number) => void;
}

export const CoupleMicSeatPair: React.FC<CoupleMicSeatPairProps> = ({
  seatLeft,
  seatRight,
  pairIndex,
  currentUser,
  isRealMicActive,
  localMicVolume,
  isModerator,
  isSimulatedCp = false,
  onSelectSeatForAction,
  onTakeSeat,
}) => {
  const userL = seatLeft.user;
  const userR = seatRight?.user;

  // Check if both seats in this pair are occupied by CP partners (strictly different users)
  const isActualCp = Boolean(
    userL &&
      userR &&
      userL.id !== userR.id &&
      (userL.cpPartnerId === userR.id ||
        userR.cpPartnerId === userL.id ||
        (currentUser.cpPartnerId &&
          ((userL.id === currentUser.id && userR.id === currentUser.cpPartnerId) ||
            (userR.id === currentUser.id && userL.id === currentUser.cpPartnerId))))
  );

  const isWireLightOn = isActualCp || isSimulatedCp;

  // Sound effect when CP partner connects
  const wasLightOnRef = useRef(false);
  useEffect(() => {
    if (isWireLightOn && !wasLightOnRef.current) {
      audioEngine.playSoundEffect('magic');
    }
    wasLightOnRef.current = isWireLightOn;
  }, [isWireLightOn]);

  const renderSeatCircle = (seat: MicSeat | undefined, isLeft: boolean) => {
    if (!seat) return null;

    const isUserHere = seat.userId === currentUser.id;
    const isHostSeat = seat.seatIndex === 0;
    const effectiveSpeaking = isUserHere && isRealMicActive ? localMicVolume > 15 : seat.isSpeaking;

    return (
      <div
        className="flex flex-col items-center cursor-pointer group w-[40%] max-w-[3rem] aspect-square"
        onClick={() => {
          if (seat.userId || isModerator) {
            onSelectSeatForAction(seat);
          } else {
            if (!seat.isLocked) {
              onTakeSeat(seat.seatIndex);
            }
          }
        }}
      >
        {/* Seat Disc */}
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Speaking Wave Ripple */}
          {effectiveSpeaking && !seat.isMuted && (
            <div className="absolute -inset-2 rounded-full border-2 border-violet-400/80 animate-ping pointer-events-none" />
          )}

          {seat.user ? (
            <motion.div
              key={`seat-${seat.seatIndex}-user-${seat.user.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative w-full h-full"
            >
              <img
                src={seat.user.avatar}
                alt={seat.user.displayName}
                className={`w-full h-full rounded-full object-cover shadow-md transition-transform group-hover:scale-105 ${
                  seat.user.avatarFrame === 'frame_gold'
                    ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-[#121217]'
                    : seat.user.avatarFrame === 'frame_neon'
                    ? 'ring-3 ring-fuchsia-500 ring-offset-2 ring-offset-[#121217]'
                    : seat.user.avatarFrame === 'frame_diamond'
                    ? 'ring-3 ring-cyan-400 ring-offset-2 ring-offset-[#121217]'
                    : seat.user.avatarFrame === 'frame_sakura'
                    ? 'ring-3 ring-pink-400 ring-offset-2 ring-offset-[#121217]'
                    : isWireLightOn
                    ? 'ring-2 ring-pink-400 ring-offset-1 ring-offset-[#121217] shadow-pink-500/40'
                    : effectiveSpeaking && !seat.isMuted
                    ? 'ring-3 ring-violet-500 shadow-violet-500/50'
                    : 'ring-1.5 ring-[#3d342a]'
                }`}
              />

              {/* VIP Badge */}
              <VIPBadge
                userId={seat.user.id}
                user={seat.user}
                variant="badge-only"
                size="xs"
                className="absolute -top-1 -right-1 z-10 scale-75 origin-top-right"
              />

              {/* Verified Seller Pin */}
              {(seat.user.role === 'seller' || seat.user.role === 'agent' || seat.user.isSeller) && (
                <span className="absolute -top-1 -left-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[6px] font-black tracking-tight shadow-md flex items-center gap-0.5 z-10">
                  ✓
                </span>
              )}

              {/* Mic Status Pill */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full shadow-md text-white text-[9px] z-10 ${
                  seat.isMuted ? 'bg-rose-600' : 'bg-emerald-500'
                }`}
              >
                {seat.isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
              </div>

              {/* Host Crown */}
              {isHostSeat && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[7px] font-black tracking-tight flex items-center gap-0.5 shadow-sm z-10">
                  <Crown className="w-2 h-2" />
                </span>
              )}
            </motion.div>
          ) : (
            <div
              className={`w-full h-full rounded-full flex flex-col items-center justify-center transition-all shadow-inner ${
                seat.isLocked
                  ? 'bg-[#231d17]/80 border border-[#3a3026] text-slate-500'
                  : 'bg-[#352e26]/85 hover:bg-[#423930] border border-[#4a4034]/70 text-[#c2b6a8]'
              }`}
            >
              {seat.isLocked ? (
                <Lock className="w-4 h-4 text-amber-500/70" />
              ) : (
                <ArmchairIcon className="w-1/2 h-1/2 text-[#c4b5a5] opacity-90 transition-transform group-hover:scale-105" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full h-full min-h-0 justify-center">
      {/* Elongated Capsule with Wire */}
      <div
        className={`relative w-full max-w-full rounded-[40px] py-1.5 px-2 flex items-center justify-between transition-all duration-500 shrink min-h-0 ${
          isWireLightOn
            ? 'bg-gradient-to-r from-pink-950/60 via-[#2a1728]/80 to-amber-950/50 border border-pink-500/70 shadow-[0_0_18px_rgba(244,63,94,0.4)]'
            : 'bg-[#26201b]/80 border border-[#3b3329]/70 backdrop-blur-xs'
        }`}
      >
        {/* Left Seat */}
        {renderSeatCircle(seatLeft, true)}

        {/* Connecting Wire in Middle ("jab cp partner bethe to mid me wire ki light On Hojaye") */}
        <div className="relative flex-1 mx-1.5 h-6 flex items-center justify-center">
          <svg
            viewBox="0 0 54 24"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* CP Neon Wire Gradient */}
              <linearGradient id={`cpWireGradient-${pairIndex}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#ff007a" />
                <stop offset="75%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Wire Glow Filter */}
              <filter id={`wireGlow-${pairIndex}`} x="-30%" y="-40%" width="160%" height="180%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {isWireLightOn ? (
              <>
                {/* 1. Base Neon Glow Wire */}
                <motion.path
                  d="M 0,12 L 10,12 L 14,8 L 18,16 L 22,6 L 26,18 L 30,7 L 34,16 L 38,12 L 54,12"
                  fill="none"
                  stroke={`url(#cpWireGradient-${pairIndex})`}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#wireGlow-${pairIndex})`}
                />

                {/* 2. Electric Traveling Laser Pulse on the Wire */}
                <motion.path
                  d="M 0,12 L 10,12 L 14,8 L 18,16 L 22,6 L 26,18 L 30,7 L 34,16 L 38,12 L 54,12"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5 7"
                  animate={{ strokeDashoffset: [0, -24] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />

                {/* 3. Outer Pulsing Atmosphere */}
                <motion.path
                  d="M 0,12 L 10,12 L 14,8 L 18,16 L 22,6 L 26,18 L 30,7 L 34,16 L 38,12 L 54,12"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="5"
                  opacity="0.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                />
              </>
            ) : (
              /* Normal Unlit Wire */
              <path
                d="M 0,12 L 10,12 L 14,8 L 18,16 L 22,6 L 26,18 L 30,7 L 34,16 L 38,12 L 54,12"
                fill="none"
                stroke="#554b3e"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {/* Glowing Center CP Energy Heart & Sparkles when wire light is ON */}
          {isWireLightOn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="relative flex items-center justify-center"
              >
                <Heart className="w-4 h-4 text-pink-300 fill-pink-500 drop-shadow-[0_0_8px_#ec4899]" />
                <div className="absolute -inset-1 rounded-full bg-pink-500/40 animate-ping" />
              </motion.div>

              {/* Floating Sparkles & Love Hearts */}
              <motion.span
                animate={{ y: [-2, -14], opacity: [0, 1, 0], scale: [0.7, 1.1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                className="absolute -top-1 pointer-events-none text-[8px]"
              >
                ✨
              </motion.span>
            </div>
          )}
        </div>

        {/* Right Seat */}
        {seatRight && renderSeatCircle(seatRight, false)}
      </div>

      {/* CP Linked Indicator Badge */}
      <AnimatePresence>
        {isWireLightOn && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-0.5 flex items-center gap-1 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-amber-500/20 border border-pink-500/40 px-2 py-0.2 rounded-full"
          >
            <Sparkles className="w-2.5 h-2.5 text-pink-300 animate-pulse" />
            <span className="text-[8px] font-black text-pink-200 tracking-wider">CP LINKED 💕</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seat Labels below the capsule: NO. 1 and NO. 2 (matching screenshot) */}
      <div className="w-full flex items-start justify-between px-2 mt-1.5 text-center">
        {/* Left Label */}
        <div className="flex-1 flex flex-col items-center max-w-[50%]">
          <span className="text-[11px] font-bold tracking-widest text-[#9d8e7e] uppercase">
            NO. {seatLeft.seatIndex + 1}
          </span>
          {seatLeft.user ? (
            <span className="text-[10px] font-semibold text-slate-200 truncate max-w-[62px]">
              {seatLeft.user.displayName}
            </span>
          ) : (
            <span className="text-[9px] text-[#786c5f]">Vacant</span>
          )}
          {seatLeft.user && seatLeft.receivedDiamonds !== undefined && seatLeft.receivedDiamonds > 0 && (
            <div className="mt-0.5 flex items-center justify-center gap-0.5 bg-[#0B0B0F]/70 px-1.5 py-0.2 rounded-full border border-violet-500/30">
              <span className="text-[7px]">💎</span>
              <span className="text-[7px] font-bold text-violet-300">
                {seatLeft.receivedDiamonds >= 1000
                  ? (seatLeft.receivedDiamonds / 1000).toFixed(1) + 'k'
                  : seatLeft.receivedDiamonds}
              </span>
            </div>
          )}
        </div>

        {/* Right Label */}
        {seatRight && (
          <div className="flex-1 flex flex-col items-center max-w-[50%]">
            <span className="text-[11px] font-bold tracking-widest text-[#9d8e7e] uppercase">
              NO. {seatRight.seatIndex + 1}
            </span>
            {seatRight.user ? (
              <span className="text-[10px] font-semibold text-slate-200 truncate max-w-[62px]">
                {seatRight.user.displayName}
              </span>
            ) : (
              <span className="text-[9px] text-[#786c5f]">Vacant</span>
            )}
            {seatRight.user && seatRight.receivedDiamonds !== undefined && seatRight.receivedDiamonds > 0 && (
              <div className="mt-0.5 flex items-center justify-center gap-0.5 bg-[#0B0B0F]/70 px-1.5 py-0.2 rounded-full border border-violet-500/30">
                <span className="text-[7px]">💎</span>
                <span className="text-[7px] font-bold text-violet-300">
                  {seatRight.receivedDiamonds >= 1000
                    ? (seatRight.receivedDiamonds / 1000).toFixed(1) + 'k'
                    : seatRight.receivedDiamonds}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
