import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Activity, Clock, HeartPulse, CheckCircle, Shield, AlertCircle } from 'lucide-react'
import { obtenerTriajePorId, suscribirTriajes } from '@/services/supabase'
import './FamilyTracker.css'

const STEPS = [
  { id: 'en_espera', label: 'En Sala de Espera', icon: Clock },
  { id: 'en_consulta', label: 'En Consulta Médica', icon: Activity },
  { id: 'atendido', label: 'Dado de Alta / Obs.', icon: CheckCircle },
]

export default function FamilyTracker() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await obtenerTriajePorId(id)
        setTicket(data)
      } catch (err) {
        console.error(err)
        setError('Enlace inválido o expirado.')
      } finally {
        setLoading(false)
      }
    }
    loadTicket()
  }, [id])

  useEffect(() => {
    if (!id) return;
    const canal = suscribirTriajes((payload) => {
      if (payload.new && String(payload.new.id) === String(id)) {
        setTicket(prev => ({ ...prev, ...payload.new }))
      }
    });

    return () => { canal.unsubscribe() };
  }, [id])

  if (loading) {
    return (
      <div className="tracker-page">
        <div className="tracker-skeleton pulse-anim"></div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="tracker-page">
        <div className="tracker-error">
          <AlertCircle size={48} />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Lógica de progreso
  const currentStepIndex = STEPS.findIndex(s => s.id === ticket.estado)
  const progressPercentage = currentStepIndex === 0 ? 10 : currentStepIndex === 1 ? 50 : 100

  // Ocultar nombre completo por privacidad (ej. "Juan P.")
  const nombreCorto = ticket.paciente_nombre 
    ? ticket.paciente_nombre.split(' ')[0] + (ticket.paciente_nombre.split(' ')[1] ? ' ' + ticket.paciente_nombre.split(' ')[1].charAt(0) + '.' : '')
    : 'Paciente'

  return (
    <div className="tracker-page fade-in-up">
      <div className="tracker-container">
        
        {/* Cabecera */}
        <div className="tracker-header">
          <HeartPulse size={40} className="tracker-logo" />
          <h1>AuraMed Family</h1>
          <p className="tracker-subtitle">Seguimiento en tiempo real</p>
        </div>

        {/* Tarjeta Principal */}
        <div className="tracker-card">
          <div className="tracker-privacy-badge">
            <Shield size={14} /> Conexión Privada
          </div>
          
          <h2 className="tracker-patient">Paciente: {nombreCorto}</h2>
          <p className="tracker-meta">Ingreso: {new Date(ticket.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>

          {/* Barra de Progreso */}
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${ticket.estado === 'atendido' ? 'completed' : 'active'}`} 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <div className="progress-steps">
              {STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex
                const isActive = idx === currentStepIndex
                const Icon = step.icon
                
                return (
                  <div key={step.id} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'current' : ''}`}>
                    <div className="step-icon-wrapper">
                      <Icon size={20} className="step-icon" />
                    </div>
                    <span className="step-label">{step.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mensaje de estado dinámico */}
          <div className="tracker-status-message">
            {ticket.estado === 'en_espera' && (
              <p>Tu familiar se encuentra esperando su turno. Tiempo estimado: <strong>{ticket.tiempo_espera_estimado} min</strong>.</p>
            )}
            {ticket.estado === 'en_consulta' && (
              <p className="pulse-text" style={{ color: '#F59E0B' }}>
                Tu familiar está siendo atendido por un médico en este momento.
              </p>
            )}
            {ticket.estado === 'atendido' && (
              <p style={{ color: '#10B981' }}>
                ¡La atención ha finalizado! Por favor dirígete a la sala de recepción médica.
              </p>
            )}
          </div>
        </div>

        <div className="tracker-footer-note">
          <p>Por políticas de privacidad (Ley de Derechos del Paciente), no se muestran diagnósticos ni información clínica en este enlace.</p>
        </div>
      </div>
    </div>
  )
}
