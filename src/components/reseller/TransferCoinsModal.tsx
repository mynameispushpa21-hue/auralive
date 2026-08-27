import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Coins,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Percent,
  DollarSign,
  Lock,
  Copy,
  Check,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile, SellerTransaction } from '../../types';

interface TransferCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: UserProfile | null;
  onSuccess?: (tx: SellerTransaction) => void;
}

export const TransferCoinsModal: React.FC<TransferCoinsModalProps> = ({
  isOpen,
  onClose,
  initialRecipient,
  onSuccess,
}) => {
  const {
    currentUser,
    allUsers,
    transferCoinsAsSeller,
    quickUpgradeToDemoSeller,
  } = useAppState();

  const isSeller =
    currentUser.role === 'seller' ||
    currentUser.role === 'agent' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'super_admin' ||
    currentUser.isSeller;

  const [recipientQuery, setRecipientQuery] = useState<string>(
    initialRecipient?.numericId || initialRecipient?.username || ''
  );
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(initialRecipient || null);
  const [amount, setAmount] = useState<number | ''>(5000);
  const [discountPercent, setDiscountPercent] = useState<number>(
    currentUser.sellerInfo?.discountPercentage || 12
  );
  const [transferNote, setTransferNote] = useState<string>('Express Party Room Delivery');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<SellerTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Sync initial recipient if passed
  useEffect(() => {
    if (initialRecipient) {
      setMatchedUser(initialRecipient);
      setRecipientQuery(initialRecipient.numericId || initialRecipient.username);
    }
  }, [initialRecipient]);

  // Real-time recipient lookup
  useEffect(() => {
    const q = recipientQuery.trim().toLowerCase();
    if (!q) {
      setMatchedUser(null);
      return;
    }
    const found = allUsers.find(
      (u) =>
        u.id.toLowerCase() === q ||
        (u.numericId && u.numericId.toLowerCase() === q) ||
        u.username.toLowerCase() === q ||
        u.displayName.toLowerCase() === q
    );
    setMatchedUser(found || null);
  }, [recipientQuery, allUsers]);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const officialRateUsd = numAmount * 0.01;
  const resellerRateUsd = Number((officialRateUsd * (1 - discountPercent / 100)).toFixed(2));
  const userSavingsUsd = Number((officialRateUsd - resellerRateUsd).toFixed(2));

  const coinPresets = [1000, 5000, 10000, 50000, 100000, 250000];

  const handleExecuteTransfer = async () => {
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a valid coin amount.');
      return;
    }
    if (!recipientQuery.trim()) {
      setErrorMessage('Please enter recipient User ID or username.');
      return;
    }
    if (currentUser.coins < numAmount) {
      setErrorMessage(`Insufficient inventory balance. You have ${currentUser.coins.toLocaleString()} coins.`);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await transferCoinsAsSeller({
        sellerId: currentUser.id,
        recipientQuery,
        amount: numAmount,
        discountPercentage: discountPercent,
        note: transferNote,
      });

      if (result.success && result.transaction) {
        setSuccessTx(result.transaction);
        setIsConfirming(false);
        if (onSuccess) onSuccess(result.transaction);
      } else {
        setErrorMessage(result.message);
        setIsConfirming(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Transfer failed. Please try again.');
      setIsConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleResetAndClose = () => {
    setSuccessTx(null);
    setIsConfirming(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg rounded-3xl bg-[#101015] border border-[#262638] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F2E] bg-gradient-to-r from-amber-500/10 via-[#14141C] to-[#101015]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-display">Reseller Direct Transfer</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  OFFICIAL LEDGER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inventory: <strong className="text-amber-300 font-semibold">{currentUser.coins.toLocaleString()} Coins</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Guard for non-sellers */}
        {!isSeller ? (
          <div className="p-6 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Verified Seller Role Required</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Only authenticated agents and verified coin merchants have authorization to mint and transfer wholesale coins.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
              <button
                onClick={() => quickUpgradeToDemoSeller(currentUser.id)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Activate Instant Demo Seller Mode
              </button>
            </div>
          </div>
        ) : successTx ? (
          /* Success Receipt View */
          <div className="p-6 flex flex-col gap-4 overflow-y-auto">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold text-white font-display">Coin Transfer Successful!</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Atomic transaction committed to ledger in <span className="text-emerald-400 font-semibold">18ms</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-[#161622] border border-[#2A2A3E] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#232334]">
                <span className="text-xs text-slate-400">Coins Delivered</span>
                <span className="text-lg font-black text-amber-400 flex items-center gap-1.5">
                  🪙 +{successTx.amount.toLocaleString()} Coins
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Recipient</span>
                <div className="flex items-center gap-2">
                  <img
                    src={successTx.recipientAvatar}
                    alt={successTx.recipientName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold text-white">{successTx.recipientName}</span>
                  <span className="text-slate-400">(@{successTx.recipientNumericId})</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Reseller Price (USD)</span>
                <span className="font-bold text-white">
                  ${successTx.priceUsd.toFixed(2)}{' '}
                  <span className="text-emerald-400 font-normal">(-{successTx.discountAppliedPercent}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-slate-300 font-medium">{successTx.id}</span>
              </div>

              <div className="pt-2 border-t border-[#232334] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Tx Cryptographic Hash:</span>
                <button
                  onClick={() => handleCopyHash(successTx.txHash)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[10px] bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-800/40"
                  title="Click to copy full transaction hash"
                >
                  {successTx.txHash.slice(0, 10)}...{successTx.txHash.slice(-6)}
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  setSuccessTx(null);
                  setAmount(5000);
                  setIsConfirming(false);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#1C1C28] border border-[#2E2E44] text-slate-200 font-semibold text-sm hover:bg-[#252538] transition-colors"
              >
                Send Another Transfer
              </button>
              <button
                onClick={handleResetAndClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Transfer Form */
          <div className="p-6 overflow-y-auto space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Recipient Input & Live Card */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Recipient User ID / Username
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter User ID, Numeric ID (e.g. 894201), or @username"
                  value={recipientQuery}
                  onChange={(e) => {
                    setRecipientQuery(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#161622] border border-[#27273A] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                />
              </div>

              {/* Matched User Live Preview */}
              {matchedUser && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 p-3 rounded-2xl bg-[#171725] border border-emerald-500/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={matchedUser.avatar}
                      alt={matchedUser.displayName}
                      className="w-10 h-10 rounded-2xl object-cover border border-[#33334A]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{matchedUser.displayName}</span>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-400">
                        @{matchedUser.username} • ID: <strong className="text-slate-200">{matchedUser.numericId || matchedUser.id}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Current Balance</span>
                    <p className="text-xs font-bold text-amber-300">{matchedUser.coins.toLocaleString()} 🪙</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Amount & Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Transfer Coin Amount
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(currentUser.coins)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Max ({currentUser.coins.toLocaleString()})
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🪙</span>
                <input
                  type="number"
                  min="1"
                  max={currentUser.coins}
                  placeholder="Enter coin amount"
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                    setAmount(v);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#161622] border border-[#27273A] text-white text-lg font-bold font-mono focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                />
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2.5">
                {coinPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                      amount === preset
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                        : 'bg-[#181824] border-[#252536] text-slate-300 hover:bg-[#202030]'
                    }`}
                  >
                    +{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Reseller Discount & Price Breakdown */}
            <div className="p-4 rounded-2xl bg-[#161624] border border-[#26263A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  Wholesale Discount Rate
                </span>
                <div className="flex items-center gap-2">
                  {[8, 10, 12, 15, 20].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg font-bold border transition-colors ${
                        discountPercent === d
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-[#1F1F2E] text-slate-300 border-[#2D2D42]'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#232336] grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-[#11111A]">
                  <span className="text-[10px] text-slate-400 block">Official Price</span>
                  <span className="text-xs font-bold text-slate-400 line-through">${officialRateUsd.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#11111A] border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 font-bold block">Reseller Cost</span>
                  <span className="text-sm font-extrabold text-amber-400">${resellerRateUsd.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#11111A] border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-bold block">User Savings</span>
                  <span className="text-xs font-bold text-emerald-400">+${userSavingsUsd.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Transfer Memo */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Internal Memo / Reference Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. WhatsApp payment confirmed, order #9281"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161622] border border-[#27273A] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Confirmation Lock or Submit */}
            {isConfirming ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  Confirm Coin Deduction & Delivery
                </div>
                <p className="text-xs text-slate-300">
                  Are you sure you want to transfer <strong className="text-white">{numAmount.toLocaleString()} Coins</strong> to{' '}
                  <strong className="text-white">{matchedUser ? matchedUser.displayName : recipientQuery}</strong>? This operation is atomic and irreversible.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#1F1F2E] text-slate-300 text-xs font-semibold hover:bg-[#28283C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteTransfer}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Minting & Transferring...' : 'Authorize & Transfer Now'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!matchedUser && !recipientQuery.trim()) {
                    setErrorMessage('Please specify recipient.');
                    return;
                  }
                  if (!numAmount || numAmount <= 0) {
                    setErrorMessage('Please enter an amount.');
                    return;
                  }
                  setErrorMessage(null);
                  setIsConfirming(true);
                }}
                disabled={!numAmount || numAmount <= 0 || currentUser.coins < numAmount}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                  !numAmount || numAmount <= 0 || currentUser.coins < numAmount
                    ? 'bg-[#1C1C28] text-slate-500 border border-[#2A2A3C] cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/20'
                }`}
              >
                <Send className="w-4 h-4" />
                Transfer {numAmount > 0 ? `${numAmount.toLocaleString()} Coins` : 'Coins'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
