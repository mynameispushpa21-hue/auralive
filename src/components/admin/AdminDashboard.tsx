import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  Coins,
  Radio,
  Users,
  ShieldAlert,
  Landmark,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Eye,
  Trash2,
  MicOff,
  CheckCircle,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const {
    adminStats,
    rooms,
    withdrawals,
    hostApplications,
    adminCloseRoom,
    adminApproveWithdrawal,
    allUsers,
  } = useAppState();

  const pendingWithdrawals = withdrawals.filter((w) => (w.status || '').toUpperCase() === 'PENDING');
  const pendingApps = hostApplications.filter((a) => (a.status || '').toUpperCase() === 'PENDING');

  const stats = adminStats || {
    totalRevenueUsd: 48920.50,
    totalCoinsCirculating: 1450000,
    totalDiamondsMinted: 890000,
    totalConcurrentUsers: 128,
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Welcome & Health Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AuraVoice Production Cluster Online</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white mt-1">Platform Operations Control</h2>
          <p className="text-xs text-slate-400">Real-time room telemetry, financial ledger audits & host moderation</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('store')}
            className="px-3.5 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-xs font-bold text-violet-300 flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Store Assets</span>
          </button>

          <button
            onClick={() => onNavigateTab('gateways')}
            className="px-3.5 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-xs font-bold text-violet-300 flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Gateways</span>
          </button>

          <button
            onClick={() => onNavigateTab('withdrawals')}
            className="px-3.5 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <Landmark className="w-4 h-4" />
            <span>{pendingWithdrawals.length} Pending Payouts</span>
          </button>

          <button
            onClick={() => onNavigateTab('hosts')}
            className="px-3.5 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-xs font-bold text-violet-300 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>{pendingApps.length} Host Applications</span>
          </button>
        </div>
      </div>

      {/* KPI STATS CARDS (4 Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-[#121217] to-[#0B0B0F] border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gross Coin Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-display mt-2">
            ${stats.totalRevenueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-emerald-400/90 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% this week
          </p>
        </div>

        {/* Coins Circulating */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-[#121217] to-[#0B0B0F] border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Coins Circulated</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-display mt-2">
            {stats.totalCoinsCirculating.toLocaleString()}
          </h3>
          <p className="text-[11px] text-amber-400/90 font-semibold mt-1">Virtual in-app balances</p>
        </div>

        {/* Host Diamonds Minted */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-500/15 via-[#121217] to-[#0B0B0F] border border-violet-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Host Diamonds Minted</span>
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-display mt-2">
            {stats.totalDiamondsMinted.toLocaleString()} 💎
          </h3>
          <p className="text-[11px] text-violet-400/90 font-semibold mt-1">Host creator earnings pool</p>
        </div>

        {/* Active Live Rooms */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-fuchsia-500/15 via-[#121217] to-[#0B0B0F] border border-fuchsia-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">Active Audio Stages</span>
            <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-display mt-2">
            {rooms.length} Live <span className="text-xs text-fuchsia-300 font-normal">({stats.totalConcurrentUsers.toLocaleString()} online)</span>
          </h3>
          <p className="text-[11px] text-fuchsia-400/90 font-semibold mt-1">Global RTC channels active</p>
        </div>
      </div>

      {/* LIVE ROOM MONITORING & TERMINATION GRID */}
      <div className="p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" /> Live Room Surveillance
            </h3>
            <p className="text-xs text-slate-400">Real-time inspection of active voice stages & instant moderator termination</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1A1A24] text-slate-300 border border-[#232332]">
            {rooms.length} Stages Broadcasted
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const occupiedSeats = room.seats.filter((s) => s.userId).length;

            return (
              <div
                key={room.id}
                className="p-4 rounded-2xl bg-[#1A1A24] border border-[#232332] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img src={room.coverUrl} alt={room.title} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{room.title}</h4>
                      <p className="text-[10px] text-slate-400">Host: <strong className="text-violet-300">{room.host.displayName}</strong></p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-[#121217] text-violet-400 text-[10px] font-bold border border-violet-500/30 shrink-0">
                    {room.category}
                  </span>
                </div>

                {/* Seat Status Mini Map */}
                <div className="p-2 rounded-xl bg-[#121217] border border-[#232332] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{room.audienceCount} Viewers</span>
                  </div>
                  <span className="text-[11px] font-bold text-violet-300">
                    {occupiedSeats}/{room.seatCount} Mics Active
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#232332]">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {room.roomIdNumber}</span>
                  <button
                    onClick={() => adminCloseRoom(room.id)}
                    className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Terminate Room</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDING ACTIONS ROW: Host Approvals & Payout Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payouts */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" /> Pending Diamond Cash Payouts
            </h3>
            <button onClick={() => onNavigateTab('withdrawals')} className="text-xs text-violet-400 hover:underline">
              View All
            </button>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No pending withdrawals.</p>
          ) : (
            <div className="space-y-2">
              {pendingWithdrawals.slice(0, 3).map((w) => {
                const hostName = w.hostName || w.userName || 'Creator Host';
                const diamonds = w.diamondsAmount ?? w.amountDiamonds ?? 0;
                const cashUsd = w.cashAmountUsd ?? w.amountUsd ?? 0;
                const method = w.method || w.payoutMethod || 'bank_transfer';
                const account = w.accountDetails?.accountNumberOrEmail || w.accountDetails?.cryptoAddress || 'N/A';

                return (
                  <div
                    key={w.id}
                    className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{hostName}</p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {method.replace('_', ' ')} • {account}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 text-sm">${cashUsd.toFixed(2)}</span>
                        <p className="text-[10px] text-slate-400">{diamonds.toLocaleString()} 💎</p>
                      </div>
                      <button
                        onClick={() => adminApproveWithdrawal(w.id, 'TX_AUTO_' + Math.random().toString(36).substring(7).toUpperCase())}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:brightness-110 text-xs"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Host Applications */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" /> Creator Host Applications
            </h3>
            <button onClick={() => onNavigateTab('hosts')} className="text-xs text-violet-400 hover:underline">
              View All
            </button>
          </div>

          {pendingApps.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No pending host applications.</p>
          ) : (
            <div className="space-y-2">
              {pendingApps.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{app.fullName}</p>
                    <p className="text-[10px] text-slate-400">{app.country} • {app.language}</p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('hosts')}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold hover:brightness-110 text-xs"
                  >
                    Review Application
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
