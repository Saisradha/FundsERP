import React from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  Package, 
  FileText, 
  History, 
  Search, 
  Bot, 
  LogOut, 
  Volume2, 
  VolumeX,
  Radio
} from 'lucide-react';
import { useWarehouseStore } from '../store/useWarehouseStore';
import { useAuthStore } from '../store/useAuthStore';

export const Navigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setCommandPaletteOpen, 
    setAiAssistantOpen, 
    aiAssistantOpen 
  } = useWarehouseStore();

  const { user, logout } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'SALES':
        return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400';
      case 'WAREHOUSE':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'ACCOUNTS':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-xl">
      
      {/* Brand & System Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('mission_control')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              ERPFLOW
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>DIGITAL WAREHOUSE OS</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'mission_control', label: 'Mission Control', icon: LayoutDashboard },
            { id: 'warehouse_3d', label: '3D Warehouse', icon: Box },
            { id: 'customers_3d', label: '3D Customer Galaxy', icon: Users },
            { id: 'products', label: 'Inventory', icon: Package },
            { id: 'challans', label: 'Sales Challans', icon: FileText },
            { id: 'logs', label: 'Stock Movement Logs', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Utilities & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-white hover:border-cyan-500/50 text-xs font-mono transition-all cursor-pointer shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 rounded border border-slate-700 text-slate-300">
            Ctrl K
          </kbd>
        </button>

        {/* AI Hologram Toggle Button */}
        <button
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            aiAssistantOpen
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-cyan-400'
          }`}
          title="Toggle Holographic AI Assistant"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title={soundEnabled ? 'Mute Warehouse Ambience' : 'Enable Ambience'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Active User Badge & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.name}</div>
            <div className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-block ${getRoleColor(user?.role)}`}>
              {user?.role}
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-all cursor-pointer"
            title="Logout Security Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
