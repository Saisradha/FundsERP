import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Boxes, Users, Truck, History, BarChart3,
  Sun, Moon, LayoutDashboard, Layers, Plus, LogOut, Command, ArrowRight
} from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { Product3D } from '../store/useWarehouseStore';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectModule: (module: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports') => void;
  products: Product3D[];
  customers: any[];
  onOpenAddProduct?: () => void;
  onOpenAddCustomer?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onSelectModule,
  products,
  customers,
  onOpenAddProduct,
  onOpenAddCustomer,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { themeMode, toggleTheme, viewMode, setViewMode } = useThemeStore();
  const { logout } = useAuthStore();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Command items builder
  const moduleCommands = [
    { id: 'mod-inventory', label: 'Go to Inventory', category: 'Navigation', icon: Boxes, action: () => { onSelectModule('inventory'); onClose(); } },
    { id: 'mod-crm', label: 'Go to Customers (CRM)', category: 'Navigation', icon: Users, action: () => { onSelectModule('crm'); onClose(); } },
    { id: 'mod-challans', label: 'Go to Sales Challans', category: 'Navigation', icon: Truck, action: () => { onSelectModule('challans'); onClose(); } },
    { id: 'mod-logs', label: 'Go to Audit Logs', category: 'Navigation', icon: History, action: () => { onSelectModule('logs'); onClose(); } },
    { id: 'mod-reports', label: 'Go to Reports & Analytics', category: 'Navigation', icon: BarChart3, action: () => { onSelectModule('reports'); onClose(); } },
    { id: 'mod-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => { onSelectModule('dashboard'); onClose(); } },
  ];

  const actionCommands = [
    { id: 'act-add-product', label: 'Create New Product', category: 'Actions', icon: Plus, action: () => { onSelectModule('inventory'); onOpenAddProduct?.(); onClose(); } },
    { id: 'act-add-customer', label: 'Create New Customer Lead', category: 'Actions', icon: Plus, action: () => { onSelectModule('crm'); onOpenAddCustomer?.(); onClose(); } },
    { id: 'act-toggle-theme', label: `Switch Theme (Current: ${themeMode})`, category: 'Actions', icon: themeMode === 'dark' ? Sun : Moon, action: () => { toggleTheme(); onClose(); } },
    { id: 'act-toggle-view', label: `Switch View Mode (Current: ${viewMode.toUpperCase()})`, category: 'Actions', icon: viewMode === 'hub' ? Layers : LayoutDashboard, action: () => { setViewMode(viewMode === 'hub' ? '3d' : 'hub'); onClose(); } },
    { id: 'act-logout', label: 'Sign Out of ERPFlow', category: 'Actions', icon: LogOut, action: () => { logout(); onClose(); } },
  ];

  const productMatches = query.trim() ? products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4).map((p) => ({
    id: `prod-${p.id}`,
    label: `${p.name} (${p.sku}) — Stock: ${p.currentStock}`,
    category: 'Inventory Products',
    icon: Boxes,
    action: () => { onSelectModule('inventory'); onClose(); },
  })) : [];

  const customerMatches = query.trim() ? customers.filter((c) =>
    c.name?.toLowerCase().includes(query.toLowerCase()) ||
    c.businessName?.toLowerCase().includes(query.toLowerCase()) ||
    c.email?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4).map((c) => ({
    id: `cust-${c.id}`,
    label: `${c.name} (${c.businessName || 'Retail'}) — Status: ${c.status}`,
    category: 'CRM Customers',
    icon: Users,
    action: () => { onSelectModule('crm'); onClose(); },
  })) : [];

  const filteredCommands = query.trim()
    ? [
        ...productMatches,
        ...customerMatches,
        ...moduleCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
        ...actionCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
      ]
    : [...moduleCommands, ...actionCommands];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-md"
            style={{ backgroundColor: 'var(--color-modal-overlay)' }}
            onClick={onClose}
          />

          {/* Palette Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border z-10"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b"
                 style={{ borderColor: 'var(--color-border)' }}>
              <Command className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, search products, or jump to module..."
                className="w-full bg-transparent text-sm font-medium outline-none"
                style={{ color: 'var(--color-text)' }}
              />
              <kbd className="px-2 py-0.5 rounded text-[10px] font-mono border"
                   style={{
                     backgroundColor: 'var(--color-input)',
                     borderColor: 'var(--color-border)',
                     color: 'var(--color-text-tertiary)',
                   }}>
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  No matching results found. Try searching for "Inventory", "Products", or "CRM".
                </div>
              ) : (
                filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        isSelected ? 'shadow-sm' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg border" style={{
                          backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-input)',
                          color: isSelected ? 'white' : 'var(--color-text-secondary)',
                          borderColor: 'var(--color-border)',
                        }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{cmd.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border" style={{
                          backgroundColor: 'var(--color-input)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-tertiary)',
                        }}>
                          {cmd.category}
                        </span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t flex items-center justify-between text-[11px]" style={{
              backgroundColor: 'var(--color-input)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-tertiary)',
            }}>
              <span>Tip: Use <kbd className="font-mono font-semibold">↑</kbd> <kbd className="font-mono font-semibold">↓</kbd> to navigate, <kbd className="font-mono font-semibold">↵</kbd> to select</span>
              <span className="font-mono">ERPFlow Spotlight</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
