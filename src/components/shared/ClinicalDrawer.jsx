import { useState } from 'react'
import { X, Activity, Bot, FileText, CheckCircle, Clock } from 'lucide-react'
import './ClinicalDrawer.css'

const PRIORITY_COLORS = {
  URGENCIA:    { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  PRIORITARIO: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  GENERAL:     { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
}

export default function ClinicalDrawer({ paciente, onClose, onFinalizar }) {
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (!paciente) return null

  const config = PRIORITY_COLORS[paciente.prioridad] || PRIORITY_COLORS.GENERAL

  const handleFinalizar = async () => {
    setGuardando(true)
    // Aquí en el futuro guardaríamos las 'notas' en Supabase antes de cerrar
    await onFinalizar(paciente.id, 'atendido')
    setGuardando(false)
  }

  return (
    <>
      {/* Fondo oscuro interactivo */}
      <div className="drawer-overlay" onClick={onClose} />
      
      {/* Panel lateral */}
      <div className="drawer-panel">
        
        {/* Cabecera */}
        <div className="drawer-header">
          <div>
            <div className="drawer-badge" style={{ background: config.bg, color: config.color }}>
              <Activity size={14} />
              {paciente.prioridad}
            </div>
            <h2>{paciente.paciente_nombre}</h2>
            <p className="drawer-meta">
              RUT: {paciente.paciente_rut || 'No registrado'} • Ingreso: {new Date(paciente.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button className="btn-close-drawer" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          
          {/* Sección 1: Lo que dijo el paciente */}
          <div className="clinical-section">
            <h3 className="section-title">
              <FileText size={16} /> Motivo de Consulta (Textual)
            </h3>
            <div className="clinical-box patient-text">
              "{paciente.sintomas_texto}"
            </div>
          </div>

          {/* Sección 2: El Cerebro de AuraMed (XAI) */}
          <div className="clinical-section">
            <h3 className="section-title ai-title">
              <Bot size={16} /> Razonamiento IA
            </h3>
            <div className="clinical-box ai-box">
              <p className="ai-summary">{paciente.resumen_clinico || 'Sin resumen generado por IA.'}</p>
              
              {/* Aquí simularemos las "Red Flags" y preguntas que la IA sugiere al médico */}
              <div className="ai-suggestions">
                <strong>Sugerencias para el interrogatorio:</strong>
                <ul>
                  <li>¿El dolor aumenta al palpar la zona?</li>
                  <li>¿Ha presentado fiebre en las últimas 12 horas?</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sección 3: El espacio de trabajo del Doctor */}
          <div className="clinical-section">
            <h3 className="section-title">
              <Activity size={16} /> Evolución Clínica
            </h3>
            <textarea 
              className="doctor-notes"
              placeholder="Escriba aquí el examen físico, diagnóstico y tratamiento indicado..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

        </div>

        {/* Footer con el llamado a la acción */}
        <div className="drawer-footer">
          <button className="btn-secondary" onClick={onClose}>
            Mantener en consulta
          </button>
          <button 
            className="btn-primary" 
            onClick={handleFinalizar}
            disabled={guardando}
          >
            <CheckCircle size={18} />
            {guardando ? 'Guardando...' : 'Dar de alta (Atendido)'}
          </button>
        </div>

      </div>
    </>
  )
}