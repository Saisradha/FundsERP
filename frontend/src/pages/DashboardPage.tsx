import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight
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
        console.error('Failed to load dashboard telemetry data', err);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Apple Display Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Operations Overview</h1>
        <p className="text-xs text-slate-400 font-sans mt-1">Real-time inventory metrics, CRM accounts, and sales dispatches.</p>
      </div>

      {/* Apple-style Soft Rounded KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="apple-card p-6 space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>DISPATCH REVENUE</span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-sans flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.confirmedChallans} Confirmed Orders</span>
          </div>
        </div>

        <div className="apple-card p-6 space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>WAREHOUSE SKUS</span>
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.totalProducts} ITEMS</div>
          <div className="text-[11px] text-slate-400 font-sans">Mapped in catalog</div>
        </div>

        <div className="apple-card p-6 space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>ACTIVE CRM CLIENTS</span>
            <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.activeCustomers} / {stats.totalCustomers}</div>
          <div className="text-[11px] text-sky-400 font-sans">Active accounts</div>
        </div>

        <div className="apple-card p-6 space-y-3 border-amber-500/30">
          <div className="flex justify-between items-center text-amber-300 text-xs font-mono">
            <span>LOW STOCK ALERTS</span>
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.lowStockCount} WARNINGS</div>
          <div className="text-[11px] text-amber-300 font-sans">Requires replenishment</div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Stock Movements Feed */}
        <div className="lg:col-span-2 apple-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Recent Movements</h2>
            <button
              onClick={() => setActiveTab('logs')}
              className="text-xs font-sans text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">No recent movement records.</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      log.type === 'IN' 
                        ? 'apple-pill-green' 
                        : 'apple-pill-amber'
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

        {/* Quick Operations Shortcuts */}
        <div className="apple-card p-6 space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">Quick Shortcuts</h2>

          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('customers_3d')}
              className="w-full p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-blue-500/40 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-bold text-blue-400">Customer CRM</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Manage clients & follow-up notes</div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="w-full p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-blue-500/40 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-bold text-blue-400">Product Inventory</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Adjust stock & view catalog</div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => setActiveTab('challans')}
              className="w-full p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-amber-500/40 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-bold text-amber-400">Sales Challans</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dispatch orders with stock protection</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
