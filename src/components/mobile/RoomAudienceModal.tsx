import React from 'react';
import { Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../../services/stateStore';

interface RoomAudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoomAudienceModal: React.FC<RoomAudienceModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser } = useAppState();

  if (!isOpen) return null;

  // Simulate online audience using available users
  const audience = allUsers.filter(u => u.isOnline && u.id !== currentUser.id).slice(0, 20);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full h-[70vh] sm:h-auto sm:max-h-[70vh] max-w-md bg-[#121217] sm:rounded-2xl border-t sm:border border-[#232332] shadow-2xl flex flex-col rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#232332] bg-[#1A1A24]">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Online Audience
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-[#232332] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {audience.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No audience found.</p>
              </div>
            ) : (
              audience.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1A1A24] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121217] rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.displayName}</p>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
