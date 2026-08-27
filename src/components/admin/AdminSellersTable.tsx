import React, { useState } from 'react';
import { Search, Shield, CheckCircle2, Coins, DollarSign, Check, X, ShieldAlert, Award, Edit, UserPlus } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile } from '../../types';

export const AdminSellersTable: React.FC = () => {
  const { allUsers, adminChangeUserRole, updateSellerProfileSettings, adminUpdateUserBalance } = useAppState();
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit Modal State
  const [editingSeller, setEditingSeller] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    agencyName: '',
    discountPercentage: 0,
    coins: 0,
    verificationLevel: 'standard' as 'standard' | 'master'
  });

  // Add Seller Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedNewSeller, setSelectedNewSeller] = useState<UserProfile | null>(null);
  const [addForm, setAddForm] = useState({
    agencyName: '',
    discountPercentage: 0,
    verificationLevel: 'standard' as 'standard' | 'master'
  });

  const sellers = allUsers.filter(u => u.role === 'seller' || u.role === 'agent' || u.isSeller);

  const filteredSellers = sellers.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.displayName.toLowerCase().includes(q) || u.numericId?.includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const potentialSellers = allUsers.filter(u => 
    u.role !== 'seller' && 
    u.role !== 'agent' && 
    !u.isSeller &&
    (userSearchQuery.trim() === '' || 
      u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      u.numericId?.includes(userSearchQuery) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
  ).slice(0, 5); // top 5 results

  const handleUpdateSellerStatus = (userId: string, isApproved: boolean) => {
    if (isApproved) {
      adminChangeUserRole(userId, 'seller');
      setFeedback(`Approved seller status for user ID ${userId}`);
    } else {
      adminChangeUserRole(userId, 'user');
      setFeedback(`Revoked seller status for user ID ${userId}`);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEditClick = (seller: UserProfile) => {
    setEditingSeller(seller);
    setEditForm({
      agencyName: seller.sellerInfo?.agencyName || '',
      discountPercentage: seller.sellerInfo?.discountPercentage || 0,
      coins: seller.coins,
      verificationLevel: seller.sellerInfo?.verificationLevel || 'standard'
    });
  };

  const handleSaveEdit = () => {
    if (!editingSeller) return;

    // Update seller profile details
    updateSellerProfileSettings(editingSeller.id, {
      agencyName: editForm.agencyName,
      discountPercentage: editForm.discountPercentage,
      verificationLevel: editForm.verificationLevel
    });

    // Update coins (calculate delta)
    const coinDelta = editForm.coins - editingSeller.coins;
    if (coinDelta !== 0) {
      adminUpdateUserBalance(editingSeller.id, coinDelta, 0, 'Admin manual balance adjustment');
    }

    setFeedback(`Updated seller details for ${editingSeller.displayName}`);
    setTimeout(() => setFeedback(null), 3000);
    setEditingSeller(null);
  };

  const handleAddSeller = () => {
    if (!selectedNewSeller) return;

    adminChangeUserRole(selectedNewSeller.id, 'seller');
    updateSellerProfileSettings(selectedNewSeller.id, {
      agencyName: addForm.agencyName,
      discountPercentage: addForm.discountPercentage,
      verificationLevel: addForm.verificationLevel
    });

    setFeedback(`Successfully promoted ${selectedNewSeller.displayName} to Seller!`);
    setTimeout(() => setFeedback(null), 3000);
    
    setIsAddModalOpen(false);
    setSelectedNewSeller(null);
    setUserSearchQuery('');
    setAddForm({ agencyName: '', discountPercentage: 0, verificationLevel: 'standard' });
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Coin Seller Management</h2>
          <p className="text-xs text-slate-400">Manage authorized coin resellers, agencies, and transaction limits</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Seller</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sellers Table */}
      <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1A1A24] text-slate-400 uppercase font-bold border-b border-[#232332]">
              <tr>
                <th className="p-3.5">Seller Identity</th>
                <th className="p-3.5">Agency Details</th>
                <th className="p-3.5">Coin Reserve</th>
                <th className="p-3.5">Total Sales Volume</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232332]/60">
              {filteredSellers.map((seller) => {
                const sellerInfo = seller.sellerInfo;
                const isVerified = sellerInfo?.isOfficialVerified || seller.role === 'seller';
                
                return (
                  <tr key={seller.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                    {/* Identity */}
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={seller.avatar} alt={seller.displayName} className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-500/50" />
                      <div>
                        <p className="font-bold text-white flex items-center gap-1">
                          <span>{seller.displayName}</span>
                          {sellerInfo?.verificationLevel === 'master' && <Award className="w-3.5 h-3.5 text-amber-400" />}
                        </p>
                        <p className="text-[10px] text-slate-400">ID: {seller.numericId}</p>
                      </div>
                    </td>

                    {/* Agency */}
                    <td className="p-3.5">
                      <p className="font-bold text-slate-200">{sellerInfo?.agencyName || 'Independent Seller'}</p>
                      <p className="text-[10px] text-slate-400">Discount: {sellerInfo?.discountPercentage || 0}%</p>
                    </td>

                    {/* Coins Reserve */}
                    <td className="p-3.5 font-bold text-amber-400">
                      {seller.coins.toLocaleString()} 🪙
                    </td>

                    {/* Sales Volume */}
                    <td className="p-3.5">
                      <p className="font-bold text-emerald-400">${(sellerInfo?.totalRevenueUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-slate-400">{(sellerInfo?.totalCoinsSold || 0).toLocaleString()} coins</p>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {isVerified ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> AUTHORIZED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 font-bold text-[10px] border border-slate-500/30 flex items-center gap-1 w-max">
                          <ShieldAlert className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right space-x-1.5 flex justify-end">
                      <button
                        onClick={() => handleEditClick(seller)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-[11px] border border-indigo-500/20 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      {isVerified ? (
                        <button
                          onClick={() => handleUpdateSellerStatus(seller.id, false)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[11px] border border-rose-500/20 transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateSellerStatus(seller.id, true)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/20 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredSellers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No authorized resellers found. Add 'seller' role to users in the User Directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Seller Modal */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" />
                Edit Seller Details
              </h3>
              <button onClick={() => setEditingSeller(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agency / Company Name</label>
                <input
                  type="text"
                  value={editForm.agencyName}
                  onChange={(e) => setEditForm({ ...editForm, agencyName: e.target.value })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Alpha Agency"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Coin Reserve</label>
                  <input
                    type="number"
                    value={editForm.coins}
                    onChange={(e) => setEditForm({ ...editForm, coins: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Discount Rate (%)</label>
                  <input
                    type="number"
                    value={editForm.discountPercentage}
                    onChange={(e) => setEditForm({ ...editForm, discountPercentage: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verification Tier</label>
                <select
                  value={editForm.verificationLevel}
                  onChange={(e) => setEditForm({ ...editForm, verificationLevel: e.target.value as 'standard' | 'master' })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="standard">Standard Seller</option>
                  <option value="master">Master Agency</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#232332] flex justify-end gap-3 bg-[#1A1A24]/30">
              <button 
                onClick={() => setEditingSeller(null)}
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

      {/* Add Seller Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-500" />
                Add New Seller
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              {!selectedNewSeller ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search User</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Name, ID, or Email..."
                      className="w-full pl-9 pr-3 py-2 bg-[#1A1A24] border border-[#232332] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  
                  {potentialSellers.length > 0 && userSearchQuery.trim() !== '' && (
                    <div className="mt-2 max-h-40 overflow-y-auto bg-[#1A1A24] rounded-xl border border-[#232332]">
                      {potentialSellers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedNewSeller(u)}
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
                  {potentialSellers.length === 0 && userSearchQuery.trim() !== '' && (
                    <div className="mt-2 p-3 text-center text-xs text-slate-500 bg-[#1A1A24] rounded-xl border border-[#232332]">
                      No matching users found.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-[#1A1A24] p-3 rounded-xl border border-[#232332]">
                    <div className="flex items-center gap-3">
                      <img src={selectedNewSeller.avatar} alt={selectedNewSeller.displayName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white text-sm">{selectedNewSeller.displayName}</p>
                        <p className="text-[10px] text-slate-400">ID: {selectedNewSeller.numericId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNewSeller(null)}
                      className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-[#232332]"
                    >
                      Change User
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agency / Company Name</label>
                    <input
                      type="text"
                      value={addForm.agencyName}
                      onChange={(e) => setAddForm({ ...addForm, agencyName: e.target.value })}
                      className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Alpha Agency"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Discount Rate (%)</label>
                      <input
                        type="number"
                        value={addForm.discountPercentage}
                        onChange={(e) => setAddForm({ ...addForm, discountPercentage: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verification Tier</label>
                      <select
                        value={addForm.verificationLevel}
                        onChange={(e) => setAddForm({ ...addForm, verificationLevel: e.target.value as 'standard' | 'master' })}
                        className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 appearance-none"
                      >
                        <option value="standard">Standard Seller</option>
                        <option value="master">Master Agency</option>
                      </select>
                    </div>
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
                onClick={handleAddSeller}
                disabled={!selectedNewSeller}
                className={`px-4 py-2 rounded-xl font-bold transition-colors text-xs ${
                  selectedNewSeller 
                    ? 'bg-amber-500 hover:bg-amber-600 text-amber-950' 
                    : 'bg-[#232332] text-slate-500 cursor-not-allowed'
                }`}
              >
                Promote to Seller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
