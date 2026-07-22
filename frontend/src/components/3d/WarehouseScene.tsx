import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { apiRequest } from '../../services/api';
import { useWarehouseStore, Product3D } from '../../store/useWarehouseStore';
import { X, AlertTriangle, RefreshCw } from 'lucide-react';

// Animated Forklift Mesh
const Forklift3D = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Patrolling animation back and forth along Z axis
      meshRef.current.position.z = Math.sin(state.clock.getElapsedTime() * 0.8) * 12;
      meshRef.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.8) > 0 ? 0 : Math.PI;
    }
  });

  return (
    <group ref={meshRef} position={[-6, 0.4, 0]}>
      {/* Chassis */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.5, 1, 4]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, 1.8, -0.5]}>
        <boxGeometry args={[2, 1.6, 2]} />
        <meshStandardMaterial color="#1e293b" wireframe />
      </mesh>
      {/* Forks */}
      <mesh position={[0, 0.2, 2.5]}>
        <boxGeometry args={[1.6, 0.1, 1.5]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      {/* Wheels */}
      {[-1.1, 1.1].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.3, 1.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[x, 0.3, -1.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// 3D Industrial Shelf Unit with Mapped Product Boxes
const Shelf3D = ({ 
  position, 
  shelfId, 
  product, 
  onSelect 
}: { 
  position: [number, number, number]; 
  shelfId: string; 
  product?: Product3D; 
  onSelect: (p: Product3D) => void; 
}) => {
  const isLowStock = product ? product.currentStock <= product.minStockAlert && product.currentStock > 0 : false;
  const isOutOfStock = product ? product.currentStock === 0 : false;

  // Calculate box count proportional to current stock
  const boxCount = product ? Math.min(Math.ceil(product.currentStock / 10), 8) : 0;

  return (
    <group position={position}>
      {/* Shelf Steel Frame Legs */}
      {[-2, 2].map((x, i) =>
        [-1, 1].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 3, z]}>
            <cylinderGeometry args={[0.08, 0.08, 6, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Horizontal Shelves (3 Tiers) */}
      {[0.5, 2.5, 4.5].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <boxGeometry args={[4.4, 0.1, 2.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Shelf Location Code Sign */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, 5.4, 0]}
          fontSize={0.4}
          color={isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#38bdf8'}
          font="https://fonts.gstatic.com/s/outfit/v11/Q1dbZXr2zd120VT8653F.woff"
          anchorX="center"
          anchorY="middle"
        >
          {shelfId}
        </Text>
      </Float>

      {/* Product Stock Boxes on Shelves */}
      {product && !isOutOfStock && (
        <group 
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
        >
          {Array.from({ length: boxCount }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const posX = -1.2 + col * 0.8;
            const posY = 0.8 + row * 2.0;

            return (
              <mesh key={i} position={[posX, posY, 0]}>
                <RoundedBox args={[0.65, 0.55, 0.65]} radius={0.05} smoothness={4}>
                  <meshStandardMaterial
                    color={isLowStock ? '#f97316' : '#0284c7'}
                    emissive={isLowStock ? '#ea580c' : '#0369a1'}
                    emissiveIntensity={isLowStock ? 0.6 : 0.2}
                    roughness={0.3}
                    metalness={0.4}
                  />
                </RoundedBox>
              </mesh>
            );
          })}
        </group>
      )}

      {/* Out of Stock Flashing Red Wireframe Alert Box */}
      {isOutOfStock && (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshStandardMaterial color="#ef4444" wireframe emissive="#ef4444" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
};

export const WarehouseScene: React.FC = () => {
  const [products, setProducts] = useState<Product3D[]>([]);
  const { selectedProduct, setSelectedProduct } = useWarehouseStore();

  const fetchProducts = async () => {
    try {
      const res = await apiRequest('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products for 3D scene', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] bg-slate-950 overflow-hidden font-sans">
      
      {/* Top 3D View Overlay Info */}
      <div className="absolute top-4 left-4 z-10 glass-panel p-4 rounded-xl border-cyan-500/30 max-w-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-white font-mono tracking-wider">3D DIGITAL TWIN WAREHOUSE</h2>
          <button onClick={fetchProducts} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-cyan-400">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-mono">
          Click any 3D box on the shelves to inspect real-time stock telemetry. Drag mouse to rotate 360° camera view.
        </p>
        <div className="flex items-center gap-3 mt-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Normal Stock
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" /> Low Alert
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Out of Stock
          </span>
        </div>
      </div>

      {/* Selected Product Inspection Drawer */}
      {selectedProduct && (
        <div className="absolute top-4 right-4 z-20 w-80 glass-panel p-5 rounded-2xl border-cyan-500/50 shadow-2xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{selectedProduct.sku}</span>
              <h3 className="text-base font-bold text-white leading-tight">{selectedProduct.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Category</span>
              <span className="text-white font-bold">{selectedProduct.category}</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Unit Price</span>
              <span className="text-emerald-400 font-bold">${selectedProduct.unitPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Location</span>
              <span className="text-cyan-400 font-bold">{selectedProduct.location}</span>
            </div>

            <div className={`flex justify-between p-2 rounded border ${
              selectedProduct.currentStock <= selectedProduct.minStockAlert 
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300' 
                : 'bg-slate-900/80 border-slate-800 text-white'
            }`}>
              <span className="flex items-center gap-1">
                {selectedProduct.currentStock <= selectedProduct.minStockAlert && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                )}
                Stock Count
              </span>
              <span className="font-bold">{selectedProduct.currentStock} Units</span>
            </div>
          </div>
        </div>
      )}

      {/* Three.js R3F Canvas */}
      <Canvas camera={{ position: [16, 14, 20], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 15, 0]} intensity={1.5} color="#38bdf8" />
        <directionalLight position={[10, 20, 15]} intensity={1.2} />

        {/* Industrial Grid Ground */}
        <gridHelper args={[60, 60, '#0284c7', '#1e293b']} position={[0, 0, 0]} />

        {/* Patrolling 3D Forklift */}
        <Forklift3D />

        {/* 3D Shelves Array */}
        {products.map((p, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const posX = -10 + col * 10;
          const posZ = -10 + row * 10;

          return (
            <Shelf3D
              key={p.id}
              position={[posX, 0, posZ]}
              shelfId={`ZONE-${String.fromCharCode(65 + col)}-0${row + 1}`}
              product={p}
              onSelect={setSelectedProduct}
            />
          );
        })}

        <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={45} />
      </Canvas>
    </div>
  );
};
