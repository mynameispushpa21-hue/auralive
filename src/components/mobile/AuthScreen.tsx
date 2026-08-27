import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Globe,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RotateCw,
  Gift,
  Check,
  Radio,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';

const PRESET_AVATARS = [
  {
    label: 'DJ Alex',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Luna Star',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Kenji Wave',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Zara Luxury',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Marcus Beat',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Chloe Club',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  },
];

const COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
  { name: 'India', flag: '🇮🇳', code: 'IN' },
  { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
];

export const AuthScreen: React.FC = () => {
  const { login, signup, socialLogin, resetPassword, allUsers } = useAppState();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('AlexRider');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up State
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupGender, setSignupGender] = useState<'male' | 'female' | 'other'>('female');
  const [signupCountry, setSignupCountry] = useState(COUNTRIES[0].name);
  const [signupCountryFlag, setSignupCountryFlag] = useState(COUNTRIES[0].flag);
  const [signupAvatar, setSignupAvatar] = useState(PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({
        emailOrUsername: loginIdentifier.trim(),
        password: loginPassword,
        rememberMe,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
      }
    } catch {
      setErrorMessage('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signupUsername.trim() || signupUsername.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Community Guidelines & Terms.');
      return;
    }

    setIsLoading(true);
    try {
      const finalAvatar = useCustomAvatar && customAvatarUrl.trim() ? customAvatarUrl.trim() : signupAvatar;
      const res = await signup({
        username: signupUsername.trim(),
        displayName: signupDisplayName.trim() || signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        gender: signupGender,
        country: signupCountry,
        countryFlag: signupCountryFlag,
        avatar: finalAvatar,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple' | 'facebook' | 'phone') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await socialLogin(provider);
      setSuccessMessage(res.message);
    } catch {
      setErrorMessage('Social sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (user: typeof allUsers[0]) => {
    setLoginIdentifier(user.username);
    setLoginPassword(user.password || 'password123');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (forgotStep === 1) {
      if (!forgotEmail.trim()) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }
      setForgotStep(2);
      setForgotOtp('749201');
    } else if (forgotStep === 2) {
      if (forgotOtp.length < 4) {
        setErrorMessage('Please enter the 6-digit verification code.');
        return;
      }
      setForgotStep(3);
    } else if (forgotStep === 3) {
      if (forgotNewPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        return;
      }
      setIsLoading(true);
      const res = await resetPassword(forgotEmail, forgotNewPassword);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setMode('login');
          setForgotStep(1);
          setLoginIdentifier(forgotEmail);
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0B0F] text-slate-100 overflow-y-auto no-scrollbar pb-8">
      {/* Top Hero Brand Header */}
      <div className="relative pt-6 pb-4 px-6 text-center overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-violet-600/40 mb-3 animate-pulse">
          <Radio className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-black text-white tracking-tight font-display">
          AuraVoice Live
        </h1>
        <p className="text-xs text-violet-300 font-medium mt-0.5">
          Join high-fidelity audio rooms & send live virtual gifts
        </p>
      </div>

      {/* Mode Switcher Tabs (Sign In / Create Account) */}
      {mode !== 'forgot_password' && (
        <div className="px-6 mb-4">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#121217] border border-[#232332]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">
                +1K 🪙
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-6 flex-1 space-y-4">
        {/* Alerts & Feedback */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start gap-2 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-start gap-2 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="flex-1">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* SIGN IN FORM                                                   */}
        {/* ============================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Quick Demo Persona Pickers for Fast Testing */}
            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Tap Demo Logins
                </span>
                <span className="text-[9px] text-slate-500">Tap to auto-fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {allUsers.slice(0, 3).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(user)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                      loginIdentifier === user.username
                        ? 'bg-violet-600/25 border-violet-500 text-white shadow-sm'
                        : 'bg-[#1A1A24] border-[#232332] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <span className="text-[10px] font-bold truncate w-full">{user.displayName.split(' ')[0]}</span>
                    <span className="text-[8px] text-violet-300 font-semibold">{user.isHost ? '🎤 Host' : user.vipTier.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email / Username Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="mobile-auth-login-identifier"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="AlexRider or alex.rider@auravoice.live"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setForgotStep(1);
                    setErrorMessage(null);
                  }}
                  className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="mobile-auth-login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-violet-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-md bg-[#1A1A24] border-[#232332] text-violet-600 focus:ring-0"
                />
                <span className="text-[11px] text-slate-400">Remember on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="mobile-auth-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to AuraVoice</span>
                </>
              )}
            </button>

            {/* Social Logins Divider */}
            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#232332]" />
              </div>
              <span className="relative px-3 bg-[#0B0B0F] text-[10px] font-bold text-slate-500 uppercase">
                Or Continue With
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                className="py-2.5 px-3 rounded-xl bg-[#121217] hover:bg-[#1A1A24] border border-[#232332] text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🌐</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn('apple')}
                className="py-2.5 px-3 rounded-xl bg-[#121217] hover:bg-[#1A1A24] border border-[#232332] text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🍎</span>
                <span>Apple</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn('phone')}
                className="py-2.5 px-3 rounded-xl bg-[#121217] hover:bg-[#1A1A24] border border-[#232332] text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-violet-400" />
                <span>Phone</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* SIGN UP FORM                                                   */}
        {/* ============================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Welcome Bonus Callout */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 text-base">
                🪙
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-amber-300 leading-tight">Welcome Gifting Bonus</p>
                <p className="text-[10px] text-slate-300 leading-tight">Create your account now and get +1,000 free coins!</p>
              </div>
            </div>

            {/* Display Name & Username */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={signupDisplayName}
                  onChange={(e) => setSignupDisplayName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Username *</label>
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="MayaVoice"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="maya@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
            </div>

            {/* Country & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Country</label>
                <select
                  value={signupCountry}
                  onChange={(e) => {
                    const found = COUNTRIES.find((c) => c.name === e.target.value);
                    setSignupCountry(e.target.value);
                    if (found) setSignupCountryFlag(found.flag);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Gender</label>
                <select
                  value={signupGender}
                  onChange={(e) => setSignupGender(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                >
                  <option value="female" className="bg-slate-900 text-white">Female</option>
                  <option value="male" className="bg-slate-900 text-white">Male</option>
                  <option value="other" className="bg-slate-900 text-white">Other</option>
                </select>
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Password *</label>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Confirm Password *</label>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Repeat pass"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Choose Avatar</label>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.label}
                    type="button"
                    onClick={() => {
                      setSignupAvatar(av.url);
                      setUseCustomAvatar(false);
                    }}
                    className={`relative p-0.5 rounded-full shrink-0 transition-all ${
                      !useCustomAvatar && signupAvatar === av.url
                        ? 'ring-2 ring-violet-500 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded-md bg-[#1A1A24] border-[#232332] text-violet-600 focus:ring-0"
              />
              <span className="text-[10px] text-slate-400 leading-tight">
                I agree to the Community Guidelines and Voice Safety Terms.
              </span>
            </label>

            {/* Submit Create Account Button */}
            <button
              id="mobile-auth-signup-submit"
              type="submit"
              disabled={isLoading || !agreeTerms}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>Sign Up & Claim 1,000 Coins 🪙</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* FORGOT PASSWORD FORM                                           */}
        {/* ============================================================== */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#121217] border border-[#232332] text-center">
              <KeyRound className="w-7 h-7 text-violet-400 mx-auto mb-1.5" />
              <h3 className="text-xs font-black text-white">Reset Account Password</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {forgotStep === 1 && 'Enter your registered email address to receive a recovery code.'}
                {forgotStep === 2 && 'Enter the 6-digit verification code.'}
                {forgotStep === 3 && 'Choose a new password for your account.'}
              </p>
            </div>

            {forgotStep === 1 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="alex.rider@auravoice.live"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300">6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="749201"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#121217] border border-[#232332] text-center tracking-widest font-mono text-base text-white focus:outline-hidden focus:border-violet-500"
                />
                <p className="text-[10px] text-center text-slate-500">
                  Demo Code: <span className="text-violet-400 font-bold">749201</span>
                </p>
              </div>
            )}

            {forgotStep === 3 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#121217] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {forgotStep === 1 && 'Send Recovery Code'}
                  {forgotStep === 2 && 'Verify Code'}
                  {forgotStep === 3 && 'Update Password'}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setForgotStep(1);
              }}
              className="w-full py-1 text-slate-400 hover:text-slate-200 text-[11px] font-bold text-center block"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>

      {/* Footer Security Badge */}
      <div className="mt-auto pt-4 px-6 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>256-Bit Encrypted Audio Session • AuraVoice ID</span>
      </div>
    </div>
  );
};
