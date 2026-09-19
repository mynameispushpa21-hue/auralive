import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Radio, Video, Lock, Sparkles, X, LayoutGrid, Gem } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { VoiceRoom } from '../../types';
import { ROOM_THEMES } from '../../data/roomThemesData';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { createRoom, currentUser, isRoomThemeUnlocked } = useAppState();
  const [title, setTitle] = useState(`${currentUser.displayName}'s Lounge 🎙️`);
  const [category, setCategory] = useState<VoiceRoom['category']>('Music');
  const [seatCount, setSeatCount] = useState<number>(50);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState('Welcome! Hop on mic and let us vibe 🎵');
  const [backgroundTheme, setBackgroundTheme] = useState(ROOM_THEMES[0].gradientClass);

  if (!isOpen) return null;

  const categories: VoiceRoom['category'][] = ['Music', 'Chat', 'Gaming', 'Karaoke', 'Chill', 'Dating', 'Talent', 'Language'];

  const handleCreate = () => {
    if (!title.trim()) return;
    createRoom({
      title: title.trim(),
      category,
      seatCount,
      isPrivate,
      password: isPrivate ? password : undefined,
      isVideoEnabled,
      announcement,
      backgroundTheme,
      tags: [category, isVideoEnabled ? 'Video' : 'Voice', `${seatCount} Seats`],
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-[#121217] border border-[#232332] rounded-3xl p-5 shadow-2xl flex flex-col text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Go Live / Create Room</h3>
                <p className="text-xs text-slate-400">Launch an audio stage for your audience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4 my-4">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Room Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your room an engaging title..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-sm focus:outline-hidden focus:border-violet-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      category === cat
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                        : 'bg-[#1A1A24] text-slate-400 hover:bg-[#232332]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Layout */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Microphone Seats</label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSeatCount(count)}
                    className={`py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      seatCount === count
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-[#1A1A24] border-[#232332] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Gradient */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Stage Atmosphere Theme</label>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Gem className="w-3 h-3 fill-amber-400" />
                  <span>Premium themes unlockable</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {ROOM_THEMES.map((t) => {
                  const unlocked = isRoomThemeUnlocked(t.id);
                  const isSelected = backgroundTheme === t.gradientClass;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (unlocked) {
                          setBackgroundTheme(t.gradientClass);
                        }
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-between transition-all text-left ${
                        isSelected
                          ? 'border-violet-500 bg-[#1A1A24] ring-1 ring-violet-500/40'
                          : 'border-[#232332] bg-[#161620] text-slate-400'
                      } ${!unlocked ? 'opacity-65 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-5 h-5 rounded-md shrink-0 bg-gradient-to-r ${t.previewGradient} border border-white/20`} />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-200 truncate">{t.name}</div>
                          <div className="text-[9px] text-slate-400">
                            {t.priceDiamonds === 0 ? 'Free' : unlocked ? 'Unlocked' : `💎 ${t.priceDiamonds}`}
                          </div>
                        </div>
                      </div>
                      {!unlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Announcement */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Room Announcement</label>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-400"
              />
            </div>

            {/* Toggles: Video & Private */}
            <div className="pt-2 border-t border-[#232332] flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <Video className="w-4 h-4 text-violet-400" />
                <span>Enable Live Video Feeds</span>
                <input
                  type="checkbox"
                  checked={isVideoEnabled}
                  onChange={(e) => setIsVideoEnabled(e.target.checked)}
                  className="rounded-sm bg-[#1A1A24] border-[#232332] text-violet-600 ml-2"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Private (Password)</span>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded-sm bg-[#1A1A24] border-[#232332] text-amber-500 ml-2"
                />
              </label>
            </div>

            {isPrivate && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set 4-digit room password..."
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-400"
              />
            )}
          </div>

          {/* Action */}
          <button
            onClick={handleCreate}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-violet-500/20 active:scale-98 transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>Launch Stage Now</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
