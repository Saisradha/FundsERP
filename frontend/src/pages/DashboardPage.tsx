import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  ArrowRight,
  Boxes
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useWarehouseStore } from '../store/useWarehouseStore';

export const DashboardPage: React.FC = () => {
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
        console.error('Failed to load dashboard data', err);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">OPERATIONS DASHBOARD</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Overview of inventory telemetry, CRM pipeline, and sales challan dispatches.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>TOTAL DISPATCH REVENUE</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.confirmedChallans} Confirmed Orders</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>WAREHOUSE SKUS</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalProducts} ITEMS</div>
          <div className="text-[11px] text-blue-400 font-mono">Mapped across warehouse racks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>ACTIVE CRM CLIENTS</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.activeCustomers} / {stats.totalCustomers}</div>
          <div className="text-[11px] text-cyan-400 font-mono">Enterprise customer accounts</div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 bg-amber-950/10 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-amber-300 text-xs font-mono">
            <span>LOW STOCK ALERTS</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.lowStockCount} WARNINGS</div>
          <div className="text-[11px] text-amber-300 font-mono">Stock at or below minimum threshold</div>
        </div>

      </div>

      {/* Main Grid: Recent Activity Feed & Module Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">RECENT STOCK MOVEMENTS</h2>
            <button
              onClick={() => setActiveTab('logs')}
              className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">No recent movement records.</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      log.type === 'IN' 
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                    }`}>
                      {log.type}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{log.product?.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.reason} • By {log.createdBy}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className={`font-bold ${log.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {log.type === 'IN' ? `+${log.quantity}` : `-${log.quantity}`} Qty
                    </div>
                    <div className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Controls */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">QUICK ACTIONS</h2>

          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('customers_3d')}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-bold text-blue-400 font-mono">CUSTOMER CRM</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Manage accounts & follow-up notes</div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-bold text-blue-400 font-mono">PRODUCT CATALOG</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Adjust stock & view shelf locations</div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => setActiveTab('challans')}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-bold text-amber-400 font-mono">DISPATCH SALES CHALLAN</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Generate orders with stock protection</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
