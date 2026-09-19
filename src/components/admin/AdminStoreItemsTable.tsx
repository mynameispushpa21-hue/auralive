import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Volume2,
  Car,
  MessageCircle,
  Award,
  Zap,
  Flame,
  Search,
  Check,
  X,
  Play,
  Waves,
  Crown,
  Eye,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { StoreItem, StoreItemCategory } from '../../types';
import { audioEngine, SoundEffectType } from '../../services/audioEngine';

export const AdminStoreItemsTable: React.FC = () => {
  const {
    storeItems,
    adminAddStoreItem,
    adminUpdateStoreItem,
    adminDeleteStoreItem,
    adminToggleStoreItemStatus,
  } = useAppState();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<StoreItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentlyPlayingSound, setCurrentlyPlayingSound] = useState<string | null>(null);

  // Form Fields State
  const [formCategory, setFormCategory] = useState<StoreItemCategory>('frames');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('✨');
  const [formRarity, setFormRarity] = useState<StoreItem['rarity']>('Rare');
  const [formPrice7d, setFormPrice7d] = useState<number>(300);
  const [formPrice30d, setFormPrice30d] = useState<number>(900);
  const [formPricePerm, setFormPricePerm] = useState<number>(2500);
  const [formSoundEffect, setFormSoundEffect] = useState<SoundEffectType | ''>('');
  const [formRequiredVip, setFormRequiredVip] = useState<string>('');
  const [formBadgeTag, setFormBadgeTag] = useState('');
  const [formGlowColor, setFormGlowColor] = useState('purple');
  const [formThemeGradient, setFormThemeGradient] = useState('from-violet-600 to-indigo-600');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const availableSoundEffects: { label: string; value: SoundEffectType }[] = [
    { label: 'Chime (Subtle)', value: 'chime' },
    { label: 'Fanfare (Celebratory)', value: 'fanfare' },
    { label: 'Airhorn (Hype / Energy)', value: 'airhorn' },
    { label: 'Laser (Sci-Fi / Modern)', value: 'laser' },
    { label: 'Applause (Audience Cheers)', value: 'applause' },
    { label: 'Magic (Sparkle / Fantasy)', value: 'magic' },
    { label: 'Level Up (Triumph)', value: 'levelup' },
    { label: 'Drumroll (Suspense)', value: 'drumroll' },
    { label: 'Whistle (Energetic)', value: 'whistle' },
    { label: 'Bell (Crisp)', value: 'bell' },
    { label: 'Pop (Punchy)', value: 'pop' },
  ];

  const handlePlaySound = (sound: string) => {
    setCurrentlyPlayingSound(sound);
    audioEngine.playSoundEffect(sound as any);
    setTimeout(() => {
      setCurrentlyPlayingSound(null);
    }, 1500);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormCategory('frames');
    setFormName('');
    setFormDescription('');
    setFormIcon('✨');
    setFormRarity('Rare');
    setFormPrice7d(300);
    setFormPrice30d(900);
    setFormPricePerm(2500);
    setFormSoundEffect('');
    setFormRequiredVip('');
    setFormBadgeTag('');
    setFormGlowColor('purple');
    setFormThemeGradient('from-violet-600 to-indigo-600');
    setFormStatus('active');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: StoreItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormIcon(item.icon);
    setFormRarity(item.rarity);
    setFormPrice7d(item.price7Days);
    setFormPrice30d(item.price30Days);
    setFormPricePerm(item.pricePermanent);
    setFormSoundEffect((item.soundEffect as SoundEffectType) || '');
    setFormRequiredVip(item.requiredVip || '');
    setFormBadgeTag(item.badgeTag || '');
    setFormGlowColor(item.glowColor || 'purple');
    setFormThemeGradient(item.themeGradient || 'from-violet-600 to-indigo-600');
    setFormStatus(item.status || 'active');
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload: Partial<StoreItem> = {
      category: formCategory,
      name: formName.trim(),
      description: formDescription.trim() || `${formName} luxury store asset`,
      icon: formIcon || '✨',
      rarity: formRarity,
      price7Days: Number(formPrice7d) || 0,
      price30Days: Number(formPrice30d) || 0,
      pricePermanent: Number(formPricePerm) || 0,
      soundEffect: (formSoundEffect as any) || undefined,
      requiredVip: formRequiredVip ? (formRequiredVip as any) : undefined,
      badgeTag: (formBadgeTag.trim() as any) || undefined,
      glowColor: formGlowColor,
      themeGradient: formThemeGradient,
      status: formStatus,
    };

    if (editingItem) {
      adminUpdateStoreItem(editingItem.id, payload);
    } else {
      adminAddStoreItem(payload);
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete store item "${itemName}"?`)) {
      adminDeleteStoreItem(itemId);
    }
  };

  // Filtered items
  const filteredItems = storeItems.filter((item) => {
    if (activeCategoryFilter !== 'all' && item.category !== activeCategoryFilter) {
      return false;
    }
    if (selectedRarityFilter !== 'all' && item.rarity !== selectedRarityFilter) {
      return false;
    }
    if (activeStatusFilter !== 'all') {
      const itemStatus = item.status || 'active';
      if (itemStatus !== activeStatusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDesc) return false;
    }
    return true;
  });

  const getRarityBadge = (rarity: StoreItem['rarity']) => {
    switch (rarity) {
      case 'Mythic':
        return 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-black shadow-xs';
      case 'Legendary':
        return 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black shadow-xs';
      case 'Epic':
        return 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold';
      case 'Rare':
        return 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600 font-medium';
    }
  };

  const getCategoryIcon = (category: StoreItemCategory) => {
    switch (category) {
      case 'frames':
        return '🖼️';
      case 'rides':
        return '🏎️';
      case 'sounds':
        return '🔊';
      case 'waves':
        return '🌊';
      case 'bubbles':
        return '💬';
      case 'badges':
        return '👑';
      case 'effects':
        return '✨';
      default:
        return '🎁';
    }
  };

  // Category counts
  const categoryCounts = storeItems.reduce((acc, it) => {
    acc[it.category] = (acc[it.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-violet-400" />
            <span>Store Assets & Visual Items Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure avatar frames, entrance rides, sound effects, voice waves, chat bubbles, and badges
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:brightness-110 active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store Asset</span>
        </button>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Avatar Frames', key: 'frames', count: categoryCounts['frames'] || 0, icon: '🖼️', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30' },
          { label: 'Entrance Rides', key: 'rides', count: categoryCounts['rides'] || 0, icon: '🏎️', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30' },
          { label: 'Audio Sounds', key: 'sounds', count: categoryCounts['sounds'] || 0, icon: '🔊', color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30' },
          { label: 'Voice Waves', key: 'waves', count: categoryCounts['waves'] || 0, icon: '🌊', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30' },
          { label: 'Chat Bubbles', key: 'bubbles', count: categoryCounts['bubbles'] || 0, icon: '💬', color: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/30' },
          { label: 'Honor Badges', key: 'badges', count: categoryCounts['badges'] || 0, icon: '👑', color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30' },
          { label: 'Entry FX', key: 'effects', count: categoryCounts['effects'] || 0, icon: '✨', color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30' },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === stat.key ? 'all' : (stat.key as StoreItemCategory))}
            className={`p-3 rounded-2xl bg-gradient-to-b ${stat.color} border text-left transition-all ${
              activeCategoryFilter === stat.key ? 'ring-2 ring-violet-400 scale-[1.02]' : 'hover:opacity-90'
            }`}
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-lg font-black text-white">{stat.count}</div>
            <div className="text-[10px] text-slate-400 font-medium truncate">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Catalog', icon: '✨' },
              { id: 'frames', label: 'Frames', icon: '🖼️' },
              { id: 'rides', label: 'Rides', icon: '🏎️' },
              { id: 'sounds', label: 'Sounds', icon: '🔊' },
              { id: 'waves', label: 'Waves', icon: '🌊' },
              { id: 'bubbles', label: 'Bubbles', icon: '💬' },
              { id: 'badges', label: 'Badges', icon: '👑' },
              { id: 'effects', label: 'Effects', icon: '✨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategoryFilter === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm'
                    : 'bg-[#1A1A24] text-slate-400 hover:text-white border border-[#232332]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search store assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#232332] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-semibold">Rarity:</span>
            <select
              value={selectedRarityFilter}
              onChange={(e) => setSelectedRarityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#1A1A24] border border-[#232332] text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
              <option value="Mythic">Mythic</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-semibold">Status:</span>
            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-[#1A1A24] border border-[#232332] text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active in Mall</option>
              <option value="inactive">Inactive / Hidden</option>
            </select>
          </div>

          <span className="ml-auto text-slate-400 text-[11px]">
            Showing <strong className="text-white">{filteredItems.length}</strong> of {storeItems.length} assets
          </span>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isActive = (item.status || 'active') === 'active';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl bg-[#121217] border ${
                isActive ? 'border-[#232332]' : 'border-rose-900/40 opacity-75'
              } flex flex-col justify-between space-y-3 shadow-md hover:border-violet-500/40 transition-all`}
            >
              {/* Header card info */}
              <div className="flex items-start justify-between">
                {/* Visual Icon / Preview */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-center text-3xl shadow-inner">
                    {item.icon}
                  </div>

                  {/* Sound Preview Action for audio / rides */}
                  {item.soundEffect && (
                    <button
                      onClick={() => handlePlaySound(item.soundEffect!)}
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full ${
                        currentlyPlayingSound === item.soundEffect
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-violet-600 text-white hover:bg-violet-500'
                      } shadow-md transition-all`}
                      title={`Play Sound: ${item.soundEffect}`}
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Right badges */}
                <div className="text-right space-y-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] ${getRarityBadge(item.rarity)}`}>
                    {item.rarity}
                  </span>

                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-[#1A1A24] text-[9px] font-bold text-slate-300 border border-[#232332]">
                      {getCategoryIcon(item.category)} {item.category.toUpperCase()}
                    </span>
                  </div>

                  {item.requiredVip && (
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 text-[9px] font-black">
                        {item.requiredVip.toUpperCase()}+
                      </span>
                    </div>
                  )}

                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{item.name}</span>
                  {item.badgeTag && (
                    <span className="px-1.5 py-0.2 rounded-md bg-violet-600/30 text-violet-300 border border-violet-500/40 text-[9px] font-semibold">
                      {item.badgeTag}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
              </div>

              {/* Pricing breakdown */}
              <div className="p-2 rounded-xl bg-[#1A1A24] border border-[#232332] grid grid-cols-3 gap-1 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold">7 Days</span>
                  <span className="text-[11px] font-extrabold text-amber-300">
                    🪙 {item.price7Days.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold">30 Days</span>
                  <span className="text-[11px] font-extrabold text-amber-300">
                    🪙 {item.price30Days.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold">Permanent</span>
                  <span className="text-[11px] font-extrabold text-amber-300">
                    🪙 {item.pricePermanent.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Sales: <strong className="text-slate-300">{item.salesCount || 0}</strong></span>
                <span className="font-mono text-[9px] truncate max-w-[120px]">{item.id}</span>
              </div>

              {/* Card Actions */}
              <div className="pt-2 border-t border-[#232332] flex items-center justify-between gap-2">
                <button
                  onClick={() => adminToggleStoreItemStatus(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg bg-[#1A1A24] hover:bg-[#232332] text-violet-300 border border-[#232332] transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg bg-[#1A1A24] hover:bg-rose-900/30 text-rose-400 border border-[#232332] transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#121217] border border-[#232332] text-slate-400 space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-white">No store assets found matching your criteria</p>
          <p className="text-xs text-slate-500">Try adjusting your category filter, rarity filter, or search query.</p>
          <button
            onClick={() => {
              setActiveCategoryFilter('all');
              setSelectedRarityFilter('all');
              setActiveStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-xs font-bold text-violet-300 hover:bg-[#232332] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Add / Edit Store Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#121217] border border-[#232332] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    {editingItem ? `Edit Store Asset: ${editingItem.name}` : 'Add New Store Asset'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure catalog properties, duration pricing, and audio effects</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full bg-[#1A1A24] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              {/* Category & Rarity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Asset Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as StoreItemCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="frames">Avatar Frames 🖼️</option>
                    <option value="rides">Entrance Rides 🏎️</option>
                    <option value="sounds">Audio Effects 🔊</option>
                    <option value="waves">Voice Waves 🌊</option>
                    <option value="bubbles">Chat Bubbles 💬</option>
                    <option value="badges">Honor Badges 👑</option>
                    <option value="effects">Entry Effects ✨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rarity Tier</label>
                  <select
                    value={formRarity}
                    onChange={(e) => setFormRarity(e.target.value as StoreItem['rarity'])}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Mythic">Mythic</option>
                  </select>
                </div>
              </div>

              {/* Name & Icon */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Item Display Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Celestial Golden Ring"
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    required
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="e.g. 👑"
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white placeholder-slate-500 text-center text-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe visual effects and privileges..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Pricing Tiers (7d, 30d, perm) */}
              <div className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-2">
                <label className="block text-slate-300 font-bold">Coin Pricing Structure</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">7 Days</span>
                    <input
                      type="number"
                      min={0}
                      value={formPrice7d}
                      onChange={(e) => setFormPrice7d(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121217] border border-[#232332] text-amber-300 font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">30 Days</span>
                    <input
                      type="number"
                      min={0}
                      value={formPrice30d}
                      onChange={(e) => setFormPrice30d(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121217] border border-[#232332] text-amber-300 font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Permanent</span>
                    <input
                      type="number"
                      min={0}
                      value={formPricePerm}
                      onChange={(e) => setFormPricePerm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121217] border border-[#232332] text-amber-300 font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sound Effect & VIP Lock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span>Synthesized Audio Effect</span>
                    {formSoundEffect && (
                      <button
                        type="button"
                        onClick={() => handlePlaySound(formSoundEffect)}
                        className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Test Sound
                      </button>
                    )}
                  </label>
                  <select
                    value={formSoundEffect}
                    onChange={(e) => setFormSoundEffect(e.target.value as SoundEffectType | '')}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">None (Silent)</option>
                    {availableSoundEffects.map((snd) => (
                      <option key={snd.value} value={snd.value}>
                        {snd.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">VIP Exclusivity Requirement</label>
                  <select
                    value={formRequiredVip}
                    onChange={(e) => setFormRequiredVip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Open to All Members</option>
                    <option value="vip_1">VIP 1 (Bronze) & Above</option>
                    <option value="vip_2">VIP 2 (Silver) & Above</option>
                    <option value="vip_3">VIP 3 (Gold) & Above</option>
                    <option value="vip_4">VIP 4 (Platinum) & Above</option>
                    <option value="vip_5">VIP 5 (Diamond Elite)</option>
                  </select>
                </div>
              </div>

              {/* Badge Tag & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tag / Ribbons</label>
                  <input
                    type="text"
                    value={formBadgeTag}
                    onChange={(e) => setFormBadgeTag(e.target.value)}
                    placeholder="e.g. HOT, NEW, EXCLUSIVE"
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mall Visibility Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="inactive">Inactive (Hidden from Users)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#232332] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A1A24] text-slate-300 font-bold hover:bg-[#232332] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Update Asset' : 'Create Store Asset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
