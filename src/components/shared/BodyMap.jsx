import { useState } from 'react'
import { RotateCw, X } from 'lucide-react'
import './BodyMap.css'

const NOMBRES_ZONAS = {
  cabeza: 'Cabeza / Rostro',
  nuca: 'Nuca / Cuello posterior',
  cuello: 'Cuello anterior',
  pecho: 'Pecho / Tórax',
  espalda_alta: 'Espalda Alta',
  abdomen: 'Abdomen / Zona Estomacal',
  lumbar: 'Zona Lumbar / Espalda baja',
  pelvis: 'Pelvis / Zona Inguinal',
  gluteos: 'Glúteos',
  hombro_der: 'Hombro Derecho',
  hombro_izq: 'Hombro Izquierdo',
  brazo_der: 'Brazo Derecho',
  brazo_izq: 'Brazo Izquierdo',
  mano_der: 'Mano Derecha',
  mano_izq: 'Mano Izquierda',
  muslo_der: 'Muslo Derecho',
  muslo_izq: 'Muslo Izquierdo',
  pantorrilla_der: 'Pierna Derecha / Gemelo',
  pantorrilla_izq: 'Pierna Izquierda / Gemelo',
  pie_der: 'Pie Derecho',
  pie_izq: 'Pie Izquierdo'
}

// Trazados vectoriales orgánicos de alta fidelidad anatómica
const getZonasAnatomicas = (vista) => {
  const f = vista === 'frente'
  return [
    // EJE CENTRAL
    { id: f ? 'cabeza' : 'nuca', d: 'M100,14 C113,14 121,22 120,36 C119,48 111,55 100,56 C89,55 81,48 80,36 C79,22 87,14 100,14 Z' },
    { id: 'cuello', d: 'M92,55 C92,55 90,66 93,70 C95,71 105,71 107,70 C110,66 108,55 108,55 Z' },
    { id: f ? 'pecho' : 'espalda_alta', d: 'M73,70 C82,68 118,68 127,70 C132,88 129,102 125,116 C111,118 89,118 75,116 C71,102 68,88 73,70 Z' },
    { id: f ? 'abdomen' : 'lumbar', d: 'M75,116 C89,118 111,118 125,116 C127,132 129,146 125,160 C111,162 89,162 75,160 C71,146 73,132 75,116 Z' },
    { id: f ? 'pelvis' : 'gluteos', d: 'M75,160 C89,162 111,162 125,160 C128,172 123,188 117,192 C108,194 92,194 83,192 C77,188 72,172 75,160 Z' },

    // EXTREMIDADES SUPERIORES IZQUIERDAS DE LA PANTALLA (Frente = Derecho del paciente)
    { id: f ? 'hombro_der' : 'hombro_izq', d: 'M73,70 C66,70 56,72 51,78 C47,84 49,92 53,98 C57,93 65,81 73,71 Z' },
    { id: f ? 'brazo_der' : 'brazo_izq', d: 'M53,98 C49,110 46,125 46,140 C50,142 56,140 59,138 C59,122 61,108 55,98 Z' },
    { id: f ? 'mano_der' : 'mano_izq', d: 'M46,140 C44,148 42,158 45,166 C49,168 54,162 56,155 C59,148 58,141 46,140 Z' },

    // EXTREMIDADES SUPERIORES DERECHAS DE LA PANTALLA (Frente = Izquierdo del paciente)
    { id: f ? 'hombro_izq' : 'hombro_der', d: 'M127,70 C134,70 144,72 149,78 C153,84 151,92 147,98 C143,93 135,81 127,71 Z' },
    { id: f ? 'brazo_izq' : 'brazo_der', d: 'M147,98 C151,110 154,125 154,140 C150,142 144,140 141,138 C141,122 139,108 145,98 Z' },
    { id: f ? 'mano_izq' : 'mano_der', d: 'M154,140 C156,148 158,158 155,166 C151,168 146,162 144,155 C141,148 142,141 154,140 Z' },

    // EXTREMIDADES INFERIORES IZQUIERDAS DE LA PANTALLA
    { id: f ? 'muslo_der' : 'muslo_izq', d: 'M75,164 C83,166 98,166 98,166 L95,232 C86,232 74,224 71,210 C69,195 71,178 75,164 Z' },
    { id: f ? 'pantorrilla_der' : 'pantorrilla_izq', d: 'M74,234 C85,234 95,234 95,234 L92,298 C86,298 78,296 76,288 C73,275 72,252 74,234 Z' },
    { id: f ? 'pie_der' : 'pie_izq', d: 'M76,298 L92,298 L94,316 C88,320 78,320 73,314 C71,308 74,300 76,298 Z' },

    // EXTREMIDADES INFERIORES DERECHAS DE LA PANTALLA
    { id: f ? 'muslo_izq' : 'muslo_der', d: 'M125,164 C117,166 102,166 102,166 L105,232 C114,232 126,224 129,210 C131,195 129,178 125,164 Z' },
    { id: f ? 'pantorrilla_izq' : 'pantorrilla_der', d: 'M126,234 C115,234 105,234 105,234 L108,298 C114,298 122,296 124,288 C127,275 128,252 126,234 Z' },
    { id: f ? 'pie_izq' : 'pie_der', d: 'M124,298 L108,298 L106,316 C112,320 122,320 127,314 C129,308 126,300 124,298 Z' },
  ]
}

export default function BodyMap({ selected = [], onChange }) {
  const [vista, setVista] = useState('frente')
  const [hovered, setHovered] = useState(null)

  const toggleZona = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const zonas = getZonasAnatomicas(vista)

  return (
    <div className="bodymap-container">
      <div className="bodymap-controls">
        <span className="view-indicator">Anatomía: {vista}</span>
        <button 
          type="button" 
          className="btn-flip-view" 
          onClick={() => setVista(v => v === 'frente' ? 'atras' : 'frente')}
        >
          <RotateCw size={13} />
          {vista === 'frente' ? 'Ver Dorso' : 'Ver Frente'}
        </button>
      </div>

      <div className="svg-wrapper">
        {/* Renderizamos una cuadrícula sutil médica de fondo */}
        <div className="medical-grid" />
        
        <svg viewBox="0 0 200 335" className="bodymap-svg">
          {/* Capa de Silueta Base Realista de fondo */}
          <g className="body-silhouette-base">
            {zonas.map((z) => (
              <path key={`base-${z.id}`} d={z.d} />
            ))}
          </g>

          {/* Capa Interactiva */}
          <g className="body-interactive-layer">
            {zonas.map((z) => {
              const isSelected = selected.includes(z.id)
              const isHovered = hovered === z.id

              return (
                <path
                  key={z.id}
                  d={z.d}
                  onClick={() => toggleZona(z.id)}
                  onMouseEnter={() => setHovered(z.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`body-path ${isSelected ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                />
              )
            })}
          </g>
        </svg>
      </div>

      <div className="hover-status">
        {hovered ? (
          <span className="hover-label">{NOMBRES_ZONAS[hovered]}</span>
        ) : (
          <span className="hover-placeholder">Selecciona las zonas con molestia</span>
        )}
      </div>

      {selected.length > 0 && (
        <div className="selected-pills">
          {selected.map(id => (
            <span key={id} className="pain-pill">
              {NOMBRES_ZONAS[id] || id}
              <button type="button" onClick={() => toggleZona(id)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}