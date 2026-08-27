import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Mic,
  Gift,
  Landmark,
  ShieldAlert,
  Sliders,
  Radio,
  ExternalLink,
  Coins,
  ChevronRight,
  Database,
  Code,
  Building2,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminHostsTable } from './AdminHostsTable';
import { AdminGiftsWrapper } from './AdminGiftsWrapper';
import { AdminSellersTable } from './AdminSellersTable';
import { AdminHostAgenciesTable } from './AdminHostAgenciesTable';
import { AdminWithdrawalsTable } from './AdminWithdrawalsTable';
import { AdminModerationTable } from './AdminModerationTable';
import { AdminSystemConfig } from './AdminSystemConfig';
import { useAppState } from '../../services/stateStore';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'hosts'
  | 'gifts'
  | 'sellers'
  | 'host_agencies'
  | 'withdrawals'
  | 'moderation'
  | 'config'
  | 'architecture';

interface AdminContainerProps {
  onSwitchToMobile: () => void;
}

export const AdminContainer: React.FC<AdminContainerProps> = ({ onSwitchToMobile }) => {
  const { withdrawals, hostApplications } = useAppState();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const pendingHostsCount = hostApplications.filter((a) => a.status === 'PENDING').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Telemetry', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'User Directory & Roles', icon: <Users className="w-4 h-4" /> },
    {
      id: 'hosts',
      label: 'Host Talent & Splits',
      icon: <Mic className="w-4 h-4" />,
      badge: pendingHostsCount > 0 ? pendingHostsCount : undefined,
    },
    { id: 'gifts', label: 'Virtual Gifts Catalog', icon: <Gift className="w-4 h-4" /> },
    { id: 'sellers', label: 'Coin Resellers', icon: <Coins className="w-4 h-4" /> },
    { id: 'host_agencies', label: 'Host Agencies', icon: <Building2 className="w-4 h-4" /> },
    {
      id: 'withdrawals',
      label: 'Cash Payout Ledger',
      icon: <Landmark className="w-4 h-4" />,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined,
    },
    { id: 'moderation', label: 'Safety & Moderation', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'config', label: 'System & Financial Rules', icon: <Sliders className="w-4 h-4" /> },
    { id: 'architecture', label: 'Backend & SQL Schema', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div id="admin-portal-wrapper" className="w-full bg-[#0B0B0F] text-slate-100 flex flex-col md:flex-row font-sans md:h-screen md:overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#121217] border-b md:border-r border-[#232332] flex flex-col shrink-0">
        <div className="p-4 space-y-4 md:space-y-6 flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-0 md:pb-4 md:border-b border-[#232332]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                A
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white font-display">AuraVoice Admin</h1>
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">Web Operations Console</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as AdminTab)}
                  className={`shrink-0 md:w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300 border border-violet-500/40 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1A24]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="ml-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Bottom Switcher to Mobile App */}
          <div className="hidden md:block pt-4 border-t border-[#232332] space-y-2 mt-auto">
            <button
              onClick={onSwitchToMobile}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Launch Live Mobile Client</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">Version 1.0.0-PROD • AuraVoice</p>
          </div>
        </div>
      </aside>

      {/* MOBILE SWITCHER - only shown on mobile below header */}
      <div className="md:hidden p-3 border-b border-[#232332] bg-[#121217]">
        <button
          onClick={onSwitchToMobile}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
        >
          <Radio className="w-4 h-4" />
          <span>Launch Live Mobile Client</span>
        </button>
      </div>

      {/* MAIN ADMIN CONTENT VIEWPORT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {currentTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setCurrentTab(tab as AdminTab)} />}
        {currentTab === 'users' && <AdminUsersTable />}
        {currentTab === 'hosts' && <AdminHostsTable />}
        {currentTab === 'gifts' && <AdminGiftsWrapper />}
        {currentTab === 'sellers' && <AdminSellersTable />}
        {currentTab === 'host_agencies' && <AdminHostAgenciesTable />}
        {currentTab === 'withdrawals' && <AdminWithdrawalsTable />}
        {currentTab === 'moderation' && <AdminModerationTable />}
        {currentTab === 'config' && <AdminSystemConfig />}
        {currentTab === 'architecture' && <ArchitectureViewer onSwitchToMobile={onSwitchToMobile} />}
      </main>
    </div>
  );
};

/* Architecture & SQL Database Documentation Viewer */
const ArchitectureViewer: React.FC<{ onSwitchToMobile: () => void }> = () => {
  return (
    <div className="space-y-6 text-slate-100 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold font-display text-white">System Architecture & Production Schema</h2>
        <p className="text-xs text-slate-400">Complete architectural map and MySQL relational schema documentation</p>
      </div>

      <div className="p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl space-y-4 text-xs">
        <h3 className="font-bold text-sm text-violet-400 flex items-center gap-2">
          <Database className="w-4 h-4" /> Relational Database Tables Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { table: 'users', desc: 'User profiles, auth credentials, roles, VIP tiers, level XP' },
            { table: 'wallets', desc: 'Double-entry coin & diamond balances with row-level locks' },
            { table: 'rooms', desc: 'Audio/video stages, categories, RTC tokens, audience counts' },
            { table: 'room_seats', desc: 'Mic seat occupancy, speak state, mute & lock states' },
            { table: 'gifts', desc: 'Virtual gifts catalog, animation metadata, VIP locks' },
            { table: 'transactions', desc: 'Immutable double-entry transaction ledger with audit trails' },
            { table: 'hosts', desc: 'Host verification, tier ratings, commission percentages' },
            { table: 'withdrawals', desc: 'Cash payout redemptions, payment gateway tracking' },
            { table: 'vip_subscriptions', desc: 'Active VIP tiers, renewal dates, privilege flags' },
            { table: 'moderation_logs', desc: 'Incident flags, muted users, banned IP records' },
          ].map((t) => (
            <div key={t.table} className="p-3 rounded-2xl bg-[#1A1A24] border border-[#232332]">
              <h4 className="font-mono font-bold text-violet-300 text-xs">{t.table}</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#232332]">
          <h4 className="font-bold text-white mb-1">Architecture Implementation Highlights:</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
            <li><strong>RTC Audio Engine:</strong> Provider-agnostic abstraction with Web Audio synthesizer fallback for real-time sound effects and mic capture.</li>
            <li><strong>Financial Accounting:</strong> Server-authoritative calculations for gift purchases, host diamond splits, and payout disbursements.</li>
            <li><strong>Real-time Synchronized State:</strong> Reactive state provider with live chat, combo gift animations, dynamic mic seats, and full admin control.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
