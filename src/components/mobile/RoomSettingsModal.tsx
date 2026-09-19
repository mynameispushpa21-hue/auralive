import React, { useState } from 'react';
import {
  Settings,
  Shield,
  X,
  Image as ImageIcon,
  Users,
  Ban,
  Power,
  ArrowLeft,
  Plus,
  Check,
  Gem,
  Lock,
  Palette,
  Sparkles,
  AlertCircle,
  Mic,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { VoiceRoom, RoomTheme } from '../../types';
import { ROOM_THEMES } from '../../data/roomThemesData';
import { motion, AnimatePresence } from 'motion/react';

interface RoomSettingsModalProps {
  room: VoiceRoom;
  onClose: () => void;
  initialView?: 'main' | 'moderators' | 'banned' | 'background';
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({ room, onClose, initialView = 'main' }) => {
  const {
    currentUser,
    allUsers,
    adminCloseRoom,
    hostUpdateRoom,
    hostAssignModerator,
    hostRemoveModerator,
    hostUnbanUser,
    isRoomThemeUnlocked,
    unlockRoomTheme,
    hostChangeRoomTheme,
  } = useAppState();
  const isHost = room.hostId === currentUser.id;

  const [title, setTitle] = useState(room.title);
  const [announcement, setAnnouncement] = useState(room.announcement);
  const [view, setView] = useState<'main' | 'moderators' | 'banned' | 'background'>(initialView);
  const [themeTab, setThemeTab] = useState<'all' | 'free' | 'premium' | 'luxury' | 'unlocked'>('all');
  const [unlockConfirmTheme, setUnlockConfirmTheme] = useState<RoomTheme | null>(null);
  const [autoApplyOnUnlock, setAutoApplyOnUnlock] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setFeedbackToast({ text, isError });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleSave = () => {
    hostUpdateRoom(room.id, {
      title,
      announcement
    });
    onClose();
  };

  const handleCloseRoom = () => {
    if (window.confirm('Are you sure you want to close this room?')) {
      adminCloseRoom(room.id, 'Host closed room');
      onClose();
    }
  };

  const handleApplyTheme = (theme: RoomTheme) => {
    const result = hostChangeRoomTheme(room.id, theme.id);
    if (result.success) {
      showToast(`Applied "${theme.name}" to your stage!`);
    } else {
      showToast(result.message, true);
    }
  };

  const handleConfirmUnlock = () => {
    if (!unlockConfirmTheme) return;
    const res = unlockRoomTheme(unlockConfirmTheme.id);
    if (res.success) {
      if (autoApplyOnUnlock) {
        hostChangeRoomTheme(room.id, unlockConfirmTheme.id);
        showToast(`Unlocked & applied "${unlockConfirmTheme.name}"!`);
      } else {
        showToast(res.message);
      }
      setUnlockConfirmTheme(null);
    } else {
      showToast(res.message, true);
    }
  };

  const filteredThemes = ROOM_THEMES.filter((t) => {
    if (themeTab === 'all') return true;
    if (themeTab === 'free') return t.category === 'free';
    if (themeTab === 'premium') return t.category === 'premium';
    if (themeTab === 'luxury') return t.category === 'luxury';
    if (themeTab === 'unlocked') return isRoomThemeUnlocked(t.id);
    return true;
  });

  const renderMainView = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Room Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#1A1A24] border border-[#232332] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
              disabled={!isHost}
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Room Announcement</label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#1A1A24] border border-[#232332] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
              disabled={!isHost}
            />
          </div>
          
          {isHost && (
            <button 
              onClick={() => setView('background')}
              className="w-full py-3 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-amber-600/30 border border-violet-500/50 rounded-xl text-sm font-bold text-white hover:border-violet-400 transition-all flex items-center justify-between px-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-violet-400" />
                <div className="text-left">
                  <div className="text-sm font-bold text-white">Stage Themes & Backgrounds</div>
                  <div className="text-[11px] text-slate-300 font-normal">Unlock premium room aesthetics with diamonds</div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                <Gem className="w-3 h-3 fill-amber-300" />
                <span>Store</span>
              </span>
            </button>
          )}
        </div>

        <div className="border-t border-[#232332] pt-4 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase">Moderation</h4>
          
          {isHost && (
            <button 
              onClick={() => setView('moderators')}
              className="w-full p-3 bg-[#1A1A24] border border-[#232332] rounded-xl text-sm font-bold text-slate-200 hover:bg-[#232332] transition-colors flex items-center gap-3"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <div className="flex-1 text-left">
                <div className="text-sm">Manage Moderators</div>
                <div className="text-[10px] text-slate-400 font-normal">Assign or remove room mods</div>
              </div>
            </button>
          )}

          <button 
            onClick={() => setView('banned')}
            className="w-full p-3 bg-[#1A1A24] border border-[#232332] rounded-xl text-sm font-bold text-slate-200 hover:bg-[#232332] transition-colors flex items-center gap-3"
          >
            <Ban className="w-4 h-4 text-rose-400" />
            <div className="flex-1 text-left">
              <div className="text-sm">Banned Users</div>
              <div className="text-[10px] text-slate-400 font-normal">View and unban users</div>
            </div>
          </button>
        </div>
      </div>

      {isHost ? (
        <div className="p-4 border-t border-[#232332] bg-[#1A1A24] space-y-3">
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/20"
          >
            Save Changes
          </button>
          
          <button 
            onClick={handleCloseRoom}
            className="w-full py-3 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900 text-rose-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Power className="w-4 h-4" />
            End Room & Disconnect
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-[#232332] bg-[#1A1A24]">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/20"
          >
            Close
          </button>
        </div>
      )}
    </>
  );

  const renderModeratorsView = () => {
    const moderators = allUsers.filter(u => room.moderatorIds.includes(u.id));
    const nonModerators = allUsers.filter(u => !room.moderatorIds.includes(u.id) && u.id !== currentUser.id);

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase">Current Moderators</h4>
        {moderators.length === 0 && <p className="text-sm text-slate-500">No moderators assigned.</p>}
        {moderators.map(mod => (
          <div key={mod.id} className="flex items-center justify-between bg-[#1A1A24] p-3 rounded-xl border border-[#232332]">
            <div className="flex items-center gap-3">
              <img src={mod.avatar} alt={mod.displayName} className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-sm font-bold text-white">{mod.displayName}</p>
                <p className="text-xs text-slate-400">@{mod.username}</p>
              </div>
            </div>
            <button 
              onClick={() => hostRemoveModerator(room.id, mod.id)}
              className="p-2 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <h4 className="text-xs font-bold text-slate-400 uppercase mt-6 pt-6 border-t border-[#232332]">Assign Moderators</h4>
        {nonModerators.map(user => (
          <div key={user.id} className="flex items-center justify-between bg-[#1A1A24] p-3 rounded-xl border border-[#232332]">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-sm font-bold text-white">{user.displayName}</p>
                <p className="text-xs text-slate-400">@{user.username}</p>
              </div>
            </div>
            <button 
              onClick={() => hostAssignModerator(room.id, user.id)}
              className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderBannedView = () => {
    const bannedUsersList = allUsers.filter(u => room.bannedUserIds?.includes(u.id));

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase">Banned Users</h4>
        {bannedUsersList.length === 0 ? (
          <p className="text-sm text-slate-500">No users are banned from this room.</p>
        ) : (
          bannedUsersList.map(user => (
            <div key={user.id} className="flex items-center justify-between bg-[#1A1A24] p-3 rounded-xl border border-[#232332]">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full grayscale" />
                <div>
                  <p className="text-sm font-bold text-white">{user.displayName}</p>
                  <p className="text-xs text-slate-400">@{user.username}</p>
                </div>
              </div>
              <button 
                onClick={() => hostUnbanUser(room.id, user.id)}
                className="px-3 py-1.5 rounded-lg bg-[#232332] hover:bg-[#303040] text-sm text-white font-bold"
              >
                Unban
              </button>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderBackgroundView = () => {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Host Diamonds Balance & Header Banner */}
        <div className="p-4 bg-gradient-to-b from-[#181824] to-[#121217] border-b border-[#232332] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-violet-400" />
                <span>Room Stage Theme Studio</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Unlock exclusive stage atmospheres using your Diamonds
              </p>
            </div>

            {/* Host Diamonds Balance */}
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
              <Gem className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <div className="text-right">
                <div className="text-[9px] uppercase font-bold text-amber-300 leading-none">Your Diamonds</div>
                <div className="text-xs font-extrabold text-white leading-tight">
                  {currentUser.diamonds?.toLocaleString() ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: 'all', label: 'All Themes' },
              { id: 'free', label: 'Free' },
              { id: 'premium', label: 'Premium' },
              { id: 'luxury', label: 'Luxury' },
              { id: 'unlocked', label: 'Unlocked' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setThemeTab(tab.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                  themeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-[#1E1E2C] text-slate-400 hover:text-slate-200 border border-[#28283C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Themes Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filteredThemes.map((theme) => {
              const isUnlocked = isRoomThemeUnlocked(theme.id);
              const isCurrentActive = room.backgroundTheme === theme.gradientClass;
              const canAfford = (currentUser.diamonds || 0) >= theme.priceDiamonds;

              return (
                <div
                  key={theme.id}
                  className={`relative rounded-2xl border transition-all overflow-hidden flex flex-col bg-[#161622] ${
                    isCurrentActive
                      ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-lg shadow-violet-500/10'
                      : 'border-[#232332] hover:border-slate-600'
                  }`}
                >
                  {/* Theme Visual Stage Simulation Box */}
                  <div className={`relative h-24 w-full bg-gradient-to-b ${theme.gradientClass} p-2 flex flex-col justify-between overflow-hidden`}>
                    {/* Atmospheric Glow Overlay */}
                    <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-black/40 pointer-events-none" />

                    {/* Top status badges */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      {theme.badge ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white">
                          {theme.badge}
                        </span>
                      ) : (
                        <span />
                      )}

                      {!isUnlocked && (
                        <span className="p-1 rounded-full bg-black/70 border border-amber-500/50 backdrop-blur-md">
                          <Lock className="w-3 h-3 text-amber-400" />
                        </span>
                      )}
                    </div>

                    {/* Center Mic Stage Indicator */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-md">
                        <Mic className="w-3.5 h-3.5 text-white/80" />
                      </div>
                    </div>

                    {/* Active Indicator Banner */}
                    {isCurrentActive && (
                      <div className="relative z-10 self-center px-2 py-0.5 rounded-full bg-violet-600/90 border border-violet-400 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{theme.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                        {theme.description}
                      </p>
                    </div>

                    {/* Price & Action Button */}
                    <div className="pt-1">
                      {isCurrentActive ? (
                        <button
                          disabled
                          className="w-full py-1.5 rounded-xl bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30 flex items-center justify-center gap-1 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Stage</span>
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleApplyTheme(theme)}
                          className="w-full py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1"
                        >
                          <Palette className="w-3 h-3" />
                          <span>Apply</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setUnlockConfirmTheme(theme)}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
                              : 'bg-[#232332] text-amber-400 border border-amber-500/30 hover:bg-[#2c2c3e]'
                          }`}
                        >
                          <Gem className="w-3 h-3 fill-current" />
                          <span>{theme.priceDiamonds.toLocaleString()}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unlock Confirmation Modal */}
        <AnimatePresence>
          {unlockConfirmTheme && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-[#161622] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#28283C] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Gem className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Unlock Premium Theme</h4>
                      <p className="text-[10px] text-amber-300">Permanent Stage Customization</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUnlockConfirmTheme(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Theme Preview Banner */}
                <div className={`h-24 w-full rounded-2xl bg-gradient-to-b ${unlockConfirmTheme.gradientClass} p-3 border border-white/20 flex flex-col justify-between relative overflow-hidden shadow-inner`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                      {unlockConfirmTheme.name}
                    </span>
                    {unlockConfirmTheme.badge && (
                      <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded-md">
                        {unlockConfirmTheme.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-200 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                    {unlockConfirmTheme.description}
                  </p>
                </div>

                {/* Price & Balance Comparison */}
                <div className="bg-[#1C1C28] rounded-2xl p-3 border border-[#28283C] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Theme Unlock Price:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5 fill-amber-400" />
                      {unlockConfirmTheme.priceDiamonds.toLocaleString()} Diamonds
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Your Current Diamonds:</span>
                    <span className="font-semibold text-white">
                      {(currentUser.diamonds || 0).toLocaleString()} Diamonds
                    </span>
                  </div>
                  <div className="border-t border-[#28283C] pt-2 flex items-center justify-between font-bold">
                    <span className="text-slate-200">Balance After Unlock:</span>
                    <span
                      className={
                        (currentUser.diamonds || 0) >= unlockConfirmTheme.priceDiamonds
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {Math.max(0, (currentUser.diamonds || 0) - unlockConfirmTheme.priceDiamonds).toLocaleString()} Diamonds
                    </span>
                  </div>
                </div>

                {/* Insufficient Diamonds Warning */}
                {(currentUser.diamonds || 0) < unlockConfirmTheme.priceDiamonds ? (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start gap-2 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <span className="font-bold">Insufficient Diamonds!</span>
                      <p className="text-[11px] text-rose-300/90 mt-0.5">
                        You need {(unlockConfirmTheme.priceDiamonds - (currentUser.diamonds || 0)).toLocaleString()} more diamonds. Host streams and receive audience gifts to earn diamonds!
                      </p>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoApplyOnUnlock}
                      onChange={(e) => setAutoApplyOnUnlock(e.target.checked)}
                      className="rounded accent-violet-500"
                    />
                    <span>Apply to room stage immediately after unlocking</span>
                  </label>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setUnlockConfirmTheme(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[#232332] hover:bg-[#2c2c3e] text-slate-300 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUnlock}
                    disabled={(currentUser.diamonds || 0) < unlockConfirmTheme.priceDiamonds}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Gem className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Confirm Unlock</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80">
      <div className="w-full h-[85vh] sm:h-auto sm:max-h-[85vh] max-w-md bg-[#121217] sm:rounded-2xl border-t sm:border border-[#232332] shadow-2xl flex flex-col rounded-t-3xl overflow-hidden relative">
        
        {/* Toast Feedback */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold shadow-xl border flex items-center gap-2 ${
                feedbackToast.isError
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500'
                  : 'bg-emerald-950/90 text-emerald-200 border-emerald-500'
              }`}
            >
              <span>{feedbackToast.isError ? '✕' : '✓'}</span>
              <span>{feedbackToast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between p-4 border-b border-[#232332] bg-[#1A1A24]">
          <div className="flex items-center gap-3">
            {view !== 'main' && (
              <button onClick={() => setView('main')} className="p-1 rounded-full text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-bold text-white flex items-center gap-2">
              {view === 'main' && <><Settings className="w-5 h-5 text-violet-400" /> Room Settings</>}
              {view === 'moderators' && <><Shield className="w-5 h-5 text-emerald-400" /> Moderators</>}
              {view === 'banned' && <><Ban className="w-5 h-5 text-rose-400" /> Banned Users</>}
              {view === 'background' && <><Palette className="w-5 h-5 text-violet-400" /> Stage Themes & Backgrounds</>}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-[#232332] text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {view === 'main' && renderMainView()}
            {view === 'moderators' && renderModeratorsView()}
            {view === 'banned' && renderBannedView()}
            {view === 'background' && renderBackgroundView()}
          </motion.div>
        </AnimatePresence>
        
      </div>
    </div>
  );
};
