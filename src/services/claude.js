const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'

// Prompt del sistema: define el comportamiento del triaje IA
const SYSTEM_PROMPT = `Eres AuraMed, un asistente médico especializado en triaje clínico de atención primaria.
Tu rol es evaluar síntomas descritos por pacientes y clasificar su prioridad de atención.

Debes responder SIEMPRE en el siguiente formato JSON exacto, sin texto adicional:
{
  "prioridad": "URGENCIA" | "PRIORITARIO" | "GENERAL",
  "especialidad": "Cardiología" | "Pediatría" | "Traumatología" | "Neurología" | "Medicina General" | "Dermatología" | "Gastroenterología" | "Ginecología" | "Oftalmología" | "Psiquiatría",
  "resumen": "Resumen clínico del caso en 1-2 oraciones.",
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "preguntas_seguimiento": ["pregunta 1 para el médico", "pregunta 2"],
  "nivel_confianza": 0.0 a 1.0,
  "tiempo_espera_estimado": "en minutos, como número entero"
}

Criterios de prioridad:
- URGENCIA: Riesgo de vida inmediato (dolor pecho, dificultad respiratoria severa, pérdida de consciencia, etc.)
- PRIORITARIO: Necesita atención en menos de 2 horas (fiebre alta, dolor intenso, sangrado moderado, etc.)
- GENERAL: Puede esperar turno normal (síntomas leves, consultas de control, etc.)

Reglas adicionales:
- SALUD MENTAL: Si detectas síntomas de salud mental (ansiedad severa, crisis de pánico, ideación, depresión), DEBES asignar la especialidad "Psicología" o "Psiquiatría". El sistema activará el "Modo AuraZen" para contener al paciente en sala de espera.

Sé preciso, empático y profesional. Nunca improvises datos médicos.`

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

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Error al conectar con el servicio de IA')
  }

  const data = await response.json()
  const text = data.content[0]?.text || ''

  try {
    // Intento 1: JSON puro
    return JSON.parse(text)
  } catch {
    try {
      // Intento 2: extraer JSON de bloques markdown ```json ... ``` o ``` ... ```
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) return JSON.parse(match[1].trim())

      // Intento 3: buscar el primer { ... } en el texto
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
 * Chat conversacional para triaje guiado paso a paso
 * @param {Array} messages - Historial de mensajes [{role, content}]
 * @returns {Promise<string>} Respuesta de la IA
 */
export async function chatTriaje(messages) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `Eres AuraMed, un asistente de triaje médico conversacional.
Haz preguntas breves y empáticas para recopilar información sobre los síntomas del paciente.
Cuando tengas suficiente información, indica que estás listo para emitir el diagnóstico de triaje.
Responde siempre en español, de forma cálida y profesional.`,
      messages,
    }),
  })

  const data = await response.json()
  return data.content[0]?.text || ''
}

const MENTAL_PROMPT = `Eres AuraMed, un especialista en salud mental (psicólogo/psiquiatra clínico) encargado del triaje de primera respuesta.
Tu rol es evaluar el estado emocional descrito por el paciente y clasificar su prioridad de atención psicológica/psiquiátrica.

Debes responder SIEMPRE en el siguiente formato JSON exacto, sin texto adicional:
{
  "prioridad": "URGENCIA" | "PRIORITARIO" | "GENERAL",
  "especialidad": "Psicología" | "Psiquiatría",
  "resumen": "Breve análisis del estado emocional en 1-2 oraciones.",
  "recomendaciones": ["Técnica de respiración sugerida", "Consejo de contención", "etc"],
  "preguntas_seguimiento": ["pregunta de evaluación de riesgo", "pregunta de red de apoyo"],
  "nivel_confianza": 0.0 a 1.0,
  "tiempo_espera_estimado": "en minutos, como número entero",
  "email_contencion": "Un mensaje cálido, humano y empático (max 3 párrafos cortos) dirigido directamente al paciente (tratándolo por su nombre si se dio en el contexto), dándole consejos prácticos específicos basados en lo que contó, y validando sus emociones."
}

Criterios de prioridad mental:
- URGENCIA: Ideación suicida activa, brote psicótico, agitación severa incontrolable, riesgo para sí mismo o terceros.
- PRIORITARIO: Crisis de pánico activa, angustia severa, llanto incontrolable, ansiedad aguda.
- GENERAL: Estrés, problemas de sueño, síntomas depresivos leves, necesidad de contención o consejería.

Sé sumamente empático, prioriza la seguridad del paciente y nunca improvises diagnósticos médicos definitivos.`

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

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: MENTAL_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Error al conectar con el servicio de IA')
  }

  const data = await response.json()
  const text = data.content[0]?.text || ''

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
