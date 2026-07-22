import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Building2 } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@erpflow.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRolePreset = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuth(res.data.user, res.data.accessToken);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid authentication credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7FA] flex items-center justify-center p-6 font-sans text-slate-900 relative overflow-hidden">
      
      {/* Soft Ambient Sunlight Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-1 border border-blue-100 shadow-sm">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">ERPFlow City OS</h1>
          <p className="text-xs text-slate-500 font-sans">3D Miniature Industrial Logistics Portal</p>
        </div>

        {/* Quick Role Clearance Pills */}
        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 text-center uppercase tracking-widest">
            Role Clearances (Passcode: password123)
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 font-mono">
            {[
              { role: 'Admin', email: 'admin@erpflow.com', style: 'chip-danger' },
              { role: 'Sales', email: 'sales@erpflow.com', style: 'chip-primary' },
              { role: 'Warehouse', email: 'warehouse@erpflow.com', style: 'chip-warning' },
              { role: 'Accounts', email: 'accounts@erpflow.com', style: 'chip-success' },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRolePreset(r.email)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 cursor-pointer ${r.style}`}
              >
                {r.role}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl chip-danger text-xs font-mono text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              placeholder="user@erpflow.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              PASSCODE
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter 3D City OS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
