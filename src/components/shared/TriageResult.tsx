import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, AlertTriangle, AlertCircle, Clock, Stethoscope, ChevronRight, RotateCcw } from 'lucide-react'
import './TriageResult.css'

const PRIORITY_CONFIG = {
  URGENCIA: {
    label: 'Urgencia',
    icon: AlertCircle,
    color: 'var(--color-urgencia)',
    bg: 'var(--color-urgencia-bg)',
    desc: 'Requiere atención inmediata',
  },
  PRIORITARIO: {
    label: 'Prioritario',
    icon: AlertTriangle,
    color: 'var(--color-prioritario)',
    bg: 'var(--color-prioritario-bg)',
    desc: 'Atención en menos de 2 horas',
  },
  GENERAL: {
    label: 'General',
    icon: CheckCircle,
    color: 'var(--color-general)',
    bg: 'var(--color-general-bg)',
    desc: 'Turno normal de atención',
  },
}

export default function TriageResult({ result, paciente, onReset }) {
  const config = PRIORITY_CONFIG[result.prioridad] || PRIORITY_CONFIG.GENERAL
  const Icon   = config.icon
  const isUrgencia = result.prioridad === 'URGENCIA'

  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${__LOCAL_IP__}:${window.location.port}`
    : window.location.origin

  const qrData = result.id ? `${baseUrl}/ticket/${result.id}` : baseUrl

  return (
    <div className="result-wrapper fade-in-up">

      {/* Cabecera de prioridad */}
      <div className={`result-header ${isUrgencia ? 'pulse-urgencia' : ''}`}
           style={{ background: config.bg, borderColor: config.color }}>
        <Icon size={32} color={config.color} />
        <div>
          <h2 style={{ color: config.color }}>{config.label}</h2>
          <p style={{ color: config.color, opacity: 0.8 }}>{config.desc}</p>
        </div>
        <div className="result-turno" style={{ color: config.color, borderColor: config.color }}>
          <span className="turno-label">Turno</span>
          <span className="turno-num">#{result.numero_turno || 0}</span>
        </div>
      </div>

      <div className="result-body">
        <div className="result-main">

          {/* Resumen clínico */}
          <section className="result-section">
            <h3>Resumen clínico</h3>
            <p className="result-summary">{result.resumen}</p>
          </section>

          {/* Especialidad + tiempo */}
          <div className="result-meta">
            <div className="meta-card">
              <Stethoscope size={18} color="var(--color-primary)" />
              <div>
                <span className="meta-label">Especialidad recomendada</span>
                <span className="meta-value">{result.especialidad}</span>
              </div>
            </div>
            <div className="meta-card">
              <Clock size={18} color="var(--color-primary)" />
              <div>
                <span className="meta-label">Tiempo de espera estimado</span>
                <span className="meta-value">{result.tiempo_espera_estimado} min</span>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          {result.recomendaciones?.length > 0 && (
            <section className="result-section">
              <h3>Recomendaciones mientras espera</h3>
              <ul className="result-list">
                {result.recomendaciones.map((r, i) => (
                  <li key={i}>
                    <ChevronRight size={14} color="var(--color-primary)" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Preguntas para el médico */}
          {result.preguntas_seguimiento?.length > 0 && (
            <section className="result-section">
              <h3>El médico preguntará sobre</h3>
              <ul className="result-list secondary">
                {result.preguntas_seguimiento.map((p, i) => (
                  <li key={i}>
                    <ChevronRight size={14} color="var(--text-muted)" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Nivel de confianza IA */}
          <div className="result-confidence">
            <span>Confianza del análisis IA</span>
            <div className="confidence-track">
              <div
                className="confidence-bar"
                style={{ width: `${Math.round((result.nivel_confianza || 0.85) * 100)}%` }}
              />
            </div>
            <span>{Math.round((result.nivel_confianza || 0.85) * 100)}%</span>
          </div>
        </div>

        {/* QR del turno */}
        <aside className="result-qr">
          <h3>Tu código de turno</h3>
          <div className="qr-box">
            <QRCodeSVG value={qrData} size={140} level="M" />
          </div>
          <p className="qr-name">{paciente.nombre}</p>
          <p className="qr-hint">Muestra este código en recepción</p>
        </aside>
      </div>

      {/* Acción de reinicio */}
      <div className="result-actions">
        <button className="btn-reset" onClick={onReset}>
          <RotateCcw size={16} />
          Nuevo triaje
        </button>
      </div>
    </div>
  )
}
