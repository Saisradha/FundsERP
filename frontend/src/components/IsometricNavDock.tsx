import React from 'react';
import {
  Boxes,
  Users,
  Truck,
  History,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Layers,
  LayoutDashboard,
  Command,
  Search,
  Cpu,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Badge } from './ui/Badge';

interface IsometricNavDockProps {
  activeModule: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onSelectModule: (module: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports') => void;
  onOpenCommandPalette: () => void;
}

export const IsometricNavDock: React.FC<IsometricNavDockProps> = ({
  activeModule,
  onSelectModule,
  onOpenCommandPalette,
}) => {
  const { user, logout } = useAuthStore();
  const { themeMode, viewMode, toggleTheme, setViewMode } = useThemeStore();

  const navItems = [
    { id: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard, shortcut: '⌘1' },
    { id: 'inventory' as const, label: 'Inventory', icon: Boxes, shortcut: '⌘2' },
    { id: 'crm' as const, label: 'CRM', icon: Users, shortcut: '⌘3' },
    { id: 'challans' as const, label: 'Challans', icon: Truck, shortcut: '⌘4' },
    { id: 'logs' as const, label: 'Logs', icon: History, shortcut: '⌘5' },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3, shortcut: '⌘6' },
  ];

  const themeIcon = themeMode === 'dark' ? <Sun className="w-3.5 h-3.5" /> :
                    themeMode === 'light' ? <Moon className="w-3.5 h-3.5" /> :
                    <Monitor className="w-3.5 h-3.5" />;

  const themeLabel = themeMode === 'dark' ? 'Switch to Light Mode' :
                     themeMode === 'light' ? 'Switch to System Theme' : 'Switch to Dark Mode';

  const roleVariant = user?.role === 'ADMIN' ? 'danger' :
                      user?.role === 'SALES' ? 'info' :
                      user?.role === 'WAREHOUSE' ? 'warning' : 'success';

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full z-40 px-6 sm:px-8 py-2.5 rounded-none border-b shadow-xl backdrop-blur-2xl flex items-center justify-between transition-all cyber-glass-panel"
      style={{
        backgroundColor: 'var(--color-nav-bg)',
        borderColor: 'var(--color-nav-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectModule('dashboard')}
          className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
            color: 'white',
            boxShadow: '0 0 12px var(--color-primary-glow)'
          }}
          title="ERPFlow Operational Portal"
        >
          <Cpu className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-xs tracking-wider leading-none font-mono" style={{ color: 'var(--color-text)' }}>
              ERPFLOW
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon" title="System Operational" />
          </div>
          <p className="text-[9px] font-mono mt-0.5 tracking-wider uppercase font-semibold" style={{ color: 'var(--color-primary)' }}>
            HUD v2.4 OPERATIONAL
          </p>
        </div>
      </div>

      {/* Center: Search Spotlight & View Switcher */}
      <div className="flex items-center gap-3">
        {/* Spotlight Command Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all hover:border-[var(--color-primary)]"
          style={{
            backgroundColor: 'var(--color-input)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          title="Open Command Spotlight (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
          <span className="hidden md:inline font-mono">Spotlight...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono border"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 borderColor: 'var(--color-border)',
                 color: 'var(--color-text-tertiary)',
               }}>
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* View Mode Switcher (Hub vs 3D Spatial) */}
        <div className="flex items-center p-1 rounded-xl border" style={{
          backgroundColor: 'var(--color-input)',
          borderColor: 'var(--color-border)',
        }}>
          {([
            { mode: 'hub' as const, label: 'Enterprise Hub', icon: LayoutDashboard },
            { mode: '3d' as const, label: '3D Spatial', icon: Layers },
          ]).map(({ mode, label, icon: Icon }) => (
            <motion.button
              key={mode}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all"
              style={{
                backgroundColor: viewMode === mode ? 'var(--color-primary)' : 'transparent',
                color: viewMode === mode ? 'white' : 'var(--color-text-secondary)',
                boxShadow: viewMode === mode ? '0 0 12px var(--color-primary-glow)' : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Module Navigation — Shown ONLY when in 3D Spatial Mode */}
        {viewMode === '3d' && (
          <nav className="hidden lg:flex items-center gap-1 pl-3 border-l" style={{ borderColor: 'var(--color-border)' }}>
            {navItems.map((b) => {
              const Icon = b.icon;
              const isActive = activeModule === b.id;
              return (
                <motion.button
                  key={b.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectModule(b.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium font-mono cursor-pointer transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--color-nav-pill-bg)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-nav-item)',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  title={`${b.label} Sector (${b.shortcut})`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{b.label}</span>
                </motion.button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Right: Theme, User Info & Logout */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl cursor-pointer border transition-all hover:border-[var(--color-primary)]"
          style={{
            backgroundColor: 'var(--color-input)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          }}
          title={themeLabel}
          aria-label={themeLabel}
        >
          {themeIcon}
        </motion.button>

        {/* User Info with Custom Name */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-bold leading-none font-mono" style={{ color: 'var(--color-text)' }}>
              {user?.name || 'SaiSradha'}
            </div>
            <div className="mt-0.5">
              <Badge variant={roleVariant as any}>{user?.role || 'ADMIN'}</Badge>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="p-2 rounded-xl cursor-pointer border transition-all hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
          style={{
            backgroundColor: 'var(--color-input)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          }}
          title="Sign out of ERPFlow"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
};
