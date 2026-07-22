import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Building2 } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';

interface LoginPageProps {
  onSuccess: () => void;
}

const rolePresets = [
  { role: 'Admin', email: 'admin@erpflow.com', variant: 'danger' as const },
  { role: 'Sales', email: 'sales@erpflow.com', variant: 'info' as const },
  { role: 'Warehouse', email: 'warehouse@erpflow.com', variant: 'warning' as const },
  { role: 'Accounts', email: 'accounts@erpflow.com', variant: 'success' as const },
];

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
      toast.success(`Welcome back, ${res.data.user.name}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
         style={{ background: 'var(--color-bg)' }}>

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
           style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl space-y-6 relative z-10 border"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl mb-1"
               style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            ERPFlow
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Industrial Operations Portal
          </p>
        </div>

        {/* Role Presets */}
        <div className="p-3 rounded-xl border" style={{
          background: 'var(--color-input)', borderColor: 'var(--color-border)',
        }}>
          <div className="text-[10px] font-mono text-center mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
            DEMO ACCOUNTS (pass: password123)
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {rolePresets.map((r) => (
              <motion.button
                key={r.role}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRolePreset(r.email)}
                className="cursor-pointer"
              >
                <Badge variant={r.variant}>{r.role}</Badge>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl text-xs text-center chip-danger"
            >
              {error}
            </motion.div>
          )}

          <Input
            label="EMAIL ADDRESS"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-3.5 h-3.5" />}
            placeholder="user@erpflow.com"
          />

          <Input
            label="PASSWORD"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-3.5 h-3.5" />}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full btn-lg"
            icon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
