import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCw,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { getActiveOtpForEmail } from '../../services/otpService';

export const AuthScreen: React.FC = () => {
  const {
    login,
    socialLogin,
    resetPassword,
    requestSignupOtp,
    confirmSignupOtp,
    resendSignupOtp,
    cancelPendingSignup,
    allUsers,
  } = useAppState();

  const [mode, setMode] = useState<'login' | 'signup' | 'signup_otp' | 'forgot_password'>('login');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up State
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification State
  const [signupOtp, setSignupOtp] = useState('');
  const [activeDeliveredOtp, setActiveDeliveredOtp] = useState<string | null>(null);
  const [otpResendSeconds, setOtpResendSeconds] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (otpResendSeconds > 0) {
      interval = setInterval(() => {
        setOtpResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendSeconds]);

  // Sync active OTP code from OTP Service for smooth preview & auto-fill
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
        rememberMe: true,
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
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
      const res = await requestSignupOtp({
        username: signupUsername.trim(),
        displayName: signupUsername.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
        gender: 'other',
        country: 'Global',
        countryFlag: '🌐',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
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
        setSuccessMessage(`Verification code sent to ${signupEmail.trim()}! Please confirm below.`);
        // Focus first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
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
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await confirmSignupOtp(signupEmail.trim(), cleanCode);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to verify OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendSeconds > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await resendSignupOtp(signupEmail.trim());
      if (res.success) {
        if (res.code) {
          setActiveDeliveredOtp(res.code);
        }
        setOtpResendSeconds(60);
        setSuccessMessage(`New verification code sent to ${signupEmail.trim()}!`);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to resend code. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const otpArray = signupOtp.padEnd(6, ' ').split('');
    otpArray[index] = digit || ' ';
    const newOtp = otpArray.join('').trimEnd();
    setSignupOtp(newOtp);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!signupOtp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setSignupOtp(pasted);
      const targetIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[targetIndex]?.focus();
    }
  };

  const autoFillDeliveredOtp = () => {
    if (activeDeliveredOtp) {
      setSignupOtp(activeDeliveredOtp);
      otpInputRefs.current[5]?.focus();
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
    <div className="flex flex-col min-h-full bg-gradient-to-b from-[#FAF8FD] via-[#F6F4FC] to-[#EEEAFC] text-slate-800 overflow-y-auto no-scrollbar px-6 pt-7 pb-8 select-none">
      {/* Top Header Badge */}
      <div className="flex justify-center mb-3">
        <div className="w-20 h-20 rounded-full p-[3px] bg-white/90 shadow-[0_8px_25px_rgba(168,85,247,0.22)] flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#F472B6] via-[#A855F7] to-[#3B82F6] flex items-center justify-center shadow-inner overflow-hidden">
            {mode === 'signup_otp' ? (
              <ShieldCheck className="w-10 h-10 text-white" />
            ) : (
              <svg className="w-11 h-11 text-white fill-current mt-1" viewBox="0 0 24 24">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Main Heading */}
      <h1 className="text-[26px] font-extrabold text-[#231A4C] text-center tracking-tight mb-2">
        {mode === 'login' && 'Login'}
        {mode === 'signup' && 'Create Account'}
        {mode === 'signup_otp' && 'Verify Email OTP'}
        {mode === 'forgot_password' && 'Forgot Password'}
      </h1>

      {/* Firebase Status Badge */}
      <div className="flex items-center justify-center gap-1.5 mb-5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full py-1 px-3 w-fit mx-auto font-semibold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Firebase Realtime Database & Auth (live-41437)</span>
      </div>

      {/* Alerts & Feedback */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-start gap-2 text-xs font-medium shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-2 text-xs font-medium shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="flex-1">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 1. LOGIN FORM                                                  */}
      {/* ============================================================== */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label className="text-xs font-bold text-[#3B3463]">Email</label>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setForgotStep(1);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[11px] text-[#5B5CEB] font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
              <Mail className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-auth-login-identifier"
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Enter email or username"
                required
                className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">Password</label>
            <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
              <Lock className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-auth-login-password"
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden pr-2"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="text-[#9E9BB5] hover:text-[#5B5CEB] transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="mobile-auth-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6B46F6] via-[#5C56F6] to-[#407BFA] hover:brightness-105 active:scale-[0.99] text-white font-bold text-base shadow-[0_10px_25px_rgba(92,86,246,0.38)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-[#E3E0F2]" />
            <span className="absolute px-3 bg-[#F6F4FC] text-xs font-normal text-[#9591B2]">
              or continue with
            </span>
          </div>

          {/* Social Logins */}
          <div className="flex items-center justify-center gap-5">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('google')}
              className="w-13 h-13 rounded-full bg-white shadow-[0_6px_20px_rgba(112,96,214,0.12)] border border-[#ECE9F8] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              title="Sign in with Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('facebook')}
              className="w-13 h-13 rounded-full bg-white shadow-[0_6px_20px_rgba(112,96,214,0.12)] border border-[#ECE9F8] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              title="Sign in with Facebook"
            >
              <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#1877F2" />
                <path
                  fill="#FFFFFF"
                  d="M24.5 18h-4v9h-4v-9h-2.5v-3.5H16.5v-2.2c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.1 2.2.1v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.8h3l-.5 3.5z"
                />
              </svg>
            </button>
          </div>

          {/* Footer: Not registered yet? Sign Up > */}
          <div className="text-center pt-5 pb-2 text-xs text-[#6B658D]">
            <span>Not registered yet? </span>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-[#4E4AE8] font-bold hover:underline transition-colors ml-1"
            >
              Sign Up &gt;
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 2. SIGN UP FORM (Step 1: Fill details, triggers OTP)             */}
      {/* ============================================================== */}
      {mode === 'signup' && (
        <form onSubmit={handleSignupSubmit} className="space-y-3.5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">Username</label>
            <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
              <User className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-auth-signup-username"
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                placeholder="Choose your username"
                required
                className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">Email (OTP will be sent here)</label>
            <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
              <Mail className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-auth-signup-email"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">Phone Number</label>
            <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
              <Phone className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-auth-signup-phone"
                type="tel"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                placeholder="Enter phone number"
                required
                className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">Password</label>
            <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
              <Lock className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-auth-signup-password"
                type={showSignupPassword ? 'text' : 'password'}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Create password (min 6 chars)"
                required
                className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden pr-2"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                className="text-[#9E9BB5] hover:text-[#5B5CEB] transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">Confirm Password</label>
            <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
              <Lock className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-auth-signup-confirm-password"
                type={showSignupPassword ? 'text' : 'password'}
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2 cursor-pointer select-none px-1 pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-[#5B5CEB] focus:ring-0"
            />
            <span className="text-[11px] text-[#6B658D] leading-tight">
              I agree to the Community Guidelines & Terms of Service.
            </span>
          </label>

          {/* Sign Up & Get OTP Button */}
          <button
            id="mobile-auth-signup-submit"
            type="submit"
            disabled={isLoading || !agreeTerms}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6B46F6] via-[#5C56F6] to-[#407BFA] hover:brightness-105 active:scale-[0.99] text-white font-bold text-base shadow-[0_10px_25px_rgba(92,86,246,0.38)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Sending Verification OTP...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Sign Up &amp; Get OTP</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-[#E3E0F2]" />
            <span className="absolute px-3 bg-[#F6F4FC] text-xs font-normal text-[#9591B2]">
              or continue with
            </span>
          </div>

          {/* Social Logins */}
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => handleSocialSignIn('google')}
              className="w-13 h-13 rounded-full bg-white shadow-[0_6px_20px_rgba(112,96,214,0.12)] border border-[#ECE9F8] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              title="Sign up with Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialSignIn('facebook')}
              className="w-13 h-13 rounded-full bg-white shadow-[0_6px_20px_rgba(112,96,214,0.12)] border border-[#ECE9F8] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              title="Sign up with Facebook"
            >
              <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#1877F2" />
                <path
                  fill="#FFFFFF"
                  d="M24.5 18h-4v9h-4v-9h-2.5v-3.5H16.5v-2.2c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.1 2.2.1v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.8h3l-.5 3.5z"
                />
              </svg>
            </button>
          </div>

          {/* Footer: Already registered? Log In > */}
          <div className="text-center pt-4 pb-2 text-xs text-[#6B658D]">
            <span>Already registered? </span>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-[#4E4AE8] font-bold hover:underline transition-colors ml-1"
            >
              Log In &gt;
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 3. SIGNUP OTP VERIFICATION PAGE (User requested dedicated page)  */}
      {/* ============================================================== */}
      {mode === 'signup_otp' && (
        <div className="space-y-4">
          {/* Back button & destination info */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5B5CEB] hover:text-[#403ED8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step 2 of 2</span>
          </div>

          {/* Card instruction box */}
          <div className="p-4 rounded-2xl bg-white border border-[#EBE8F8] shadow-[0_4px_20px_rgba(112,96,214,0.08)] text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#231A4C]">Enter 6-Digit Code</h3>
            <p className="text-xs text-[#6B658D] mt-1">
              We have dispatched a verification code to
            </p>
            <div className="inline-block mt-1.5 px-3 py-1 bg-violet-50 text-[#5B5CEB] font-bold text-xs rounded-full border border-violet-200">
              {signupEmail}
            </div>
          </div>

          {/* Live In-App Delivery / Quick-Fill Card */}
          {activeDeliveredOtp && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-violet-50 border border-amber-200/90 shadow-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📬</span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-amber-800">
                    Live In-App Delivery Preview
                  </div>
                  <div className="text-sm font-mono font-extrabold text-violet-900 tracking-wider">
                    {activeDeliveredOtp}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={autoFillDeliveredOtp}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-fill</span>
              </button>
            </motion.div>
          )}

          {/* 6-Digit PIN Boxes */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-[#3B3463] mb-2 text-center">
              Verification Code
            </label>
            <div
              className="flex justify-between items-center gap-2 max-w-[320px] mx-auto"
              onPaste={handleOtpPaste}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = signupOtp[index] || '';
                return (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-13 rounded-2xl bg-white border-2 border-[#E0DCF5] focus:border-[#6B46F6] focus:ring-4 focus:ring-[#6B46F6]/15 text-center text-xl font-bold font-mono text-[#231A4C] shadow-sm outline-none transition-all"
                  />
                );
              })}
            </div>
          </div>

          {/* Verify & Create Account Submit Button */}
          <button
            id="mobile-auth-otp-verify-submit"
            type="button"
            onClick={() => handleVerifySignupOtp()}
            disabled={isLoading || signupOtp.replace(/\D/g, '').length !== 6}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6B46F6] via-[#5C56F6] to-[#407BFA] hover:brightness-105 active:scale-[0.99] text-white font-bold text-base shadow-[0_10px_25px_rgba(92,86,246,0.38)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Verifying &amp; Saving to Firebase...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm OTP &amp; Create Account</span>
              </>
            )}
          </button>

          {/* Resend OTP Section */}
          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-[#6B658D]">
            {otpResendSeconds > 0 ? (
              <span>
                Resend code in <strong className="text-[#5B5CEB] font-mono">{otpResendSeconds}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-[#4E4AE8] font-bold hover:underline flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Didn't get the code? Resend OTP</span>
              </button>
            )}
          </div>

          {/* Security & Sync Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-500">
            🔒 Account is registered to Firebase Authentication &amp; stored in Realtime Database.
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FORGOT PASSWORD FORM                                        */}
      {/* ============================================================== */}
      {mode === 'forgot_password' && (
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#EBE8F8] shadow-[0_4px_20px_rgba(112,96,214,0.08)] text-center">
            <KeyRound className="w-8 h-8 text-[#5B5CEB] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#231A4C]">Reset Account Password</h3>
            <p className="text-xs text-[#6B658D] mt-1">
              {forgotStep === 1 && 'Enter your registered email address to receive a recovery code.'}
              {forgotStep === 2 && 'Enter the 6-digit verification code.'}
              {forgotStep === 3 && 'Choose a new password for your account.'}
            </p>
          </div>

          {forgotStep === 1 && (
            <div>
              <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">
                Registered Email
              </label>
              <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
                <Mail className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {forgotStep === 2 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#3B3463] px-0.5">6-Digit Code</label>
              <div className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8]">
                <input
                  type="text"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="749201"
                  required
                  className="w-full bg-transparent text-center tracking-[0.4em] font-mono text-xl text-[#231A4C] font-bold focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-center text-[#8D8BA7]">
                Demo Verification Code: <span className="text-[#5B5CEB] font-bold">749201</span>
              </p>
            </div>
          )}

          {forgotStep === 3 && (
            <div>
              <label className="block text-xs font-bold text-[#3B3463] mb-1.5 px-0.5">
                New Password
              </label>
              <div className="relative flex items-center bg-white rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(112,96,214,0.08)] border border-[#EBE8F8] focus-within:border-[#7C7AF8] focus-within:ring-2 focus-within:ring-[#7C7AF8]/20 transition-all">
                <Lock className="w-5 h-5 text-[#8D8BA7] mr-3 shrink-0" strokeWidth={1.8} />
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-transparent text-[#231A4C] text-sm font-medium placeholder:text-[#9E9BB5] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6B46F6] via-[#5C56F6] to-[#407BFA] text-white font-bold text-base shadow-[0_10px_25px_rgba(92,86,246,0.38)] hover:brightness-105 flex items-center justify-center gap-2 transition-all mt-4"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
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
            className="w-full py-2 text-[#6B658D] hover:text-[#5B5CEB] text-xs font-bold text-center block transition-colors"
          >
            &lt; Back to Log In
          </button>
        </form>
      )}
    </div>
  );
};
