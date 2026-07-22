import React from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useWarehouseStore } from './store/useWarehouseStore';

import { BadgeScannerLogin } from './components/BadgeScannerLogin';
import { Navigation } from './components/Navigation';
import { MissionControl } from './components/MissionControl';
import { WarehouseScene } from './components/3d/WarehouseScene';
import { CustomerGalaxy } from './components/3d/CustomerGalaxy';
import { ProductManager } from './components/ProductManager';
import { ChallanDispatch } from './components/ChallanDispatch';
import { StockLogsTable } from './components/StockLogsTable';

import { AiAssistantHologram } from './components/AiAssistantHologram';
import { CommandPalette } from './components/CommandPalette';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const { activeTab } = useWarehouseStore();

  if (!isAuthenticated) {
    return <BadgeScannerLogin onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Cyberpunk Navigation Header */}
      <Navigation />

      {/* Main Experience View Switcher */}
      <main className="flex-1">
        {activeTab === 'mission_control' && <MissionControl />}
        {activeTab === 'warehouse_3d' && <WarehouseScene />}
        {activeTab === 'customers_3d' && <CustomerGalaxy />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'challans' && <ChallanDispatch />}
        {activeTab === 'logs' && <StockLogsTable />}
      </main>

      {/* Global Interactive Overlays */}
      <AiAssistantHologram />
      <CommandPalette />
    </div>
  );
}

export default App;
