import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Send,
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  Percent,
  Sliders,
  MessageCircle,
  Phone,
  Lock,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  Zap,
  Clock,
  Award,
  Gem,
  Plus,
  X,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile, SellerTransaction, SellerProfile } from '../../types';
import { SellerBadge } from './SellerBadge';
import { TransferCoinsModal } from './TransferCoinsModal';

interface CoinSellerDashboardProps {
  onBack?: () => void;
  onOpenDirectChat?: (userId: string) => void;
}

export const CoinSellerDashboard: React.FC<CoinSellerDashboardProps> = ({
  onBack,
  onOpenDirectChat,
}) => {
  const {
    currentUser,
    allUsers,
    sellerTransactions,
    buyerRequests,
    transferCoinsAsSeller,
    updateBuyerRequestStatus,
    updateSellerProfileSettings,
    applyForSellerRole,
    quickUpgradeToDemoSeller,
  } = useAppState();

  const isSeller =
    currentUser.role === 'seller' ||
    currentUser.role === 'agent' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'super_admin' ||
    currentUser.isSeller;

  const [activeTab, setActiveTab] = useState<'transfer' | 'history' | 'inquiries' | 'settings'>('transfer');

  // Transfer Form State
  const [recipientQuery, setRecipientQuery] = useState<string>('');
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [transferAmount, setTransferAmount] = useState<number | ''>(10000);
  const [discountPercent, setDiscountPercent] = useState<number>(
    currentUser.sellerInfo?.discountPercentage || 12
  );
  const [transferNote, setTransferNote] = useState<string>('Live Audio Room VIP refill');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState<boolean>(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<SellerTransaction | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // History Filter State
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | 'FULFILLED' | 'PENDING' | 'FLAGGED'>('ALL');
  const [historyDateFilter, setHistoryDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [selectedTxDetail, setSelectedTxDetail] = useState<SellerTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Application State for Non-Sellers
  const [applyAgencyName, setApplyAgencyName] = useState<string>(`${currentUser.displayName} Coins Agency`);
  const [applyWhatsapp, setApplyWhatsapp] = useState<string>('+1 (555) 234-5678');
  const [applyTelegram, setApplyTelegram] = useState<string>(`@${currentUser.username}_coins`);
  const [applyPaymentMethods, setApplyPaymentMethods] = useState<string>('WhatsApp, PayPal, USDT, Bank Wire');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applySuccessNotice, setApplySuccessNotice] = useState<string | null>(null);

  // Agency Settings State
  const [settingDiscount, setSettingDiscount] = useState<number>(
    currentUser.sellerInfo?.discountPercentage || 12
  );
  const [settingStatus, setSettingStatus] = useState<'online' | 'busy' | 'away'>(
    currentUser.sellerInfo?.sellerStatus === 'offline' ? 'online' : (currentUser.sellerInfo?.sellerStatus || 'online')
  );
  const [settingWhatsapp, setSettingWhatsapp] = useState<string>(
    currentUser.sellerInfo?.contactWhatsapp || '+971 50 123 4567'
  );
  const [settingTelegram, setSettingTelegram] = useState<string>(
    currentUser.sellerInfo?.contactTelegram || '@AuraCoinsOfficial'
  );
  const [settingNoticeBanner, setSettingNoticeBanner] = useState<string>(
    currentUser.sellerInfo?.noticeBanner || '🔥 Special Promo: Extra 12% bonus coins on orders over 50,000 Coins!'
  );
  const [settingSavedNotice, setSettingSavedNotice] = useState<boolean>(false);

  // Quick recipient lookup effect
  React.useEffect(() => {
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

  // Derived stats
  const sellerInfo = currentUser.sellerInfo;
  const myTransactions = sellerTransactions.filter(
    (tx) => tx.sellerId === currentUser.id || currentUser.role === 'super_admin'
  );
  const myBuyerRequests = buyerRequests.filter(
    (req) => req.sellerId === currentUser.id || currentUser.role === 'super_admin'
  );

  const totalVolumeSold =
    sellerInfo?.totalCoinsSold ||
    myTransactions.reduce((acc, t) => acc + (t.status === 'COMPLETED' ? t.amount : 0), 0);
  const totalRevenueUsd =
    sellerInfo?.totalRevenueUsd ||
    myTransactions.reduce((acc, t) => acc + (t.status === 'COMPLETED' ? t.priceUsd : 0), 0);
  const totalTradesCount =
    sellerInfo?.totalTrades || myTransactions.filter((t) => t.status === 'COMPLETED').length;

  const numAmount = Number(transferAmount) || 0;
  const officialRateUsd = numAmount * 0.01;
  const discountedRateUsd = Number((officialRateUsd * (1 - discountPercent / 100)).toFixed(2));
  const userSavingsUsd = Number((officialRateUsd - discountedRateUsd).toFixed(2));

  const coinPresets = [1000, 5000, 10000, 50000, 100000, 500000];

  const handleExecuteTransfer = async () => {
    if (!numAmount || numAmount <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }
    if (!recipientQuery.trim()) {
      setTransferError('Please specify recipient User ID or username.');
      return;
    }

    setTransferError(null);
    setIsSubmittingTransfer(true);

    try {
      const result = await transferCoinsAsSeller({
        sellerId: currentUser.id,
        recipientQuery,
        amount: numAmount,
        discountPercentage: discountPercent,
        note: transferNote,
      });

      if (result.success && result.transaction) {
        setTransferSuccess(result.transaction);
        setIsConfirmModalOpen(false);
        // Auto-fulfill pending requests for this buyer
        const pendingReq = myBuyerRequests.find(req => 
           req.status === 'PENDING' && 
           (req.buyerNumericId === recipientQuery || req.buyerId === recipientQuery)
        );
        if (pendingReq) {
           updateBuyerRequestStatus(pendingReq.id, 'FULFILLED');
        }
      } else {
        setTransferError(result.message);
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      setTransferError(err?.message || 'Transfer failed.');
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSaveSettings = () => {
    updateSellerProfileSettings(currentUser.id, {
      discountPercentage: settingDiscount,
      sellerStatus: settingStatus,
      contactWhatsapp: settingWhatsapp,
      contactTelegram: settingTelegram,
      noticeBanner: settingNoticeBanner,
    });
    setSettingSavedNotice(true);
    setTimeout(() => setSettingSavedNotice(false), 2500);
  };

  const handleApplySeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      const res = await applyForSellerRole({
        agencyName: applyAgencyName,
        contactWhatsapp: applyWhatsapp,
        contactTelegram: applyTelegram,
        paymentMethods: applyPaymentMethods,
        initialDepositUsd: 1000,
      });
      setApplySuccessNotice(res.message);
    } finally {
      setIsApplying(false);
    }
  };

  // Filtered History
  const filteredHistory = myTransactions.filter((t) => {
    if (historyStatusFilter !== 'ALL' && t.status !== historyStatusFilter) return false;
    if (historySearch) {
      const s = historySearch.toLowerCase();
      const matchName = t.recipientName.toLowerCase().includes(s);
      const matchId = t.recipientNumericId.toLowerCase().includes(s) || t.id.toLowerCase().includes(s);
      const matchHash = t.txHash.toLowerCase().includes(s);
      if (!matchName && !matchId && !matchHash) return false;
    }
    if (historyDateFilter === 'today') {
      const isToday = new Date(t.createdAt).toDateString() === new Date().toDateString();
      if (!isToday) return false;
    }
    return true;
  });

  return (
    <div id="coin-seller-dashboard" className="flex flex-col gap-5 pb-24 px-4 text-slate-100 bg-[#0B0B11] min-h-screen">
      {/* Top Header Bar */}
      <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1C1C2A] pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-2xl bg-[#161622] border border-[#262638] text-slate-300 hover:text-white transition-colors"
              title="Return to Main Menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-yellow-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-display text-white">Reseller Operations Center</h1>
              <SellerBadge user={currentUser} size="sm" />
            </div>
            <p className="text-xs text-slate-400">
              Agency: <strong className="text-slate-200">{sellerInfo?.agencyName || currentUser.displayName}</strong> • ID:{' '}
              <span className="font-mono text-amber-400">{currentUser.numericId || currentUser.id}</span>
            </p>
          </div>
        </div>

        {/* Online Status Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSeller && (
            <div className="flex items-center gap-1.5 bg-[#161624] border border-[#26263A] p-1 rounded-xl text-xs">
              <span className="text-[10px] text-slate-400 pl-1 font-bold">STATUS:</span>
              {(['online', 'busy', 'away'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSettingStatus(st);
                    updateSellerProfileSettings(currentUser.id, { sellerStatus: st });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    settingStatus === st
                      ? st === 'online'
                        ? 'bg-emerald-500 text-slate-950'
                        : st === 'busy'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RBAC Access Guard */}
      {!isSeller ? (
        <div className="p-8 rounded-3xl bg-[#12121B] border border-[#242436] text-center max-w-xl mx-auto my-6 space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Authorized Resellers Only</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              The Coin Reseller Portal allows certified master agents and wholesalers to mint, transfer, and fulfill coin orders with verified cryptographic receipts.
            </p>
          </div>

          {applySuccessNotice ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{applySuccessNotice}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => quickUpgradeToDemoSeller(currentUser.id)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Activate Reseller Account (+1,000,000 Coins Inventory)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Full Reseller Dashboard */
        <>
          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Inventory Coin Balance */}
            <div className="p-4 rounded-3xl bg-[#13131D] border border-amber-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Inventory Balance</span>
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Coins className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl lg:text-3xl font-black text-amber-400 font-display">
                  {currentUser.coins.toLocaleString()} 🪙
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Ready for instant delivery</span>
              </div>
            </div>

            {/* Total Volume Sold */}
            <div className="p-4 rounded-3xl bg-[#13131D] border border-[#242436] flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Lifetime Volume</span>
                <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl lg:text-3xl font-black text-cyan-300 font-display">
                  {(totalVolumeSold / 1000).toFixed(0)}k <span className="text-sm font-normal text-slate-400">Coins</span>
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {totalTradesCount} Orders Fulfilled
                </span>
              </div>
            </div>

            {/* Revenue Generated */}
            <div className="p-4 rounded-3xl bg-[#13131D] border border-[#242436] flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Est. USD Sales</span>
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl lg:text-3xl font-black text-emerald-400 font-display">
                  ${totalRevenueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Net Reseller Turnover</span>
              </div>
            </div>

            {/* Wholesale Discount Tier */}
            <div className="p-4 rounded-3xl bg-[#13131D] border border-[#242436] flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Discount</span>
                <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl lg:text-3xl font-black text-purple-300 font-display">
                  {discountPercent}% OFF
                </p>
                <span className="text-[10px] text-purple-400 font-medium">
                  {myBuyerRequests.length} Buyer Inquiries in Queue
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-[#12121C] border border-[#222234] p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'transfer'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Direct Transfer</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Ledger & History</span>
              {myTransactions.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${activeTab === 'history' ? 'bg-black/30 text-white' : 'bg-[#262638] text-slate-300'}`}>
                  {myTransactions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Buyer Orders</span>
              {myBuyerRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-500 text-white">
                  {myBuyerRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Agency Rates & Profile</span>
            </button>
          </div>

          {/* TAB 1: Direct Coin Transfer Form */}
          {activeTab === 'transfer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Main Transfer Card */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#12121C] border border-[#242436] shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Instant Coin Dispatch</h3>
                    <p className="text-xs text-slate-400">Atomic minting and ledger transfer with 0% network loss</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    INSTANT ESCROW
                  </span>
                </div>

                {transferError && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{transferError}</span>
                  </div>
                )}

                {transferSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 space-y-2">
                    <div className="flex items-center justify-between font-bold text-emerald-200">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Transfer Successful! (+{transferSuccess.amount.toLocaleString()} Coins)
                      </span>
                      <button
                        onClick={() => setTransferSuccess(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Delivered to <strong className="text-white">{transferSuccess.recipientName}</strong> (@{transferSuccess.recipientNumericId}).
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Tx: {transferSuccess.id}</span>
                      <button
                        onClick={() => handleCopyHash(transferSuccess.txHash)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {transferSuccess.txHash.slice(0, 12)}...
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Recipient User Lookup */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Customer Account (User ID / Username)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Numeric ID, User ID, or Username"
                      value={recipientQuery}
                      onChange={(e) => {
                        setRecipientQuery(e.target.value);
                        setTransferError(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#171724] border border-[#2A2A3E] text-white text-sm focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  {/* Matched Recipient Banner */}
                  {matchedUser && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 p-3 rounded-2xl bg-[#191928] border border-emerald-500/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={matchedUser.avatar}
                          alt={matchedUser.displayName}
                          className="w-10 h-10 rounded-2xl object-cover border border-[#35354C]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">{matchedUser.displayName}</span>
                            <span className="text-xs">{matchedUser.countryFlag}</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            @{matchedUser.username} • ID: <strong className="text-slate-200">{matchedUser.numericId || matchedUser.id}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase">Customer Coins</span>
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
                    <span className="text-xs text-slate-400">
                      Max Available: <strong className="text-amber-300">{currentUser.coins.toLocaleString()} 🪙</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl">🪙</span>
                    <input
                      type="number"
                      min="1"
                      max={currentUser.coins}
                      value={transferAmount}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                        setTransferAmount(val);
                        setTransferError(null);
                      }}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#171724] border border-[#2A2A3E] text-white text-lg font-bold font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2.5">
                    {coinPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTransferAmount(preset)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                          transferAmount === preset
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                            : 'bg-[#181826] border-[#26263A] text-slate-300 hover:bg-[#202032]'
                        }`}
                      >
                        +{preset >= 1000 ? `${preset / 1000}k` : preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Internal Note / Order Reference
                  </label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="e.g. Binance Pay order #92019 verified"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171724] border border-[#2A2A3E] text-white text-xs placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {/* Authorize Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!matchedUser && !recipientQuery.trim()) {
                      setTransferError('Please enter recipient user ID or username.');
                      return;
                    }
                    if (!numAmount || numAmount <= 0) {
                      setTransferError('Please enter coin transfer amount.');
                      return;
                    }
                    setTransferError(null);
                    setIsConfirmModalOpen(true);
                  }}
                  disabled={!numAmount || numAmount <= 0 || currentUser.coins < numAmount}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                    !numAmount || numAmount <= 0 || currentUser.coins < numAmount
                      ? 'bg-[#181824] text-slate-500 border border-[#262638] cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/20'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Review & Transfer {numAmount > 0 ? `${numAmount.toLocaleString()} Coins` : ''}
                </button>
              </div>

              {/* Dynamic Price Calculation & Live Summary Card */}
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-[#12121C] border border-[#242436] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-amber-400" />
                    Dynamic Price Matrix
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#202030]">
                      <span className="text-slate-400">Official Store Rate</span>
                      <span className="font-semibold text-slate-300 font-mono">${officialRateUsd.toFixed(2)} USD</span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-[#202030]">
                      <span className="text-slate-400">Applied Wholesale Discount</span>
                      <span className="font-bold text-amber-400">-{discountPercent}%</span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-[#202030]">
                      <span className="text-slate-400">Customer Savings</span>
                      <span className="font-bold text-emerald-400 font-mono">+${userSavingsUsd.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-300 font-bold">Reseller Net Revenue:</span>
                      <span className="text-base font-black text-amber-300 font-mono">
                        ${discountedRateUsd.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fast Reseller Quick Guide */}
                <div className="p-4 rounded-3xl bg-[#12121C] border border-[#242436] space-y-2.5 text-xs text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Reseller Best Practices
                  </span>
                  <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
                    <li>Always verify customer numeric ID before dispatching coins.</li>
                    <li>Transfers are finalized instantaneously across our distributed ledger.</li>
                    <li>Customers receive in-room notification and push alerts upon arrival.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Real-time Transaction Ledger & Filters */}
          {activeTab === 'history' && (
            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#242436] shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white font-display">Cryptographic Transfer Ledger</h3>
                  <p className="text-xs text-slate-400">Complete immutable record of all reseller coin dispatches</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search recipient or tx..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#181826] border border-[#28283C] text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <select
                    value={historyStatusFilter}
                    onChange={(e: any) => setHistoryStatusFilter(e.target.value)}
                    className="py-1.5 px-3 rounded-xl bg-[#181826] border border-[#28283C] text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FLAGGED">Flagged</option>
                  </select>

                  <select
                    value={historyDateFilter}
                    onChange={(e: any) => setHistoryDateFilter(e.target.value)}
                    className="py-1.5 px-3 rounded-xl bg-[#181826] border border-[#28283C] text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222234] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pl-2">Date & Tx ID</th>
                      <th className="pb-3">Recipient</th>
                      <th className="pb-3">Coins Transferred</th>
                      <th className="pb-3">Price (USD)</th>
                      <th className="pb-3">Discount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D1D2C]">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#161624] transition-colors">
                          <td className="py-3.5 pl-2">
                            <span className="font-mono text-slate-300 font-semibold block">{tx.id}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(tx.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={tx.recipientAvatar}
                                alt={tx.recipientName}
                                className="w-6 h-6 rounded-full object-cover border border-[#303046]"
                              />
                              <div>
                                <span className="font-bold text-white block">{tx.recipientName}</span>
                                <span className="text-[10px] text-slate-400">ID: {tx.recipientNumericId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 font-bold text-amber-400">
                            🪙 +{tx.amount.toLocaleString()} Coins
                          </td>
                          <td className="py-3.5 font-mono font-semibold text-white">
                            ${tx.priceUsd.toFixed(2)}
                          </td>
                          <td className="py-3.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              -{tx.discountAppliedPercent}%
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <button
                              onClick={() => setSelectedTxDetail(tx)}
                              className="px-2.5 py-1 rounded-lg bg-[#202030] hover:bg-[#2A2A40] text-slate-200 text-[11px] font-semibold transition-colors"
                            >
                              Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Buyer Order Inquiries */}
          {activeTab === 'inquiries' && (
            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#242436] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-display">Buyer Inquiries Queue</h3>
                  <p className="text-xs text-slate-400">Incoming coin purchase requests submitted from party rooms</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {myBuyerRequests.length} Active Orders
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myBuyerRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#171724] border border-[#28283C] space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.buyerAvatar}
                          alt={req.buyerName}
                          className="w-10 h-10 rounded-2xl object-cover border border-[#33334A]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{req.buyerName}</h4>
                          <span className="text-[10px] text-slate-400">ID: {req.buyerNumericId}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300">
                        {req.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#11111A] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Coins Requested:</span>
                        <span className="font-bold text-amber-300">🪙 {req.coinsRequested.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Quoted Price:</span>
                        <span className="font-bold text-white">${req.estimatedPriceUsd.toFixed(2)} USD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Payment:</span>
                        <span className="text-slate-300">{req.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#1E1E2C]">
                        <span className="text-slate-400">Contact:</span>
                        <span className="font-mono text-cyan-300">{req.buyerContact}</span>
                      </div>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setRecipientQuery(req.buyerNumericId || req.buyerId);
                            setTransferAmount(req.coinsRequested);
                            setActiveTab('transfer');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110 flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          Send Coins
                        </button>
                        <button
                          onClick={() => updateBuyerRequestStatus(req.id, 'FULFILLED')}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          Mark Done
                        </button>
                        <button
                          onClick={() => updateBuyerRequestStatus(req.id, 'CANCELLED')}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500/30 transition-colors border border-rose-500/30"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Agency Rates & Settings */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#242436] shadow-xl space-y-5 max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-white font-display">Agency Pricing & Contact Settings</h3>
                <p className="text-xs text-slate-400">Configure how buyers see your storefront across AuraVoice</p>
              </div>

              {settingSavedNotice && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings updated successfully!</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Wholesale Discount Rate ({settingDiscount}%)
                  </label>
                  <div className="flex items-center gap-2">
                    {[5, 8, 10, 12, 15, 20].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSettingDiscount(d)}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                          settingDiscount === d
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-[#181826] text-slate-300 border-[#2A2A3E]'
                        }`}
                      >
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    WhatsApp Customer Contact
                  </label>
                  <input
                    type="text"
                    value={settingWhatsapp}
                    onChange={(e) => setSettingWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181826] border border-[#2A2A3E] text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Telegram Official Desk
                  </label>
                  <input
                    type="text"
                    value={settingTelegram}
                    onChange={(e) => setSettingTelegram(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181826] border border-[#2A2A3E] text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Public Store Notice Banner
                  </label>
                  <input
                    type="text"
                    value={settingNoticeBanner}
                    onChange={(e) => setSettingNoticeBanner(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181826] border border-[#2A2A3E] text-white text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20"
                >
                  Save Store Settings
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#12121C] border border-[#2A2A3E] p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-base font-bold text-white font-display">Confirm Direct Coin Transfer</h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#171724] border border-[#242436] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Recipient</span>
                <span className="font-bold text-white">{matchedUser ? matchedUser.displayName : recipientQuery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Coin Amount</span>
                <span className="font-bold text-amber-300">🪙 {numAmount.toLocaleString()} Coins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reseller Price</span>
                <span className="font-mono text-emerald-400 font-bold">${discountedRateUsd.toFixed(2)} USD (-{discountPercent}%)</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmittingTransfer}
                className="flex-1 py-2.5 rounded-xl bg-[#1F1F2E] text-slate-300 text-xs font-semibold hover:bg-[#28283C]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={isSubmittingTransfer}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                {isSubmittingTransfer ? 'Transferring...' : 'Confirm & Send Coins'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#12121C] border border-[#2A2A3E] p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#202030] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">Transfer Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-slate-200 font-bold">{selectedTxDetail.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Delivered Coins</span>
                <span className="font-bold text-amber-300">+{selectedTxDetail.amount.toLocaleString()} Coins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Recipient Name</span>
                <span className="font-bold text-white">{selectedTxDetail.recipientName} (@{selectedTxDetail.recipientNumericId})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Price Charged</span>
                <span className="font-bold text-emerald-400">${selectedTxDetail.priceUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Timestamp</span>
                <span className="text-slate-300">{new Date(selectedTxDetail.createdAt).toUTCString()}</span>
              </div>

              <div className="pt-2 border-t border-[#202030] space-y-1">
                <span className="text-slate-400 block text-[10px]">Cryptographic Transaction Hash:</span>
                <div className="p-2 rounded-xl bg-[#0B0B11] border border-[#202030] flex items-center justify-between font-mono text-[10px] text-cyan-300">
                  <span className="truncate pr-2">{selectedTxDetail.txHash}</span>
                  <button
                    onClick={() => handleCopyHash(selectedTxDetail.txHash)}
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    {copiedHash === selectedTxDetail.txHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTxDetail(null)}
              className="w-full py-2.5 rounded-xl bg-[#1C1C2A] text-slate-200 font-semibold text-xs hover:bg-[#252538]"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
