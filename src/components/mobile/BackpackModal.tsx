import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Check, Crown, Zap, Shield, Car, MessageCircle, Award } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface BackpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVIPCenter?: () => void;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({ isOpen, onClose, onOpenVIPCenter }) => {
  const { currentUser, updateCurrentUserProfile, vipTiers } = useAppState();
  const [activeCategory, setActiveCategory] = useState<'frames' | 'rides' | 'bubbles' | 'badges'>('frames');
  const [equippedNotice, setEquippedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const avatarFrames = [
    { id: 'frame_none', name: 'Default Border', icon: '⭕', ringClass: 'ring-violet-500', isDefault: true },
    { id: 'frame_neon', name: 'Neon Cyber Ring', icon: '🔮', ringClass: 'ring-fuchsia-500 ring-4 ring-offset-2 ring-offset-[#121217]' },
    { id: 'frame_gold', name: 'Royal Gold Tiara', icon: '👑', ringClass: 'ring-amber-400 ring-4 ring-offset-2 ring-offset-[#121217]' },
    { id: 'frame_diamond', name: 'Diamond Galaxy', icon: '💎', ringClass: 'ring-cyan-400 ring-4 ring-offset-2 ring-offset-[#121217]' },
    { id: 'frame_sakura', name: 'Sakura Blossom', icon: '🌸', ringClass: 'ring-pink-400 ring-4 ring-offset-2 ring-offset-[#121217]' },
  ];

  const entryRides = [
    { id: 'ride_none', name: 'Standard Walk-In', icon: '🚶‍♂️', desc: 'Normal entrance without vehicle animation' },
    { id: 'ride_supercar', name: 'Phantom Gold Supercar', icon: '🏎️', desc: 'Vroooom! Luxury gold supercar rolls across stage' },
    { id: 'ride_jet', name: 'Falcon Stealth Jet', icon: '🛩️', desc: 'Supersonic jet flyover with jet stream trail' },
    { id: 'ride_dragon', name: 'Celestial Galaxy Dragon', icon: '🐉', desc: 'Mythical dragon soaring with celestial stardust' },
  ];

  const chatBubbles = [
    { id: 'bubble_default', name: 'Midnight Minimal', bg: 'bg-[#1A1A24]', text: 'text-white' },
    { id: 'bubble_neon', name: 'Electric Violet Glow', bg: 'bg-violet-950/80 border-violet-500/50', text: 'text-violet-200' },
    { id: 'bubble_gold', name: 'Imperial Amber Radiance', bg: 'bg-amber-950/80 border-amber-500/50', text: 'text-amber-200' },
  ];

  const badges = [
    { id: 'badge_star', title: 'Top Star Host', icon: '🌟', rarity: 'Gold' },
    { id: 'badge_whale', title: 'Generous Whale', icon: '🐋', rarity: 'Legendary' },
    { id: 'badge_dj', title: 'Stage DJ Master', icon: '🎧', rarity: 'Epic' },
    { id: 'badge_early', title: 'AuraVoice Pioneer', icon: '🚀', rarity: 'Rare' },
  ];

  const handleEquipFrame = (frameId: string, name: string) => {
    updateCurrentUserProfile({ avatarFrame: frameId });
    setEquippedNotice(`Equipped: ${name}!`);
    setTimeout(() => setEquippedNotice(null), 2500);
  };

  const handleEquipBadge = (title: string) => {
    updateCurrentUserProfile({ badgeTitle: title });
    setEquippedNotice(`Equipped Badge Title: ${title}!`);
    setTimeout(() => setEquippedNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm bg-[#121217] border border-[#232332] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#232332] flex items-center justify-between bg-[#1A1A24]/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">My Backpack & Wardrobe</h3>
              <p className="text-[10px] text-slate-400">Equip your frames, vehicles, titles & bubbles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-4 border-b border-[#232332] bg-[#0E0E14] text-xs font-bold text-center">
          <button
            onClick={() => setActiveCategory('frames')}
            className={`py-2.5 transition-all border-b-2 flex items-center justify-center gap-1 ${
              activeCategory === 'frames'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Frames</span>
          </button>
          <button
            onClick={() => setActiveCategory('rides')}
            className={`py-2.5 transition-all border-b-2 flex items-center justify-center gap-1 ${
              activeCategory === 'rides'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Rides</span>
          </button>
          <button
            onClick={() => setActiveCategory('bubbles')}
            className={`py-2.5 transition-all border-b-2 flex items-center justify-center gap-1 ${
              activeCategory === 'bubbles'
                ? 'border-fuchsia-500 text-fuchsia-300 bg-fuchsia-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Bubbles</span>
          </button>
          <button
            onClick={() => setActiveCategory('badges')}
            className={`py-2.5 transition-all border-b-2 flex items-center justify-center gap-1 ${
              activeCategory === 'badges'
                ? 'border-cyan-500 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Badges</span>
          </button>
        </div>

        {equippedNotice && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{equippedNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 min-h-[260px] text-xs">
          {/* Avatar Frames */}
          {activeCategory === 'frames' && (
            <div className="grid grid-cols-2 gap-2.5">
              {avatarFrames.map((frame) => {
                const isEquipped = (currentUser.avatarFrame || 'frame_none') === frame.id;

                return (
                  <div
                    key={frame.id}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center gap-2 transition-all ${
                      isEquipped
                        ? 'bg-[#1A1A28] border-violet-500 shadow-md shadow-violet-500/20'
                        : 'bg-[#1A1A24] border-[#232332]'
                    }`}
                  >
                    <div className="relative my-1">
                      <img
                        src={currentUser.avatar}
                        alt="Preview"
                        className={`w-12 h-12 rounded-full object-cover ${frame.ringClass}`}
                      />
                      <span className="text-xl absolute -bottom-1 -right-1">{frame.icon}</span>
                    </div>

                    <div>
                      <span className="font-bold text-white block">{frame.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {frame.isDefault ? 'Standard Item' : 'VIP Privilege'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEquipFrame(frame.id, frame.name)}
                      className={`w-full py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                        isEquipped
                          ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50'
                          : 'bg-[#121217] hover:bg-[#232332] text-slate-200 border border-[#232332]'
                      }`}
                    >
                      {isEquipped ? 'Active' : 'Equip'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Entrance Rides */}
          {activeCategory === 'rides' && (
            <div className="space-y-2">
              {entryRides.map((ride) => (
                <div
                  key={ride.id}
                  className="p-3.5 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ride.icon}</span>
                    <div>
                      <h4 className="font-bold text-white">{ride.name}</h4>
                      <p className="text-[10px] text-slate-400">{ride.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEquippedNotice(`Entrance Ride set to ${ride.name}!`);
                      setTimeout(() => setEquippedNotice(null), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shrink-0 hover:bg-amber-500/30"
                  >
                    Equip
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chat Bubbles */}
          {activeCategory === 'bubbles' && (
            <div className="space-y-2">
              {chatBubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  className="p-3.5 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{bubble.name}</span>
                    <button
                      onClick={() => {
                        setEquippedNotice(`Chat Bubble skin updated to ${bubble.name}!`);
                        setTimeout(() => setEquippedNotice(null), 2500);
                      }}
                      className="px-3 py-1 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/40 text-xs font-bold hover:bg-violet-600/30"
                    >
                      Use
                    </button>
                  </div>
                  <div className={`p-2.5 rounded-2xl border ${bubble.bg} ${bubble.text} text-xs font-medium`}>
                    "Hey everyone in the party stage! Loving the music vibe tonight ✨"
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Badges & Titles */}
          {activeCategory === 'badges' && (
            <div className="space-y-2">
              {badges.map((b) => {
                const isEquipped = (currentUser.badgeTitle || 'Top Star Host') === b.title;

                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{b.title}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 text-[9px] font-bold">
                            {b.rarity}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Displays on mic seats & ranking tables</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEquipBadge(b.title)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all ${
                        isEquipped
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-[#121217] hover:bg-[#232332] text-slate-200 border border-[#232332]'
                      }`}
                    >
                      {isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
