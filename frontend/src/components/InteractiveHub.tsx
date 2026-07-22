import React, { useState } from 'react';
import { 
  Boxes, 
  Users, 
  Truck, 
  History, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  X, 
  MapPin, 
  MessageSquare, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { Product3D } from '../store/useWarehouseStore';

interface InteractiveHubProps {
  products: Product3D[];
  customers: any[];
  challans: any[];
  logs: any[];
  onRefresh: () => void;
}

export const InteractiveHub: React.FC<InteractiveHubProps> = ({
  products,
  customers,
  challans,
  logs,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'crm' | 'challans' | 'logs'>('inventory');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Receiving Supplier Goods');
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Power Units',
    unitPrice: 150,
    currentStock: 50,
    minStockAlert: 10,
    location: 'Zone Alpha - Shelf 01',
  });

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

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);
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
      alert(err.message || 'Product creation failed');
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
      setErrorMessage('Please select a customer and products.');
      return;
    }

    try {
      const res = await apiRequest('/challans', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: cart,
          status: 'CONFIRMED',
        }),
      });

      setSuccessMessage(`Sales Challan #${res.data.challanNumber} generated!`);
      setCart([]);
      setSelectedCustomerId('');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Challan dispatch failed');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = `${p.name} ${p.sku} ${p.location}`.toLowerCase().includes(search.toLowerCase());
    const matchesLow = lowStockOnly ? p.currentStock <= p.minStockAlert : true;
    return matchesSearch && matchesLow;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;
  const activeCustCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalRevenue = challans.filter((c) => c.status === 'CONFIRMED').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  return (
    <div className="pt-24 px-8 pb-12 max-w-7xl mx-auto space-y-6 font-sans relative z-10">
      
      {/* Telemetry KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono opacity-70">
            <span>DISPATCH REVENUE</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-emerald-500 flex items-center gap-1 font-sans">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{challans.filter((c) => c.status === 'CONFIRMED').length} Orders Confirmed</span>
          </div>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono opacity-70">
            <span>WAREHOUSE SKUS</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono">{products.length} ITEMS</div>
          <div className="text-[11px] opacity-70">Cataloged in database</div>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono opacity-70">
            <span>ACTIVE CRM CLIENTS</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono">{activeCustCount} / {customers.length}</div>
          <div className="text-[11px] text-sky-500">Active accounts</div>
        </div>

        <div className="glass-card p-5 space-y-2 border-amber-500/40">
          <div className="flex justify-between items-center text-amber-500 text-xs font-mono">
            <span>LOW STOCK WARNINGS</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500 font-mono">{lowStockCount} SKUS</div>
          <div className="text-[11px] text-amber-500">Requires replenishment</div>
        </div>

      </div>

      {/* Main Operations Interactive Workspace */}
      <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-2xl">
        
        {/* Module Segment Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-500/20 pb-4">
          <div className="flex gap-2">
            {[
              { id: 'inventory', label: '📦 Product Inventory', icon: Boxes },
              { id: 'crm', label: '👥 Customer CRM', icon: Users },
              { id: 'challans', label: '🚚 Sales Challans', icon: Truck },
              { id: 'logs', label: '📜 Movement Logs', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-500/10 opacity-70 hover:opacity-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'inventory' && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            {activeTab === 'crm' && (
              <button
                onClick={() => setShowAddCustomer(true)}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Inventory Feature Table */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search SKU, Name, Shelf..."
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-500/10 border border-slate-500/20 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  lowStockOnly ? 'chip-warning' : 'bg-slate-500/10 opacity-70 hover:opacity-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Low Stock Only</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
                const isOut = p.currentStock === 0;

                return (
                  <div key={p.id} className="glass-card p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-[10px] font-mono text-blue-500">{p.sku}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                        isOut ? 'chip-danger' : isLow ? 'chip-warning' : 'chip-success'
                      }`}>
                        {p.currentStock} Units
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] font-mono opacity-70">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" /> {p.location}</span>
                      <span className="text-emerald-500 font-bold">${p.unitPrice.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="w-full py-1.5 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/30 hover:bg-blue-600 hover:text-white font-semibold transition-all cursor-pointer"
                    >
                      Adjust Stock Level
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Customer CRM Feature View */}
        {activeTab === 'crm' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div key={c.id} className="glass-card p-4 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm">{c.name}</div>
                    <div className="text-[10px] font-mono text-blue-500">{c.businessName}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                    c.status === 'ACTIVE' ? 'chip-success' : c.status === 'LEAD' ? 'chip-warning' : 'chip-danger'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono opacity-70">{c.email} • {c.mobile}</div>

                <button
                  onClick={() => setSelectedCustomer(c)}
                  className="w-full py-1.5 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/30 hover:bg-blue-600 hover:text-white font-semibold transition-all cursor-pointer"
                >
                  View Follow-up Notes ({c.notes?.length || 0})
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. Sales Challans Feature Builder */}
        {activeTab === 'challans' && (
          <div className="space-y-4 text-xs font-sans">
            {errorMessage && <div className="p-3 rounded-2xl chip-danger font-mono">{errorMessage}</div>}
            {successMessage && <div className="p-3 rounded-2xl chip-success font-mono">{successMessage}</div>}

            <form onSubmit={handleCreateChallan} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono opacity-70">SELECT CUSTOMER *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 font-mono"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono opacity-70">ADD PRODUCTS TO ORDER</label>
                <div className="flex gap-2 max-w-full overflow-x-auto pb-1 mt-1">
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
                      className="px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 hover:border-blue-500 text-[10px] shrink-0 disabled:opacity-30 cursor-pointer font-mono"
                    >
                      + {p.name} (${p.unitPrice})
                    </button>
                  ))}
                </div>
              </div>

              {cart.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 space-y-2 font-mono">
                  {cart.map((item) => {
                    const p = products.find((prod) => prod.id === item.productId);
                    if (!p) return null;
                    return (
                      <div key={item.productId} className="flex justify-between items-center">
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
                            className="w-14 p-1 rounded-full bg-slate-500/10 text-center font-bold"
                          />
                          <button type="button" onClick={() => setCart((prev) => prev.filter((i) => i.productId !== item.productId))}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-[10px] font-mono opacity-70">TOTAL DISPATCH VALUE</span>
                  <div className="text-xl font-extrabold text-emerald-500 font-mono">${cart.reduce((tot, item) => {
                    const p = products.find((prod) => prod.id === item.productId);
                    return tot + (p ? p.unitPrice * item.quantity : 0);
                  }, 0).toFixed(2)}</div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Movement Logs View */}
        {activeTab === 'logs' && (
          <div className="space-y-3 font-mono text-xs">
            {logs.map((l) => (
              <div key={l.id} className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    l.type === 'IN' ? 'chip-success' : 'chip-warning'
                  }`}>
                    {l.type}
                  </span>
                  <div>
                    <div className="font-bold text-sm font-sans">{l.product?.name}</div>
                    <div className="text-[10px] opacity-70">{l.reason} • By {l.createdBy}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${l.type === 'IN' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {l.type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`} Units
                  </div>
                  <div className="text-[10px] opacity-50">{new Date(l.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modals for Adjust Stock / Add Customer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Adjust Stock: {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="opacity-70 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjType('IN')}
                  className={`py-2 rounded-full font-bold ${stockAdjType === 'IN' ? 'chip-success' : 'bg-slate-500/10'}`}
                >
                  IN (+ Receiving)
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjType('OUT')}
                  className={`py-2 rounded-full font-bold ${stockAdjType === 'OUT' ? 'chip-warning' : 'bg-slate-500/10'}`}
                >
                  OUT (- Dispatch)
                </button>
              </div>

              <div>
                <label className="text-[10px] opacity-70">QUANTITY CHANGED</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjQty}
                  onChange={(e) => setStockAdjQty(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-2xl bg-slate-500/10 border border-slate-500/20 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] opacity-70">AUDIT REASON</label>
                <input
                  type="text"
                  required
                  value={stockAdjReason}
                  onChange={(e) => setStockAdjReason(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-500/10 border border-slate-500/20 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 font-sans">
                <button type="button" onClick={() => setSelectedProduct(null)} className="px-4 py-2 bg-slate-500/20 rounded-full font-semibold">
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">{selectedCustomer.name} CRM Notes</h3>
              <button onClick={() => setSelectedCustomer(null)} className="opacity-70 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto font-mono">
              {selectedCustomer.notes?.map((n: any) => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20">
                  <p className="font-sans">{n.note}</p>
                  <div className="text-[10px] opacity-50 mt-1 flex justify-between">
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
                className="flex-1 px-4 py-2 rounded-full bg-slate-500/10 border border-slate-500/20"
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
