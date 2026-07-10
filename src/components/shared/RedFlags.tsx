import { AlertTriangle } from 'lucide-react'
import './RedFlags.css'

export const RED_FLAGS = [
  { id: 'hipertension', label: 'Hipertensión', icon: '🫀', desc: 'Presión arterial alta crónica' },
  { id: 'asma', label: 'Asma / EPOC', icon: '🫁', desc: 'Dificultad respiratoria crónica' },
  { id: 'diabetico', label: 'Diabético', icon: '💉', desc: 'Diabetes mellitus tipo 1 o 2' },
  { id: 'obesidad', label: 'Obesidad', icon: '⚖️', desc: 'IMC > 35' },
  { id: 'inmunodeprimido', label: 'Inmunodeprimido', icon: '🛡️', desc: 'VIH, quimioterapia, corticoides crónicos' },
  { id: 'anticoagulado', label: 'Anticoagulado', icon: '💊', desc: 'Warfarina, heparina, etc.' },
  { id: 'alergia_severa', label: 'Alergia Severa', icon: '🥜', desc: 'Riesgo de anafilaxia' },
  { id: 'embarazo', label: 'Embarazo', icon: '🤰', desc: 'Paciente gestante' },
]

// ─── Lógica de cortocircuito ────────────────────────────────
// Si alguna combinación crítica se detecta → URGENCIA directa
const PALABRAS_CRITICAS = [
  'pecho', 'corazón', 'infarto', 'respirar', 'dificultad respiratoria',
  'desmayo', 'pérdida de consciencia', 'sangrado', 'hemorragia',
  'fiebre', 'dolor abdominal', 'cabeza', 'visión', 'brazo', 'entumecido'
]

export function evaluarRedFlags(flags, sintomas, evaScore) {
  const hayFlags     = flags.length > 0
  const sintomasLow  = sintomas.toLowerCase()
  const palabraMatch = PALABRAS_CRITICAS.some(p => sintomasLow.includes(p))
  const dolorAlto    = evaScore >= 8

  // Cortocircuito: flag activa + síntoma crítico o dolor extremo
  if (hayFlags && (palabraMatch || dolorAlto)) {
    const razon = []
    
    // Mapear TODOS los flags activos a sus etiquetas correspondientes
    flags.forEach(flagId => {
      const found = RED_FLAGS.find(f => f.id === flagId)
      if (found) razon.push(`paciente con ${found.label.toLowerCase()}`)
    })
    
    if (dolorAlto) razon.push(`dolor EVA ${evaScore}/10`)
    
    // Si por alguna razón está vacío, poner un fallback
    const razonFinal = razon.length > 0 ? razon.join(', ') : 'factores de riesgo críticos'

    return {
      esUrgenciaDirecta: true,
      razon: razonFinal,
    }
  }

  return { esUrgenciaDirecta: false }
}

export default function RedFlags({ selected, onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(f => f !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="redflags-wrapper">
      <div className="redflags-title">
        <AlertTriangle size={15} color="#DC2626" />
        <span>Factores de riesgo</span>
      </div>

      <div className="redflags-grid">
        {RED_FLAGS.map(flag => {
          const isActive = selected.includes(flag.id)
          return (
            <button
              key={flag.id}
              type="button"
              className={`redflag-btn ${isActive ? 'active' : ''}`}
              onClick={() => toggle(flag.id)}
              title={flag.desc}
            >
              <span className="redflag-icon">{flag.icon}</span>
              <span className="redflag-label">{flag.label}</span>
              {isActive && <span className="redflag-check">✓</span>}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="redflag-warning">
          ⚠️ Factor de riesgo activo — la IA priorizará la gravedad del caso
        </p>
      )}
    </div>
  )
}
