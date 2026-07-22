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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Badge } from './ui/Badge';

interface IsometricNavDockProps {
  activeModule: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onSelectModule: (module: any) => void;
}

export const IsometricNavDock: React.FC<IsometricNavDockProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const { user, logout } = useAuthStore();
  const { themeMode, viewMode, toggleTheme, setViewMode } = useThemeStore();

  const buildings = [
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'challans', label: 'Challans', icon: Truck },
    { id: 'logs', label: 'Logs', icon: History },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const themeIcon = themeMode === 'dark' ? <Sun className="w-4 h-4" /> :
                    themeMode === 'light' ? <Moon className="w-4 h-4" /> :
                    <Monitor className="w-4 h-4" />;

  const themeLabel = themeMode === 'dark' ? 'Light mode' :
                     themeMode === 'light' ? 'System' : 'Dark mode';

  const roleVariant = user?.role === 'ADMIN' ? 'danger' :
                      user?.role === 'SALES' ? 'info' :
                      user?.role === 'WAREHOUSE' ? 'warning' : 'success';

  return (
    <header
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl flex items-center gap-4 backdrop-blur-xl border"
      style={{
        background: 'var(--color-nav-bg)',
        borderColor: 'var(--color-nav-border)',
        boxShadow: 'var(--color-glass-shadow)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 pr-3 border-r" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
             style={{ background: 'var(--color-primary)', color: 'white' }}>
          <Building2 className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-bold text-xs tracking-tight leading-none" style={{ color: 'var(--color-text)' }}>
            ERPFLOW
          </h1>
          <p className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            OPERATIONS
          </p>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center p-0.5 rounded-xl border" style={{
        background: 'var(--color-input)',
        borderColor: 'var(--color-border-subtle)',
      }}>
        {([
          { mode: 'hub' as const, label: 'Hub', icon: LayoutDashboard },
          { mode: '3d' as const, label: '3D', icon: Layers },
        ]).map(({ mode, label, icon: Icon }) => (
          <motion.button
            key={mode}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(mode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            style={{
              background: viewMode === mode ? 'var(--color-primary)' : 'transparent',
              color: viewMode === mode ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Module Navigation (visible in both modes) */}
      <nav className="hidden lg:flex items-center gap-0.5">
        {buildings.map((b) => {
          const Icon = b.icon;
          const isActive = activeModule === b.id;
          return (
            <motion.button
              key={b.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectModule(b.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{
                background: isActive ? 'var(--color-nav-pill-bg)' : 'transparent',
                color: isActive ? 'var(--color-nav-item-active)' : 'var(--color-nav-item)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{b.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Controls */}
      <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'var(--color-border)' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-lg cursor-pointer border"
          style={{
            background: 'var(--color-input)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border-subtle)',
          }}
          title={themeLabel}
          aria-label={themeLabel}
        >
          {themeIcon}
        </motion.button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-semibold leading-none" style={{ color: 'var(--color-text)' }}>
              {user?.name}
            </div>
            <div className="mt-0.5">
              <Badge variant={roleVariant as any}>{user?.role}</Badge>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="p-2 rounded-lg cursor-pointer border"
          style={{
            background: 'var(--color-input)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border-subtle)',
          }}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
};
