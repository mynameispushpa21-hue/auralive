import React, { useState } from 'react';
import { Search, Building2, CheckCircle2, DollarSign, Check, X, ShieldAlert, Award, Edit, UserPlus, Users, Activity } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile } from '../../types';

export const AdminHostAgenciesTable: React.FC = () => {
  const { allUsers, adminChangeUserRole, updateHostAgencySettings, adminPromoteToHostAgency } = useAppState();
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit Modal State
  const [editingAgency, setEditingAgency] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    agencyName: '',
    agencyCommissionRate: 0,
    status: 'active' as 'active' | 'suspended'
  });

  // Add Agency Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedNewAgency, setSelectedNewAgency] = useState<UserProfile | null>(null);
  const [addForm, setAddForm] = useState({
    agencyName: '',
    agencyCommissionRate: 15,
  });

  const agencies = allUsers.filter(u => u.isHostAgency && u.hostAgencyInfo);

  const filteredAgencies = agencies.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.displayName.toLowerCase().includes(q) || 
             u.numericId?.includes(q) || 
             u.email.toLowerCase().includes(q) ||
             u.hostAgencyInfo?.agencyName.toLowerCase().includes(q);
    }
    return true;
  });

  const potentialAgencies = allUsers.filter(u => 
    !u.isHostAgency &&
    (userSearchQuery.trim() === '' || 
      u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      u.numericId?.includes(userSearchQuery) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
  ).slice(0, 5); // top 5 results

  const handleUpdateAgencyStatus = (userId: string, isActive: boolean) => {
    updateHostAgencySettings(userId, { status: isActive ? 'active' : 'suspended' });
    setFeedback(`${isActive ? 'Reactivated' : 'Suspended'} agency account for user ID ${userId}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEditClick = (agencyOwner: UserProfile) => {
    setEditingAgency(agencyOwner);
    setEditForm({
      agencyName: agencyOwner.hostAgencyInfo?.agencyName || '',
      agencyCommissionRate: (agencyOwner.hostAgencyInfo?.agencyCommissionRate || 0) * 100, // convert 0.15 to 15
      status: agencyOwner.hostAgencyInfo?.status || 'active'
    });
  };

  const handleSaveEdit = () => {
    if (!editingAgency) return;

    updateHostAgencySettings(editingAgency.id, {
      agencyName: editForm.agencyName,
      agencyCommissionRate: editForm.agencyCommissionRate / 100, // convert 15 to 0.15
      status: editForm.status
    });

    setFeedback(`Updated agency details for ${editForm.agencyName}`);
    setTimeout(() => setFeedback(null), 3000);
    setEditingAgency(null);
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

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Host Agency Management</h2>
          <p className="text-xs text-slate-400">Manage broadcaster agencies, network owners, and commission rates</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agencies..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Add Agency</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Agencies Table */}
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
                      <p className="font-bold text-indigo-400 text-sm">{agencyInfo.agencyName}</p>
                      <p className="text-[10px] text-slate-500">ID: {agencyInfo.agencyId}</p>
                    </td>

                    {/* Owner */}
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={agencyOwner.avatar} alt={agencyOwner.displayName} className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500/50" />
                      <div>
                        <p className="font-bold text-white flex items-center gap-1">
                          <span>{agencyOwner.displayName}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">UID: {agencyOwner.numericId}</p>
                      </div>
                    </td>

                    {/* Commission Rate */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400 text-sm">{(agencyInfo.agencyCommissionRate * 100).toFixed(1)}%</span>
                      </div>
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

                    {/* Actions */}
                    <td className="p-3.5 text-right space-x-1.5 flex justify-end">
                      <button
                        onClick={() => handleEditClick(agencyOwner)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-[11px] border border-indigo-500/20 transition-colors flex items-center gap-1"
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
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No host agencies found. Add a new agency to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Agency Modal */}
      {editingAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" />
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
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agency Commission Cut (%)</label>
                <p className="text-[10px] text-slate-500 mb-2">Percentage of earnings the agency takes from their network's broadcasters.</p>
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
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
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
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agency Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
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
                      className="w-full pl-9 pr-3 py-2 bg-[#1A1A24] border border-[#232332] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                      className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                      className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
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
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
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
