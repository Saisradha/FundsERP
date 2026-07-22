import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '../../store/useThemeStore';

interface IsometricIslandWorldProps {
  activeModule: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onSelectModule: (module: 'inventory' | 'crm' | 'challans' | 'logs' | 'reports') => void;
  productStats: { healthy: number; low: number; critical: number };
  activeCustomerCount: number;
}

/* Theme Color Matrix - Optimized for Maximum 3D Contrast & Visibility */
const ThemeColors = ({ children }: { children: (colors: any) => React.ReactNode }) => {
  const { resolvedTheme } = useThemeStore();
  const colors = useMemo(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      bg: isDark ? '#060B14' : '#E2E8F0',
      fog: isDark ? '#060B14' : '#CBD5E1',
      platform: isDark ? '#1E293B' : '#CBD5E1',
      gridCyan: isDark ? '#06B6D4' : '#0284C7',
      gridViolet: isDark ? '#8B5CF6' : '#6366F1',
      building1: isDark ? '#334155' : '#FFFFFF',
      building2: isDark ? '#243044' : '#F1F5F9',
      ambientIntensity: isDark ? 2.0 : 1.8,
      dirLightIntensity: isDark ? 3.2 : 2.2,
      dirLightColor: isDark ? '#F0F9FF' : '#FFFBEB',
      pointLightCyan: '#06B6D4',
      pointLightViolet: '#8B5CF6',
      pointLightEmerald: '#10B981',
      textColor: isDark ? '#F8FAFC' : '#0F172A',
      tooltipBg: isDark ? '#0B101D' : '#FFFFFF',
      tooltipOpacity: 0.95,
    };
  }, [resolvedTheme]);

  return <>{children(colors)}</>;
};

/* Camera Smooth Lerp Controller */
const IsometricCameraRig = ({ activeModule }: { activeModule: string }) => {
  useFrame((state) => {
    let targetPos = new THREE.Vector3(26, 26, 26);
    let targetLook = new THREE.Vector3(0, 0, 0);

    if (activeModule === 'inventory') { targetPos.set(-2, 14, 18); targetLook.set(-10, 2, 8); }
    else if (activeModule === 'crm') { targetPos.set(-2, 14, 5); targetLook.set(-10, 2, -5); }
    else if (activeModule === 'challans') { targetPos.set(18, 14, 18); targetLook.set(10, 2, 8); }
    else if (activeModule === 'reports') { targetPos.set(18, 16, 5); targetLook.set(10, 4, -5); }
    else if (activeModule === 'logs') { targetPos.set(8, 14, -2); targetLook.set(0, 2, -10); }

    state.camera.position.lerp(targetPos, 0.05);
    state.camera.lookAt(targetLook);
  });
  return null;
};

/* Background Color Lerp */
const AnimatedBackground = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Color>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.lerp(new THREE.Color(color), 0.05);
    }
  });
  return <color ref={ref} attach="background" args={[color]} />;
};

/* Building HUD Base Element with Glowing Neon Trim */
const BuildingBase = ({
  position, label, sublabel, color = '#06B6D4', onClick, children, textColor, tooltipBg,
}: {
  position: [number, number, number]; label: string; sublabel: string; color?: string;
  onClick: () => void; children: React.ReactNode;
  textColor: string; tooltipBg: string; tooltipOpacity: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, hovered ? position[1] + 0.8 : position[1], 0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Floating 3D HTML Telemetry Tag */}
      <Float speed={2.5} floatIntensity={0.3}>
        <Html position={[0, 6.4, 0]} center distanceFactor={28} zIndexRange={[100, 0]}>
          <div
            className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-center shadow-2xl pointer-events-none select-none font-mono transition-all ${
              hovered ? 'scale-110' : ''
            }`}
            style={{
              backgroundColor: tooltipBg,
              borderColor: color,
              color: textColor,
              boxShadow: hovered ? `0 0 20px ${color}` : '0 4px 14px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="text-xs font-bold font-mono tracking-wider whitespace-nowrap">{label}</div>
            <div className="text-[10px] font-mono font-semibold whitespace-nowrap" style={{ color }}>{sublabel}</div>
          </div>
        </Html>
      </Float>
      {children}
    </group>
  );
};

/* Animated Stock Conveyor Belt Component */
const AnimatedConveyorBelt = () => {
  const crateRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (crateRef.current) {
      crateRef.current.position.x = ((state.clock.getElapsedTime() * 2.5) % 20) - 10;
    }
  });

  return (
    <group position={[0, 0.3, 1.5]}>
      {/* Track Surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[20, 0.25, 1.2]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Moving Stock Crate */}
      <mesh ref={crateRef} position={[-10, 0.6, 0]}>
        <boxGeometry args={[0.8, 0.7, 0.8]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

/* Rotating Customer Node Sphere */
const RotatingCustomerSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 3.4, 0]}>
      <sphereGeometry args={[1.1, 32, 32]} />
      <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.9} roughness={0.1} />
    </mesh>
  );
};

export const IsometricIslandWorld: React.FC<IsometricIslandWorldProps> = ({
  activeModule, onSelectModule, productStats, activeCustomerCount,
}) => {
  const { resolvedTheme } = useThemeStore();

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-cyber-grid"
         style={{ backgroundColor: resolvedTheme === 'dark' ? '#060B14' : '#E2E8F0' }}>
      <Canvas camera={{ position: [26, 26, 26], fov: 40 }} shadows>
        <ThemeColors>
          {(c) => (
            <>
              <AnimatedBackground color={c.bg} />
              <fog attach="fog" args={[c.fog, 35, 120]} />

              {/* High-Contrast Fill & Key Lighting */}
              <ambientLight intensity={c.ambientIntensity} />
              <directionalLight position={[25, 35, 20]} intensity={c.dirLightIntensity} color={c.dirLightColor}
                castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
              
              {/* Vibrant Ambient Pointlights around the scene */}
              <pointLight position={[-12, 16, 12]} intensity={3.5} color={c.pointLightCyan} />
              <pointLight position={[12, 16, -12]} intensity={3.5} color={c.pointLightViolet} />
              <pointLight position={[0, 22, 0]} intensity={3.0} color={c.pointLightEmerald} />
              <pointLight position={[12, 16, 12]} intensity={3.0} color="#F59E0B" />

              <IsometricCameraRig activeModule={activeModule} />

              {/* Cyber Ground Platform */}
              <group position={[0, -1, 0]}>
                <RoundedBox args={[36, 1.4, 36]} radius={0.8} smoothness={4} receiveShadow>
                  <meshStandardMaterial color={c.platform} roughness={0.3} metalness={0.3} />
                </RoundedBox>
                <gridHelper args={[34, 34, c.gridCyan, c.gridViolet]} position={[0, 0.71, 0]} />
              </group>

              {/* Animated Stock Conveyor System */}
              <AnimatedConveyorBelt />

              {/* 1. WAREHOUSE COMPLEX */}
              <BuildingBase position={[-10, 0, 8]} label="WAREHOUSE" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel={`${productStats.healthy + productStats.low + productStats.critical} Catalog SKUs`}
                color="#06B6D4" onClick={() => onSelectModule('inventory')}>
                <RoundedBox args={[6.5, 3.8, 6.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building1} roughness={0.2} metalness={0.3} />
                </RoundedBox>
                {/* Glowing Base Trim */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[6.7, 0.15, 6.7]} />
                  <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} />
                </mesh>
                {/* Status Beacons */}
                <mesh position={[-2, 1.6, 3.26]}><planeGeometry args={[1.2, 1.2]} />
                  <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.2} />
                </mesh>
                <mesh position={[0, 1.6, 3.26]}><planeGeometry args={[1.2, 1.2]} />
                  <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.2} />
                </mesh>
                <mesh position={[2, 1.6, 3.26]}><planeGeometry args={[1.2, 1.2]} />
                  <meshStandardMaterial color="#F43F5E" emissive="#F43F5E" emissiveIntensity={1.2} />
                </mesh>
              </BuildingBase>

              {/* 2. CRM CONSTELLATION TOWER */}
              <BuildingBase position={[-10, 0, -5]} label="CRM TOWER" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel={`${activeCustomerCount} Active Accounts`} color="#8B5CF6" onClick={() => onSelectModule('crm')}>
                <RoundedBox args={[5.5, 5.5, 5.5]} radius={0.4} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building2} roughness={0.2} metalness={0.4} />
                </RoundedBox>
                {/* Glowing Base Trim */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[5.7, 0.15, 5.7]} />
                  <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.8} />
                </mesh>
                <RotatingCustomerSphere />
                <mesh position={[0, 2.75, 2.76]}><planeGeometry args={[4.2, 4]} />
                  <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.7} transparent opacity={0.8} />
                </mesh>
              </BuildingBase>

              {/* 3. DISPATCH LOADING DOCK */}
              <BuildingBase position={[10, 0, 8]} label="DISPATCH BAY" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel="Loading Terminal" color="#F59E0B" onClick={() => onSelectModule('challans')}>
                <RoundedBox args={[7.5, 2.8, 6]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building1} roughness={0.2} metalness={0.3} />
                </RoundedBox>
                {/* Glowing Base Trim */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[7.7, 0.15, 6.2]} />
                  <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} />
                </mesh>
                <group position={[0, 1.1, 3.8]}>
                  <mesh position={[0, 0.8, 0]}>
                    <boxGeometry args={[3.8, 1.9, 2.8]} />
                    <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} />
                  </mesh>
                </group>
              </BuildingBase>

              {/* 4. ANALYTICS TELEMETRY SPIRE */}
              <BuildingBase position={[10, 0, -5]} label="ANALYTICS SPIRE" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel="Live Telemetry" color="#10B981" onClick={() => onSelectModule('reports')}>
                <RoundedBox args={[4.8, 8, 4.8]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building2} roughness={0.2} metalness={0.4} />
                </RoundedBox>
                {/* Glowing Base Trim */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[5.0, 0.15, 5.0]} />
                  <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
                </mesh>
                {/* Laser Spire Beacon */}
                <mesh position={[0, 4.8, 0]}>
                  <cylinderGeometry args={[0.12, 0.12, 2.8, 16]} />
                  <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2.0} />
                </mesh>
              </BuildingBase>

              {/* 5. AUDIT CONTROL CENTER */}
              <BuildingBase position={[0, 0, -10]} label="AUDIT CENTER" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel="Transaction Logs" color="#38BDF8" onClick={() => onSelectModule('logs')}>
                <RoundedBox args={[6.5, 3.2, 5]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building1} roughness={0.25} metalness={0.35} />
                </RoundedBox>
                {/* Glowing Base Trim */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[6.7, 0.15, 5.2]} />
                  <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.8} />
                </mesh>
              </BuildingBase>
            </>
          )}
        </ThemeColors>
        <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={10} maxDistance={60} />
      </Canvas>
    </div>
  );
};
