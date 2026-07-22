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
  color = '#3B82F6',
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
      {/* Floating Info Tooltip Label (High Contrast Crisp White Text) */}
      <Float speed={2} floatIntensity={0.2}>
        <group position={[0, 6.2, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4.5, 1.3]} />
            <meshBasicMaterial color="#0F172A" transparent opacity={hovered ? 0.95 : 0.85} />
          </mesh>
          <Text position={[0, 0.22, 0.01]} fontSize={0.35} color="#FFFFFF" anchorX="center">
            {label}
          </Text>
          <Text position={[0, -0.25, 0.01]} fontSize={0.25} color={color} anchorX="center">
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
    <div className="fixed inset-0 w-full h-full bg-[#0A0F1D] z-0">
      <Canvas camera={{ position: [26, 26, 26], fov: 40 }} shadows>
        <color attach="background" args={['#0A0F1D']} />
        <fog attach="fog" args={['#0A0F1D', 15, 80]} />
        
        {/* Soft Ambient & Volumetric Blue Directional Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[25, 35, 20]}
          intensity={2.0}
          color="#60A5FA"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 15, 10]} intensity={1.5} color="#60A5FA" />
        <pointLight position={[10, 15, -10]} intensity={1.5} color="#10B981" />

        {/* Isometric Camera Lerp Controller */}
        <IsometricCameraRig activeModule={activeModule} />

        {/* Floating Industrial Steel Base Platform */}
        <group position={[0, -1, 0]}>
          <RoundedBox args={[34, 1.2, 34]} radius={0.8} smoothness={4} receiveShadow>
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.5} />
          </RoundedBox>

          {/* Glowing Platform Edge Grid */}
          <gridHelper args={[32, 32, '#3B82F6', '#1E293B']} position={[0, 0.61, 0]} />
        </group>

        {/* 1. 📦 Inventory Warehouse Building Racks */}
        <BuildingBase
          position={[-10, 0, 8]}
          label="WAREHOUSE RACKS"
          sublabel={`${productStats.healthy + productStats.low + productStats.critical} SKUs Logged`}
          color="#60A5FA"
          onClick={() => onSelectModule('inventory')}
        >
          <RoundedBox args={[6, 3.5, 6]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.6} />
          </RoundedBox>

          {/* Color-Coded Stock Health Windows */}
          <mesh position={[-1.8, 1.5, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[1.8, 1.5, 3.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.8} />
          </mesh>
        </BuildingBase>

        {/* 2. 🏢 CRM Office Building */}
        <BuildingBase
          position={[-10, 0, -5]}
          label="CRM OFFICE TOWER"
          sublabel={`${activeCustomerCount} Active Accounts`}
          color="#38BDF8"
          onClick={() => onSelectModule('crm')}
        >
          <RoundedBox args={[5.5, 5, 5.5]} radius={0.4} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.8} />
          </RoundedBox>
          <mesh position={[0, 2.5, 2.76]}>
            <planeGeometry args={[4, 3.8]} />
            <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.4} transparent opacity={0.6} roughness={0.1} />
          </mesh>
        </BuildingBase>

        {/* 3. 🚚 Dispatch Dock & Parked Trucks */}
        <BuildingBase
          position={[10, 0, 8]}
          label="DISPATCH DOCK"
          sublabel="Loading Bay 01"
          color="#FBBF24"
          onClick={() => onSelectModule('challans')}
        >
          <RoundedBox args={[7, 2.5, 5.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.6} />
          </RoundedBox>
          {/* Parked Truck */}
          <group position={[0, 1, 3.5]}>
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[3.5, 1.8, 2.5]} />
              <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
            </mesh>
          </group>
        </BuildingBase>

        {/* 4. 📈 Analytics Operations Spire Tower */}
        <BuildingBase
          position={[10, 0, -5]}
          label="ANALYTICS SPIRE"
          sublabel="Live Telemetry"
          color="#34D399"
          onClick={() => onSelectModule('reports')}
        >
          <RoundedBox args={[4.5, 7.5, 4.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#0F172A" roughness={0.15} metalness={0.7} />
          </RoundedBox>
          <mesh position={[0, 4.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
            <meshStandardMaterial color="#34D399" emissive="#34D399" emissiveIntensity={1} />
          </mesh>
        </BuildingBase>

        {/* 5. 📋 Sales & Audit Center */}
        <BuildingBase
          position={[0, 0, -10]}
          label="SALES & AUDIT CENTER"
          sublabel="Movement Logs"
          color="#94A3B8"
          onClick={() => onSelectModule('logs')}
        >
          <RoundedBox args={[6, 3, 4.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.5} />
          </RoundedBox>
        </BuildingBase>

        <OrbitControls maxPolarAngle={Math.PI / 2.2} minDistance={12} maxDistance={55} />
      </Canvas>
    </div>
  );
};
