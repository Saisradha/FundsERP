import React from 'react';
import { 
  Boxes, 
  Users, 
  Truck, 
  History, 
  BarChart3, 
  LogOut, 
  Building2,
  Sun,
  Moon,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

interface IsometricNavDockProps {
  activeModule: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onSelectModule: (module: any) => void;
}

export const IsometricNavDock: React.FC<IsometricNavDockProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, viewMode, setViewMode } = useThemeStore();

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
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 px-6 py-3 glass-panel rounded-full flex items-center justify-between gap-6 shadow-2xl">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/40">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-tight leading-none text-white">ERPFLOW</h1>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">OPERATIONS PORTAL</p>
        </div>
      </div>

      {/* View Mode Switcher (Hub vs 3D World) */}
      <div className="flex items-center bg-slate-900/60 p-1 rounded-full border border-white/10">
        <button
          onClick={() => setViewMode('hub')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'hub' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-300 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Interactive Hub</span>
        </button>

        <button
          onClick={() => setViewMode('3d')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            viewMode === '3d' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3D World View</span>
        </button>
      </div>

      {/* 3D Building Navigation Pills (Visible in 3D Mode) */}
      {viewMode === '3d' && (
        <nav className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-full border border-white/10">
          {buildings.map((b) => {
            const Icon = b.icon;
            const isActive = activeModule === b.id;

            return (
              <button
                key={b.id}
                onClick={() => onSelectModule(b.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{b.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Controls: Dark / Light Mode Toggle & User Profile */}
      <div className="flex items-center gap-3 pl-3 border-l border-white/10">
        
        {/* Dark Mode / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Clearance User Profile */}
        <div className="text-right font-sans">
          <div className="text-xs font-bold text-white leading-none">{user?.name}</div>
          <div className={`mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block ${getRoleStyle(user?.role)}`}>
            {user?.role}
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 transition-all cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
};
