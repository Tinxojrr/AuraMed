import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Heart, ArrowLeft, Loader2, Sparkles, User, ChevronUp, ChevronDown } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { evaluarTriajeMental } from '../services/claude'
import { crearTriaje } from '../services/supabase'
import './MentalTriage.css'

const formatRUT = (value) => {
  let rut = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (rut.length <= 1) return rut
  const dv = rut.slice(-1)
  const body = rut.slice(0, -1)
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv
}

const EMOCIONES = [
  { id: 'ansiedad', label: 'Ansiedad / Pánico', color: '#3b82f6' }, // Blue
  { id: 'tristeza', label: 'Tristeza Profunda', color: '#6366f1' }, // Indigo
  { id: 'insomnio', label: 'Insomnio', color: '#8b5cf6' }, // Violet
  { id: 'estres', label: 'Estrés Extremo', color: '#ec4899' }, // Pink
  { id: 'irritabilidad', label: 'Irritabilidad / Enojo', color: '#f43f5e' }, // Rose
  { id: 'angustia', label: 'Angustia / Ahogo', color: '#06b6d4' }, // Cyan
]

export default function MentalTriage({ onResultado }) {
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState({ nombre: '', rut: '', edad: '', genero: '', email: '' })
  const [showDatos, setShowDatos] = useState(true)
  const [emocionesSelec, setEmocionesSelec] = useState([])
  const [relato, setRelato] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmocion = (id) => {
    setEmocionesSelec(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const enviarCorreoEmailJS = async (email, nombre, mensaje) => {
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_xxx',
          template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_xxx',
          user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_xxx',
          template_params: {
            paciente_email: email,
            paciente_nombre: nombre,
            mensaje_contencion: mensaje
          }
        })
      })
      console.log("Correo enviado a EmailJS")
    } catch (err) {
      console.error("Error al enviar el correo", err)
    }
  }

  const generarTriaje = async () => {
    if (!paciente.nombre.trim()) {
      toast.error('Por favor ingresa tu nombre.')
      return
    }
    if (emocionesSelec.length === 0 && !relato.trim()) {
      toast.error('Selecciona cómo te sientes o cuéntanos qué sucede.')
      return
    }

    setLoading(true)
    try {
      const contexto = [
        paciente.nombre && `Nombre: ${paciente.nombre}`,
        paciente.edad && `Edad: ${paciente.edad} años`,
        paciente.genero && `Género: ${paciente.genero}`,
        emocionesSelec.length && `Emociones seleccionadas: ${emocionesSelec.join(', ')}`,
      ].filter(Boolean).join(' | ')

      const descripcion = relato.trim() || 'No proporcionó relato libre.'

      const resultado = await evaluarTriajeMental(descripcion, contexto)

      const triajeGuardado = await crearTriaje({
        paciente_nombre: paciente.nombre,
        paciente_rut: paciente.rut || null,
        paciente_edad: paciente.edad ? parseInt(paciente.edad) : null,
        paciente_genero: paciente.genero || null,
        sintomas_texto: descripcion,
        zona_corporal: emocionesSelec, // Guardamos emociones en el arreglo de zona
        prioridad: resultado.prioridad,
        especialidad_recomendada: resultado.especialidad,
        resumen_clinico: resultado.resumen,
        recomendaciones: resultado.recomendaciones,
        preguntas_seguimiento: resultado.preguntas_seguimiento,
        nivel_confianza: resultado.nivel_confianza,
        tiempo_espera_estimado: parseInt(resultado.tiempo_espera_estimado) || 15,
      })

      // Enviar correo si el paciente dejó un email
      if (paciente.email && resultado.email_contencion) {
        toast.promise(
          enviarCorreoEmailJS(paciente.email, paciente.nombre, resultado.email_contencion),
          {
            loading: 'Enviando pautas de apoyo a tu correo...',
            success: 'Correo de apoyo enviado',
            error: 'No se pudo enviar el correo',
          }
        )
      }

      // Redirigimos al ticket (que activará automáticamente el modo AuraZen)
      navigate(`/ticket/${triajeGuardado.id}`)
    } catch (err) {
      toast.error(err.message || 'Error al procesar tu evaluación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mental-triage-page">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />
      
      <header className="mental-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div className="mental-brand">
          <Brain size={24} color="#6366F1" />
          <span>Aura<strong>Zen</strong></span>
        </div>
      </header>

      <div className="mental-container">
        <div className="mental-intro fade-in">
          <h1>Evaluación de Bienestar</h1>
          <p>Este es un espacio seguro. Cuéntanos qué está pasando por tu mente para poder conectarte con la ayuda adecuada.</p>
        </div>

        {/* DATOS DEL PACIENTE */}
        <div className="form-card mental-card fade-in" style={{ animationDelay: '0.1s' }}>
          <button type="button" className="card-toggle" onClick={() => setShowDatos(v => !v)}>
            <span className="card-title"><User size={18} /> Tus datos básicos</span>
            {showDatos ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {showDatos && (
            <div className="form-fields">
              <div className="field-row">
                <div className="field">
                  <label>Nombre o alias *</label>
                  <input type="text" placeholder="¿Cómo te llamamos?"
                    value={paciente.nombre} onChange={e => setPaciente(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Correo Electrónico (Opcional)</label>
                  <input type="email" placeholder="Te enviaremos consejos de apoyo"
                    value={paciente.email} onChange={e => setPaciente(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="field-row" style={{ marginTop: '1rem' }}>
                <div className="field">
                  <label>RUT (Opcional)</label>
                  <input type="text" placeholder="12.345.678-9" maxLength="12"
                    value={paciente.rut} onChange={e => setPaciente(p => ({ ...p, rut: formatRUT(e.target.value) }))} />
                </div>
                <div className="field">
                  <label>Edad</label>
                  <input type="number" placeholder="Años" min="0" max="120"
                    value={paciente.edad} onChange={e => setPaciente(p => ({ ...p, edad: e.target.value }))} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SELECCIÓN RÁPIDA DE EMOCIONES */}
        <div className="mental-emotions fade-in" style={{ animationDelay: '0.2s' }}>
          <h3>¿Cómo te has sentido hoy? (Selecciona las que apliquen)</h3>
          <div className="emotions-grid">
            {EMOCIONES.map(em => (
              <button 
                key={em.id}
                className={`emotion-btn ${emocionesSelec.includes(em.id) ? 'selected' : ''}`}
                onClick={() => handleEmocion(em.id)}
                style={{ borderLeftColor: em.color }}
              >
                <span className="label" style={{ color: emocionesSelec.includes(em.id) ? em.color : 'inherit' }}>{em.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RELATO LIBRE */}
        <div className="mental-textarea-container fade-in" style={{ animationDelay: '0.3s' }}>
          <h3>¿Quieres contarnos algo más? (Opcional)</h3>
          <textarea 
            className="mental-textarea" 
            placeholder="Puedes desahogarte aquí. ¿Qué desencadenó cómo te sientes? Todo lo que escribas es confidencial..."
            value={relato}
            onChange={e => setRelato(e.target.value)}
            rows={5}
          />
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <div className="mental-actions fade-in" style={{ animationDelay: '0.4s' }}>
          <button 
            className="btn-mental-submit" 
            onClick={generarTriaje} 
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={20} className="spin" /> Evaluando con cuidado...</>
            ) : (
              <><Heart size={20} /> Solicitar Contención</>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
