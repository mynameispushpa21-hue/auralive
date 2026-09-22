import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { StateProvider, useAppState } from './services/stateStore';
import { MobileContainer } from './components/mobile/MobileContainer';
import { AdminContainer } from './components/admin/AdminContainer';
import { AuthModal } from './components/auth/AuthModal';
import {
  Smartphone,
  LayoutDashboard,
  Sparkles,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const {
    currentUser,
    isAuthenticated,
    logout,
    openAuthModal,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
  } = useAppState();

  const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center select-none">
      {/* GLOBAL TOP NAVIGATION & ROUTE CONTROL BAR */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3">
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

        {/* Center Route Switcher - Regular users cannot see the Admin Panel */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => navigate('/')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isAdminRoute
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App Client (/)</span>
          </button>

          {/* Admin Panel button is hidden from normal users - only visible if logged in as Admin or actively on admin route */}
          {(isAdminUser || isAdminRoute) && (
            <button
              onClick={() => navigate('/admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAdminRoute
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}

          <button
            onClick={() => {
              if (isAdminRoute) {
                navigate('/');
              }
              window.dispatchEvent(new CustomEvent('auravoice_trigger_splash'));
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/40 border border-cyan-500/30 ml-1"
            title="Preview Splash Screen with Skip option"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Splash Screen</span>
          </button>
        </div>

        {/* Right Balances & Auth Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Balances pill */}
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <span className="text-amber-300 flex items-center gap-1">
              <span>🪙</span>
              <span>{currentUser.coins.toLocaleString()}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 flex items-center gap-1">
              <span>💎</span>
              <span>{currentUser.diamonds.toLocaleString()}</span>
            </span>
          </div>

          {/* Auth Button or User Badge */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-violet-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 text-white text-xs font-extrabold shadow-md shadow-violet-600/30 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up (+1K 🪙)</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="Switch or manage account"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-violet-400"
                />
                <span className="text-xs font-bold text-white max-w-[90px] truncate hidden md:inline">
                  {currentUser.displayName}
                </span>
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

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
