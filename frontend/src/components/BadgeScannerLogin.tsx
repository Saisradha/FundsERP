import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Scan, KeyRound, User, Lock, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface BadgeScannerLoginProps {
  onSuccess: () => void;
}

export const BadgeScannerLogin: React.FC<BadgeScannerLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@erpflow.com');
  const [password, setPassword] = useState('password123');
  const [scanning, setScanning] = useState(false);
  const [gateOpening, setGateOpening] = useState(false);
  const [error, setError] = useState('');
  
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRoleSelect = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('password123');
    setError('');
  };

  const handleScanAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setScanning(true);

    try {
      // Simulate industrial scanner delay for immersive effect
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setScanning(false);
      setGateOpening(true);

      setAuth(res.data.user, res.data.accessToken);

      // Gate animation opening delay before proceeding to Mission Control
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err: any) {
      setScanning(false);
      setError(err.message || 'Access Denied: Invalid Badge Credentials');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden font-sans">
      {/* Background Industrial Lighting Grid & Laser lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90" />
      
      {/* Laser grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Animated Floating Industrial Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />

      {/* Futuristic Steel Security Gate */}
      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        
        {/* Top OS Header Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-4 py-2 rounded-full glass-panel border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase shadow-lg shadow-cyan-500/10"
        >
          <Zap className="w-4 h-4 animate-bounce text-cyan-400" />
          <span>ERPFlow Digital Warehouse OS — Security Protocol v4.8</span>
        </motion.div>

        {/* Industrial Security Scanner Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full glass-panel rounded-2xl border-slate-700/50 p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
        >
          {/* Laser Scanner Sweep Bar during scanning */}
          <AnimatePresence>
            {scanning && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#06b6d4] z-30 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Opening Gate Animation Effect */}
          <AnimatePresence>
            {gateOpening && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-cyan-950/90 z-40 flex flex-col items-center justify-center text-cyan-300 font-mono"
              >
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.2, 1] }}
                  transition={{ duration: 0.8 }}
                  className="p-4 rounded-full bg-cyan-500/20 border border-cyan-400 shadow-2xl mb-4"
                >
                  <ShieldCheck className="w-16 h-16 text-cyan-400" />
                </motion.div>
                <h2 className="text-2xl font-bold tracking-wider mb-2 text-white">CLEARANCE GRANTED</h2>
                <p className="text-sm text-cyan-400/80 animate-pulse">Opening Warehouse Blast Gates & Initializing 3D Mission Control...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Left Column: Badge Scanner Visualizer */}
            <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
              <div className="relative group cursor-pointer mb-4">
                <div className={`w-40 h-56 rounded-xl border-2 ${scanning ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'border-slate-700'} bg-slate-900/80 flex flex-col items-center justify-between p-4 transition-all duration-300`}>
                  
                  {/* Badge Chip Header */}
                  <div className="w-full flex justify-between items-center">
                    <div className="w-8 h-6 bg-amber-500/80 rounded-sm border border-amber-300 shadow-inner" />
                    <Scan className={`w-5 h-5 ${scanning ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
                  </div>

                  {/* Holographic User Avatar */}
                  <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center my-2 text-slate-400 shadow-inner">
                    <User className="w-10 h-10 text-cyan-400" />
                  </div>

                  {/* Badge Text Details */}
                  <div className="text-center w-full">
                    <div className="text-xs font-mono font-semibold text-slate-200 tracking-wider truncate">EMPLOYEE BADGE</div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{email.split('@')[0]}</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-400 font-mono mb-2">QUICK ROLE PRESETS</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { role: 'Admin', email: 'admin@erpflow.com', color: 'border-red-500/40 text-red-400' },
                    { role: 'Sales', email: 'sales@erpflow.com', color: 'border-cyan-500/40 text-cyan-400' },
                    { role: 'Warehouse', email: 'warehouse@erpflow.com', color: 'border-amber-500/40 text-amber-400' },
                    { role: 'Accounts', email: 'accounts@erpflow.com', color: 'border-emerald-500/40 text-emerald-400' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleRoleSelect(r.email)}
                      className={`px-3 py-1 text-[11px] font-mono rounded-lg border bg-slate-900/60 hover:bg-slate-800 transition-colors ${r.color}`}
                    >
                      {r.role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Authentication Form */}
            <form onSubmit={handleScanAndLogin} className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">SECURITY PORTAL</h1>
                <p className="text-xs text-slate-400 mt-1 font-mono">Present employee credentials to enter the Digital Warehouse OS.</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  BADGE EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="user@erpflow.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  SECURITY CLEARANCE PASSCODE
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={scanning || gateOpening}
                className="mt-2 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold font-mono text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 group cursor-pointer"
              >
                {scanning ? (
                  <>
                    <Scan className="w-5 h-5 animate-spin" />
                    <span>AUTHENTICATING BADGE...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>SCAN BADGE & OPEN GATE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

          </div>
        </motion.div>
      </div>
    </div>
  );
};
