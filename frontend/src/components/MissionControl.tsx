import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PackageCheck, 
  Users, 
  AlertTriangle, 
  Truck, 
  Boxes, 
  Activity, 
  DollarSign, 
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useWarehouseStore } from '../store/useWarehouseStore';

export const MissionControl: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    totalChallans: 0,
    confirmedChallans: 0,
    totalRevenue: 0,
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { setActiveTab } = useWarehouseStore();

  useEffect(() => {
    async function loadStats() {
      try {
        const [productsRes, customersRes, challansRes, logsRes] = await Promise.all([
          apiRequest('/products'),
          apiRequest('/customers'),
          apiRequest('/challans'),
          apiRequest('/products/logs?limit=5'),
        ]);

        const products = productsRes.data || [];
        const customers = customersRes.data || [];
        const challans = challansRes.data || [];
        const logs = logsRes.data || [];

        const lowStock = products.filter((p: any) => p.currentStock <= p.minStockAlert).length;
        const activeCust = customers.filter((c: any) => c.status === 'ACTIVE').length;
        const confirmedCh = challans.filter((ch: any) => ch.status === 'CONFIRMED');
        const revenue = confirmedCh.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);

        setStats({
          totalProducts: products.length,
          lowStockCount: lowStock,
          totalCustomers: customers.length,
          activeCustomers: activeCust,
          totalChallans: challans.length,
          confirmedChallans: confirmedCh.length,
          totalRevenue: revenue,
        });

        setRecentLogs(logs);
      } catch (err) {
        console.error('Failed to load Mission Control telemetry data', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Telemetry Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-cyan-500/20 shadow-xl"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>REAL-TIME TELEMETRY SYSTEM</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">MISSION CONTROL CENTER</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Live physical-digital synchronization matrix for warehouse logistics.</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('warehouse_3d')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Boxes className="w-4 h-4" />
            <span>ENTER 3D WAREHOUSE</span>
          </button>

          <button 
            onClick={() => setActiveTab('challans')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>DISPATCH SHIPMENT</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Gross Dispatch Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel-interactive p-5 rounded-2xl border-emerald-500/20"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">TOTAL DISPATCH REVENUE</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white font-mono">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Confirmed Sales Challans</span>
            </div>
          </div>
        </motion.div>

        {/* KPI 2: Total Inventory Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel-interactive p-5 rounded-2xl border-cyan-500/20"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">WAREHOUSE SKUS</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white font-mono">{stats.totalProducts} ITEMS</div>
            <div className="flex items-center gap-1 text-[11px] text-cyan-400 mt-1 font-mono">
              <Boxes className="w-3.5 h-3.5" />
              <span>3D Shelf Mapped</span>
            </div>
          </div>
        </motion.div>

        {/* KPI 3: Active CRM Clients */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel-interactive p-5 rounded-2xl border-blue-500/20"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">ACTIVE CRM CLIENTS</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white font-mono">{stats.activeCustomers} / {stats.totalCustomers}</div>
            <div className="flex items-center gap-1 text-[11px] text-blue-400 mt-1 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Galaxy Mapped Nodes</span>
            </div>
          </div>
        </motion.div>

        {/* KPI 4: Stock Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel-interactive p-5 rounded-2xl border-amber-500/30 bg-amber-950/10"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-amber-300/80 uppercase tracking-wider">LOW STOCK ALERTS</span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-400 font-mono">{stats.lowStockCount} WARNINGS</div>
            <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-1 font-mono">
              <span>Requires immediate replenishment</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Main Grid: Recent Stock Movements & Quick Operational Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Stock Movement Log Feed */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">LIVE MOVEMENT LOG TELEMETRY</h3>
              <p className="text-xs text-slate-400 font-mono">Real-time record of inbound receiving & outbound dispatches.</p>
            </div>
            <button 
              onClick={() => setActiveTab('logs')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">No stock movement telemetry logged yet.</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold ${
                      log.type === 'IN' 
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
                        : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    }`}>
                      {log.type}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{log.product?.name || 'Item'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.reason} • By {log.createdBy}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className={`text-sm font-bold ${log.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {log.type === 'IN' ? `+${log.quantity}` : `-${log.quantity}`} Qty
                    </div>
                    <div className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Mission Control Operations */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">SYSTEM STATUS & SHORTCUTS</h3>
          <p className="text-xs text-slate-400 font-mono">Quick launch warehouse tools and CRM pipeline.</p>

          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('customers_3d')}
              className="w-full p-4 rounded-xl glass-panel-interactive border-blue-500/30 text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-mono text-blue-400 font-bold">3D CRM GALAXY</div>
                <div className="text-[11px] text-slate-400">View customer network nodes</div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="w-full p-4 rounded-xl glass-panel-interactive border-cyan-500/30 text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-mono text-cyan-400 font-bold">INVENTORY MANAGER</div>
                <div className="text-[11px] text-slate-400">Manage SKUs & adjust stock</div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => setActiveTab('challans')}
              className="w-full p-4 rounded-xl glass-panel-interactive border-amber-500/30 text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-mono text-amber-400 font-bold">SALES CHALLAN DISPATCH</div>
                <div className="text-[11px] text-slate-400">Drag & drop truck shipments</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
