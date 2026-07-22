import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes, Users, Truck, History, Plus, Search,
  AlertTriangle, MapPin, DollarSign, TrendingUp,
  Trash2, Download, Printer, CheckCircle2, LayoutDashboard, BarChart3, Filter, Cpu, Terminal, Activity, Zap
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { Product3D } from '../store/useWarehouseStore';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { EmptyState, SkeletonCard } from './ui/EmptyState';
import { toast } from './ui/Toast';
import { ChallanReceiptModal } from './ChallanReceiptModal';

interface InteractiveHubProps {
  products: Product3D[];
  customers: any[];
  challans: any[];
  logs: any[];
  loading: boolean;
  onRefresh: () => void;
}

const tabConfig = [
  { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory (SKUs)', icon: Boxes },
  { id: 'crm', label: 'CRM Accounts', icon: Users },
  { id: 'challans', label: 'Sales Dispatch', icon: Truck },
  { id: 'logs', label: 'Audit Telemetry', icon: History },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
] as const;

type TabId = typeof tabConfig[number]['id'];

export const InteractiveHub: React.FC<InteractiveHubProps> = ({
  products, customers, challans, logs, loading, onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product3D | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product3D | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<'IN' | 'OUT'>('IN');
  const [stockAdjReason, setStockAdjReason] = useState('Receiving Supplier Goods');
  const [stockLoading, setStockLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: 'Power Units', unitPrice: 150,
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
  const [challanLoading, setChallanLoading] = useState(false);
  const [selectedChallanReceipt, setSelectedChallanReceipt] = useState<any>(null);

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Stock adjustment handler
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

  // Product creation handler
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

  // Product deletion handler
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/products/${productToDelete.id}`, { method: 'DELETE' });
      toast.success(`Product "${productToDelete.name}" deleted`);
      setProductToDelete(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  // CRM Note handler
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
      toast.success('Note recorded');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Failed to add note'); }
  };

  // Customer creation handler
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

  // Sales Challan creation handler
  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || cart.length === 0) {
      toast.warning('Select a customer account and at least one item.');
      return;
    }
    setChallanLoading(true);
    try {
      const res = await apiRequest('/challans', {
        method: 'POST', body: JSON.stringify({ customerId: selectedCustomerId, items: cart, status: 'CONFIRMED' }),
      });
      toast.success(`Sales Challan #${res.data.challanNumber} generated!`);
      setSelectedChallanReceipt(res.data);
      setCart([]); setSelectedCustomerId('');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Challan generation failed'); }
    finally { setChallanLoading(false); }
  };

  // CSV Exporter
  const exportProductsCSV = () => {
    const headers = ['ID,Name,SKU,Category,UnitPrice,CurrentStock,MinStockAlert,Location'];
    const rows = products.map((p) => `"${p.id}","${p.name}","${p.sku}","${p.category}",${p.unitPrice},${p.currentStock},${p.minStockAlert},"${p.location}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ERPFlow_Products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory CSV exported');
  };

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch = `${p.name} ${p.sku} ${p.location} ${p.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesLow = lowStockOnly ? p.currentStock <= p.minStockAlert : true;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesLow && matchesCategory;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;
  const activeCustCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalRevenue = challans.filter((c) => c.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0);
  const cartTotal = cart.reduce((tot, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    return tot + (p ? p.unitPrice * item.quantity : 0);
  }, 0);

  return (
    <div className="pt-24 px-6 sm:px-8 lg:px-10 pb-16 w-full space-y-6">

      {/* Top Cyber Telemetry KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        {[
          { label: 'GROSS REVENUE', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            sub: `${challans.length} orders logged`, icon: DollarSign, accent: 'var(--color-success)' },
          { label: 'CATALOG VALUATION', value: `$${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            sub: `${products.length} cataloged SKUs`, icon: Boxes, accent: 'var(--color-primary)' },
          { label: 'ACTIVE ACCOUNTS', value: `${activeCustCount} / ${customers.length}`,
            sub: 'Operational accounts', icon: Users, accent: 'var(--color-info)' },
          { label: 'STOCK REPLENISHMENT', value: `${lowStockCount}`,
            sub: 'Urgent alerts active', icon: AlertTriangle, accent: 'var(--color-warning)' },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-2xl border transition-all cyber-card" style={{
            backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
          }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                {kpi.label}
              </span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border"
                   style={{
                     backgroundColor: `color-mix(in srgb, ${kpi.accent} 15%, transparent)`,
                     borderColor: `color-mix(in srgb, ${kpi.accent} 30%, transparent)`,
                     color: kpi.accent,
                     boxShadow: `0 0 12px ${kpi.accent}`
                   }}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: 'var(--color-text)' }}>{kpi.value}</div>
            <div className="text-[11px] mt-1 font-mono flex items-center gap-1" style={{ color: kpi.accent }}>
              <Zap className="w-3 h-3" /> {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main High-Tech Workspace Deck */}
      <div className="rounded-3xl border p-6 cyber-glass-panel animate-slide-up space-y-6">
        {/* Module Tab Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b"
             style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl border" style={{
            backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)',
          }}>
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold cursor-pointer transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    boxShadow: isActive ? '0 0 16px var(--color-primary-glow)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'inventory' && (
              <>
                <Button size="sm" variant="secondary" icon={<Download className="w-3.5 h-3.5" />} onClick={exportProductsCSV}>
                  Export CSV
                </Button>
                <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddProduct(true)}>
                  New SKU
                </Button>
              </>
            )}
            {activeTab === 'crm' && (
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddCustomer(true)}>
                New Account
              </Button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. EXECUTIVE OVERVIEW HUD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Low Stock Warning Alert Stream */}
                {lowStockCount > 0 && (
                  <div className="p-4.5 rounded-2xl border flex items-center justify-between" style={{
                    backgroundColor: 'var(--color-warning-light)',
                    borderColor: 'var(--color-warning-border)',
                    color: 'var(--color-warning-text)',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
                  }}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="font-bold text-xs font-mono">CRITICAL REPLENISHMENT BEACON ACTIVE</div>
                        <div className="text-[11px] font-mono opacity-90">
                          {lowStockCount} SKU(s) below minimum alert threshold. Urgent inventory replenishment advised.
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => { setActiveTab('inventory'); setLowStockOnly(true); }}>
                      Inspect Urgencies
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Stock Distribution Table */}
                  <div className="lg:col-span-2 p-5 rounded-2xl border space-y-4 cyber-card" style={{
                    backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
                  }}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-mono uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Telemetry Catalog Overview
                      </h3>
                      <Badge variant="info">{products.length} SKUs Cataloged</Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th className="text-right">Stock</th>
                            <th className="text-right">Unit Price</th>
                            <th className="text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.slice(0, 6).map((p) => {
                            const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
                            const isOut = p.currentStock === 0;
                            return (
                              <tr key={p.id}>
                                <td className="font-semibold" style={{ color: 'var(--color-text)' }}>{p.name}</td>
                                <td className="font-mono text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{p.sku}</td>
                                <td style={{ color: 'var(--color-text-secondary)' }}>{p.category}</td>
                                <td className="text-right font-mono font-bold" style={{ color: 'var(--color-text)' }}>{p.currentStock}</td>
                                <td className="text-right font-mono" style={{ color: 'var(--color-success)' }}>${p.unitPrice.toFixed(2)}</td>
                                <td className="text-right">
                                  <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                                    {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Operational Telemetry Feed */}
                  <div className="p-5 rounded-2xl border space-y-4 cyber-card" style={{
                    backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
                  }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Recent Audit Movements
                      </h3>
                      <Activity className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {logs.slice(0, 6).map((l) => (
                        <div key={l.id} className="p-3 rounded-xl border text-xs space-y-1" style={{
                          backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)',
                        }}>
                          <div className="flex justify-between items-center font-medium">
                            <span style={{ color: 'var(--color-text)' }}>{l.product?.name || 'Stock Item'}</span>
                            <Badge variant={l.type === 'IN' ? 'success' : 'warning'}>
                              {l.type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`}
                            </Badge>
                          </div>
                          <div className="text-[10px] font-mono flex justify-between" style={{ color: 'var(--color-text-tertiary)' }}>
                            <span>{l.reason}</span>
                            <span>{new Date(l.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. INVENTORY MANAGEMENT (SKUs) */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <Input placeholder="Search by SKU, product name, shelf location..." value={search}
                    onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />

                  <div className="flex gap-2">
                    <Select options={categories.map((c) => ({ value: c, label: c === 'ALL' ? 'All Categories' : c }))}
                      value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} />

                    <button onClick={() => setLowStockOnly(!lowStockOnly)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium cursor-pointer border whitespace-nowrap transition-all ${
                        lowStockOnly ? 'chip-warning' : ''
                      }`}
                      style={lowStockOnly ? {} : { backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Only
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <EmptyState title="No catalog products match filter" description="Try clearing your search or category filter." icon={<Boxes className="w-6 h-6" />} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map((p) => {
                      const isLow = p.currentStock <= p.minStockAlert && p.currentStock > 0;
                      const isOut = p.currentStock === 0;
                      return (
                        <div key={p.id} className="p-4.5 rounded-2xl border space-y-3 text-xs cyber-card" style={{
                          backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
                        }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.name}</div>
                              <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-primary)' }}>{p.sku}</div>
                            </div>
                            <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                              {p.currentStock} Units
                            </Badge>
                          </div>

                          <div className="flex justify-between font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" style={{ color: 'var(--color-primary)' }} /> {p.location}</span>
                            <span className="font-bold" style={{ color: 'var(--color-success)' }}>${p.unitPrice.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setSelectedProduct(p)}>
                              Adjust Stock
                            </Button>
                            <Button variant="ghost" size="sm" className="px-2" onClick={() => setProductToDelete(p)} title="Delete SKU">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. CRM ACCOUNTS */}
            {activeTab === 'crm' && (
              loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : customers.length === 0 ? (
                <EmptyState title="No customer accounts logged" description="Add your first customer account to initiate sales dispatches." icon={<Users className="w-6 h-6" />}
                  actionLabel="Create Customer Account" onAction={() => setShowAddCustomer(true)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customers.map((c) => (
                    <div key={c.id} className="p-4.5 rounded-2xl border space-y-3 text-xs cyber-card" style={{
                      backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
                    }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{c.name}</div>
                          <div className="text-[11px] font-semibold font-mono" style={{ color: 'var(--color-primary)' }}>{c.businessName}</div>
                        </div>
                        <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'LEAD' ? 'warning' : 'danger'}>
                          {c.status}
                        </Badge>
                      </div>
                      <div className="font-mono text-[11px] space-y-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        <div>Email: {c.email}</div>
                        <div>Phone: {c.mobile}</div>
                      </div>
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedCustomer(c)}>
                        Account Dossier ({c.notes?.length || 0} Notes)
                      </Button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 4. SALES DISPATCH & CHALLANS */}
            {activeTab === 'challans' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                {/* Form dispatch builder */}
                <div className="lg:col-span-2 space-y-4">
                  <form onSubmit={handleCreateChallan} className="space-y-4 p-5 rounded-2xl border cyber-card" style={{
                    backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
                  }}>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                      Delivery Challan Dispatch Terminal
                    </h3>

                    <Select label="SELECT CLIENT ACCOUNT" placeholder="-- Choose Customer Account --" value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.businessName} (${c.customerType})` }))} />

                    <div className="space-y-2">
                      <span className="input-label">ADD CATALOG ITEMS TO DISPATCH CART</span>
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
                            className="px-3 py-1.5 rounded-xl text-[11px] shrink-0 disabled:opacity-30 cursor-pointer border font-mono font-medium transition-all"
                            style={{ backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                          >
                            + {p.name} (${p.unitPrice})
                          </button>
                        ))}
                      </div>
                    </div>

                    {cart.length > 0 && (
                      <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)' }}>
                        <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
                          SELECTED DISPATCH LINE ITEMS
                        </span>
                        {cart.map((item) => {
                          const p = products.find((prod) => prod.id === item.productId);
                          if (!p) return null;
                          return (
                            <div key={item.productId} className="flex justify-between items-center text-xs" style={{ color: 'var(--color-text)' }}>
                              <span className="font-semibold">{p.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                                  Stock: {p.currentStock}
                                </span>
                                <input type="number" min="1" max={p.currentStock} value={item.quantity}
                                  onChange={(e) => setCart((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) } : i))}
                                  className="w-16 p-1 rounded-lg text-center font-bold font-mono input-field" />
                                <button type="button" onClick={() => setCart((prev) => prev.filter((i) => i.productId !== item.productId))}
                                  className="cursor-pointer p-1 text-rose-500">
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
                        <span className="input-label">TOTAL DISPATCH VALUE</span>
                        <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-success)' }}>${cartTotal.toFixed(2)}</div>
                      </div>
                      <Button type="submit" loading={challanLoading}>Generate Delivery Challan</Button>
                    </div>
                  </form>
                </div>

                {/* History list */}
                <div className="p-5 rounded-2xl border space-y-4 cyber-card" style={{
                  backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
                }}>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Generated Challans
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {challans.map((ch) => (
                      <div key={ch.id} className="p-3.5 rounded-xl border text-xs space-y-2" style={{
                        backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)',
                      }}>
                        <div className="flex justify-between items-center font-mono">
                          <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{ch.challanNumber}</span>
                          <Badge variant="success">{ch.status}</Badge>
                        </div>
                        <div className="flex justify-between font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                          <span>{ch.customer?.name || 'Customer'}</span>
                          <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                            ${ch.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                        <Button size="sm" variant="secondary" className="w-full" icon={<Printer className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedChallanReceipt(ch)}>
                          View Receipt
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. AUDIT LOGS TELEMETRY */}
            {activeTab === 'logs' && (
              loading ? (
                <div className="space-y-2">{[1,2,3,4,5].map((i) => <SkeletonCard key={i} />)}</div>
              ) : logs.length === 0 ? (
                <EmptyState title="No movement logs recorded" description="Stock movements will appear here after inventory adjustments." icon={<History className="w-6 h-6" />} />
              ) : (
                <div className="space-y-2">
                  {logs.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-3.5 rounded-xl border cyber-card" style={{
                      backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)',
                    }}>
                      <div className="flex items-center gap-3">
                        <Badge variant={l.type === 'IN' ? 'success' : 'warning'}>{l.type}</Badge>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{l.product?.name || 'Item'}</div>
                          <div className="text-[11px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                            {l.reason} • Initiated by {l.createdBy}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-sm" style={{ color: l.type === 'IN' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {l.type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`} Units
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                          {new Date(l.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 6. REPORTS & TELEMETRY */}
            {activeTab === 'reports' && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border space-y-2 cyber-card" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>Total Catalog Units</span>
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-text)' }}>
                      {products.reduce((sum, p) => sum + p.currentStock, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl border space-y-2 cyber-card" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>Average Unit Value</span>
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-primary)' }}>
                      ${products.length > 0 ? (totalStockValue / Math.max(1, products.reduce((sum, p) => sum + p.currentStock, 0))).toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl border space-y-2 cyber-card" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>Replenishment Urgency Rate</span>
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-warning)' }}>
                      {((lowStockCount / Math.max(1, products.length)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODALS */}

      {/* Adjust Stock Modal */}
      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Adjust Stock Telemetry"
             subtitle={selectedProduct?.sku} size="sm">
        {selectedProduct && (
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="p-3 rounded-xl border flex justify-between font-mono text-xs" style={{
              backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)',
            }}>
              <span>Current Stock</span>
              <span className="font-bold" style={{ color: 'var(--color-text)' }}>{selectedProduct.currentStock} Units</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {(['IN', 'OUT'] as const).map((type) => (
                <button key={type} type="button" onClick={() => setStockAdjType(type)}
                  className={`py-2 rounded-xl font-semibold text-xs cursor-pointer ${stockAdjType === type ? (type === 'IN' ? 'chip-success' : 'chip-warning') : ''}`}
                  style={stockAdjType !== type ? { backgroundColor: 'var(--color-input)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' } : {}}>
                  {type === 'IN' ? 'STOCK IN (+)' : 'STOCK OUT (-)'}
                </button>
              ))}
            </div>
            <Input label="QUANTITY" type="number" min={1} required value={stockAdjQty}
              onChange={(e) => setStockAdjQty(parseInt(e.target.value, 10))} />
            <Input label="AUDIT REASON" type="text" required value={stockAdjReason}
              onChange={(e) => setStockAdjReason(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setSelectedProduct(null)}>Cancel</Button>
              <Button type="submit" loading={stockLoading}>Save Stock</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Product Confirmation Modal */}
      <Modal open={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete SKU" subtitle="CONFIRM DELETION" size="sm">
        {productToDelete && (
          <div className="space-y-4 text-xs">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to permanently remove <strong style={{ color: 'var(--color-text)' }}>{productToDelete.name}</strong> ({productToDelete.sku}) from catalog?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setProductToDelete(null)}>Cancel</Button>
              <Button variant="danger" loading={deleteLoading} onClick={handleDeleteProduct}>Delete SKU</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal open={showAddProduct} onClose={() => setShowAddProduct(false)} title="Create Catalog SKU" size="md">
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
            <Button type="submit">Save SKU</Button>
          </div>
        </form>
      </Modal>

      {/* Customer Account Dossier Modal */}
      <Modal open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name}
             subtitle={selectedCustomer?.businessName} size="md">
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'EMAIL', value: selectedCustomer.email },
                { label: 'MOBILE', value: selectedCustomer.mobile },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)' }}>
                  <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{f.label}</div>
                  <div className="font-mono font-semibold text-xs truncate" style={{ color: 'var(--color-text)' }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedCustomer.notes?.map((n: any) => (
                <div key={n.id} className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--color-input)', borderColor: 'var(--color-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text)' }}>{n.note}</p>
                  <div className="text-[10px] flex justify-between font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span>By {n.createdBy}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <Input placeholder="Add account note..." required value={newNote} onChange={(e) => setNewNote(e.target.value)} />
              <Button type="submit" size="sm">Add Note</Button>
            </form>
          </div>
        )}
      </Modal>

      {/* Add Customer Modal */}
      <Modal open={showAddCustomer} onClose={() => setShowAddCustomer(false)} title="Create Customer Account" size="md">
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
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
            <Button type="submit">Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* Challan Printable Receipt Modal */}
      <ChallanReceiptModal open={!!selectedChallanReceipt} onClose={() => setSelectedChallanReceipt(null)} challan={selectedChallanReceipt} />
    </div>
  );
};
