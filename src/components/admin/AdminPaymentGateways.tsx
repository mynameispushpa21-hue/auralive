import React, { useState } from 'react';
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Activity,
  DollarSign,
  Building2,
  Smartphone,
  Globe,
  Coins,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Server,
  Settings2,
  Play,
  Lock,
  Radio,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import {
  PaymentGatewayConfig,
  GatewayCategory,
  PaymentGatewayType,
  GatewayWebhookLog,
} from '../../types';
import { audioEngine } from '../../services/audioEngine';

export const AdminPaymentGateways: React.FC = () => {
  const {
    paymentGateways,
    gatewayWebhookLogs,
    adminToggleGateway,
    adminUpdateGateway,
    adminTestGatewayPing,
    adminSimulateGatewayTransaction,
    adminAddPaymentGateway,
    adminDeletePaymentGateway,
  } = useAppState();

  // Active view tab
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  
  // Selected gateway for configuration modal
  const [editingGateway, setEditingGateway] = useState<PaymentGatewayConfig | null>(null);

  // Ping test state: gatewayId -> { loading: boolean, result?: { success: boolean; latencyMs: number; message: string } }
  const [pingStates, setPingStates] = useState<
    Record<string, { loading: boolean; result?: { success: boolean; latencyMs: number; message: string } }>
  >({});

  // Simulation modal state
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulateGatewayId, setSimulateGatewayId] = useState<string>(paymentGateways[0]?.id || '');
  const [simulateAmount, setSimulateAmount] = useState<number>(19.99);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Add Gateway modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGwPreset, setNewGwPreset] = useState<PaymentGatewayType>('stripe');
  const [newGwName, setNewGwName] = useState('');
  const [newGwCategory, setNewGwCategory] = useState<GatewayCategory>('card_processor');
  const [newGwCurrency, setNewGwCurrency] = useState('USD');
  const [newGwFeePercent, setNewGwFeePercent] = useState<number>(2.9);
  const [newGwFeeFixed, setNewGwFeeFixed] = useState<number>(0.30);
  const [newGwMinAmount, setNewGwMinAmount] = useState<number>(0.99);
  const [newGwMaxAmount, setNewGwMaxAmount] = useState<number>(5000);
  const [newGwDesc, setNewGwDesc] = useState('');

  // Webhook JSON Inspector modal
  const [inspectingLog, setInspectingLog] = useState<GatewayWebhookLog | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Webhook log search & filter
  const [webhookSearchQuery, setWebhookSearchQuery] = useState('');
  const [webhookStatusFilter, setWebhookStatusFilter] = useState<string>('ALL');

  // Overall Statistics calculations
  const totalVolume = paymentGateways.reduce((sum, g) => sum + g.totalProcessedVolumeUsd, 0);
  const totalTransactions = paymentGateways.reduce((sum, g) => sum + g.totalTransactionsCount, 0);
  const activeGatewaysCount = paymentGateways.filter((g) => g.isEnabled).length;
  const avgPing =
    paymentGateways.length > 0
      ? Math.round(paymentGateways.reduce((sum, g) => sum + (g.lastPingMs || 35), 0) / paymentGateways.length)
      : 35;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    audioEngine.playSoundEffect('chime');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePingTest = async (gatewayId: string) => {
    audioEngine.playSoundEffect('chime');
    setPingStates((prev) => ({ ...prev, [gatewayId]: { loading: true } }));

    const res = await adminTestGatewayPing(gatewayId);
    setPingStates((prev) => ({
      ...prev,
      [gatewayId]: { loading: false, result: res },
    }));

    if (res.success) {
      audioEngine.playSoundEffect('chime');
    }

    setTimeout(() => {
      setPingStates((prev) => {
        const copy = { ...prev };
        delete copy[gatewayId];
        return copy;
      });
    }, 4500);
  };

  const handleRunSimulation = async () => {
    if (!simulateGatewayId) return;
    setIsSimulating(true);
    setSimulationResult(null);
    audioEngine.playSoundEffect('chime');

    const res = await adminSimulateGatewayTransaction(simulateGatewayId, simulateAmount);
    setIsSimulating(false);
    audioEngine.playSoundEffect('fanfare');
    setSimulationResult(`Success! Processed $${simulateAmount.toFixed(2)} USD test charge via ${res.log.gatewayName}. Webhook logged.`);
  };

  const handleCreateGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGwName.trim()) return;

    const newId = `gw_${Date.now()}`;
    const code = newGwPreset;

    const createdGw: PaymentGatewayConfig = {
      id: newId,
      name: newGwName.trim(),
      code,
      category: newGwCategory,
      iconName:
        newGwCategory === 'card_processor'
          ? 'CreditCard'
          : newGwCategory === 'digital_wallet'
          ? 'Wallet'
          : newGwCategory === 'crypto_web3'
          ? 'Bitcoin'
          : newGwCategory === 'in_app_purchase'
          ? 'Smartphone'
          : 'Building2',
      description: newGwDesc || `Custom gateway configuration for ${newGwName}.`,
      isEnabled: true,
      isSandbox: true,
      settlementCurrency: newGwCurrency,
      feePercent: Number(newGwFeePercent) || 0,
      feeFixedUsd: Number(newGwFeeFixed) || 0,
      minAmountUsd: Number(newGwMinAmount) || 1,
      maxAmountUsd: Number(newGwMaxAmount) || 1000,
      supportedCurrencies: [newGwCurrency, 'USD'],
      credentials: {
        publishableKey: `pk_test_${Math.random().toString(36).substring(2, 12)}`,
        secretKey: `sk_test_${Math.random().toString(36).substring(2, 18)}`,
        webhookSecret: `whsec_${Math.random().toString(36).substring(2, 14)}`,
      },
      webhookUrl: `https://api.auravoice.live/v1/webhooks/${code}`,
      webhookStatus: 'healthy',
      lastPingMs: 32,
      lastEventReceivedAt: new Date().toISOString(),
      totalProcessedVolumeUsd: 0,
      totalTransactionsCount: 0,
      successRatePercent: 100,
      chargebackRatePercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    adminAddPaymentGateway(createdGw);
    audioEngine.playSoundEffect('fanfare');
    setIsAddModalOpen(false);

    // Reset inputs
    setNewGwName('');
    setNewGwDesc('');
  };

  // Filter gateways by category tab
  const filteredGateways = paymentGateways.filter((gw) => {
    if (activeCategoryTab === 'all') return true;
    if (activeCategoryTab === 'in_app') return gw.category === 'in_app_purchase';
    if (activeCategoryTab === 'cards') return gw.category === 'card_processor';
    if (activeCategoryTab === 'wallets') return gw.category === 'digital_wallet';
    if (activeCategoryTab === 'crypto') return gw.category === 'crypto_web3';
    if (activeCategoryTab === 'bank') return gw.category === 'bank_direct';
    return true;
  });

  // Filter webhook logs
  const filteredWebhookLogs = gatewayWebhookLogs.filter((log) => {
    const matchesSearch =
      log.gatewayName.toLowerCase().includes(webhookSearchQuery.toLowerCase()) ||
      log.eventType.toLowerCase().includes(webhookSearchQuery.toLowerCase()) ||
      log.customerName.toLowerCase().includes(webhookSearchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(webhookSearchQuery.toLowerCase());
    const matchesStatus =
      webhookStatusFilter === 'ALL' || log.status === webhookStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryBadge = (category: GatewayCategory) => {
    switch (category) {
      case 'card_processor':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Card Processor
          </span>
        );
      case 'in_app_purchase':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> In-App Store
          </span>
        );
      case 'digital_wallet':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Digital Wallet / UPI
          </span>
        );
      case 'crypto_web3':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Crypto Web3
          </span>
        );
      case 'bank_direct':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> VIP Wire / Escrow
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-12">
      {/* HEADER WITH TITLE & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white">Payment Gateways & In-App Purchases</h1>
              <p className="text-xs text-slate-400">
                Manage payment processors, API credentials, fees, and real-time webhook endpoints.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setSimulationResult(null);
              setIsSimulateModalOpen(true);
              audioEngine.playSoundEffect('coin');
            }}
            className="px-3 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-200 hover:text-white border border-[#2e2e42] text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>Simulate Charge</span>
          </button>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
              audioEngine.playSoundEffect('coin');
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Gateway</span>
          </button>
        </div>
      </div>

      {/* TOP TELEMETRY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Volume Processed
            </span>
            <div className="text-xl font-black text-white">
              ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Real-time settled
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Transactions
            </span>
            <div className="text-xl font-black text-white">{totalTransactions.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-medium">Lifetime successful checkouts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Gateways
            </span>
            <div className="text-xl font-black text-white">
              {activeGatewaysCount} <span className="text-xs font-normal text-slate-400">/ {paymentGateways.length}</span>
            </div>
            <span className="text-[10px] text-violet-400 font-medium">
              {paymentGateways.filter((g) => g.isSandbox).length} Sandbox Active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121217] border border-[#232332] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Avg Handshake Latency
            </span>
            <div className="text-xl font-black text-emerald-400">{avgPing}ms</div>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All webhooks online
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#232332]">
        {[
          { id: 'all', label: `All Gateways (${paymentGateways.length})` },
          { id: 'cards', label: 'Credit Cards (Stripe)' },
          { id: 'in_app', label: 'Google Play & Apple Pay' },
          { id: 'wallets', label: 'Digital Wallets & UPI' },
          { id: 'crypto', label: 'Crypto Web3' },
          { id: 'bank', label: 'Direct Bank Wire' },
          { id: 'webhooks', label: `Webhook Logs (${gatewayWebhookLogs.length})` },
        ].map((tab) => {
          const isActive = activeCategoryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategoryTab(tab.id);
                audioEngine.playSoundEffect('coin');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300 border border-violet-500/40 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1A24]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW: GATEWAYS GRID */}
      {activeCategoryTab !== 'webhooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGateways.map((gw) => {
            const isPingLoading = pingStates[gw.id]?.loading;
            const pingResult = pingStates[gw.id]?.result;

            return (
              <div
                key={gw.id}
                className="p-5 rounded-2xl bg-[#121217] border border-[#232332] hover:border-[#35354a] transition-all space-y-4 shadow-sm relative overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#2e2e42] flex items-center justify-center text-violet-400 shadow-inner">
                      {gw.code === 'stripe' && <CreditCard className="w-6 h-6 text-indigo-400" />}
                      {gw.code === 'google_play' && <Smartphone className="w-6 h-6 text-emerald-400" />}
                      {gw.code === 'apple_app_store' && <Smartphone className="w-6 h-6 text-slate-200" />}
                      {gw.code === 'paypal' && <Wallet className="w-6 h-6 text-blue-400" />}
                      {gw.code === 'razorpay' && <Globe className="w-6 h-6 text-cyan-400" />}
                      {gw.code === 'crypto_usdt' && <Coins className="w-6 h-6 text-amber-400" />}
                      {gw.code === 'bank_transfer' && <Building2 className="w-6 h-6 text-purple-400" />}
                      {!['stripe', 'google_play', 'apple_app_store', 'paypal', 'razorpay', 'crypto_usdt', 'bank_transfer'].includes(
                        gw.code
                      ) && <CreditCard className="w-6 h-6 text-violet-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white font-display">{gw.name}</h3>
                        {getCategoryBadge(gw.category)}
                        {gw.isSandbox ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Sandbox
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Production
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{gw.description}</p>
                    </div>
                  </div>

                  {/* Top Switch Toggle Active */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        adminToggleGateway(gw.id, !gw.isEnabled);
                        audioEngine.playSoundEffect('coin');
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                        gw.isEnabled ? 'bg-violet-600' : 'bg-slate-700'
                      }`}
                      title={gw.isEnabled ? 'Active in mobile store' : 'Disabled in store'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          gw.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#232332] text-xs">
                  <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332]/60">
                    <span className="text-[10px] font-semibold text-slate-400 block">Total Volume</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">
                      ${gw.totalProcessedVolumeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332]/60">
                    <span className="text-[10px] font-semibold text-slate-400 block">Transactions</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">
                      {gw.totalTransactionsCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332]/60">
                    <span className="text-[10px] font-semibold text-slate-400 block">Fee Structure</span>
                    <span className="font-bold text-violet-300 text-xs mt-0.5 block">
                      {gw.feePercent}% {gw.feeFixedUsd > 0 ? `+ $${gw.feeFixedUsd.toFixed(2)}` : ''}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332]/60">
                    <span className="text-[10px] font-semibold text-slate-400 block">Limits</span>
                    <span className="font-bold text-slate-300 text-xs mt-0.5 block">
                      ${gw.minAmountUsd} - ${gw.maxAmountUsd.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Webhook Status Line & Currencies */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-400">Webhook:</span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300 bg-[#1A1A24] px-2 py-1 rounded-lg border border-[#232332]">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          gw.webhookStatus === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span>{gw.lastPingMs ? `${gw.lastPingMs}ms` : '32ms'}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 truncate max-w-[170px]">{gw.webhookUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[10px]">Currencies:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {gw.supportedCurrencies.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded-md bg-[#1A1A24] text-slate-300 text-[9px] font-mono font-semibold"
                        >
                          {c}
                        </span>
                      ))}
                      {gw.supportedCurrencies.length > 4 && (
                        <span className="text-[9px] text-slate-500">+{gw.supportedCurrencies.length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ping Result Banner (if tested) */}
                {pingResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
                      pingResult.success
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {pingResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-[11px] font-medium">{pingResult.message}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold shrink-0">{pingResult.latencyMs}ms</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#232332]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePingTest(gw.id)}
                      disabled={isPingLoading}
                      className="px-2.5 py-1.5 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 hover:text-white border border-[#2e2e42] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPingLoading ? 'animate-spin text-violet-400' : ''}`} />
                      <span>{isPingLoading ? 'Testing...' : 'Ping Test'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSimulateGatewayId(gw.id);
                        setIsSimulateModalOpen(true);
                        audioEngine.playSoundEffect('coin');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 hover:text-white border border-[#2e2e42] text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                      <span>Test Charge</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingGateway(gw);
                        audioEngine.playSoundEffect('coin');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/30 text-violet-300 hover:text-violet-100 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Configure & Keys</span>
                    </button>

                    {/* Delete button (for non-defaults) */}
                    {!['gw_stripe', 'gw_google_play', 'gw_apple_app_store'].includes(gw.id) && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove payment gateway "${gw.name}"?`)) {
                            adminDeletePaymentGateway(gw.id);
                            audioEngine.playSoundEffect('coin');
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Gateway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: LIVE WEBHOOK AUDIT STREAM */}
      {activeCategoryTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#121217] border border-[#232332]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={webhookSearchQuery}
                onChange={(e) => setWebhookSearchQuery(e.target.value)}
                placeholder="Search event type, customer, ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={webhookStatusFilter}
                onChange={(e) => setWebhookStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-xs text-white focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          {/* Webhook Table */}
          <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1A24] text-slate-400 font-semibold border-b border-[#232332]">
                  <tr>
                    <th className="py-3 px-4">Event ID & Time</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232332] text-slate-300">
                  {filteredWebhookLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No webhook events match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredWebhookLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1A1A24]/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          <div>{log.id}</div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{log.gatewayName}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-violet-300">{log.eventType}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{log.customerName}</div>
                          <span className="text-[10px] text-slate-500 font-mono">{log.customerId}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          ${log.amountUsd.toFixed(2)} <span className="text-[10px] text-slate-400">{log.currency}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : log.status === 'FAILED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.latencyMs}ms</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setInspectingLog(log);
                              audioEngine.playSoundEffect('coin');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#1A1A24] hover:bg-[#232332] text-slate-300 hover:text-white border border-[#2e2e42] text-[11px] font-medium transition-all"
                          >
                            Inspect JSON
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIGURE GATEWAY & API KEYS */}
      {editingGateway && (
        <EditGatewayModal
          gateway={editingGateway}
          onClose={() => setEditingGateway(null)}
          onSave={(updates) => {
            adminUpdateGateway(editingGateway.id, updates);
            setEditingGateway(null);
            audioEngine.playSoundEffect('fanfare');
          }}
        />
      )}

      {/* MODAL 2: SIMULATE TRANSACTION CHARGE */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121217] border border-[#232332] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Play className="w-4 h-4 fill-amber-400/20" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Simulate Gateway Transaction</h3>
                  <p className="text-[11px] text-slate-400">Trigger test charge & record live webhook event</p>
                </div>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Payment Gateway</label>
                <select
                  value={simulateGatewayId}
                  onChange={(e) => setSimulateGatewayId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                >
                  {paymentGateways.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.isSandbox ? 'Sandbox' : 'Production'} • {g.settlementCurrency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Charge Amount ($ USD)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[4.99, 9.99, 19.99, 49.99].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSimulateAmount(amt)}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        simulateAmount === amt
                          ? 'bg-violet-600 text-white border-violet-500'
                          : 'bg-[#1A1A24] text-slate-300 border-[#2e2e42] hover:bg-[#232332]'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.99"
                  value={simulateAmount}
                  onChange={(e) => setSimulateAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                />
              </div>

              {simulationResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{simulationResult}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232332]">
              <button
                type="button"
                onClick={() => setIsSimulateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Gateway...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Fire Simulated Charge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW PAYMENT GATEWAY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGateway}
            className="w-full max-w-lg bg-[#121217] border border-[#232332] rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Add New Payment Gateway</h3>
                  <p className="text-[11px] text-slate-400">Connect a new payment provider or regional gateway</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Preset</label>
                <select
                  value={newGwPreset}
                  onChange={(e) => {
                    const preset = e.target.value as PaymentGatewayType;
                    setNewGwPreset(preset);
                    if (preset === 'stripe') {
                      setNewGwName('Stripe Cards & Wallets');
                      setNewGwCategory('card_processor');
                      setNewGwFeePercent(2.9);
                    } else if (preset === 'google_play') {
                      setNewGwName('Google Play Billing');
                      setNewGwCategory('in_app_purchase');
                      setNewGwFeePercent(15);
                    } else if (preset === 'apple_app_store') {
                      setNewGwName('Apple App Store IAP');
                      setNewGwCategory('in_app_purchase');
                      setNewGwFeePercent(15);
                    } else if (preset === 'paypal') {
                      setNewGwName('PayPal Express');
                      setNewGwCategory('digital_wallet');
                      setNewGwFeePercent(3.49);
                    } else if (preset === 'razorpay') {
                      setNewGwName('Razorpay UPI');
                      setNewGwCategory('digital_wallet');
                      setNewGwFeePercent(2.0);
                    } else if (preset === 'crypto_usdt') {
                      setNewGwName('Crypto Web3 USDT Pay');
                      setNewGwCategory('crypto_web3');
                      setNewGwFeePercent(0.5);
                    } else if (preset === 'bank_transfer') {
                      setNewGwName('Direct Bank Escrow');
                      setNewGwCategory('bank_direct');
                      setNewGwFeePercent(0.0);
                    } else {
                      setNewGwName('Custom Payment Gateway');
                      setNewGwCategory('card_processor');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                >
                  <option value="stripe">Stripe Global (Credit/Debit, Apple Pay)</option>
                  <option value="google_play">Google Play In-App Billing</option>
                  <option value="apple_app_store">Apple App Store (StoreKit 2)</option>
                  <option value="paypal">PayPal Express Checkout</option>
                  <option value="razorpay">Razorpay & UPI Instant</option>
                  <option value="crypto_usdt">Crypto USDT Web3 (TRC20 / ERC20)</option>
                  <option value="bank_transfer">Direct Institutional Wire Transfer</option>
                  <option value="custom">Custom Webhook / REST Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={newGwName}
                  onChange={(e) => setNewGwName(e.target.value)}
                  placeholder="e.g., Stripe Global Payments"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newGwCategory}
                    onChange={(e) => setNewGwCategory(e.target.value as GatewayCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                  >
                    <option value="card_processor">Card Processor</option>
                    <option value="in_app_purchase">In-App Purchase</option>
                    <option value="digital_wallet">Digital Wallet / UPI</option>
                    <option value="crypto_web3">Crypto Web3</option>
                    <option value="bank_direct">Direct Bank Wire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Settlement Currency</label>
                  <select
                    value={newGwCurrency}
                    onChange={(e) => setNewGwCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="USDT">USDT (Tether)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Percentage Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGwFeePercent}
                    onChange={(e) => setNewGwFeePercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fixed Fee ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newGwFeeFixed}
                    onChange={(e) => setNewGwFeeFixed(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Amount ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newGwMinAmount}
                    onChange={(e) => setNewGwMinAmount(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Amount ($)</label>
                  <input
                    type="number"
                    step="100"
                    value={newGwMaxAmount}
                    onChange={(e) => setNewGwMaxAmount(parseFloat(e.target.value) || 5000)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newGwDesc}
                  onChange={(e) => setNewGwDesc(e.target.value)}
                  placeholder="Notes or checkout badge description for users..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232332]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white text-xs font-bold shadow-md hover:brightness-110"
              >
                Add Gateway
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: WEBHOOK JSON INSPECTOR */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121217] border border-[#232332] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Webhook Payload Inspection</h3>
                  <p className="text-[11px] text-slate-400">
                    {inspectingLog.eventType} • {inspectingLog.gatewayName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>
                  IP: <strong className="text-slate-200">{inspectingLog.ipAddress || '198.51.100.42'}</strong>
                </span>
                <span>
                  Status: <strong className="text-emerald-400">{inspectingLog.status}</strong>
                </span>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-[#09090D] border border-[#232332] text-[11px] font-mono text-violet-200 overflow-x-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(inspectingLog.payloadSnippet), null, 2)}
                </pre>
                <button
                  onClick={() => copyToClipboard(inspectingLog.payloadSnippet, 'payload')}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#1A1A24] hover:bg-[#232332] text-slate-300 text-[10px] font-semibold flex items-center gap-1 border border-[#2e2e42]"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === 'payload' ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#232332]">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* SUB-COMPONENT: EDIT GATEWAY & CREDENTIALS MODAL */
interface EditGatewayModalProps {
  gateway: PaymentGatewayConfig;
  onClose: () => void;
  onSave: (updates: Partial<PaymentGatewayConfig>) => void;
}

const EditGatewayModal: React.FC<EditGatewayModalProps> = ({ gateway, onClose, onSave }) => {
  const [name, setName] = useState(gateway.name);
  const [description, setDescription] = useState(gateway.description);
  const [isSandbox, setIsSandbox] = useState(gateway.isSandbox);
  const [isEnabled, setIsEnabled] = useState(gateway.isEnabled);
  const [feePercent, setFeePercent] = useState(gateway.feePercent);
  const [feeFixedUsd, setFeeFixedUsd] = useState(gateway.feeFixedUsd);
  const [minAmountUsd, setMinAmountUsd] = useState(gateway.minAmountUsd);
  const [maxAmountUsd, setMaxAmountUsd] = useState(gateway.maxAmountUsd);
  const [webhookUrl, setWebhookUrl] = useState(gateway.webhookUrl);

  // Credentials
  const [publishableKey, setPublishableKey] = useState(gateway.credentials?.publishableKey || '');
  const [secretKey, setSecretKey] = useState(gateway.credentials?.secretKey || '');
  const [webhookSecret, setWebhookSecret] = useState(gateway.credentials?.webhookSecret || '');
  const [merchantId, setMerchantId] = useState(gateway.credentials?.merchantId || '');
  const [clientId, setClientId] = useState(gateway.credentials?.clientId || '');
  const [walletAddress, setWalletAddress] = useState(gateway.credentials?.cryptoWalletAddress || '');
  const [bankIban, setBankIban] = useState(gateway.credentials?.bankIban || '');

  // Reveal secret toggle
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      isSandbox,
      isEnabled,
      feePercent: Number(feePercent),
      feeFixedUsd: Number(feeFixedUsd),
      minAmountUsd: Number(minAmountUsd),
      maxAmountUsd: Number(maxAmountUsd),
      webhookUrl,
      credentials: {
        ...gateway.credentials,
        publishableKey,
        secretKey,
        webhookSecret,
        merchantId,
        clientId,
        cryptoWalletAddress: walletAddress,
        bankIban,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-[#121217] border border-[#232332] rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Configure {gateway.name}</h3>
              <p className="text-[11px] text-slate-400">Update production credentials, fee rates & limits</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-[#1A1A24]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* General info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gateway Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Environment Mode</label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsSandbox(false)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    !isSandbox
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-[#1A1A24] text-slate-400 border-[#2e2e42]'
                  }`}
                >
                  Live Production
                </button>
                <button
                  type="button"
                  onClick={() => setIsSandbox(true)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isSandbox
                      ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                      : 'bg-[#1A1A24] text-slate-400 border-[#2e2e42]'
                  }`}
                >
                  Sandbox (Test)
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description / Subtitle</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white focus:outline-hidden"
            />
          </div>

          {/* Fees & Limits */}
          <div className="p-3.5 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-3">
            <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider block">
              Financial Fees & Charge Limits
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold mb-1">Fee %</label>
                <input
                  type="number"
                  step="0.1"
                  value={feePercent}
                  onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#121217] border border-[#2e2e42] text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-semibold mb-1">Fixed Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={feeFixedUsd}
                  onChange={(e) => setFeeFixedUsd(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#121217] border border-[#2e2e42] text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-semibold mb-1">Min ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={minAmountUsd}
                  onChange={(e) => setMinAmountUsd(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#121217] border border-[#2e2e42] text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-semibold mb-1">Max ($)</label>
                <input
                  type="number"
                  step="100"
                  value={maxAmountUsd}
                  onChange={(e) => setMaxAmountUsd(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#121217] border border-[#2e2e42] text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* API Credentials according to type */}
          <div className="p-3.5 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-3">
            <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> API Keys & Webhook Secrets
            </span>

            {/* Publishable / Client Key */}
            {gateway.category !== 'bank_direct' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {gateway.category === 'crypto_web3'
                    ? 'Merchant Deposit Wallet Address'
                    : 'Publishable Key / Client ID'}
                </label>
                <input
                  type="text"
                  value={gateway.category === 'crypto_web3' ? walletAddress : publishableKey}
                  onChange={(e) =>
                    gateway.category === 'crypto_web3'
                      ? setWalletAddress(e.target.value)
                      : setPublishableKey(e.target.value)
                  }
                  placeholder={
                    gateway.category === 'crypto_web3'
                      ? 'e.g., TYw2x8QxR99fAuraVoiceColdTRC20'
                      : 'pk_live_...'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#2e2e42] text-white font-mono text-[11px] focus:outline-hidden"
                />
              </div>
            )}

            {/* Secret Key */}
            {gateway.category !== 'bank_direct' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Secret Key / Private API Key</label>
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSecretKey ? 'Mask' : 'Reveal'}</span>
                  </button>
                </div>
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_live_..."
                  className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#2e2e42] text-white font-mono text-[11px] focus:outline-hidden"
                />
              </div>
            )}

            {/* Webhook Secret */}
            {gateway.category !== 'bank_direct' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Webhook Signing Secret</label>
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    {showWebhookSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showWebhookSecret ? 'Mask' : 'Reveal'}</span>
                  </button>
                </div>
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#2e2e42] text-white font-mono text-[11px] focus:outline-hidden"
                />
              </div>
            )}

            {/* Bank wire fields if bank_direct */}
            {gateway.category === 'bank_direct' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Escrow IBAN / Account Number</label>
                  <input
                    type="text"
                    value={bankIban}
                    onChange={(e) => setBankIban(e.target.value)}
                    placeholder="US89CHAS..."
                    className="w-full px-3 py-2 rounded-xl bg-[#121217] border border-[#2e2e42] text-white font-mono text-[11px] focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Webhook URL Endpoint */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Public Webhook Delivery URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2e2e42] text-white font-mono text-[11px] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  setCopiedUrl(true);
                  audioEngine.playSoundEffect('coin');
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="px-3 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 hover:text-white border border-[#2e2e42] text-xs font-semibold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Configure this exact URL inside the provider's developer dashboard to receive automated purchase events.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232332]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#232332] text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white text-xs font-bold shadow-md hover:brightness-110"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
