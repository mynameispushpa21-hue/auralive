import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Briefcase, Plus, Users, ShieldCheck, Copy, LogOut, Diamond, 
  Info, Coins, UserPlus, FileEdit, CreditCard, Receipt, ChevronRight, 
  ArrowLeft, Check, Trash2, Search, Share2, DollarSign, Clock, AlertCircle, Sparkles, Building2, CheckCircle2,
  Trophy, Crown
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { CreateAgencyModal } from './CreateAgencyModal';

interface AgencyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'info' | 'join' | 'create';
  autoOpenCreate?: boolean;
}

type OwnerSubView = 
  | 'menu' 
  | 'members' 
  | 'info' 
  | 'income' 
  | 'invite' 
  | 'applications' 
  | 'withdrawal' 
  | 'bills';

export const AgencyCenterModal: React.FC<AgencyCenterModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'info',
  autoOpenCreate = false,
}) => {
  const { 
    currentUser, 
    allUsers, 
    agencyApplications = [],
    createHostAgency, 
    joinHostAgency, 
    leaveHostAgency, 
    updateHostAgencySettings 
  } = useAppState();
  
  const [activeTab, setActiveTab] = useState<'info' | 'join' | 'create'>(initialTab);
  const [ownerView, setOwnerView] = useState<OwnerSubView>('menu');
  const [isCreateAgencyModalOpen, setIsCreateAgencyModalOpen] = useState(autoOpenCreate);
  const [agencyNameInput, setAgencyNameInput] = useState('');
  const [agencyIdInput, setAgencyIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const pendingAgencyApp = useMemo(() => {
    return agencyApplications.find(
      (a) => a.userId === currentUser.id && a.status === 'PENDING'
    );
  }, [agencyApplications, currentUser.id]);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (autoOpenCreate && !currentUser.isHostAgency && !currentUser.hostAgencyId) {
        setIsCreateAgencyModalOpen(true);
      }
    }
  }, [isOpen, initialTab, autoOpenCreate, currentUser.isHostAgency, currentUser.hostAgencyId]);

  // Info editing states
  const isAgencyOwner = !!currentUser.isHostAgency;
  const currentAgency = isAgencyOwner 
    ? currentUser.hostAgencyInfo 
    : allUsers.find(u => u.id === currentUser.hostAgencyId)?.hostAgencyInfo;

  const [editAgencyName, setEditAgencyName] = useState(currentAgency?.agencyName || '');
  const [editContactEmail, setEditContactEmail] = useState(currentAgency?.contactEmail || '');
  const [editContactPhone, setEditContactPhone] = useState(currentAgency?.contactPhone || '');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'usdt' | 'bank' | 'binance'>('usdt');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // Host applications
  const [pendingApplications, setPendingApplications] = useState<Array<{ id: string; userId: string; name: string; avatar: string; followers: number; appliedAt: string; message: string }>>([]);

  // Withdrawal bills
  const [withdrawalBills, setWithdrawalBills] = useState<Array<{ id: string; date: string; diamonds: number; usd: number; method: string; status: string }>>([]);

  // Members list
  const agencyMembers = useMemo(() => {
    if (!currentAgency) return [];
    const members = allUsers.filter(u => u.hostAgencyId === currentAgency.agencyId || (u.id === currentAgency.agencyId));
    return members;
  }, [allUsers, currentAgency]);

  if (!isOpen) return null;

  const isInAgency = !!currentUser.hostAgencyId;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (agencyNameInput.length < 3) {
      setErrorMsg('Agency name must be at least 3 characters.');
      return;
    }
    
    const res = await createHostAgency(agencyNameInput);
    if (res.success) {
      setSuccessMsg(res.message);
      setAgencyNameInput('');
      setOwnerView('menu');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!agencyIdInput) {
      setErrorMsg('Please enter an Agency ID.');
      return;
    }
    
    const res = await joinHostAgency(agencyIdInput);
    if (res.success) {
      setSuccessMsg(res.message);
      setAgencyIdInput('');
      setActiveTab('info');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave your current agency?')) {
      const res = await leaveHostAgency();
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg('Copied to clipboard!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgency) return;
    updateHostAgencySettings(currentAgency.agencyId, {
      agencyName: editAgencyName,
      contactEmail: editContactEmail,
      contactPhone: editContactPhone
    });
    setSuccessMsg('Agency information updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      setOwnerView('menu');
    }, 1200);
  };

  const handleApproveApplication = (appId: string) => {
    setPendingApplications(prev => prev.filter(a => a.id !== appId));
    setSuccessMsg('Host application approved! Member added to agency.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleRejectApplication = (appId: string) => {
    setPendingApplications(prev => prev.filter(a => a.id !== appId));
    setSuccessMsg('Application rejected.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const diamonds = parseInt(withdrawAmount, 10);
    const available = currentAgency?.totalDiamondsGenerated || 0;
    if (isNaN(diamonds) || diamonds < 1000) {
      setErrorMsg('Minimum withdrawal is 1,000 Diamonds.');
      return;
    }
    if (diamonds > available && available > 0) {
      setErrorMsg(`Cannot exceed available balance of ${available.toLocaleString()} Diamonds.`);
      return;
    }
    if (!withdrawAddress) {
      setErrorMsg('Please enter your receiving wallet or bank account details.');
      return;
    }

    const usdVal = diamonds * 0.005; // standard conversion
    const newBill = {
      id: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      diamonds: diamonds,
      usd: usdVal,
      method: withdrawMethod === 'usdt' ? 'USDT (TRC20)' : withdrawMethod === 'bank' ? 'Bank Wire' : 'Binance Pay',
      status: 'completed'
    };

    setWithdrawalBills(prev => [newBill, ...prev]);
    setWithdrawAmount('');
    setWithdrawAddress('');
    setSuccessMsg(`Withdrawal of ${diamonds.toLocaleString()} Diamonds ($${usdVal.toFixed(2)}) processed successfully!`);
    setTimeout(() => {
      setSuccessMsg('');
      setOwnerView('bills');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0B0B0F] border border-[#232332] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Nav */}
        <div className="px-5 py-4 border-b border-[#232332] flex items-center justify-between bg-[#121217]">
          <div className="flex items-center gap-2">
            {isAgencyOwner && ownerView !== 'menu' && (
              <button 
                onClick={() => setOwnerView('menu')}
                className="p-1.5 -ml-1 rounded-full bg-[#1A1A24] text-slate-300 hover:text-white mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              {isAgencyOwner ? (
                ownerView === 'menu' ? 'Agency Management' :
                ownerView === 'members' ? 'Agency Members' :
                ownerView === 'info' ? 'Agency Information' :
                ownerView === 'income' ? 'Member Income' :
                ownerView === 'invite' ? 'Invite Members' :
                ownerView === 'applications' ? 'Membership Applications' :
                ownerView === 'withdrawal' ? 'Diamond Withdrawal' : 'Withdrawal Bills'
              ) : 'Agency Center'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-[#1A1A24] text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AGENCY OWNER VIEW */}
          {isAgencyOwner ? (
            <div className="space-y-4">
              {ownerView === 'menu' && (
                <>
                  {/* Golden Header Card */}
                  <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 text-amber-950 overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />
                    
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-amber-800 mb-1">Total income</p>
                        <div className="flex items-center gap-2 mb-6">
                          <Diamond className="w-6 h-6 text-fuchsia-600 fill-fuchsia-500" />
                          <span className="text-3xl font-black">{currentAgency?.totalDiamondsGenerated?.toLocaleString() || 478}</span>
                        </div>
                        <p className="text-[10px] font-bold text-amber-800/80">Agency Rating: ⭐ 4.9</p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <img 
                          src={currentUser.avatar} 
                          alt="Agency Avatar" 
                          className="w-14 h-14 rounded-full border-2 border-white/50 mb-1 object-cover shadow-sm"
                        />
                        <p className="text-[10px] font-bold truncate max-w-[80px]">{currentAgency?.agencyName || 'My Agency'}</p>
                        <div className="flex items-center gap-1 text-[9px] text-amber-900/80">
                          <span>ID:{currentAgency?.agencyId?.substring(0, 5) || '15341'}</span>
                          <button onClick={() => copyToClipboard(currentAgency?.agencyId || '15341')}>
                            <Copy className="w-3 h-3 text-amber-700 hover:text-amber-900 transition-colors" />
                          </button>
                        </div>
                        <p className="text-[9px] font-bold mt-1 text-amber-900/80 flex items-center gap-1">
                          Agency country: <span>{currentUser.countryFlag || '🇵🇰'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu List */}
                  <div className="bg-[#FAF9F6] rounded-2xl overflow-hidden shadow-sm">
                    {[
                      { id: 'members', icon: Users, label: `Number of Agency members (${agencyMembers.length || currentAgency?.totalHosts || 8})`, rightText: agencyMembers.length || currentAgency?.totalHosts || 10 },
                      { id: 'info', icon: Info, label: 'Information' },
                      { id: 'income', icon: Coins, label: 'Member income' },
                      { id: 'invite', icon: UserPlus, label: 'Member invite' },
                      { id: 'applications', icon: FileEdit, label: 'Agency Membership Application', badge: pendingApplications.length },
                      { id: 'withdrawal', icon: CreditCard, label: 'Agency diamond withdrawal' },
                      { id: 'bills', icon: Receipt, label: 'Withdrawal bill to the agency owner' },
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setOwnerView(item.id as OwnerSubView)}
                        className="w-full flex items-center justify-between p-4 border-b border-slate-200 last:border-0 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-amber-500" />
                          <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                              {item.badge}
                            </span>
                          ) : item.rightText ? (
                            <span className="text-xs text-slate-400 font-bold">{item.rightText}</span>
                          ) : null}
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 1. MEMBERS LIST SUB-VIEW */}
              {ownerView === 'members' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-semibold">Active Hosts ({agencyMembers.length || 1})</p>
                    <button 
                      onClick={() => setOwnerView('invite')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Host
                    </button>
                  </div>

                  <div className="space-y-2">
                    {agencyMembers.map((member, idx) => (
                      <div key={member.id} className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={member.avatar} alt={member.displayName} className="w-10 h-10 rounded-full object-cover border border-[#33334d]" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-white">{member.displayName}</p>
                              {member.id === currentUser.id && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">Owner</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">ID: {member.id.substring(0, 8)} • Lv.{member.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-fuchsia-400 font-bold text-xs">
                            <Diamond className="w-3.5 h-3.5 fill-fuchsia-400" />
                            <span>{member.diamonds.toLocaleString()}</span>
                          </div>
                          <span className="text-[9px] text-emerald-400 font-semibold">Active Host</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. INFORMATION SUB-VIEW */}
              {ownerView === 'info' && (
                <form onSubmit={handleSaveInfo} className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#232332] space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Agency Name</label>
                      <input 
                        type="text" 
                        value={editAgencyName}
                        onChange={(e) => setEditAgencyName(e.target.value)}
                        className="w-full bg-[#0B0B0F] border border-[#232332] rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Contact Email</label>
                      <input 
                        type="email" 
                        value={editContactEmail}
                        onChange={(e) => setEditContactEmail(e.target.value)}
                        placeholder="agency@example.com"
                        className="w-full bg-[#0B0B0F] border border-[#232332] rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Contact WhatsApp / Phone</label>
                      <input 
                        type="tel" 
                        value={editContactPhone}
                        onChange={(e) => setEditContactPhone(e.target.value)}
                        placeholder="+1 234 567 890"
                        className="w-full bg-[#0B0B0F] border border-[#232332] rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="pt-2 border-t border-[#232332] flex justify-between items-center text-xs">
                      <span className="text-slate-400">Commission Cut</span>
                      <span className="text-indigo-400 font-bold">20% of Diamonds</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </form>
              )}

              {/* 3. MEMBER INCOME SUB-VIEW */}
              {ownerView === 'income' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#232332]">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">This Month Income</p>
                      <p className="text-lg font-black text-fuchsia-400 flex items-center gap-1">
                        <Diamond className="w-4 h-4 fill-fuchsia-400" />
                        {currentAgency?.totalDiamondsGenerated?.toLocaleString() || 478}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#232332]">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Owner Commission</p>
                      <p className="text-lg font-black text-emerald-400">
                        ${(((currentAgency?.totalDiamondsGenerated || 478) * 0.005)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#232332] space-y-3">
                    <h4 className="text-xs font-bold text-white">Top Contributing Hosts</h4>
                    <div className="space-y-2">
                      {agencyMembers.map((m, idx) => (
                        <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-[#232332] last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                            <span className="text-slate-200 font-semibold">{m.displayName}</span>
                          </div>
                          <span className="text-fuchsia-400 font-mono font-bold flex items-center gap-1">
                            <Diamond className="w-3 h-3 fill-fuchsia-400" />
                            {m.diamonds.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MEMBER INVITE SUB-VIEW */}
              {ownerView === 'invite' && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-violet-900/20 border border-indigo-500/30 space-y-4">
                    <UserPlus className="w-12 h-12 text-indigo-400 mx-auto" />
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">Invite Hosts to {currentAgency?.agencyName}</h3>
                      <p className="text-xs text-slate-400">Share your Agency ID with hosts so they can join directly from their Me screen.</p>
                    </div>
                    
                    <div className="p-3 rounded-xl bg-[#0B0B0F] border border-indigo-500/40 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] text-slate-400">Your Agency ID</p>
                        <p className="text-sm font-mono font-bold text-indigo-300">{currentAgency?.agencyId}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(currentAgency?.agencyId || '')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => copyToClipboard(`Join my Agency "${currentAgency?.agencyName}" using Agency ID: ${currentAgency?.agencyId}`)}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Invitation Link & Message
                  </button>
                </div>
              )}

              {/* 5. MEMBERSHIP APPLICATION SUB-VIEW */}
              {ownerView === 'applications' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-semibold">Pending Join Requests ({pendingApplications.length})</p>
                  
                  {pendingApplications.length === 0 ? (
                    <div className="p-8 text-center bg-[#1A1A24] rounded-2xl border border-[#232332]">
                      <FileEdit className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 font-bold">No pending applications</p>
                      <p className="text-xs text-slate-500">New host requests will appear here</p>
                    </div>
                  ) : (
                    pendingApplications.map(app => (
                      <div key={app.id} className="p-4 rounded-xl bg-[#1A1A24] border border-[#232332] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={app.avatar} alt={app.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="text-xs font-bold text-white">{app.name}</p>
                              <p className="text-[10px] text-slate-400">{app.followers} Followers • {app.appliedAt}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic bg-[#0B0B0F] p-2.5 rounded-lg border border-[#232332]">"{app.message}"</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRejectApplication(app.id)}
                            className="flex-1 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => handleApproveApplication(app.id)}
                            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 6. DIAMOND WITHDRAWAL SUB-VIEW */}
              {ownerView === 'withdrawal' && (
                <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-300 font-semibold">Available Agency Balance</p>
                      <div className="flex items-center gap-1.5 text-xl font-black text-white">
                        <Diamond className="w-5 h-5 text-fuchsia-400 fill-fuchsia-400" />
                        <span>{currentAgency?.totalDiamondsGenerated?.toLocaleString() || 478} Diamonds</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      ≈ ${(((currentAgency?.totalDiamondsGenerated || 478) * 0.005)).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#232332] space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Withdrawal Amount (Diamonds)</label>
                      <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full bg-[#0B0B0F] border border-[#232332] rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Payout Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'usdt', label: 'USDT (TRC20)' },
                          { id: 'bank', label: 'Bank Wire' },
                          { id: 'binance', label: 'Binance Pay' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setWithdrawMethod(m.id as any)}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-colors ${withdrawMethod === m.id ? 'bg-amber-500 text-slate-950' : 'bg-[#0B0B0F] text-slate-400 border border-[#232332]'}`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Destination Address / Account</label>
                      <input 
                        type="text" 
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        placeholder={withdrawMethod === 'usdt' ? 'T...' : withdrawMethod === 'bank' ? 'IBAN / Account number' : 'Binance Pay ID'}
                        className="w-full bg-[#0B0B0F] border border-[#232332] rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Submit Withdrawal Request
                  </button>
                </form>
              )}

              {/* 7. WITHDRAWAL BILLS SUB-VIEW */}
              {ownerView === 'bills' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-semibold">Settlement Invoices & Bills</p>
                    <button 
                      onClick={() => setOwnerView('withdrawal')}
                      className="text-xs text-amber-400 font-bold hover:underline"
                    >
                      + New Withdrawal
                    </button>
                  </div>

                  <div className="space-y-2">
                    {withdrawalBills.map(bill => (
                      <div key={bill.id} className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#232332] flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{bill.id}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                              {bill.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{bill.date} • {bill.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">+${bill.usd.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">({bill.diamonds.toLocaleString()} 💎)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isInAgency ? (
            /* AGENCY MEMBER VIEW */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-indigo-600/10 border border-indigo-500/30 text-center">
                <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-white">{currentAgency?.agencyName}</h3>
                <p className="text-sm text-indigo-300 font-semibold mb-3">
                  Agency Member
                </p>
                <div className="flex items-center justify-center gap-2 bg-[#0B0B0F]/50 py-1.5 px-3 rounded-full border border-indigo-500/20 mx-auto w-max">
                  <span className="text-xs text-slate-400">ID:</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{currentAgency?.agencyId}</span>
                  <button onClick={() => copyToClipboard(currentAgency?.agencyId || '')} className="text-indigo-400">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#1A1A24] border border-[#232332] text-center">
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">Total Members</p>
                  <p className="text-lg font-black text-white">{currentAgency?.totalHosts || 1}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A24] border border-[#232332] text-center">
                  <p className="text-[10px] text-slate-400 font-semibold mb-1">Commission Rate</p>
                  <p className="text-lg font-black text-indigo-400">
                    {((currentAgency?.agencyCommissionRate || 0) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <button
                onClick={handleLeave}
                className="w-full mt-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Leave Agency
              </button>
            </div>
          ) : (
            /* CREATE OR JOIN AGENCY VIEW */
            <div className="space-y-4">
              <div className="flex bg-[#1A1A24] rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'info' ? 'bg-[#232332] text-white' : 'text-slate-400'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('join')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'join' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  Join
                </button>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setIsCreateAgencyModalOpen(true);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'create' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
                >
                  Create
                </button>
              </div>

              {/* Pending Agency Application Alert Card */}
              {pendingAgencyApp && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2B1B0E] to-[#1F130A] border border-amber-500/40 text-amber-100 space-y-2.5 shadow-lg animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Application Under Review</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      ADMIN QUEUED
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">{pendingAgencyApp.agencyName}</h4>
                    <p className="text-xs text-amber-200/80 mt-0.5">
                      Your agency request has been submitted to the Admin Panel. An administrator will review your ID verification and approve your agency shortly.
                    </p>
                  </div>

                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-amber-300/70 border-t border-amber-500/20">
                    <span>Country: <strong className="text-white">{pendingAgencyApp.country}</strong></span>
                    <span>KYC: <strong className="text-emerald-400 font-bold">2 Photos Attached</strong></span>
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-4">
                  {/* Golden Trophy & Lion Agency Header Banner (matches screenshot background) */}
                  <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-b from-[#3a220d] via-[#221408] to-[#120b06] border border-amber-600/40 text-center shadow-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(245,158,11,0.25),_transparent_70%)] pointer-events-none" />

                    {/* Top row of banner: Agency title + "Create" button on top right */}
                    <div className="relative z-10 flex items-center justify-between mb-3">
                      <div className="w-16" />
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <h3 className="text-base font-black text-amber-100 tracking-wider">Agency</h3>
                      </div>
                      <button
                        onClick={() => setIsCreateAgencyModalOpen(true)}
                        className="px-4 py-1 rounded-full bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        Create
                      </button>
                    </div>

                    {/* Center Trophy and Lion Artwork Display */}
                    <div className="relative z-10 py-4 flex flex-col items-center justify-center">
                      <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-yellow-200 p-0.5 shadow-xl shadow-amber-950/60">
                          <div className="w-full h-full rounded-full bg-[#1e1308] flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-amber-400" />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-md">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <h4 className="text-lg font-black text-white">Host Agency Center</h4>
                      <p className="text-xs text-amber-200/70 max-w-[270px] mx-auto mt-1 leading-relaxed">
                        Become an official agency owner. Recruit top talent, organize live events, and earn revenue commissions.
                      </p>

                      <div className="flex gap-3 justify-center pt-5 w-full">
                        <button
                          onClick={() => setActiveTab('join')}
                          className="flex-1 py-3 rounded-full bg-[#1A1A24] border border-[#2e2e42] text-slate-300 hover:text-white font-bold text-xs transition-colors"
                        >
                          Join Existing
                        </button>
                        <button
                          onClick={() => setIsCreateAgencyModalOpen(true)}
                          className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#7B3F11] via-[#8B4815] to-[#60310D] hover:from-[#8B4815] hover:to-[#73370C] text-white font-bold text-xs shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Agency</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Agency Perks */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#14141E] border border-[#232332] text-left">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 w-max mb-1.5">
                        <Diamond className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-white">20% Cut Revenue</p>
                      <p className="text-[10px] text-slate-400">Earn commission on all member hosts' diamonds</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#14141E] border border-[#232332] text-left">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 w-max mb-1.5">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-white">Unlimited Hosts</p>
                      <p className="text-[10px] text-slate-400">Recruit voice talent and build your network</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'join' && (
                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#232332]">
                    <label className="block text-xs font-bold text-slate-400 mb-2">Enter Agency ID</label>
                    <input
                      type="text"
                      value={agencyIdInput}
                      onChange={(e) => setAgencyIdInput(e.target.value)}
                      placeholder="e.g. user_123"
                      className="w-full bg-[#0B0B0F] border border-[#232332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Apply to Join
                  </button>
                </form>
              )}

              {activeTab === 'create' && (
                <div className="p-6 rounded-3xl bg-[#151522] border border-amber-500/30 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Agency Application</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Fill out your official agency name, verified ID information, and contact details to register your host agency.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsCreateAgencyModalOpen(true)}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#7B3F11] via-[#8B4815] to-[#60310D] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Open Application Form
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CREATE AGENCY FORM MODAL (Matches user screenshot) */}
        <CreateAgencyModal
          isOpen={isCreateAgencyModalOpen}
          onClose={() => setIsCreateAgencyModalOpen(false)}
          onSuccess={() => {
            setIsCreateAgencyModalOpen(false);
            setSuccessMsg('Agency application submitted and approved!');
            setTimeout(() => setSuccessMsg(''), 3000);
          }}
        />
      </motion.div>
    </div>
  );
};
