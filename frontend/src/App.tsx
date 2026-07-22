import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Product3D } from './store/useWarehouseStore';

import { LoginPage } from './pages/LoginPage';
import { IsometricIslandWorld } from './components/3d/IsometricIslandWorld';
import { IsometricNavDock } from './components/IsometricNavDock';
import { RightGlassPanel } from './components/RightGlassPanel';
import { apiRequest } from './services/api';

export function App() {
  const { isAuthenticated } = useAuthStore();
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
      console.error('Failed to load 3D city telemetry data', err);
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#F4F7FA] font-sans">
      
      {/* Master 3D Isometric Miniature Industrial City World */}
      <IsometricIslandWorld
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        productStats={{ healthy: healthyCount, low: lowCount, critical: criticalCount }}
        activeCustomerCount={activeCustomerCount}
      />

      {/* Floating Light Glass Building Navigation Dock */}
      <IsometricNavDock
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
      />

      {/* Right-Side Slide-Over White Glass Spatial Panel */}
      <RightGlassPanel
        module={activeModule}
        onClose={() => setActiveModule('dashboard')}
        products={products}
        customers={customers}
        challans={challans}
        logs={logs}
        onRefresh={fetchWorldData}
      />

    </div>
  );
}

export default App;
