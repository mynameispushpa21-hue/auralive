import React, { useState } from 'react';
import { Search, Shield, Ban, VolumeX, Plus, Coins, DollarSign, Check, X, UserCheck, Edit } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { UserProfile, UserRole, VIPLevelId } from '../../types';

export const AdminUsersTable: React.FC = () => {
  const { allUsers, adminAdjustUserBalance, adminBanUser, adminMuteUser, adminChangeUserRole, adminUpdateUserProfile } = useAppState();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adjustCoins, setAdjustCoins] = useState<number>(1000);
  const [adjustDiamonds, setAdjustDiamonds] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState('Promotional grant');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    role: 'user' as UserRole,
    level: 1,
    vipTier: 'vip_0' as VIPLevelId,
  });

  const filteredUsers = allUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.displayName.toLowerCase().includes(q) || u.numericId?.includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    adminAdjustUserBalance(selectedUser.id, adjustCoins, adjustDiamonds, adjustReason);
    setFeedback(`Successfully updated balance for ${selectedUser.displayName}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      level: user.level,
      vipTier: user.vipTier,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    adminUpdateUserProfile(editingUser.id, {
      displayName: editForm.displayName,
      email: editForm.email,
      role: editForm.role,
      level: editForm.level,
      vipTier: editForm.vipTier,
    });
    
    // If role changed, also use adminChangeUserRole just to be safe if it has side effects
    if (editingUser.role !== editForm.role) {
      adminChangeUserRole(editingUser.id, editForm.role);
    }

    setFeedback(`Updated profile for ${editForm.displayName}`);
    setTimeout(() => setFeedback(null), 3000);
    setEditingUser(null);
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-white">User Accounts & Identity Directory</h2>
          <p className="text-xs text-slate-400">Manage user credentials, balances, roles, VIP statuses, and moderation flags</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID or email..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#121217] border border-[#232332] text-xs text-white"
          >
            <option value="ALL">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="host">Creators / Hosts</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Super Admins</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl bg-[#121217] border border-[#232332] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1A1A24] text-slate-400 uppercase font-bold border-b border-[#232332]">
              <tr>
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Role & VIP</th>
                <th className="p-3.5">Coins</th>
                <th className="p-3.5">Diamonds</th>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232332]/60">
              {filteredUsers.map((user) => {
                return (
                  <tr key={user.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                    {/* Identity */}
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={user.avatar} alt={user.displayName} className="w-9 h-9 rounded-full object-cover ring-1 ring-[#232332]" />
                      <div>
                        <p className="font-bold text-white flex items-center gap-1">
                          <span>{user.displayName}</span>
                          <span>{user.countryFlag}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">ID: {user.numericId} • {user.email}</p>
                      </div>
                    </td>

                    {/* Role & VIP */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            user.role === 'admin'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : user.role === 'moderator'
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                              : user.role === 'host'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-[#1A1A24] text-slate-400'
                          }`}
                        >
                          {user.role}
                        </span>

                        {user.vipTier !== 'vip_0' && (
                          <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-[9px] font-black text-white">
                            {user.vipTier.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Coins */}
                    <td className="p-3.5 font-bold text-amber-400">
                      {user.coins.toLocaleString()} 🪙
                    </td>

                    {/* Diamonds */}
                    <td className="p-3.5 font-bold text-violet-300">
                      {user.diamonds.toLocaleString()} 💎
                    </td>

                    {/* Level */}
                    <td className="p-3.5 font-bold text-slate-200">
                      Lv.{user.level}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {user.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                          BANNED
                        </span>
                      ) : user.isMuted ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                          MUTED ({user.muteRemainingHours || 24}h)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right space-x-1.5 flex justify-end">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-1.5 rounded-lg text-[11px] font-bold border border-[#232332] bg-[#1A1A24] text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Edit User Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-2.5 py-1 rounded-lg bg-[#1A1A24] hover:bg-[#232332] text-violet-300 font-bold text-[11px] border border-[#232332] transition-colors"
                        title="Adjust Balances"
                      >
                        Ledger
                      </button>

                      <button
                        onClick={() => adminMuteUser(user.id, user.isMuted ? 0 : 24)}
                        className={`p-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                          user.isMuted
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-[#1A1A24] border-[#232332] text-slate-400 hover:text-amber-400'
                        }`}
                        title={user.isMuted ? 'Unmute User' : 'Mute User 24h'}
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => adminBanUser(user.id, !user.isBanned, 'Violation of terms')}
                        className={`p-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                          user.isBanned
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                            : 'bg-[#1A1A24] border-[#232332] text-slate-400 hover:text-rose-400'
                        }`}
                        title={user.isBanned ? 'Unban User' : 'Ban User Account'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Drawer Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#121217] border border-[#232332] rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232332]">
              <h3 className="font-bold text-sm text-white">Adjust User Balances: {selectedUser.displayName}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Coin Delta (+/-)</label>
                  <input
                    type="number"
                    value={adjustCoins}
                    onChange={(e) => setAdjustCoins(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Current: {selectedUser.coins.toLocaleString()}</span>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Diamond Delta (+/-)</label>
                  <input
                    type="number"
                    value={adjustDiamonds}
                    onChange={(e) => setAdjustDiamonds(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Current: {selectedUser.diamonds.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Audit Ledger Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                  placeholder="e.g. Promotional event / Manual correction"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white"
                />
              </div>

              {/* Role Change Selector */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Platform Role</label>
                <div className="flex gap-2">
                  {(['user', 'host', 'moderator', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => adminChangeUserRole(selectedUser.id, r)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all uppercase ${
                        selectedUser.role === r
                          ? 'bg-violet-600 text-white border-violet-500'
                          : 'bg-[#1A1A24] text-slate-400 border-[#232332] hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white font-bold text-xs shadow-md mt-2 hover:brightness-110 active:scale-98 transition-all"
              >
                Apply Balance & Ledger Update
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" />
                Edit User Profile
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-4 space-y-4 text-sm">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="user">User</option>
                    <option value="host">Broadcaster (Host)</option>
                    <option value="moderator">Moderator</option>
                    <option value="seller">Coin Reseller</option>
                    <option value="agent">Agency Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">VIP Tier</label>
                  <select
                    value={editForm.vipTier}
                    onChange={(e) => setEditForm({ ...editForm, vipTier: e.target.value as VIPLevelId })}
                    className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="vip_0">No VIP</option>
                    <option value="vip_1">VIP 1</option>
                    <option value="vip_2">VIP 2</option>
                    <option value="vip_3">VIP 3</option>
                    <option value="vip_4">VIP 4</option>
                    <option value="vip_5">VIP 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Level</label>
                <input
                  type="number"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#1A1A24] border border-[#232332] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  min="1"
                  max="99"
                  required
                />
              </div>
              
              <div className="pt-2 border-t border-[#232332] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 font-bold hover:bg-white/5 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
