import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface IsometricIslandWorldProps {
  activeModule: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onSelectModule: (module: 'inventory' | 'crm' | 'challans' | 'logs' | 'reports') => void;
  productStats: { healthy: number; low: number; critical: number };
  activeCustomerCount: number;
}

// Camera Lerp Controller for Isometric Flying Focus
const IsometricCameraRig = ({ activeModule }: { activeModule: string }) => {
  useFrame((state) => {
    let targetPos = new THREE.Vector3(26, 26, 26);
    let targetLook = new THREE.Vector3(0, 0, 0);

    if (activeModule === 'inventory') {
      targetPos.set(-2, 14, 18);
      targetLook.set(-10, 2, 8);
    } else if (activeModule === 'crm') {
      targetPos.set(-2, 14, 5);
      targetLook.set(-10, 2, -5);
    } else if (activeModule === 'challans') {
      targetPos.set(18, 14, 18);
      targetLook.set(10, 2, 8);
    } else if (activeModule === 'reports') {
      targetPos.set(18, 16, 5);
      targetLook.set(10, 4, -5);
    } else if (activeModule === 'logs') {
      targetPos.set(8, 14, -2);
      targetLook.set(0, 2, -10);
    }

    state.camera.position.lerp(targetPos, 0.05);
    state.camera.lookAt(targetLook);
  });

  return null;
};

// 3D Building Base Shell
const BuildingBase = ({
  position,
  label,
  sublabel,
  color = '#2563EB',
  onClick,
  children,
}: {
  position: [number, number, number];
  label: string;
  sublabel: string;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        hovered ? position[1] + 0.6 : position[1],
        0.1
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Floating Info Tooltip Label */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[0, 6, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4.2, 1.2]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={hovered ? 0.95 : 0.8} />
          </mesh>
          <Text position={[0, 0.2, 0.01]} fontSize={0.32} color="#0F172A" anchorX="center">
            {label}
          </Text>
          <Text position={[0, -0.25, 0.01]} fontSize={0.22} color={color} anchorX="center">
            {sublabel}
          </Text>
        </group>
      </Float>

      {/* Building Geometry Content */}
      {children}
    </group>
  );
};

export const IsometricIslandWorld: React.FC<IsometricIslandWorldProps> = ({
  activeModule,
  onSelectModule,
  productStats,
  activeCustomerCount,
}) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#F4F7FA] z-0">
      <Canvas camera={{ position: [26, 26, 26], fov: 40 }} shadows>
        <color attach="background" args={['#F4F7FA']} />
        
        {/* Soft Ambient & Directional Warm Sunlight */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[30, 40, 20]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 15, 10]} intensity={0.6} color="#3B82F6" />

        {/* Isometric Camera Lerp Controller */}
        <IsometricCameraRig activeModule={activeModule} />

        {/* Floating Miniature Industrial Island Base */}
        <group position={[0, -1, 0]}>
          <RoundedBox args={[34, 1.2, 34]} radius={0.8} smoothness={4} receiveShadow>
            <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
          </RoundedBox>

          {/* Island Grass/Concrete Top Pad */}
          <mesh position={[0, 0.61, 0]} receiveShadow>
            <boxGeometry args={[32.5, 0.05, 32.5]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.3} />
          </mesh>
        </group>

        {/* 1. 📦 Inventory Warehouse Building Racks */}
        <BuildingBase
          position={[-10, 0, 8]}
          label="WAREHOUSE RACKS"
          sublabel={`${productStats.healthy + productStats.low + productStats.critical} SKUs Logged`}
          color="#2563EB"
          onClick={() => onSelectModule('inventory')}
        >
          <RoundedBox args={[6, 3.5, 6]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </RoundedBox>

          {/* Color-Coded Stock Health Windows */}
          <mesh position={[-1.8, 1.5, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 1.5, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[1.8, 1.5, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
          </mesh>
        </BuildingBase>

        {/* 2. 🏢 CRM Office Building */}
        <BuildingBase
          position={[-10, 0, -5]}
          label="CRM OFFICE TOWER"
          sublabel={`${activeCustomerCount} Active Accounts`}
          color="#3B82F6"
          onClick={() => onSelectModule('crm')}
        >
          <RoundedBox args={[5.5, 5, 5.5]} radius={0.4} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, 2.5, 2.76]}>
            <planeGeometry args={[4, 3.8]} />
            <meshStandardMaterial color="#3B82F6" transparent opacity={0.4} roughness={0.1} />
          </mesh>
        </BuildingBase>

        {/* 3. 🚚 Dispatch Dock & Parked Trucks */}
        <BuildingBase
          position={[10, 0, 8]}
          label="DISPATCH DOCK"
          sublabel="Loading Bay 01"
          color="#F59E0B"
          onClick={() => onSelectModule('challans')}
        >
          <RoundedBox args={[7, 2.5, 5.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
          </RoundedBox>
          {/* Parked Truck */}
          <group position={[0, 1, 3.5]}>
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[3.5, 1.8, 2.5]} />
              <meshStandardMaterial color="#2563EB" />
            </mesh>
          </group>
        </BuildingBase>

        {/* 4. 📈 Analytics Operations Spire Tower */}
        <BuildingBase
          position={[10, 0, -5]}
          label="ANALYTICS SPIRE"
          sublabel="Live Telemetry"
          color="#10B981"
          onClick={() => onSelectModule('reports')}
        >
          <RoundedBox args={[4.5, 7.5, 4.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#FFFFFF" roughness={0.15} />
          </RoundedBox>
          <mesh position={[0, 4.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1} />
          </mesh>
        </BuildingBase>

        {/* 5. 📋 Sales & Audit Center */}
        <BuildingBase
          position={[0, 0, -10]}
          label="SALES & AUDIT CENTER"
          sublabel="Movement Logs"
          color="#64748B"
          onClick={() => onSelectModule('logs')}
        >
          <RoundedBox args={[6, 3, 4.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
          </RoundedBox>
        </BuildingBase>

        <OrbitControls maxPolarAngle={Math.PI / 2.2} minDistance={12} maxDistance={55} />
      </Canvas>
    </div>
  );
};
