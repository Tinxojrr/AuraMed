import { useState, useEffect } from 'react'
import { Volume2, Stethoscope, User, Clock, CheckCircle, FileText, Activity, AlertCircle, LogOut } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { obtenerTriajes, actualizarEstadoTriaje, obtenerMedicos, suscribirTriajes } from '@/services/supabase'
import PageTransition from '@/components/ui/PageTransition'
import ClinicalDrawer from '@/components/shared/ClinicalDrawer'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import './DoctorView.css'

const PRIORITY_CONFIG = {
  URGENCIA:    { color: '#DC2626', bg: '#FEF2F2' },
  PRIORITARIO: { color: '#D97706', bg: '#FFFBEB' },
  GENERAL:     { color: '#16A34A', bg: '#F0FDF4' },
}

export default function DoctorView() {
  const queryClient = useQueryClient()
  const [medicoLogueado, setMedicoLogueado] = useState(null)
  const [pacienteActivo, setPacienteActivo] = useState(null)

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['doctor_data'],
    queryFn: async () => {
      const [t, m] = await Promise.all([obtenerTriajes(200), obtenerMedicos()])
      return { triajes: t, medicos: m }
    },
    refetchInterval: 30000,
  })

  const medicos = data?.medicos || []
  const triajes = data?.triajes || []

  useEffect(() => {
    const canal = suscribirTriajes(() => refetch())
    return () => { canal.unsubscribe() }
  }, [refetch])

  // Lógica de Login
  if (!medicoLogueado) {
    return (
      <PageTransition>
        <div className="doctor-view-page">
          <Toaster position="top-center" />
          <div className="doctor-login-container fade-in-up">
            <div className="doctor-login-icon">
              <Stethoscope size={40} />
            </div>
            <h1>Portal Médico</h1>
            <p>Selecciona tu perfil para acceder a tu lista de trabajo y atender a los pacientes asignados a tu especialidad.</p>
            
            {loading ? (
              <p>Cargando perfiles...</p>
            ) : (
              <div className="medicos-grid">
                {medicos.filter(m => m.disponible).map(m => (
                  <div 
                    key={m.id} 
                    className="medico-card"
                    onClick={() => {
                      setMedicoLogueado(m)
                      toast.success(`Bienvenido, Dr. ${m.nombre}`)
                    }}
                  >
                    <div className="medico-avatar">
                      {m.nombre.charAt(0)}{m.apellido.charAt(0)}
                    </div>
                    <div className="medico-info">
                      <h3>Dr. {m.nombre} {m.apellido}</h3>
                      <p>{m.especialidades?.nombre || 'Medicina General'}</p>
                    </div>
                  </div>
                ))}
                {medicos.filter(m => m.disponible).length === 0 && (
                  <p>No hay médicos disponibles en la base de datos.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    )
  }

  // Lógica del Workspace del Médico
  const especialidadMedico = medicoLogueado.especialidades?.nombre || 'Medicina General'

  // Filtrar pacientes
  const misPacientes = triajes.filter(t => t.especialidad_recomendada === especialidadMedico)
  
  // Dividir por estado
  const enEspera = misPacientes.filter(t => t.estado === 'en_espera').sort((a, b) => {
    const prioridades = { URGENCIA: 0, PRIORITARIO: 1, GENERAL: 2 }
    return prioridades[a.prioridad] - prioridades[b.prioridad]
  })
  
  const enConsulta = misPacientes.filter(t => t.estado === 'en_consulta')

  const llamarPaciente = async (e, triajeId) => {
    e.stopPropagation()
    try {
      // Optimistic update
      queryClient.setQueryData<any>(['doctor_data'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          triajes: oldData.triajes.map(t => t.id === triajeId ? { ...t, estado: 'en_consulta' } : t)
        }
      })
      await actualizarEstadoTriaje(triajeId, 'en_consulta')
      toast.success('Paciente llamado a box')
    } catch (err) {
      toast.error('Error al actualizar')
      refetch()
    }
  }

  return (
    <PageTransition>
      <div className="doctor-view-page">
        <Toaster position="top-center" />
        
        {/* Header Workspace */}
        <div className="doctor-workspace-header fade-in-up">
          <div className="workspace-title">
            <h1>Dr. {medicoLogueado.nombre} {medicoLogueado.apellido}</h1>
            <p>{especialidadMedico} • Box {medicoLogueado.box_numero || 'Sin asignar'}</p>
          </div>
          <button className="btn-logout" onClick={() => setMedicoLogueado(null)}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        <div className="workspace-grid">
          
          {/* Columna: En Espera */}
          <div className="workspace-col fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2>
              <Clock size={20} color="var(--color-primary)" />
              Pacientes en Espera
              <span className="workspace-col-count">{enEspera.length}</span>
            </h2>
            <div className="workspace-cards">
              {enEspera.length === 0 ? (
                <div className="patient-empty">
                  <CheckCircle size={32} />
                  <p>No tienes pacientes en espera en este momento.</p>
                </div>
              ) : (
                enEspera.map(t => {
                  const conf = PRIORITY_CONFIG[t.prioridad] || PRIORITY_CONFIG.GENERAL
                  return (
                    <div 
                      key={t.id} 
                      className={`doctor-patient-card ${t.prioridad === 'URGENCIA' ? 'urgencia' : ''}`}
                      onClick={() => setPacienteActivo(t)}
                    >
                      <div className="dpc-header">
                        <h3 className="dpc-name">{t.paciente_nombre}</h3>
                        <span className="dpc-badge" style={{ background: conf.bg, color: conf.color }}>
                          {t.prioridad}
                        </span>
                      </div>
                      <div className="dpc-meta" style={{ marginBottom: '12px' }}>
                        <span><User size={14} /> {t.paciente_edad ? t.paciente_edad + ' años' : 'Edad N/D'}</span>
                        <span><Clock size={14} /> {new Date(t.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="dpc-summary">{t.resumen_clinico || t.sintomas_texto}</p>
                      <div className="dpc-actions">
                        <button className="btn-dpc-action btn-llamar" onClick={(e) => llamarPaciente(e, t.id)}>
                          <Volume2 size={16} /> Llamar a Box
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Columna: En Consulta */}
          <div className="workspace-col fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2>
              <Stethoscope size={20} color="#D97706" />
              En Consulta
              <span className="workspace-col-count" style={{ background: '#FFFBEB', color: '#D97706' }}>
                {enConsulta.length}
              </span>
            </h2>
            <div className="workspace-cards">
              {enConsulta.length === 0 ? (
                <div className="patient-empty">
                  <User size={32} />
                  <p>No estás atendiendo a nadie actualmente.</p>
                </div>
              ) : (
                enConsulta.map(t => {
                  const conf = PRIORITY_CONFIG[t.prioridad] || PRIORITY_CONFIG.GENERAL
                  return (
                    <div 
                      key={t.id} 
                      className="doctor-patient-card"
                      style={{ borderLeftColor: '#D97706' }}
                      onClick={() => setPacienteActivo(t)}
                    >
                      <div className="dpc-header">
                        <h3 className="dpc-name">{t.paciente_nombre}</h3>
                        <span className="dpc-badge" style={{ background: conf.bg, color: conf.color }}>
                          {t.prioridad}
                        </span>
                      </div>
                      <div className="dpc-meta" style={{ marginBottom: '12px' }}>
                        <span><User size={14} /> {t.paciente_edad ? t.paciente_edad + ' años' : 'Edad N/D'}</span>
                        <span><Activity size={14} /> Ficha Clínica Activa</span>
                      </div>
                      <div className="dpc-actions">
                        <button className="btn-dpc-action btn-atender" onClick={(e) => {
                          e.stopPropagation()
                          setPacienteActivo(t)
                        }}>
                          <FileText size={16} /> Abrir Ficha
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Clínico */}
      <ClinicalDrawer 
        paciente={pacienteActivo} 
        onClose={() => setPacienteActivo(null)} 
        onFinalizar={async (id, estado, notas, pdfBlob, pdfFilename) => {
          try {
            let publicUrl = null
            if (pdfBlob && pdfFilename) {
              const { subirFichaPDF, finalizarAtencion } = await import('@/services/supabase')
              publicUrl = await subirFichaPDF(pdfBlob, pdfFilename)
              await finalizarAtencion(id, estado, notas, publicUrl)
            }
            
            // Actualizar localmente
            queryClient.setQueryData<any>(['doctor_data'], (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                triajes: oldData.triajes.map(t => t.id === id ? { ...t, estado, notas_medico: notas, pdf_url: publicUrl } : t)
              }
            })
            toast.success('Atención finalizada')
          } catch (err) {
            toast.error('Error guardando atención')
          } finally {
            setPacienteActivo(null)
          }
        }}
      />
    </PageTransition>
  )
}
