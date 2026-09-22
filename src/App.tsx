import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { StateProvider, useAppState } from './services/stateStore';
import { MobileContainer } from './components/mobile/MobileContainer';
import { AdminContainer } from './components/admin/AdminContainer';
import { AuthModal } from './components/auth/AuthModal';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
  } = useAppState();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center select-none">
      {/* GLOBAL TOP BRAND BAR */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
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
