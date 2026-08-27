import React, { useState } from 'react';
import { Share2, X, Search, Check, Send, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../../services/stateStore';
import { VoiceRoom, UserProfile } from '../../types';

interface ShareRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: VoiceRoom;
}

export const ShareRoomModal: React.FC<ShareRoomModalProps> = ({ isOpen, onClose, room }) => {
  const { currentUser, allUsers, sendDirectMessage } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !room) return null;

  const friends = allUsers.filter(u => u.id !== currentUser.id && (u.isFollowing || u.isFollowedBy));
  
  const filteredFriends = friends.filter(friend => 
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  };

  const handleShare = () => {
    if (selectedUserIds.size === 0) return;
    
    setIsSending(true);
    
    // Simulate slight delay for sharing
    setTimeout(() => {
      selectedUserIds.forEach(userId => {
        const inviteMessage = `Hi! Join my voice room: ${room.title} (Room ID: ${room.roomIdNumber})`;
        sendDirectMessage(userId, inviteMessage, 'text');
      });
      
      setIsSending(false);
      onClose();
      alert(`Shared room to ${selectedUserIds.size} friends!`);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full h-[85vh] sm:h-auto sm:max-h-[85vh] max-w-md bg-[#121217] sm:rounded-2xl border-t sm:border border-[#232332] shadow-2xl flex flex-col rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#232332] bg-[#1A1A24]">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-violet-400" />
              Share to Friends
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-[#232332] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-[#232332]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#1A1A24] border border-[#232332] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No friends found.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    onClick={() => toggleUserSelection(friend.id)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1A1A24] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#232332]"
                        />
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121217] rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{friend.displayName}</p>
                        <p className="text-xs text-slate-400">@{friend.username}</p>
                      </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selectedUserIds.has(friend.id) ? 'bg-violet-600 border-violet-500 text-white' : 'border-[#404050] text-transparent'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-[#232332] bg-[#1A1A24]">
            <button
              onClick={handleShare}
              disabled={selectedUserIds.size === 0 || isSending}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Share to {selectedUserIds.size > 0 ? `${selectedUserIds.size} ` : ''}Friends
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
