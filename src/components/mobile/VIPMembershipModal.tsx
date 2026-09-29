import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  Shield,
  Star,
  X,
  CreditCard,
  Coins,
  Smartphone,
  ChevronRight,
  Flame,
  Award,
  Gem,
  Volume2,
  Calendar,
  Lock,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { VIPLevelId, VIPTier } from '../../types';
import { VIPBadge } from '../common/VIPBadge';
import { audioEngine } from '../../services/audioEngine';

export interface VIPMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTierId?: VIPLevelId;
  onOpenCoinStore?: () => void;
}

type SubscriptionDuration = 1 | 3 | 12;
type PaymentOption = 'coins' | 'card' | 'store' | 'demo';
type ModalTab = 'tiers' | 'comparison' | 'status';

export const VIPMembershipModal: React.FC<VIPMembershipModalProps> = ({
  isOpen,
  onClose,
  initialTierId = 'vip_3',
  onOpenCoinStore,
}) => {
  const {
    currentUser,
    vipTiers,
    subscribeVIP,
    cancelVIPSubscription,
  } = useAppState();

  // Primary selected tier (defaults to Gold 'vip_3')
  const [selectedTierId, setSelectedTierId] = useState<VIPLevelId>(initialTierId);
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(1);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('coins');
  const [activeTab, setActiveTab] = useState<ModalTab>('tiers');

  // Interactive preview state
  const [isPlayingFxPreview, setIsPlayingFxPreview] = useState(false);
  const [fxPreviewText, setFxPreviewText] = useState<string | null>(null);

  // Simulated subscription flow stages: 'idle' -> 'processing' -> 'success'
  const [flowStage, setFlowStage] = useState<'idle' | 'processing' | 'success'>('idle');
  const [processingStep, setProcessingStep] = useState<string>('Verifying membership request...');
  const [feedbackNotice, setFeedbackNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (initialTierId && ['vip_3', 'vip_4', 'vip_5'].includes(initialTierId)) {
        setSelectedTierId(initialTierId);
      } else if (currentUser.vipTier !== 'vip_0') {
        setSelectedTierId(currentUser.vipTier);
      } else {
        setSelectedTierId('vip_3'); // default to Gold VIP
      }
      setFlowStage('idle');
      setFeedbackNotice(null);
      setIsPlayingFxPreview(false);
    }
  }, [isOpen, initialTierId, currentUser.vipTier]);

  if (!isOpen) return null;

  // Marquee highlighted tiers requested: Gold, Platinum, Diamond
  const featuredTierIds: VIPLevelId[] = ['vip_3', 'vip_4', 'vip_5'];
  const featuredTiers = vipTiers.filter((t) => featuredTierIds.includes(t.id));
  const selectedTier =
    vipTiers.find((t) => t.id === selectedTierId) ||
    vipTiers.find((t) => t.id === 'vip_3') ||
    vipTiers[0];

  // Pricing calculations
  const durationMultiplier = selectedDuration;
  const discountMultiplier = selectedDuration === 3 ? 0.9 : selectedDuration === 12 ? 0.75 : 1;
  const totalCoinsRequired = Math.round(selectedTier.monthlyCoinPrice * durationMultiplier * discountMultiplier);
  const rawBaseCoins = selectedTier.monthlyCoinPrice * durationMultiplier;
  const coinsSaved = rawBaseCoins - totalCoinsRequired;

  // Simulated USD estimates
  const baseUsd = selectedTier.id === 'vip_3' ? 9.99 : selectedTier.id === 'vip_4' ? 24.99 : 59.99;
  const totalUsd = Number((baseUsd * durationMultiplier * discountMultiplier).toFixed(2));

  const hasEnoughCoins = currentUser.coins >= totalCoinsRequired;

  // Preview Entrance Visual FX simulation
  const handlePreviewEntranceFx = () => {
    setIsPlayingFxPreview(true);
    setFxPreviewText(`✨ ${selectedTier.entryAnimation} - ${currentUser.displayName} enters the room!`);
    audioEngine.playSoundEffect('fanfare');

    setTimeout(() => {
      setIsPlayingFxPreview(false);
      setFxPreviewText(null);
    }, 3500);
  };

  // Execute Simulated Subscription Flow
  const handleStartSubscription = () => {
    setFeedbackNotice(null);
    setFlowStage('processing');
    setProcessingStep('Connecting to Aura VIP billing server...');

    setTimeout(() => {
      setProcessingStep('Authorizing credentials & allocating VIP seat token...');
    }, 600);

    setTimeout(() => {
      setProcessingStep(`Minting ${selectedTier.name} digital credentials...`);
    }, 1200);

    setTimeout(() => {
      const res = subscribeVIP(selectedTier.id, selectedDuration, paymentOption);
      if (res.success) {
        setFlowStage('success');
      } else {
        setFlowStage('idle');
        setFeedbackNotice(res);
      }
    }, 1800);
  };

  // Helper for current VIP expiration status
  const isCurrentVip = currentUser.vipTier !== 'vip_0';
  const expirationDateStr = currentUser.vipExpiresAt
    ? new Date(currentUser.vipExpiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-[#0f0f15] border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[92vh] text-slate-100 overflow-hidden relative"
      >
        {/* Top Glow Ambient Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/20 via-violet-600/10 to-transparent blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-5 py-4 border-b border-[#232332] flex items-center justify-between bg-gradient-to-r from-[#181824] via-[#14141e] to-[#181824]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-lg shadow-amber-500/25">
              <Crown className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-display tracking-tight">VIP Membership</h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Prestige Club
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Current status:{' '}
                <strong className={isCurrentVip ? 'text-amber-300 font-bold' : 'text-slate-300 font-medium'}>
                  {currentUser.vipTier === 'vip_0'
                    ? 'Standard Guest'
                    : vipTiers.find((t) => t.id === currentUser.vipTier)?.name || currentUser.vipTier.toUpperCase()}
                </strong>
                {expirationDateStr && <span className="text-slate-400 ml-1.5 font-normal">· Renews {expirationDateStr}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Coin Balance */}
            <button
              onClick={() => {
                if (onOpenCoinStore) {
                  onClose();
                  onOpenCoinStore();
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181824] border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-[#202030] transition-colors"
              title="Coin Balance · Tap to recharge"
            >
              <span>🪙 {currentUser.coins.toLocaleString()}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#1a1a26] hover:bg-[#252538] text-slate-400 hover:text-white transition-colors"
              aria-label="Close VIP Membership modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-[#232332] flex items-center gap-2 bg-[#12121a]">
          <button
            onClick={() => setActiveTab('tiers')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tiers'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Select Tier & Subscribe</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tier Benefits Matrix</span>
          </button>

          {isCurrentVip && (
            <button
              onClick={() => setActiveTab('status')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'status'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>My Active VIP</span>
            </button>
          )}
        </div>

        {/* Error or Alert Notice */}
        {feedbackNotice && (
          <div
            className={`mx-5 mt-3 p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              feedbackNotice.success
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedbackNotice.message}</span>
          </div>
        )}

        {/* Dynamic Entrance FX Preview Notification Banner */}
        <AnimatePresence>
          {isPlayingFxPreview && fxPreviewText && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className="mx-5 mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-violet-600/30 to-pink-500/25 border border-amber-400/60 text-white text-xs font-black shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>{fxPreviewText}</span>
              </div>
              <span className="text-[10px] text-amber-300 uppercase tracking-widest font-extrabold">LIVE FX</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body Container */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* STAGE 1: Tiers & Subscribe Flow */}
          {activeTab === 'tiers' && flowStage === 'idle' && (
            <>
              {/* Highlighted Tiers Carousel / Grid (Gold, Platinum, Diamond) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Choose Your Prestige Tier
                  </h3>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    Gold · Platinum · Diamond
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {featuredTiers.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    const isTierGold = tier.id === 'vip_3';
                    const isTierPlatinum = tier.id === 'vip_4';
                    const isTierDiamond = tier.id === 'vip_5';

                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          setSelectedTierId(tier.id);
                          setFeedbackNotice(null);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                          isSelected
                            ? isTierGold
                              ? 'bg-gradient-to-b from-amber-950/70 via-[#181822] to-[#121217] border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]'
                              : isTierPlatinum
                              ? 'bg-gradient-to-b from-cyan-950/70 via-[#181822] to-[#121217] border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                              : 'bg-gradient-to-b from-pink-950/70 via-[#181822] to-[#121217] border-pink-400 shadow-xl shadow-pink-500/20 scale-[1.02]'
                            : 'bg-[#14141e] border-[#252538] hover:border-slate-500/50 hover:bg-[#181825]'
                        }`}
                      >
                        {/* Top Badge Tag */}
                        {isTierPlatinum && (
                          <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                            Most Popular
                          </div>
                        )}
                        {isTierDiamond && (
                          <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                            Ultimate King
                          </div>
                        )}
                        {isTierGold && (
                          <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                            Best Value
                          </div>
                        )}

                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl">{tier.badgeUrl}</span>
                          <div>
                            <h4
                              className={`text-sm font-black ${
                                isTierGold
                                  ? 'text-amber-300'
                                  : isTierPlatinum
                                  ? 'text-cyan-300'
                                  : 'text-pink-300'
                              }`}
                            >
                              {tier.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 block font-medium">
                              Level {tier.level} Club
                            </span>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Gift Discount:</span>
                            <strong className="text-amber-300 font-bold">
                              {tier.giftDiscountPercent}% OFF
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Entrance FX:</span>
                            <span className="text-slate-200 font-semibold truncate max-w-[100px]">
                              {tier.entryAnimation.split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Price footer */}
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs font-black text-white">
                            {tier.monthlyCoinPrice.toLocaleString()} 🪙
                          </span>
                          <span className="text-[10px] text-slate-400">
                            / 30 days
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Tier Live Preview & Spotlight Card */}
              <div
                className={`p-4 rounded-3xl border shadow-lg relative overflow-hidden transition-all ${
                  selectedTier.id === 'vip_3'
                    ? 'bg-gradient-to-br from-amber-950/40 via-[#14141e] to-[#121217] border-amber-400/40 shadow-amber-500/10'
                    : selectedTier.id === 'vip_4'
                    ? 'bg-gradient-to-br from-cyan-950/40 via-[#14141e] to-[#121217] border-cyan-400/40 shadow-cyan-500/10'
                    : 'bg-gradient-to-br from-pink-950/40 via-[#14141e] to-[#121217] border-pink-400/40 shadow-pink-500/10'
                }`}
              >
                {/* Header Preview Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    {/* Live Avatar Preview with VIP Badge styling */}
                    <div className="relative">
                      <VIPBadge
                        user={currentUser}
                        vipTier={selectedTier.id}
                        avatarUrl={currentUser.avatar}
                        size="lg"
                        showBadge
                        animate
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">Previewing:</span>
                        <h4 className="text-base font-extrabold text-white font-display">
                          {selectedTier.name}
                        </h4>
                      </div>
                      <p className="text-xs text-amber-300 font-semibold mt-0.5">
                        {selectedTier.giftDiscountPercent}% Gift Coin Discount on all gifts
                      </p>
                    </div>
                  </div>

                  {/* Interactive Entrance Sound & Animation Preview Button */}
                  <button
                    onClick={handlePreviewEntranceFx}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1d1d2b] hover:bg-[#252538] border border-white/10 text-xs font-bold text-violet-300 hover:text-white transition-all active:scale-95"
                    title="Simulate entering a room with this VIP effect"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Room Entrance FX</span>
                  </button>
                </div>

                {/* Unlocked Privileges Checklist */}
                <div className="mt-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Exclusive Tier Privileges:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedTier.perks.map((perk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[#0f0f16]/70 border border-white/5 text-slate-200"
                      >
                        <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Tier Highlights */}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Entrance Visual FX:</span>
                    <strong className="text-white">{selectedTier.entryAnimation}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Daily Gift Bonus Limit:</span>
                    <strong className="text-white">
                      +{selectedTier.maxDailyGiftLimitBonus.toLocaleString()} 🪙
                    </strong>
                  </div>
                </div>
              </div>

              {/* STEP 1: Duration Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step 1: Choose Subscription Duration
                  </label>
                  {selectedDuration > 1 && (
                    <span className="text-xs text-emerald-400 font-bold">
                      Saved {coinsSaved.toLocaleString()} Coins ({selectedDuration === 3 ? '10%' : '25%'} Bonus)!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* 1 Month */}
                  <button
                    type="button"
                    onClick={() => setSelectedDuration(1)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                      selectedDuration === 1
                        ? 'bg-[#1f1f2e] border-amber-400 text-white shadow-md'
                        : 'bg-[#14141e] border-[#252538] text-slate-400 hover:text-slate-200 hover:bg-[#181825]'
                    }`}
                  >
                    <span className="text-xs font-black">1 Month</span>
                    <span className="text-[11px] text-amber-300 font-bold mt-0.5">
                      {selectedTier.monthlyCoinPrice.toLocaleString()} 🪙
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Standard Rate</span>
                  </button>

                  {/* 3 Months */}
                  <button
                    type="button"
                    onClick={() => setSelectedDuration(3)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all relative ${
                      selectedDuration === 3
                        ? 'bg-[#1f1f2e] border-amber-400 text-white shadow-md'
                        : 'bg-[#14141e] border-[#252538] text-slate-400 hover:text-slate-200 hover:bg-[#181825]'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">
                      -10%
                    </span>
                    <span className="text-xs font-black">3 Months</span>
                    <span className="text-[11px] text-amber-300 font-bold mt-0.5">
                      {Math.round(selectedTier.monthlyCoinPrice * 3 * 0.9).toLocaleString()} 🪙
                    </span>
                    <span className="text-[9px] text-emerald-400 mt-0.5">Save 10%</span>
                  </button>

                  {/* 12 Months */}
                  <button
                    type="button"
                    onClick={() => setSelectedDuration(12)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all relative ${
                      selectedDuration === 12
                        ? 'bg-[#1f1f2e] border-amber-400 text-white shadow-md'
                        : 'bg-[#14141e] border-[#252538] text-slate-400 hover:text-slate-200 hover:bg-[#181825]'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px]">
                      -25% + Bonus
                    </span>
                    <span className="text-xs font-black">12 Months (Annual)</span>
                    <span className="text-[11px] text-amber-300 font-bold mt-0.5">
                      {Math.round(selectedTier.monthlyCoinPrice * 12 * 0.75).toLocaleString()} 🪙
                    </span>
                    <span className="text-[9px] text-amber-300 mt-0.5">+5,000 Free Coins</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: Simulated Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step 2: Choose Payment & Subscription Method
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Aura Coins */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption('coins')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                      paymentOption === 'coins'
                        ? 'bg-[#1f1f2e] border-amber-400 text-amber-300 shadow-md'
                        : 'bg-[#14141e] border-[#252538] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span className="text-xs font-bold">Aura Coins</span>
                    <span className="text-[10px] text-slate-400">{currentUser.coins.toLocaleString()} bal</span>
                  </button>

                  {/* Credit Card Simulated */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption('card')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                      paymentOption === 'card'
                        ? 'bg-[#1f1f2e] border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-[#14141e] border-[#252538] text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs font-bold">Card (${totalUsd})</span>
                    <span className="text-[10px] text-slate-400">•••• 4242</span>
                  </button>

                  {/* App Store / Google Play Simulated */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption('store')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                      paymentOption === 'store'
                        ? 'bg-[#1f1f2e] border-violet-400 text-violet-300 shadow-md'
                        : 'bg-[#14141e] border-[#252538] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs font-bold">In-App Store</span>
                    <span className="text-[10px] text-slate-400">Google / Apple</span>
                  </button>

                  {/* Instant 1-Click Demo */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption('demo')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                      paymentOption === 'demo'
                        ? 'bg-[#1f1f2e] border-pink-400 text-pink-300 shadow-md'
                        : 'bg-[#14141e] border-[#252538] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold">Instant Demo</span>
                    <span className="text-[10px] text-emerald-400">Free 1-Click</span>
                  </button>
                </div>
              </div>

              {/* Insufficient coins warning if coins selected */}
              {paymentOption === 'coins' && !hasEnoughCoins && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      You need <strong>{totalCoinsRequired.toLocaleString()} coins</strong> (Short:{' '}
                      {(totalCoinsRequired - currentUser.coins).toLocaleString()}).
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPaymentOption('card')}
                      className="px-2.5 py-1 rounded-lg bg-[#1a1a28] hover:bg-[#252538] text-[11px] font-bold text-cyan-300 border border-cyan-400/30"
                    >
                      Use Card
                    </button>
                    {onOpenCoinStore && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCoinStore();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px]"
                      >
                        Top Up
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmation Summary & Subscribe Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartSubscription}
                  disabled={paymentOption === 'coins' && !hasEnoughCoins}
                  className={`w-full py-3.5 rounded-2xl font-display font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                    paymentOption !== 'coins' || hasEnoughCoins
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white hover:brightness-110 shadow-amber-500/25 active:scale-98 cursor-pointer'
                      : 'bg-[#181822] text-slate-500 border border-[#252538] cursor-not-allowed'
                  }`}
                >
                  <Crown className="w-4 h-4 fill-current" />
                  <span>
                    Confirm & Subscribe to {selectedTier.name} (
                    {paymentOption === 'coins'
                      ? `${totalCoinsRequired.toLocaleString()} 🪙`
                      : paymentOption === 'card'
                      ? `$${totalUsd} USD`
                      : paymentOption === 'store'
                      ? 'App Store'
                      : 'Free Demo'}
                    )
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[10px] text-slate-500 mt-2">
                  Simulated subscription flow · Safe demo transaction · Auto-renews in {selectedDuration * 30} days · Cancel anytime
                </p>
              </div>
            </>
          )}

          {/* STAGE 2: Processing Flow Animation */}
          {flowStage === 'processing' && (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
                <Crown className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-amber-400/20" />
              </div>

              <div>
                <h3 className="text-base font-black text-white font-display">Processing VIP Subscription</h3>
                <p className="text-xs text-amber-300 font-semibold mt-1 animate-pulse">
                  {processingStep}
                </p>
              </div>

              <div className="p-3 max-w-sm rounded-xl bg-[#14141e] border border-white/5 text-[11px] text-slate-400">
                Granting priority mic privileges, unlocking custom frames, and applying {selectedTier.giftDiscountPercent}% discount...
              </div>
            </div>
          )}

          {/* STAGE 3: Success Celebration & Digital Membership Card */}
          {flowStage === 'success' && (
            <div className="py-4 space-y-5 text-center">
              {/* Confetti & Fanfare Banner */}
              <div className="space-y-1">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 mb-1">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white font-display">
                  Welcome to {selectedTier.name}!
                </h3>
                <p className="text-xs text-slate-300">
                  Your VIP privileges and status have been activated successfully!
                </p>
              </div>

              {/* Digital VIP Membership Card */}
              <div
                className={`p-5 rounded-3xl border text-left shadow-2xl relative overflow-hidden ${
                  selectedTier.id === 'vip_3'
                    ? 'bg-gradient-to-tr from-amber-950 via-[#181824] to-yellow-950/70 border-amber-400/60 shadow-amber-500/20'
                    : selectedTier.id === 'vip_4'
                    ? 'bg-gradient-to-tr from-cyan-950 via-[#181824] to-blue-950/70 border-cyan-400/60 shadow-cyan-500/20'
                    : 'bg-gradient-to-tr from-pink-950 via-[#181824] to-rose-950/70 border-pink-400/60 shadow-pink-500/20'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">
                      Aura VIP Club Card
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <VIPBadge
                      user={currentUser}
                      vipTier={selectedTier.id}
                      avatarUrl={currentUser.avatar}
                      size="lg"
                      showBadge
                      animate
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">{currentUser.displayName}</h4>
                      <p className="text-xs text-amber-300 font-bold">{selectedTier.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: #{currentUser.numericId || '948201'}
                      </p>
                    </div>
                  </div>

                  <span className="text-4xl">{selectedTier.badgeUrl}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Valid Through:</span>
                    <strong className="text-slate-200">
                      {new Date(Date.now() + selectedDuration * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gift Discount:</span>
                    <strong className="text-amber-300">{selectedTier.giftDiscountPercent}% OFF</strong>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handlePreviewEntranceFx();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#1c1c2a] hover:bg-[#252538] border border-white/10 text-xs font-bold text-violet-300 transition-colors"
                >
                  🔊 Test My Entrance FX
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display font-black text-xs hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
                >
                  Done & Enjoy VIP Perks
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Benefits Comparison Matrix */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Tier Privileges Comparison</h3>
                  <p className="text-xs text-slate-400">Detailed breakdown of Gold, Platinum & Diamond</p>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="rounded-2xl border border-[#252538] overflow-hidden bg-[#12121a]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#181824] border-b border-[#252538] text-[11px] text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Privilege</th>
                      <th className="py-3 px-2 text-amber-300 font-black">🥇 Gold</th>
                      <th className="py-3 px-2 text-cyan-300 font-black">💎 Platinum</th>
                      <th className="py-3 px-2 text-pink-300 font-black">👑 Diamond</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Monthly Price</td>
                      <td className="py-2.5 px-2 font-bold text-white">4,500 🪙</td>
                      <td className="py-2.5 px-2 font-bold text-white">12,000 🪙</td>
                      <td className="py-2.5 px-2 font-bold text-white">30,000 🪙</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Gift Discount</td>
                      <td className="py-2.5 px-2 font-bold text-amber-300">8% OFF</td>
                      <td className="py-2.5 px-2 font-bold text-cyan-300">12% OFF</td>
                      <td className="py-2.5 px-2 font-bold text-pink-300">18% OFF</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Entrance Animation</td>
                      <td className="py-2.5 px-2">Golden Phoenix</td>
                      <td className="py-2.5 px-2">Diamond Supercar</td>
                      <td className="py-2.5 px-2 font-bold text-pink-300">Imperial Dragon</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Avatar Halo & Frame</td>
                      <td className="py-2.5 px-2">Gold Neon Halo</td>
                      <td className="py-2.5 px-2">Platinum Hologram</td>
                      <td className="py-2.5 px-2 font-bold text-pink-300">Mythic Dragon Particle</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Room Mic Access</td>
                      <td className="py-2.5 px-2 text-emerald-400">Priority Mic</td>
                      <td className="py-2.5 px-2 text-emerald-400">Seat Lock Bypass</td>
                      <td className="py-2.5 px-2 font-bold text-pink-300">Full Moderation</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Kick & Mute Immunity</td>
                      <td className="py-2.5 px-2 text-slate-500">—</td>
                      <td className="py-2.5 px-2 text-emerald-400">Against Normal Users</td>
                      <td className="py-2.5 px-2 font-bold text-emerald-400">Complete Immunity</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Global Join Banner</td>
                      <td className="py-2.5 px-2 text-slate-500">—</td>
                      <td className="py-2.5 px-2 text-slate-500">—</td>
                      <td className="py-2.5 px-2 font-bold text-amber-300">Room Broadcast</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">Daily Gift Bonus</td>
                      <td className="py-2.5 px-2">+50,000 🪙</td>
                      <td className="py-2.5 px-2">+150,000 🪙</td>
                      <td className="py-2.5 px-2 font-bold text-pink-300">+500,000 🪙</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-slate-200">VIP Dedicated Concierge</td>
                      <td className="py-2.5 px-2 text-slate-500">—</td>
                      <td className="py-2.5 px-2 text-emerald-400">Included</td>
                      <td className="py-2.5 px-2 font-bold text-emerald-400">Personal Concierge</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Direct action button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('tiers')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 fill-current" />
                  <span>Choose Your Tier & Subscribe</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: My Active VIP & Subscription Management */}
          {activeTab === 'status' && isCurrentVip && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-[#14141e] border border-amber-400/40 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">Active Subscription</h4>
                      <p className="text-xs text-amber-300">
                        {vipTiers.find((t) => t.id === currentUser.vipTier)?.name || 'VIP Member'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0f0f16] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Renews / Expires:</span>
                    <strong className="text-white mt-0.5 block">{expirationDateStr || '30 days remaining'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0f0f16] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Billing Status:</span>
                    <strong className="text-emerald-400 mt-0.5 block">Auto-Renew Active</strong>
                  </div>
                </div>

                {/* Cancel simulation button */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Need to cancel or test standard role?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const res = cancelVIPSubscription();
                      setFeedbackNotice(res);
                      setActiveTab('tiers');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
                  >
                    Simulate Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
