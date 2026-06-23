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
    <div className={`ticket-page ${(ticket.especialidad_recomendada?.toLowerCase().includes('psico') || ticket.especialidad_recomendada?.toLowerCase().includes('psiqui')) ? 'zen-page' : ''}`}>
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

          {/* Sección Media: Datos del Paciente o Modo Zen */}
          {(ticket.especialidad_recomendada?.toLowerCase().includes('psico') || ticket.especialidad_recomendada?.toLowerCase().includes('psiqui')) ? (
            <div className="ticket-body zen-body">
              <h3 className="zen-title">Respiración Guiada</h3>
              <p className="zen-subtitle">Sigue el círculo para calmarte mientras esperas.</p>
              
              <div className="zen-breathing-container">
                <div className="zen-circle"></div>
                <div className="zen-instruction"></div>
              </div>
              
              <div className="info-group" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)' }}>Especialidad</label>
                <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600 }}>{ticket.especialidad_recomendada}</p>
              </div>

              <div style={{ marginTop: '2rem', width: '100%' }}>
                <a href="tel:*4141" className="btn-sos-zen" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '14px', background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px', textDecoration: 'none', fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Línea Prevención Suicidio (*4141)
                </a>
              </div>
            </div>
          ) : (
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
          )}

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
          <button 
            className="btn-share-whatsapp"
            onClick={() => {
              const trackingUrl = `${window.location.origin}/seguimiento/${ticket.id}`
              const text = `Sigue mi estado médico en Urgencias en tiempo real aquí: ${trackingUrl}`
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
              background: '#25D366', color: 'white', border: 'none', borderRadius: '100px',
              fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
              marginBottom: '1rem', transition: 'transform 0.2s'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Compartir con Familiares
          </button>
          
          <ChevronDown size={20} className="bounce" />
          <p>Desliza para más detalles</p>
        </div>

      </div>
    </div>
  )
}
