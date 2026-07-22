import React, { useState, useEffect } from 'react';
import { Search, Clock, User } from 'lucide-react';
import { apiRequest } from '../services/api';

export const StockLogsPage: React.FC = () => {
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
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Stock Movement Audit Logs</h1>
          <p className="text-xs text-slate-400 font-sans mt-1">Audit log tracking inventory receiving (IN) and sales dispatches (OUT).</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit reason, SKU, operator..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
      </div>

      {/* Movement Table */}
      <div className="apple-card rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-white/5">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Type</th>
                <th className="p-4">Product / SKU</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Audit Reason</th>
                <th className="p-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">No stock movement logs found.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        log.type === 'IN' 
                          ? 'apple-pill-green' 
                          : 'apple-pill-amber'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white font-sans text-sm">{log.product?.name || 'Item'}</div>
                      <div className="text-[10px] text-blue-400">SKU: {log.product?.sku}</div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${log.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {log.type === 'IN' ? `+${log.quantity}` : `-${log.quantity}`} Units
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-sans">{log.reason}</td>
                    <td className="p-4 text-slate-400 flex items-center gap-1.5 font-sans">
                      <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
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
