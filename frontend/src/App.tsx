import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useWarehouseStore, Product3D } from './store/useWarehouseStore';

import { BadgeScannerLogin } from './components/BadgeScannerLogin';
import { Navigation } from './components/Navigation';
import { Unified3DScene } from './components/3d/Unified3DScene';
import { MissionControl } from './components/MissionControl';
import { ProductManager } from './components/ProductManager';
import { ChallanDispatch } from './components/ChallanDispatch';
import { StockLogsTable } from './components/StockLogsTable';
import { AiAssistantHologram } from './components/AiAssistantHologram';
import { CommandPalette } from './components/CommandPalette';

import { apiRequest } from './services/api';
import { X, Mail, Phone, Building, MapPin, MessageSquare, Plus } from 'lucide-react';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const { activeTab, setSelectedProduct } = useWarehouseStore();

  const [products, setProducts] = useState<Product3D[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerHUD, setSelectedCustomerHUD] = useState<any | null>(null);
  const [newNote, setNewNote] = useState('');

  const fetchWorldData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/customers'),
      ]);
      setProducts(pRes.data || []);
      setCustomers(cRes.data || []);
    } catch (err) {
      console.error('Failed to load 3D world telemetry data', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorldData();
    }
  }, [isAuthenticated, activeTab]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerHUD || !newNote.trim()) return;

    try {
      await apiRequest(`/customers/${selectedCustomerHUD.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: newNote }),
      });
      setNewNote('');
      const updated = await apiRequest(`/customers/${selectedCustomerHUD.id}`);
      setSelectedCustomerHUD(updated.data);
      fetchWorldData();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  if (!isAuthenticated) {
    return <BadgeScannerLogin onSuccess={() => {}} />;
  }

  // Map activeTab to 3D Camera Focus Zone
  const getCameraZone = () => {
    switch (activeTab) {
      case 'mission_control':
        return 'mission_control';
      case 'warehouse_3d':
      case 'products':
        return 'warehouse';
      case 'customers_3d':
        return 'customers';
      case 'challans':
        return 'dispatch';
      default:
        return 'mission_control';
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      
      {/* Persistent 100% 3D World Canvas Background */}
      <Unified3DScene
        products={products}
        customers={customers}
        selectedZone={getCameraZone()}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onSelectCustomer={(customer) => setSelectedCustomerHUD(customer)}
      />

      {/* Top Cyberpunk Navigation Header Overlay */}
      <Navigation />

      {/* Glass HUD Overlay Layer Suspended Over Live 3D World */}
      <div className="relative z-10 w-full h-[calc(100vh-65px)] overflow-y-auto pointer-events-auto">
        {activeTab === 'mission_control' && <MissionControl />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'challans' && <ChallanDispatch />}
        {activeTab === 'logs' && <StockLogsTable />}
      </div>

      {/* 3D Customer CRM Inspection Drawer HUD */}
      {selectedCustomerHUD && (
        <div className="fixed top-20 right-6 z-40 w-96 max-h-[calc(100vh-100px)] overflow-y-auto glass-panel p-6 rounded-2xl border-cyan-500/50 shadow-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase bg-cyan-500/20 text-cyan-300 border-cyan-400">
                {selectedCustomerHUD.status} CLIENT
              </span>
              <h3 className="text-lg font-bold text-white mt-1 leading-tight">{selectedCustomerHUD.name}</h3>
              <p className="text-xs text-cyan-400 font-mono">{selectedCustomerHUD.businessName}</p>
            </div>
            <button onClick={() => setSelectedCustomerHUD(null)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{selectedCustomerHUD.email}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{selectedCustomerHUD.mobile}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Type: {selectedCustomerHUD.customerType}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{selectedCustomerHUD.address}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              CRM FOLLOW-UP NOTES ({selectedCustomerHUD.notes?.length || 0})
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedCustomerHUD.notes?.map((n: any) => (
                <div key={n.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                  <p className="text-slate-200">{n.note}</p>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono flex justify-between">
                    <span>By {n.createdBy}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add follow-up note..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-mono text-xs font-bold hover:bg-cyan-500 transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Interactive Hologram & Command Palette */}
      <AiAssistantHologram />
      <CommandPalette />
    </div>
  );
}

export default App;
