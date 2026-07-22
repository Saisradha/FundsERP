import React from 'react';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'SALES':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'WAREHOUSE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ACCOUNTS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
          E
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-none">ERPFlow Portal</h1>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">Mini ERP & CRM Operations Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info & Role Badge */}
        <div className="flex items-center gap-3 pr-3 border-r border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-white leading-none">{user?.name}</div>
            <div className={`mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${getRoleBadgeColor(user?.role)}`}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all cursor-pointer"
          title="Sign out of system"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
