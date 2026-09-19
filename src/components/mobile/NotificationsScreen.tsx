import React from 'react';
import { Bell, Sparkles, Gift, Heart, Radio, Shield, CheckCheck, ChevronLeft } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface NotificationsScreenProps {
  onBack?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { notifications, markAllNotificationsAsRead } = useAppState();

  const getIcon = (type: string) => {
    switch (type) {
      case 'GIFT_RECEIVED':
        return <Gift className="w-4 h-4 text-amber-400" />;
      case 'FOLLOW':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'ROOM_INVITE':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'SYSTEM':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div id="notifications-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-transparent">
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-2xl bg-[#1A1A24] border border-[#232332] text-slate-300 hover:text-white transition-colors"
              title="Go Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold font-display text-white">Notifications</h2>
            <p className="text-xs text-slate-400">Activity updates, gift alerts & announcements</p>
          </div>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs text-violet-400 hover:underline flex items-center gap-1 font-bold"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
              notif.isRead
                ? 'bg-[#121217]/60 border-[#232332] text-slate-400'
                : 'bg-[#121217] border-violet-500/30 text-slate-200 shadow-sm'
            }`}
          >
            <div className="p-2 rounded-xl bg-[#1A1A24] shrink-0 mt-0.5">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                  {notif.title}
                </h4>
                <span className="text-[10px] text-slate-500">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-300">{notif.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
