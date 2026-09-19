import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Check,
  Crown,
  Coins,
  Plus,
  Volume2,
  Car,
  MessageCircle,
  Award,
  Zap,
  Flame,
  Star,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Eye,
  Clock
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { StoreItem, StoreItemCategory, ItemDuration } from '../../types';
import { audioEngine } from '../../services/audioEngine';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCoinStore: () => void;
  onOpenBackpack?: () => void;
  initialCategory?: StoreItemCategory;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  onOpenCoinStore,
  onOpenBackpack,
  initialCategory = 'frames',
}) => {
  const {
    currentUser,
    storeItems,
    buyStoreItem,
    equipStoreItem,
    vipTiers,
  } = useAppState();

  const [activeCategory, setActiveCategory] = useState<StoreItemCategory>(initialCategory);
  
  // Update filteredItems to only use activeCategory
  const filteredItems = storeItems.filter((item) => item.category === activeCategory);
  
  const [selectedItemId, setSelectedItemId] = useState<string>(filteredItems[0]?.id || 'frame_global_champ_1');
  const [selectedDuration, setSelectedDuration] = useState<ItemDuration>('30d');
  const [autoEquip, setAutoEquip] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const selectedItem: StoreItem =
    storeItems.find((item) => item.id === selectedItemId) || filteredItems[0] || storeItems[0];

  const handleBuy = () => {
    if (!selectedItem) return;

    let price = 0;
    if (selectedDuration === '7d') price = selectedItem.price7Days;
    if (selectedDuration === '30d') price = selectedItem.price30Days;
    if (selectedDuration === 'perm') price = selectedItem.pricePermanent;

    if (currentUser.coins < price) {
      setToastMessage({
        text: `Insufficient coins. You need ${price.toLocaleString()} coins.`,
        isError: true,
      });
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const res = buyStoreItem(selectedItem.id, selectedDuration, autoEquip);
    setToastMessage({
      text: res.message,
      isError: !res.success,
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[92vh] bg-[#120c08] border-0 sm:border border-[#3a2818] sm:rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-[#3a2818] bg-gradient-to-r from-[#1a110a] via-[#2a1c12] to-[#1a110a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1 text-amber-500 hover:text-amber-400">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <h3 className="font-bold text-lg text-amber-500 tracking-wide">Store</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCoinStore}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a1c12] border border-amber-500/30 text-amber-400 text-sm font-bold shadow-sm"
            >
              <span>🪙</span>
              <span>{currentUser.coins.toLocaleString()}</span>
              <Plus className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-[85px] bg-[#0c0805] border-r border-[#3a2818] flex flex-col overflow-y-auto no-scrollbar py-2 shrink-0">
            {[
              { id: 'frames', icon: '🖼️', label: 'Frame' },
              { id: 'rides', icon: '🏎️', label: 'Ride' },
              { id: 'bubbles', icon: '💬', label: 'Bubble' },
              { id: 'waves', icon: '🌊', label: 'Mic Wave' },
              { id: 'thrones', icon: '💺', label: 'Throne' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                   setActiveCategory(cat.id as StoreItemCategory);
                   const newCategoryItems = storeItems.filter(i => i.category === cat.id);
                   if (newCategoryItems.length > 0) {
                       setSelectedItemId(newCategoryItems[0].id);
                   }
                }}
                className={`flex flex-col items-center justify-center gap-1 py-4 border-l-2 transition-all ${
                  activeCategory === cat.id
                    ? 'border-amber-500 bg-[#1a110a] text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="text-2xl drop-shadow-md">{cat.icon}</span>
                <span className="text-[10px] font-medium">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-[#120c08] flex flex-col relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 pb-24 content-start">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`relative rounded-xl overflow-hidden border transition-all flex flex-col ${
                    selectedItemId === item.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-[#3a2818] bg-[#1a110a] hover:border-amber-500/30'
                  }`}
                >
                  {/* Duration Badge */}
                  <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-[#f5dfb3] text-[#3e2c1c] text-[9px] font-bold flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {selectedDuration === '7d' ? '7 Days' : selectedDuration === '30d' ? '30 Days' : 'Perm'}
                  </div>
                  
                  {/* Item Image area */}
                  <div className="flex-1 aspect-square flex items-center justify-center bg-gradient-to-b from-[#1f150e] to-[#120c08]">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${item.previewClass || ''}`}>
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Item Details */}
                  <div className="p-2 text-center border-t border-[#3a2818] bg-[#0c0805] w-full">
                    <div className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">{item.name}</div>
                    <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
                      <span>🪙</span>
                      <span>
                        {selectedDuration === '7d' ? item.price7Days : selectedDuration === '30d' ? item.price30Days : item.pricePermanent}
                      </span>
                    </div>
                  </div>
                  
                  {/* Selection Checkmark */}
                  {selectedItemId === item.id && (
                     <div className="absolute top-2 right-2 p-0.5 bg-amber-500 rounded-full text-black">
                       <Check className="w-3 h-3" />
                     </div>
                  )}
                </button>
              ))}
              {filteredItems.length === 0 && (
                 <div className="col-span-2 text-center text-slate-500 py-10">No items available in this category.</div>
              )}
            </div>

            {/* Bottom Purchase Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0c0805] via-[#120c08] to-transparent border-t border-[#3a2818]/50 flex items-center justify-between backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🪙</span>
                <span className="text-amber-400 font-bold text-lg">{currentUser.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-95 transition-all"
                  onClick={() => setToastMessage({ text: 'Gift Presenting is coming soon!', isError: false })}
                >
                  Present
                </button>
                <button
                  onClick={handleBuy}
                  className="px-8 py-2 rounded-full bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-[#3e2c1c] font-black text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold flex items-center justify-between gap-2 shadow-xl z-50 ${
                toastMessage.isError
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
