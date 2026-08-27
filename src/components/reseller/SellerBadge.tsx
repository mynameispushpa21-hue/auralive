import React from 'react';
import { ShieldCheck, Sparkles, Gem, Award } from 'lucide-react';
import { UserProfile } from '../../types';

interface SellerBadgeProps {
  user?: UserProfile | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'icon-only' | 'glow';
  showLevel?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const SellerBadge: React.FC<SellerBadgeProps> = ({
  user,
  size = 'sm',
  variant = 'pill',
  showLevel = true,
  onClick,
  className = '',
}) => {
  const isSeller =
    user?.role === 'seller' ||
    user?.role === 'agent' ||
    user?.isSeller ||
    user?.sellerInfo !== undefined;

  if (!isSeller) return null;

  const level = user?.sellerInfo?.verificationLevel || 'gold';
  const discount = user?.sellerInfo?.discountPercentage || 10;

  const levelStyles = {
    gold: {
      bg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      label: 'Verified Seller',
      icon: <Award className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />,
      tag: 'GOLD',
    },
    diamond: {
      bg: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
      border: 'border-cyan-400/40',
      text: 'text-cyan-300',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]',
      label: 'Diamond Reseller',
      icon: <Gem className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />,
      tag: 'DIAMOND',
    },
    master: {
      bg: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
      border: 'border-emerald-400/40',
      text: 'text-emerald-300',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      label: 'Master Agent',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />,
      tag: 'MASTER',
    },
  }[level];

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  if (variant === 'icon-only') {
    return (
      <span
        title={`Verified Reseller (${level.toUpperCase()}) - ${discount}% Coin Discount`}
        onClick={onClick}
        className={`inline-flex items-center justify-center p-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 ${
          onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''
        } ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
      </span>
    );
  }

  return (
    <div
      onClick={onClick}
      title={`Official Verified Reseller - Up to ${discount}% Discount`}
      className={`inline-flex items-center rounded-full font-semibold select-none border backdrop-blur-md transition-all ${
        levelStyles.bg
      } ${levelStyles.border} ${levelStyles.text} ${levelStyles.glow} ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:brightness-125 hover:scale-[1.02] active:scale-[0.98]' : ''
      } ${className}`}
    >
      {levelStyles.icon}
      <span className="tracking-wide font-medium whitespace-nowrap">{levelStyles.label}</span>
      {showLevel && (
        <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded bg-black/40 text-white/90">
          -{discount}%
        </span>
      )}
    </div>
  );
};
