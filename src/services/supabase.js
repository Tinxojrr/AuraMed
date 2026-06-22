import { supabase } from '@/lib/supabase'

// ─── Triajes ──────────────────────────────────────────────────────────────────

export async function crearTriaje(datos) {
  const { data, error } = await supabase
    .from('triajes')
    .insert([datos])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function obtenerTriajes(limite = 50) {
  const { data, error } = await supabase
    .from('triajes')
    .select(`*, medicos(nombre, especialidad_id, especialidades(nombre))`)
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) throw error
  return data
}

export async function obtenerTriajePorId(id) {
  const { data, error } = await supabase
    .from('triajes')
    .select(`*, medicos(nombre, especialidad_id, especialidades(nombre))`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function actualizarEstadoTriaje(id, estado) {
  const { data, error } = await supabase
    .from('triajes')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function obtenerTriajesPorPaciente(paciente_rut) {
  const { data, error } = await supabase
    .from('triajes')
    .select('*')
    .eq('paciente_rut', paciente_rut)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ─── Médicos ──────────────────────────────────────────────────────────────────

export async function obtenerMedicos() {
  const { data, error } = await supabase
    .from('medicos')
    .select(`*, especialidades(nombre)`)
    .order('nombre')

  if (error) throw error
  return data
}

export async function actualizarDisponibilidadMedico(id, disponible) {
  const { data, error } = await supabase
    .from('medicos')
    .update({ disponible })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Especialidades ───────────────────────────────────────────────────────────

export async function obtenerEspecialidades() {
  const { data, error } = await supabase
    .from('especialidades')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data
}

// ─── Realtime: escuchar cambios en triajes ────────────────────────────────────

export function suscribirTriajes(callback) {
  return supabase
    .channel('triajes-cambios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'triajes' }, callback)
    .subscribe()
}

export function suscribirMedicos(callback) {
  return supabase
    .channel('medicos-cambios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'medicos' }, callback)
    .subscribe()
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function obtenerEstadisticas() {
  try {
    // Traemos los últimos 500 pacientes sin importar de qué día son 
    // para que el Dashboard siempre tenga vida durante las pruebas.
    const { data, error } = await supabase
      .from('triajes')
      .select('prioridad, estado, especialidad_recomendada')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error

    // Inicializamos el objeto de estadísticas en cero
    const stats = {
      total: data.length,
      urgencias: 0,
      prioritarios: 0,
      generales: 0,
      en_espera: 0,
      en_consulta: 0,
      atendidos: 0,
      derivados: 0,
      por_especialidad: {}
    }

    // Calculamos todo en milisegundos
    data.forEach(t => {
      // 1. Conteo por Prioridad
      if (t.prioridad === 'URGENCIA') stats.urgencias++
      if (t.prioridad === 'PRIORITARIO') stats.prioritarios++
      if (t.prioridad === 'GENERAL') stats.generales++

      // 2. Conteo por Estado actual
      if (t.estado === 'en_espera') stats.en_espera++
      if (t.estado === 'en_consulta') stats.en_consulta++
      if (t.estado === 'atendido') stats.atendidos++
      if (t.estado === 'derivado') stats.derivados++

      // 3. Conteo por Especialidad (agrupación dinámica)
      if (t.especialidad_recomendada) {
        const esp = t.especialidad_recomendada
        stats.por_especialidad[esp] = (stats.por_especialidad[esp] || 0) + 1
      }
    })

    return stats
  } catch (error) {
    console.error('Error calculando estadísticas:', error)
    return {
      total: 0, urgencias: 0, prioritarios: 0, generales: 0,
      en_espera: 0, en_consulta: 0, atendidos: 0, derivados: 0,
      por_especialidad: {}
    }
  }
}

// ─── Autenticación (Doctores / Admin) ──────────────────────────────────────────

export async function iniciarSesion(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  if (error) throw error
  return data
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function obtenerSesionActual() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
