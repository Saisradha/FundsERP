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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          Core Modules
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="font-semibold text-white">System Status</div>
        <div className="text-emerald-400 flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Operational v1.0</span>
        </div>
      </div>
    </aside>
  );
};
