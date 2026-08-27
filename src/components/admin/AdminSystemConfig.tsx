import React, { useState } from 'react';
import { Sliders, Check, ShieldCheck, DollarSign, Radio, Database, RefreshCw, Cpu } from 'lucide-react';
import { useAppState } from '../../services/stateStore';

export const AdminSystemConfig: React.FC = () => {
  const { platformConfig, adminUpdatePlatformConfig } = useAppState();

  const [coinToDiamondRate, setCoinToDiamondRate] = useState<number>(platformConfig.coinToDiamondRate);
  const [defaultHostCommission, setDefaultHostCommission] = useState<number>(platformConfig.defaultHostCommissionRate * 100);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(platformConfig.minimumWithdrawalDiamonds);
  const [diamondCashVal, setDiamondCashVal] = useState<number>(platformConfig.diamondCashValueUsd);
  const [rtcProvider, setRtcProvider] = useState<'agora' | 'zego' | 'livekit' | 'webrtc'>(platformConfig.rtcProvider);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdatePlatformConfig({
      coinToDiamondRate,
      defaultHostCommissionRate: defaultHostCommission / 100,
      minimumWithdrawalDiamonds: minWithdrawal,
      diamondCashValueUsd: diamondCashVal,
      rtcProvider,
    });
    setFeedback('Platform financial rules and RTC configuration updated successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div>
        <h2 className="text-xl font-bold font-display text-white">System Architecture & Financial Config</h2>
        <p className="text-xs text-slate-400">Global server-authoritative conversion rates, minimum payout floors & RTC SDK bridges</p>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Financial Rules Matrix */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#232332]">
            <DollarSign className="w-4 h-4 text-violet-400" />
            <h3 className="font-bold text-sm text-white">Financial & Conversion Engine Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Coin-to-Diamond Conversion Ratio</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="2.0"
                value={coinToDiamondRate}
                onChange={(e) => setCoinToDiamondRate(parseFloat(e.target.value) || 1.0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">100 Coin Gift = {Math.round(100 * coinToDiamondRate)} Gross Diamonds generated</p>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Default Creator Host Commission (%)</label>
              <input
                type="number"
                min="10"
                max="95"
                value={defaultHostCommission}
                onChange={(e) => setDefaultHostCommission(parseFloat(e.target.value) || 70)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Host receives {defaultHostCommission}% of generated diamonds; Platform retains {100 - defaultHostCommission}%</p>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Minimum Diamond Cashout Threshold</label>
              <input
                type="number"
                min="100"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(parseInt(e.target.value, 10) || 2000)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Minimum diamonds required to submit a payout request (e.g. 2,000 💎)</p>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Diamond USD Cash Value ($/diamond)</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={diamondCashVal}
                onChange={(e) => setDiamondCashVal(parseFloat(e.target.value) || 0.01)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">100 Diamonds = ${(100 * diamondCashVal).toFixed(2)} USD</p>
            </div>
          </div>
        </div>

        {/* RTC Provider Selector */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-[#232332] shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#232332]">
            <Cpu className="w-4 h-4 text-violet-400" />
            <h3 className="font-bold text-sm text-white">RTC Real-Time Voice Infrastructure Bridge</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'agora', name: 'Agora RTC Engine', desc: 'Global low-latency voice mesh' },
              { id: 'zego', name: 'ZegoCloud Audio', desc: 'High-fidelity acoustic party sound' },
              { id: 'livekit', name: 'LiveKit OpenRTC', desc: 'Self-hosted SFU WebRTC' },
              { id: 'webrtc', name: 'Custom Mesh WebRTC', desc: 'Direct peer-to-peer relay' },
            ].map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => setRtcProvider(prov.id as any)}
                className={`p-3 rounded-2xl border flex flex-col justify-between text-left transition-all ${
                  rtcProvider === prov.id
                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                    : 'bg-[#1A1A24] border-[#232332] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white text-xs">{prov.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{prov.desc}</p>
                </div>
                {rtcProvider === prov.id && (
                  <span className="text-[9px] font-bold text-violet-300 mt-2 block">ACTIVE PROVIDER ✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-bold text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          Save Platform System Configuration
        </button>
      </form>
    </div>
  );
};
