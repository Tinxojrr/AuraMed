import { useEffect, useState, useCallback } from 'react'
import { Search, Clock, AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, RefreshCw, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { obtenerTriajes, obtenerTriajesPorPaciente } from '@/services/supabase'
import PageTransition from '@/components/ui/PageTransition' // <-- ¡Le agregué tu transición de página!
import './History.css'

const PRIORITY_CONFIG = {
  URGENCIA:    { color: '#DC2626', bg: '#FEF2F2', icon: AlertCircle,   label: 'Urgencia' },
  PRIORITARIO: { color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle, label: 'Prioritario' },
  GENERAL:     { color: '#16A34A', bg: '#F0FDF4', icon: CheckCircle,   label: 'General' },
}

const ESTADO_LABELS = {
  en_espera:   'En espera',
  en_consulta: 'En consulta',
  atendido:    'Atendido',
  derivado:    'Derivado',
}

function TimelineItem({ triaje, isLast }) {
  const [expanded, setExpanded] = useState(false)
  const config = PRIORITY_CONFIG[triaje.prioridad] || PRIORITY_CONFIG.GENERAL
  const Icon = config.icon

  return (
    <div className={`timeline-item ${isLast ? 'last' : ''}`}>
      {/* Línea y punto */}
      <div className="timeline-left">
        <div className="timeline-dot" style={{ background: config.color, borderColor: config.color }}>
          <Icon size={12} color="white" />
        </div>
        {!isLast && <div className="timeline-line" />}
      </div>

      {/* Contenido */}
      <div className="timeline-content">
        <div
          className="timeline-card"
          onClick={() => setExpanded(v => !v)}
          style={{ borderLeftColor: config.color }}
        >
          {/* Header de la card */}
          <div className="timeline-card-header">
            <div className="timeline-card-left">
              <span className="timeline-badge" style={{ background: config.bg, color: config.color }}>
                {config.label}
              </span>
              <h4 className="timeline-name">{triaje.paciente_nombre || 'Paciente sin registrar'}</h4>
              <span className="timeline-esp">{triaje.especialidad_recomendada || 'Sin derivación'}</span>
            </div>
            <div className="timeline-card-right">
              <span className="timeline-date">
                {new Date(triaje.created_at).toLocaleDateString('es-CL', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </span>
              <span className="timeline-time">
                <Clock size={11} />
                {new Date(triaje.created_at).toLocaleTimeString('es-CL', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
              <span
                className="timeline-estado"
                style={{
                  background: triaje.estado === 'atendido' ? '#F0FDF4' : '#EFF6FF',
                  color:      triaje.estado === 'atendido' ? '#16A34A' : '#1A6FD4',
                }}
              >
                {ESTADO_LABELS[triaje.estado] || triaje.estado}
              </span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>

          {/* Síntomas siempre visibles */}
          <p className="timeline-sintomas">
            <FileText size={12} />
            {triaje.sintomas_texto || 'Sin síntomas registrados en el sistema.'}
          </p>

          {/* Detalle expandible */}
          {expanded && (
            <div className="timeline-detail fade-in-up">
              {triaje.resumen_clinico && (
                <div className="detail-section">
                  <span className="detail-label">Resumen clínico</span>
                  <p>{triaje.resumen_clinico}</p>
                </div>
              )}

              {triaje.recomendaciones?.length > 0 && (
                <div className="detail-section">
                  <span className="detail-label">Recomendaciones</span>
                  <ul>
                    {triaje.recomendaciones.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              <div className="detail-meta">
                {triaje.paciente_edad && (
                  <span>Edad: {triaje.paciente_edad} años</span>
                )}
                {triaje.paciente_rut && (
                  <span>RUT: {triaje.paciente_rut}</span>
                )}
                {triaje.tiempo_espera_estimado && (
                  <span>Espera estimada: {triaje.tiempo_espera_estimado} min</span>
                )}
                {triaje.nivel_confianza && (
                  <span>Confianza IA: {Math.round(triaje.nivel_confianza * 100)}%</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function History() {
  const [triajes,  setTriajes]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro,   setFiltro]   = useState('todos')

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await obtenerTriajes(200)
      setTriajes(data || [])
    } catch (err) {
      toast.error('Error cargando historial')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const buscarPorRut = async () => {
    if (!busqueda.trim()) { cargarDatos(); return }
    try {
      setLoading(true)
      const data = await obtenerTriajesPorPaciente(busqueda.trim())
      setTriajes(data || [])
    } catch {
      toast.error('Error en la búsqueda remota')
    } finally {
      setLoading(false)
    }
  }

  // EL FILTRO SEGURO CONTRA CRASHES
  const triajesFiltrados = triajes.filter(t => {
    const matchFiltro = filtro === 'todos' || t.prioridad === filtro
    const matchBusqueda = !busqueda ||
      t.paciente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
      t.paciente_rut?.includes(busqueda)
    return matchFiltro && matchBusqueda
  })

  return (
    <PageTransition>
      <div className="history-page">

        {/* Header */}
        <div className="history-header">
          <div>
            <h1>Historial clínico</h1>
            <p>Registro auditable de todos los triajes realizados</p>
          </div>
          <button className="btn-refresh-hist" onClick={cargarDatos} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="history-controls">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre o RUT..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarPorRut()}
            />
            {busqueda && (
              <button onClick={() => { setBusqueda(''); cargarDatos() }}>×</button>
            )}
          </div>

          <div className="filter-tabs">
            {[
              { id: 'todos',       label: 'Todos' },
              { id: 'URGENCIA',    label: 'Urgencia' },
              { id: 'PRIORITARIO', label: 'Prioritario' },
              { id: 'GENERAL',     label: 'General' },
            ].map(f => (
              <button
                key={f.id}
                className={`filter-tab ${filtro === f.id ? 'active' : ''}`}
                onClick={() => setFiltro(f.id)}
                style={filtro === f.id && f.id !== 'todos' ? {
                  background: PRIORITY_CONFIG[f.id]?.bg,
                  color: PRIORITY_CONFIG[f.id]?.color,
                  borderColor: PRIORITY_CONFIG[f.id]?.color,
                } : {}}
              >
                {f.label}
                <span className="filter-count">
                  {f.id === 'todos'
                    ? triajes.length
                    : triajes.filter(t => t.prioridad === f.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="history-loading">
            <RefreshCw size={22} className="spin" />
            <span>Sincronizando expedientes...</span>
          </div>
        ) : triajesFiltrados.length === 0 ? (
          <div className="history-empty">
            <FileText size={40} />
            <p>No se encontraron triajes</p>
            <span>{busqueda ? 'Intenta buscar con otro término' : 'Los expedientes aparecerán aquí al registrarse'}</span>
          </div>
        ) : (
          <div className="timeline">
            {triajesFiltrados.map((t, i) => (
              <TimelineItem
                key={t.id}
                triaje={t}
                isLast={i === triajesFiltrados.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}