import React, { useState } from 'react';
import { Landmark, Check, X, ShieldAlert, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

export const AdminWithdrawalsTable: React.FC = () => {
  const { withdrawals, adminApproveWithdrawal, adminRejectWithdrawal } = useAppState();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedTxHash, setSelectedTxHash] = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const filtered = withdrawals.filter((w) => {
    if (filterStatus !== 'ALL' && w.status !== filterStatus) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    const txHash = selectedTxHash.trim() || `TX_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
    adminApproveWithdrawal(id, txHash);
    setActiveActionId(null);
    setSelectedTxHash('');
  };

  const handleReject = (id: string) => {
    adminRejectWithdrawal(id, 'Rejected due to invalid account details or verification mismatch.');
    setActiveActionId(null);
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Host Withdrawal & Payout Ledger</h2>
          <p className="text-xs text-slate-400">Review, audit and authorize real-world cash payouts for creator host diamond redemptions</p>
        </div>

        <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-2xl border border-[#232332] text-xs">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterStatus === st
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1A1A24] text-slate-400 uppercase font-bold border-b border-[#232332]">
              <tr>
                <th className="p-3.5">Host Recipient</th>
                <th className="p-3.5">Diamonds Burned</th>
                <th className="p-3.5">USD Cash Payout</th>
                <th className="p-3.5">Method & Account</th>
                <th className="p-3.5">Requested At</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Audit & Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232332]/60">
              {filtered.map((item) => {
                const hostName = item.hostName || item.userName || 'Creator Host';
                const hostId = item.hostId || item.userId || 'usr_unknown';
                const diamonds = item.diamondsAmount ?? item.amountDiamonds ?? 0;
                const cashUsd = item.cashAmountUsd ?? item.amountUsd ?? 0;
                const method = item.method || item.payoutMethod || 'bank_transfer';
                const reqDate = item.requestedAt || item.createdAt || new Date().toISOString();
                const statusUpper = (item.status || 'PENDING').toUpperCase();

                return (
                  <tr key={item.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{hostName}</p>
                      <p className="text-[10px] text-slate-400">Host ID: {hostId}</p>
                    </td>

                    <td className="p-3.5 font-bold text-violet-300">
                      {diamonds.toLocaleString()} 💎
                    </td>

                    <td className="p-3.5 font-black text-emerald-400 text-sm">
                      ${cashUsd.toFixed(2)} USD
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white capitalize">{method.replace('_', ' ')}</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">
                          {item.accountDetails?.accountName || 'Account'} • {item.accountDetails?.accountNumberOrEmail || item.accountDetails?.cryptoAddress || 'N/A'}
                        </p>
                        {item.accountDetails?.bankName && (
                          <p className="text-[10px] text-slate-500">Bank: {item.accountDetails.bankName}</p>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-400">
                      {new Date(reqDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          statusUpper === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : statusUpper === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {statusUpper}
                      </span>
                      {item.transactionHash && (
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[120px]">
                          {item.transactionHash}
                        </p>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      {statusUpper === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:brightness-110 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Authorize Payout</span>
                          </button>

                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-[11px] font-bold"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">Processed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
