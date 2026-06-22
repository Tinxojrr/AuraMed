import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Clock, AlertCircle, AlertTriangle, CheckCircle, Stethoscope, ChevronDown } from 'lucide-react'
import { obtenerTriajePorId } from '@/services/supabase'
import './PatientTicket.css'

const PRIORITY_CONFIG = {
  URGENCIA: { label: 'Urgencia', icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', desc: 'Atención inmediata' },
  PRIORITARIO: { label: 'Prioritario', icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', desc: '< 2 horas' },
  GENERAL: { label: 'General', icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', desc: 'Turno normal' },
}

export default function PatientTicket() {
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
        setError('No pudimos encontrar tu ticket.')
      } finally {
        setLoading(false)
      }
    }
    loadTicket()
  }, [id])

  if (loading) {
    return (
      <div className="ticket-page">
        <div className="ticket-skeleton pulse-anim"></div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="ticket-page">
        <div className="ticket-error">
          <AlertCircle size={48} />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const config = PRIORITY_CONFIG[ticket.prioridad] || PRIORITY_CONFIG.GENERAL
  const Icon = config.icon

  // El QR para recepción puede contener el ID o los datos básicos
  const qrData = JSON.stringify({
    id: ticket.id,
    nombre: ticket.paciente_nombre,
    prioridad: ticket.prioridad,
    fecha: new Date(ticket.created_at).toLocaleString('es-CL'),
  })

  // Generamos un número de turno pseudo-aleatorio basado en el ID para mantenerlo consistente
  const turnoNumber = ticket.id ? parseInt(ticket.id.toString().replace(/[^0-9]/g, '').slice(-3) || '0') + 1 : 42;

  return (
    <div className="ticket-page">
      <div className="ticket-container fade-in-up">
        
        {/* Marca / Header */}
        <div className="ticket-brand">
          <div className="brand-logo">⚕</div>
          <h1>AuraMed</h1>
          <p>Ticket Digital</p>
        </div>

        {/* Tarjeta Principal (Wallet Pass) */}
        <div className="ticket-card">
          
          {/* Sección Superior: Prioridad */}
          <div className="ticket-header" style={{ background: config.bg, borderColor: config.color }}>
            <Icon size={28} color={config.color} className={ticket.prioridad === 'URGENCIA' ? 'pulse-urgencia' : ''} />
            <div className="ticket-priority-info">
              <h2 style={{ color: config.color }}>{config.label}</h2>
              <span style={{ color: config.color, opacity: 0.8 }}>{config.desc}</span>
            </div>
            <div className="ticket-turn" style={{ color: config.color, borderColor: config.color }}>
              <span>Turno</span>
              <strong>#{turnoNumber}</strong>
            </div>
          </div>

          <div className="ticket-cutout">
            <div className="cutout-left"></div>
            <div className="cutout-right"></div>
            <div className="cutout-line"></div>
          </div>

          {/* Sección Media: Datos del Paciente */}
          <div className="ticket-body">
            <div className="info-group">
              <label>Paciente</label>
              <h3>{ticket.paciente_nombre}</h3>
            </div>
            
            <div className="info-row">
              <div className="info-group">
                <label><Stethoscope size={14} /> Especialidad</label>
                <p>{ticket.especialidad_recomendada || 'Medicina General'}</p>
              </div>
              <div className="info-group text-right">
                <label><Clock size={14} /> Espera aprox.</label>
                <p className="wait-time">{ticket.tiempo_espera_estimado} min</p>
              </div>
            </div>
            
            <div className="info-group">
              <label>Motivo de atención</label>
              <p className="clinical-summary">{ticket.resumen_clinico || 'Evaluación inicial requerida'}</p>
            </div>
          </div>

          <div className="ticket-cutout">
            <div className="cutout-left"></div>
            <div className="cutout-right"></div>
            <div className="cutout-line"></div>
          </div>

          {/* Sección Inferior: Código QR */}
          <div className="ticket-footer">
            <p className="qr-instructions">Muestra este código en recepción</p>
            <div className="qr-wrapper">
              <QRCodeSVG value={qrData} size={160} level="M" />
            </div>
            <p className="qr-date">{new Date(ticket.created_at).toLocaleString('es-CL')}</p>
          </div>

        </div>

        {/* Scroll indicator o info adicional */}
        <div className="ticket-bottom-info">
          <ChevronDown size={20} className="bounce" />
          <p>Desliza para más detalles</p>
        </div>

      </div>
    </div>
  )
}
