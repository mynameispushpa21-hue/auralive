import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, DollarSign, ArrowUpRight, ArrowDownLeft, ShieldCheck, History, Plus, Landmark, ChevronLeft, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { SellerBadge } from '../reseller/SellerBadge';

interface WalletScreenProps {
  onOpenCoinStore: () => void;
  onOpenWithdrawal: () => void;
  onOpenSellerDashboard?: () => void;
  onOpenBuyCoinsFromSeller?: () => void;
  onBack?: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  onOpenCoinStore,
  onOpenWithdrawal,
  onOpenSellerDashboard,
  onOpenBuyCoinsFromSeller,
  onBack,
}) => {
  const { currentUser, transactions, platformConfig } = useAppState();
  const [filterType, setFilterType] = useState<string>('all');

  const diamondCashValue = currentUser.diamonds * platformConfig.diamondCashValueUsd;

  const userTransactions = transactions.filter((t) => t.userId === currentUser.id);

  const filteredTransactions = userTransactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'coins') return t.currency === 'COINS';
    if (filterType === 'diamonds') return t.currency === 'DIAMONDS';
    return true;
  });

  return (
    <div id="wallet-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-transparent">
      <div className="mt-2 flex items-center gap-2.5">
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
          <h2 className="text-xl font-bold font-display text-white">My Multi-Currency Wallet</h2>
          <p className="text-xs text-slate-400">Manage your purchased Coins & Host Diamond Earnings</p>
        </div>
      </div>

      {/* Dual Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* User Coins Card */}
        <div className="p-4 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">User Balance</p>
                <span className="text-[10px] text-slate-400">Virtual Gift Coins</span>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">Purchased</span>
          </div>

          <div className="my-2">
            <h3 className="text-2xl font-black text-white font-display tracking-tight">
              {currentUser.coins.toLocaleString()} <span className="text-sm font-bold text-amber-400">COINS</span>
            </h3>
          </div>

          <button
            onClick={onOpenCoinStore}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Recharge Coins</span>
          </button>
        </div>

        {/* Host Diamonds Card */}
        <div className="p-4 rounded-3xl bg-[#121217] border border-violet-500/30 shadow-xl flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div>
                <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">Host Earnings</p>
                <span className="text-[10px] text-slate-400">Converted Diamonds</span>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold">
              ${diamondCashValue.toFixed(2)} USD
            </span>
          </div>

          <div className="my-2">
            <h3 className="text-2xl font-black text-white font-display tracking-tight">
              {currentUser.diamonds.toLocaleString()} <span className="text-sm font-bold text-violet-300">DIAMONDS</span>
            </h3>
          </div>

          <button
            onClick={onOpenWithdrawal}
            disabled={currentUser.diamonds < platformConfig.minimumWithdrawalDiamonds}
            className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              currentUser.diamonds >= platformConfig.minimumWithdrawalDiamonds
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 shadow-md shadow-violet-600/20 active:scale-98'
                : 'bg-[#1A1A24] text-slate-500 border border-[#232332] cursor-not-allowed'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Withdraw Cash Payout</span>
          </button>
        </div>
      </div>

      {/* Financial Conversion Rates Explainer */}
      <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Exchange Rate: 100 Diamonds = $1.00 USD</span>
        </div>
        <span className="text-[10px] text-slate-400">Min: {platformConfig.minimumWithdrawalDiamonds.toLocaleString()} 💎</span>
      </div>

      {/* Reseller & Agency Gateway Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#1A1A26] to-violet-950/30 border border-amber-500/40 shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white">Authorized Coin Reseller System</h4>
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-500 text-slate-950">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[10px] text-amber-200/80">Get up to 20% discounts or become an authorized distributor</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              if (onOpenBuyCoinsFromSeller) {
                onOpenBuyCoinsFromSeller();
              } else {
                onOpenCoinStore();
              }
            }}
            className="py-2 px-3 rounded-xl bg-[#121217] hover:bg-[#1A1A24] border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>⚡</span>
            <span>Buy from Seller (-20%)</span>
          </button>

          <button
            onClick={onOpenSellerDashboard}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
          >
            <span>👑</span>
            <span>{currentUser.role === 'seller' || currentUser.role === 'agent' ? 'Seller Portal' : 'Agent Hub'}</span>
          </button>
        </div>
      </div>

      {/* Transaction Ledger Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <History className="w-4 h-4 text-violet-400" /> Transaction Ledger
          </h3>

          <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-xl border border-[#232332] text-xs">
            {['all', 'coins', 'diamonds'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-2 py-0.5 rounded-lg font-bold capitalize transition-all ${
                  filterType === tab ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#121217] border border-[#232332] text-center text-xs text-slate-400">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.direction === 'CREDIT';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isCredit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="font-bold text-white line-clamp-1">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} • Status: <span className="text-emerald-400 font-bold">{tx.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-black text-sm ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {tx.amount.toLocaleString()}{' '}
                      <span className="text-xs">{tx.currency === 'COINS' ? '🪙' : '💎'}</span>
                    </span>
                    <p className="text-[10px] text-slate-500">Bal: {tx.balanceAfter.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
