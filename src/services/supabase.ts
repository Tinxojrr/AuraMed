import { supabase } from '@/lib/supabase'
import type { Database } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type Triaje = Database['public']['Tables']['triajes']['Row'] & {
  medicos?: {
    nombre: string | null
    especialidad_id: string | null
    especialidades?: { nombre: string | null } | null
  } | null
}
export type TriajeInsert = Database['public']['Tables']['triajes']['Insert']
export type Medico = Database['public']['Tables']['medicos']['Row'] & {
  especialidades?: { nombre: string | null } | null
}
export type Especialidad = Database['public']['Tables']['especialidades']['Row']

// ─── Utilidades ───────────────────────────────────────────────────────────────
const applyDateRange = (query: any, rango: string) => {
  if (!rango || rango === 'todos') return query
  const now = new Date()
  let limitDate = new Date()
  
  if (rango === 'hoy') {
    limitDate.setHours(0, 0, 0, 0)
  } else if (rango === 'semana') {
    limitDate.setDate(now.getDate() - 7)
  } else if (rango === 'mes') {
    limitDate.setDate(now.getDate() - 30)
  }
  
  return query.gte('created_at', limitDate.toISOString())
}

// ─── Triajes ──────────────────────────────────────────────────────────────────

export async function crearTriaje(datos: TriajeInsert): Promise<Triaje> {
  if (datos.prioridad) {
    datos.prioridad = datos.prioridad.toUpperCase().trim() as any
  }

  const { data, error } = await supabase
    .from('triajes')
    .insert([datos as any])
    .select()
    .single()

  if (error) throw error
  return data as any
}

export async function obtenerTriajes(limite: number = 50, rango: string = 'todos'): Promise<Triaje[]> {
  let query = supabase
    .from('triajes')
    .select(`*, medicos(nombre, especialidad_id, especialidades(nombre))`)
    .order('created_at', { ascending: false })
    .limit(limite)

  query = applyDateRange(query, rango)

  const { data, error } = await query

  if (error) throw error
  return data as unknown as Triaje[]
}

export async function obtenerTriajePorId(id: string): Promise<Triaje> {
  const { data, error } = await supabase
    .from('triajes')
    .select(`*, medicos(nombre, especialidad_id, especialidades(nombre))`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as Triaje
}

export async function actualizarEstadoTriaje(id: string, estado: string): Promise<any> {
  const { data, error } = await supabase
    .from('triajes')
    .update({ estado })
    .eq('id', id)

  if (error) throw error
  return data
}

export async function finalizarAtencion(id: string, estado: string, notas?: string, pdfUrl?: string | null): Promise<any> {
  const { data, error } = await supabase
    .from('triajes')
    .update({ 
      estado,
      notas_medico: notas || null,
      pdf_url: pdfUrl || null
    })
    .eq('id', id)

  if (error) throw error
  return data
}

export async function subirFichaPDF(blob: Blob, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('fichas-clinicas')
    .upload(`pdfs/${fileName}`, blob, {
      contentType: 'application/pdf',
      upsert: false
    })

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('fichas-clinicas')
    .getPublicUrl(`pdfs/${fileName}`)
    
  return publicUrl
}

export async function obtenerTriajesPorPaciente(paciente_rut: string): Promise<Triaje[]> {
  const { data, error } = await supabase
    .from('triajes')
    .select('*')
    .eq('paciente_rut', paciente_rut)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as Triaje[]
}

export async function obtenerPosicionFila(id: string): Promise<number> {
  const { data, error } = await supabase
    .from('triajes')
    .select('id, prioridad, created_at')
    .eq('estado', 'en_espera')

  if (error) throw error

  if (!data || data.length === 0) return 0;

  const PRIORIDAD_VALOR: Record<string, number> = { URGENCIA: 0, PRIORITARIO: 1, GENERAL: 2 }

  const ordenados = [...data].sort((a: any, b: any) => {
    const pA = PRIORIDAD_VALOR[a.prioridad] ?? 3;
    const pB = PRIORIDAD_VALOR[b.prioridad] ?? 3;
    if (pA !== pB) return pA - pB;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  })

  const index = ordenados.findIndex(t => String(t.id) === String(id));
  return index >= 0 ? index : 0;
}

export async function actualizarNotasPaciente(id: string, notasExtra: string): Promise<any> {
  const { data: paciente, error: errorGet } = await supabase
    .from('triajes')
    .select('resumen_clinico')
    .eq('id', id)
    .single()

  if (errorGet) throw errorGet

  const nuevoResumen = paciente.resumen_clinico 
    ? `${paciente.resumen_clinico}\n\n[Actualización en sala de espera]:\n${notasExtra}`
    : `[Actualización en sala de espera]:\n${notasExtra}`

  const { data, error } = await supabase
    .from('triajes')
    .update({ resumen_clinico: nuevoResumen })
    .eq('id', id)

  if (error) throw error
  return data
}

// ─── Médicos ──────────────────────────────────────────────────────────────────

export async function obtenerMedicos(): Promise<Medico[]> {
  const { data, error } = await supabase
    .from('medicos')
    .select(`*, especialidades(nombre)`)
    .order('nombre')

  if (error) throw error
  return data as unknown as Medico[]
}

export async function actualizarDisponibilidadMedico(id: string, disponible: boolean): Promise<Medico> {
  const { data, error } = await supabase
    .from('medicos')
    .update({ disponible })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as unknown as Medico
}

// ─── Especialidades ───────────────────────────────────────────────────────────

export async function obtenerEspecialidades(): Promise<Especialidad[]> {
  const { data, error } = await supabase
    .from('especialidades')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data as unknown as Especialidad[]
}

// ─── Realtime: escuchar cambios en triajes ────────────────────────────────────

export function suscribirTriajes(callback: () => void): RealtimeChannel {
  return supabase
    .channel('triajes-cambios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'triajes' }, callback)
    .subscribe()
}

export function suscribirMedicos(callback: () => void): RealtimeChannel {
  return supabase
    .channel('medicos-cambios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'medicos' }, callback)
    .subscribe()
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function obtenerEstadisticas(rango: string = 'todos') {
  try {
    let query = supabase
      .from('triajes')
      .select('prioridad, estado, especialidad_recomendada, created_at')
      .order('created_at', { ascending: false })
      .limit(2000)

    query = applyDateRange(query, rango)

    const { data, error } = await query

    if (error) throw error

    const stats = {
      total: data.length,
      urgencias: 0,
      prioritarios: 0,
      generales: 0,
      en_espera: 0,
      en_consulta: 0,
      atendidos: 0,
      derivados: 0,
      por_especialidad: {} as Record<string, number>
    }

    data.forEach(t => {
      if (t.prioridad === 'URGENCIA') stats.urgencias++
      if (t.prioridad === 'PRIORITARIO') stats.prioritarios++
      if (t.prioridad === 'GENERAL') stats.generales++

      if (t.estado === 'en_espera') stats.en_espera++
      if (t.estado === 'en_consulta') stats.en_consulta++
      if (t.estado === 'atendido') stats.atendidos++
      if (t.estado === 'derivado') stats.derivados++

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

export async function iniciarSesion(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
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
