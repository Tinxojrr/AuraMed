// @ts-nocheck
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, CameraControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { X } from 'lucide-react';
import './BodyMap.css';

const NOMBRES_ZONAS: Record<string, string> = {
  cabeza: 'Cabeza / Rostro', nuca: 'Nuca', cuello: 'Cuello', pecho: 'Pecho / Tórax',
  espalda_alta: 'Espalda Alta', abdomen: 'Abdomen', lumbar: 'Zona Lumbar', pelvis: 'Pelvis', gluteos: 'Glúteos',
  hombro_der: 'Hombro Derecho', brazo_der: 'Brazo Derecho', mano_der: 'Mano Derecha',
  hombro_izq: 'Hombro Izquierdo', brazo_izq: 'Brazo Izquierdo', mano_izq: 'Mano Izquierda',
  muslo_der: 'Muslo Derecho', pantorrilla_der: 'Pierna Derecha', pie_der: 'Pie Derecho',
  muslo_izq: 'Muslo Izquierdo', pantorrilla_izq: 'Pierna Izquierda', pie_izq: 'Pie Izquierdo',
};

// Coordenadas calibradas para el modelo escalado exactamente a 1.8m (Xbot Pose T)
const HOTSPOTS = [
  // Eje central
  { id: 'cabeza', pos: [0, 1.65, 0.1] },
  { id: 'nuca', pos: [0, 1.65, -0.1] },
  { id: 'cuello', pos: [0, 1.55, 0.1] },
  { id: 'pecho', pos: [0, 1.42, 0.13] },
  { id: 'espalda_alta', pos: [0, 1.42, -0.13] },
  { id: 'abdomen', pos: [0, 1.25, 0.14] },
  { id: 'lumbar', pos: [0, 1.25, -0.14] },
  { id: 'pelvis', pos: [0, 1.05, 0.1] },
  { id: 'gluteos', pos: [0, 1.05, -0.14] },
  
  // Brazos (Pose T estricta)
  { id: 'hombro_izq', pos: [0.2, 1.42, 0] },
  { id: 'brazo_izq', pos: [0.45, 1.42, 0] },
  { id: 'mano_izq', pos: [0.75, 1.42, 0] },
  { id: 'hombro_der', pos: [-0.2, 1.42, 0] },
  { id: 'brazo_der', pos: [-0.45, 1.42, 0] },
  { id: 'mano_der', pos: [-0.75, 1.42, 0] },

  // Piernas (Piernas largas del modelo)
  { id: 'muslo_izq', pos: [0.12, 0.75, 0.05] },
  { id: 'pantorrilla_izq', pos: [0.12, 0.35, 0.05] },
  { id: 'pie_izq', pos: [0.15, 0.05, 0.15] },
  { id: 'muslo_der', pos: [-0.12, 0.75, 0.05] },
  { id: 'pantorrilla_der', pos: [-0.12, 0.35, 0.05] },
  { id: 'pie_der', pos: [-0.15, 0.05, 0.15] },
];

// ==========================================
// CONFIGURACIÓN DE CÁMARA Y CONTROLES
// ==========================================
const DEFAULT_CAM_POS = [0, 0.9, 5.2]; // Cámara ligeramente más alejada para que los brazos no rocen los bordes
const DEFAULT_CAM_TARGET = [0, 0.9, 0];

useGLTF.preload('/Xbot.glb');

function MannequinModel() {
  const { scene } = useGLTF('/Xbot.glb');
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Calcular el tamaño original del modelo
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Escalar dinámicamente para que mida exactamente 1.8 de alto
    const scaleFactor = 1.8 / size.y;
    clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // Recalcular el bounding box después de escalar
    const newBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    newBox.getCenter(center);
    
    // Centrar en X/Z y poner los pies exactamente en Y=0
    clone.position.x = -center.x;
    clone.position.y = -newBox.min.y; 
    clone.position.z = -center.z;

    // Aplicar textura holográfica
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: '#1E3A8A',
          emissive: '#0B2252',
          transmission: 0.9,
          opacity: 0.8,
          transparent: true,
          roughness: 0.1,
          metalness: 0.5,
          wireframe: true,
        });
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

function HotspotNode({ id, pos, selected, hovered, onClick, onPointerOver, onPointerOut }) {
  const isSelected = selected.includes(id);
  const isHovered = hovered === id;

  const color = isSelected ? '#EF4444' : '#3B82F6';
  const glowColor = isSelected ? '#EF4444' : '#60A5FA';

  return (
    <group
      position={pos}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      onPointerOver={(e) => { document.body.style.cursor = 'pointer'; e.stopPropagation(); onPointerOver(id); }}
      onPointerOut={(e) => { document.body.style.cursor = 'auto'; e.stopPropagation(); onPointerOut(); }}
    >
      {/* Hitbox gigante invisible para facilitar tocar en pantallas táctiles */}
      <mesh>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Puntito central muy sutil y elegante */}
      <mesh>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Halo brillante estático suave */}
      <mesh>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Anillo de alta tecnología (Torus) que aparece al seleccionar o pasar el mouse */}
      {(isSelected || isHovered) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.002, 16, 32]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Segundo anillo más grande para seleccionados */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.001, 16, 32]} />
          <meshBasicMaterial color="#EF4444" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Tooltip con nombre */}
      {isHovered && !isSelected && (
        <Html position={[0, 0.08, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.9)', 
            color: 'white', 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            whiteSpace: 'nowrap', 
            border: '1px solid #3B82F6',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            {NOMBRES_ZONAS[id]}
          </div>
        </Html>
      )}
    </group>
  );
}

function SceneController({ focusedPart }) {
  const controlsRef = useRef<any>();

  useEffect(() => {
    if (!controlsRef.current) return;
    
    if (focusedPart) {
      const part = HOTSPOTS.find(h => h.id === focusedPart);
      if (part) {
        const [x, y, z] = part.pos;
        const offsetZ = z >= 0 ? 2.5 : -2.5; 
        
        controlsRef.current.setLookAt(
          x, y + 0.1, z + offsetZ,
          x, y, z,
          true
        );
      }
    } else {
      controlsRef.current.setLookAt(
        DEFAULT_CAM_POS[0], DEFAULT_CAM_POS[1], DEFAULT_CAM_POS[2],
        DEFAULT_CAM_TARGET[0], DEFAULT_CAM_TARGET[1], DEFAULT_CAM_TARGET[2],
        true
      );
    }
  }, [focusedPart]);

  return (
    <CameraControls 
      ref={controlsRef} 
      makeDefault 
      minDistance={0.5} 
      maxDistance={6}
      maxPolarAngle={Math.PI / 1.5}
    />
  );
}

export default function BodyMap3DReal({ selected = [], onChange }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const focusedPart = selected.length > 0 ? selected[selected.length - 1] : null;

  const toggleZona = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="bodymap-container" style={{ position: 'relative', height: '600px', width: '100%', background: '#020617', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #1E293B', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)' }}>
      <Canvas 
        camera={{ position: DEFAULT_CAM_POS as [number, number, number], fov: 30 }} 
        onPointerMissed={() => setHovered(null)}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={2} color="#3B82F6" />
        <pointLight position={[-2, 1, -2]} intensity={1} color="#8B5CF6" />
        
        <SceneController focusedPart={focusedPart} />
        
        <group position={[0, 0, 0]}>
          <React.Suspense fallback={null}>
            <MannequinModel />
          </React.Suspense>
          
          {HOTSPOTS.map(h => (
            <HotspotNode 
              key={h.id} 
              id={h.id} 
              pos={h.pos} 
              selected={selected} 
              hovered={hovered}
              onClick={toggleZona}
              onPointerOver={setHovered}
              onPointerOut={() => setHovered(null)}
            />
          ))}
        </group>

        <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={4} blur={2} far={2} color="#3B82F6" />
        <Environment preset="city" />
      </Canvas>

      <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none', zIndex: 10 }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></span>
          Escáner 3D
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
          Gira el modelo 3D y toca los nodos brillantes
        </p>
      </div>

      {selected.length > 0 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', zIndex: 10 }}>
          {selected.map(id => {
            const name = NOMBRES_ZONAS[id] || id;
            return (
              <span key={id} style={{ 
                background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #EF4444', color: '#FECACA', 
                padding: '6px 12px', borderRadius: '99px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)'
              }}>
                {name}
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); toggleZona(id); }}
                  style={{ background: 'none', border: 'none', color: '#FECACA', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  );
}
