import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Lock, X } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { GiftCategory, UserProfile } from '../../types';
import { GiftComboButton } from './GiftComboButton';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCoinStore: () => void;
  onOpenBuyCoinsFromSeller?: () => void;
  targetUser?: UserProfile | null;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  isOpen,
  onClose,
  onOpenCoinStore,
  targetUser,
}) => {
  const { gifts, currentUser, sendGift, activeRoom, allUsers, activeCombo } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory>('Popular');
  const [selectedGiftId, setSelectedGiftId] = useState<string>('gift_01');
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>(
    targetUser?.id || activeRoom?.hostId || ''
  );
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Sync selected receiver when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultReceiver = targetUser?.id || activeRoom?.hostId || '';
      setSelectedReceiverId(defaultReceiver);
      setErrorNotice(null);
    }
  }, [isOpen, targetUser, activeRoom]);

  if (!isOpen) return null;

  const categories: GiftCategory[] = [
    'Popular',
    'Lucky',
    'Luxury',
    'Romance',
    'Special',
    'Effects',
  ];

  const filteredGifts = gifts.filter((g) => {
    if (selectedCategory === 'Popular') {
      return g.category !== 'Lucky';
    }
    if (selectedCategory === 'Lucky') {
      return (
        g.category === 'Lucky' ||
        g.name.toLowerCase().includes('lucky') ||
        g.name.toLowerCase().includes('fortune')
      );
    }
    if (selectedCategory === 'Effects') return g.category === 'Effects' || g.animationType === 'rocket';
    if (selectedCategory === 'Luxury') return g.category === 'Luxury' || g.coinPrice >= 3000;
    if (selectedCategory === 'Romance') return g.category === 'Romance';
    if (selectedCategory === 'Special') return g.category === 'Special' || g.category === 'VIP';
    return g.category === selectedCategory;
  });

  const selectedGift =
    filteredGifts.find((g) => g.id === selectedGiftId) ||
    filteredGifts[0] ||
    gifts[0];
  const totalCost = (selectedGift?.coinPrice || 10) * comboMultiplier;

  // Potential receivers: Host + seated guests + demo partner (matching screenshot: Alex Rider Host + Luna Valente)
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

  const handleSend = () => {
    setErrorNotice(null);
    if (!selectedGift) return;

    // Check VIP requirement if applicable
    if (selectedGift.isVipOnly) {
      const currentVipLevel = parseInt(currentUser.vipTier.replace('vip_', ''), 10) || 0;
      if (currentVipLevel < (selectedGift.minVipLevel || 1)) {
        setErrorNotice(`This gift requires VIP Level ${selectedGift.minVipLevel}+.`);
        return;
      }
    }

    const result = sendGift(selectedGift.id, selectedReceiverId, comboMultiplier, activeRoom?.id);
    if (!result.success) {
      setErrorNotice(result.message);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="virtual-gift-store-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="absolute inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-[2px] overflow-hidden select-none"
      >
        <motion.div
          id="virtual-gift-store-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full bg-[#111117] border-t border-[#232332] rounded-t-[30px] p-4 pb-5 shadow-2xl flex flex-col max-h-[85%] text-slate-100 relative z-10"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#232332]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#221638] border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-inner shrink-0">
                <Sparkles className="w-5 h-5 text-violet-400 fill-violet-400/20" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white tracking-tight leading-tight font-display">
                  Virtual Gift Store
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Send love & boost your favorite creators
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Coin Balance Pill with + */}
              <button
                onClick={onOpenCoinStore}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181824] hover:bg-[#202030] border border-violet-500/30 text-amber-300 text-xs font-bold transition-all shadow-inner"
                title="Coin Balance & Recharge"
              >
                <span className="text-amber-400 text-xs">🪙</span>
                <span className="font-black text-amber-300 tracking-tight">
                  {currentUser.coins.toLocaleString()}
                </span>
                <span className="w-4 h-4 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center text-[10px] font-black ml-0.5 shadow-xs">
                  +
                </span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Receiver Selector Row ("To:") */}
          <div className="py-2.5 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap pl-0.5">To:</span>
            {availableReceivers.map((user) => {
              const isSelected = selectedReceiverId === user.id;
              const isHost =
                user.id === activeRoom?.hostId ||
                user.role === 'host';

              return (
                <button
                  key={user.id}
                  id={`receiver-btn-${user.id}`}
                  onClick={() => setSelectedReceiverId(user.id)}
                  title={`${user.displayName}${isHost ? ' (Host)' : ''}`}
                  className={`relative rounded-full transition-all flex items-center justify-center p-0.5 ${
                    isSelected
                      ? 'ring-2 ring-fuchsia-500 scale-105 shadow-md shadow-fuchsia-500/40 bg-fuchsia-500/20'
                      : 'opacity-70 hover:opacity-100 ring-1 ring-white/20 bg-[#181824]'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {isHost && (
                    <span
                      className="absolute -top-1 -right-1 text-[9px] leading-none bg-amber-500 text-slate-950 font-black rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs border border-black/40"
                      title="Host"
                    >
                      👑
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Category Tabs */}
          <div
            id="gift-category-tabs-bar"
            className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar border-b border-[#232332]/70"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                id={`gift-tab-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#8b5cf6] text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1A24]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Error Notice */}
          {errorNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between"
            >
              <span>{errorNotice}</span>
              <button
                onClick={onOpenCoinStore}
                className="underline font-bold text-amber-300 hover:text-amber-200 ml-2"
              >
                Recharge
              </button>
            </motion.div>
          )}

          {/* Gift Grid (4 columns) */}
          <div className="grid grid-cols-4 gap-2 py-2.5 overflow-y-auto max-h-[250px] no-scrollbar">
            {filteredGifts.map((gift) => {
              const isSelected = selectedGiftId === gift.id;
              const currentVipLevel = parseInt(currentUser.vipTier.replace('vip_', ''), 10) || 0;
              const isVipLocked = gift.isVipOnly && currentVipLevel < (gift.minVipLevel || 1);

              return (
                <button
                  key={gift.id}
                  onClick={() => {
                    setSelectedGiftId(gift.id);
                    setErrorNotice(null);
                  }}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-2xl transition-all min-h-[96px] select-none ${
                    isSelected
                      ? 'bg-[#1e1533] border-2 border-[#8b5cf6] shadow-lg shadow-violet-500/20 scale-[1.02]'
                      : 'bg-[#161622] hover:bg-[#1d1d2b] border border-[#222230]'
                  }`}
                >
                  {/* VIP Tag */}
                  {gift.isVipOnly && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[8px] font-black text-white shadow-xs z-10">
                      VIP {gift.minVipLevel}
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`text-3xl my-1 drop-shadow-md transform transition-transform ${
                      isVipLocked ? 'opacity-35' : 'group-hover:scale-110'
                    }`}
                  >
                    {gift.icon}
                  </div>

                  {/* VIP Locked Overlay */}
                  {isVipLocked && (
                    <div className="absolute inset-0 bg-[#0B0B0F]/70 rounded-2xl flex flex-col items-center justify-center backdrop-blur-[1px] z-20">
                      <Lock className="w-4 h-4 text-amber-400 mb-0.5 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      <span className="text-[9px] font-extrabold text-amber-300">VIP Locked</span>
                    </div>
                  )}

                  {/* Name & Coin Price */}
                  <div className="w-full text-center">
                    <span
                      className={`text-[10px] font-bold truncate block w-full tracking-tight ${
                        isVipLocked ? 'text-slate-400' : 'text-slate-200'
                      }`}
                    >
                      {gift.name}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 text-[10px] font-black text-amber-400 mt-0.5">
                      <span className="text-[10px]">🪙</span>
                      <span>{gift.coinPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Multipliers & Send Action */}
          <div className="pt-2.5 border-t border-[#232332]/70 flex items-center justify-between gap-2">
            {/* Combo Multipliers */}
            <div className="flex items-center gap-0.5 bg-[#161622] p-1 rounded-2xl border border-[#232332]">
              {[1, 10, 66, 99].map((count) => (
                <button
                  key={count}
                  onClick={() => setComboMultiplier(count)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    comboMultiplier === count
                      ? 'bg-[#8b5cf6] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  x{count}
                </button>
              ))}
            </div>

            {/* Total Price & Send / Combo Action */}
            <div className="flex items-center gap-2.5">
              {activeCombo ? (
                <div className="flex items-center gap-2">
                  <GiftComboButton inline onOpenCoinStore={onOpenCoinStore} />
                  {selectedGift && selectedGift.id !== activeCombo.gift.id && (
                    <button
                      onClick={handleSend}
                      disabled={currentUser.coins < totalCost}
                      className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] text-white shadow-md active:scale-95 transition-all"
                      title={`Send ${selectedGift.name}`}
                    >
                      Send {selectedGift.icon} ({totalCost}🪙)
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                      Total Price
                    </p>
                    <p className="text-xs font-black text-amber-300 flex items-center gap-1 justify-end">
                      <span>🪙</span>
                      <span>{totalCost.toLocaleString()}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={currentUser.coins < totalCost}
                    className={`px-6 py-2.5 rounded-2xl font-display font-extrabold text-sm flex items-center justify-center gap-1 transition-all shadow-lg ${
                      currentUser.coins >= totalCost
                        ? 'bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#f97316] text-white hover:brightness-110 shadow-fuchsia-500/25 active:scale-95'
                        : 'bg-[#1A1A24] text-slate-500 border border-[#232332] cursor-not-allowed'
                    }`}
                  >
                    <span>Send</span>
                    <span className="text-xs opacity-90 font-bold">
                      ({totalCost.toLocaleString()}🪙)
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
