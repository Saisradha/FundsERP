import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  SlidersHorizontal, 
  Edit, 
  ArrowUpDown, 
  MapPin, 
  DollarSign, 
  Boxes,
  X
} from 'lucide-react';
import { apiRequest } from '../services/api';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<any | null>(null);

  const [stockAdjQuantity, setStockAdjQuantity] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Manual Stock Replenishment');

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Power Units',
    unitPrice: 100,
    currentStock: 50,
    minStockAlert: 10,
    location: 'Zone Alpha - Shelf 01',
  });

  const fetchProducts = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (lowStockFilter) query.append('lowStock', 'true');

      const res = await apiRequest(`/products?${query.toString()}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, lowStockFilter]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
      setShowAddModal(false);
      setNewProduct({
        name: '',
        sku: '',
        category: 'Power Units',
        unitPrice: 100,
        currentStock: 50,
        minStockAlert: 10,
        location: 'Zone Alpha - Shelf 01',
      });
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;

    try {
      await apiRequest(`/products/${selectedProductForStock.id}/stock`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: stockAdjQuantity,
          type: stockAdjType,
          reason: stockAdjReason,
        }),
      });
      setSelectedProductForStock(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Package className="w-4 h-4 text-cyan-400" />
            <span>WAREHOUSE CATALOG & PHYSICAL STOCK</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">PRODUCT INVENTORY MANAGER</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Manage product SKUs, shelf locations, and execute audit adjustments.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW SKU</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, Name, Location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              lowStockFilter
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>LOW STOCK WARNINGS ONLY</span>
          </button>
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">3D Location</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No warehouse products match search criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
                  const isOut = p.currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-bold text-cyan-400">{p.sku}</td>
                      <td className="p-4 text-white font-sans font-semibold">{p.name}</td>
                      <td className="p-4 text-slate-400">{p.category}</td>
                      <td className="p-4 text-emerald-400 font-bold">${p.unitPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md font-bold ${
                          isOut ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse' :
                          isLow ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' :
                          'bg-slate-800 text-slate-200'
                        }`}>
                          {p.currentStock} Units
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{p.location}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedProductForStock(p)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600 hover:text-white font-bold transition-all cursor-pointer"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {selectedProductForStock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border-cyan-500/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase">{selectedProductForStock.sku}</span>
                <h3 className="text-base font-bold text-white">ADJUST STOCK TELEMETRY</h3>
              </div>
              <button onClick={() => setSelectedProductForStock(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex justify-between">
                <span>Current Stock Level</span>
                <span className="font-bold text-white">{selectedProductForStock.currentStock} Units</span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Movement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjType('IN')}
                    className={`py-2 rounded-lg font-bold border ${
                      stockAdjType === 'IN' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    IN (+ Receiving)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjType('OUT')}
                    className={`py-2 rounded-lg font-bold border ${
                      stockAdjType === 'OUT' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    OUT (- Dispatch)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Quantity Changed</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjQuantity}
                  onChange={(e) => setStockAdjQuantity(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={stockAdjReason}
                  onChange={(e) => setStockAdjReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForStock(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Product SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border-cyan-500/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">REGISTER NEW PRODUCT SKU</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="SKU-XXXX-001"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Category *</label>
                <input
                  type="text"
                  required
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProduct.unitPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Initial Stock *</label>
                <input
                  type="number"
                  required
                  value={newProduct.currentStock}
                  onChange={(e) => setNewProduct({ ...newProduct, currentStock: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Min Alert Stock *</label>
                <input
                  type="number"
                  required
                  value={newProduct.minStockAlert}
                  onChange={(e) => setNewProduct({ ...newProduct, minStockAlert: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-400">3D Shelf Location *</label>
                <input
                  type="text"
                  required
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  placeholder="Zone Alpha - Shelf 01"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
