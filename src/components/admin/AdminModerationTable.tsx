import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Ban, VolumeX, Radio, Check, X } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

export const AdminModerationTable: React.FC = () => {
  const { allUsers, rooms, adminBanUser, adminMuteUser, adminCloseRoom } = useAppState();

  const [auditLogs, setAuditLogs] = useState([
    { id: 'log_1', type: 'REPORT_ROOM', target: 'Lofi Chill Vibes & Late Night Chat', reporter: 'alex_99', reason: 'Suspected copyright music broadcast', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'REVIEWED' },
    { id: 'log_2', type: 'SPAM_CHAT', target: 'CryptoBot_88', reporter: 'System AI Guard', reason: 'Unsolicited promotional URL spam', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'ACTION_TAKEN' },
    { id: 'log_3', type: 'VOICE_HARASSMENT', target: 'Troll_User_21', reporter: 'Maya Singer', reason: 'Disruptive mic shouting on seat 4', timestamp: new Date(Date.now() - 14400000).toISOString(), status: 'PENDING' },
  ]);

  return (
    <div className="space-y-4 text-slate-100">
      <div>
        <h2 className="text-xl font-bold font-display text-white">Trust, Safety & Moderation Center</h2>
        <p className="text-xs text-slate-400">Automated AI content filters, user harassment reports, and rapid room intervention</p>
      </div>

      {/* Safety Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Automated Audio Filter</h4>
            <p className="text-[11px] text-emerald-400 font-semibold">Active • 99.8% Safety Index</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Pending User Reports</h4>
            <p className="text-[11px] text-amber-300 font-semibold">1 report awaiting audit</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Active Sanctions</h4>
            <p className="text-[11px] text-rose-300 font-semibold">2 accounts muted/banned</p>
          </div>
        </div>
      </div>

      {/* Report Incidents Table */}
      <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#232332] flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">Incident Reports Audit Trail</h3>
          <span className="text-xs text-slate-400 font-mono">3 Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1A1A24] text-slate-400 uppercase font-bold border-b border-[#232332]">
              <tr>
                <th className="p-3.5">Incident Type</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Reported By</th>
                <th className="p-3.5">Violation Reason</th>
                <th className="p-3.5">Logged At</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232332]/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1A1A24]/50">
                  <td className="p-3.5">
                    <span className="font-bold text-rose-400 uppercase text-[10px]">{log.type.replace('_', ' ')}</span>
                  </td>
                  <td className="p-3.5 font-bold text-white">{log.target}</td>
                  <td className="p-3.5 text-slate-400">{log.reporter}</td>
                  <td className="p-3.5 text-slate-300">{log.reason}</td>
                  <td className="p-3.5 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.status === 'ACTION_TAKEN'
                          ? 'bg-rose-500/20 text-rose-300'
                          : log.status === 'REVIEWED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
