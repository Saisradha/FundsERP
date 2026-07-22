import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, RoundedBox, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Product3D } from '../../store/useWarehouseStore';

interface Customer3DNode {
  id: string;
  name: string;
  businessName: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
}

interface SpatialWarehouseWorldProps {
  products: Product3D[];
  customers: Customer3DNode[];
  selectedSector: 'entry' | 'racks' | 'crm' | 'dispatch' | 'conveyor' | 'reports';
  onSelectProduct: (p: Product3D) => void;
  onSelectCustomer: (c: Customer3DNode) => void;
  isDispatching?: boolean;
}

// Spatial Camera Rig Flying Lerp Controller
const SpatialCameraRig = ({ sector }: { sector: string }) => {
  useFrame((state) => {
    let targetPos = new THREE.Vector3(0, 16, 26);
    let targetLook = new THREE.Vector3(0, 2, 0);

    if (sector === 'entry') {
      targetPos.set(0, 3.5, 12);
      targetLook.set(0, 2.5, 0);
    } else if (sector === 'racks') {
      targetPos.set(-14, 9, 14);
      targetLook.set(-14, 2, 0);
    } else if (sector === 'crm') {
      targetPos.set(20, 14, 14);
      targetLook.set(20, 2, 0);
    } else if (sector === 'dispatch') {
      targetPos.set(0, 7, -20);
      targetLook.set(0, 2, -28);
    } else if (sector === 'conveyor') {
      targetPos.set(0, 12, 5);
      targetLook.set(0, 0, -5);
    } else if (sector === 'reports') {
      targetPos.set(0, 28, 38);
      targetLook.set(0, 0, 0);
    }

    state.camera.position.lerp(targetPos, 0.04);
    state.camera.lookAt(targetLook);
  });

  return null;
};

// 3D Storage Rack Unit (Color Coded Stock Health)
const StorageRack3D = ({ 
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
  const isLow = product ? product.currentStock <= product.minStockAlert && product.currentStock > 0 : false;
  const isOut = product ? product.currentStock === 0 : false;
  const healthColor = isOut ? '#EF4444' : isLow ? '#F59E0B' : '#10B981';

  const boxCount = product ? Math.min(Math.ceil(product.currentStock / 10), 8) : 0;

  return (
    <group position={position}>
      {/* Industrial Frame Posts */}
      {[-1.8, 1.8].map((x, i) =>
        [-0.9, 0.9].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 2.5, z]}>
            <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
            <meshStandardMaterial color="#141820" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Rack Tier Surfaces */}
      {[0.5, 2.3, 4.1].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <boxGeometry args={[4, 0.1, 2]} />
          <meshStandardMaterial color="#1B212C" metalness={0.7} />
        </mesh>
      ))}

      {/* Floating Telemetry Tag */}
      <Float speed={2} floatIntensity={0.2}>
        <Text
          position={[0, 4.9, 0]}
          fontSize={0.35}
          color={healthColor}
          font="https://fonts.gstatic.com/s/outfit/v11/Q1dbZXr2zd120VT8653F.woff"
          anchorX="center"
        >
          {shelfId} {product ? `(${product.currentStock} Units)` : ''}
        </Text>
      </Float>

      {/* Product Stock Boxes */}
      {product && !isOut && (
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
                    color={healthColor}
                    emissive={healthColor}
                    emissiveIntensity={isLow ? 0.8 : 0.25}
                    roughness={0.3}
                  />
                </RoundedBox>
              </mesh>
            );
          })}
        </group>
      )}

      {/* Out of Stock Critical Pulse Mesh */}
      {isOut && (
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[2.5, 0.9, 1.3]} />
          <meshStandardMaterial color="#EF4444" wireframe emissive="#EF4444" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// 3D Customer Orbit Constellation Node
const CustomerOrbitNode3D = ({ 
  customer, 
  position, 
  onSelect 
}: { 
  customer: Customer3DNode; 
  position: [number, number, number]; 
  onSelect: (c: Customer3DNode) => void; 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const nodeColor = customer.status === 'ACTIVE' ? '#3B82F6' : customer.status === 'LEAD' ? '#F59E0B' : '#94A3B8';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(customer); }}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color={nodeColor} emissive={nodeColor} emissiveIntensity={0.7} roughness={0.2} />
      </mesh>

      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.1, 1.15, 32]} />
        <meshBasicMaterial color={nodeColor} side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      <Float speed={2} floatIntensity={0.2}>
        <Text
          position={[0, 1.3, 0]}
          fontSize={0.3}
          color="#F8FAFC"
          font="https://fonts.gstatic.com/s/outfit/v11/Q1dbZXr2zd120VT8653F.woff"
          anchorX="center"
        >
          {customer.businessName || customer.name}
        </Text>
      </Float>
    </group>
  );
};

// 3D Dispatch Truck Loading Bay
const DispatchDock3D = ({ isDispatching = false }: { isDispatching?: boolean }) => {
  const truckRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (truckRef.current && isDispatching) {
      truckRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 3) * 0.5;
    }
  });

  return (
    <group ref={truckRef} position={[0, 0, -28]}>
      {/* Truck Cargo Body */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[4.5, 3.2, 7]} />
        <meshStandardMaterial color="#222A38" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Driver Cabin */}
      <mesh position={[0, 1.6, -4.5]}>
        <boxGeometry args={[4.3, 2.5, 2.5]} />
        <meshStandardMaterial color="#141820" metalness={0.8} />
      </mesh>
      {/* Headlights */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.2, -5.8]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={1} />
        </mesh>
      ))}
      <Text position={[0, 4.2, 0]} fontSize={0.5} color="#3B82F6" anchorX="center">
        DISPATCH BAY 01
      </Text>
    </group>
  );
};

// 3D Animated Conveyor Belt for Stock Movement Telemetry
const ConveyorBelt3D = () => {
  const boxRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (boxRef.current) {
      boxRef.current.position.x = ((state.clock.getElapsedTime() * 2) % 12) - 6;
    }
  });

  return (
    <group position={[0, 0.2, -8]}>
      {/* Conveyor Belt Surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[14, 0.2, 1.2]} />
        <meshStandardMaterial color="#141820" metalness={0.9} />
      </mesh>
      {/* Traveling Stock Box */}
      <mesh ref={boxRef} position={[-6, 0.5, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};

export const SpatialWarehouseWorld: React.FC<SpatialWarehouseWorldProps> = ({
  products,
  customers,
  selectedSector,
  onSelectProduct,
  onSelectCustomer,
  isDispatching,
}) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#05070A] z-0">
      <Canvas camera={{ position: [0, 16, 26], fov: 45 }}>
        <color attach="background" args={['#05070A']} />
        <fog attach="fog" args={['#05070A', 10, 90]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 20, 0]} intensity={1.8} color="#3B82F6" />
        <directionalLight position={[15, 25, 15]} intensity={1.2} />

        {/* Spatial Camera Lerp Controller */}
        <SpatialCameraRig sector={selectedSector} />

        {/* Spatial Ground Floor Grid */}
        <gridHelper args={[90, 90, '#3B82F6', '#1B212C']} position={[0, 0, 0]} />

        {/* 1. Storage Racks Zone (Left) */}
        <group position={[-14, 0, 0]}>
          {products.map((p, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            return (
              <StorageRack3D
                key={p.id}
                position={[-4 + col * 8, 0, -6 + row * 8]}
                shelfId={`RACK-${String.fromCharCode(65 + col)}-0${row + 1}`}
                product={p}
                onSelect={onSelectProduct}
              />
            );
          })}
        </group>

        {/* 2. Customer Orbit Constellation Zone (Right) */}
        <group position={[20, 0, 0]}>
          {customers.map((c, i) => {
            const angle = (i / Math.max(customers.length, 1)) * Math.PI * 2;
            const radius = 5 + (i % 3) * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            return (
              <CustomerOrbitNode3D
                key={c.id}
                customer={c}
                position={[x, 0, z]}
                onSelect={onSelectCustomer}
              />
            );
          })}
        </group>

        {/* 3. Dispatch Dock Zone (Back) */}
        <DispatchDock3D isDispatching={isDispatching} />

        {/* 4. Conveyor Belt Stock Telemetry (Center) */}
        <ConveyorBelt3D />

        <OrbitControls maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={65} />
      </Canvas>
    </div>
  );
};
