import React, { useState } from 'react';
import { Settings, Shield, X, Image as ImageIcon, Users, Ban, Power, ArrowLeft, Plus, Check } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { VoiceRoom } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface RoomSettingsModalProps {
  room: VoiceRoom;
  onClose: () => void;
}

const ROOM_BACKGROUNDS = [
  'from-purple-950 via-slate-900 to-indigo-950',
  'from-slate-950 via-slate-900 to-slate-950',
  'from-blue-950 via-slate-900 to-emerald-950',
  'from-rose-950 via-slate-900 to-orange-950',
];

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({ room, onClose }) => {
  const { currentUser, allUsers, adminCloseRoom, hostUpdateRoom, hostAssignModerator, hostRemoveModerator, hostUnbanUser } = useAppState();
  const isHost = room.hostId === currentUser.id;

  const [title, setTitle] = useState(room.title);
  const [announcement, setAnnouncement] = useState(room.announcement);
  const [view, setView] = useState<'main' | 'moderators' | 'banned' | 'background'>('main');

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
              className="w-full py-2 bg-[#1A1A24] border border-[#232332] rounded-xl text-sm font-bold text-white hover:bg-[#232332] transition-colors flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-violet-400" />
              Change Room Background
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

  const renderBackgroundView = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {ROOM_BACKGROUNDS.map((bg, idx) => (
          <div 
            key={idx}
            onClick={() => hostUpdateRoom(room.id, { backgroundTheme: bg })}
            className={`cursor-pointer rounded-xl h-24 border-2 flex items-center justify-center relative overflow-hidden ${room.backgroundTheme === bg ? 'border-violet-500' : 'border-transparent'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${bg}`} />
            {room.backgroundTheme === bg && (
              <div className="relative z-10 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center shadow-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80">
      <div className="w-full h-[85vh] sm:h-auto sm:max-h-[85vh] max-w-md bg-[#121217] sm:rounded-2xl border-t sm:border border-[#232332] shadow-2xl flex flex-col rounded-t-3xl overflow-hidden">
        
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
              {view === 'background' && <><ImageIcon className="w-5 h-5 text-violet-400" /> Backgrounds</>}
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
