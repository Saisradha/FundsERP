import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, Shield } from 'lucide-react';
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
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ERPFlow Admin Portal</h1>
          <p className="text-xs text-slate-400 font-mono">Sign in with role-based access credentials.</p>
        </div>

        {/* Role Quick Presets */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider text-center">
            Role Preset Accounts (Passcode: password123)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'Admin', email: 'admin@erpflow.com', color: 'border-red-500/30 text-red-400 bg-red-500/5' },
              { role: 'Sales', email: 'sales@erpflow.com', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5' },
              { role: 'Warehouse', email: 'warehouse@erpflow.com', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5' },
              { role: 'Accounts', email: 'accounts@erpflow.com', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRolePreset(r.email)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono border text-center transition-colors cursor-pointer hover:bg-slate-800 ${r.color}`}
              >
                {r.role}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
              placeholder="user@erpflow.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              PASSCODE
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm font-mono shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>SIGN IN TO PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
