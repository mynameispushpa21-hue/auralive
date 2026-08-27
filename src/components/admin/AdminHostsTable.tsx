import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Percent, Mic, Clock, Star, ShieldCheck } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

export const AdminHostsTable: React.FC = () => {
  const {
    hostApplications,
    allUsers,
    adminApproveHostApplication,
    adminRejectHostApplication,
    adminUpdateHostCommission,
    adminUpdateUserProfile,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'applications' | 'active_hosts'>('applications');
  const [commissionInputs, setCommissionInputs] = useState<Record<string, number>>({});

  const activeHosts = allUsers.filter((u) => u.isHost && (u.hostStatus === 'approved' || u.hostStatus === 'suspended'));

  const handleCommissionChange = (userId: string, ratePct: number) => {
    adminUpdateHostCommission(userId, ratePct / 100);
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Host Operations & Commission Management</h2>
          <p className="text-xs text-slate-400">Review creator talent applications and configure revenue commission shares</p>
        </div>

        <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-2xl border border-[#232332] text-xs">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'applications'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Applications ({hostApplications.filter((a) => a.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('active_hosts')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'active_hosts'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Creator Hosts ({activeHosts.length})
          </button>
        </div>
      </div>

      {activeTab === 'applications' ? (
        /* Applications Review List */
        <div className="space-y-3">
          {hostApplications.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#121217] border border-[#232332] text-center text-xs text-slate-400">
              No host applications on file.
            </div>
          ) : (
            hostApplications.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">{app.fullName}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#1A1A24] text-slate-300 text-[10px] font-bold">
                      {app.country}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-slate-300">
                    <strong className="text-slate-400">Languages:</strong> {app.language} •{' '}
                    <strong className="text-slate-400">Phone:</strong> {app.phone}
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-slate-400">Experience:</strong> {app.experience}
                  </p>
                  <p className="text-slate-300 italic bg-[#1A1A24] p-2.5 rounded-xl border border-[#232332]">
                    "{app.introduction}"
                  </p>
                </div>

                {app.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => adminApproveHostApplication(app.id, 0.7)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:brightness-110 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve (70% Split)</span>
                    </button>

                    <button
                      onClick={() => adminRejectHostApplication(app.id, 'Does not meet minimum requirements.')}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-bold flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Active Hosts List with Commission Adjusters */
        <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1A1A24] text-slate-400 uppercase font-bold border-b border-[#232332]">
                <tr>
                  <th className="p-3.5">Host Profile</th>
                  <th className="p-3.5">Contact Info</th>
                  <th className="p-3.5">Host Level</th>
                  <th className="p-3.5">Commission Split</th>
                  <th className="p-3.5">Balances</th>
                  <th className="p-3.5">Host Earnings (Est.)</th>
                  <th className="p-3.5">Status & Actions</th>
                  <th className="p-3.5 text-right">Commission Rate Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232332]/60">
                {activeHosts.map((host) => {
                  const currentRatePct = Math.round((host.hostCommissionRate || 0.7) * 100);

                  return (
                    <tr key={host.id} className="hover:bg-[#1A1A24]/50">
                      <td className="p-3.5 flex items-center gap-3">
                        <img src={host.avatar} alt={host.displayName} className="w-9 h-9 rounded-full object-cover ring-1 ring-violet-500" />
                        <div>
                          <p className="font-bold text-white flex items-center gap-1">
                            <span>{host.displayName}</span>
                            <span>{host.countryFlag}</span>
                          </p>
                          <span className="text-[10px] text-slate-400">ID: {host.numericId}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col text-[10px] text-slate-300">
                          <span>{host.email || 'No email provided'}</span>
                          <span className="text-slate-400">{host.phone || 'No phone provided'}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                            Lv.{host.hostLevel || 4}
                          </span>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => adminUpdateUserProfile(host.id, { hostLevel: (host.hostLevel || 4) + 1 })} className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 bg-[#1A1A24] rounded border border-[#232332]">+</button>
                            <button onClick={() => adminUpdateUserProfile(host.id, { hostLevel: Math.max(1, (host.hostLevel || 4) - 1) })} className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 bg-[#1A1A24] rounded border border-[#232332]">-</button>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-emerald-400 text-sm">
                        {currentRatePct}% Creator Share
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-violet-300 text-xs">{host.diamonds?.toLocaleString()} 💎</span>
                          <span className="font-bold text-amber-400 text-[10px]">{host.coins?.toLocaleString()} 🪙</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 text-[10px] text-slate-300">
                          <span>Total: <strong className="text-white">{(host.diamonds * 1.5).toLocaleString()} 💎</strong></span>
                          <span>Today: <strong className="text-white">{(host.diamonds * 0.1).toLocaleString()} 💎</strong></span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {host.hostStatus === 'suspended' ? (
                          <button onClick={() => adminUpdateUserProfile(host.id, { hostStatus: 'approved' })} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold rounded-lg hover:bg-emerald-500/30 transition">
                            Reactivate
                          </button>
                        ) : (
                          <button onClick={() => adminUpdateUserProfile(host.id, { hostStatus: 'suspended' })} className="px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold rounded-lg hover:bg-rose-500/30 transition">
                            Suspend
                          </button>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {[60, 70, 75, 80, 85].map((pct) => (
                            <button
                              key={pct}
                              onClick={() => handleCommissionChange(host.id, pct)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                currentRatePct === pct
                                  ? 'bg-violet-600 text-white border-violet-500'
                                  : 'bg-[#1A1A24] text-slate-400 border-[#232332] hover:text-white'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
