import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Clock, AlertCircle, AlertTriangle, CheckCircle, Stethoscope, ChevronDown } from 'lucide-react'
import { obtenerTriajePorId, suscribirTriajes } from '@/services/supabase'
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

  useEffect(() => {
    if (!id) return;
    const canal = suscribirTriajes((payload) => {
      // payload.new contains the updated row data
      if (payload.new && String(payload.new.id) === String(id)) {
        setTicket(prev => {
          // If state changed to "en_consulta" for the first time, vibrate!
          if (prev?.estado !== 'en_consulta' && payload.new.estado === 'en_consulta') {
            if (navigator.vibrate) {
              navigator.vibrate([500, 200, 500, 200, 1000]);
            }
          }
          return { ...prev, ...payload.new }
        });
      }
    });

    return () => canal.unsubscribe();
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

  if (ticket.estado === 'atendido') {
    return (
      <div className="ticket-page">
        <div className="ticket-container fade-in-up">
          <div className="ticket-brand">
            <div className="brand-logo">⚕</div>
            <h1>AuraMed</h1>
          </div>
          <div className="ticket-card success-card">
            <div className="ticket-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'white' }}>¡Atención Finalizada!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.5' }}>
                Esperamos que te sientas mejor pronto. Gracias por confiar en AuraMed.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (ticket.estado === 'en_consulta') {
    return (
      <div className="ticket-page alert-mode pulse-bg-alert">
        <div className="ticket-container fade-in-up">
          <div className="ticket-card alert-card pulse-shadow">
            <div className="ticket-body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div className="bell-icon pulse-icon">🔔</div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                ¡Es tu turno!
              </h1>
              <p style={{ fontSize: '1.25rem', color: '#fef08a', fontWeight: 600, marginBottom: '2rem' }}>
                Por favor dirígete a consulta
              </p>
              
              <div className="ticket-turn" style={{ borderColor: 'white', background: 'rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>Turno</span>
                <strong style={{ color: 'white', fontSize: '2rem' }}>#{turnoNumber}</strong>
              </div>

              <div style={{ marginTop: '3rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Médico asignado</p>
                <h3 style={{ color: 'white', fontSize: '1.25rem' }}>
                  {ticket.medicos ? `Dr. ${ticket.medicos.nombre}` : (ticket.especialidad_recomendada || 'Medicina General')}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
