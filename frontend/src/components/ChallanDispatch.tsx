import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  ShoppingBag, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  FileText, 
  User, 
  DollarSign, 
  Boxes,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '../services/api';

export const ChallanDispatch: React.FC = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [status, setStatus] = useState<'DRAFT' | 'CONFIRMED'>('CONFIRMED');

  const [loading, setLoading] = useState(false);
  const [truckAnimating, setTruckAnimating] = useState(false);
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
      console.error('Failed to load challan data', err);
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
      setErrorMessage('Please select an enterprise customer');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Shipment cart is empty! Add products before dispatching');
      return;
    }

    setLoading(true);

    try {
      if (status === 'CONFIRMED') {
        setTruckAnimating(true);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Truck loading animation duration
      }

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
    } finally {
      setLoading(false);
      setTruckAnimating(false);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Dispatch Truck Loading Header */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Truck className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>DISPATCH & SHIPMENT MANAGEMENT</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">SALES CHALLAN CONTROL</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Build shipments with product snapshots and transactional negative stock protection.</p>
        </div>

        {/* Animated Dispatch Truck Visualizer */}
        <div className="relative w-48 h-20 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
          <AnimatePresence>
            {truckAnimating ? (
              <motion.div
                initial={{ x: -100 }}
                animate={{ x: 150 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="flex items-center gap-2 text-amber-400"
              >
                <Truck className="w-10 h-10" />
                <span className="text-xs font-mono font-bold">LOADING...</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <Truck className="w-8 h-8 text-amber-400" />
                <span>DOCK READY</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Grid: Shipment Builder & Recent Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Shipment Builder Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            CREATE NEW SALES SHIPMENT
          </h3>

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

          <form onSubmit={handleCreateChallan} className="space-y-4">
            
            {/* Customer Selector */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                SELECT CLIENT *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.businessName}) — {c.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                AVAILABLE WAREHOUSE PRODUCTS
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {products.map((p) => {
                  const isLow = p.currentStock <= p.minStockAlert;
                  const isOut = p.currentStock === 0;

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all flex justify-between items-center ${
                        isOut
                          ? 'bg-slate-900/40 border-slate-800 opacity-60'
                          : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[140px]">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</div>
                        <div className="text-[11px] font-mono text-emerald-400">${p.unitPrice.toFixed(2)}</div>
                      </div>

                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => handleAddToCart(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all disabled:opacity-30 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Items Table */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">SELECTED SHIPMENT ITEMS</label>
              
              {cart.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                  No items added to dispatch shipment yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => {
                    const p = products.find((prod) => prod.id === item.productId);
                    if (!p) return null;

                    return (
                      <div key={item.productId} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{p.name}</div>
                          <div className="text-[10px] font-mono text-cyan-400">${p.unitPrice.toFixed(2)} each</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max={p.currentStock}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10))}
                            className="w-16 p-1.5 rounded bg-slate-800 border border-slate-700 text-center font-mono text-xs text-white"
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

            {/* Total Amount & Submit Controls */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-400">ESTIMATED TOTAL DISPATCH VALUE</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ${calculateTotalAmount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('DRAFT')}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold border ${
                    status === 'DRAFT' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  SAVE DRAFT
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => setStatus('CONFIRMED')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>CONFIRM & DISPATCH</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Column: Existing Sales Challan History */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            CHALLAN RECORDS
          </h3>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {challans.map((ch) => (
              <div key={ch.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 font-mono">{ch.challanNumber}</span>
                    <div className="text-xs font-semibold text-white">{ch.customer?.name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    ch.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    ch.status === 'DRAFT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}>
                    {ch.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex justify-between">
                  <span>{ch.totalQuantity} Items</span>
                  <span className="text-emerald-400 font-bold">${ch.totalAmount.toFixed(2)}</span>
                </div>

                {ch.status === 'DRAFT' && (
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(ch.id, 'CONFIRMED')}
                      className="w-full py-1 text-[11px] font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                    >
                      Confirm Stock Deduction
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
