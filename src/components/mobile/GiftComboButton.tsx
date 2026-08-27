import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Zap, Crown } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { audioEngine } from '../../services/audioEngine';

interface GiftComboButtonProps {
  onOpenCoinStore?: () => void;
}

export const GiftComboButton: React.FC<GiftComboButtonProps> = ({ onOpenCoinStore }) => {
  const { activeCombo, triggerComboGift, currentUser } = useAppState();
  const [timeLeftMs, setTimeLeftMs] = useState<number>(3000);
  const [isPressing, setIsPressing] = useState(false);
  const [insufficientError, setInsufficientError] = useState(false);

  useEffect(() => {
    if (!activeCombo) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, activeCombo.expiresAt - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeCombo]);

  if (!activeCombo) return null;

  const progressPercent = Math.min(100, Math.max(0, (timeLeftMs / 3000) * 100));
  const gift = activeCombo.gift;
  const count = activeCombo.count;
  const canAfford = currentUser.coins >= gift.coinPrice;

  // Escalating combo color tiers
  const getComboStyle = (cnt: number) => {
    if (cnt >= 20) {
      return {
        bg: 'from-amber-400 via-rose-500 to-purple-600',
        ring: '#f59e0b',
        text: 'text-amber-200',
        icon: '👑 SUPERNOVA',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.8)]',
      };
    }
    if (cnt >= 10) {
      return {
        bg: 'from-fuchsia-600 via-pink-500 to-amber-500',
        ring: '#ec4899',
        text: 'text-pink-200',
        icon: '⚡ MEGA COMBO',
        glow: 'shadow-[0_0_25px_rgba(236,72,153,0.7)]',
      };
    }
    if (cnt >= 5) {
      return {
        bg: 'from-amber-500 via-orange-500 to-rose-600',
        ring: '#f97316',
        text: 'text-amber-300',
        icon: '🔥 ON FIRE',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.6)]',
      };
    }
    return {
      bg: 'from-violet-600 via-fuchsia-600 to-amber-500',
      ring: '#8b5cf6',
      text: 'text-violet-200',
      icon: '✨ COMBO',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]',
    };
  };

  const style = getComboStyle(count);

  const handleComboClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAfford) {
      setInsufficientError(true);
      audioEngine.playSoundEffect('chime');
      setTimeout(() => setInsufficientError(false), 1500);
      if (onOpenCoinStore) {
        onOpenCoinStore();
      }
      return;
    }

    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 150);
    triggerComboGift();
  };

  const strokeDashoffset = 125.6 - (125.6 * progressPercent) / 100;

  return (
    <AnimatePresence>
      <motion.div
        id="gift-combo-button-widget"
        initial={{ scale: 0, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 15, stiffness: 350 }}
        className="fixed bottom-20 right-4 z-40 flex flex-col items-center select-none"
      >
        {/* Insufficient coins warning badge */}
        {insufficientError && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: -5 }}
            exit={{ opacity: 0 }}
            className="mb-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-lg flex items-center gap-1 border border-rose-300"
          >
            <span>Need Coins!</span>
            <span className="underline">Recharge</span>
          </motion.div>
        )}

        {/* Combo Multiplier Floating Header Badge */}
        <motion.div
          key={`combo-badge-${count}`}
          initial={{ scale: 1.4, y: -5 }}
          animate={{ scale: 1, y: 0 }}
          className={`px-3 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase mb-1 bg-slate-950/90 border border-white/20 shadow-md ${style.text} flex items-center gap-1`}
        >
          {count >= 10 ? <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300 animate-bounce" /> : <Flame className="w-3 h-3 text-orange-400 fill-orange-400 animate-pulse" />}
          <span>{style.icon} x{count}</span>
        </motion.div>

        {/* Main Circular Combo Button */}
        <div className="relative flex items-center justify-center">
          {/* Radial Countdown Progress Ring */}
          <svg className="w-20 h-20 transform -rotate-90 pointer-events-none drop-shadow-md">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="#232332"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Countdown Active Stroke */}
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke={style.ring}
              strokeWidth="5"
              fill="transparent"
              strokeDasharray="213.6"
              strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-75 ease-linear"
            />
          </svg>

          {/* Center Button */}
          <motion.button
            onClick={handleComboClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            animate={isPressing ? { scale: [1, 0.85, 1.1, 1] } : {}}
            className={`absolute w-16 h-16 rounded-full bg-gradient-to-tr ${style.bg} ${style.glow} border-2 border-white/40 flex flex-col items-center justify-center text-white cursor-pointer active:brightness-125 transition-shadow`}
            title={`Combo Send ${gift.name} (${gift.coinPrice} 🪙)`}
          >
            {/* Gift Icon */}
            <span className="text-2xl leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-pulse">
              {gift.icon}
            </span>

            {/* Label */}
            <div className="flex flex-col items-center -mt-0.5">
              <span className="text-[9px] font-black uppercase tracking-tighter drop-shadow-sm text-yellow-100">
                TAP!
              </span>
              <span className="text-[8px] font-extrabold text-amber-200 opacity-90 leading-none">
                {gift.coinPrice}🪙
              </span>
            </div>
          </motion.button>
        </div>

        {/* Receiver Label */}
        <div className="mt-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs border border-white/10 text-[9px] font-semibold text-slate-300 max-w-[90px] truncate text-center">
          To {activeCombo.receiver.displayName}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
