import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Globe,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  RotateCw,
  Gift,
  Check,
  Copy,
  Clock,
  Send,
  MailCheck,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { getActiveOtpForEmail } from '../../services/otpService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'signup_otp' | 'forgot_password';
}

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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    login,
    signup,
    requestSignupOtp,
    confirmSignupOtp,
    resendSignupOtp,
    socialLogin,
    resetPassword,
    allUsers,
  } = useAppState();

  const [mode, setMode] = useState<'login' | 'signup' | 'signup_otp' | 'forgot_password'>(initialMode);

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up State
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
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

  // Email Signup OTP State
  const [signupOtp, setSignupOtp] = useState('');
  const [otpResendSeconds, setOtpResendSeconds] = useState(60);
  const [activeDeliveredOtp, setActiveDeliveredOtp] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: any;
    if (mode === 'signup_otp' && otpResendSeconds > 0) {
      timer = setInterval(() => {
        setOtpResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpResendSeconds]);

  // Sync latest OTP for email
  useEffect(() => {
    if (signupEmail) {
      const active = getActiveOtpForEmail(signupEmail);
      if (active) {
        setActiveDeliveredOtp(active.code);
      }
    }

    const handleOtpEvent = (e: any) => {
      if (e.detail && e.detail.email?.toLowerCase() === signupEmail.trim().toLowerCase()) {
        setActiveDeliveredOtp(e.detail.code);
      }
    };
    window.addEventListener('auravoice_otp_sent', handleOtpEvent);
    return () => window.removeEventListener('auravoice_otp_sent', handleOtpEvent);
  }, [signupEmail, mode]);

  if (!isOpen) return null;

  // Real-time username check
  const isUsernameAvailable =
    signupUsername.trim().length >= 3 &&
    !allUsers.some(
      (u) => u.username.toLowerCase() === signupUsername.trim().toLowerCase()
    );

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, text: 'Good', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(signupPassword);

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
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login.');
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

    if (!signupPhone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    const cleanPhone = signupPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      setErrorMessage('Please enter a valid phone number (at least 7 digits).');
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
      const res = await requestSignupOtp({
        username: signupUsername.trim(),
        displayName: signupDisplayName.trim() || signupUsername.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
        gender: signupGender,
        country: signupCountry,
        countryFlag: signupCountryFlag,
        avatar: finalAvatar,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (res.code) {
          setActiveDeliveredOtp(res.code);
        }
        setMode('signup_otp');
        setSignupOtp('');
        setOtpResendSeconds(60);
        setSuccessMessage(`Verification code sent to ${signupEmail.trim()}! Please check your email.`);
      }
    } catch {
      setErrorMessage('Failed to send verification code. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCode = signupOtp.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await confirmSignupOtp(signupEmail.trim(), cleanCode);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch {
      setErrorMessage('Failed to verify OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendSeconds > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await resendSignupOtp(signupEmail.trim());
      if (res.success) {
        if (res.code) {
          setActiveDeliveredOtp(res.code);
        }
        setOtpResendSeconds(60);
        setSuccessMessage(`Fresh verification code resent to ${signupEmail.trim()}!`);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to resend code. Please try again.');
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
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      setErrorMessage('Social sign in was interrupted.');
    } finally {
      setIsLoading(false);
    }
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
      setForgotOtp('');
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
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#121217] border border-[#232332] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-100 flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Decorative Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#232332]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-violet-600/40">
              A
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide font-display">AuraVoice Live</h2>
              <p className="text-[10px] text-violet-400 font-semibold">Social Voice Party & Gifting Platform</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-slate-400 hover:text-white border border-[#232332] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot_password' && mode !== 'signup_otp' && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0B0B0F] border border-[#232332]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Create Account</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">
                  +1K 🪙
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step Indicator Header when in Email OTP Mode */}
        {mode === 'signup_otp' && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B0B0F] border border-[#232332]">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Info</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <Check className="w-3 h-3 stroke-[3]" /> Details
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-black border border-violet-500/40 animate-pulse">
                  Step 2: Email OTP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body Scroll Area */}
        <div className="px-6 py-4 overflow-y-auto space-y-4 text-xs no-scrollbar">
          {/* Notification / Error / Success Banners */}
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
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Username / Email Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-login-identifier"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-violet-500 transition-colors"
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
                      setForgotEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                      setErrorMessage(null);
                      setSuccessMessage(null);
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
                    id="auth-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-violet-500 transition-colors"
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
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-md bg-[#1A1A24] border-[#232332] text-violet-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-400">Remember on this device</span>
                </label>
                <span className="text-[10px] text-slate-500">Default: password123</span>
              </div>

              {/* Submit Sign In Button */}
              <button
                id="auth-signin-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to AuraVoice</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Social Login Separator */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="w-full border-t border-[#232332]" />
                <span className="absolute px-2.5 bg-[#121217] text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  or continue with
                </span>
              </div>

              {/* Social Login Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('google')}
                  className="py-2.5 px-3 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-200 font-bold text-[11px] flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="font-black text-sm">G</span>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('phone')}
                  className="py-2.5 px-3 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-200 font-bold text-[11px] flex items-center justify-center gap-2 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phone OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* SIGN UP / REGISTER FORM                                        */}
          {/* ============================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Welcome Bonus Callout Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-violet-500/20 to-fuchsia-500/20 border border-amber-500/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
                  🎁
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300">1,000 Welcome Coins Free!</h4>
                  <p className="text-[10px] text-slate-300">Join today to start sending gifts & joining mic stages immediately.</p>
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Choose Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSignupAvatar(preset.url);
                        setUseCustomAvatar(false);
                      }}
                      className={`relative shrink-0 rounded-full p-0.5 transition-all ${
                        !useCustomAvatar && signupAvatar === preset.url
                          ? 'ring-2 ring-violet-500 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {!useCustomAvatar && signupAvatar === preset.url && (
                        <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-violet-600 text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Avatar URL Toggle */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomAvatar(!useCustomAvatar)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    {useCustomAvatar ? '• Use Preset Avatars' : '+ Or enter custom avatar image URL'}
                  </button>
                  {useCustomAvatar && (
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-[11px] focus:outline-hidden focus:border-violet-500"
                    />
                  )}
                </div>
              </div>

              {/* Display Name & Username */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={signupDisplayName}
                    onChange={(e) => setSignupDisplayName(e.target.value)}
                    placeholder="e.g. Star Singer"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-300">Username</label>
                    {signupUsername.length >= 3 && (
                      <span className={`text-[9px] font-bold ${isUsernameAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUsernameAvailable ? 'Available' : 'Taken'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value.replace(/\s+/g, ''))}
                    placeholder="e.g. StarSinger99"
                    required
                    className={`w-full px-3 py-2 rounded-xl bg-[#1A1A24] border text-white text-xs focus:outline-hidden ${
                      signupUsername.length >= 3
                        ? isUsernameAvailable
                          ? 'border-emerald-500/50'
                          : 'border-rose-500/50'
                        : 'border-[#232332]'
                    }`}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Country & Gender Selection */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Country</label>
                  <select
                    value={signupCountry}
                    onChange={(e) => {
                      const sel = COUNTRIES.find((c) => c.name === e.target.value);
                      setSignupCountry(e.target.value);
                      if (sel) setSignupCountryFlag(sel.flag);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="bg-[#121217]">
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['female', 'male', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSignupGender(g)}
                        className={`py-1.5 rounded-xl border text-[10px] font-bold capitalize transition-colors ${
                          signupGender === g
                            ? 'bg-violet-600 text-white border-violet-500'
                            : 'bg-[#1A1A24] border-[#232332] text-slate-400'
                        }`}
                      >
                        {g === 'female' ? '👩 F' : g === 'male' ? '👨 M' : '✨ Other'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Confirm</label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Password Strength Meter */}
              {signupPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Security Strength:</span>
                    <span className={`font-bold ${strength.score === 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-1.5 rounded-full overflow-hidden bg-[#1A1A24]">
                    <div className={strength.score >= 1 ? strength.color : 'bg-transparent'} />
                    <div className={strength.score >= 2 ? strength.color : 'bg-transparent'} />
                    <div className={strength.score >= 3 ? strength.color : 'bg-transparent'} />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded-md bg-[#1A1A24] border-[#232332] text-violet-600 focus:ring-0"
                />
                <span className="text-[10px] text-slate-400 leading-tight">
                  I agree to the Community Guidelines, Voice Safety Rules, and Fair Gifting Terms.
                </span>
              </label>

              {/* Submit Create Account Button */}
              <button
                id="auth-signup-submit-button"
                type="submit"
                disabled={isLoading || !agreeTerms}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Sending Email OTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Send Verification Code to Email ✉️</span>
                  </>
                )}
              </button>

              {/* Instant Social Signup */}
              <div className="relative py-1.5 flex items-center justify-center">
                <div className="w-full border-t border-[#232332]" />
                <span className="absolute px-2.5 bg-[#121217] text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  or sign up with
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1A1A24] hover:bg-[#232332] border border-[#232332] text-slate-200 font-bold text-[11px] flex items-center justify-center gap-2 transition-colors"
              >
                <span className="font-black text-sm text-amber-400">G</span>
                <span>Instant Sign Up with Google</span>
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* EMAIL OTP VERIFICATION STEP (FOR NEW USERS)                   */}
          {/* ============================================================== */}
          {mode === 'signup_otp' && (
            <div className="space-y-4">
              {/* Animated Header Callout */}
              <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1A1A24] to-[#121217] border border-[#232332] text-center relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-violet-600/40 relative">
                  <MailCheck className="w-7 h-7" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#121217] animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#121217]" />
                </div>
                <h3 className="text-sm font-black text-white">Verify Your Email Address</h3>
                <p className="text-[11px] text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                  We've sent a 6-digit confirmation code to:
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0B0F] border border-[#232332] text-violet-300 text-xs font-mono font-bold">
                  <span>{signupEmail}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline ml-1 font-sans"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Live Email Inbox Notification Preview (Simulated Inbox Card) */}
              {activeDeliveredOtp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-indigo-950/60 to-purple-950/60 border border-violet-500/40 text-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-violet-600/30 text-violet-300">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-black text-white">Live Email Inbox Alert</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                      Delivered
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">Subject: AuraVoice Verification Code</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-300">Your OTP:</span>
                        <span className="font-mono text-sm font-black tracking-widest text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                          {activeDeliveredOtp}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSignupOtp(activeDeliveredOtp);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                    >
                      {copiedCode || signupOtp === activeDeliveredOtp ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Pasted!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Auto-Fill</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 6-Digit OTP Form */}
              <form onSubmit={handleVerifySignupOtp} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300">
                      Enter 6-Digit Verification Code
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Valid for 10 minutes
                    </span>
                  </div>

                  {/* 6-Digit Input Box */}
                  <div className="relative">
                    <input
                      id="signup-otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={signupOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setSignupOtp(val);
                      }}
                      placeholder="• • • • • •"
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#1A1A24] border border-[#232332] text-center tracking-[0.45em] font-mono text-xl font-black text-white placeholder:text-slate-600 focus:outline-hidden focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>

                {/* Resend Timer & Button */}
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="text-slate-400">Didn't receive the email?</span>
                  <button
                    type="button"
                    disabled={otpResendSeconds > 0 || isLoading}
                    onClick={handleResendOtp}
                    className={`font-bold transition-colors flex items-center gap-1 ${
                      otpResendSeconds > 0 || isLoading
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-violet-400 hover:text-violet-300'
                    }`}
                  >
                    <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {otpResendSeconds > 0 ? `Resend Code (${otpResendSeconds}s)` : 'Resend Code Now'}
                    </span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    id="auth-verify-otp-submit-button"
                    type="submit"
                    disabled={isLoading || signupOtp.trim().length !== 6}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-emerald-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Activating Account...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>Verify Email & Claim 1,000 Coins 🪙</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="w-full py-2 text-slate-400 hover:text-slate-200 text-[11px] font-bold text-center block"
                  >
                    ← Back to edit profile information
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* FORGOT PASSWORD FLOW                                           */}
          {/* ============================================================== */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0B0B0F] border border-[#232332] text-center">
                <KeyRound className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <h3 className="text-xs font-black text-white">Reset Account Password</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {forgotStep === 1 && 'Enter your registered email address to receive a secure recovery code.'}
                  {forgotStep === 2 && 'Enter the 6-digit verification code sent to your email.'}
                  {forgotStep === 3 && 'Choose a secure new password for your AuraVoice account.'}
                </p>
              </div>

              {forgotStep === 1 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="alex.rider@auravoice.live"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              )}

              {forgotStep === 2 && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="749201"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-center tracking-widest font-mono text-base text-white focus:outline-hidden focus:border-violet-500"
                  />
                  <p className="text-[10px] text-center text-slate-500">
                    Demo Code Auto-filled: <span className="text-violet-400 font-bold">749201</span>
                  </p>
                </div>
              )}

              {forgotStep === 3 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-xs focus:outline-hidden focus:border-violet-500"
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
        <div className="px-6 py-2.5 bg-[#0B0B0F]/80 border-t border-[#232332] flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted Audio Session</span>
          </div>
          <span>AuraVoice Live ID</span>
        </div>
      </motion.div>
    </div>
  );
};
