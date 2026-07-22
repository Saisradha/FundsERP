import React from 'react';
import { 
  Boxes, 
  Users, 
  Truck, 
  History, 
  BarChart3, 
  LogOut, 
  Activity,
  Layers
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface SpatialNavDockProps {
  activeSector: 'entry' | 'racks' | 'crm' | 'dispatch' | 'conveyor' | 'reports';
  onSelectSector: (sector: any) => void;
}

export const SpatialNavDock: React.FC<SpatialNavDockProps> = ({
  activeSector,
  onSelectSector,
}) => {
  const { user, logout } = useAuthStore();

  const sectors = [
    { id: 'racks', label: 'Storage Racks', icon: Boxes },
    { id: 'crm', label: 'Customer Orbit', icon: Users },
    { id: 'dispatch', label: 'Dispatch Dock', icon: Truck },
    { id: 'conveyor', label: 'Stock Conveyor', icon: History },
    { id: 'reports', label: 'Analytics HUD', icon: BarChart3 },
  ];

  const getRoleStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'spatial-chip-danger';
      case 'SALES':
        return 'spatial-chip-primary';
      case 'WAREHOUSE':
        return 'spatial-chip-warning';
      case 'ACCOUNTS':
        return 'spatial-chip-success';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <>
      {/* Top Floating Spatial Bar */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 px-6 py-3 spatial-glass flex items-center justify-between gap-8 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-extrabold text-sm shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">ERPFLOW OS</h1>
            <div className="flex items-center gap-1 text-[10px] font-mono text-blue-400 mt-1 uppercase">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>SPATIAL DIGITAL TWIN</span>
            </div>
          </div>
        </div>

        {/* Spatial Sector Pills */}
        <nav className="flex items-center gap-1.5 bg-[#05070A]/80 p-1.5 rounded-full border border-white/5">
          {sectors.map((s) => {
            const Icon = s.icon;
            const isActive = activeSector === s.id;

            return (
              <button
                key={s.id}
                onClick={() => onSelectSector(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Clearance User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right font-sans">
            <div className="text-xs font-bold text-white leading-none">{user?.name}</div>
            <div className={`mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block ${getRoleStyle(user?.role)}`}>
              {user?.role}
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-all cursor-pointer"
            title="Sign out of session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
};
