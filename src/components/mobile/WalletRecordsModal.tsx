import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, History, ArrowUpRight, ArrowDownLeft, Coins, DollarSign, Filter, Gift } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface WalletRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletRecordsModal: React.FC<WalletRecordsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, transactions } = useAppState();
  const [filterType, setFilterType] = useState<'all' | 'recharges' | 'gifts_sent' | 'gifts_received' | 'payouts'>('all');

  if (!isOpen) return null;

  const userTransactions = transactions.filter(
    (t) => t.userId === currentUser.id || t.description.toLowerCase().includes(currentUser.displayName.toLowerCase())
  );

  const filtered = userTransactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'recharges') return t.type === 'COIN_PURCHASE';
    if (filterType === 'gifts_sent') return t.type === 'GIFT_SENT';
    if (filterType === 'gifts_received') return t.type === 'GIFT_RECEIVED';
    if (filterType === 'payouts') return t.type === 'DIAMOND_WITHDRAWAL';
    return true;
  });

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
            <div className="p-1.5 rounded-xl bg-violet-600/20 text-violet-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Wallet Statement & Records</h3>
              <p className="text-[10px] text-slate-400">Recharge history, gift receipts & cashouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-2.5 border-b border-[#232332] bg-[#0E0E14] overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl shrink-0 transition-colors ${
              filterType === 'all' ? 'bg-violet-600 text-white' : 'bg-[#1A1A24] text-slate-400 hover:text-slate-200'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setFilterType('recharges')}
            className={`px-3 py-1 rounded-xl shrink-0 transition-colors ${
              filterType === 'recharges' ? 'bg-amber-500 text-slate-950' : 'bg-[#1A1A24] text-slate-400 hover:text-slate-200'
            }`}
          >
            Recharges 🪙
          </button>
          <button
            onClick={() => setFilterType('gifts_sent')}
            className={`px-3 py-1 rounded-xl shrink-0 transition-colors ${
              filterType === 'gifts_sent' ? 'bg-pink-600 text-white' : 'bg-[#1A1A24] text-slate-400 hover:text-slate-200'
            }`}
          >
            Gifts Sent 🎁
          </button>
          <button
            onClick={() => setFilterType('gifts_received')}
            className={`px-3 py-1 rounded-xl shrink-0 transition-colors ${
              filterType === 'gifts_received' ? 'bg-cyan-600 text-white' : 'bg-[#1A1A24] text-slate-400 hover:text-slate-200'
            }`}
          >
            Diamonds Received 💎
          </button>
          <button
            onClick={() => setFilterType('payouts')}
            className={`px-3 py-1 rounded-xl shrink-0 transition-colors ${
              filterType === 'payouts' ? 'bg-emerald-600 text-white' : 'bg-[#1A1A24] text-slate-400 hover:text-slate-200'
            }`}
          >
            Payouts 💵
          </button>
        </div>

        {/* Transaction Items */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-40" />
              <p>No records found in this category</p>
            </div>
          ) : (
            filtered.map((t) => {
              const isPositive = t.type === 'COIN_PURCHASE' || t.type === 'GIFT_RECEIVED';

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{t.description}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.timestamp).toLocaleDateString()} • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-xs block ${
                        isPositive ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {isPositive ? '+' : '-'}
                      {t.amount.toLocaleString()} {t.currency === 'COINS' ? '🪙' : '💎'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#121217] text-slate-400 font-semibold border border-white/5 uppercase">
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
