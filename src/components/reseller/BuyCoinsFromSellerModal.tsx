import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Sparkles,
  Coins,
  MessageCircle,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Building,
  Zap,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile, SellerProfile, BuyerCoinRequest } from '../../types';
import { SellerBadge } from './SellerBadge';

interface BuyCoinsFromSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectChat?: (sellerId: string) => void;
  initialSellerId?: string;
}

export const BuyCoinsFromSellerModal: React.FC<BuyCoinsFromSellerModalProps> = ({
  isOpen,
  onClose,
  onOpenDirectChat,
  initialSellerId,
}) => {
  const {
    activeSellers,
    currentUser,
    submitBuyerCoinRequest,
    startConversationWithUser,
    setActiveConversation,
  } = useAppState();

  const [selectedSellerId, setSelectedSellerId] = useState<string>(
    initialSellerId || activeSellers[0]?.id || 'usr_seller_001'
  );
  const [selectedCoins, setSelectedCoins] = useState<number>(10000);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('WhatsApp Direct Chat');
  const [buyerContactInfo, setBuyerContactInfo] = useState<string>(
    currentUser.phone || currentUser.email || `@${currentUser.username}`
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSelectedSeller =
    activeSellers.find((s) => s.id === selectedSellerId) || activeSellers[0];
  const sellerInfo = currentSelectedSeller?.sellerInfo;
  const discountPercent = sellerInfo?.discountPercentage || 12;

  const officialPriceUsd = (selectedCoins * 0.01);
  const discountedPriceUsd = Number((officialPriceUsd * (1 - discountPercent / 100)).toFixed(2));
  const totalSavingsUsd = Number((officialPriceUsd - discountedPriceUsd).toFixed(2));

  const coinPackages = [
    { coins: 5000, label: '5,000' },
    { coins: 10000, label: '10,000', popular: true },
    { coins: 25000, label: '25,000' },
    { coins: 50000, label: '50,000', bestValue: true },
    { coins: 100000, label: '100,000' },
    { coins: 250000, label: '250,000' },
  ];

  const handleSendBuyOrder = async () => {
    if (!currentSelectedSeller) return;
    setIsSubmitting(true);
    setStatusNotice(null);

    try {
      const result = await submitBuyerCoinRequest({
        buyerId: currentUser.id,
        buyerName: currentUser.displayName,
        buyerAvatar: currentUser.avatar,
        buyerNumericId: currentUser.numericId || currentUser.id,
        sellerId: currentSelectedSeller.id,
        coinsRequested: selectedCoins,
        estimatedPriceUsd: discountedPriceUsd,
        paymentMethod: selectedPaymentMethod,
        buyerContact: buyerContactInfo,
      });

      if (result.success) {
        setRequestSubmitted(true);
      } else {
        setStatusNotice(result.message);
      }
    } catch (err: any) {
      setStatusNotice(err?.message || 'Failed to submit buy request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChat = () => {
    if (currentSelectedSeller) {
      const conv = startConversationWithUser(currentSelectedSeller.id);
      setActiveConversation(conv);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl rounded-3xl bg-[#0F0F16] border border-[#26263A] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E2C] bg-gradient-to-r from-amber-500/10 via-[#13131D] to-[#0F0F16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-display">Verified Reseller Network</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  SAVE UP TO 20%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official certified merchants with 24/7 instant escrow delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {requestSubmitted ? (
          /* Order Placed Success View */
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white font-display">Coin Order Dispatched!</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                Your buy request for <strong className="text-amber-300">{selectedCoins.toLocaleString()} Coins</strong> (${discountedPriceUsd.toFixed(2)} USD) has been sent to{' '}
                <strong className="text-white">{currentSelectedSeller?.displayName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#151520] border border-[#28283C] text-left text-xs w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Merchant Response Time</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {sellerInfo?.responseTimeText || '< 2 mins'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Channel</span>
                <span className="font-semibold text-white">{selectedPaymentMethod}</span>
              </div>
              {sellerInfo?.contactWhatsapp && (
                <div className="flex items-center justify-between pt-1 border-t border-[#222232]">
                  <span className="text-slate-400">Merchant WhatsApp</span>
                  <span className="font-mono text-amber-300 font-bold">{sellerInfo.contactWhatsapp}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleOpenChat}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#1C1C2A] border border-[#2E2E44] text-slate-200 font-semibold text-xs hover:bg-[#252538] flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                Open In-App Direct Chat
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Normal Browse & Buy Modal */
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Active Online Resellers Carousel / List */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Choose Official Verified Merchant
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeSellers.map((seller) => {
                  const isSelected = seller.id === selectedSellerId;
                  const sInfo = seller.sellerInfo;
                  return (
                    <div
                      key={seller.id}
                      onClick={() => {
                        setSelectedSellerId(seller.id);
                        if (sInfo?.paymentMethods[0]) {
                          setSelectedPaymentMethod(sInfo.paymentMethods[0].name);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_16px_rgba(245,158,11,0.15)]'
                          : 'bg-[#151520] border-[#252536] hover:bg-[#1A1A28]'
                      }`}
                    >
                      <img
                        src={seller.avatar}
                        alt={seller.displayName}
                        className="w-11 h-11 rounded-2xl object-cover border border-[#303046] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{seller.displayName}</h4>
                          <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded">
                            -{sInfo?.discountPercentage || 12}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {sInfo?.agencyName || 'Global Coin Agency'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {sInfo?.rating || 4.9}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {sInfo?.responseTimeText || '< 2 min'}
                          </span>
                          <span>•</span>
                          <span>{(sInfo?.totalTrades || 1200).toLocaleString()}+ sales</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notice Banner from Selected Reseller */}
            {sellerInfo?.noticeBanner && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{sellerInfo.noticeBanner}</span>
              </div>
            )}

            {/* Select Coin Package */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Coin Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {coinPackages.map((pkg) => {
                  const isSelected = selectedCoins === pkg.coins;
                  const pkgDiscountPrice = (pkg.coins * 0.01 * (1 - discountPercent / 100)).toFixed(2);
                  return (
                    <button
                      key={pkg.coins}
                      type="button"
                      onClick={() => setSelectedCoins(pkg.coins)}
                      className={`p-3 rounded-2xl border text-center relative transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'bg-[#151520] border-[#252536] hover:bg-[#1A1A28]'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-500 text-slate-950 uppercase">
                          Popular
                        </span>
                      )}
                      {pkg.bestValue && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-500 text-slate-950 uppercase">
                          Best Value
                        </span>
                      )}
                      <span className="text-sm font-black text-amber-300 block">🪙 {pkg.label}</span>
                      <span className="text-xs font-bold text-white mt-1 block">${pkgDiscountPrice}</span>
                      <span className="text-[9px] text-slate-400 line-through">
                        ${(pkg.coins * 0.01).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Price Comparison */}
            <div className="p-4 rounded-2xl bg-[#14141E] border border-[#252538] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Coins</span>
                <p className="text-base font-black text-amber-300">+{selectedCoins.toLocaleString()} Coins</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Reseller Discounted Price</span>
                <p className="text-lg font-black text-emerald-400">
                  ${discountedPriceUsd.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400 line-through">
                    ${officialPriceUsd.toFixed(2)}
                  </span>
                </p>
                <span className="text-[10px] text-emerald-300 font-semibold">
                  You save ${totalSavingsUsd.toFixed(2)} ({discountPercent}% Off)
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Payment Method
              </label>
              <div className="space-y-2">
                {sellerInfo?.paymentMethods?.map((pm) => (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPaymentMethod(pm.name)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      selectedPaymentMethod === pm.name
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-[#151520] border-[#252536] text-slate-300 hover:bg-[#1A1A28]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="font-bold block">{pm.name}</span>
                        <span className="text-[11px] text-slate-400">{pm.instructions || pm.accountDetail}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">{pm.accountDetail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="p-4 rounded-2xl bg-[#151522] border border-[#252538] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">Direct Merchant Instant Chat</span>
                <span className="text-[10px] text-slate-400">Escrow Protected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sellerInfo?.contactWhatsapp && (
                  <a
                    href={`https://wa.me/${sellerInfo.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                )}
                {sellerInfo?.contactTelegram && (
                  <a
                    href={`https://t.me/${sellerInfo.contactTelegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Telegram
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-[#202032] border border-[#303048] text-slate-200 text-xs font-bold hover:bg-[#28283E] flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                  In-App Chat
                </button>
              </div>
            </div>

            {/* Submit Buy Order Button */}
            <button
              type="button"
              onClick={handleSendBuyOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                'Alerting Seller...'
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  Order {selectedCoins.toLocaleString()} Coins for ${discountedPriceUsd.toFixed(2)} USD
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
