import React, { useState } from 'react';
import { Gift, Plus, Edit2, Sparkles, Check, X, ShieldAlert } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { VirtualGift, GiftCategory } from '../../types';

export const AdminGiftsTable: React.FC = () => {
  const { gifts, adminAddGift, adminUpdateGift } = useAppState();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<VirtualGift | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [coinPrice, setCoinPrice] = useState<number>(100);
  const [category, setCategory] = useState<GiftCategory>('Popular');
  const [animationType, setAnimationType] = useState<VirtualGift['animationType']>('confetti');
  const [soundEffect, setSoundEffect] = useState('chime');
  const [isVipOnly, setIsVipOnly] = useState(false);
  const [minVipLevel, setMinVipLevel] = useState<number>(1);
  const [durationMs, setDurationMs] = useState<number>(3500);
  const [luckyCoinToDiamondRate, setLuckyCoinToDiamondRate] = useState<number>(20);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const giftPayload: any = {
      name: name.trim(),
      icon,
      coinPrice,
      category,
      animationType,
      soundEffect,
      isVipOnly,
      minVipLevel: isVipOnly ? minVipLevel : undefined,
      animationDurationMs: durationMs,
    };

    if (category === 'Lucky') {
      giftPayload.luckyCoinToDiamondRate = luckyCoinToDiamondRate;
      giftPayload.luckyDiamondReward = Math.floor(coinPrice / luckyCoinToDiamondRate);
    } else {
      giftPayload.luckyCoinToDiamondRate = undefined;
      giftPayload.luckyDiamondReward = undefined;
    }

    if (editingGift) {
      adminUpdateGift(editingGift.id, giftPayload);
      setEditingGift(null);
    } else {
      adminAddGift(giftPayload);
      setIsAddModalOpen(false);
    }

    // Reset
    setName('');
    setIcon('🎁');
    setCoinPrice(100);
    setLuckyCoinToDiamondRate(20);
  };

  const openEdit = (gift: VirtualGift) => {
    setEditingGift(gift);
    setName(gift.name);
    setIcon(gift.icon);
    setCoinPrice(gift.coinPrice);
    setCategory(gift.category);
    setAnimationType(gift.animationType);
    setSoundEffect(gift.soundEffect || 'chime');
    setIsVipOnly(gift.isVipOnly || false);
    setMinVipLevel(gift.minVipLevel || 1);
    setDurationMs(gift.animationDurationMs || 3500);
    setLuckyCoinToDiamondRate(gift.luckyCoinToDiamondRate || 20);
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Virtual Gift Catalog Management</h2>
          <p className="text-xs text-slate-400">Configure gifts, coin prices, 3D particle animations & VIP tier locks</p>
        </div>

        <button
          onClick={() => {
            setEditingGift(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Gift</span>
        </button>
      </div>

      {/* Gift Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gifts.map((g) => (
          <div
            key={g.id}
            className="p-4 rounded-2xl bg-[#121217] border border-[#232332] flex flex-col justify-between space-y-3 shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl p-2 rounded-xl bg-[#1A1A24] border border-[#232332]">{g.icon}</div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-[#1A1A24] text-[10px] font-bold text-slate-300">
                  {g.category}
                </span>
                {g.category === 'Lucky' && g.luckyCoinToDiamondRate && (
                  <span className="block mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                    {g.luckyCoinToDiamondRate} 💰 = 1 💎
                  </span>
                )}
                {g.isVipOnly && (
                  <span className="block mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white text-[9px] font-black">
                    VIP {g.minVipLevel}+
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">{g.name}</h4>
              <p className="text-xs font-black text-amber-400 mt-0.5">🪙 {g.coinPrice.toLocaleString()} Coins</p>
              <p className="text-[10px] text-slate-400 mt-1">
                FX: <strong className="text-violet-300">{g.animationType}</strong> • Audio: <strong className="text-fuchsia-300">{g.soundEffect || 'none'}</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-[#232332] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">{g.id}</span>
              <button
                onClick={() => openEdit(g)}
                className="px-3 py-1 rounded-lg bg-[#1A1A24] hover:bg-[#232332] text-violet-300 text-xs font-bold flex items-center gap-1 border border-[#232332] transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingGift) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#121217] border border-[#232332] rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
              <h3 className="font-bold text-sm text-white">
                {editingGift ? `Edit Gift: ${editingGift.name}` : 'Create New Virtual Gift'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingGift(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Gift Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Phoenix Wings"
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Coin Price</label>
                  <input
                    type="number"
                    value={coinPrice}
                    onChange={(e) => setCoinPrice(parseInt(e.target.value, 10) || 1)}
                    required
                    min={1}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
                  >
                    <option value="Popular">Popular</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Romance">Romance</option>
                    <option value="Special">Special</option>
                    <option value="Effects">Effects</option>
                    <option value="VIP">VIP</option>
                    <option value="Lucky">Lucky</option>
                  </select>
                </div>
              </div>

              {category === 'Lucky' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <h4 className="text-amber-400 font-bold mb-2 text-[11px] uppercase tracking-wider">Lucky Backup Conversion</h4>
                  <p className="text-xs text-amber-200/80 mb-3">Lucky gifts convert coins to diamonds based on a specific rate.</p>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Coins per 1 Diamond</label>
                    <input
                      type="number"
                      value={luckyCoinToDiamondRate}
                      onChange={(e) => setLuckyCoinToDiamondRate(parseInt(e.target.value) || 20)}
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-amber-500"
                      min="1"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Host receives {Math.floor(coinPrice / luckyCoinToDiamondRate)} diamonds for this gift.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Animation Effect</label>
                  <select
                    value={animationType}
                    onChange={(e) => setAnimationType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
                  >
                    <option value="sports_car">🏎️ Sports Supercar</option>
                    <option value="dragon">🐉 Imperial Dragon</option>
                    <option value="crown">👑 Royal Crown</option>
                    <option value="rocket">🚀 Space Rocket</option>
                    <option value="galaxy">🌌 Cosmic Galaxy</option>
                    <option value="diamond_rain">💍 Diamond Splendor</option>
                    <option value="rose_shower">🌹 Rose Bouquet</option>
                    <option value="confetti">✨ Basic Confetti</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">DJ Sound Effect</label>
                  <select
                    value={soundEffect}
                    onChange={(e) => setSoundEffect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
                  >
                    <option value="chime">Chime</option>
                    <option value="fanfare">Fanfare</option>
                    <option value="engine">Engine</option>
                    <option value="applause">Applause</option>
                    <option value="cheer">Cheer</option>
                    <option value="airhorn">Airhorn</option>
                  </select>
                </div>
              </div>

              {/* VIP Toggle */}
              <div className="pt-2 border-t border-[#232332] flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isVipOnly}
                    onChange={(e) => setIsVipOnly(e.target.checked)}
                    className="rounded-sm bg-[#1A1A24] border-[#232332]"
                  />
                  <span>VIP Privilege Required</span>
                </label>

                {isVipOnly && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Min VIP:</span>
                    <select
                      value={minVipLevel}
                      onChange={(e) => setMinVipLevel(parseInt(e.target.value, 10))}
                      className="px-2 py-1 rounded-lg bg-[#1A1A24] border border-[#232332] text-white font-bold"
                    >
                      <option value={1}>VIP 1</option>
                      <option value={2}>VIP 2</option>
                      <option value={3}>VIP 3</option>
                      <option value={4}>VIP 4</option>
                      <option value={5}>VIP 5</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-bold text-xs shadow-md mt-2 hover:brightness-110 active:scale-98 transition-all"
              >
                {editingGift ? 'Save Changes' : 'Create Virtual Gift'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
