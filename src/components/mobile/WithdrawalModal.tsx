import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Landmark, ShieldCheck, Check, X, AlertCircle } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, platformConfig, requestHostWithdrawal } = useAppState();
  const [diamondsAmount, setDiamondsAmount] = useState<number>(platformConfig.minimumWithdrawalDiamonds);
  const [method, setMethod] = useState<'bank_transfer' | 'paypal' | 'wise' | 'crypto_usdt'>('paypal');
  const [accountName, setAccountName] = useState(currentUser.displayName);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingOrIban, setRoutingOrIban] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const cashValueUsd = diamondsAmount * platformConfig.diamondCashValueUsd;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!accountName.trim()) {
      setErrorMsg('Account holder name is required.');
      return;
    }

    if (method === 'paypal' || method === 'wise') {
      if (!accountNumber.trim()) {
        setErrorMsg('Valid email or account ID is required.');
        return;
      }
    } else if (method === 'bank_transfer') {
      if (!accountNumber.trim() || !bankName.trim()) {
        setErrorMsg('Bank Name and IBAN/Account Number are required.');
        return;
      }
    } else if (method === 'crypto_usdt') {
      if (!cryptoAddress.trim()) {
        setErrorMsg('USDT (TRC20 / ERC20) wallet address is required.');
        return;
      }
    }

    const res = requestHostWithdrawal(diamondsAmount, method, {
      accountName: accountName.trim(),
      accountNumberOrEmail: accountNumber.trim(),
      bankName: bankName.trim(),
      routingOrIban: routingOrIban.trim(),
      cryptoAddress: cryptoAddress.trim(),
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
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
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Host Payout / Withdrawal</h3>
                <p className="text-xs text-slate-400">Available: <span className="text-violet-300 font-bold">{currentUser.diamonds.toLocaleString()} 💎</span> (~${(currentUser.diamonds * platformConfig.diamondCashValueUsd).toFixed(2)})</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 my-4 text-xs">
            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-300">Diamonds to Cash Out</label>
                <button
                  type="button"
                  onClick={() => setDiamondsAmount(currentUser.diamonds)}
                  className="text-violet-400 hover:underline font-bold"
                >
                  Max All ({currentUser.diamonds.toLocaleString()})
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={platformConfig.minimumWithdrawalDiamonds}
                  max={currentUser.diamonds}
                  value={diamondsAmount}
                  onChange={(e) => setDiamondsAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white text-sm font-bold focus:outline-hidden focus:border-violet-400"
                />
                <div className="absolute right-3 top-2.5 text-xs text-emerald-400 font-bold">
                  ≈ ${cashValueUsd.toFixed(2)} USD
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Min withdrawal: {platformConfig.minimumWithdrawalDiamonds.toLocaleString()} 💎 ($
                {(platformConfig.minimumWithdrawalDiamonds * platformConfig.diamondCashValueUsd).toFixed(2)})
              </p>
            </div>

            {/* Method */}
            <div>
              <label className="font-bold text-slate-300 block mb-1.5">Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏛️' },
                  { id: 'wise', label: 'Wise Transfer', icon: '🌐' },
                  { id: 'crypto_usdt', label: 'USDT (TRC20)', icon: '₮' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id as any)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                      method === m.id
                        ? 'bg-violet-600/20 border-violet-500 text-white'
                        : 'bg-[#161620] border-[#232332] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span className="font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Account Holder Full Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Legal name on file"
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
              />
            </div>

            {(method === 'paypal' || method === 'wise') && (
              <div>
                <label className="font-bold text-slate-300 block mb-1">{method === 'paypal' ? 'PayPal Email' : 'Wise Account Email'}</label>
                <input
                  type="email"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                />
              </div>
            )}

            {method === 'bank_transfer' && (
              <>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. JPMorgan Chase / Barclays"
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">IBAN / Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account Number or IBAN"
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Routing / SWIFT Code</label>
                  <input
                    type="text"
                    value={routingOrIban}
                    onChange={(e) => setRoutingOrIban(e.target.value)}
                    placeholder="SWIFT / BIC"
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-hidden focus:border-violet-400"
                  />
                </div>
              </>
            )}

            {method === 'crypto_usdt' && (
              <div>
                <label className="font-bold text-slate-300 block mb-1">USDT Wallet Address (TRC-20)</label>
                <input
                  type="text"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="T..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-mono text-[11px] focus:outline-hidden focus:border-violet-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={diamondsAmount < platformConfig.minimumWithdrawalDiamonds || currentUser.diamonds < diamondsAmount}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-violet-600/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <Landmark className="w-4 h-4" />
              <span>Confirm Payout of ${cashValueUsd.toFixed(2)} USD</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
