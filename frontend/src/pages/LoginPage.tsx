import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Cpu, Eye, EyeOff, Check } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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

/* Particle Background Canvas (Unchanged) */
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

      {/* Radial Ambient Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 80%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm sm:max-w-md rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 border cyber-glass-panel"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-xl), 0 0 30px rgba(6, 182, 212, 0.1)',
        }}
      >
        {/* Brand Core Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl border"
               style={{
                 backgroundColor: 'var(--color-primary-light)',
                 borderColor: 'var(--color-info-border)',
                 color: 'var(--color-primary)',
                 boxShadow: '0 0 15px var(--color-primary-glow)'
               }}>
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-mono" style={{ color: 'var(--color-text)' }}>
            ERPFlow
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            Enterprise Resource Planning & Operations
          </p>
        </div>

        {/* Demo Preset Chips */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-tertiary)' }}>
            Quick Demo Login
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {rolePresets.map((r) => {
              const isSelected = email === r.email;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRolePreset(r.email)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-input)',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <span>{r.role}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl border text-xs font-mono font-medium" style={{
              backgroundColor: 'var(--color-danger-light)',
              borderColor: 'var(--color-danger-border)',
              color: 'var(--color-danger-text)',
            }}>
              {error}
            </div>
          )}

          <Input
            label="EMAIL ADDRESS"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            placeholder="operator@erpflow.com"
          />

          <div className="space-y-1">
            <label className="input-label">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                style={{ color: 'var(--color-text-tertiary)' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full justify-center py-2.5"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-[11px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
          Default Password: <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>password123</span>
        </div>
      </motion.div>
    </div>
  );
};
