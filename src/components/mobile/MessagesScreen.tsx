import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Mic,
  Gift,
  Sparkles,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Play,
  Volume2,
  Trash2,
  UserPlus,
  Smile,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile, Conversation } from '../../types';
import { audioEngine } from '../../services/audioEngine';

interface MessagesScreenProps {
  onOpenGiftModal: (user: UserProfile) => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ onOpenGiftModal }) => {
  const {
    conversations,
    directMessages,
    currentUser,
    allUsers,
    sendDirectMessage,
    startConversationWithUser,
    deleteConversation,
    markConversationAsRead,
  } = useAppState();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Identify active conversation
  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const activePartner = activeConversation?.participant || (activeConvId ? allUsers.find((u) => u.id === activeConvId) : null);
  const currentMessages = activeConvId ? directMessages[activeConvId] || [] : [];

  // Mark as read when entering conversation
  useEffect(() => {
    if (activeConvId) {
      markConversationAsRead(activeConvId);
    }
  }, [activeConvId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (activeConvId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConvId, currentMessages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !inputMessage.trim()) return;
    sendDirectMessage(activeConvId, inputMessage.trim(), 'text');
    setInputMessage('');
  };

  const handleSendVoiceNote = () => {
    if (!activeConvId) return;
    sendDirectMessage(activeConvId, '🎙️ Voice message (0:12s)', 'voice', 12);
  };

  const handlePlayVoice = (msgId: string) => {
    setPlayingVoiceId(msgId);
    audioEngine.playSoundEffect('magic');
    setTimeout(() => {
      setPlayingVoiceId(null);
    }, 2500);
  };

  const handleStartChatWith = (user: UserProfile) => {
    const conv = startConversationWithUser(user.id);
    setActiveConvId(conv.id);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.participant.displayName.toLowerCase().includes(q) ||
      c.participant.username.toLowerCase().includes(q) ||
      (c.lastMessage?.message && c.lastMessage.message.toLowerCase().includes(q))
    );
  });

  // Suggested contacts to chat with (excluding current user and existing conversation partners)
  const suggestedUsers = allUsers.filter(
    (u) => u.id !== currentUser.id && !conversations.some((c) => c.participant.id === u.id)
  );

  return (
    <div id="messages-screen" className="flex flex-col h-full text-slate-100 bg-transparent">
      {activeConversation && activePartner ? (
        /* ================================================================ */
        /* 1-ON-1 CHAT DETAIL VIEW                                          */
        /* ================================================================ */
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#232332] bg-[#121217]/95 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveConvId(null)}
                className="p-1.5 rounded-full bg-[#1A1A24] text-slate-400 hover:text-white transition-colors"
                title="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative">
                <img
                  src={activePartner.avatar}
                  alt={activePartner.displayName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/50"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#121217] absolute bottom-0 right-0 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-white">{activePartner.displayName}</h4>
                  {activePartner.isHost && (
                    <span className="px-1 py-0.2 rounded-xs bg-amber-500/20 text-amber-300 text-[8px] font-black border border-amber-500/30">
                      HOST
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online • ID: {activePartner.numericId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenGiftModal(activePartner)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-md shadow-violet-600/30 active:scale-95 transition-transform"
                title="Send virtual gift"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Gift</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                  className="p-1.5 rounded-xl bg-[#1A1A24] text-slate-400 hover:text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showOptionsDropdown && (
                  <div className="absolute right-0 mt-1 w-40 rounded-xl bg-[#1A1A24] border border-[#232332] shadow-xl p-1 z-50 text-xs">
                    <button
                      onClick={() => {
                        deleteConversation(activeConversation.id);
                        setActiveConvId(null);
                        setShowOptionsDropdown(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Chat</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
            {/* Conversation Start Timestamp Badge */}
            <div className="text-center my-2">
              <span className="px-2.5 py-1 rounded-full bg-[#121217] text-[10px] font-semibold text-slate-400 border border-[#232332]">
                Audio Session Encrypted • Direct Message
              </span>
            </div>

            {currentMessages.length === 0 && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#1A1A24] border border-[#232332] flex items-center justify-center mx-auto text-violet-400">
                  <Smile className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">No messages yet</p>
                <p className="text-[11px] text-slate-400">Say hello to {activePartner.displayName} to start chatting!</p>
              </div>
            )}

            {currentMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;

              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {/* Gift Bubble */}
                  {msg.type === 'gift' ? (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-amber-500/20 border border-violet-500/40 max-w-[80%] flex items-center gap-2.5 shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl shrink-0">
                        {msg.giftData?.giftIcon || '🎁'}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-white leading-tight">
                          {msg.message}
                        </p>
                        <p className="text-[10px] text-amber-300 font-semibold mt-0.5">
                          {msg.giftData?.coinPrice ? `${msg.giftData.coinPrice} Coins` : 'Virtual Gift'}
                        </p>
                      </div>
                    </div>
                  ) : msg.type === 'voice' ? (
                    /* Voice Note Bubble */
                    <div
                      onClick={() => handlePlayVoice(msg.id)}
                      className={`cursor-pointer px-3.5 py-2.5 rounded-2xl max-w-[75%] flex items-center gap-2.5 shadow-sm transition-all active:scale-95 ${
                        isMine
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-xs'
                          : 'bg-[#1A1A24] text-slate-100 rounded-bl-xs border border-[#232332]'
                      }`}
                    >
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0"
                      >
                        {playingVoiceId === msg.id ? (
                          <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 h-3">
                          <span className={`w-1 h-2 rounded-full ${playingVoiceId === msg.id ? 'bg-amber-300 animate-bounce' : 'bg-white/60'}`} />
                          <span className={`w-1 h-3 rounded-full ${playingVoiceId === msg.id ? 'bg-amber-300 animate-bounce delay-75' : 'bg-white/80'}`} />
                          <span className={`w-1 h-2 rounded-full ${playingVoiceId === msg.id ? 'bg-amber-300 animate-bounce delay-150' : 'bg-white/60'}`} />
                          <span className={`w-1 h-4 rounded-full ${playingVoiceId === msg.id ? 'bg-amber-300 animate-bounce delay-100' : 'bg-white'}`} />
                          <span className={`w-1 h-2.5 rounded-full ${playingVoiceId === msg.id ? 'bg-amber-300 animate-bounce delay-200' : 'bg-white/70'}`} />
                        </div>
                        <p className="text-[9px] opacity-80 mt-0.5 font-mono">
                          0:{msg.voiceDurationSec || 12}s • Voice Audio
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Standard Text Bubble */
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isMine
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-xs'
                          : 'bg-[#1A1A24] text-slate-100 rounded-bl-xs border border-[#232332]'
                      }`}
                    >
                      {msg.message}
                    </div>
                  )}

                  {/* Timestamp & Read Receipt */}
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 px-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && <CheckCheck className="w-3 h-3 text-violet-400" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#121217] border-t border-[#232332] flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="p-2.5 rounded-full bg-[#1A1A24] text-slate-300 hover:text-violet-400 border border-[#232332] transition-colors"
              title="Record voice note"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send message to host..."
              className="flex-1 px-4 py-2.5 rounded-full bg-[#1A1A24] border border-[#232332] text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-violet-500 transition-colors"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30 disabled:opacity-40 transition-opacity active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* ================================================================ */
        /* INBOX CONVERSATION LIST                                          */
        /* ================================================================ */
        <div className="px-4 py-3 space-y-4 overflow-y-auto no-scrollbar pb-24">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-display text-white">Direct Messages</h2>
              <p className="text-xs text-slate-400">Connect with creators, friends, and hosts</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Suggested Online Hosts / Quick Start Chat */}
          {suggestedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Active Hosts & Friends</span>
                <span className="text-[10px] text-violet-400">Tap to chat</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {suggestedUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartChatWith(user)}
                    className="flex flex-col items-center gap-1 shrink-0 group"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#232332] group-hover:ring-violet-500 transition-all"
                      />
                      <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B0B0F] absolute bottom-0 right-0" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white truncate w-14 text-center">
                      {user.displayName.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Conversations List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recent Conversations ({filteredConversations.length})
            </div>

            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center bg-[#121217] border border-[#232332] rounded-2xl space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-300">No conversations found</p>
                <p className="text-[10px] text-slate-500">Tap an active host above to start a conversation!</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className="p-3 rounded-2xl bg-[#121217] border border-[#232332] hover:border-violet-500/40 cursor-pointer transition-all flex items-center justify-between active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={conv.participant.avatar}
                        alt={conv.participant.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-1 ring-violet-500/30"
                      />
                      <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#121217] absolute bottom-0 right-0" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">{conv.participant.displayName}</h4>
                        {conv.participant.isHost && (
                          <span className="px-1 py-0.2 rounded-xs bg-amber-500/20 text-amber-300 text-[8px] font-black">
                            HOST
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {conv.lastMessage?.message || 'Tap to chat'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400">
                      {conv.lastMessage?.createdAt
                        ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Now'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="block mt-1 px-2 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-black text-center shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
