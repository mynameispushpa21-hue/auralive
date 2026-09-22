import React, { useState } from 'react';
import {
  Menu,
  X,
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
  CreditCard,
  Gamepad2,
  ShoppingBag,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminHostsTable } from './AdminHostsTable';
import { AdminGiftsWrapper } from './AdminGiftsWrapper';
import { AdminStoreItemsTable } from './AdminStoreItemsTable';
import { AdminGamesTable } from './AdminGamesTable';
import { AdminSellersTable } from './AdminSellersTable';
import { AdminHostAgenciesTable } from './AdminHostAgenciesTable';
import { AdminWithdrawalsTable } from './AdminWithdrawalsTable';
import { AdminModerationTable } from './AdminModerationTable';
import { AdminSystemConfig } from './AdminSystemConfig';
import { AdminPaymentGateways } from './AdminPaymentGateways';
import { useAppState } from '../../services/stateStore';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'hosts'
  | 'gifts'
  | 'store'
  | 'games'
  | 'sellers'
  | 'host_agencies'
  | 'gateways'
  | 'withdrawals'
  | 'moderation'
  | 'config'
  | 'architecture';

interface AdminContainerProps {
  onSwitchToMobile: () => void;
}

export const AdminContainer: React.FC<AdminContainerProps> = ({ onSwitchToMobile }) => {
  const { withdrawals, hostApplications, agencyApplications } = useAppState();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Admin authentication state: check sessionStorage or require password
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('auravoice_admin_authenticated') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'Admin@786') {
      sessionStorage.setItem('auravoice_admin_authenticated', 'true');
      setIsAdminUnlocked(true);
      setPasswordError(null);
      setAdminPasswordInput('');
    } else {
      setPasswordError('Access Denied: Incorrect administrator password.');
    }
  };

  const handleLockAdmin = () => {
    sessionStorage.removeItem('auravoice_admin_authenticated');
    setIsAdminUnlocked(false);
    setAdminPasswordInput('');
    setPasswordError(null);
  };

  const handleExitToMobile = () => {
    handleLockAdmin();
    onSwitchToMobile();
  };

  // If admin panel is locked, render the password challenge screen
  if (!isAdminUnlocked) {
    return (
      <div id="admin-lock-screen" className="w-full min-h-[600px] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121217] border border-[#232332] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Security Header Badge */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 p-0.5 shadow-lg shadow-violet-600/25">
              <div className="w-full h-full bg-[#121217] rounded-[14px] flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-2">
              <KeyRound className="w-3 h-3" />
              <span>Admin Access Restricted</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Admin Panel Locked</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Regular users cannot view this panel. Administrator authorization and password are required to unlock.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 px-0.5">Admin Password</label>
              <div className="relative flex items-center bg-[#1A1A24] rounded-2xl px-4 py-3 border border-[#2B2B3D] focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  id="admin-panel-password-input"
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Enter administrator password"
                  autoFocus
                  required
                  className="w-full bg-transparent text-white text-sm font-medium placeholder:text-slate-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="text-slate-400 hover:text-slate-200 p-1 shrink-0 transition-colors"
                  title={showAdminPassword ? 'Hide password' : 'Show password'}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="flex items-center gap-1.5 mt-2 px-1 text-xs text-rose-400 font-semibold animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <button
              id="admin-panel-unlock-btn"
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          {/* Switch back to Mobile Client */}
          <div className="mt-5 pt-4 border-t border-[#232332] text-center">
            <button
              id="admin-panel-back-to-mobile"
              type="button"
              onClick={handleExitToMobile}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Mobile App Client</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const pendingHostsCount = hostApplications.filter((a) => a.status === 'PENDING').length;
  const pendingAgenciesCount = (agencyApplications || []).filter((a) => a.status === 'PENDING').length;

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
    { id: 'store', label: 'Store Assets (Frames, Rides, Sounds)', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'games', label: 'Mini-Games & Arcade', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'sellers', label: 'Coin Resellers', icon: <Coins className="w-4 h-4" /> },
    {
      id: 'host_agencies',
      label: 'Host Agencies',
      icon: <Building2 className="w-4 h-4" />,
      badge: pendingAgenciesCount > 0 ? pendingAgenciesCount : undefined,
    },
    { id: 'gateways', label: 'Payment Gateways', icon: <CreditCard className="w-4 h-4" /> },
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
      {/* MOBILE HEADER (Visible only on mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121217] border-b border-[#232332] shrink-0 z-20 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            A
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white font-display">AuraVoice Admin</h1>
            <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">Web Operations Console</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleLockAdmin}
            className="p-2 rounded-xl bg-[#1A1A24] text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
            title="Lock Admin Panel"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-slate-300 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER BACKDROP */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsDrawerOpen(false)} 
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop persistent, Mobile Drawer) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121217] border-r border-[#232332] flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 space-y-6 flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#232332]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                A
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white font-display">AuraVoice Admin</h1>
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">Web Operations Console</span>
              </div>
            </div>
            {/* Mobile close button */}
            <button 
              className="md:hidden p-1.5 rounded-full bg-[#1A1A24] text-slate-400 hover:text-white hover:bg-[#232332] transition-colors" 
              onClick={() => setIsDrawerOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 overflow-y-auto no-scrollbar flex-1 pb-4">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id as AdminTab);
                    setIsDrawerOpen(false); // Close drawer on mobile after selection
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
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
          <div className="pt-4 border-t border-[#232332] space-y-2 mt-auto">
            <button
              onClick={handleLockAdmin}
              className="w-full py-2 rounded-xl bg-[#1A1A24] hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              title="Lock Admin Console"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Admin Console</span>
            </button>
            <button
              onClick={handleExitToMobile}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Launch Live Mobile Client</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">Version 1.0.0-PROD • AuraVoice</p>
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT VIEWPORT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {currentTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setCurrentTab(tab as AdminTab)} />}
        {currentTab === 'users' && <AdminUsersTable />}
        {currentTab === 'hosts' && <AdminHostsTable />}
        {currentTab === 'gifts' && <AdminGiftsWrapper />}
        {currentTab === 'store' && <AdminStoreItemsTable />}
        {currentTab === 'games' && <AdminGamesTable />}
        {currentTab === 'sellers' && <AdminSellersTable />}
        {currentTab === 'host_agencies' && <AdminHostAgenciesTable />}
        {currentTab === 'gateways' && <AdminPaymentGateways />}
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
