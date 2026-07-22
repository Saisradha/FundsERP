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
  MapPin
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { Product3D } from '../store/useWarehouseStore';

interface RightGlassPanelProps {
  module: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onClose: () => void;
  products: Product3D[];
  customers: any[];
  challans: any[];
  logs: any[];
  onRefresh: () => void;
}

export const RightGlassPanel: React.FC<RightGlassPanelProps> = ({
  module,
  onClose,
  products,
  customers,
  challans,
  logs,
  onRefresh,
}) => {
  if (module === 'dashboard') return null;

  // Inventory State
  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Supplier Shipment Arrival');
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Power Units',
    unitPrice: 120,
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
      alert(err.message || 'Failed to create product');
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
      alert(err.message || 'Failed to create customer');
    }
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedCustomerId || cart.length === 0) {
      setErrorMessage('Select a customer and at least one product SKU.');
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

      setSuccessMessage(`Sales Challan #${res.data.challanNumber} generated!`);
      setCart([]);
      setSelectedCustomerId('');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Challan generation failed');
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return total + (p ? p.unitPrice * item.quantity : 0);
    }, 0);
  };

  return (
    <aside className="fixed top-24 right-6 bottom-6 w-full max-w-xl z-30 glass-panel rounded-3xl p-6 shadow-2xl overflow-y-auto flex flex-col font-sans border border-white/20">
      
      {/* Panel Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">BUILDING MODULE</span>
          <h2 className="text-xl font-extrabold text-white capitalize">
            {module === 'inventory' && '📦 Warehouse Inventory Racks'}
            {module === 'crm' && '🏢 CRM Office Accounts'}
            {module === 'challans' && '🚚 Dispatch Loading Dock'}
            {module === 'logs' && '📋 Audit & Stock Movement Logs'}
            {module === 'reports' && '📈 Operations Spire Analytics'}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 1. Inventory View */}
      {module === 'inventory' && (
        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 font-mono">{products.length} Products Logged</span>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register SKU</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {products.map((p) => {
              const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
              const isOut = p.currentStock === 0;

              return (
                <div key={p.id} className="glass-card p-4 space-y-2 text-xs border border-white/10 bg-slate-900/90">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[10px] font-mono text-blue-400 font-bold">{p.sku}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                      isOut ? 'chip-danger' : isLow ? 'chip-warning' : 'chip-success'
                    }`}>
                      {p.currentStock} Qty
                    </span>
                  </div>

                  <div className="text-slate-300 font-mono flex justify-between">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-400" /> {p.location}</span>
                    <span className="text-emerald-400 font-bold">${p.unitPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="w-full py-2 rounded-full bg-white/10 hover:bg-blue-600/30 text-white font-bold transition-all cursor-pointer border border-white/10"
                  >
                    Adjust Stock Level
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CRM View */}
      {module === 'crm' && (
        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 font-mono">{customers.length} Client Accounts</span>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.map((c) => (
              <div key={c.id} className="glass-card p-4 space-y-2 text-xs border border-white/10 bg-slate-900/90">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    <div className="text-[10px] font-mono text-blue-400 font-bold">{c.businessName}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                    c.status === 'ACTIVE' ? 'chip-success' : c.status === 'LEAD' ? 'chip-warning' : 'chip-danger'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="text-slate-300 font-mono text-[11px]">{c.email} • {c.mobile}</div>

                <button
                  onClick={() => setSelectedCustomer(c)}
                  className="w-full py-2 rounded-full bg-white/10 hover:bg-blue-600/30 text-white font-bold transition-all cursor-pointer border border-white/10"
                >
                  Inspect Follow-up Notes ({c.notes?.length || 0})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Dispatch Dock Sales Challan View */}
      {module === 'challans' && (
        <div className="space-y-4 flex-1 font-sans text-xs">
          {errorMessage && <div className="p-3 rounded-2xl chip-danger font-mono">{errorMessage}</div>}
          {successMessage && <div className="p-3 rounded-2xl chip-success font-mono">{successMessage}</div>}

          <form onSubmit={handleCreateChallan} className="space-y-3 font-mono">
            <div>
              <label className="text-slate-300 text-[10px]">SELECT CUSTOMER *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-white/15 text-white font-sans"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 text-[10px]">ADD PRODUCTS TO DISPATCH</label>
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
                    className="px-3 py-1.5 rounded-full bg-slate-800 border border-white/15 text-white hover:border-blue-500 text-[10px] shrink-0 disabled:opacity-30 cursor-pointer font-sans"
                  >
                    + {p.name} (${p.unitPrice})
                  </button>
                ))}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-white/15 space-y-2">
                {cart.map((item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="flex justify-between items-center text-white font-sans">
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
                          className="w-14 p-1 rounded-full bg-slate-950 border border-white/20 text-center text-white font-bold"
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
                <span className="text-[10px] text-slate-400 font-sans">ORDER VALUE</span>
                <div className="text-xl font-extrabold text-emerald-400">${calculateCartTotal().toFixed(2)}</div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold cursor-pointer shadow-md shadow-blue-500/30"
              >
                Confirm & Deduct Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Stock Movement Audit Logs View */}
      {module === 'logs' && (
        <div className="space-y-3 flex-1 font-mono text-xs">
          {logs.map((l) => (
            <div key={l.id} className="glass-card p-3.5 space-y-1 bg-slate-900/90 border border-white/10">
              <div className="flex justify-between items-center">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  l.type === 'IN' ? 'chip-success' : 'chip-warning'
                }`}>
                  {l.type}
                </span>
                <span className="text-slate-400 text-[10px]">{new Date(l.createdAt).toLocaleTimeString()}</span>
              </div>

              <div className="font-bold text-white font-sans text-sm">{l.product?.name}</div>
              <div className="text-slate-300 text-[11px] font-sans">{l.reason} • By {l.createdBy}</div>
              <div className={`font-bold ${l.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {l.type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`} Units
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals for Adjust Stock / Add Customer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl space-y-4 border border-white/20 bg-slate-900">
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
                  className={`py-2 rounded-full font-bold ${stockAdjType === 'IN' ? 'chip-success' : 'bg-slate-800 text-slate-300'}`}
                >
                  IN (+ Receiving)
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjType('OUT')}
                  className={`py-2 rounded-full font-bold ${stockAdjType === 'OUT' ? 'chip-warning' : 'bg-slate-800 text-slate-300'}`}
                >
                  OUT (- Dispatch)
                </button>
              </div>

              <div>
                <label className="text-slate-300 text-[10px]">QUANTITY CHANGED</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjQty}
                  onChange={(e) => setStockAdjQty(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-2xl bg-slate-950 border border-white/20 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 text-[10px]">AUDIT REASON</label>
                <input
                  type="text"
                  required
                  value={stockAdjReason}
                  onChange={(e) => setStockAdjReason(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950 border border-white/20 text-white font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 font-sans">
                <button type="button" onClick={() => setSelectedProduct(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold">
                  Save Stock Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl space-y-4 border border-white/20 bg-slate-900">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">{selectedCustomer.name} CRM Notes</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto font-mono">
              {selectedCustomer.notes?.map((n: any) => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-950 border border-white/10">
                  <p className="text-slate-200 font-sans">{n.note}</p>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
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
                className="flex-1 px-4 py-2 rounded-full bg-slate-950 border border-white/20 text-white"
              />
              <button type="submit" className="px-4 py-2 rounded-full bg-blue-600 text-white font-sans font-semibold">
                Add
              </button>
            </form>
          </div>
        </div>
      )}

    </aside>
  );
};
