import React from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useWarehouseStore } from './store/useWarehouseStore';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomerCrmPage } from './pages/CustomerCrmPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesChallanPage } from './pages/SalesChallanPage';
import { StockLogsPage } from './pages/StockLogsPage';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const { activeTab } = useWarehouseStore();

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'mission_control' && <DashboardPage />}
          {activeTab === 'customers_3d' && <CustomerCrmPage />}
          {activeTab === 'products' && <InventoryPage />}
          {activeTab === 'challans' && <SalesChallanPage />}
          {activeTab === 'logs' && <StockLogsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
