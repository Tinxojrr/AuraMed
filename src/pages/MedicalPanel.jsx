import { useEffect, useState, useCallback, useMemo } from 'react'
import { User, Clock, Stethoscope, AlertCircle, AlertTriangle, CheckCircle, Volume2, VolumeX } from 'lucide-react'
import toast from 'react-hot-toast'
import { obtenerTriajes, actualizarEstadoTriaje, obtenerMedicos, suscribirTriajes } from '@/services/supabase'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useUrgenciaAlert } from '@/hooks/useUrgenciaAlert'
import PageTransition from '@/components/ui/PageTransition'
import ClinicalDrawer from '@/components/shared/ClinicalDrawer'
import './MedicalPanel.css'

const COLUMNAS = [
  { id: 'en_espera',   label: 'En espera',   color: '#1A6FD4', icon: Clock },
  { id: 'en_consulta', label: 'En consulta', color: '#D97706', icon: Stethoscope },
  { id: 'atendido',    label: 'Atendido',    color: '#16A34A', icon: CheckCircle },
]

const PRIORITY_CONFIG = {
  URGENCIA:    { color: '#DC2626', bg: '#FEF2F2', icon: AlertCircle },
  PRIORITARIO: { color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
  GENERAL:     { color: '#16A34A', bg: '#F0FDF4', icon: CheckCircle },
}

const PRIORIDAD_VALOR = { URGENCIA: 0, PRIORITARIO: 1, GENERAL: 2 }

function TriajeCard({ triaje, onMover }) {
  const config = PRIORITY_CONFIG[triaje.prioridad] || PRIORITY_CONFIG.GENERAL
  const Icon   = config.icon
  const isUrgencia = triaje.prioridad === 'URGENCIA'

  return (
    <PageTransition>
      <div
        className={`kanban-card ${isUrgencia ? 'kanban-card-urgencia' : ''}`}
        style={{ borderLeftColor: config.color }}
      >
        {/* Prioridad badge */}
        <div className="card-badge" style={{ background: config.bg, color: config.color }}>
          <Icon size={12} />
          {triaje.prioridad}
        </div>

        {/* Nombre paciente */}
        <h4 className="card-name">{triaje.paciente_nombre}</h4>

        {/* Especialidad */}
        <p className="card-esp">{triaje.especialidad_recomendada}</p>

        {/* Tiempo */}
        <div className="card-time">
          <Clock size={12} />
          {new Date(triaje.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          {triaje.tiempo_espera_estimado && (
            <span className="card-wait">· {triaje.tiempo_espera_estimado} min est.</span>
          )}
        </div>

        {/* Resumen clínico */}
        {triaje.resumen_clinico && (
          <p className="card-resumen">{triaje.resumen_clinico}</p>
        )}

        {/* Botones de acción */}
        <div className="card-actions">
          {triaje.estado !== 'en_consulta' && triaje.estado !== 'atendido' && (
            <button
              className="btn-card btn-consulta"
              onClick={(e) => {
                e.stopPropagation() // <--- ¡Esto detiene la propagación!
                onMover(triaje.id, 'en_consulta')
              }}
            >
              Llamar a consulta
            </button>
          )}
          
          {triaje.estado === 'en_consulta' && (
            <button
              className="btn-card btn-atendido"
              onClick={(e) => {
                e.stopPropagation() // <--- ¡Magia aquí también!
                onMover(triaje.id, 'atendido')
              }}
            >
              Marcar atendido
            </button>
          )}
          
          {triaje.estado === 'atendido' && (
            <span className="card-done">✓ Completado</span>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

export default function MedicalPanel() {
  const [triajes, setTriajes]   = useState([])
  const [medicos, setMedicos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [dragOver, setDragOver] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [sonido, setSonido]     = useState(true)
  const [pacienteActivo, setPacienteActivo] = useState(null)

  // Alerta sonora automática
  useUrgenciaAlert(sonido ? triajes : [])

  const cargarDatos = useCallback(async () => {
    try {
      const [t, m] = await Promise.all([obtenerTriajes(200), obtenerMedicos()])
      setTriajes(t)
      setMedicos(m)
    } catch (err) {
      toast.error('Error cargando panel médico')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
    const canal = suscribirTriajes(cargarDatos)
    return () => canal.unsubscribe()
  }, [cargarDatos])

  const moverTriaje = async (id, nuevoEstado) => {
    try {
      setTriajes(prev =>
        prev.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t)
      )
      await actualizarEstadoTriaje(id, nuevoEstado)
      toast.success(`Paciente movido a ${COLUMNAS.find(c => c.id === nuevoEstado)?.label}`)
    } catch (err) {
      toast.error('Error actualizando estado')
      cargarDatos()
    }
  }

  // Drag and drop
  const handleDragStart = (e, triaje) => {
    setDragging(triaje)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e, columnaId) => {
    e.preventDefault()
    if (dragging && dragging.estado !== columnaId) {
      moverTriaje(dragging.id, columnaId)
    }
    setDragOver(null)
    setDragging(null)
  }

  // Estructura de datos indexada para no hacer .filter() dentro del render
  const triajesPorColumna = useMemo(() => {
    const diccionario = { en_espera: [], en_consulta: [], atendido: [] }
    
    const ordenados = [...triajes].sort((a, b) => {
      return (PRIORIDAD_VALOR[a.prioridad] ?? 3) - (PRIORIDAD_VALOR[b.prioridad] ?? 3)
    })

    ordenados.forEach(t => {
      if (diccionario[t.estado]) {
        diccionario[t.estado].push(t)
      }
    })

    return diccionario
  }, [triajes])

  const medicosDisponibles = useMemo(() => {
    return medicos.filter(m => m.disponible)
  }, [medicos])

  if (loading) return (
    <div className="medical-panel">
      <div className="panel-header">
        <div><h1>Panel médico</h1><p>Cargando...</p></div>
      </div>
      <div className="kanban-board">
        {COLUMNAS.map(col => (
          <div key={col.id} className="kanban-col">
            <div className="col-header" style={{ borderBottomColor: col.color }}>
              <span className="col-title" style={{ color: col.color }}>{col.label}</span>
            </div>
            <div className="col-cards">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} lines={3} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="medical-panel">

      {/* Header */}
      <div className="panel-header">
        <div>
          <h1>Panel médico</h1>
          <p>Arrastra las tarjetas entre columnas para gestionar la atención</p>
        </div>
        
        <div className="panel-medicos" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setSonido(!sonido)}
            className="btn-sound-toggle"
            title={sonido ? "Desactivar alertas sonoras" : "Activar alertas sonoras"}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {sonido ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <span className="medicos-label">
            <User size={14} />
            {medicosDisponibles.length} médico{medicosDisponibles.length !== 1 ? 's' : ''} disponible{medicosDisponibles.length !== 1 ? 's' : ''}
          </span>
          {medicosDisponibles.slice(0, 4).map(m => (
            <span key={m.id} className="medico-chip">
              Dr. {m.nombre}
            </span>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="kanban-board">
        {COLUMNAS.map(col => {
          const cards = triajesPorColumna[col.id] || []
          const ColIcon = col.icon

          return (
            <div
              key={col.id}
              className={`kanban-col ${dragOver === col.id ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, col.id)}
            >
              {/* Cabecera columna */}
              <div className="col-header" style={{ borderBottomColor: col.color }}>
                <div className="col-title">
                  <ColIcon size={15} color={col.color} />
                  <span style={{ color: col.color }}>{col.label}</span>
                </div>
                <span className="col-count" style={{ background: col.color }}>
                  {cards.length}
                </span>
              </div>

              {/* Tarjetas */}
              <div className="col-cards">
                {cards.length === 0 ? (
                  <div className="col-empty">
                    {col.id === 'en_espera' ? 'Sin pacientes en espera' : 'Arrastra tarjetas aquí'}
                  </div>
                ) : (
                  cards.map(t => (
                    <div
                        key={t.id}
                        draggable
                        onDragStart={e => handleDragStart(e, t)}
                        onClick={() => {
                          // Solo abrir la ficha si el paciente ya está en consulta
                          if (col.id === 'en_consulta') {
                            setPacienteActivo(t)
                          }
                        }}
                        className={`card-drag-wrapper ${col.id === 'en_consulta' ? 'clickable-card' : ''}`}
                        style={{ cursor: col.id === 'en_consulta' ? 'pointer' : 'grab' }}
                      >
                        <TriajeCard triaje={t} onMover={moverTriaje} />
                      </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
        {/* ==========================================
          🏥 CAJÓN CLÍNICO DEL MÉDICO (Slide-over)
          ========================================== */}
        <ClinicalDrawer 
        paciente={pacienteActivo} 
        onClose={() => setPacienteActivo(null)} 
        onFinalizar={(id, estado) => {
          moverTriaje(id, estado)
          setPacienteActivo(null) // Cierra el panel automáticamente al dar de alta
        }}
      />

    </div>
  )
}