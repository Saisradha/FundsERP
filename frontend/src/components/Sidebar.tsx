import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  History 
} from 'lucide-react';
import { useWarehouseStore } from '../store/useWarehouseStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useWarehouseStore();

  const navItems = [
    { id: 'mission_control', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers_3d', label: 'Customer CRM', icon: Users },
    { id: 'products', label: 'Product Inventory', icon: Package },
    { id: 'challans', label: 'Sales Challans', icon: FileText },
    { id: 'logs', label: 'Stock Logs', icon: History },
  ];

  return (
    <aside className="w-64 bg-[#080c14]/90 border-r border-white/5 p-4 flex flex-col justify-between shrink-0 font-sans">
      <div className="space-y-6">
        <div className="px-3 py-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          MODULE NAVIGATOR
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-sans text-slate-400">
        <div className="font-semibold text-white">System Operations</div>
        <div className="text-emerald-400 flex items-center gap-1.5 mt-1 font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Session</span>
        </div>
      </div>
    </aside>
  );
};
