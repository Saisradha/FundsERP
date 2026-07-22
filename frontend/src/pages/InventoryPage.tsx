import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  MapPin, 
  X, 
  Filter
} from 'lucide-react';
import { apiRequest } from '../services/api';

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<any | null>(null);

  const [stockAdjQuantity, setStockAdjQuantity] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Supplier Receiving Shipment');

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
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Product Inventory</h1>
          <p className="text-xs text-slate-400 font-sans mt-1">Warehouse catalog, minimum alert thresholds, and shelf locations.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="apple-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, Name, Shelf Location..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`px-4 py-2 rounded-full text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            lowStockFilter
              ? 'apple-pill-amber'
              : 'bg-slate-950/60 border border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Low Stock Warnings Only</span>
        </button>
      </div>

      {/* Product Data Table */}
      <div className="apple-card rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-white/5">
              <tr>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Shelf Location</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No warehouse products match your search.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
                  const isOut = p.currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-blue-400 font-mono">{p.sku}</td>
                      <td className="p-4 font-semibold text-white text-sm">{p.name}</td>
                      <td className="p-4 text-slate-400 font-mono">{p.category}</td>
                      <td className="p-4 text-emerald-400 font-bold font-mono">${p.unitPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-mono text-[10px] ${
                          isOut ? 'apple-pill-red' :
                          isLow ? 'apple-pill-amber' :
                          'bg-slate-800 text-slate-200'
                        }`}>
                          {p.currentStock} Units
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{p.location}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedProductForStock(p)}
                          className="px-4 py-1.5 rounded-full apple-pill-blue hover:bg-blue-600 hover:text-white font-semibold transition-all cursor-pointer"
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

      {/* Adjust Stock Modal */}
      {selectedProductForStock && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-md apple-glass p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-400 font-mono uppercase">{selectedProductForStock.sku}</span>
                <h3 className="text-base font-bold text-white">Adjust Stock Level</h3>
              </div>
              <button onClick={() => setSelectedProductForStock(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-slate-300 flex justify-between font-mono">
                <span>Current Stock</span>
                <span className="font-bold text-white">{selectedProductForStock.currentStock} Units</span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Movement Type</label>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setStockAdjType('IN')}
                    className={`py-2 rounded-full font-bold transition-all ${
                      stockAdjType === 'IN' ? 'apple-pill-green' : 'bg-slate-950/60 border border-white/10 text-slate-400'
                    }`}
                  >
                    IN (+ Receiving)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjType('OUT')}
                    className={`py-2 rounded-full font-bold transition-all ${
                      stockAdjType === 'OUT' ? 'apple-pill-amber' : 'bg-slate-950/60 border border-white/10 text-slate-400'
                    }`}
                  >
                    OUT (- Dispatch)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Quantity Changed</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjQuantity}
                  onChange={(e) => setStockAdjQuantity(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={stockAdjReason}
                  onChange={(e) => setStockAdjReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForStock(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold">
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-xs font-sans">
          <div className="w-full max-w-lg apple-glass p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="SKU-XXXX-001"
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Category *</label>
                <input
                  type="text"
                  required
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProduct.unitPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Initial Stock *</label>
                <input
                  type="number"
                  required
                  value={newProduct.currentStock}
                  onChange={(e) => setNewProduct({ ...newProduct, currentStock: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Min Alert Stock *</label>
                <input
                  type="number"
                  required
                  value={newProduct.minStockAlert}
                  onChange={(e) => setNewProduct({ ...newProduct, minStockAlert: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-400 text-[11px]">Shelf Location *</label>
                <input
                  type="text"
                  required
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  placeholder="Zone Alpha - Shelf 01"
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white font-mono"
                />
              </div>

              <div className="col-span-2 pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold">
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
