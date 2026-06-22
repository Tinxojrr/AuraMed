import { AlertTriangle } from 'lucide-react'
import './RedFlags.css'

export const RED_FLAGS = [
  {
    id: 'embarazo',
    label: 'Embarazo',
    icon: '🤰',
    desc: 'Paciente embarazada o posible embarazo',
  },
  {
    id: 'inmunodeprimido',
    label: 'Inmunodeprimido',
    icon: '🛡️',
    desc: 'VIH, quimioterapia, trasplante, corticoides crónicos',
  },
  {
    id: 'diabetico',
    label: 'Diabético',
    icon: '💉',
    desc: 'Diabetes mellitus tipo 1 o 2',
  },
  {
    id: 'anticoagulado',
    label: 'Anticoagulado',
    icon: '💊',
    desc: 'Warfarina, heparina, aspirina diaria u otros',
  },
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
    if (flags.includes('diabetico'))       razon.push('paciente diabético')
    if (flags.includes('anticoagulado'))   razon.push('paciente anticoagulado')
    if (flags.includes('inmunodeprimido')) razon.push('paciente inmunodeprimido')
    if (flags.includes('embarazo'))        razon.push('paciente embarazada')
    if (dolorAlto)                         razon.push(`dolor EVA ${evaScore}/10`)

    return {
      esUrgenciaDirecta: true,
      razon: razon.join(', '),
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
