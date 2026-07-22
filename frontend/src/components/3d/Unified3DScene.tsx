import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useWarehouseStore, Product3D } from '../../store/useWarehouseStore';

interface Customer3DNode {
  id: string;
  name: string;
  businessName: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
}

interface Unified3DSceneProps {
  products: Product3D[];
  customers: Customer3DNode[];
  selectedZone: 'auth' | 'mission_control' | 'warehouse' | 'customers' | 'dispatch';
  onSelectProduct: (p: Product3D) => void;
  onSelectCustomer: (c: Customer3DNode) => void;
  isDispatching?: boolean;
}

// Camera Rig for Smooth 3D Zone Fly-throughs
const CameraRig = ({ zone }: { zone: string }) => {
  useFrame((state) => {
    let targetPos = new THREE.Vector3(0, 12, 22);
    let targetLook = new THREE.Vector3(0, 0, 0);

    if (zone === 'auth') {
      targetPos.set(0, 3, 10);
      targetLook.set(0, 2, 0);
    } else if (zone === 'mission_control') {
      targetPos.set(0, 18, 28);
      targetLook.set(0, 0, 0);
    } else if (zone === 'warehouse') {
      targetPos.set(-10, 8, 12);
      targetLook.set(-10, 2, 0);
    } else if (zone === 'customers') {
      targetPos.set(18, 12, 12);
      targetLook.set(18, 2, 0);
    } else if (zone === 'dispatch') {
      targetPos.set(0, 6, -18);
      targetLook.set(0, 2, -26);
    }

    state.camera.position.lerp(targetPos, 0.04);
    state.camera.lookAt(targetLook);
  });

  return null;
};

// 3D Animated Forklift
const Forklift3D = ({ position = [-6, 0.4, 0] }: { position?: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = Math.sin(state.clock.getElapsedTime() * 0.8) * 8;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.2, 0.9, 3.5]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.7, -0.4]}>
        <boxGeometry args={[1.8, 1.5, 1.8]} />
        <meshStandardMaterial color="#1e293b" wireframe />
      </mesh>
      <mesh position={[0, 0.2, 2.2]}>
        <boxGeometry args={[1.4, 0.1, 1.2]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
    </group>
  );
};

// 3D Industrial Shelf Unit with Mapped Products
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
  const boxCount = product ? Math.min(Math.ceil(product.currentStock / 10), 8) : 0;

  return (
    <group position={position}>
      {/* Frame posts */}
      {[-1.8, 1.8].map((x, i) =>
        [-0.9, 0.9].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 2.5, z]}>
            <cylinderGeometry args={[0.07, 0.07, 5, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        ))
      )}

      {/* Shelves */}
      {[0.5, 2.3, 4.1].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <boxGeometry args={[4, 0.1, 2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
      ))}

      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, 4.9, 0]}
          fontSize={0.35}
          color={isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#38bdf8'}
          font="https://fonts.gstatic.com/s/outfit/v11/Q1dbZXr2zd120VT8653F.woff"
          anchorX="center"
          anchorY="middle"
        >
          {shelfId}
        </Text>
      </Float>

      {product && !isOutOfStock && (
        <group onClick={(e) => { e.stopPropagation(); onSelect(product); }}>
          {Array.from({ length: boxCount }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const posX = -1.1 + col * 0.75;
            const posY = 0.8 + row * 1.8;

            return (
              <mesh key={i} position={[posX, posY, 0]}>
                <RoundedBox args={[0.6, 0.5, 0.6]} radius={0.05} smoothness={4}>
                  <meshStandardMaterial
                    color={isLowStock ? '#f97316' : '#0284c7'}
                    emissive={isLowStock ? '#ea580c' : '#0369a1'}
                    emissiveIntensity={isLowStock ? 0.8 : 0.3}
                    roughness={0.3}
                  />
                </RoundedBox>
              </mesh>
            );
          })}
        </group>
      )}

      {isOutOfStock && (
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[2.5, 0.9, 1.3]} />
          <meshStandardMaterial color="#ef4444" wireframe emissive="#ef4444" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// 3D Customer Galaxy Node
const CustomerNode3D = ({ 
  customer, 
  position, 
  onSelect 
}: { 
  customer: Customer3DNode; 
  position: [number, number, number]; 
  onSelect: (c: Customer3DNode) => void; 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = customer.status === 'ACTIVE' ? '#38bdf8' : customer.status === 'LEAD' ? '#f97316' : '#64748b';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.6;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(customer); }}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>

      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.1, 1.15, 32]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      <Float speed={2} floatIntensity={0.2}>
        <Text
          position={[0, 1.3, 0]}
          fontSize={0.3}
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

// 3D Delivery Truck Dock Zone
const DispatchTruck3D = ({ isDispatching = false }: { isDispatching?: boolean }) => {
  const truckRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (truckRef.current && isDispatching) {
      truckRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 3) * 0.4;
    }
  });

  return (
    <group ref={truckRef} position={[0, 0, -26]}>
      {/* Cargo Container */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[4.5, 3.2, 7]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Driver Cabin */}
      <mesh position={[0, 1.6, -4.5]}>
        <boxGeometry args={[4.3, 2.5, 2.5]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      {/* Headlights */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.2, -5.8]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1} />
        </mesh>
      ))}
      <Text position={[0, 4.2, 0]} fontSize={0.5} color="#f59e0b" anchorX="center">
        DISPATCH DOCK 01
      </Text>
    </group>
  );
};

// Security Gate 3D Entry
const SecurityGate3D = () => (
  <group position={[0, 0, 8]}>
    <mesh position={[-4, 3, 0]}>
      <boxGeometry args={[0.6, 6, 0.6]} />
      <meshStandardMaterial color="#334155" metalness={0.9} />
    </mesh>
    <mesh position={[4, 3, 0]}>
      <boxGeometry args={[0.6, 6, 0.6]} />
      <meshStandardMaterial color="#334155" metalness={0.9} />
    </mesh>
    <mesh position={[0, 5.8, 0]}>
      <boxGeometry args={[8.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} />
    </mesh>
    <Text position={[0, 6.6, 0]} fontSize={0.4} color="#38bdf8" anchorX="center">
      ERPFLOW SECURITY BLAST GATE
    </Text>
  </group>
);

export const Unified3DScene: React.FC<Unified3DSceneProps> = ({
  products,
  customers,
  selectedZone,
  onSelectProduct,
  onSelectCustomer,
  isDispatching,
}) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 z-0">
      <Canvas camera={{ position: [0, 12, 22], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 20, 0]} intensity={1.8} color="#38bdf8" />
        <directionalLight position={[15, 25, 15]} intensity={1.4} />

        {/* Dynamic Camera Fly Controller */}
        <CameraRig zone={selectedZone} />

        {/* Industrial Ground Grid */}
        <gridHelper args={[80, 80, '#0284c7', '#1e293b']} position={[0, 0, 0]} />

        {/* 1. Security Gate */}
        <SecurityGate3D />

        {/* 2. 3D Warehouse Shelves Zone (Left) */}
        <group position={[-10, 0, 0]}>
          <Forklift3D />
          {products.map((p, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            return (
              <Shelf3D
                key={p.id}
                position={[-4 + col * 8, 0, -6 + row * 8]}
                shelfId={`RACK-${String.fromCharCode(65 + col)}-0${row + 1}`}
                product={p}
                onSelect={onSelectProduct}
              />
            );
          })}
        </group>

        {/* 3. 3D Customer Galaxy Constellation Zone (Right) */}
        <group position={[18, 0, 0]}>
          {customers.map((c, i) => {
            const angle = (i / Math.max(customers.length, 1)) * Math.PI * 2;
            const radius = 5 + (i % 3) * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            return (
              <CustomerNode3D
                key={c.id}
                customer={c}
                position={[x, 0, z]}
                onSelect={onSelectCustomer}
              />
            );
          })}
        </group>

        {/* 4. 3D Truck Loading Dock Zone (Back) */}
        <DispatchTruck3D isDispatching={isDispatching} />

        <OrbitControls maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={60} />
      </Canvas>
    </div>
  );
};
