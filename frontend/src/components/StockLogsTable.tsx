import React, { useState, useEffect } from 'react';
import { History, ArrowDownRight, ArrowUpRight, Search, Clock, User, Box } from 'lucide-react';
import { apiRequest } from '../services/api';

export const StockLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await apiRequest('/products/logs?limit=100');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch stock logs', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const text = `${log.product?.name} ${log.product?.sku} ${log.reason} ${log.createdBy}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <History className="w-4 h-4 text-cyan-400" />
            <span>AUDIT TRAIL & TELEMETRY LOGS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">STOCK MOVEMENT LOGS</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Immutable ledger tracking inbound receiving and outbound sales dispatches.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movement audit log..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Movement Logs Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Type</th>
                <th className="p-4">Product / SKU</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Reason / Source</th>
                <th className="p-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No stock movement audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md font-bold inline-flex items-center gap-1 ${
                        log.type === 'IN' 
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
                          : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      }`}>
                        {log.type === 'IN' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white font-sans">{log.product?.name || 'Unknown Item'}</div>
                      <div className="text-[10px] text-cyan-400">SKU: {log.product?.sku}</div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${log.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {log.type === 'IN' ? `+${log.quantity}` : `-${log.quantity}`} Units
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{log.reason}</td>
                    <td className="p-4 text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{log.createdBy}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
