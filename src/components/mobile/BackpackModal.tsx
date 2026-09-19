import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Package,
  Check,
  Crown,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { STORE_ITEMS } from '../../data/storeItemsData';
import { audioEngine } from '../../services/audioEngine';
import { StoreItemCategory } from '../../types';

interface BackpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVIPCenter?: () => void;
  onOpenStore?: () => void;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  isOpen,
  onClose,
  onOpenVIPCenter,
  onOpenStore,
}) => {
  const { currentUser, equipStoreItem } = useAppState();

  const [activeCategory, setActiveCategory] = useState<StoreItemCategory>('frames');
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  // Filter owned items
  const ownedIds = [
    ...(currentUser.ownedFrames || []),
    ...(currentUser.ownedRides || []),
    ...(currentUser.ownedBubbles || []),
    ...(currentUser.ownedBadges || []),
    ...(currentUser.ownedEntryEffects || []),
    ...(currentUser.ownedWaves || []),
  ];

  const allCategoryItems = STORE_ITEMS.filter((item) => item.category === activeCategory);
  const myItems = allCategoryItems.filter(item => ownedIds.includes(item.id));
  
  // Add defaults
  if (activeCategory === 'frames') {
      myItems.unshift({
          id: 'frame_none', category: 'frames', name: 'Default Border', description: 'No special frame',
          icon: '⭕', previewClass: 'ring-violet-500', rarity: 'Common', price7Days: 0, price30Days: 0, pricePermanent: 0
      } as any);
  }
  if (activeCategory === 'rides') {
      myItems.unshift({
          id: 'ride_none', category: 'rides', name: 'Standard Walk-In', description: 'Normal entrance',
          icon: '🚶‍♂️', rarity: 'Common', price7Days: 0, price30Days: 0, pricePermanent: 0
      } as any);
  }
  if (activeCategory === 'bubbles') {
      myItems.unshift({
          id: 'bubble_default', category: 'bubbles', name: 'Standard Bubble', description: 'Default chat bubble',
          icon: '💬', rarity: 'Common', price7Days: 0, price30Days: 0, pricePermanent: 0
      } as any);
  }

  const [selectedItemId, setSelectedItemId] = useState<string>(myItems[0]?.id || '');
  const selectedItem = myItems.find(i => i.id === selectedItemId) || myItems[0];

  const isEquipped = (id: string) => {
      if (activeCategory === 'frames') return (currentUser.avatarFrame || 'frame_none') === id;
      if (activeCategory === 'rides') return (currentUser.equippedRide || 'ride_none') === id;
      if (activeCategory === 'bubbles') return (currentUser.equippedBubble || 'bubble_default') === id;
      return false;
  };

  const handleEquip = () => {
    if (!selectedItem) return;
    equipStoreItem(activeCategory, selectedItem.id, selectedItem.name);
    setToastMessage({ text: `Equipped ${selectedItem.name}!`, isError: false });
    audioEngine.playSoundEffect('magic');
    setTimeout(() => setToastMessage(null), 2500);
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
            <h3 className="font-bold text-lg text-amber-500 tracking-wide">My Backpack</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenStore}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-[#120c08] text-xs font-black shadow-sm"
            >
              Get More
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
                   // reset selection logic if needed
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
              {myItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`relative rounded-xl overflow-hidden border transition-all flex flex-col ${
                    selectedItemId === item.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-[#3a2818] bg-[#1a110a] hover:border-amber-500/30'
                  }`}
                >
                  {isEquipped(item.id) && (
                      <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                        Equipped
                      </div>
                  )}
                  {/* Item Image area */}
                  <div className="flex-1 aspect-square flex items-center justify-center bg-gradient-to-b from-[#1f150e] to-[#120c08]">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${item.previewClass || ''}`}>
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Item Details */}
                  <div className="p-2 text-center border-t border-[#3a2818] bg-[#0c0805] w-full">
                    <div className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">{item.name}</div>
                    <div className="text-emerald-400 text-[10px] font-bold">
                      Owned
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
              {myItems.length === 0 && (
                 <div className="col-span-2 text-center text-slate-500 py-10 text-sm">
                    No items in this category.<br/><br/>
                    <button onClick={onOpenStore} className="text-amber-500 underline">Visit Store</button>
                 </div>
              )}
            </div>

            {/* Bottom Purchase Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0c0805] via-[#120c08] to-transparent border-t border-[#3a2818]/50 flex items-center justify-end backdrop-blur-sm shrink-0">
              {selectedItem && (
                  <button
                    onClick={handleEquip}
                    disabled={isEquipped(selectedItem.id)}
                    className={`px-10 py-2.5 rounded-full font-black text-sm shadow-lg transition-all ${
                        isEquipped(selectedItem.id)
                        ? 'bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-[#3e2c1c] shadow-amber-500/20 hover:brightness-110 active:scale-95'
                    }`}
                  >
                    {isEquipped(selectedItem.id) ? 'Equipped' : 'Equip Now'}
                  </button>
              )}
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
