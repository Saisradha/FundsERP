import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Product3D } from './store/useWarehouseStore';

import { LoginPage } from './pages/LoginPage';
import { SpatialWarehouseWorld } from './components/3d/SpatialWarehouseWorld';
import { SpatialNavDock } from './components/SpatialNavDock';
import { SpatialGlassHUD } from './components/SpatialGlassHUD';
import { apiRequest } from './services/api';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const [sector, setSector] = useState<'entry' | 'racks' | 'crm' | 'dispatch' | 'conveyor' | 'reports'>('racks');

  const [products, setProducts] = useState<Product3D[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchSpatialWorldData = async () => {
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
      console.error('Failed to load spatial world telemetry data', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSpatialWorldData();
    }
  }, [isAuthenticated, sector]);

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => {}} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070A] font-sans">
      
      {/* Persistent 3D Spatial Digital Twin World */}
      <SpatialWarehouseWorld
        products={products}
        customers={customers}
        selectedSector={sector}
        onSelectProduct={() => setSector('racks')}
        onSelectCustomer={() => setSector('crm')}
      />

      {/* Floating Spatial Sector Dock Bar */}
      <SpatialNavDock
        activeSector={sector}
        onSelectSector={(s) => setSector(s)}
      />

      {/* Suspended Spatial Glass HUD Overlays */}
      <SpatialGlassHUD
        sector={sector}
        products={products}
        customers={customers}
        challans={challans}
        logs={logs}
        onRefresh={fetchSpatialWorldData}
      />

    </div>
  );
}

export default App;
