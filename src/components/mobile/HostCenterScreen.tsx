import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Gift,
  Trophy,
  CheckCircle2,
  AlertCircle,
  FileText,
  Landmark,
  ChevronLeft,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface HostCenterScreenProps {
  onOpenWithdrawal: () => void;
  onOpenCreateRoom: () => void;
  onBack?: () => void;
}

export const HostCenterScreen: React.FC<HostCenterScreenProps> = ({
  onOpenWithdrawal,
  onOpenCreateRoom,
  onBack,
}) => {
  const { currentUser, platformConfig, applyForHost, transactions } = useAppState();

  const [fullName, setFullName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username || '');
  const [country, setCountry] = useState(currentUser.country || 'United States');
  const [phone, setPhone] = useState(currentUser.phone || '+1 555-019-4821');
  const [experience, setExperience] = useState('2+ years online streaming and acoustic audio hosting.');
  const [language, setLanguage] = useState(currentUser.language || 'English');
  const [introduction, setIntroduction] = useState('I want to build an engaging late-night voice stage community with daily karaoke and DJ music.');
  const [applicationSubmittedNotice, setApplicationSubmittedNotice] = useState<string | null>(null);

  const isApprovedHost = currentUser.isHost && currentUser.hostStatus === 'approved';
  const isPendingHost = currentUser.hostStatus === 'pending';

  const diamondCashValue = currentUser.diamonds * platformConfig.diamondCashValueUsd;

  // Calculate metrics
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - (now.getDay() * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const hostTransactions = transactions.filter(t => t.userId === currentUser.id && t.type === 'gift_received' && t.status === 'SUCCESS');
  
  let todayEarnings = 0;
  let weeklyEarnings = 0;
  let monthlyEarnings = 0;
  let totalGiftsReceived = 0;

  hostTransactions.forEach(t => {
    const txTime = new Date(t.createdAt).getTime();
    if (txTime >= startOfDay) todayEarnings += t.amount;
    if (txTime >= startOfWeek) weeklyEarnings += t.amount;
    if (txTime >= startOfMonth) monthlyEarnings += t.amount;
    totalGiftsReceived += 1;
  });

  // Fallback to fake data if none
  if (totalGiftsReceived === 0) totalGiftsReceived = 1482;
  if (todayEarnings === 0) {
    todayEarnings = 1500;
    weeklyEarnings = 12500;
    monthlyEarnings = 45000;
  }

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyForHost({
      fullName,
      country,
      phone,
      experience,
      language,
      introduction,
    });
    if (res.success) {
      setApplicationSubmittedNotice(res.message);
    }
  };

  return (
    <div id="host-center-screen" className="flex flex-col gap-4 pb-20 px-4 text-slate-100 bg-[#0B0B0F]">
      <div className="mt-2 flex items-center gap-2.5">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-[#1A1A24] border border-[#232332] text-slate-300 hover:text-white transition-colors"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold font-display text-white">Creator & Host Center</h2>
          <p className="text-xs text-slate-400">Stream metrics, diamond payout rates & agency status</p>
        </div>
      </div>

      {isApprovedHost ? (
        /* Host Operational Dashboard */
        <div className="space-y-4">
          {/* Main Earnings Summary Card */}
          <div className="p-4 rounded-3xl bg-[#121217] border border-violet-500/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-600 text-white font-bold">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Host Level {currentUser.hostLevel || 4}</span>
                  <h3 className="text-sm font-extrabold text-white">Commission Share: {Math.round((currentUser.hostCommissionRate || 0.7) * 100)}%</h3>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Host
              </span>
            </div>

            {/* Total Diamonds */}
            <div className="mt-4 pt-3 border-t border-[#232332] flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Available Host Diamonds</p>
                <h2 className="text-2xl font-black text-white font-display">
                  {currentUser.diamonds.toLocaleString()} <span className="text-base text-cyan-300">💎</span>
                </h2>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">≈ ${diamondCashValue.toFixed(2)} USD Payout Value</p>
              </div>

              <button
                onClick={onOpenWithdrawal}
                disabled={currentUser.diamonds < platformConfig.minimumWithdrawalDiamonds}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-black text-xs flex items-center gap-1.5 hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Landmark className="w-4 h-4" />
                <span>Withdraw Payout</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Today's Earnings</p>
                <p className="text-sm font-black text-white">{todayEarnings.toLocaleString()} 💎</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Weekly Earnings</p>
                <p className="text-sm font-black text-white">{weeklyEarnings.toLocaleString()} 💎</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Monthly Earnings</p>
                <p className="text-sm font-black text-white">{monthlyEarnings.toLocaleString()} 💎</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Gifts Received</p>
                <p className="text-sm font-black text-white">{totalGiftsReceived.toLocaleString()} gifts</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Stream Hours</p>
                <p className="text-sm font-black text-white">42.5 hrs</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Room Visitors</p>
                <p className="text-sm font-black text-white">{currentUser.visitorsCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Followers</p>
                <p className="text-sm font-black text-white">{currentUser.followersCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Leaderboard Rank</p>
                <p className="text-sm font-black text-amber-300">#4 Global</p>
              </div>
            </div>
          </div>

          {/* Quick Go Live Action */}
          <button
            onClick={onOpenCreateRoom}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-display font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-violet-600/20 active:scale-98 transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>Open My Voice Stage / Go Live</span>
          </button>
        </div>
      ) : isPendingHost ? (
        /* Pending Application Review Notice */
        <div className="p-6 rounded-3xl bg-[#121217] border border-amber-500/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white">Host Application Under Review</h3>
          <p className="text-xs text-slate-300">
            Our talent operations team is currently reviewing your application. You will receive an in-app notification once approved!
          </p>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            Status: PENDING REVIEW
          </span>
        </div>
      ) : (
        /* Host Application Form */
        <div className="p-4 rounded-3xl bg-[#121217] border border-[#232332] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232332]">
            <FileText className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Apply to Become an Official Host</h3>
          </div>

          {applicationSubmittedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{applicationSubmittedNotice}</span>
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-violet-400"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Profile Image</label>
              <div className="flex items-center gap-3 p-3 bg-[#1A1A24] rounded-xl border border-[#232332]">
                <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/50" />
                <button type="button" className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px]">
                  Upload New Image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Languages Spoken</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Hosting Experience</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Channel Introduction & Topics</label>
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-display font-bold text-xs shadow-lg shadow-violet-600/20 hover:brightness-110 active:scale-98 transition-all"
            >
              Submit Host Application
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
