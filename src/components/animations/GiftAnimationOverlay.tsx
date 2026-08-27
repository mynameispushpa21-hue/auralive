import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Crown, Flame, Rocket, Star, Heart, Zap } from 'lucide-react';
import { VirtualGift } from '../../types';

interface GiftAnimationOverlayProps {
  giftAnimation: {
    gift: VirtualGift;
    senderName: string;
    receiverName: string;
    count: number;
    comboStreak?: number;
  } | null;
  onDismiss: () => void;
}

export const GiftAnimationOverlay: React.FC<GiftAnimationOverlayProps> = ({ giftAnimation, onDismiss }) => {
  useEffect(() => {
    if (!giftAnimation) return;
    // Exactly 1 second display duration as requested
    const duration = 1000;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [giftAnimation, onDismiss]);

  if (!giftAnimation) return null;

  const { gift, senderName, receiverName, count, comboStreak } = giftAnimation;
  const displayCount = comboStreak || count;

  return (
    <AnimatePresence>
      <div
        id="gift-animation-fullscreen-overlay"
        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
      >
        {/* Dark dimming backdrop with subtle radial glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xs"
        />

        {/* Floating Top Banner Announcement */}
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, type: 'spring', damping: 15 }}
          className="absolute top-14 md:top-18 z-20 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/95 via-pink-600/95 to-purple-600/95 border border-amber-300/50 shadow-2xl shadow-amber-500/40 flex items-center gap-2.5 backdrop-blur-md pointer-events-auto"
        >
          <span className="text-2xl animate-bounce">{gift.icon}</span>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">
                GIFT EVENT
              </span>
              {displayCount > 1 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[9px]">
                  COMBO x{displayCount}
                </span>
              )}
            </div>
            <p className="text-xs font-extrabold text-white">
              <span className="text-amber-200">{senderName}</span>
              <span className="text-white/80"> sent </span>
              <span className="text-pink-200 font-black">{displayCount}x {gift.name}</span>
              <span className="text-white/80"> to </span>
              <span className="text-cyan-200 font-bold">{receiverName}</span>
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="ml-1 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Centerpiece 1-Second Energetic Gift Animation */}
        <motion.div
          key={`gift-center-${gift.id}-${Date.now()}`}
          initial={{ scale: 0.2, opacity: 0, y: 30 }}
          animate={{ scale: [0.2, 1.35, 1.1], opacity: 1, y: 0 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.9, times: [0, 0.4, 1], ease: 'easeOut' }}
          className="relative flex flex-col items-center justify-center text-center select-none"
        >
          {/* Pulsing Back Glow */}
          <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-amber-500/40 via-fuchsia-500/40 to-violet-600/40 blur-2xl animate-pulse" />

          {/* Large Gift Icon */}
          <div className="relative text-8xl md:text-9xl drop-shadow-[0_0_40px_rgba(245,158,11,0.9)] transform transition-transform animate-pulse">
            {gift.icon}
          </div>

          {/* Combo Multiplier Big Badge */}
          {displayCount > 1 ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              className="mt-3 px-4 py-1 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 text-white font-black text-xl shadow-2xl shadow-amber-500/50 flex items-center gap-1.5 border border-amber-300"
            >
              <Zap className="w-5 h-5 text-yellow-200 fill-yellow-200 animate-spin" />
              <span>COMBO x{displayCount}!</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-4 py-1 rounded-xl bg-slate-900/90 text-amber-300 font-extrabold text-sm border border-amber-400/40 shadow-lg"
            >
              {gift.name}
            </motion.div>
          )}

          {/* Sparkles around center */}
          <Sparkles className="w-8 h-8 text-amber-300 absolute -top-4 -left-4 animate-ping" />
          <Star className="w-6 h-6 text-pink-300 absolute -bottom-2 -right-4 animate-bounce" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
