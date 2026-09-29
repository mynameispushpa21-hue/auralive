import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Gem, Shield, Star, Award } from 'lucide-react';
import { VIPLevelId, UserProfile } from '../../types';
import { useAppState } from '../../services/stateStore';

export interface VIPBadgeProps {
  /** User UUID to fetch live subscription status from 'profiles' table */
  userId?: string;
  /** Full UserProfile object if already available in context */
  user?: UserProfile | null;
  /** Direct VIP tier override */
  vipTier?: VIPLevelId | string;
  /** Avatar image URL to wrap with VIP styling */
  avatarUrl?: string;
  /** Child avatar component if not using raw avatarUrl */
  children?: React.ReactNode;
  /** Component display mode */
  variant?: 'avatar' | 'badge-only' | 'crown-only';
  /** Size scale for avatar and badge */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Whether to show numeric level tag (e.g. Lv. 5) */
  showLevel?: boolean;
  /** Numeric level to display */
  level?: number;
  /** Whether to render VIP pill/icon badge */
  showBadge?: boolean;
  /** Enable subtle glow & shimmer animations on high tiers */
  animate?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Additional CSS class names */
  className?: string;
  /** Custom fallback text or initial */
  fallbackName?: string;
}

interface TierVisualConfig {
  tierName: string;
  ringClass: string;
  glowClass: string;
  auraGradient: string;
  badgeGradient: string;
  badgeBorder: string;
  badgeText: string;
  badgeIcon: React.ReactNode;
  crownColor: string;
  particleGlow: string;
}

const TIER_CONFIGS: Record<string, TierVisualConfig> = {
  vip_0: {
    tierName: 'Standard',
    ringClass: 'ring-1 ring-slate-700/80',
    glowClass: '',
    auraGradient: '',
    badgeGradient: 'bg-slate-800/80',
    badgeBorder: 'border-slate-700',
    badgeText: 'text-slate-400',
    badgeIcon: null,
    crownColor: '',
    particleGlow: '',
  },
  vip_1: {
    tierName: 'VIP 1',
    ringClass: 'ring-2 ring-amber-600 shadow-md shadow-amber-900/40',
    glowClass: 'shadow-[0_0_10px_rgba(217,119,6,0.25)]',
    auraGradient: 'from-amber-600/20 to-transparent',
    badgeGradient: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700',
    badgeBorder: 'border-amber-400/50',
    badgeText: 'text-amber-100',
    badgeIcon: <Award className="w-3 h-3 text-amber-300 shrink-0" />,
    crownColor: 'text-amber-500 fill-amber-500/20',
    particleGlow: 'bg-amber-500/30',
  },
  vip_2: {
    tierName: 'VIP 2',
    ringClass: 'ring-2 ring-slate-200 shadow-lg shadow-cyan-400/30',
    glowClass: 'shadow-[0_0_14px_rgba(6,182,212,0.35)]',
    auraGradient: 'from-cyan-400/20 via-slate-300/10 to-transparent',
    badgeGradient: 'bg-gradient-to-r from-slate-600 via-cyan-700 to-slate-600',
    badgeBorder: 'border-cyan-300/50',
    badgeText: 'text-cyan-100',
    badgeIcon: <Shield className="w-3 h-3 text-cyan-300 shrink-0" />,
    crownColor: 'text-cyan-300 fill-cyan-400/20',
    particleGlow: 'bg-cyan-400/30',
  },
  vip_3: {
    tierName: 'VIP 3',
    ringClass: 'ring-2 ring-amber-400 shadow-xl shadow-amber-400/50',
    glowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.5)]',
    auraGradient: 'from-amber-400/30 via-yellow-500/15 to-transparent',
    badgeGradient: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-slate-950 font-black',
    badgeIcon: <Crown className="w-3 h-3 text-slate-950 fill-slate-950 shrink-0" />,
    crownColor: 'text-amber-300 fill-amber-400 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]',
    particleGlow: 'bg-amber-400/40',
  },
  vip_4: {
    tierName: 'VIP 4',
    ringClass: 'ring-2 ring-fuchsia-500 shadow-xl shadow-fuchsia-500/60',
    glowClass: 'shadow-[0_0_22px_rgba(217,70,239,0.6)]',
    auraGradient: 'from-violet-600/30 via-fuchsia-600/25 to-pink-600/10',
    badgeGradient: 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-600',
    badgeBorder: 'border-fuchsia-300/80',
    badgeText: 'text-white font-black',
    badgeIcon: <Gem className="w-3 h-3 text-white fill-white/30 shrink-0" />,
    crownColor: 'text-fuchsia-300 fill-fuchsia-400 filter drop-shadow-[0_0_8px_rgba(217,70,239,0.9)]',
    particleGlow: 'bg-fuchsia-500/50',
  },
  vip_5: {
    tierName: 'VIP 5',
    ringClass: 'ring-2 ring-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.8)]',
    glowClass: 'shadow-[0_0_28px_rgba(6,182,212,0.7)]',
    auraGradient: 'from-cyan-400/35 via-indigo-600/30 to-fuchsia-500/25',
    badgeGradient: 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500',
    badgeBorder: 'border-cyan-200',
    badgeText: 'text-white font-black',
    badgeIcon: <Sparkles className="w-3 h-3 text-yellow-200 fill-yellow-200 shrink-0" />,
    crownColor: 'text-cyan-200 fill-cyan-300 filter drop-shadow-[0_0_10px_rgba(6,182,212,1)]',
    particleGlow: 'bg-cyan-400/60',
  },
};

const SIZE_MAP = {
  xs: {
    container: 'w-7 h-7',
    avatar: 'w-7 h-7 text-[10px]',
    badge: 'text-[8px] px-1 py-0.2 gap-0.5 -bottom-1',
    level: 'text-[7px] px-1 py-0 -bottom-1 -left-1',
    crown: 'w-3 h-3 -top-2',
    iconSize: 'w-2 h-2',
  },
  sm: {
    container: 'w-9 h-9',
    avatar: 'w-9 h-9 text-xs',
    badge: 'text-[9px] px-1.5 py-0.5 gap-1 -bottom-1.5',
    level: 'text-[8px] px-1 py-0 -bottom-1 -left-1',
    crown: 'w-3.5 h-3.5 -top-2.5',
    iconSize: 'w-2.5 h-2.5',
  },
  md: {
    container: 'w-12 h-12',
    avatar: 'w-12 h-12 text-sm',
    badge: 'text-[10px] px-1.5 py-0.5 gap-1 -bottom-2',
    level: 'text-[9px] px-1.5 py-0.2 -bottom-1.5 -left-1.5',
    crown: 'w-4 h-4 -top-3',
    iconSize: 'w-3 h-3',
  },
  lg: {
    container: 'w-16 h-16',
    avatar: 'w-16 h-16 text-base',
    badge: 'text-xs px-2 py-0.5 gap-1 -bottom-2.5',
    level: 'text-[10px] px-2 py-0.5 -bottom-2 -left-2',
    crown: 'w-5 h-5 -top-3.5',
    iconSize: 'w-3.5 h-3.5',
  },
  xl: {
    container: 'w-20 h-20',
    avatar: 'w-20 h-20 text-lg',
    badge: 'text-xs px-2.5 py-0.5 gap-1.5 -bottom-3',
    level: 'text-[11px] px-2 py-0.5 -bottom-2.5 -left-2.5',
    crown: 'w-6 h-6 -top-4',
    iconSize: 'w-4 h-4',
  },
  '2xl': {
    container: 'w-24 h-24',
    avatar: 'w-24 h-24 text-xl',
    badge: 'text-sm px-3 py-1 gap-1.5 -bottom-3.5',
    level: 'text-xs px-2.5 py-0.5 -bottom-3 -left-3',
    crown: 'w-7 h-7 -top-5',
    iconSize: 'w-4.5 h-4.5',
  },
};

export const VIPBadge: React.FC<VIPBadgeProps> = ({
  userId,
  user,
  vipTier,
  avatarUrl,
  children,
  variant = 'avatar',
  size = 'md',
  showLevel = false,
  level: explicitLevel,
  showBadge = true,
  animate = true,
  onClick,
  className = '',
  fallbackName = 'User',
}) => {
  const { currentUser, allUsers } = useAppState();

  // Resolved user states
  const [resolvedTier, setResolvedTier] = useState<string>(() => {
    if (vipTier) return vipTier;
    if (user?.vipTier) return user.vipTier;
    if (userId === currentUser?.id) return currentUser.vipTier;
    const match = allUsers?.find((u) => u.id === userId);
    return match?.vipTier || 'vip_0';
  });

  const [resolvedLevel, setResolvedLevel] = useState<number>(() => {
    if (explicitLevel !== undefined) return explicitLevel;
    if (user?.level !== undefined) return user.level;
    if (userId === currentUser?.id) return currentUser.level;
    const match = allUsers?.find((u) => u.id === userId);
    return match?.level || 1;
  });

  const [resolvedAvatar, setResolvedAvatar] = useState<string | undefined>(() => {
    if (avatarUrl) return avatarUrl;
    if (user?.avatar) return user.avatar;
    if (userId === currentUser?.id) return currentUser.avatar;
    const match = allUsers?.find((u) => u.id === userId);
    return match?.avatar;
  });

  const [isSubscriptionActive, setIsSubscriptionActive] = useState<boolean>(true);

  // Sync VIP subscription status from app context
  useEffect(() => {
    let isMounted = true;

    // Direct override takes precedence
    if (vipTier) {
      setResolvedTier(vipTier);
      return;
    }

    // If matching currentUser, synchronize dynamically with state
    if (userId && currentUser && userId === currentUser.id) {
      setResolvedTier(currentUser.vipTier || 'vip_0');
      setResolvedLevel(currentUser.level || 1);
      if (!avatarUrl && currentUser.avatar) {
        setResolvedAvatar(currentUser.avatar);
      }
      return;
    }

    // If userId is provided, query local users for up-to-date VIP status
    if (userId) {
      const match = allUsers?.find((u) => u.id === userId);
      if (match) {
        setResolvedTier(match.vipTier || 'vip_0');
        setIsSubscriptionActive(true);
        if (match.level !== undefined && explicitLevel === undefined) {
          setResolvedLevel(match.level);
        }
        if (match.avatar && !avatarUrl) {
          setResolvedAvatar(match.avatar);
        }
      }
    } else if (user) {
      setResolvedTier(user.vipTier || 'vip_0');
      if (user.level !== undefined && explicitLevel === undefined) {
        setResolvedLevel(user.level);
      }
      if (user.avatar && !avatarUrl) {
        setResolvedAvatar(user.avatar);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [userId, user, vipTier, currentUser?.vipTier, currentUser?.avatar, currentUser?.level, explicitLevel, avatarUrl]);

  const tierKey = resolvedTier in TIER_CONFIGS ? resolvedTier : 'vip_0';
  const config = TIER_CONFIGS[tierKey];
  const sizeStyles = SIZE_MAP[size];
  const isVIP = tierKey !== 'vip_0' && isSubscriptionActive;

  // Standalone Badge Mode (Pill only)
  if (variant === 'badge-only') {
    if (!isVIP) return null;
    return (
      <span
        onClick={onClick}
        title={`${config.tierName} Prestige Member`}
        className={`inline-flex items-center rounded-full border shadow-sm select-none ${config.badgeGradient} ${config.badgeBorder} ${config.badgeText} ${sizeStyles.badge} ${
          onClick ? 'cursor-pointer hover:opacity-90 hover:scale-105 transition-all' : ''
        } ${className}`}
      >
        {config.badgeIcon}
        <span className="font-extrabold tracking-tight">{config.tierName}</span>
      </span>
    );
  }

  // Crown-only Mode
  if (variant === 'crown-only') {
    if (!isVIP || !config.crownColor) return null;
    return (
      <span
        onClick={onClick}
        title={`${config.tierName} Crown`}
        className={`inline-block ${config.crownColor} ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${className}`}
      >
        <Crown className={sizeStyles.crown} />
      </span>
    );
  }

  // Full Avatar Mode with VIP Border, Glow, Crown & Level Badge
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeStyles.container} ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* Background Aura for High Tiers (VIP 3+) */}
      {isVIP && config.auraGradient && (
        <div
          className={`absolute -inset-1 rounded-full bg-gradient-to-tr ${config.auraGradient} blur-sm pointer-events-none ${
            animate ? 'animate-pulse' : ''
          }`}
        />
      )}

      {/* Rotating Prismatic Outer Border for VIP 5 (Monarch) */}
      {isVIP && tierKey === 'vip_5' && animate && (
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-300 animate-spin opacity-80 blur-[1px] pointer-events-none" />
      )}

      {/* Floating Crown on Top for VIP 3, 4, 5 */}
      {isVIP && ['vip_3', 'vip_4', 'vip_5'].includes(tierKey) && (
        <div className={`absolute z-20 flex items-center justify-center pointer-events-none ${sizeStyles.crown} -top-2`}>
          <Crown className={`${sizeStyles.iconSize} ${config.crownColor} ${animate ? 'animate-bounce' : ''}`} />
        </div>
      )}

      {/* Avatar Image or Children */}
      <div
        className={`relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900 transition-all ${
          config.ringClass
        } ${config.glowClass} ${onClick ? 'group-hover:scale-105' : ''}`}
      >
        {children ? (
          children
        ) : resolvedAvatar ? (
          <img
            src={resolvedAvatar}
            alt={fallbackName}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            onError={(e) => {
              // Fallback to initials if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="font-black text-slate-300">
            {fallbackName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Level Tag (Bottom Left) */}
      {showLevel && (
        <span
          className={`absolute z-20 rounded-full font-black text-white bg-slate-900/90 border border-slate-700 shadow-md ${sizeStyles.level}`}
        >
          Lv.{resolvedLevel}
        </span>
      )}

      {/* VIP Badge Pill (Bottom Center / Right) */}
      {showBadge && isVIP && (
        <span
          title={`${config.tierName} Prestige Member`}
          className={`absolute z-20 flex items-center rounded-full font-black border shadow-lg ${config.badgeGradient} ${config.badgeBorder} ${config.badgeText} ${sizeStyles.badge} ${
            animate && tierKey === 'vip_5' ? 'animate-pulse' : ''
          }`}
        >
          {config.badgeIcon}
          <span className="tracking-tighter">{config.tierName.replace('VIP ', 'V')}</span>
        </span>
      )}
    </div>
  );
};
