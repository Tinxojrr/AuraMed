import { Database } from './supabase'

export type Triaje = Database['public']['Tables']['triajes']['Row']
export type TriajeInsert = Database['public']['Tables']['triajes']['Insert']
export type TriajeUpdate = Database['public']['Tables']['triajes']['Update']

export type Medico = Database['public']['Tables']['medicos']['Row'] & {
  especialidades?: Especialidad | null
}

export type Especialidad = Database['public']['Tables']['especialidades']['Row']

export type { Database }
