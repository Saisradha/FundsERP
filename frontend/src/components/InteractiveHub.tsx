import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes, Users, Truck, History, Plus, Search,
  AlertTriangle, MapPin, DollarSign, TrendingUp,
  Trash2, X
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { Product3D } from '../store/useWarehouseStore';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { EmptyState, SkeletonCard } from './ui/EmptyState';
import { toast } from './ui/Toast';

interface InteractiveHubProps {
  products: Product3D[];
  customers: any[];
  challans: any[];
  logs: any[];
  loading: boolean;
  onRefresh: () => void;
}

const tabConfig = [
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'crm', label: 'Customers', icon: Users },
  { id: 'challans', label: 'Challans', icon: Truck },
  { id: 'logs', label: 'Audit Logs', icon: History },
] as const;

type TabId = typeof tabConfig[number]['id'];

export const InteractiveHub: React.FC<InteractiveHubProps> = ({
  products, customers, challans, logs, loading, onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('inventory');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Inventory modals
  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Receiving Supplier Goods');
  const [stockLoading, setStockLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: 'Power Units', unitPrice: 150,
    currentStock: 50, minStockAlert: 10, location: 'Zone Alpha - Shelf 01',
  });

  // CRM modals
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
  const [challanLoading, setChallanLoading] = useState(false);

  // Handlers
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setStockLoading(true);
    try {
      await apiRequest(`/products/${selectedProduct.id}/stock`, {
        method: 'POST',
        body: JSON.stringify({ quantity: stockAdjQty, type: stockAdjType, reason: stockAdjReason }),
      });
      toast.success(`Stock ${stockAdjType === 'IN' ? 'increased' : 'decreased'} by ${stockAdjQty} units`);
      setSelectedProduct(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Stock adjustment failed');
    } finally {
      setStockLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/products', { method: 'POST', body: JSON.stringify(newProduct) });
      toast.success(`Product "${newProduct.name}" created successfully`);
      setShowAddProduct(false);
      setNewProduct({ name: '', sku: '', category: 'Power Units', unitPrice: 150, currentStock: 50, minStockAlert: 10, location: 'Zone Alpha - Shelf 01' });
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Product creation failed'); }
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
    } catch (err: any) { toast.error(err.message || 'Failed to add note'); }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/customers', { method: 'POST', body: JSON.stringify(newCustData) });
      toast.success(`Customer "${newCustData.name}" created`);
      setShowAddCustomer(false);
      setNewCustData({ name: '', mobile: '', email: '', businessName: '', customerType: 'RETAIL', address: '', status: 'LEAD', initialNote: '' });
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Customer creation failed'); }
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || cart.length === 0) {
      toast.warning('Select a customer and at least one product.');
      return;
    }
    setChallanLoading(true);
    try {
      const res = await apiRequest('/challans', {
        method: 'POST', body: JSON.stringify({ customerId: selectedCustomerId, items: cart, status: 'CONFIRMED' }),
      });
      toast.success(`Sales Challan #${res.data.challanNumber} generated!`);
      setCart([]); setSelectedCustomerId('');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Challan creation failed'); }
    finally { setChallanLoading(false); }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = `${p.name} ${p.sku} ${p.location}`.toLowerCase().includes(search.toLowerCase());
    const matchesLow = lowStockOnly ? p.currentStock <= p.minStockAlert : true;
    return matchesSearch && matchesLow;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;
  const activeCustCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalRevenue = challans.filter((c) => c.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const cartTotal = cart.reduce((tot, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    return tot + (p ? p.unitPrice * item.quantity : 0);
  }, 0);

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up">
        {[
          { label: 'REVENUE', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            sub: `${challans.filter((c) => c.status === 'CONFIRMED').length} orders`, icon: DollarSign, accent: 'var(--color-success)' },
          { label: 'PRODUCTS', value: `${products.length}`, sub: 'SKUs cataloged', icon: Boxes, accent: 'var(--color-primary)' },
          { label: 'CLIENTS', value: `${activeCustCount} / ${customers.length}`, sub: 'Active accounts', icon: Users, accent: 'var(--color-info)' },
          { label: 'LOW STOCK', value: `${lowStockCount}`, sub: 'Need replenishment', icon: AlertTriangle, accent: 'var(--color-warning)' },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-xl border" style={{
            background: 'var(--color-card)', borderColor: 'var(--color-border)',
          }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {kpi.label}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: `color-mix(in srgb, ${kpi.accent} 12%, transparent)`, color: kpi.accent }}>
                <kpi.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: 'var(--color-text)' }}>{kpi.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: kpi.accent }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Workspace */}
      <div className="rounded-2xl border p-5 animate-slide-up" style={{
        background: 'var(--color-surface)', borderColor: 'var(--color-border)',
      }}>
        {/* Tab Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b"
             style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex gap-1 p-0.5 rounded-xl border" style={{
            background: 'var(--color-input)', borderColor: 'var(--color-border-subtle)',
          }}>
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            {activeTab === 'inventory' && (
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddProduct(true)}>
                Add Product
              </Button>
            )}
            {activeTab === 'crm' && (
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddCustomer(true)}>
                Add Customer
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input placeholder="Search SKU, Name, Shelf..." value={search}
                    onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
                  <button onClick={() => setLowStockOnly(!lowStockOnly)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer border whitespace-nowrap ${
                      lowStockOnly ? 'chip-warning' : ''
                    }`}
                    style={lowStockOnly ? {} : { background: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Only
                  </button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1,2,3].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <EmptyState title="No products found" description="Try adjusting your search or add a new product." icon={<Boxes className="w-6 h-6" />} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map((p) => {
                      const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
                      const isOut = p.currentStock === 0;
                      return (
                        <div key={p.id} className="p-4 rounded-xl border space-y-3 text-xs" style={{
                          background: 'var(--color-card)', borderColor: 'var(--color-border)',
                        }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.name}</div>
                              <div className="text-[10px] font-mono" style={{ color: 'var(--color-primary)' }}>{p.sku}</div>
                            </div>
                            <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                              {p.currentStock} Qty
                            </Badge>
                          </div>
                          <div className="flex justify-between font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" style={{ color: 'var(--color-primary)' }} /> {p.location}</span>
                            <span className="font-semibold" style={{ color: 'var(--color-success)' }}>${p.unitPrice.toFixed(2)}</span>
                          </div>
                          <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedProduct(p)}>
                            Adjust Stock
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CRM */}
            {activeTab === 'crm' && (
              loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1,2,3].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : customers.length === 0 ? (
                <EmptyState title="No customers yet" description="Add your first customer to get started." icon={<Users className="w-6 h-6" />}
                  actionLabel="Add Customer" onAction={() => setShowAddCustomer(true)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customers.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border space-y-3 text-xs" style={{
                      background: 'var(--color-card)', borderColor: 'var(--color-border)',
                    }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{c.name}</div>
                          <div className="text-[10px] font-mono" style={{ color: 'var(--color-primary)' }}>{c.businessName}</div>
                        </div>
                        <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'LEAD' ? 'warning' : 'danger'}>
                          {c.status}
                        </Badge>
                      </div>
                      <div className="font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                        {c.email} • {c.mobile}
                      </div>
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedCustomer(c)}>
                        Notes ({c.notes?.length || 0})
                      </Button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* CHALLANS */}
            {activeTab === 'challans' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleCreateChallan} className="space-y-4">
                  <Select label="SELECT CUSTOMER" placeholder="-- Choose Customer --" value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.businessName})` }))} />

                  <div className="space-y-2">
                    <span className="input-label">ADD PRODUCTS</span>
                    <div className="flex gap-2 max-w-full overflow-x-auto pb-1">
                      {products.map((p) => (
                        <button key={p.id} type="button" disabled={p.currentStock === 0}
                          onClick={() => {
                            setCart((prev) => {
                              const existing = prev.find((i) => i.productId === p.id);
                              if (existing) return prev.map((i) => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
                              return [...prev, { productId: p.id, quantity: 1 }];
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] shrink-0 disabled:opacity-30 cursor-pointer border font-medium"
                          style={{ background: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        >
                          + {p.name} (${p.unitPrice})
                        </button>
                      ))}
                    </div>
                  </div>

                  {cart.length > 0 && (
                    <div className="p-4 rounded-xl border space-y-2" style={{ background: 'var(--color-input)', borderColor: 'var(--color-border)' }}>
                      {cart.map((item) => {
                        const p = products.find((prod) => prod.id === item.productId);
                        if (!p) return null;
                        return (
                          <div key={item.productId} className="flex justify-between items-center" style={{ color: 'var(--color-text)' }}>
                            <span className="font-medium">{p.name}</span>
                            <div className="flex items-center gap-2">
                              <input type="number" min="1" max={p.currentStock} value={item.quantity}
                                onChange={(e) => setCart((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: parseInt(e.target.value, 10) } : i))}
                                className="w-14 p-1 rounded-lg text-center font-bold input-field" />
                              <button type="button" onClick={() => setCart((prev) => prev.filter((i) => i.productId !== item.productId))}
                                className="cursor-pointer" style={{ color: 'var(--color-danger)' }}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="input-label">TOTAL VALUE</span>
                      <div className="text-xl font-bold font-mono" style={{ color: 'var(--color-success)' }}>${cartTotal.toFixed(2)}</div>
                    </div>
                    <Button type="submit" loading={challanLoading}>Confirm & Deduct Stock</Button>
                  </div>
                </form>
              </div>
            )}

            {/* LOGS */}
            {activeTab === 'logs' && (
              loading ? (
                <div className="space-y-2">{[1,2,3,4,5].map((i) => <SkeletonCard key={i} />)}</div>
              ) : logs.length === 0 ? (
                <EmptyState title="No movement logs" description="Stock movements will appear here after inventory adjustments." icon={<History className="w-6 h-6" />} />
              ) : (
                <div className="space-y-2">
                  {logs.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-3.5 rounded-xl border" style={{
                      background: 'var(--color-card)', borderColor: 'var(--color-border)',
                    }}>
                      <div className="flex items-center gap-3">
                        <Badge variant={l.type === 'IN' ? 'success' : 'warning'}>{l.type}</Badge>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{l.product?.name}</div>
                          <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                            {l.reason} • By {l.createdBy}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold" style={{ color: l.type === 'IN' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {l.type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`} Qty
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                          {new Date(l.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODALS */}
      {/* Adjust Stock Modal */}
      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Adjust Stock Level"
             subtitle={selectedProduct?.sku} size="sm">
        {selectedProduct && (
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="p-3 rounded-xl border flex justify-between font-mono text-xs" style={{
              background: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)',
            }}>
              <span>Current Stock</span>
              <span className="font-bold" style={{ color: 'var(--color-text)' }}>{selectedProduct.currentStock} Units</span>
            </div>
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
            <Input label="AUDIT REASON" type="text" required value={stockAdjReason}
              onChange={(e) => setStockAdjReason(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setSelectedProduct(null)}>Cancel</Button>
              <Button type="submit" loading={stockLoading}>Save</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal open={showAddProduct} onClose={() => setShowAddProduct(false)} title="Add New Product" size="md">
        <form onSubmit={handleCreateProduct} className="grid grid-cols-2 gap-3">
          <Input label="PRODUCT NAME" required value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <Input label="SKU CODE" required value={newProduct.sku} placeholder="SKU-XXXX-001"
            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
          <Input label="CATEGORY" required value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
          <Input label="UNIT PRICE ($)" type="number" step="0.01" required value={newProduct.unitPrice}
            onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })} />
          <Input label="INITIAL STOCK" type="number" required value={newProduct.currentStock}
            onChange={(e) => setNewProduct({ ...newProduct, currentStock: parseInt(e.target.value, 10) })} />
          <Input label="MIN ALERT STOCK" type="number" required value={newProduct.minStockAlert}
            onChange={(e) => setNewProduct({ ...newProduct, minStockAlert: parseInt(e.target.value, 10) })} />
          <div className="col-span-2">
            <Input label="SHELF LOCATION" required value={newProduct.location} placeholder="Zone Alpha - Shelf 01"
              onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddProduct(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>

      {/* Customer Notes Modal */}
      <Modal open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name}
             subtitle={selectedCustomer?.businessName} size="md">
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'EMAIL', value: selectedCustomer.email },
                { label: 'MOBILE', value: selectedCustomer.mobile },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-xl border" style={{ background: 'var(--color-input)', borderColor: 'var(--color-border)' }}>
                  <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{f.label}</div>
                  <div className="font-mono font-semibold text-xs truncate" style={{ color: 'var(--color-text)' }}>{f.value}</div>
                </div>
              ))}
            </div>
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

      {/* Add Customer Modal */}
      <Modal open={showAddCustomer} onClose={() => setShowAddCustomer(false)} title="Add New Customer" size="md">
        <form onSubmit={handleCreateCustomer} className="grid grid-cols-2 gap-3">
          <Input label="NAME" required value={newCustData.name}
            onChange={(e) => setNewCustData({ ...newCustData, name: e.target.value })} />
          <Input label="BUSINESS NAME" required value={newCustData.businessName}
            onChange={(e) => setNewCustData({ ...newCustData, businessName: e.target.value })} />
          <Input label="MOBILE" required value={newCustData.mobile}
            onChange={(e) => setNewCustData({ ...newCustData, mobile: e.target.value })} />
          <Input label="EMAIL" type="email" required value={newCustData.email}
            onChange={(e) => setNewCustData({ ...newCustData, email: e.target.value })} />
          <Select label="TYPE" value={newCustData.customerType}
            onChange={(e) => setNewCustData({ ...newCustData, customerType: e.target.value })}
            options={[{ value: 'RETAIL', label: 'Retail' }, { value: 'WHOLESALE', label: 'Wholesale' }, { value: 'DISTRIBUTOR', label: 'Distributor' }]} />
          <Select label="STATUS" value={newCustData.status}
            onChange={(e) => setNewCustData({ ...newCustData, status: e.target.value })}
            options={[{ value: 'LEAD', label: 'Lead' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
          <div className="col-span-2">
            <Input label="ADDRESS" required value={newCustData.address}
              onChange={(e) => setNewCustData({ ...newCustData, address: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Input label="INITIAL NOTE" value={newCustData.initialNote}
              onChange={(e) => setNewCustData({ ...newCustData, initialNote: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
            <Button type="submit">Create Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
