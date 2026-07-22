import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { apiRequest } from '../../services/api';
import { useWarehouseStore } from '../../store/useWarehouseStore';
import { X, Plus, Phone, Mail, MapPin, Building, Calendar, MessageSquare, Tag } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  customerType: string;
  address: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate: string | null;
  notes: Array<{ id: string; note: string; createdBy: string; createdAt: string }>;
}

// 3D Animated Customer Node Mesh
const CustomerNode3D = ({ 
  customer, 
  position, 
  onSelect 
}: { 
  customer: Customer; 
  position: [number, number, number]; 
  onSelect: (c: Customer) => void; 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { main: '#38bdf8', emissive: '#0284c7' }; // Blue/Cyan
      case 'LEAD':
        return { main: '#f97316', emissive: '#ea580c' }; // Orange
      case 'INACTIVE':
        return { main: '#64748b', emissive: '#334155' }; // Gray
      default:
        return { main: '#38bdf8', emissive: '#0284c7' };
    }
  };

  const colors = getNodeColor(customer.status);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(customer);
        }}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={colors.main}
          emissive={colors.emissive}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Orbit Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.2, 1.25, 32]} />
        <meshBasicMaterial color={colors.main} side={THREE.DoubleSide} opacity={0.5} transparent />
      </mesh>

      {/* Label Floating Above Node */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, 1.4, 0]}
          fontSize={0.35}
          color="#ffffff"
          font="https://fonts.gstatic.com/s/outfit/v11/Q1dbZXr2zd120VT8653F.woff"
          anchorX="center"
          anchorY="middle"
        >
          {customer.businessName || customer.name}
        </Text>
      </Float>
    </group>
  );
};

export const CustomerGalaxy: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    initialNote: '',
  });

  const fetchCustomers = async () => {
    try {
      const res = await apiRequest('/customers');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customer galaxy', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowAddCustomer(false);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        customerType: 'RETAIL',
        address: '',
        status: 'LEAD',
        initialNote: '',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] bg-slate-950 overflow-hidden font-sans">
      
      {/* Galaxy Header Controls */}
      <div className="absolute top-4 left-4 z-10 glass-panel p-4 rounded-2xl border-cyan-500/30 max-w-md">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono tracking-wider uppercase">3D CUSTOMER CRM GALAXY</h2>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-semibold hover:bg-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-mono">
          Each node represents an enterprise customer. Click a node to view CRM notes and interaction logs.
        </p>

        <div className="flex items-center gap-4 mt-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Active (Blue)
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Lead (Orange)
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Inactive (Gray)
          </span>
        </div>
      </div>

      {/* Selected Customer CRM Inspection Drawer */}
      {selectedCustomer && (
        <div className="absolute top-4 right-4 z-20 w-96 max-h-[calc(100vh-100px)] overflow-y-auto glass-panel p-6 rounded-2xl border-blue-500/50 shadow-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                selectedCustomer.status === 'ACTIVE' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' :
                selectedCustomer.status === 'LEAD' ? 'bg-amber-500/20 border-amber-400 text-amber-300' :
                'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {selectedCustomer.status} CLIENT
              </span>
              <h3 className="text-lg font-bold text-white mt-1 leading-tight">{selectedCustomer.name}</h3>
              <p className="text-xs text-cyan-400 font-mono">{selectedCustomer.businessName}</p>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{selectedCustomer.email}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{selectedCustomer.mobile}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Type: {selectedCustomer.customerType}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/80 border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{selectedCustomer.address}</span>
            </div>
          </div>

          {/* CRM Follow-up Notes Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              CRM FOLLOW-UP NOTES ({selectedCustomer.notes?.length || 0})
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedCustomer.notes?.map((n) => (
                <div key={n.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                  <p className="text-slate-200">{n.note}</p>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono flex justify-between">
                    <span>By {n.createdBy}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add follow-up note..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-mono text-xs font-bold hover:bg-cyan-500 transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddCustomer && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">ADD NEW CRM CUSTOMER</h3>
              <button onClick={() => setShowAddCustomer(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Customer Type</label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-slate-400">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                >
                  <option value="LEAD">Lead (Orange)</option>
                  <option value="ACTIVE">Active (Blue)</option>
                  <option value="INACTIVE">Inactive (Gray)</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-400">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-400">Initial Follow-up Note</label>
                <input
                  type="text"
                  value={formData.initialNote}
                  onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
                  placeholder="e.g. Inquired about bulk discount..."
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="col-span-2 pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Create Client Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* R3F 3D Canvas */}
      <Canvas camera={{ position: [0, 8, 18], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 20, 0]} intensity={1.5} color="#38bdf8" />

        {/* 3D Customer Orbit Galaxy Nodes */}
        {customers.map((c, i) => {
          const angle = (i / Math.max(customers.length, 1)) * Math.PI * 2;
          const radius = 6 + (i % 3) * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <CustomerNode3D
              key={c.id}
              customer={c}
              position={[x, 0, z]}
              onSelect={setSelectedCustomer}
            />
          );
        })}

        <OrbitControls minDistance={5} maxDistance={40} />
      </Canvas>
    </div>
  );
};
