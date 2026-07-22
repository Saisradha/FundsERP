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
      className="fixed top-3 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-2xl flex items-center gap-2.5 backdrop-blur-2xl border shadow-xl transition-all cyber-glass-panel"
      style={{
        backgroundColor: 'var(--color-nav-bg)',
        borderColor: 'var(--color-nav-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Brand Logo & Indicator */}
      <div className="flex items-center gap-2 pr-2 border-r" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => onSelectModule('dashboard')}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
            color: 'white',
            boxShadow: '0 0 10px var(--color-primary-glow)'
          }}
          title="ERPFlow Operational Portal"
        >
          <Cpu className="w-3.5 h-3.5" />
        </button>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1">
            <h1 className="font-bold text-[11px] tracking-wider leading-none font-mono" style={{ color: 'var(--color-text)' }}>
              ERPFLOW
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-beacon" title="System Operational" />
          </div>
          <p className="text-[8px] font-mono mt-0.5 tracking-wider uppercase font-semibold" style={{ color: 'var(--color-primary)' }}>
            HUD v2.4
          </p>
        </div>
      </div>

      {/* Spotlight Command Bar Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-medium cursor-pointer transition-all hover:border-[var(--color-primary)]"
        style={{
          backgroundColor: 'var(--color-input)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
        title="Open Command Spotlight (Cmd+K)"
      >
        <Search className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
        <span className="hidden md:inline font-mono">Spotlight...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-mono border"
             style={{
               backgroundColor: 'var(--color-surface)',
               borderColor: 'var(--color-border)',
               color: 'var(--color-text-tertiary)',
             }}>
          <Command className="w-2 h-2" /> K
        </kbd>
      </button>

      {/* View Mode Switcher (Hub vs 3D Spatial) */}
      <div className="flex items-center p-0.5 rounded-lg border" style={{
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
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono cursor-pointer transition-all"
            style={{
              backgroundColor: viewMode === mode ? 'var(--color-primary)' : 'transparent',
              color: viewMode === mode ? 'white' : 'var(--color-text-secondary)',
              boxShadow: viewMode === mode ? '0 0 10px var(--color-primary-glow)' : 'none',
            }}
          >
            <Icon className="w-3 h-3" />
            <span>{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Module Navigation — Shown ONLY when in 3D Spatial Mode */}
      {viewMode === '3d' && (
        <nav className="hidden lg:flex items-center gap-0.5 pl-2 border-l" style={{ borderColor: 'var(--color-border)' }}>
          {navItems.map((b) => {
            const Icon = b.icon;
            const isActive = activeModule === b.id;
            return (
              <motion.button
                key={b.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectModule(b.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium font-mono cursor-pointer transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-nav-pill-bg)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-nav-item)',
                  fontWeight: isActive ? 600 : 500,
                }}
                title={`${b.label} Sector (${b.shortcut})`}
              >
                <Icon className="w-3 h-3" />
                <span>{b.label}</span>
              </motion.button>
            );
          })}
        </nav>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--color-border)' }}>
        {/* Theme Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-1.5 rounded-lg cursor-pointer border transition-all hover:border-[var(--color-primary)]"
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

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <div className="text-[11px] font-bold leading-none font-mono" style={{ color: 'var(--color-text)' }}>
              {user?.name || 'Operator'}
            </div>
            <div className="mt-0.5">
              <Badge variant={roleVariant as any}>{user?.role || 'OPERATOR'}</Badge>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="p-1.5 rounded-lg cursor-pointer border transition-all hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
          style={{
            backgroundColor: 'var(--color-input)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          }}
          title="Sign out of ERPFlow"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </header>
  );
};
