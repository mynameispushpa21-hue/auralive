import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coins, Plus, Check, Lock, ChevronRight, X } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { GiftCategory, UserProfile, VirtualGift } from '../../types';

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
  onOpenBuyCoinsFromSeller,
  targetUser,
}) => {
  const { gifts, currentUser, sendGift, activeRoom, vipTiers } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | 'All'>('All');
  const [selectedGiftId, setSelectedGiftId] = useState<string>(gifts[0]?.id || 'gift_01');
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>(
    targetUser?.id || activeRoom?.hostId || currentUser.id
  );
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: (GiftCategory | 'All')[] = ['All', 'Popular', 'Luxury', 'Romance', 'Special', 'Effects', 'VIP', 'Lucky'];

  const filteredGifts = gifts.filter((g) => {
    if (selectedCategory === 'All') return true;
    return g.category === selectedCategory;
  });

  const selectedGift = gifts.find((g) => g.id === selectedGiftId) || gifts[0];
  const totalCost = (selectedGift?.coinPrice || 0) * comboMultiplier;

  // Potential receivers: Host + seated guests in current room
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
    if (result.success) {
      onClose();
    } else {
      setErrorNotice(result.message);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#121217] border-t border-[#232332] rounded-t-3xl p-4 shadow-2xl flex flex-col max-h-[85vh] text-slate-100"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white font-display">Virtual Gift Store</h3>
                <p className="text-xs text-slate-400">Send love & boost your favorite creators</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Buy from Reseller -20% Pill */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenBuyCoinsFromSeller) {
                    onOpenBuyCoinsFromSeller();
                  } else {
                    onOpenCoinStore();
                  }
                }}
                className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/50 text-amber-300 text-[10px] font-black transition-all shadow-xs"
                title="Save up to 20% by buying from verified sellers"
              >
                <span>⚡</span>
                <span>Reseller (-20%)</span>
              </button>

              {/* Coin Balance Pill */}
              <button
                onClick={onOpenCoinStore}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A24] hover:bg-[#232332] border border-violet-500/40 text-amber-300 text-xs font-bold transition-all shadow-inner"
              >
                <span>🪙</span>
                <span>{currentUser.coins.toLocaleString()}</span>
                <span className="p-0.5 rounded-full bg-violet-600 text-white ml-0.5">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </span>
              </button>

              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Receiver Selector Row */}
          <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap pl-1">To:</span>
            {availableReceivers.map((user) => {
              const isSelected = selectedReceiverId === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedReceiverId(user.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white shadow-md shadow-violet-500/20'
                      : 'bg-[#1A1A24] text-slate-300 hover:bg-[#232332] border border-[#232332]'
                  }`}
                >
                  <img src={user.avatar} alt={user.displayName} className="w-4 h-4 rounded-full object-cover" />
                  <span>{user.displayName}</span>
                  {user.id === activeRoom?.hostId && (
                    <span className="text-[10px] bg-violet-400/30 text-violet-200 px-1 rounded-xs">Host</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar border-b border-[#232332]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1A24]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Error notice if insufficient balance */}
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
          <div className="grid grid-cols-4 gap-2.5 py-3 overflow-y-auto max-h-56 pr-1">
            {filteredGifts.map((gift) => {
              const isSelected = selectedGiftId === gift.id;
              const isVipLocked =
                gift.isVipOnly &&
                (parseInt(currentUser.vipTier.replace('vip_', ''), 10) || 0) < (gift.minVipLevel || 1);

              return (
                <button
                  key={gift.id}
                  onClick={() => {
                    setSelectedGiftId(gift.id);
                    setErrorNotice(null);
                  }}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-violet-600/25 to-fuchsia-600/25 border-2 border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.03]'
                      : 'bg-[#1A1A24] hover:bg-[#232332] border border-[#232332]'
                  }`}
                >
                  {/* VIP Tag */}
                  {gift.isVipOnly && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[9px] font-black text-white shadow-xs">
                      VIP {gift.minVipLevel}
                    </span>
                  )}

                  {/* Icon */}
                  <div className="text-3xl my-1 drop-shadow-md transform transition-transform hover:scale-110">
                    {gift.icon}
                  </div>

                  {/* Name & Coin Price */}
                  <span className="text-[11px] font-bold text-slate-200 truncate w-full text-center">
                    {gift.name}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-400 mt-0.5">
                    <span>🪙</span>
                    <span>{gift.coinPrice.toLocaleString()}</span>
                  </div>

                  {isVipLocked && (
                    <div className="absolute inset-0 bg-[#0B0B0F]/80 rounded-2xl flex flex-col items-center justify-center backdrop-blur-2xs">
                      <Lock className="w-4 h-4 text-amber-400 mb-0.5" />
                      <span className="text-[9px] font-bold text-amber-200">VIP Locked</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Combo Selector & Send Action */}
          <div className="pt-3 border-t border-[#232332] flex items-center justify-between gap-3">
            {/* Combo Multiplier Pills */}
            <div className="flex items-center gap-1 bg-[#1A1A24] p-1 rounded-xl border border-[#232332]">
              {[1, 10, 66, 99].map((count) => (
                <button
                  key={count}
                  onClick={() => setComboMultiplier(count)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    comboMultiplier === count
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  x{count}
                </button>
              ))}
            </div>

            {/* Total Cost & Send Button */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400">Total Price</p>
                <p className="text-xs font-black text-amber-300 flex items-center gap-1 justify-end">
                  <span>🪙</span>
                  <span>{totalCost.toLocaleString()}</span>
                </p>
              </div>

              <button
                onClick={handleSend}
                disabled={currentUser.coins < totalCost}
                className={`px-6 py-2.5 rounded-xl font-display font-extrabold text-sm flex items-center gap-2 transition-all shadow-lg ${
                  currentUser.coins >= totalCost
                    ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white hover:brightness-110 shadow-violet-500/25 active:scale-95'
                    : 'bg-[#1A1A24] text-slate-500 border border-[#232332] cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <span className="text-xs opacity-90">({totalCost.toLocaleString()} 🪙)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
