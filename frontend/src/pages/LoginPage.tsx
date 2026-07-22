import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Cpu, Eye, EyeOff, Check } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../components/ui/Toast';

interface LoginPageProps {
  onSuccess: () => void;
}

const rolePresets = [
  { role: 'Admin', email: 'admin@erpflow.com' },
  { role: 'Sales', email: 'sales@erpflow.com' },
  { role: 'Warehouse', email: 'warehouse@erpflow.com' },
  { role: 'Accounts', email: 'accounts@erpflow.com' },
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
    const particleCount = Math.floor(Math.min(width, height) / 12);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 1.5 + 1,
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
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.25 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
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

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />;
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
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-cyber-grid"
         style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Cyber Particle Background Canvas */}
      <CyberParticleCanvas />

      {/* Ambient Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 80%)' }} />

      {/* Glowing Outer Border Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm sm:max-w-md p-[1.5px] rounded-[28px] relative z-10 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.6), rgba(139, 92, 246, 0.6) 50%, rgba(16, 185, 129, 0.6))',
          boxShadow: '0 0 35px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Inner Clean Card */}
        <div
          className="w-full rounded-[26.5px] p-7 sm:p-8 space-y-6 cyber-glass-panel"
          style={{ backgroundColor: 'rgba(6, 11, 20, 0.95)', backdropFilter: 'blur(24px)' }}
        >
          {/* Simple Logo & Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl border"
                 style={{
                   backgroundColor: 'rgba(6, 182, 212, 0.12)',
                   borderColor: 'rgba(6, 182, 212, 0.3)',
                   color: '#06B6D4',
                   boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
                 }}>
              <Cpu className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-mono text-white">
              ERPFlow
            </h1>
          </div>

          {/* Simple Clean Role Selection Pills */}
          <div className="grid grid-cols-2 gap-2">
            {rolePresets.map((r) => {
              const isSelected = email === r.email;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRolePreset(r.email)}
                  className="px-3 py-2 rounded-xl border text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all"
                  style={{
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                    borderColor: isSelected ? '#06B6D4' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#06B6D4' : '#94A3B8',
                  }}
                >
                  <span>{r.role}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>

          {/* Clean Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl border text-xs font-mono font-medium bg-rose-950/60 border-rose-500/50 text-rose-300">
                {error}
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-500"
              />
              <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-500"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-mono font-bold text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-2 border border-cyan-400/40 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
