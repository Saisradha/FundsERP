import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Plus, Search, Trash2, MapPin
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { Product3D } from '../store/useWarehouseStore';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { toast } from './ui/Toast';

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
  module, onClose, products, customers, challans, logs, onRefresh,
}) => {
  if (module === 'dashboard') return null;

  // Inventory state
  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Supplier Shipment');
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: 'Power Units', unitPrice: 120,
    currentStock: 50, minStockAlert: 10, location: 'Zone Alpha - Shelf 01',
  });

  // CRM state
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newCustData, setNewCustData] = useState({
    name: '', mobile: '', email: '', businessName: '',
    customerType: 'RETAIL', address: '', status: 'LEAD', initialNote: '',
  });

  // Challan state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);

  // Handlers
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await apiRequest(`/products/${selectedProduct.id}/stock`, {
        method: 'POST', body: JSON.stringify({ quantity: stockAdjQty, type: stockAdjType, reason: stockAdjReason }),
      });
      toast.success(`Stock adjusted by ${stockAdjQty} units`);
      setSelectedProduct(null);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Stock adjustment failed'); }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/products', { method: 'POST', body: JSON.stringify(newProduct) });
      toast.success('Product created');
      setShowAddProduct(false);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;
    try {
      await apiRequest(`/customers/${selectedCustomer.id}/notes`, {
        method: 'POST', body: JSON.stringify({ note: newNote }),
      });
      setNewNote('');
      const updated = await apiRequest(`/customers/${selectedCustomer.id}`);
      setSelectedCustomer(updated.data);
      toast.success('Note added');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/customers', { method: 'POST', body: JSON.stringify(newCustData) });
      toast.success('Customer created');
      setShowAddCustomer(false);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || cart.length === 0) { toast.warning('Select customer and products'); return; }
    try {
      const res = await apiRequest('/challans', {
        method: 'POST', body: JSON.stringify({ customerId: selectedCustomerId, items: cart, status: 'CONFIRMED' }),
      });
      toast.success(`Challan #${res.data.challanNumber} created!`);
      setCart([]); setSelectedCustomerId(''); onRefresh();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const cartTotal = cart.reduce((tot, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    return tot + (p ? p.unitPrice * item.quantity : 0);
  }, 0);

  const moduleTitle: Record<string, string> = {
    inventory: '📦 Warehouse Inventory',
    crm: '🏢 Customer CRM',
    challans: '🚚 Sales Challans',
    logs: '📋 Audit Logs',
    reports: '📈 Reports',
  };

  return (
    <>
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-20 right-4 bottom-4 w-full max-w-lg z-30 rounded-2xl p-5 shadow-2xl overflow-y-auto flex flex-col border backdrop-blur-xl"
        style={{
          background: 'var(--color-glass-bg)',
          borderColor: 'var(--color-glass-border)',
          boxShadow: 'var(--color-glass-shadow)',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <span className="text-[10px] font-mono font-medium" style={{ color: 'var(--color-primary)' }}>MODULE</span>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              {moduleTitle[module] || module}
            </h2>
          </div>
          <div className="flex gap-2">
            {module === 'inventory' && (
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddProduct(true)}>Add</Button>
            )}
            {module === 'crm' && (
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddCustomer(true)}>Add</Button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg cursor-pointer border"
              style={{ background: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* INVENTORY */}
        {module === 'inventory' && (
          <div className="space-y-2.5 flex-1">
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>{products.length} Products</span>
            {products.map((p) => {
              const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
              const isOut = p.currentStock === 0;
              return (
                <div key={p.id} className="p-3.5 rounded-xl border space-y-2 text-xs" style={{
                  background: 'var(--color-card)', borderColor: 'var(--color-border)',
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.name}</div>
                      <div className="text-[10px] font-mono" style={{ color: 'var(--color-primary)' }}>{p.sku}</div>
                    </div>
                    <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>{p.currentStock} Qty</Badge>
                  </div>
                  <div className="flex justify-between font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" style={{ color: 'var(--color-primary)' }} /> {p.location}</span>
                    <span style={{ color: 'var(--color-success)' }}>${p.unitPrice.toFixed(2)}</span>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedProduct(p)}>Adjust Stock</Button>
                </div>
              );
            })}
          </div>
        )}

        {/* CRM */}
        {module === 'crm' && (
          <div className="space-y-2.5 flex-1">
            {customers.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl border space-y-2 text-xs" style={{
                background: 'var(--color-card)', borderColor: 'var(--color-border)',
              }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{c.name}</div>
                    <div className="text-[10px] font-mono" style={{ color: 'var(--color-primary)' }}>{c.businessName}</div>
                  </div>
                  <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'LEAD' ? 'warning' : 'danger'}>{c.status}</Badge>
                </div>
                <div className="font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{c.email}</div>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedCustomer(c)}>
                  Notes ({c.notes?.length || 0})
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* CHALLANS */}
        {module === 'challans' && (
          <form onSubmit={handleCreateChallan} className="space-y-4 flex-1 text-xs">
            <Select placeholder="-- Choose Customer --" value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.businessName})` }))} />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {products.map((p) => (
                <button key={p.id} type="button" disabled={p.currentStock === 0}
                  onClick={() => setCart((prev) => {
                    const ex = prev.find((i) => i.productId === p.id);
                    if (ex) return prev.map((i) => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
                    return [...prev, { productId: p.id, quantity: 1 }];
                  })}
                  className="px-3 py-1.5 rounded-lg text-[10px] shrink-0 disabled:opacity-30 cursor-pointer border font-medium"
                  style={{ background: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                  + {p.name}
                </button>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-3 rounded-xl border space-y-2" style={{ background: 'var(--color-input)', borderColor: 'var(--color-border)' }}>
                {cart.map((item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="flex justify-between items-center" style={{ color: 'var(--color-text)' }}>
                      <span>{p.name}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" min="1" max={p.currentStock} value={item.quantity}
                          onChange={(e) => setCart((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: parseInt(e.target.value, 10) } : i))}
                          className="w-14 p-1 rounded-lg text-center font-bold input-field" />
                        <button type="button" onClick={() => setCart((prev) => prev.filter((i) => i.productId !== item.productId))}
                          className="cursor-pointer" style={{ color: 'var(--color-danger)' }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="input-label">TOTAL</span>
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-success)' }}>${cartTotal.toFixed(2)}</div>
              </div>
              <Button type="submit">Confirm</Button>
            </div>
          </form>
        )}

        {/* LOGS */}
        {module === 'logs' && (
          <div className="space-y-2 flex-1">
            {logs.map((l) => (
              <div key={l.id} className="p-3 rounded-xl border flex justify-between items-center" style={{
                background: 'var(--color-card)', borderColor: 'var(--color-border)',
              }}>
                <div className="flex items-center gap-2.5">
                  <Badge variant={l.type === 'IN' ? 'success' : 'warning'}>{l.type}</Badge>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{l.product?.name}</div>
                    <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{l.reason}</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs" style={{ color: l.type === 'IN' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {l.type === 'IN' ? '+' : '-'}{l.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.aside>

      {/* Modals */}
      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Adjust Stock" subtitle={selectedProduct?.sku} size="sm">
        {selectedProduct && (
          <form onSubmit={handleAdjustStock} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(['IN', 'OUT'] as const).map((type) => (
                <button key={type} type="button" onClick={() => setStockAdjType(type)}
                  className={`py-2 rounded-lg font-semibold text-xs cursor-pointer ${stockAdjType === type ? (type === 'IN' ? 'chip-success' : 'chip-warning') : ''}`}
                  style={stockAdjType !== type ? { background: 'var(--color-input)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' } : {}}>
                  {type === 'IN' ? 'IN (+)' : 'OUT (-)'}
                </button>
              ))}
            </div>
            <Input label="QUANTITY" type="number" min={1} required value={stockAdjQty}
              onChange={(e) => setStockAdjQty(parseInt(e.target.value, 10))} />
            <Input label="REASON" required value={stockAdjReason} onChange={(e) => setStockAdjReason(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setSelectedProduct(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name} subtitle={selectedCustomer?.businessName} size="md">
        {selectedCustomer && (
          <div className="space-y-3">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedCustomer.notes?.map((n: any) => (
                <div key={n.id} className="p-3 rounded-xl border" style={{ background: 'var(--color-input)', borderColor: 'var(--color-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text)' }}>{n.note}</p>
                  <div className="text-[10px] mt-1 flex justify-between font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span>By {n.createdBy}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <Input placeholder="Add note..." required value={newNote} onChange={(e) => setNewNote(e.target.value)} />
              <Button type="submit" size="sm">Add</Button>
            </form>
          </div>
        )}
      </Modal>
    </>
  );
};
