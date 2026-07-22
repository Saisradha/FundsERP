import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Boxes,
  DollarSign
} from 'lucide-react';
import { apiRequest } from '../services/api';

export const SalesChallanPage: React.FC = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [status, setStatus] = useState<'DRAFT' | 'CONFIRMED'>('CONFIRMED');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    try {
      const [cRes, pRes, chRes] = await Promise.all([
        apiRequest('/customers'),
        apiRequest('/products'),
        apiRequest('/challans'),
      ]);
      setCustomers(cRes.data || []);
      setProducts(pRes.data || []);
      setChallans(chRes.data || []);
    } catch (err) {
      console.error('Failed to load sales challan data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Challan items list is empty! Select products first.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest('/challans', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: cart,
          status,
        }),
      });

      setSuccessMessage(`Sales Challan #${res.data.challanNumber} generated successfully!`);
      setCart([]);
      setSelectedCustomerId('');
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Challan creation failed');
    } font-mono finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/challans/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update challan status');
    }
  };

  const calculateTotalAmount = () => {
    return cart.reduce((total, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return total + (p ? p.unitPrice * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">SALES CHALLAN MODULE</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Generate sales challans with automatic order numbering, product snapshots, and negative stock protection.</p>
      </div>

      {/* Main Form & Records Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Challan Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">CREATE SALES CHALLAN</h2>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateChallan} className="space-y-4 font-mono text-xs">
            
            {/* Customer Select */}
            <div className="space-y-1">
              <label className="text-slate-400">SELECT CUSTOMER *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.businessName}) — {c.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selector Catalog */}
            <div className="space-y-2">
              <label className="text-slate-400">ADD PRODUCTS TO ORDER</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {products.map((p) => {
                  const isOut = p.currentStock === 0;

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-white truncate max-w-[130px]">{p.name}</div>
                        <div className="text-[10px] text-slate-400">SKU: {p.sku} | Stock: {p.currentStock}</div>
                        <div className="text-[11px] text-emerald-400">${p.unitPrice.toFixed(2)}</div>
                      </div>

                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => handleAddToCart(p.id)}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-30 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Table */}
            <div className="space-y-2">
              <label className="text-slate-400">CHALLAN ITEMS SNAPSHOT</label>

              {cart.length === 0 ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No products added to this challan order yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => {
                    const p = products.find((prod) => prod.id === item.productId);
                    if (!p) return null;

                    return (
                      <div key={item.productId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-blue-400">${p.unitPrice.toFixed(2)} unit snapshot price</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max={p.currentStock}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10))}
                            className="w-16 p-1.5 rounded bg-slate-900 border border-slate-700 text-center font-bold text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">TOTAL ORDER VALUE</div>
                <div className="text-xl font-black text-emerald-400">${calculateTotalAmount().toFixed(2)}</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('DRAFT')}
                  className={`px-4 py-2 rounded-xl font-bold border ${
                    status === 'DRAFT' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => setStatus('CONFIRMED')}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Challans List */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">SALES CHALLAN RECORDS</h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {challans.map((ch) => (
              <div key={ch.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-blue-400">{ch.challanNumber}</div>
                    <div className="font-semibold text-white font-sans">{ch.customer?.name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ch.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    ch.status === 'DRAFT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {ch.status}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>{ch.totalQuantity} Items</span>
                  <span className="text-emerald-400 font-bold">${ch.totalAmount.toFixed(2)}</span>
                </div>

                {ch.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus(ch.id, 'CONFIRMED')}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded cursor-pointer mt-1"
                  >
                    Confirm & Deduct Stock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
