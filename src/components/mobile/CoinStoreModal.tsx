import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Check, CreditCard, ShieldCheck, Zap, X, Sparkles } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { CoinPackage } from '../../types';

interface CoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinStoreModal: React.FC<CoinStoreModalProps> = ({ isOpen, onClose }) => {
  const { coinPackages, currentUser, purchaseCoinPackage, paymentGateways } = useAppState();
  const [selectedPkgId, setSelectedPkgId] = useState<string>(coinPackages[1]?.id || 'pkg_2');

  const enabledGateways = (paymentGateways || []).filter((g) => g.isEnabled);
  const defaultMethodName = enabledGateways[0]?.name || 'Google Play Billing';

  const [paymentMethod, setPaymentMethod] = useState<string>(defaultMethodName);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPkg = coinPackages.find((p) => p.id === selectedPkgId) || coinPackages[0];

  const handleCheckout = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    setSuccessNotice(null);

    // Simulate backend verification & payment processing
    setTimeout(async () => {
      const result = await purchaseCoinPackage(selectedPkg.id, paymentMethod);
      setIsProcessing(false);
      if (result.success) {
        setSuccessNotice(result.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-[#121217] border border-[#232332] rounded-3xl p-5 shadow-2xl flex flex-col text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Coin Recharge Store</h3>
                <p className="text-xs text-slate-400">Current Balance: <span className="text-amber-300 font-bold">{currentUser.coins.toLocaleString()} 🪙</span></p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner */}
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successNotice}</span>
            </motion.div>
          )}

          {/* Coin Package Grid */}
          <div className="grid grid-cols-2 gap-3 my-4">
            {coinPackages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const totalCoins = pkg.coins + pkg.bonusCoins;

              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`relative p-3 rounded-2xl flex flex-col items-center justify-center border transition-all text-left ${
                    isSelected
                      ? 'bg-[#1A1A24] border-violet-500 shadow-lg shadow-violet-500/15 scale-[1.02]'
                      : 'bg-[#121217] border-[#232332] hover:bg-[#1A1A24]'
                  }`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[10px] font-black text-white shadow-xs">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="text-2xl mb-1">🪙</div>
                  <span className="text-base font-extrabold text-white">
                    {pkg.coins.toLocaleString()} <span className="text-xs text-amber-300 font-normal">Coins</span>
                  </span>

                  {pkg.bonusCoins > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                      +{pkg.bonusCoins.toLocaleString()} Free Bonus
                    </span>
                  )}

                  <div className="mt-2 w-full pt-2 border-t border-[#232332] flex items-center justify-between">
                    <span className="text-xs text-slate-400">USD</span>
                    <span className="text-sm font-black text-amber-400">${pkg.priceUsd.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Payment Method Selector */}
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Payment Gateway
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(enabledGateways.length > 0
                ? enabledGateways.slice(0, 6).map((gw) => ({
                    name: gw.name,
                    icon:
                      gw.code === 'google_play'
                        ? '🛒'
                        : gw.code === 'apple_app_store'
                        ? '🍎'
                        : gw.code === 'stripe'
                        ? '💳'
                        : gw.code === 'paypal'
                        ? '🅿️'
                        : gw.code === 'razorpay'
                        ? '🇮🇳'
                        : gw.code === 'crypto_usdt'
                        ? '₮'
                        : '🏛️',
                    desc: gw.isSandbox ? 'Test Sandbox' : gw.category.replace('_', ' '),
                  }))
                : [
                    { name: 'Google Play', icon: '🛒', desc: 'In-app billing' },
                    { name: 'Credit Card', icon: '💳', desc: 'Visa / Mastercard' },
                    { name: 'PayPal', icon: '🅿️', desc: 'Fast checkout' },
                    { name: 'Crypto USDT', icon: '₮', desc: 'Instant Web3' },
                  ]
              ).map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setPaymentMethod(m.name)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                    paymentMethod === m.name
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-xs'
                      : 'bg-[#161620] border-[#232332] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-slate-200 truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Secure Guarantee & Checkout Button */}
          <div className="pt-3 border-t border-[#232332] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                256-Bit SSL Encrypted
              </span>
              <span>Total: <strong className="text-white">${selectedPkg?.priceUsd.toFixed(2)} USD</strong></span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-violet-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying with {paymentMethod}...
                </span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Recharge {(selectedPkg?.coins + selectedPkg?.bonusCoins).toLocaleString()} Coins Now</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
