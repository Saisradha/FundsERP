import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { Product3D } from './store/useWarehouseStore';

import { LoginPage } from './pages/LoginPage';
import { IsometricIslandWorld } from './components/3d/IsometricIslandWorld';
import { IsometricNavDock } from './components/IsometricNavDock';
import { RightGlassPanel } from './components/RightGlassPanel';
import { InteractiveHub } from './components/InteractiveHub';
import { apiRequest } from './services/api';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme, viewMode } = useThemeStore();

  const [activeModule, setActiveModule] = useState<'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports'>('dashboard');

  const [products, setProducts] = useState<Product3D[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchWorldData = async () => {
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
      console.error('Failed to load telemetry data', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorldData();
    }
  }, [isAuthenticated, activeModule]);

  const healthyCount = products.filter((p) => p.currentStock > p.minStockAlert).length;
  const lowCount = products.filter((p) => p.currentStock <= p.minStockAlert && p.currentStock > 0).length;
  const criticalCount = products.filter((p) => p.currentStock === 0).length;
  const activeCustomerCount = customers.filter((c) => c.status === 'ACTIVE').length;

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => {}} />;
  }

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      
      {/* Persistent Ambient 3D Isometric Miniature Industrial City World */}
      <IsometricIslandWorld
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        productStats={{ healthy: healthyCount, low: lowCount, critical: criticalCount }}
        activeCustomerCount={activeCustomerCount}
      />

      {/* Floating Top Dock: Navigation, Theme Toggle, View Switcher */}
      <IsometricNavDock
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
      />

      {/* Mode A: Interactive Control Hub View Overlay (High Contrast Crisp Background) */}
      {viewMode === 'hub' && (
        <div className={`absolute inset-0 overflow-y-auto z-10 backdrop-blur-xl ${
          theme === 'dark' ? 'bg-[#080C14]/92 text-white' : 'bg-[#F4F7FA]/92 text-slate-900'
        }`}>
          <InteractiveHub
            products={products}
            customers={customers}
            challans={challans}
            logs={logs}
            onRefresh={fetchWorldData}
          />
        </div>
      )}

      {/* Mode B: 3D Spatial Building Zoom View + Right Glass Panel */}
      {viewMode === '3d' && (
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

    </div>
  );
}

export default App;
