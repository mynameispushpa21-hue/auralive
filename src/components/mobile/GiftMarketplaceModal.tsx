import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Lock,
  X,
  Play,
  Volume2,
  Gift,
  Coins,
  Crown,
  Flame,
  Star,
  Zap,
  ShoppingBag,
  Send,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { GiftCategory, UserProfile, VirtualGift } from '../../types';
import { audioEngine } from '../../services/audioEngine';

interface GiftMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCoinStore: () => void;
  onOpenBackpack?: () => void;
  targetUser?: UserProfile | null;
}

export const GiftMarketplaceModal: React.FC<GiftMarketplaceModalProps> = ({
  isOpen,
  onClose,
  onOpenCoinStore,
  onOpenBackpack,
  targetUser,
}) => {
  const { gifts, currentUser, sendGift, activeRoom } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGiftId, setSelectedGiftId] = useState<string>('gift_01');
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>(
    targetUser?.id || activeRoom?.hostId || ''
  );
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewAnimation, setPreviewAnimation] = useState<VirtualGift | null>(null);

  // Sync selected receiver when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultReceiver = targetUser?.id || activeRoom?.hostId || '';
      setSelectedReceiverId(defaultReceiver);
      setErrorNotice(null);
      setSuccessToast(null);
    }
  }, [isOpen, targetUser, activeRoom]);

  // Clear preview animation automatically after 2.5s
  useEffect(() => {
    if (previewAnimation) {
      const timer = setTimeout(() => {
        setPreviewAnimation(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [previewAnimation]);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Popular',
    'Luxury',
    'Romance',
    'Lucky',
    'Effects',
    'VIP',
  ];

  const filteredGifts = gifts.filter((g) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Popular') return g.category === 'Popular' || g.coinPrice <= 500;
    if (selectedCategory === 'Lucky') {
      return (
        g.category === 'Lucky' ||
        g.name.toLowerCase().includes('lucky') ||
        g.name.toLowerCase().includes('fortune')
      );
    }
    if (selectedCategory === 'Effects') {
      return g.category === 'Effects' || g.animationType === 'rocket' || g.animationType === 'firework';
    }
    if (selectedCategory === 'Luxury') {
      return g.category === 'Luxury' || g.coinPrice >= 3000 || g.animationType === 'sports_car';
    }
    if (selectedCategory === 'Romance') {
      return g.category === 'Romance' || g.animationType === 'rose_shower';
    }
    if (selectedCategory === 'VIP') {
      return g.isVipOnly || g.category === 'Special';
    }
    return g.category === selectedCategory;
  });

  const selectedGift =
    filteredGifts.find((g) => g.id === selectedGiftId) ||
    filteredGifts[0] ||
    gifts[0];

  const totalCost = (selectedGift?.coinPrice || 10) * comboMultiplier;

  // Receivers list: Host + seated guests
  const availableReceivers: UserProfile[] = [];
  if (activeRoom) {
    if (!availableReceivers.some((u) => u.id === activeRoom.host.id)) {
      availableReceivers.push(activeRoom.host);
    }
    activeRoom.seats.forEach((seat) => {
      if (seat.user && !availableReceivers.some((u) => u.id === seat.user?.id)) {
        availableReceivers.push(seat.user);
      }
    });
  }
  if (availableReceivers.length === 0) {
    availableReceivers.push(currentUser);
  }

  const handlePreview = (gift: VirtualGift, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewAnimation(gift);
    audioEngine.playSoundEffect(gift.soundEffect || 'chime');
  };

  const handlePurchaseAndSend = () => {
    setErrorNotice(null);
    setSuccessToast(null);

    if (!selectedGift) return;

    if (currentUser.coins < totalCost) {
      setErrorNotice(`Insufficient coins (${currentUser.coins.toLocaleString()} / ${totalCost.toLocaleString()}). Please recharge.`);
      return;
    }

    if (selectedGift.isVipOnly) {
      const currentVipLevel = parseInt(currentUser.vipTier.replace('vip_', ''), 10) || 0;
      if (currentVipLevel < (selectedGift.minVipLevel || 1)) {
        setErrorNotice(`This exclusive gift requires VIP Level ${selectedGift.minVipLevel}+.`);
        return;
      }
    }

    const result = sendGift(selectedGift.id, selectedReceiverId, comboMultiplier, activeRoom?.id);
    if (result.success) {
      setSuccessToast(`Sent ${comboMultiplier > 1 ? `${comboMultiplier}x ` : ''}${selectedGift.name}!`);
      audioEngine.playSoundEffect(selectedGift.soundEffect || 'magic');
      setTimeout(() => {
        setSuccessToast(null);
      }, 2000);
    } else {
      setErrorNotice(result.message);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="gift-marketplace-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs select-none"
      >
        <motion.div
          id="gift-marketplace-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-lg bg-[#0e0e15] border-t border-violet-500/30 rounded-t-[32px] p-4 pb-6 shadow-2xl flex flex-col max-h-[90%] text-slate-100 relative z-10 overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-12 bg-violet-600/20 blur-xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#222232]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black text-white tracking-tight">
                    Gift Marketplace
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[10px] font-bold text-violet-300">
                    Live Store
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Virtual gifts, 3D animated effects & room boosters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Coin Balance Pill with + */}
              <button
                onClick={onOpenCoinStore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181826] hover:bg-[#202034] border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-inner"
                title="Coin Balance & Recharge"
              >
                <span className="text-amber-400">🪙</span>
                <span className="font-extrabold text-amber-300">
                  {currentUser.coins.toLocaleString()}
                </span>
                <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-black">
                  +
                </span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Voice Session Receiver Picker (if in room) */}
          {activeRoom && (
            <div className="py-2 flex items-center gap-2 border-b border-[#222232] overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Recipient:
              </span>
              <div className="flex items-center gap-2">
                {availableReceivers.map((u) => {
                  const isSelected = selectedReceiverId === u.id;
                  const isHost = u.id === activeRoom.hostId;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedReceiverId(u.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30 font-bold'
                          : 'bg-[#181824] text-slate-300 hover:bg-[#232334] border border-white/5'
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.displayName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="truncate max-w-[80px]">{u.displayName}</span>
                      {isHost && <span className="text-[10px]">👑</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 bg-[#161622] hover:bg-[#1e1e2f] border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Error / Success Notices */}
          {errorNotice && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between"
            >
              <span>{errorNotice}</span>
              <button
                onClick={onOpenCoinStore}
                className="underline font-bold text-amber-300 hover:text-amber-200 ml-2"
              >
                Recharge Coins
              </button>
            </motion.div>
          )}

          {successToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successToast}</span>
            </motion.div>
          )}

          {/* Gifts Grid */}
          <div className="grid grid-cols-4 gap-2.5 py-2 overflow-y-auto max-h-[260px] no-scrollbar">
            {filteredGifts.map((gift) => {
              const isSelected = selectedGift?.id === gift.id;
              const isVipLocked =
                gift.isVipOnly &&
                (parseInt(currentUser.vipTier.replace('vip_', ''), 10) || 0) <
                  (gift.minVipLevel || 1);

              return (
                <div
                  key={gift.id}
                  onClick={() => setSelectedGiftId(gift.id)}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-b from-violet-900/60 to-fuchsia-950/80 border-fuchsia-500 ring-2 ring-fuchsia-500/40 shadow-lg shadow-fuchsia-600/30'
                      : 'bg-[#151520] hover:bg-[#1b1b2a] border-[#222234]'
                  }`}
                >
                  {/* VIP Lock or Special Tag */}
                  {isVipLocked ? (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[9px] font-black flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>VIP{gift.minVipLevel}</span>
                    </div>
                  ) : gift.animationType === 'sports_car' || gift.animationType === 'dragon' ? (
                    <span className="absolute top-1 right-1 px-1 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase">
                      HOT
                    </span>
                  ) : null}

                  {/* Gift Icon & Preview trigger */}
                  <div className="relative group my-1">
                    <span className="text-3xl block transition-transform group-hover:scale-110 drop-shadow-md">
                      {gift.icon}
                    </span>
                    <button
                      onClick={(e) => handlePreview(gift, e)}
                      title="Preview Animation"
                      className="absolute -bottom-1 -right-2 p-1 rounded-full bg-black/70 hover:bg-violet-600 text-violet-300 hover:text-white transition-colors opacity-80 hover:opacity-100 shadow-xs"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>

                  {/* Gift Name */}
                  <span className="text-[11px] font-bold text-slate-200 text-center truncate w-full mt-1">
                    {gift.name}
                  </span>

                  {/* Price */}
                  <div className="flex items-center gap-1 text-[11px] font-black text-amber-300 mt-0.5">
                    <span>🪙</span>
                    <span>{gift.coinPrice.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-3 border-t border-[#222232] flex items-center justify-between gap-3">
            {/* Combo Multiplier Selector */}
            <div className="flex items-center gap-1 bg-[#151522] border border-[#222234] rounded-full p-1">
              {[1, 10, 66, 99].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setComboMultiplier(mult)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    comboMultiplier === mult
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  x{mult}
                </button>
              ))}
            </div>

            {/* Total Cost & Purchase/Send Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePurchaseAndSend}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-black text-xs shadow-lg shadow-violet-600/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  Send ({totalCost.toLocaleString()} 🪙)
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Animation Theater Overlay Preview */}
          <AnimatePresence>
            {previewAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setPreviewAnimation(null)}
                    className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/40 via-fuchsia-600/40 to-amber-500/40 rounded-full blur-2xl animate-pulse" />
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1.1],
                      rotate: [0, 5, -5, 0],
                      y: [0, -15, 0],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="relative text-7xl md:text-8xl"
                  >
                    {previewAnimation.icon}
                  </motion.div>
                </div>

                <h4 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                  {previewAnimation.name}
                  <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                </h4>
                <p className="text-xs text-violet-300 font-semibold mt-1">
                  Animation Type: <span className="uppercase text-amber-300">{previewAnimation.animationType}</span>
                </p>
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-amber-300 mt-2">
                  <span>🪙 {previewAnimation.coinPrice.toLocaleString()} coins</span>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedGiftId(previewAnimation.id);
                      setPreviewAnimation(null);
                      handlePurchaseAndSend();
                    }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold shadow-lg shadow-violet-600/30"
                  >
                    Send Now
                  </button>
                  <button
                    onClick={() => setPreviewAnimation(null)}
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const GiftMarketplace = GiftMarketplaceModal;
