import React from 'react';
import { 
  Boxes, 
  Users, 
  Truck, 
  History, 
  BarChart3, 
  LogOut, 
  Building2
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface IsometricNavDockProps {
  activeModule: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onSelectModule: (module: any) => void;
}

export const IsometricNavDock: React.FC<IsometricNavDockProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const { user, logout } = useAuthStore();

  const buildings = [
    { id: 'inventory', label: 'Warehouse Racks', icon: Boxes },
    { id: 'crm', label: 'CRM Office', icon: Users },
    { id: 'challans', label: 'Dispatch Dock', icon: Truck },
    { id: 'logs', label: 'Audit Center', icon: History },
    { id: 'reports', label: 'Analytics Spire', icon: BarChart3 },
  ];

  const getRoleStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'chip-danger';
      case 'SALES':
        return 'chip-primary';
      case 'WAREHOUSE':
        return 'chip-warning';
      case 'ACCOUNTS':
        return 'chip-success';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 px-6 py-3 glass-panel rounded-full flex items-center justify-between gap-8 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">ERPFLOW</h1>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Miniature Industrial City OS</p>
        </div>
      </div>

      {/* Building Navigation Pills */}
      <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80">
        {buildings.map((b) => {
          const Icon = b.icon;
          const isActive = activeModule === b.id;

          return (
            <button
              key={b.id}
              onClick={() => onSelectModule(b.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{b.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Clearance Badge */}
      <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
        <div className="text-right font-sans">
          <div className="text-xs font-bold text-slate-900 leading-none">{user?.name}</div>
          <div className={`mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block ${getRoleStyle(user?.role)}`}>
            {user?.role}
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-all cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
