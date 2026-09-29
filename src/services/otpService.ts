export interface PendingOtpData {
  email: string;
  code: string;
  purpose: 'signup' | 'login' | 'reset_password';
  expiresAt: number; // timestamp ms
  sentAt: number;
  attempts: number;
}

// In-memory store for active OTP codes (fallback & high-speed validation)
const otpStore = new Map<string, PendingOtpData>();

// Listeners for live in-app email inbox preview
type OtpListener = (data: { email: string; code: string; purpose: string; expiresAt: number }) => void;
const otpListeners = new Set<OtpListener>();

export const subscribeToOtpEvents = (listener: OtpListener) => {
  otpListeners.add(listener);
  return () => {
    otpListeners.delete(listener);
  };
};

export const broadcastOtpDelivered = (email: string, code: string, purpose: string, expiresAt: number) => {
  otpListeners.forEach((fn) => {
    try {
      fn({ email, code, purpose, expiresAt });
    } catch {
      // ignore
    }
  });

  // Also dispatch window custom event for any other subscribers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('auravoice_otp_sent', {
        detail: { email, code, purpose, expiresAt },
      })
    );
  }
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP code
 */
export const generate6DigitOtp = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = 100000 + (array[0] % 900000);
    return code.toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send an email verification OTP for a new user registration
 */
export const sendSignupEmailOtp = async (
  email: string,
  username?: string
): Promise<{ success: boolean; message: string; code?: string; expiresAt: number }> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
      expiresAt: 0,
    };
  }

  // Rate-limiting check: minimum 20 seconds between sends for same email
  const existing = otpStore.get(cleanEmail);
  const now = Date.now();
  if (existing && now - existing.sentAt < 20000) {
    const waitSec = Math.ceil((20000 - (now - existing.sentAt)) / 1000);
    return {
      success: false,
      message: `Please wait ${waitSec}s before requesting a new OTP.`,
      expiresAt: existing.expiresAt,
      code: existing.code,
    };
  }

  const code = generate6DigitOtp();
  const validityDurationMs = 10 * 60 * 1000; // 10 minutes
  const expiresAt = now + validityDurationMs;

  const otpData: PendingOtpData = {
    email: cleanEmail,
    code,
    purpose: 'signup',
    expiresAt,
    sentAt: now,
    attempts: 0,
  };

  otpStore.set(cleanEmail, otpData);

  // Broadcast to live preview UI
  broadcastOtpDelivered(cleanEmail, code, 'signup', expiresAt);

  console.info(`[AuraVoice OTP] Verification code for ${cleanEmail}: ${code} (Expires in 10m)`);

  return {
    success: true,
    message: `6-digit verification code sent to ${cleanEmail}. Please check your inbox or spam folder.`,
    code,
    expiresAt,
  };
};

/**
 * Verify the 6-digit OTP code entered by the user
 */
export const verifySignupEmailOtp = async (
  email: string,
  enteredCode: string
): Promise<{ success: boolean; message: string }> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = enteredCode.trim().replace(/\D/g, '');

  if (!cleanCode || cleanCode.length !== 6) {
    return {
      success: false,
      message: 'Please enter the complete 6-digit verification code.',
    };
  }

  const record = otpStore.get(cleanEmail);
  const now = Date.now();

  // Check in-memory record
  if (record) {
    if (now > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return {
        success: false,
        message: 'This verification code has expired. Please request a new code.',
      };
    }

    if (record.attempts >= 5) {
      otpStore.delete(cleanEmail);
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.',
      };
    }

    if (record.code === cleanCode) {
      // Success! Remove from pending store
      otpStore.delete(cleanEmail);

      return {
        success: true,
        message: 'Email successfully verified!',
      };
    } else {
      record.attempts += 1;
      const remainingAttempts = 5 - record.attempts;
      return {
        success: false,
        message: `Incorrect verification code. ${remainingAttempts} attempts remaining.`,
      };
    }
  }

  return {
    success: false,
    message: 'Invalid verification code. Please check your email and try again.',
  };
};

/**
 * Retrieve the active OTP for an email (for on-screen demo convenience preview)
 */
export const getActiveOtpForEmail = (email: string): PendingOtpData | null => {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return null;
  }
  return record;
};
