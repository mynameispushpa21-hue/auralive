import React, { useState } from 'react';
import { 
  Search, Building2, CheckCircle2, DollarSign, Check, X, ShieldAlert, 
  Edit, UserPlus, Users, Eye, Phone, MapPin, Globe, Clock, 
  AlertTriangle, Sparkles, Shield, RefreshCw
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile, AgencyApplication } from '../../types';

export const AdminHostAgenciesTable: React.FC = () => {
  const { 
    allUsers, 
    updateHostAgencySettings, 
    adminPromoteToHostAgency,
    agencyApplications = [],
    adminApproveAgencyApplication,
    adminRejectAgencyApplication,
  } = useAppState();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'active' | 'history'>('pending');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit Active Agency Modal State
  const [editingAgency, setEditingAgency] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    agencyName: '',
    agencyCommissionRate: 0,
    status: 'active' as 'active' | 'suspended'
  });

  // Add Agency Modal State (Manual Promo)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedNewAgency, setSelectedNewAgency] = useState<UserProfile | null>(null);
  const [addForm, setAddForm] = useState({
    agencyName: '',
    agencyCommissionRate: 15,
  });

  // Pending Application Commission custom rates
  const [pendingCommissionRates, setPendingCommissionRates] = useState<Record<string, number>>({});

  // Document Inspection Modal
  const [inspectingApplication, setInspectingApplication] = useState<AgencyApplication | null>(null);
  const [activeDocView, setActiveDocView] = useState<'front' | 'back'>('front');

  // Reject Application Modal
  const [rejectingApplication, setRejectingApplication] = useState<AgencyApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('ID verification documents were unclear or invalid.');

  // Data subsets
  const pendingApps = agencyApplications.filter((a) => a.status === 'PENDING');
  const pastApps = agencyApplications.filter((a) => a.status !== 'PENDING');
  const activeAgencies = allUsers.filter((u) => u.isHostAgency && u.hostAgencyInfo);

  // Filter pending
  const filteredPending = pendingApps.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.agencyName.toLowerCase().includes(q) ||
      a.user.displayName.toLowerCase().includes(q) ||
      a.user.numericId?.includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.phone.includes(q)
    );
  });

  // Filter active
  const filteredAgencies = activeAgencies.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) || 
      u.numericId?.includes(q) || 
      u.email.toLowerCase().includes(q) ||
      u.hostAgencyInfo?.agencyName.toLowerCase().includes(q) ||
      u.hostAgencyInfo?.country?.toLowerCase().includes(q)
    );
  });

  // Filter history
  const filteredHistory = pastApps.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.agencyName.toLowerCase().includes(q) ||
      a.user.displayName.toLowerCase().includes(q) ||
      a.user.numericId?.includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  });

  const potentialAgencies = allUsers.filter(u => 
    !u.isHostAgency &&
    (userSearchQuery.trim() === '' || 
      u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      u.numericId?.includes(userSearchQuery) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
  ).slice(0, 5);

  const handleUpdateAgencyStatus = (userId: string, isActive: boolean) => {
    updateHostAgencySettings(userId, { status: isActive ? 'active' : 'suspended' });
    setFeedback(`${isActive ? 'Reactivated' : 'Suspended'} agency account for user ID ${userId}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEditClick = (agencyOwner: UserProfile) => {
    setEditingAgency(agencyOwner);
    setEditForm({
      agencyName: agencyOwner.hostAgencyInfo?.agencyName || '',
      agencyCommissionRate: (agencyOwner.hostAgencyInfo?.agencyCommissionRate || 0) * 100,
      status: agencyOwner.hostAgencyInfo?.status || 'active'
    });
  };

  const handleSaveEdit = () => {
    if (!editingAgency) return;

    updateHostAgencySettings(editingAgency.id, {
      agencyName: editForm.agencyName,
      agencyCommissionRate: editForm.agencyCommissionRate / 100,
      status: editForm.status
    });

    setFeedback(`Updated agency details for ${editForm.agencyName}`);
    setTimeout(() => setFeedback(null), 3000);
    setEditingAgency(null);
  };

  const handleUpdateCommission = (agencyId: string, ratePct: number) => {
    updateHostAgencySettings(agencyId, { agencyCommissionRate: ratePct / 100 });
    setFeedback(`Updated commission cut to ${ratePct}%`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddAgency = () => {
    if (!selectedNewAgency) return;

    adminPromoteToHostAgency(
      selectedNewAgency.id, 
      addForm.agencyName, 
      addForm.agencyCommissionRate / 100
    );

    setFeedback(`Successfully promoted ${selectedNewAgency.displayName} to Host Agency Owner!`);
    setTimeout(() => setFeedback(null), 3000);
    
    setIsAddModalOpen(false);
    setSelectedNewAgency(null);
    setUserSearchQuery('');
    setAddForm({ agencyName: '', agencyCommissionRate: 15 });
  };

  const handleApprovePending = (app: AgencyApplication) => {
    const rate = pendingCommissionRates[app.id] !== undefined ? pendingCommissionRates[app.id] / 100 : app.commissionRate || 0.15;
    adminApproveAgencyApplication(app.id, rate);
    setFeedback(`Approved agency application for "${app.agencyName}"! Owner promoted.`);
    setTimeout(() => setFeedback(null), 3500);
    if (inspectingApplication?.id === app.id) {
      setInspectingApplication(null);
    }
  };

  const handleRejectPending = () => {
    if (!rejectingApplication) return;
    adminRejectAgencyApplication(rejectingApplication.id, rejectReason);
    setFeedback(`Rejected agency application for "${rejectingApplication.agencyName}".`);
    setTimeout(() => setFeedback(null), 3500);
    setRejectingApplication(null);
    if (inspectingApplication?.id === rejectingApplication.id) {
      setInspectingApplication(null);
    }
  };

  return (
    <div className="space-y-5 text-slate-100">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-white">Host Agency Management</h2>
            {pendingApps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 animate-pulse">
                {pendingApps.length} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Review incoming agency applications, approve new talent networks, and manage commission cuts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agencies or applicants..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-56 sm:w-64"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-950/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Agency</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#121217] border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-black text-white mt-1">{pendingApps.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting verification</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121217] border border-indigo-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Active Agencies</p>
            <p className="text-2xl font-black text-white mt-1">{activeAgencies.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Verified broadcaster networks</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121217] border border-emerald-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Avg Commission Cut</p>
            <p className="text-2xl font-black text-white mt-1">
              {activeAgencies.length > 0 
                ? `${(activeAgencies.reduce((sum, a) => sum + (a.hostAgencyInfo?.agencyCommissionRate || 0.15), 0) / activeAgencies.length * 100).toFixed(0)}%` 
                : '15%'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Agency revenue share</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-[#232332] pb-1">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-[#1A1A24]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Applications</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            pendingApps.length > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-[#232332] text-slate-400'
          }`}>
            {pendingApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'active'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-white hover:bg-[#1A1A24]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Active Agencies</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white">
            {activeAgencies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-[#232332] text-white'
              : 'text-slate-400 hover:text-white hover:bg-[#1A1A24]'
          }`}
        >
          <span>History & Decisions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#1A1A24] text-slate-400">
            {pastApps.length}
          </span>
        </button>
      </div>

      {/* 1. PENDING APPLICATIONS TAB */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {filteredPending.length === 0 ? (
            <div className="rounded-2xl bg-[#121217] border border-[#232332] p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#1A1A24] text-slate-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">No Pending Agency Applications</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All agency applications have been processed. When a user submits the "Create Agency" form in the mobile app, their request will appear right here for approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPending.map((app) => {
                const currentCutPct = pendingCommissionRates[app.id] ?? Math.round((app.commissionRate || 0.15) * 100);

                return (
                  <div
                    key={app.id}
                    className="rounded-2xl bg-[#121217] border border-amber-500/30 p-5 shadow-xl hover:border-amber-500/50 transition-all space-y-4"
                  >
                    {/* Top Row: User & Agency Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232332] pb-4">
                      {/* Applicant details */}
                      <div className="flex items-center gap-3.5">
                        <img
                          src={app.user.avatar}
                          alt={app.user.displayName}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/40 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">{app.user.displayName}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                              UID: {app.user.numericId || app.userId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              PENDING REVIEW
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{app.user.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {new Date(app.submittedAt).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Proposed Agency Name badge */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-[#24170D] to-[#170E08] border border-amber-500/40 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Proposed Agency</span>
                          <h4 className="text-sm font-black text-white">{app.agencyName}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Contact Details & ID Documents Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Contact and address */}
                      <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#232332] space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicant Info</p>
                        <div className="space-y-1.5 text-slate-300">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>Country: <strong className="text-white">{app.country}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Phone: <strong className="text-white font-mono">{app.phone}</strong></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span className="text-slate-400">Address: <span className="text-slate-200">{app.address}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* ID Documents Preview */}
                      <div className="md:col-span-2 p-3.5 rounded-xl bg-[#1A1A24] border border-[#232332] space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            <span>KYC Verification Documents (Click to Inspect)</span>
                          </p>
                          <span className="text-[10px] text-amber-400 font-bold">2 Photos Attached</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {/* Front */}
                          <div
                            onClick={() => {
                              setInspectingApplication(app);
                              setActiveDocView('front');
                            }}
                            className="relative group cursor-pointer rounded-xl overflow-hidden border border-[#2e2e42] hover:border-amber-400 transition-all bg-black/40 h-24 flex items-center justify-center"
                          >
                            <img
                              src={app.idCardFront}
                              alt="ID Front"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                              <span className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-amber-300 flex items-center gap-1 border border-amber-500/30">
                                <Eye className="w-3 h-3" /> ID Front
                              </span>
                            </div>
                          </div>

                          {/* Back */}
                          <div
                            onClick={() => {
                              setInspectingApplication(app);
                              setActiveDocView('back');
                            }}
                            className="relative group cursor-pointer rounded-xl overflow-hidden border border-[#2e2e42] hover:border-amber-400 transition-all bg-black/40 h-24 flex items-center justify-center"
                          >
                            <img
                              src={app.idCardBack}
                              alt="ID Back"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                              <span className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-amber-300 flex items-center gap-1 border border-amber-500/30">
                                <Eye className="w-3 h-3" /> ID Back
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Set Commission Rate & Decisions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#232332]/60">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-slate-400">Commission Cut:</label>
                        <div className="flex items-center gap-1">
                          {[10, 15, 20, 25].map((pct) => (
                            <button
                              key={pct}
                              onClick={() => setPendingCommissionRates({ ...pendingCommissionRates, [app.id]: pct })}
                              className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                                currentCutPct === pct
                                  ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                                  : 'bg-[#1A1A24] text-slate-400 border-[#232332] hover:text-white'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-500">(agency keeps {currentCutPct}% cut)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRejectingApplication(app);
                            setRejectReason('ID verification documents were unclear or invalid.');
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline Request</span>
                        </button>

                        <button
                          onClick={() => handleApprovePending(app)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Promote</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. ACTIVE AGENCIES TAB */}
      {activeSubTab === 'active' && (
        <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1A1A24] text-slate-400 uppercase font-bold border-b border-[#232332]">
                <tr>
                  <th className="p-3.5">Agency Details</th>
                  <th className="p-3.5">Owner / Admin</th>
                  <th className="p-3.5">Cut %</th>
                  <th className="p-3.5">Network Stats</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Quick Edit Cut %</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232332]/60">
                {filteredAgencies.map((agencyOwner) => {
                  const agencyInfo = agencyOwner.hostAgencyInfo;
                  if (!agencyInfo) return null;
                  
                  const isActive = agencyInfo.status === 'active';
                  
                  return (
                    <tr key={agencyOwner.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                      {/* Agency Identity */}
                      <td className="p-3.5">
                        <p className="font-bold text-amber-400 text-sm">{agencyInfo.agencyName}</p>
                        <p className="text-[10px] text-slate-500">ID: {agencyInfo.agencyId}</p>
                        {agencyInfo.country && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3 text-slate-500" /> {agencyInfo.country}
                          </p>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={agencyOwner.avatar} alt={agencyOwner.displayName} className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/50" />
                          <div>
                            <p className="font-bold text-white flex items-center gap-1">
                              <span>{agencyOwner.displayName}</span>
                            </p>
                            <p className="text-[10px] text-slate-400">UID: {agencyOwner.numericId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Commission Rate */}
                      <td className="p-3.5">
                        <span className="font-bold text-emerald-400 text-sm">{(agencyInfo.agencyCommissionRate * 100).toFixed(1)}%</span>
                        <p className="text-[9px] text-slate-500 uppercase">Agency Cut</p>
                      </td>

                      {/* Network Stats */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-slate-200 flex items-center gap-1">
                              <Users className="w-3 h-3 text-indigo-400" /> {agencyInfo.totalHosts}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase">Hosts</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-emerald-400" /> {agencyInfo.totalAgencyRevenueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase">Revenue</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30 flex items-center gap-1 w-max">
                            <ShieldAlert className="w-3 h-3" /> SUSPENDED
                          </span>
                        )}
                      </td>

                      {/* Quick Edit Cut % */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[5, 10, 15, 20, 25].map((pct) => {
                            const currentRatePct = Math.round(agencyInfo.agencyCommissionRate * 100);
                            return (
                              <button
                                key={pct}
                                onClick={() => handleUpdateCommission(agencyOwner.id, pct)}
                                className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-all ${
                                  currentRatePct === pct
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-[#1A1A24] text-slate-400 border-[#232332] hover:text-white'
                                }`}
                              >
                                {pct}%
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditClick(agencyOwner)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-[11px] border border-amber-500/20 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        {isActive ? (
                          <button
                            onClick={() => handleUpdateAgencyStatus(agencyOwner.id, false)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[11px] border border-rose-500/20 transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateAgencyStatus(agencyOwner.id, true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/20 transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredAgencies.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No host agencies found. Approve pending requests or add an agency manually.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. HISTORY & DECISIONS TAB */}
      {activeSubTab === 'history' && (
        <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1A1A24] text-slate-400 uppercase font-bold border-b border-[#232332]">
                <tr>
                  <th className="p-3.5">Agency Name</th>
                  <th className="p-3.5">Applicant</th>
                  <th className="p-3.5">Country & Contact</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Submitted / Reviewed</th>
                  <th className="p-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232332]/60">
                {filteredHistory.map((app) => (
                  <tr key={app.id} className="hover:bg-[#1A1A24]/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">
                      {app.agencyName}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <img src={app.user.avatar} alt={app.user.displayName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-200">{app.user.displayName}</p>
                          <p className="text-[10px] text-slate-500">UID: {app.user.numericId || app.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      <p>{app.country}</p>
                      <p className="text-[10px] font-mono text-slate-500">{app.phone}</p>
                    </td>
                    <td className="p-3.5">
                      {app.status === 'APPROVED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                          APPROVED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                          DECLINED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      <p>Sub: {new Date(app.submittedAt).toLocaleDateString()}</p>
                      {app.reviewedAt && <p className="text-slate-500 text-[10px]">Rev: {new Date(app.reviewedAt).toLocaleDateString()}</p>}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                      {app.adminNotes || '—'}
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No review history records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL */}
      {inspectingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#121217] border border-amber-500/40 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#232332] flex items-center justify-between bg-[#1A1A24]/60">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">KYC ID Verification Inspector</h3>
                  <p className="text-[10px] text-slate-400">
                    {inspectingApplication.agencyName} • Applicant: {inspectingApplication.user.displayName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingApplication(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Toggle Front / Back */}
              <div className="flex bg-[#1A1A24] rounded-xl p-1 max-w-xs mx-auto border border-[#232332]">
                <button
                  onClick={() => setActiveDocView('front')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDocView === 'front' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ID Card Front
                </button>
                <button
                  onClick={() => setActiveDocView('back')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDocView === 'back' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ID Card Back
                </button>
              </div>

              {/* Document Image Display */}
              <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-[#2e2e42] h-72 flex items-center justify-center p-2">
                <img
                  src={activeDocView === 'front' ? inspectingApplication.idCardFront : inspectingApplication.idCardBack}
                  alt={activeDocView === 'front' ? 'ID Front' : 'ID Back'}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[11px] font-bold text-amber-300 border border-amber-500/30">
                  {activeDocView === 'front' ? 'Official Document Front' : 'Official Document Back'}
                </div>
              </div>

              {/* Applicant Metadata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332]">
                  <span className="text-[10px] text-slate-500 uppercase">Country</span>
                  <p className="font-bold text-white mt-0.5">{inspectingApplication.country}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332]">
                  <span className="text-[10px] text-slate-500 uppercase">Phone</span>
                  <p className="font-bold text-white font-mono mt-0.5">{inspectingApplication.phone}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#232332] sm:col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase">Registered Address</span>
                  <p className="font-bold text-white mt-0.5 truncate">{inspectingApplication.address}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#232332] flex items-center justify-between bg-[#1A1A24]/40">
              <button
                onClick={() => {
                  setRejectingApplication(inspectingApplication);
                  setRejectReason('ID document front/back images do not meet legal clarity requirements.');
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 transition-colors"
              >
                Reject Document
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingApplication(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApprovePending(inspectingApplication)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121217] border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[#232332] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Decline Agency Application
              </h3>
              <button onClick={() => setRejectingApplication(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-300">
                You are declining the application for <strong className="text-white">"{rejectingApplication.agencyName}"</strong> submitted by <strong className="text-white">{rejectingApplication.user.displayName}</strong>.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Reason for Rejection (sent to applicant)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'ID documents unreadable or blurry.',
                  'Address information incomplete.',
                  'Agency name violates naming guidelines.',
                  'Invalid contact phone number.'
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setRejectReason(preset)}
                    className="px-2 py-1 rounded-lg bg-[#1A1A24] border border-[#232332] text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#232332] flex justify-end gap-2 bg-[#1A1A24]/30">
              <button
                onClick={() => setRejectingApplication(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ACTIVE AGENCY MODAL */}
      {editingAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-400" />
                Edit Agency Commission
              </h3>
              <button onClick={() => setEditingAgency(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agency Name</label>
                <input
                  type="text"
                  value={editForm.agencyName}
                  onChange={(e) => setEditForm({ ...editForm, agencyName: e.target.value })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agency Commission Cut (%)</label>
                <p className="text-[10px] text-slate-500 mb-2">Percentage of earnings the agency takes from their network broadcasters.</p>
                <input
                  type="number"
                  value={editForm.agencyCommissionRate}
                  onChange={(e) => setEditForm({ ...editForm, agencyCommissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'suspended' })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 appearance-none"
                >
                  <option value="active">Active (Earning enabled)</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#232332] flex justify-end gap-3 bg-[#1A1A24]/30">
              <button 
                onClick={() => setEditingAgency(null)}
                className="px-4 py-2 rounded-xl text-slate-300 font-bold hover:bg-white/5 transition-colors text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD AGENCY MODAL (MANUAL PROMOTION) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Add New Host Agency
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              {!selectedNewAgency ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search User to Appoint as Agency Owner</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Name, ID, or Email..."
                      className="w-full pl-9 pr-3 py-2 bg-[#1A1A24] border border-[#232332] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  
                  {potentialAgencies.length > 0 && userSearchQuery.trim() !== '' && (
                    <div className="mt-2 max-h-40 overflow-y-auto bg-[#1A1A24] rounded-xl border border-[#232332]">
                      {potentialAgencies.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedNewAgency(u)}
                          className="w-full text-left p-2.5 hover:bg-[#232332] transition-colors flex items-center gap-3 border-b border-[#232332] last:border-0"
                        >
                          <img src={u.avatar} alt={u.displayName} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-slate-200 text-xs">{u.displayName}</p>
                            <p className="text-[10px] text-slate-500">ID: {u.numericId}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {potentialAgencies.length === 0 && userSearchQuery.trim() !== '' && (
                    <div className="mt-2 p-3 text-center text-xs text-slate-500 bg-[#1A1A24] rounded-xl border border-[#232332]">
                      No matching users found.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-[#1A1A24] p-3 rounded-xl border border-[#232332]">
                    <div className="flex items-center gap-3">
                      <img src={selectedNewAgency.avatar} alt={selectedNewAgency.displayName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white text-sm">{selectedNewAgency.displayName}</p>
                        <p className="text-[10px] text-slate-400">ID: {selectedNewAgency.numericId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNewAgency(null)}
                      className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-[#232332]"
                    >
                      Change User
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agency Name</label>
                    <input
                      type="text"
                      value={addForm.agencyName}
                      onChange={(e) => setAddForm({ ...addForm, agencyName: e.target.value })}
                      className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                      placeholder="e.g. Star Talent Agency"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agency Commission Cut (%)</label>
                    <p className="text-[10px] text-slate-500 mb-2">Percentage of earnings the agency takes from their network's broadcasters.</p>
                    <input
                      type="number"
                      value={addForm.agencyCommissionRate}
                      onChange={(e) => setAddForm({ ...addForm, agencyCommissionRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 text-xs"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-[#232332] flex justify-end gap-3 bg-[#1A1A24]/30">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-300 font-bold hover:bg-white/5 transition-colors text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAgency}
                disabled={!selectedNewAgency || addForm.agencyName.trim() === ''}
                className={`px-4 py-2 rounded-xl font-bold transition-colors text-xs ${
                  selectedNewAgency && addForm.agencyName.trim() !== ''
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-[#232332] text-slate-500 cursor-not-allowed'
                }`}
              >
                Create Agency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
