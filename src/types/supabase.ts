export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      especialidades: {
        Row: {
          created_at: string | null
          icono: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          icono?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          icono?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      medicos: {
        Row: {
          apellido: string
          box_numero: number | null
          created_at: string | null
          disponible: boolean | null
          especialidad_id: string | null
          foto_url: string | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          apellido: string
          box_numero?: number | null
          created_at?: string | null
          disponible?: boolean | null
          especialidad_id?: string | null
          foto_url?: string | null
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          apellido?: string
          box_numero?: number | null
          created_at?: string | null
          disponible?: boolean | null
          especialidad_id?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicos_especialidad_id_fkey"
            columns: ["especialidad_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      triajes: {
        Row: {
          created_at: string | null
          especialidad_recomendada: string
          estado: string | null
          id: string
          medico_id: string | null
          nivel_confianza: number | null
          notas_medico: string | null
          numero_turno: number
          paciente_edad: number | null
          paciente_genero: string | null
          paciente_nombre: string
          paciente_rut: string | null
          pdf_url: string | null
          preguntas_seguimiento: string[] | null
          prioridad: string
          recomendaciones: string[] | null
          resumen_clinico: string | null
          sintomas_texto: string
          tiempo_espera_estimado: number | null
          updated_at: string | null
          zona_corporal: string[] | null
        }
        Insert: {
          created_at?: string | null
          especialidad_recomendada: string
          estado?: string | null
          id?: string
          medico_id?: string | null
          nivel_confianza?: number | null
          notas_medico?: string | null
          numero_turno?: number
          paciente_edad?: number | null
          paciente_genero?: string | null
          paciente_nombre: string
          paciente_rut?: string | null
          pdf_url?: string | null
          preguntas_seguimiento?: string[] | null
          prioridad: string
          recomendaciones?: string[] | null
          resumen_clinico?: string | null
          sintomas_texto: string
          tiempo_espera_estimado?: number | null
          updated_at?: string | null
          zona_corporal?: string[] | null
        }
        Update: {
          created_at?: string | null
          especialidad_recomendada?: string
          estado?: string | null
          id?: string
          medico_id?: string | null
          nivel_confianza?: number | null
          notas_medico?: string | null
          numero_turno?: number
          paciente_edad?: number | null
          paciente_genero?: string | null
          paciente_nombre?: string
          paciente_rut?: string | null
          pdf_url?: string | null
          preguntas_seguimiento?: string[] | null
          prioridad?: string
          recomendaciones?: string[] | null
          resumen_clinico?: string | null
          sintomas_texto?: string
          tiempo_espera_estimado?: number | null
          updated_at?: string | null
          zona_corporal?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "triajes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
