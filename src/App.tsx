import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { StateProvider, useAppState } from './services/stateStore';
import { MobileContainer } from './components/mobile/MobileContainer';
import { AdminContainer } from './components/admin/AdminContainer';
import { AuthModal } from './components/auth/AuthModal';
import {
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  Smartphone,
  Eye,
  EyeOff,
  X,
  KeyRound,
} from 'lucide-react';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
  } = useAppState();

  // Admin access password modal state
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleAdminButtonClick = () => {
    if (isAdminRoute) {
      navigate('/');
      return;
    }

    const isUnlocked = sessionStorage.getItem('auravoice_admin_authenticated') === 'true';
    if (isUnlocked) {
      navigate('/admin');
    } else {
      setPasswordInput('');
      setPasswordError(null);
      setIsAdminPasswordModalOpen(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Admin@786') {
      sessionStorage.setItem('auravoice_admin_authenticated', 'true');
      setIsAdminPasswordModalOpen(false);
      setPasswordInput('');
      setPasswordError(null);
      navigate('/admin');
    } else {
      setPasswordError('Access Denied: Incorrect administrator password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center select-none">
      {/* GLOBAL TOP BRAND BAR */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between gap-3">
        {/* Left Brand */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-amber-500/25">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white font-display tracking-tight">
                AuraVoice Live
              </h1>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cluster Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Social Voice-Party RTC & Virtual Gifting Ecosystem
            </p>
          </div>
        </div>

        {/* Right Admin Panel Button (with Password Protection) */}
        <div className="flex items-center gap-2">
          {isAdminRoute ? (
            <button
              id="exit-to-mobile-btn"
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-violet-400" />
              <span>Back to App</span>
            </button>
          ) : (
            <button
              id="open-admin-panel-btn"
              onClick={handleAdminButtonClick}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm group active:scale-95"
              title="Admin Panel (Password Required: Admin@786)"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
              <span>Admin Panel</span>
              <Lock className="w-3 h-3 text-slate-400 group-hover:text-amber-400 ml-0.5" />
            </button>
          )}
        </div>
      </header>

      {/* ADMIN PANEL PASSWORD MODAL */}
      {isAdminPasswordModalOpen && (
        <div 
          id="admin-password-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm bg-[#121217] border border-[#232332] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-violet-600/15 rounded-full blur-2xl pointer-events-none" />

            {/* Top Close Button */}
            <button
              id="close-admin-password-modal"
              type="button"
              onClick={() => {
                setIsAdminPasswordModalOpen(false);
                setPasswordInput('');
                setPasswordError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-13 h-13 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-[#121217] rounded-[14px] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-wider uppercase mb-1.5">
                <KeyRound className="w-3 h-3" />
                <span>Password Required</span>
              </div>
              <h2 className="text-lg font-black text-white">Admin Panel Access</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto">
                Enter the administrator password to unlock platform operations.
              </p>
            </div>

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 px-0.5">Password</label>
                <div className="relative flex items-center bg-[#1A1A24] rounded-2xl px-3.5 py-2.5 border border-[#2B2B3D] focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    id="admin-modal-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Enter password"
                    autoFocus
                    required
                    className="w-full bg-transparent text-white text-sm font-medium placeholder:text-slate-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 p-1 shrink-0 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-1.5 mt-2 px-1 text-xs text-rose-400 font-semibold animate-shake">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <button
                id="submit-admin-password-btn"
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock & Open Admin</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT BODY WITH REACT ROUTER */}
      <div className="w-full flex-1 flex items-center justify-center p-2 sm:p-4">
        <Routes>
          {/* Aam users ke liye main page */}
          <Route
            path="/"
            element={
              <div className="w-full flex items-center justify-center py-2 sm:py-4">
                <MobileContainer />
              </div>
            }
          />

          {/* Admin panel ke liye alag route */}
          <Route
            path="/admin/*"
            element={
              <div className="w-full max-w-7xl">
                <AdminContainer onSwitchToMobile={() => navigate('/')} />
              </div>
            }
          />

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <div className="w-full flex items-center justify-center py-2 sm:py-4">
                <MobileContainer />
              </div>
            }
          />
        </Routes>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <StateProvider>
      <Router>
        <AppLayout />
      </Router>
    </StateProvider>
  );
}
