import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { Product3D } from './store/useWarehouseStore';

import { LoginPage } from './pages/LoginPage';
import { IsometricNavDock } from './components/IsometricNavDock';
import { InteractiveHub } from './components/InteractiveHub';
import { RightGlassPanel } from './components/RightGlassPanel';
import { ToastProvider } from './components/ui/Toast';
import { apiRequest } from './services/api';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy 3D scene
const IsometricIslandWorld = lazy(() =>
  import('./components/3d/IsometricIslandWorld').then((m) => ({ default: m.IsometricIslandWorld }))
);

const ThreeDFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center z-0"
       style={{ background: 'var(--color-bg)' }}>
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
        Loading 3D Environment...
      </span>
    </div>
  </div>
);

export function App() {
  const { isAuthenticated } = useAuthStore();
  const { resolvedTheme, viewMode, initTheme } = useThemeStore();

  const [activeModule, setActiveModule] = useState<
    'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports'
  >('dashboard');

  const [products, setProducts] = useState<Product3D[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, []);

  const fetchWorldData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, chRes, lRes] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/customers'),
        apiRequest('/challans'),
        apiRequest('/products/logs?limit=50'),
      ]);
      setProducts(pRes.data || []);
      setCustomers(cRes.data || []);
      setChallans(chRes.data || []);
      setLogs(lRes.data || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorldData();
    }
  }, [isAuthenticated]);

  // Refresh data when switching modules
  useEffect(() => {
    if (isAuthenticated && activeModule !== 'dashboard') {
      fetchWorldData();
    }
  }, [activeModule]);

  const healthyCount = products.filter((p) => p.currentStock > p.minStockAlert).length;
  const lowCount = products.filter((p) => p.currentStock <= p.minStockAlert && p.currentStock > 0).length;
  const criticalCount = products.filter((p) => p.currentStock === 0).length;
  const activeCustomerCount = customers.filter((c) => c.status === 'ACTIVE').length;

  if (!isAuthenticated) {
    return (
      <div className={resolvedTheme === 'dark' ? 'theme-dark' : 'theme-light'}>
        <LoginPage onSuccess={() => {}} />
        <ToastProvider />
      </div>
    );
  }

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${
      resolvedTheme === 'dark' ? 'theme-dark' : 'theme-light'
    }`}>
      {/* Persistent 3D Background */}
      <Suspense fallback={<ThreeDFallback />}>
        <IsometricIslandWorld
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          productStats={{ healthy: healthyCount, low: lowCount, critical: criticalCount }}
          activeCustomerCount={activeCustomerCount}
        />
      </Suspense>

      {/* Top Navigation Dock */}
      <IsometricNavDock
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
      />

      {/* Hub Mode — Full overlay with all CRUD */}
      <AnimatePresence mode="wait">
        {viewMode === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 overflow-y-auto z-10 backdrop-blur-xl"
            style={{ background: resolvedTheme === 'dark'
              ? 'rgba(5, 7, 10, 0.92)'
              : 'rgba(245, 247, 250, 0.92)'
            }}
          >
            <InteractiveHub
              products={products}
              customers={customers}
              challans={challans}
              logs={logs}
              loading={loading}
              onRefresh={fetchWorldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Mode — Right slide-over panel */}
      <AnimatePresence>
        {viewMode === '3d' && activeModule !== 'dashboard' && (
          <RightGlassPanel
            module={activeModule}
            onClose={() => setActiveModule('dashboard')}
            products={products}
            customers={customers}
            challans={challans}
            logs={logs}
            onRefresh={fetchWorldData}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <ToastProvider />
    </div>
  );
}

export default App;
