import { useState, useEffect } from 'react'
import { Search, Clock, AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, RefreshCw, FileText, User, Calendar, Activity, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import { obtenerTriajes, obtenerTriajesPorPaciente } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'
import PageTransition from '@/components/ui/PageTransition'
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

              {triaje.pdf_url && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a href={triaje.pdf_url} target="_blank" rel="noreferrer" className="btn-refresh-hist" style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.2)', textDecoration: 'none' }}>
                    <FileText size={14} /> Ver PDF Original
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PatientProfileCard({ triajes }) {
  if (!triajes || triajes.length === 0) return null
  
  const p = triajes[0] // Datos del paciente más reciente
  const totalVisitas = triajes.length
  
  // Como vienen ordenados de más nuevo a más antiguo:
  const ultimaVisita = new Date(triajes[0].created_at)
  const primeraVisita = new Date(triajes[triajes.length - 1].created_at)

  // Extraer iniciales
  const iniciales = p.paciente_nombre ? p.paciente_nombre.substring(0, 2).toUpperCase() : 'NN'

  return (
    <div className="patient-profile-card fade-in-up">
      <div className="profile-header">
        <div className="profile-avatar">
          {iniciales}
        </div>
        <div className="profile-info">
          <h2>{p.paciente_nombre || 'Paciente Sin Nombre'}</h2>
          <div className="profile-badges">
            <span className="badge-rut"><Hash size={12} /> {p.paciente_rut || 'Sin RUT'}</span>
            <span className="badge-edad"><User size={12} /> {p.paciente_edad ? `${p.paciente_edad} años` : 'Edad Desconocida'}</span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <Activity size={18} className="stat-icon-blue" />
          <div className="stat-box-info">
            <span className="s-label">Total Atenciones</span>
            <span className="s-val">{totalVisitas}</span>
          </div>
        </div>
        
        <div className="stat-box">
          <Calendar size={18} className="stat-icon-green" />
          <div className="stat-box-info">
            <span className="s-label">Primera Visita</span>
            <span className="s-val">{primeraVisita.toLocaleDateString('es-CL')}</span>
          </div>
        </div>

        <div className="stat-box">
          <Clock size={18} className="stat-icon-purple" />
          <div className="stat-box-info">
            <span className="s-label">Última Visita</span>
            <span className="s-val">{ultimaVisita.toLocaleDateString('es-CL')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function History() {
  const [busqueda, setBusqueda] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [filtro,   setFiltro]   = useState('todos')

  const { data: triajesData, isLoading: loading, refetch } = useQuery({
    queryKey: ['history_data', activeSearch],
    queryFn: async () => {
      if (activeSearch.trim()) {
        return await obtenerTriajesPorPaciente(activeSearch.trim())
      }
      return await obtenerTriajes(200)
    },
    refetchInterval: activeSearch ? false : 30000,
  })

  const triajes = triajesData || []

  const cargarDatos = () => {
    setActiveSearch('')
    setBusqueda('')
    refetch()
  }

  const buscarPorRut = () => {
    setActiveSearch(busqueda)
  }

  // EL FILTRO SEGURO CONTRA CRASHES
  const triajesFiltrados = triajes.filter(t => {
    const matchFiltro = filtro === 'todos' || t.prioridad === filtro
    const matchBusqueda = !busqueda ||
      t.paciente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
      t.paciente_rut?.includes(busqueda)
    return matchFiltro && matchBusqueda
  })

  // DETERMINAR MODO PACIENTE (Si la búsqueda arroja exactamente 1 RUT único)
  const unicosRuts = [...new Set(triajesFiltrados.map(t => t.paciente_rut).filter(Boolean))]
  const isPatientMode = busqueda.trim().length > 0 && unicosRuts.length === 1

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
          <div className="timeline-container">
            {isPatientMode && (
              <div style={{ marginBottom: '30px' }}>
                <PatientProfileCard triajes={triajesFiltrados} />
                <h3 className="timeline-patient-title">Evolución Clínica Histórica</h3>
              </div>
            )}
            
            <div className="timeline">
              {triajesFiltrados.map((t, i) => (
                <TimelineItem
                  key={t.id}
                  triaje={t}
                  isLast={i === triajesFiltrados.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}