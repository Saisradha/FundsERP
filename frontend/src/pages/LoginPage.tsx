import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Cpu, Eye, EyeOff, Check, ShieldCheck, Briefcase, Boxes, Receipt, Sparkles } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from '../components/ui/Toast';

interface LoginPageProps {
  onSuccess: () => void;
}

const rolePresets = [
  { role: 'Admin', title: 'Root Operations', email: 'admin@erpflow.com', icon: ShieldCheck, color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
  { role: 'Sales', title: 'CRM & Orders', email: 'sales@erpflow.com', icon: Briefcase, color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)' },
  { role: 'Warehouse', title: 'Inventory SKUs', email: 'warehouse@erpflow.com', icon: Boxes, color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  { role: 'Accounts', title: 'Audit Telemetry', email: 'accounts@erpflow.com', icon: Receipt, color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
];

/* Particle Background Canvas */
const CyberParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const particleCount = Math.floor(Math.min(width, height) / 11);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 1.8 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.28 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70" />;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@erpflow.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || 'Invalid authorization credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-cyber-grid"
         style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Cyber Particle Background Canvas */}
      <CyberParticleCanvas />

      {/* Multi-Spectrum Ambient Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[200px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(139, 92, 246, 0.12) 40%, transparent 75%)' }} />

      {/* Animated Glowing Outer Border Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-[1.5px] rounded-[32px] relative z-10 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(139, 92, 246, 0.8) 50%, rgba(16, 185, 129, 0.8))',
          boxShadow: '0 0 50px rgba(6, 182, 212, 0.25), 0 0 100px rgba(139, 92, 246, 0.15)',
        }}
      >
        {/* Inner Glassmorphic Card */}
        <div
          className="w-full rounded-[30.5px] p-7 sm:p-8 space-y-6 cyber-glass-panel"
          style={{ backgroundColor: 'rgba(6, 11, 20, 0.94)', backdropFilter: 'blur(30px)' }}
        >
          {/* Header Status Bar */}
          <div className="flex items-center justify-between text-[10px] font-mono border-b pb-3"
               style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon" />
              <span className="font-bold tracking-wider text-emerald-400">CYBER COMMAND ONLINE</span>
            </div>
            <span className="font-mono text-tertiary">12ms • 256-BIT ENCRYPTED</span>
          </div>

          {/* Brand Core Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="relative inline-flex items-center justify-center p-3.5 rounded-2xl border"
                 style={{
                   backgroundColor: 'rgba(6, 182, 212, 0.12)',
                   borderColor: 'rgba(6, 182, 212, 0.4)',
                   color: '#06B6D4',
                   boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)'
                 }}>
              <Cpu className="w-8 h-8 relative z-10" />
              {/* Spinning Orbit Ring */}
              <div className="absolute inset-[-4px] border border-dashed border-cyan-400/60 rounded-2xl animate-spin-slow pointer-events-none" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-mono uppercase text-white">
              ERPFLOW PORTAL
            </h1>
            <p className="text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Enterprise Operations & Telemetry
            </p>
          </div>

          {/* Interactive Role Micro-Cards Grid */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <span>ONE-CLICK DEMO ACCESS</span>
              <span className="text-cyan-400">PASS: password123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rolePresets.map((r) => {
                const Icon = r.icon;
                const isSelected = email === r.email;
                return (
                  <motion.button
                    key={r.role}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRolePreset(r.email)}
                    className="p-3 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden"
                    style={{
                      backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.4)',
                      borderColor: isSelected ? r.color : 'rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? `0 0 20px ${r.glow}` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-1.5 rounded-lg border flex items-center justify-center"
                           style={{ backgroundColor: `${r.color}15`, borderColor: `${r.color}40`, color: r.color }}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white"
                              style={{ backgroundColor: r.color }}>
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs font-mono text-white">{r.role}</div>
                    <div className="text-[9px] font-mono text-slate-400 truncate">{r.title}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl border text-xs font-mono font-medium bg-rose-950/60 border-rose-500/50 text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">OPERATIONAL IDENTIFIER</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@erpflow.com"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">PASSCODE KEY</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-white cursor-pointer transition-all flex items-center justify-center gap-2 border border-cyan-400/40"
              style={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>AUTHENTICATE SESSION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Security Badge */}
          <div className="text-center text-[10px] font-mono text-slate-500 pt-1 flex items-center justify-between border-t border-slate-800">
            <span>🛡️ END-TO-END ENCRYPTED</span>
            <span>SYSTEM LATENCY: 12ms</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
