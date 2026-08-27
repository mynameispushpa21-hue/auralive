import React, { useState } from 'react';
import { Target, Plus, Edit2, Zap, Check, X, ShieldAlert, Award, Clock } from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { LuckyBackupMilestone } from '../../types';

export const AdminLuckyBackupTable: React.FC = () => {
  const { luckyBackupMilestones, adminAddLuckyBackupMilestone, adminUpdateLuckyBackupMilestone, adminDeleteLuckyBackupMilestone } = useAppState();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<LuckyBackupMilestone | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [requiredCount, setRequiredCount] = useState<number>(15);
  const [multiplier, setMultiplier] = useState<number>(15);
  const [rewardAmount, setRewardAmount] = useState<number>(10);
  const [resetPeriod, setResetPeriod] = useState<'never' | 'daily' | 'weekly' | 'monthly' | 'after_claim' | 'event_end'>('after_claim');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Partial<LuckyBackupMilestone> = {
      name: name.trim(),
      requiredCount,
      multiplier,
      rewardType: 'diamonds', // Fixed for now based on requirements
      rewardAmount,
      resetPeriod,
    };

    if (editingMilestone) {
      adminUpdateLuckyBackupMilestone(editingMilestone.id, payload);
      setEditingMilestone(null);
    } else {
      adminAddLuckyBackupMilestone(payload);
      setIsAddModalOpen(false);
    }

    // Reset
    setName('');
    setRequiredCount(15);
    setMultiplier(15);
    setRewardAmount(10);
    setResetPeriod('after_claim');
  };

  const openEdit = (m: LuckyBackupMilestone) => {
    setEditingMilestone(m);
    setName(m.name);
    setRequiredCount(m.requiredCount);
    setMultiplier(m.multiplier);
    setRewardAmount(m.rewardAmount || 10);
    setResetPeriod(m.resetPeriod);
  };

  const deleteMilestone = (mId: string) => {
    if (window.confirm("Are you sure you want to delete this milestone?")) {
      adminDeleteLuckyBackupMilestone(mId);
    }
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Lucky Backup Milestones
          </h2>
          <p className="text-xs text-slate-400">Configure milestone triggers and bonus rewards for Lucky Gifts.</p>
        </div>

        <button
          onClick={() => {
            setEditingMilestone(null);
            setIsAddModalOpen(true);
            // Reset to defaults
            setName('New Lucky Backup');
            setRequiredCount(50);
            setMultiplier(50);
            setRewardAmount(10);
            setResetPeriod('after_claim');
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {luckyBackupMilestones.map((m) => (
          <div key={m.id} className="bg-[#121217] border border-[#232332] rounded-2xl p-4 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-10 -mt-10 pointer-events-none rounded-full"></div>
            
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <span className="text-xl font-black text-amber-400">{m.multiplier}x</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{m.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Target className="w-3 h-3" />
                    <span>Requires {m.requiredCount} Gifts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#1A1A24]">
                <span className="text-slate-400">Base Reward Config</span>
                <span className="font-bold text-indigo-300 flex items-center gap-1">
                  {m.rewardAmount} <Award className="w-3 h-3" />
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#1A1A24]">
                <span className="text-slate-400">Total Bonus Given</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  {m.multiplier * m.rewardAmount} 💎
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#1A1A24]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Reset Rule
                </span>
                <span className="font-bold text-slate-300 capitalize">{m.resetPeriod.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#232332] flex items-center justify-between mt-auto">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${m.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {m.status.toUpperCase()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(m)}
                  className="p-1.5 rounded-lg bg-[#1A1A24] hover:bg-[#232332] text-violet-300 border border-[#232332] transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteMilestone(m.id)}
                  className="p-1.5 rounded-lg bg-[#1A1A24] hover:bg-[#232332] text-red-400 border border-[#232332] transition-colors"
                  title="Delete"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {luckyBackupMilestones.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#121217] border border-[#232332] rounded-2xl flex flex-col items-center justify-center">
            <Zap className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-slate-300 font-bold mb-1">No Milestones Found</h3>
            <p className="text-slate-500 text-xs">Create your first Lucky Backup milestone to reward frequent gift-givers.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingMilestone) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#121217] border border-[#232332] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232332]">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                {editingMilestone ? `Edit Milestone: ${editingMilestone.name}` : 'Create Lucky Backup Milestone'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMilestone(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Milestone Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 15x Lucky Backup"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Required Gifts</label>
                  <input
                    type="number"
                    value={requiredCount}
                    onChange={(e) => setRequiredCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-amber-500"
                    min="1"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Gifts needed to trigger</p>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Reward Multiplier</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={multiplier}
                      onChange={(e) => setMultiplier(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-l-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-amber-500"
                      min="1"
                      required
                    />
                    <div className="bg-[#232332] border-y border-r border-[#232332] px-3 py-2 rounded-r-xl font-bold text-amber-500">
                      x
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">E.g., {multiplier}x</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Base Reward</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-l-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-amber-500"
                      min="1"
                      required
                    />
                    <div className="bg-[#232332] border-y border-r border-[#232332] px-2 py-2 rounded-r-xl">
                      💎
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Total: {rewardAmount * multiplier} 💎</p>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Reset Rule</label>
                  <select
                    value={resetPeriod}
                    onChange={(e) => setResetPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#232332] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="after_claim">After Claim</option>
                    <option value="daily">Daily Reset</option>
                    <option value="weekly">Weekly Reset</option>
                    <option value="never">Never Reset</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-500/20 hover:bg-amber-600 active:scale-98 transition-all mt-4"
              >
                {editingMilestone ? 'Save Changes' : 'Create Milestone'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
