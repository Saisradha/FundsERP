import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Search, 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  MessageSquare, 
  Filter,
  DollarSign,
  TrendingUp,
  Boxes,
  Truck,
  Users,
  Activity
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { Product3D } from '../store/useWarehouseStore';

interface SpatialGlassHUDProps {
  sector: 'entry' | 'racks' | 'crm' | 'dispatch' | 'conveyor' | 'reports';
  products: Product3D[];
  customers: any[];
  challans: any[];
  logs: any[];
  onRefresh: () => void;
}

export const SpatialGlassHUD: React.FC<SpatialGlassHUDProps> = ({
  sector,
  products,
  customers,
  challans,
  logs,
  onRefresh,
}) => {
  // Inventory State
  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Supplier Dock Arrival');

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Power Units',
    unitPrice: 150,
    currentStock: 50,
    minStockAlert: 10,
    location: 'Zone Alpha - Shelf 01',
  });

  // CRM State
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newCustData, setNewCustData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    initialNote: '',
  });

  // Challan State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [challanStatus, setChallanStatus] = useState<'DRAFT' | 'CONFIRMED'>('CONFIRMED');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handlers
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await apiRequest(`/products/${selectedProduct.id}/stock`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: stockAdjQty,
          type: stockAdjType,
          reason: stockAdjReason,
        }),
      });
      setSelectedProduct(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
      setShowAddProduct(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Product registration failed');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;
    try {
      await apiRequest(`/customers/${selectedCustomer.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: newNote }),
      });
      setNewNote('');
      const updated = await apiRequest(`/customers/${selectedCustomer.id}`);
      setSelectedCustomer(updated.data);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(newCustData),
      });
      setShowAddCustomer(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Customer creation failed');
    }
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedCustomerId || cart.length === 0) {
      setErrorMessage('Please select a customer and at least one product.');
      return;
    }

    try {
      const res = await apiRequest('/challans', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: cart,
          status: challanStatus,
        }),
      });

      setSuccessMessage(`Sales Challan #${res.data.challanNumber} dispatched!`);
      setCart([]);
      setSelectedCustomerId('');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Challan dispatch failed');
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return total + (p ? p.unitPrice * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 z-30 pointer-events-none flex justify-center">
      
      {/* 1. Storage Racks Inventory Sector HUD */}
      {sector === 'racks' && (
        <div className="pointer-events-auto w-full max-w-4xl spatial-glass p-6 space-y-4 max-h-[420px] overflow-y-auto font-sans">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">SPATIAL SECTOR: STORAGE RACKS</span>
              <h2 className="text-xl font-bold text-white">Product Inventory Racks</h2>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((p) => {
              const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
              const isOut = p.currentStock === 0;

              return (
                <div key={p.id} className="spatial-card p-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white font-sans text-sm">{p.name}</div>
                      <div className="text-[10px] text-blue-400">{p.sku}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isOut ? 'spatial-chip-danger' : isLow ? 'spatial-chip-warning' : 'spatial-chip-success'
                    }`}>
                      {p.currentStock} Qty
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] flex justify-between">
                    <span>{p.location}</span>
                    <span className="text-emerald-400 font-bold">${p.unitPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="w-full py-1.5 rounded-full bg-white/5 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-white/10 font-sans font-semibold transition-all cursor-pointer"
                  >
                    Inspect & Adjust Stock
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Customer Orbit CRM Sector HUD */}
      {sector === 'crm' && (
        <div className="pointer-events-auto w-full max-w-4xl spatial-glass p-6 space-y-4 max-h-[420px] overflow-y-auto font-sans">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">SPATIAL SECTOR: CUSTOMER ORBIT</span>
              <h2 className="text-xl font-bold text-white">Enterprise CRM Accounts</h2>
            </div>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customers.map((c) => (
              <div key={c.id} className="spatial-card p-4 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    <div className="text-[10px] font-mono text-blue-400">{c.businessName}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                    c.status === 'ACTIVE' ? 'spatial-chip-success' : c.status === 'LEAD' ? 'spatial-chip-warning' : 'spatial-chip-danger'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 truncate">{c.email}</div>

                <button
                  onClick={() => setSelectedCustomer(c)}
                  className="w-full py-1.5 rounded-full bg-white/5 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-white/10 font-semibold transition-all cursor-pointer"
                >
                  View Follow-up Notes ({c.notes?.length || 0})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Dispatch Dock Challans Sector HUD */}
      {sector === 'dispatch' && (
        <div className="pointer-events-auto w-full max-w-4xl spatial-glass p-6 space-y-4 max-h-[420px] overflow-y-auto font-sans">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">SPATIAL SECTOR: DISPATCH BAYS</span>
              <h2 className="text-xl font-bold text-white">Sales Challan Orders</h2>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl spatial-chip-danger text-xs font-mono">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="p-3 rounded-2xl spatial-chip-success text-xs font-mono">{successMessage}</div>
          )}

          <form onSubmit={handleCreateChallan} className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[10px]">CUSTOMER *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">SELECT PRODUCTS</label>
                <div className="flex gap-2 max-w-full overflow-x-auto pb-1">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={p.currentStock === 0}
                      onClick={() => {
                        setCart((prev) => {
                          const existing = prev.find((i) => i.productId === p.id);
                          if (existing) return prev.map((i) => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
                          return [...prev, { productId: p.id, quantity: 1 }];
                        });
                      }}
                      className="px-3 py-1 rounded-full bg-slate-950 border border-white/10 text-white hover:border-blue-500 text-[10px] shrink-0 disabled:opacity-30 cursor-pointer"
                    >
                      + {p.name} (${p.unitPrice})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Items */}
            {cart.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                {cart.map((item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="flex justify-between items-center text-slate-200">
                      <span>{p.name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={p.currentStock}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCart((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: val } : i));
                          }}
                          className="w-14 p-1 rounded-full bg-slate-900 border border-white/10 text-center text-white"
                        />
                        <button type="button" onClick={() => setCart((prev) => prev.filter((i) => i.productId !== item.productId))}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-[10px] text-slate-400">TOTAL VALUE</span>
                <div className="text-lg font-bold text-emerald-400">${calculateCartTotal().toFixed(2)}</div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold cursor-pointer shadow-lg shadow-blue-500/20"
              >
                Confirm & Dispatch Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Conveyor Stock Movement Telemetry Logs HUD */}
      {sector === 'conveyor' && (
        <div className="pointer-events-auto w-full max-w-4xl spatial-glass p-6 space-y-4 max-h-[420px] overflow-y-auto font-sans">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">SPATIAL SECTOR: CONVEYOR BELT LOGS</span>
            <h2 className="text-xl font-bold text-white">Stock Movement Telemetry Ledger</h2>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {logs.map((l) => (
              <div key={l.id} className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    l.type === 'IN' ? 'spatial-chip-success' : 'spatial-chip-warning'
                  }`}>
                    {l.type}
                  </span>
                  <div>
                    <div className="font-bold text-white font-sans">{l.product?.name}</div>
                    <div className="text-[10px] text-slate-400">{l.reason} • By {l.createdBy}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${l.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {l.type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`} Qty
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(l.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals for Adjust Stock / Add Customer */}
      {selectedProduct && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-md spatial-glass p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Adjust Stock: {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjType('IN')}
                  className={`py-2 rounded-full font-bold ${stockAdjType === 'IN' ? 'spatial-chip-success' : 'bg-slate-950 text-slate-400'}`}
                >
                  IN (+ Receiving)
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjType('OUT')}
                  className={`py-2 rounded-full font-bold ${stockAdjType === 'OUT' ? 'spatial-chip-warning' : 'bg-slate-950 text-slate-400'}`}
                >
                  OUT (- Dispatch)
                </button>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">QUANTITY CHANGED</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjQty}
                  onChange={(e) => setStockAdjQty(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">AUDIT REASON</label>
                <input
                  type="text"
                  required
                  value={stockAdjReason}
                  onChange={(e) => setStockAdjReason(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 font-sans">
                <button type="button" onClick={() => setSelectedProduct(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold">
                  Confirm Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-lg spatial-glass p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">{selectedCustomer.name} CRM Notes</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto font-mono">
              {selectedCustomer.notes?.map((n: any) => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                  <p className="text-slate-200 font-sans">{n.note}</p>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>By {n.createdBy}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 font-mono">
              <input
                type="text"
                required
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add note..."
                className="flex-1 px-4 py-2 rounded-full bg-slate-950 border border-white/10 text-white"
              />
              <button type="submit" className="px-4 py-2 rounded-full bg-blue-600 text-white font-sans font-semibold">
                Add
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
