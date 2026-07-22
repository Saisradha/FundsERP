import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Box, Users, Truck, History, LayoutDashboard, X } from 'lucide-react';
import { useWarehouseStore } from '../store/useWarehouseStore';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveTab } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    { id: 'mission_control', title: 'Open Mission Control Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'warehouse_3d', title: 'Open 3D Digital Twin Warehouse', icon: Box, category: 'Navigation' },
    { id: 'customers_3d', title: 'Open 3D Customer CRM Galaxy', icon: Users, category: 'Navigation' },
    { id: 'products', title: 'Open Product & Inventory Manager', icon: Box, category: 'Navigation' },
    { id: 'challans', title: 'Open Sales Challan Dispatch', icon: Truck, category: 'Navigation' },
    { id: 'logs', title: 'Open Stock Movement Telemetry Logs', icon: History, category: 'Navigation' },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (tabId: string) => {
    setActiveTab(tabId as any);
    setCommandPaletteOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-2xl glass-panel rounded-2xl border-cyan-500/40 shadow-2xl overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type a command or search modules..."
              className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none"
            />
            <kbd className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
              ESC
            </kbd>
          </div>

          {/* Action List */}
          <div className="p-2 max-h-80 overflow-y-auto space-y-1 font-mono text-xs">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No matching commands found.</div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="w-full p-3 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent text-left flex items-center justify-between text-slate-300 hover:text-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 group-hover:border-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{item.category}</span>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
