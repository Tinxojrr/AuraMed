import { supabase } from '@/lib/supabase'

export interface TriajeResult {
  prioridad: 'URGENCIA' | 'PRIORITARIO' | 'GENERAL'
  especialidad: string
  tiempo_espera_estimado: number | string
  resumen: string
  nivel_confianza: number
  recomendaciones: string[]
  preguntas_seguimiento?: string[]
  email_contencion?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Función auxiliar para invocar la Edge Function de Supabase
 */
async function invocarEdgeFunction(action: string, payload: any) {
  const { data, error } = await supabase.functions.invoke('triaje-ia', {
    body: { action, payload }
  })

  if (error) {
    console.error('Error invocando Edge Function:', error)
    throw new Error(error.message || 'Error al conectar con el servicio de IA')
  }

  return data
}

/**
 * Extrae y parsea el JSON de la respuesta de texto de Claude
 */
function parsearRespuestaJSON(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) return JSON.parse(match[1].trim())

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) return JSON.parse(jsonMatch[0])

      throw new Error('No se encontró JSON válido en la respuesta')
    } catch {
      console.error('Respuesta IA cruda:', text)
      throw new Error('La IA retornó un formato inesperado. Intenta de nuevo.')
    }
  }
}

/**
 * Evalúa síntomas con Claude y retorna el resultado del triaje
 */
export async function evaluarTriaje(sintomas: string, contexto: string = ''): Promise<TriajeResult> {
  const userMessage = contexto
    ? `Contexto del paciente: ${contexto}\n\nSíntomas reportados: ${sintomas}`
    : `Síntomas reportados: ${sintomas}`

  const data = await invocarEdgeFunction('evaluar', { message: userMessage })
  const text = data.content[0]?.text || ''
  return parsearRespuestaJSON(text) as TriajeResult
}

/**
 * Chat conversacional para triaje guiado paso a paso
 */
export async function chatTriaje(messages: ChatMessage[]): Promise<string> {
  const data = await invocarEdgeFunction('chat', { messages })
  return data.content[0]?.text || ''
}

/**
 * Evalúa estado emocional con Claude y retorna el resultado del triaje mental
 */
export async function evaluarTriajeMental(emociones: string, contexto: string = ''): Promise<TriajeResult> {
  const userMessage = contexto
    ? `Contexto del paciente: ${contexto}\n\nEstado emocional reportado: ${emociones}`
    : `Estado emocional reportado: ${emociones}`

  const data = await invocarEdgeFunction('mental', { message: userMessage })
  const text = data.content[0]?.text || ''
  return parsearRespuestaJSON(text) as TriajeResult
}
