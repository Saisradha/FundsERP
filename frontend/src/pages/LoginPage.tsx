import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-[#080c14] flex items-center justify-center p-6 font-sans text-slate-100 relative overflow-hidden">
      
      {/* Soft Ambient Radial Background Blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md apple-glass rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 border border-white/10">
        
        {/* Apple-style Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-400 mb-1 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ERPFlow Portal</h1>
          <p className="text-xs text-slate-400 font-sans">Enterprise Operations & CRM OS</p>
        </div>

        {/* Quick Role Clearance Pills */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 text-center uppercase tracking-widest">
            Role Clearances (Passcode: password123)
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { role: 'Admin', email: 'admin@erpflow.com', style: 'apple-pill-red' },
              { role: 'Sales', email: 'sales@erpflow.com', style: 'apple-pill-blue' },
              { role: 'Warehouse', email: 'warehouse@erpflow.com', style: 'apple-pill-amber' },
              { role: 'Accounts', email: 'accounts@erpflow.com', style: 'apple-pill-green' },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRolePreset(r.email)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all hover:scale-105 cursor-pointer ${r.style}`}
              >
                {r.role}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl apple-pill-red text-xs font-mono text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="user@erpflow.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              PASSCODE
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
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
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
