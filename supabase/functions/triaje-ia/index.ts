import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

const CHAT_PROMPT = `Eres AuraMed, un asistente de triaje médico conversacional.
Haz preguntas breves y empáticas para recopilar información sobre los síntomas del paciente.
Cuando tengas suficiente información, indica que estás listo para emitir el diagnóstico de triaje.
Responde siempre en español, de forma cálida y profesional.`

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

    if (!ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable.')
    }

    let system = ''
    let messages = []
    let max_tokens = 1024

    if (action === 'evaluar') {
      system = SYSTEM_PROMPT
      messages = [{ role: 'user', content: payload.message }]
    } else if (action === 'mental') {
      system = MENTAL_PROMPT
      messages = [{ role: 'user', content: payload.message }]
    } else if (action === 'chat') {
      system = CHAT_PROMPT
      messages = payload.messages
      max_tokens = 512
    } else {
      throw new Error('Invalid action provided')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: max_tokens,
        system: system,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Error from Anthropic API')
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
