import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  MessageSquare, 
  Filter
} from 'lucide-react';
import { apiRequest } from '../services/api';

export const CustomerCrmPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
    initialNote: '',
  });

  const fetchCustomers = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await apiRequest(`/customers?${query.toString()}`);
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'RETAIL',
        address: '',
        status: 'LEAD',
        followUpDate: '',
        initialNote: '',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
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
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer CRM</h1>
          <p className="text-xs text-slate-400 font-sans mt-1">Enterprise client accounts & interaction notes timeline.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
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
            placeholder="Search name, email, company..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-full bg-slate-950/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-blue-500 px-4"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Clients</option>
            <option value="LEAD">Leads</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="apple-card rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-white/5">
              <tr>
                <th className="p-4">Customer / Company</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Follow-up Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No CRM customer records found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{c.name}</div>
                      <div className="text-[11px] text-blue-400 font-mono">{c.businessName}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-slate-500">{c.mobile}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold text-[10px]">
                        {c.customerType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full font-mono text-[10px] ${
                        c.status === 'ACTIVE' ? 'apple-pill-green' :
                        c.status === 'LEAD' ? 'apple-pill-amber' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : 'None'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-4 py-1.5 rounded-full apple-pill-blue hover:bg-blue-600 hover:text-white font-semibold transition-all cursor-pointer"
                      >
                        Notes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Customer Details & Notes Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg apple-glass p-6 rounded-3xl space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                  selectedCustomer.status === 'ACTIVE' ? 'apple-pill-green' : 'apple-pill-amber'
                }`}>
                  {selectedCustomer.status}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedCustomer.name}</h3>
                <p className="text-blue-400 font-mono text-xs">{selectedCustomer.businessName}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="text-slate-500 text-[10px]">EMAIL</div>
                <div className="font-bold truncate">{selectedCustomer.email}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="text-slate-500 text-[10px]">MOBILE</div>
                <div className="font-bold">{selectedCustomer.mobile}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>Follow-up Notes ({selectedCustomer.notes?.length || 0})</span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedCustomer.notes?.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                    <p className="text-slate-200">{n.note}</p>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono flex justify-between">
                      <span>By {n.createdBy}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  required
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add note..."
                  className="flex-1 px-4 py-2 rounded-full bg-slate-950/80 border border-white/10 text-white text-xs"
                />
                <button type="submit" className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold">
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-xs">
          <div className="w-full max-w-lg apple-glass p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="grid grid-cols-2 gap-3 font-sans">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Customer Type</label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400 text-[11px]">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-400 text-[11px]">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-400 text-[11px]">Initial Note</label>
                <input
                  type="text"
                  value={formData.initialNote}
                  onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
                  className="w-full p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-white"
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
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
