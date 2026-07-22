import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'apple-pill-red';
      case 'SALES':
        return 'apple-pill-blue';
      case 'WAREHOUSE':
        return 'apple-pill-amber';
      case 'ACCOUNTS':
        return 'apple-pill-green';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <header className="h-16 apple-glass border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
          
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-none">ERPFlow</h1>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Enterprise Operations</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info & Role Pill Badge */}
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 shadow-inner">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-white leading-none">{user?.name}</div>
            <div className={`mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full inline-block ${getRoleBadgeStyle(user?.role)}`}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* Logout Pill Button */}
        <button
          onClick={logout}
          className="p-2 rounded-full bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
          title="Sign out of session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
