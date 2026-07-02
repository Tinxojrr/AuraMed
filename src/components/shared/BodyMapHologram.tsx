import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomOut } from 'lucide-react';
import './BodyMap.css';

const HOTSPOTS = [
  // FRONT VIEW (Left side, approx X=18%)
  // Adjusted X slightly inward because 12% might be too close to edge depending on screen width.
  { id: 'cabeza', name: 'Cabeza / Rostro', top: '8%', left: '18%' },
  { id: 'cuello', name: 'Cuello', top: '14%', left: '18%' },
  { id: 'pecho', name: 'Pecho / Tórax', top: '22%', left: '18%' },
  { id: 'abdomen', name: 'Abdomen', top: '35%', left: '18%' },
  { id: 'pelvis', name: 'Pelvis', top: '45%', left: '18%' },
  
  { id: 'hombro_der', name: 'Hombro Derecho', top: '18%', left: '8%' },
  { id: 'brazo_der', name: 'Brazo Derecho', top: '32%', left: '5%' },
  { id: 'mano_der', name: 'Mano Derecha', top: '48%', left: '3%' },
  
  { id: 'hombro_izq', name: 'Hombro Izquierdo', top: '18%', left: '28%' },
  { id: 'brazo_izq', name: 'Brazo Izquierdo', top: '32%', left: '31%' },
  { id: 'mano_izq', name: 'Mano Izquierda', top: '48%', left: '33%' },

  { id: 'muslo_der', name: 'Muslo Derecho', top: '58%', left: '14%' },
  { id: 'pantorrilla_der', name: 'Pierna Derecha', top: '75%', left: '14%' },
  { id: 'pie_der', name: 'Pie Derecho', top: '92%', left: '13%' },

  { id: 'muslo_izq', name: 'Muslo Izquierdo', top: '58%', left: '22%' },
  { id: 'pantorrilla_izq', name: 'Pierna Izquierda', top: '75%', left: '22%' },
  { id: 'pie_izq', name: 'Pie Izquierdo', top: '92%', left: '23%' },

  // BACK VIEW (Right side, approx X=82%)
  { id: 'nuca', name: 'Nuca', top: '8%', left: '82%' },
  { id: 'espalda_alta', name: 'Espalda Alta', top: '22%', left: '82%' },
  { id: 'lumbar', name: 'Zona Lumbar', top: '35%', left: '82%' },
  { id: 'gluteos', name: 'Glúteos', top: '45%', left: '82%' },

  { id: 'hombro_izq_espalda', name: 'Hombro Izquierdo', top: '18%', left: '72%' },
  { id: 'brazo_izq_espalda', name: 'Brazo Izquierdo', top: '32%', left: '69%' },
  { id: 'mano_izq_espalda', name: 'Mano Izquierda', top: '48%', left: '67%' },

  { id: 'hombro_der_espalda', name: 'Hombro Derecho', top: '18%', left: '92%' },
  { id: 'brazo_der_espalda', name: 'Brazo Derecho', top: '32%', left: '95%' },
  { id: 'mano_der_espalda', name: 'Mano Derecha', top: '48%', left: '97%' },

  { id: 'muslo_izq_espalda', name: 'Muslo Izquierdo', top: '58%', left: '78%' },
  { id: 'pantorrilla_izq_espalda', name: 'Pierna Izquierda', top: '75%', left: '78%' },
  
  { id: 'muslo_der_espalda', name: 'Muslo Derecho', top: '58%', left: '86%' },
  { id: 'pantorrilla_der_espalda', name: 'Pierna Derecha', top: '75%', left: '86%' },
];

export default function BodyMapHologram({ selected = [], onChange }) {
  const [hovered, setHovered] = useState(null);
  const [zoomedPoint, setZoomedPoint] = useState(null);
  
  const containerRef = useRef(null);

  const toggleZona = (e, id) => {
    e.stopPropagation(); // Evitar click en el fondo
    
    // Si la zona ya está seleccionada, la quitamos
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
      if (zoomedPoint && zoomedPoint.id === id) {
        setZoomedPoint(null); // Quitamos zoom si deseleccionamos la que enfocamos
      }
    } else {
      onChange([...selected, id]);
      
      // Aplicar zoom a la nueva zona
      const hp = HOTSPOTS.find(h => h.id === id);
      if (hp) setZoomedPoint(hp);
    }
  };

  const getZoomTransform = () => {
    if (!zoomedPoint) return { scale: 1, x: 0, y: 0 };

    // Convert % to decimal
    const topPx = parseFloat(zoomedPoint.top) / 100;
    const leftPx = parseFloat(zoomedPoint.left) / 100;

    // Calcular desplazamiento para centrar el punto
    // scale de 2.0 significa que la imagen es mas grande.
    const scale = 2.0;
    const x = (0.5 - leftPx) * 100 * scale;
    const y = (0.5 - topPx) * 100 * scale;

    return { scale, x: `${x}%`, y: `${y}%` };
  };

  const zoomStyle = getZoomTransform();

  return (
    <div 
      className="bodymap-container" 
      style={{ 
        position: 'relative', 
        height: '600px', 
        width: '100%', 
        background: '#020617', 
        borderRadius: '1rem', 
        overflow: 'hidden',
        border: '1px solid #1E293B',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)' 
      }}
      onClick={() => setZoomedPoint(null)} // Click fuera = quita zoom
    >
      
      {/* Contenedor animado de la imagen */}
      <motion.div 
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        animate={{ 
          scale: zoomStyle.scale, 
          x: zoomStyle.x, 
          y: zoomStyle.y 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        <img 
          src="/hologram-body.png" 
          alt="Holograma Médico Frontal y Dorsal" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, mixBlendMode: 'screen' }}
          draggable="false"
        />
        
        {/* Hotspots */}
        {HOTSPOTS.map((h) => {
          const isSelected = selected.includes(h.id);
          const isHovered = hovered === h.id;
          const isFocused = zoomedPoint && zoomedPoint.id === h.id;

          return (
            <div
              key={h.id}
              onClick={(e) => toggleZona(e, h.id)}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'absolute',
                top: h.top,
                left: h.left,
                width: '32px',
                height: '32px',
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: isSelected ? 20 : 10
              }}
            >
              {/* Círculo base */}
              <div style={{
                width: isHovered || isSelected ? '18px' : '10px',
                height: isHovered || isSelected ? '18px' : '10px',
                borderRadius: '50%',
                backgroundColor: isSelected ? '#EF4444' : (isHovered ? '#60A5FA' : '#3B82F6'),
                boxShadow: `0 0 15px ${isSelected ? '#EF4444' : '#3B82F6'}`,
                transition: 'all 0.3s ease',
              }} />

              {/* Efecto ping si está seleccionado */}
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid #EF4444'
                  }}
                />
              )}
            </div>
          )
        })}
      </motion.div>

      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none', zIndex: 30 }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></span>
          Escáner Biométrico IA
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
          {hovered ? (HOTSPOTS.find(h => h.id === hovered)?.name || '') : 'Toca cualquier zona para seleccionarla'}
        </p>
      </div>

      {/* Botón de Reset Zoom */}
      <AnimatePresence>
        {zoomedPoint && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={(e) => { e.stopPropagation(); setZoomedPoint(null); }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '99px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              zIndex: 30,
              backdropFilter: 'blur(8px)'
            }}
          >
            <ZoomOut size={16} /> Alejar cámara
          </motion.button>
        )}
      </AnimatePresence>

      {/* Selected Pills Overlay */}
      {selected.length > 0 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', zIndex: 30 }}>
          {selected.map(id => {
            const h = HOTSPOTS.find(hp => hp.id === id);
            const name = h ? h.name : id;
            return (
              <span key={id} style={{ 
                background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #EF4444', color: '#FECACA', 
                padding: '6px 12px', borderRadius: '99px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
              }}>
                {name}
                <button 
                  type="button" 
                  onClick={(e) => toggleZona(e, id)}
                  style={{ background: 'none', border: 'none', color: '#FECACA', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              </span>
            )
          })}
        </div>
      )}
      
      {/* Decorative Grid Lines */}
      <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '25%', width: '1px', height: '100%', background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.1), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '75%', width: '1px', height: '100%', background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.1), transparent)', pointerEvents: 'none' }} />
    </div>
  );
}
