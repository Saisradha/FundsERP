import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Check, Sparkles } from 'lucide-react';
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

/* Particle Background Canvas (Preserved 100%) */
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-cyber-grid"
         style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Cyber Particle Background Canvas */}
      <CyberParticleCanvas />

      {/* Ambient Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[180px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 80%)' }} />

      {/* Outer Shell Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm sm:max-w-md rounded-[36px] p-6 pt-7 shadow-2xl relative z-10 border cyber-glass-panel flex flex-col items-center"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Top Headline & Subtitle */}
        <div className="text-center space-y-1 mb-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-cyan-400 mb-0.5 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> ERPFLOW PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Login to continue your operations
          </p>
        </div>

        {/* 3D Cyber Robot Mascot Leaning/Peeking over Inner Card Ledge */}
        <div className="relative w-36 h-36 -mb-8 z-20 pointer-events-none flex justify-center">
          <img
            src="/cyber_erp_mascot.png"
            alt="Cyber ERP Robot Mascot"
            className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(6,182,212,0.45)] hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Inner Overlapping Form Card */}
        <div
          className="w-full rounded-[28px] p-6 pt-9 space-y-4 relative z-10 border border-slate-700/60 shadow-2xl"
          style={{ backgroundColor: 'rgba(6, 11, 20, 0.95)', backdropFilter: 'blur(20px)' }}
        >
          {/* Quick Preset Role Selector Pills */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick Role Login
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {rolePresets.map((r) => {
                const isSelected = email === r.email;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRolePreset(r.email)}
                    className="px-3 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                      borderColor: isSelected ? '#06B6D4' : 'rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#06B6D4' : '#94A3B8',
                      boxShadow: isSelected ? '0 0 12px rgba(6, 182, 212, 0.3)' : 'none',
                    }}
                  >
                    <span>{r.role}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-2xl border text-xs font-mono font-medium bg-rose-950/60 border-rose-500/50 text-rose-300">
                {error}
              </div>
            )}

            {/* Email Field with Circular Badge */}
            <div className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Username"
                className="w-full bg-transparent border-none text-white font-mono text-xs focus:outline-none placeholder:text-slate-500 pr-3"
              />
            </div>

            {/* Password Field with Circular Badge */}
            <div className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full bg-slate-900/90 border border-slate-700/80 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border-none text-white font-mono text-xs focus:outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Full-Width Action Pill Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-full font-mono font-bold text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #8B5CF6 100%)',
                boxShadow: '0 8px 25px rgba(6, 182, 212, 0.35)',
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
            </motion.button>
          </form>

          {/* Card Footer */}
          <div className="text-center text-[10px] font-mono text-slate-500 pt-1">
            Default Password: <span className="font-semibold text-slate-300">password123</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
