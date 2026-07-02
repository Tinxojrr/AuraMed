import { supabase } from '@/lib/supabase'

/**
 * Función auxiliar para invocar la Edge Function de Supabase
 */
async function invocarEdgeFunction(action, payload) {
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
function parsearRespuestaJSON(text) {
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
 * @param {string} sintomas - Descripción libre de síntomas del paciente
 * @param {string} [contexto] - Contexto adicional (edad, historial previo, etc.)
 * @returns {Promise<Object>} Resultado del triaje
 */
export async function evaluarTriaje(sintomas, contexto = '') {
  const userMessage = contexto
    ? `Contexto del paciente: ${contexto}\n\nSíntomas reportados: ${sintomas}`
    : `Síntomas reportados: ${sintomas}`

  const data = await invocarEdgeFunction('evaluar', { message: userMessage })
  const text = data.content[0]?.text || ''
  return parsearRespuestaJSON(text)
}

/**
 * Chat conversacional para triaje guiado paso a paso
 * @param {Array} messages - Historial de mensajes [{role, content}]
 * @returns {Promise<string>} Respuesta de la IA
 */
export async function chatTriaje(messages) {
  const data = await invocarEdgeFunction('chat', { messages })
  return data.content[0]?.text || ''
}

/**
 * Evalúa estado emocional con Claude y retorna el resultado del triaje mental
 * @param {string} emociones - Descripción del estado de ánimo
 * @param {string} [contexto] - Síntomas seleccionados y contexto adicional
 * @returns {Promise<Object>} Resultado del triaje
 */
export async function evaluarTriajeMental(emociones, contexto = '') {
  const userMessage = contexto
    ? `Contexto del paciente: ${contexto}\n\nEstado emocional reportado: ${emociones}`
    : `Estado emocional reportado: ${emociones}`

  const data = await invocarEdgeFunction('mental', { message: userMessage })
  const text = data.content[0]?.text || ''
  return parsearRespuestaJSON(text)
}
