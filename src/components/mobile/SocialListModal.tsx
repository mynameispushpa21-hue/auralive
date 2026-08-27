import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Users, UserCheck, UserPlus, Eye, MessageSquare, Radio, Sparkles } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile } from '../../types';

export type SocialModalTab = 'following' | 'followers' | 'likes' | 'visitors';

interface SocialListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SocialModalTab;
  onOpenChat?: (userId: string) => void;
  onJoinRoom?: (roomId: string) => void;
}

export const SocialListModal: React.FC<SocialListModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'following',
  onOpenChat,
  onJoinRoom,
}) => {
  const { currentUser, allUsers, toggleFollowUser, rooms } = useAppState();
  const [activeTab, setActiveTab] = useState<SocialModalTab>(initialTab);

  if (!isOpen) return null;

  // Derive social data
  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);

  // Simulated following list (users that are marked as followed or first 3)
  const followingList = otherUsers.slice(0, Math.min(otherUsers.length, currentUser.followingCount || 3));
  // Followers list (other registered users)
  const followersList = otherUsers;

  // Visitors with simulated timestamps
  const visitorItems = [
    { user: otherUsers[0] || currentUser, time: '10 mins ago', action: 'Viewed profile & listened to acoustic song' },
    { user: otherUsers[1] || currentUser, time: '1 hour ago', action: 'Sent 3 hearts in DJ Party Stage' },
    { user: otherUsers[2] || currentUser, time: 'Yesterday', action: 'Checked VIP privileges' },
  ];

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
            {activeTab === 'following' && <Users className="w-5 h-5 text-violet-400" />}
            {activeTab === 'followers' && <UserCheck className="w-5 h-5 text-pink-400" />}
            {activeTab === 'likes' && <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />}
            {activeTab === 'visitors' && <Eye className="w-5 h-5 text-amber-400" />}
            <h3 className="font-extrabold text-sm text-white capitalize">
              {activeTab === 'following' && 'Following'}
              {activeTab === 'followers' && 'Followers'}
              {activeTab === 'likes' && 'Likes & Popularity'}
              {activeTab === 'visitors' && 'Recent Visitors'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 border-b border-[#232332] bg-[#0E0E14] text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('following')}
            className={`py-2.5 transition-all border-b-2 ${
              activeTab === 'following'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Following ({currentUser.followingCount})
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`py-2.5 transition-all border-b-2 ${
              activeTab === 'followers'
                ? 'border-pink-500 text-pink-300 bg-pink-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Followers ({currentUser.followersCount})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`py-2.5 transition-all border-b-2 ${
              activeTab === 'likes'
                ? 'border-rose-500 text-rose-300 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Likes ({currentUser.likesReceived || 1280})
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`py-2.5 transition-all border-b-2 ${
              activeTab === 'visitors'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Visitors ({currentUser.visitorsCount || 342})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 min-h-[260px] text-xs">
          {/* Following Tab */}
          {activeTab === 'following' && (
            <div className="space-y-2">
              {followingList.map((user) => {
                const userRoom = rooms.find((r) => r.hostId === user.id && r.status === 'active');

                return (
                  <div
                    key={user.id}
                    className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/50"
                        />
                        {userRoom && (
                          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-rose-600 text-[8px] font-black text-white animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white truncate">{user.displayName}</span>
                          <span className="text-[10px]">{user.countryFlag}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">ID: {user.numericId || user.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {userRoom && onJoinRoom && (
                        <button
                          onClick={() => {
                            onJoinRoom(userRoom.id);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <Radio className="w-3 h-3" />
                          <span>Room</span>
                        </button>
                      )}
                      <button
                        onClick={() => toggleFollowUser(user.id)}
                        className="px-2.5 py-1 rounded-xl bg-[#121217] hover:bg-[#232332] text-slate-300 text-[10px] font-bold border border-[#232332]"
                      >
                        Following
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === 'followers' && (
            <div className="space-y-2">
              {followersList.map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/50"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate">{user.displayName}</span>
                        <span className="text-[10px]">{user.countryFlag}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{user.bio || 'Fan of AuraVoice streams'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollowUser(user.id)}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 shadow-xs"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Follow Back</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Likes Tab */}
          {activeTab === 'likes' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/50 via-[#1A1A24] to-pink-950/40 border border-rose-500/30 text-center space-y-1">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-white">{(currentUser.likesReceived || 1280).toLocaleString()} Hearts</h4>
                <p className="text-[11px] text-slate-300">Total room applause and social popularity points received</p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Recent Likes</h5>
                {otherUsers.slice(0, 3).map((u, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.displayName} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-white block">{u.displayName}</span>
                        <span className="text-[10px] text-slate-400">Liked your stream & speech</span>
                      </div>
                    </div>
                    <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                      +{(i + 1) * 20} ❤️
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visitors Tab */}
          {activeTab === 'visitors' && (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-[11px]">
                <Eye className="w-4 h-4 shrink-0" />
                <span>{currentUser.visitorsCount || 342} users visited your profile this week</span>
              </div>

              {visitorItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatar}
                      alt={item.user.displayName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/40"
                    />
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{item.user.displayName}</span>
                      <p className="text-[10px] text-slate-400 truncate">{item.action}</p>
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-500 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
