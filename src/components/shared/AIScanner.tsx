import { useEffect, useState } from 'react'
import './AIScanner.css'

const MESSAGES = [
  'Analizando síntomas reportados...',
  'Evaluando patrones clínicos...',
  'Consultando base de conocimiento médico...',
  'Clasificando nivel de urgencia...',
  'Determinando especialidad recomendada...',
  'Generando recomendaciones...',
]

export default function AIScanner() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length)
    }, 1400)

    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12, 92))
    }, 400)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progInterval)
    }
  }, [])

  return (
    <div className="scanner-overlay">
      <div className="scanner-card">

        {/* Icono animado */}
        <div className="scanner-icon">
          <div className="scanner-ring ring-1" />
          <div className="scanner-ring ring-2" />
          <div className="scanner-ring ring-3" />
          <span className="scanner-emoji">⚕</span>
        </div>

        <h3 className="scanner-title">IA analizando caso clínico</h3>

        {/* Barra de progreso */}
        <div className="scanner-progress-track">
          <div className="scanner-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Mensaje rotativo */}
        <p className="scanner-message" key={msgIndex}>
          {MESSAGES[msgIndex]}
        </p>

        {/* Líneas de código simuladas */}
        <div className="scanner-lines">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="scanner-line" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>

      </div>
    </div>
  )
}
