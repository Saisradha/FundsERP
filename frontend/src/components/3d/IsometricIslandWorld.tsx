import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '../../store/useThemeStore';

interface IsometricIslandWorldProps {
  activeModule: 'dashboard' | 'inventory' | 'crm' | 'challans' | 'logs' | 'reports';
  onSelectModule: (module: 'inventory' | 'crm' | 'challans' | 'logs' | 'reports') => void;
  productStats: { healthy: number; low: number; critical: number };
  activeCustomerCount: number;
}

/* ================================================================
   Theme-aware color provider (lerps between light & dark)
   ================================================================ */
const ThemeColors = ({ children }: { children: (colors: any) => React.ReactNode }) => {
  const { resolvedTheme } = useThemeStore();
  const colors = useMemo(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      bg: isDark ? '#0A0F1D' : '#E8ECF2',
      fog: isDark ? '#0A0F1D' : '#E8ECF2',
      platform: isDark ? '#1E293B' : '#D1D5DB',
      platformMetal: isDark ? 0.5 : 0.2,
      building1: isDark ? '#1E293B' : '#E5E7EB',
      building2: isDark ? '#0F172A' : '#F3F4F6',
      grid1: isDark ? '#3B82F6' : '#93C5FD',
      grid2: isDark ? '#1E293B' : '#D1D5DB',
      ambientIntensity: isDark ? 0.6 : 1.2,
      dirLightIntensity: isDark ? 1.8 : 1.4,
      dirLightColor: isDark ? '#60A5FA' : '#FBBF24',
      pointLight1: isDark ? '#60A5FA' : '#93C5FD',
      pointLight2: isDark ? '#10B981' : '#34D399',
      textColor: isDark ? '#FFFFFF' : '#111827',
      tooltipBg: isDark ? '#0F172A' : '#FFFFFF',
      tooltipOpacity: isDark ? 0.9 : 0.95,
    };
  }, [resolvedTheme]);

  return <>{children(colors)}</>;
};

/* ================================================================
   Camera Controller
   ================================================================ */
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

/* ================================================================
   Animated Background Color
   ================================================================ */
const AnimatedBackground = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Color>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.lerp(new THREE.Color(color), 0.05);
    }
  });
  return <color ref={ref} attach="background" args={[color]} />;
};

/* ================================================================
   Building Base
   ================================================================ */
const BuildingBase = ({
  position, label, sublabel, color = '#3B82F6', onClick, children, textColor, tooltipBg, tooltipOpacity,
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
        groupRef.current.position.y, hovered ? position[1] + 0.6 : position[1], 0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <Float speed={2} floatIntensity={0.2}>
        <group position={[0, 6.2, 0]}>
          <mesh><planeGeometry args={[4.5, 1.3]} />
            <meshBasicMaterial color={tooltipBg} transparent opacity={hovered ? tooltipOpacity : tooltipOpacity - 0.1} />
          </mesh>
          <Text position={[0, 0.22, 0.01]} fontSize={0.35} color={textColor} anchorX="center">{label}</Text>
          <Text position={[0, -0.25, 0.01]} fontSize={0.25} color={color} anchorX="center">{sublabel}</Text>
        </group>
      </Float>
      {children}
    </group>
  );
};

/* ================================================================
   Main Component
   ================================================================ */
export const IsometricIslandWorld: React.FC<IsometricIslandWorldProps> = ({
  activeModule, onSelectModule, productStats, activeCustomerCount,
}) => {
  const { resolvedTheme } = useThemeStore();

  return (
    <div className="fixed inset-0 w-full h-full z-0"
         style={{ background: resolvedTheme === 'dark' ? '#0A0F1D' : '#E8ECF2' }}>
      <Canvas camera={{ position: [26, 26, 26], fov: 40 }} shadows>
        <ThemeColors>
          {(c) => (
            <>
              <AnimatedBackground color={c.bg} />
              <fog attach="fog" args={[c.fog, 15, 80]} />

              <ambientLight intensity={c.ambientIntensity} />
              <directionalLight position={[25, 35, 20]} intensity={c.dirLightIntensity} color={c.dirLightColor}
                castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
              <pointLight position={[-10, 15, 10]} intensity={1.2} color={c.pointLight1} />
              <pointLight position={[10, 15, -10]} intensity={1.2} color={c.pointLight2} />

              <IsometricCameraRig activeModule={activeModule} />

              {/* Platform */}
              <group position={[0, -1, 0]}>
                <RoundedBox args={[34, 1.2, 34]} radius={0.8} smoothness={4} receiveShadow>
                  <meshStandardMaterial color={c.platform} roughness={0.3} metalness={c.platformMetal} />
                </RoundedBox>
                <gridHelper args={[32, 32, c.grid1, c.grid2]} position={[0, 0.61, 0]} />
              </group>

              {/* Warehouse */}
              <BuildingBase position={[-10, 0, 8]} label="WAREHOUSE" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel={`${productStats.healthy + productStats.low + productStats.critical} SKUs`}
                color="#60A5FA" onClick={() => onSelectModule('inventory')}>
                <RoundedBox args={[6, 3.5, 6]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building1} roughness={0.2} metalness={0.6} />
                </RoundedBox>
                <mesh position={[-1.8, 1.5, 3.01]}><planeGeometry args={[1.2, 1.2]} /><meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} /></mesh>
                <mesh position={[0, 1.5, 3.01]}><planeGeometry args={[1.2, 1.2]} /><meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} /></mesh>
                <mesh position={[1.8, 1.5, 3.01]}><planeGeometry args={[1.2, 1.2]} /><meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.8} /></mesh>
              </BuildingBase>

              {/* CRM */}
              <BuildingBase position={[-10, 0, -5]} label="CRM OFFICE" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel={`${activeCustomerCount} Active`} color="#38BDF8" onClick={() => onSelectModule('crm')}>
                <RoundedBox args={[5.5, 5, 5.5]} radius={0.4} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building2} roughness={0.1} metalness={0.8} />
                </RoundedBox>
                <mesh position={[0, 2.5, 2.76]}><planeGeometry args={[4, 3.8]} />
                  <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.4} transparent opacity={0.6} />
                </mesh>
              </BuildingBase>

              {/* Dispatch */}
              <BuildingBase position={[10, 0, 8]} label="DISPATCH" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel="Loading Bay" color="#FBBF24" onClick={() => onSelectModule('challans')}>
                <RoundedBox args={[7, 2.5, 5.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building1} roughness={0.3} metalness={0.6} />
                </RoundedBox>
                <group position={[0, 1, 3.5]}><mesh position={[0, 0.8, 0]}><boxGeometry args={[3.5, 1.8, 2.5]} />
                  <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} /></mesh></group>
              </BuildingBase>

              {/* Analytics */}
              <BuildingBase position={[10, 0, -5]} label="ANALYTICS" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel="Telemetry" color="#34D399" onClick={() => onSelectModule('reports')}>
                <RoundedBox args={[4.5, 7.5, 4.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building2} roughness={0.15} metalness={0.7} />
                </RoundedBox>
                <mesh position={[0, 4.2, 0]}><cylinderGeometry args={[0.08, 0.08, 2, 8]} />
                  <meshStandardMaterial color="#34D399" emissive="#34D399" emissiveIntensity={1} /></mesh>
              </BuildingBase>

              {/* Audit */}
              <BuildingBase position={[0, 0, -10]} label="AUDIT CENTER" textColor={c.textColor} tooltipBg={c.tooltipBg} tooltipOpacity={c.tooltipOpacity}
                sublabel="Logs" color="#94A3B8" onClick={() => onSelectModule('logs')}>
                <RoundedBox args={[6, 3, 4.5]} radius={0.3} smoothness={4} castShadow receiveShadow>
                  <meshStandardMaterial color={c.building1} roughness={0.3} metalness={0.5} />
                </RoundedBox>
              </BuildingBase>
            </>
          )}
        </ThemeColors>
        <OrbitControls maxPolarAngle={Math.PI / 2.2} minDistance={12} maxDistance={55} />
      </Canvas>
    </div>
  );
};
