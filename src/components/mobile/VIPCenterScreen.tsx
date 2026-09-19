import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, Check, Zap, Shield, Heart, Plus, ChevronLeft } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { VIPLevelId } from '../../types';

interface VIPCenterScreenProps {
  onOpenCoinStore: () => void;
  onBack?: () => void;
}

export const VIPCenterScreen: React.FC<VIPCenterScreenProps> = ({ onOpenCoinStore, onBack }) => {
  const { vipTiers, currentUser, subscribeVIP } = useAppState();
  const [selectedVipId, setSelectedVipId] = useState<VIPLevelId>('vip_3');
  const [feedbackNotice, setFeedbackNotice] = useState<{ success: boolean; message: string } | null>(null);

  const selectedTier = vipTiers.find((t) => t.id === selectedVipId) || vipTiers[0];

  const handleSubscribe = () => {
    setFeedbackNotice(null);
    const res = subscribeVIP(selectedTier.id);
    setFeedbackNotice(res);
  };

  return (
    <div id="vip-center-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-transparent">
      {/* Header Banner */}
      <div className="mt-2 p-4 rounded-3xl bg-[#121217] border border-violet-500/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-2xl bg-[#1A1A26] border border-[#232332] text-slate-300 hover:text-white transition-colors"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black text-violet-300 tracking-widest uppercase">VIP Privilege Club</span>
              </div>
              <h2 className="text-xl font-black text-white font-display">Upgrade Your Prestige</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current Status:{' '}
                <strong className="text-amber-300">
                  {currentUser.vipTier === 'vip_0' ? 'Standard Guest' : currentUser.vipTier.toUpperCase()}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCoinStore}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1A1A26] border border-amber-400/40 text-amber-300 text-xs font-bold"
          >
            <span>🪙 {currentUser.coins.toLocaleString()}</span>
            <Plus className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            feedbackNotice.success
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedbackNotice.message}</span>
        </div>
      )}

      {/* VIP Tier Selector Horizontal Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {vipTiers.map((tier) => {
          const isSelected = selectedVipId === tier.id;

          return (
            <button
              key={tier.id}
              onClick={() => {
                setSelectedVipId(tier.id);
                setFeedbackNotice(null);
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-between min-w-[95px] h-32 transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#1A1A28] border-violet-400 shadow-lg shadow-violet-500/20 scale-105'
                  : 'bg-[#121217] border-[#232332] hover:bg-[#161622] opacity-85'
              }`}
            >
              <span className="text-3xl">{tier.badgeUrl}</span>
              <div className="text-center">
                <span className="text-xs font-black text-white block truncate">{tier.name}</span>
                <span className="text-[10px] font-bold text-violet-300 mt-0.5 block">
                  {tier.monthlyCoinPrice.toLocaleString()} 🪙/mo
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected VIP Perks Detail Card */}
      <div className="p-4 rounded-3xl bg-[#121217] border border-[#232332] space-y-3 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{selectedTier.badgeUrl}</span>
            <div>
              <h3 className="text-base font-bold text-white">{selectedTier.name} Privileges</h3>
              <p className="text-xs text-amber-400 font-semibold">{selectedTier.giftDiscountPercent}% Gift Coin Discount</p>
            </div>
          </div>
          <span className="text-sm font-black text-amber-300">{selectedTier.monthlyCoinPrice.toLocaleString()} 🪙 / 30 Days</span>
        </div>

        {/* Perks Checklist */}
        <div className="space-y-2">
          {selectedTier.perks.map((perk, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {/* Entry FX Preview */}
        <div className="pt-2 border-t border-[#232332] flex items-center justify-between text-xs text-slate-400">
          <span>Entrance Visual FX:</span>
          <strong className="text-violet-300">{selectedTier.entryAnimation}</strong>
        </div>

        {/* Subscribe Action */}
        <button
          onClick={handleSubscribe}
          disabled={currentUser.coins < selectedTier.monthlyCoinPrice}
          className={`w-full py-3.5 rounded-2xl font-display font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg mt-2 ${
            currentUser.coins >= selectedTier.monthlyCoinPrice
              ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white hover:brightness-110 shadow-violet-600/25 active:scale-98'
              : 'bg-[#1A1A24] text-slate-500 border border-[#232332] cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Subscribe to {selectedTier.name} ({selectedTier.monthlyCoinPrice.toLocaleString()} 🪙)</span>
        </button>
      </div>
    </div>
  );
};
