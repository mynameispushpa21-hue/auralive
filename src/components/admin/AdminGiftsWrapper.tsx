import React, { useState } from 'react';
import { Gift, Zap } from 'lucide-react';
import { AdminGiftsTable } from './AdminGiftsTable';
import { AdminLuckyBackupTable } from './AdminLuckyBackupTable';

export const AdminGiftsWrapper: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'lucky_backup'>('catalog');

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#232332] pb-4">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeSubTab === 'catalog'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-[#232332]'
          }`}
        >
          <Gift className="w-4 h-4" />
          General Gifts Catalog
        </button>
        
        <button
          onClick={() => setActiveSubTab('lucky_backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeSubTab === 'lucky_backup'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-[#232332]'
          }`}
        >
          <Zap className="w-4 h-4" />
          Lucky Backup Milestones
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'catalog' && <AdminGiftsTable />}
      {activeSubTab === 'lucky_backup' && <AdminLuckyBackupTable />}
    </div>
  );
};
