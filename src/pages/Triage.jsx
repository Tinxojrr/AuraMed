import { useState } from 'react'
import { User, FileText, Send, ChevronDown, ChevronUp, MessageSquare, Zap, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import BodyMap        from '@/components/shared/BodyMap'
import AIScanner      from '@/components/shared/AIScanner'
import TriageResult   from '@/components/shared/TriageResult'
import EVAScale       from '@/components/shared/EVAScale'
import RedFlags, { evaluarRedFlags } from '@/components/shared/RedFlags'
import { evaluarTriaje, chatTriaje } from '@/services/claude'
import { crearTriaje } from '@/services/supabase'
import './Triage.css'

const INITIAL_PACIENTE = { nombre: '', rut: '', edad: '', genero: '' }

// ─── Resultado de urgencia directa (sin llamar a la IA) ────
function UrgenciaDirecta({ paciente, razon, onReset }) {
  return (
    <div className="urgencia-directa fade-in-up">
      <div className="ud-icon">🚨</div>
      <h2>Urgencia inmediata detectada</h2>
      <p className="ud-razon">Motivo: <strong>{razon}</strong></p>
      <p className="ud-instruccion">
        Por la combinación de síntomas y factores de riesgo del paciente,
        este caso ha sido clasificado como <strong>URGENCIA</strong> sin necesidad
        de análisis adicional. Diríjase inmediatamente al box de urgencias.
      </p>
      <div className="ud-badge">🔴 URGENCIA — Atención inmediata</div>
      <button className="btn-reset-ud" onClick={onReset}>← Nuevo triaje</button>
    </div>
  )
}

// ─── Modo directo ──────────────────────────────────────────
function ModoDirecto({ paciente, setPaciente, sintomas, setSintomas, zonas, setZonas,
                       evaScore, setEvaScore, redFlags, setRedFlags, onSubmit, loading }) {
  const [showPaciente, setShowPaciente] = useState(true)

  return (
    <form className="triage-form" onSubmit={onSubmit}>
      <div className="triage-grid">
        <div className="triage-left">

          {/* Datos del paciente */}
          <div className="form-card">
            <button type="button" className="card-toggle" onClick={() => setShowPaciente(v => !v)}>
              <span className="card-title"><User size={16} /> Datos del paciente</span>
              {showPaciente ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showPaciente && (
              <div className="form-fields">
                <div className="field-row">
                  <div className="field">
                    <label>Nombre completo *</label>
                    <input type="text" placeholder="Ej: Juan Pérez González"
                      value={paciente.nombre} onChange={e => setPaciente(p => ({ ...p, nombre: e.target.value }))} required />
                  </div>
                  <div className="field">
                    <label>RUT</label>
                    <input type="text" placeholder="12.345.678-9"
                      value={paciente.rut} onChange={e => setPaciente(p => ({ ...p, rut: e.target.value }))} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Edad</label>
                    <input type="number" placeholder="Años" min="0" max="120"
                      value={paciente.edad} onChange={e => setPaciente(p => ({ ...p, edad: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Género</label>
                    <select value={paciente.genero} onChange={e => setPaciente(p => ({ ...p, genero: e.target.value }))}>
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Red Flags */}
          <div className="form-card">
            <RedFlags selected={redFlags} onChange={setRedFlags} />
          </div>

          {/* Síntomas */}
          <div className="form-card">
            <div className="card-title-static"><FileText size={16} /> Descripción de síntomas *</div>
            <textarea className="symptoms-textarea"
              placeholder="Describe con tus propias palabras qué sientes. Por ejemplo: 'Tengo dolor fuerte en el pecho desde hace 2 horas, me cuesta respirar...'"
              value={sintomas} onChange={e => setSintomas(e.target.value)} rows={5} required />
            <div className="char-count">
              {sintomas.length} caracteres
              {sintomas.length > 0 && sintomas.length < 20 && (
                <span className="char-warn"> — sé más específico</span>
              )}
            </div>
          </div>

          {/* Escala EVA */}
          <div className="form-card">
            <div className="card-title-static">Escala de dolor EVA</div>
            <EVAScale value={evaScore} onChange={setEvaScore} />
          </div>

          <button type="submit" className="btn-submit"
            disabled={loading || !sintomas.trim() || !paciente.nombre.trim()}>
            <Send size={18} />
            Analizar con IA
          </button>
        </div>

        {/* Cuerpo humano */}
        <div className="triage-right">
          <div className="form-card bodymap-card">
            <div className="card-title-static">Zona de dolor</div>
            <BodyMap selected={zonas} onChange={setZonas} />
          </div>
        </div>
      </div>
    </form>
  )
}

// ─── Modo chat ─────────────────────────────────────────────
function ModoChat({ paciente, setPaciente, zonas, setZonas,
                    evaScore, setEvaScore, redFlags, setRedFlags, onResultado }) {
  const [messages,   setMessages]   = useState([{
    role: 'assistant',
    content: '¡Hola! Soy AuraMed. Para ayudarte mejor, cuéntame: ¿cuál es el síntoma principal que te trae hoy?',
  }])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [showDatos,  setShowDatos]  = useState(true)
  const [listo,      setListo]      = useState(false)

  const enviarMensaje = async () => {
    if (!input.trim() || loading) return
    const nuevosMensajes = [...messages, { role: 'user', content: input }]
    setMessages(nuevosMensajes)
    setInput('')
    setLoading(true)
    try {
      const respuesta = await chatTriaje(nuevosMensajes)
      const listaParaDiag = respuesta.toLowerCase().includes('suficiente') ||
        respuesta.toLowerCase().includes('procederé') ||
        respuesta.toLowerCase().includes('analizaré') ||
        nuevosMensajes.filter(m => m.role === 'user').length >= 4
      setMessages(prev => [...prev, { role: 'assistant', content: respuesta }])
      if (listaParaDiag) setListo(true)
    } catch (err) {
      toast.error('Error al conectar con la IA')
    } finally {
      setLoading(false)
    }
  }

  const generarDiagnostico = async () => {
    if (!paciente.nombre.trim()) { toast.error('Ingresa el nombre del paciente'); return }
    setLoading(true)
    try {
      const conversacion = messages.filter(m => m.role === 'user').map(m => m.content).join('. ')
      const contexto = [
        paciente.edad   && `Edad: ${paciente.edad} años`,
        paciente.genero && `Género: ${paciente.genero}`,
        zonas.length    && `Zonas afectadas: ${zonas.join(', ')}`,
        `Dolor EVA: ${evaScore}/10`,
        redFlags.length && `Factores de riesgo: ${redFlags.join(', ')}`,
      ].filter(Boolean).join(' | ')

      const resultado = await evaluarTriaje(conversacion, contexto)
      await crearTriaje({
        paciente_nombre: paciente.nombre, paciente_rut: paciente.rut || null,
        paciente_edad: paciente.edad ? parseInt(paciente.edad) : null,
        paciente_genero: paciente.genero || null, sintomas_texto: conversacion,
        zona_corporal: zonas, prioridad: resultado.prioridad,
        especialidad_recomendada: resultado.especialidad,
        resumen_clinico: resultado.resumen, recomendaciones: resultado.recomendaciones,
        preguntas_seguimiento: resultado.preguntas_seguimiento,
        nivel_confianza: resultado.nivel_confianza,
        tiempo_espera_estimado: parseInt(resultado.tiempo_espera_estimado) || 30,
      })
      onResultado(resultado)
    } catch (err) {
      toast.error(err.message || 'Error al generar diagnóstico')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-layout">
      <div className="form-card chat-paciente">
        <button type="button" className="card-toggle" onClick={() => setShowDatos(v => !v)}>
          <span className="card-title"><User size={16} /> Datos del paciente</span>
          {showDatos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showDatos && (
          <div className="form-fields">
            <div className="field-row">
              <div className="field">
                <label>Nombre completo *</label>
                <input type="text" placeholder="Ej: María González"
                  value={paciente.nombre} onChange={e => setPaciente(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div className="field">
                <label>RUT</label>
                <input type="text" placeholder="12.345.678-9"
                  value={paciente.rut} onChange={e => setPaciente(p => ({ ...p, rut: e.target.value }))} />
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

      <div className="chat-grid">
        <div className="chat-col-left">
          {/* Red Flags en chat */}
          <div className="form-card">
            <RedFlags selected={redFlags} onChange={setRedFlags} />
          </div>

          {/* Chat */}
          <div className="chat-box">
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {m.role === 'assistant' && <div className="chat-avatar">⚕</div>}
                  <div className="chat-bubble">{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="chat-msg assistant">
                  <div className="chat-avatar">⚕</div>
                  <div className="chat-bubble chat-typing"><span /><span /><span /></div>
                </div>
              )}
            </div>
            {!listo ? (
              <div className="chat-input-row">
                <input type="text" className="chat-input" placeholder="Escribe tu respuesta..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && enviarMensaje()} disabled={loading} />
                <button className="chat-send" onClick={enviarMensaje} disabled={loading || !input.trim()}>
                  <Send size={16} />
                </button>
              </div>
            ) : (
              <button className="btn-submit btn-diagnostico" onClick={generarDiagnostico} disabled={loading}>
                <Zap size={18} /> Generar diagnóstico IA
              </button>
            )}
          </div>

          {/* EVA en chat */}
          <div className="form-card">
            <div className="card-title-static">Escala de dolor EVA</div>
            <EVAScale value={evaScore} onChange={setEvaScore} />
          </div>
        </div>

        {/* Cuerpo humano */}
        <div className="form-card bodymap-card">
          <div className="card-title-static">Zona de dolor</div>
          <BodyMap selected={zonas} onChange={setZonas} />
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────
export default function Triage() {
  const [modo,       setModo]       = useState('directo')
  const [paciente,   setPaciente]   = useState(INITIAL_PACIENTE)
  const [sintomas,   setSintomas]   = useState('')
  const [zonas,      setZonas]      = useState([])
  const [evaScore,   setEvaScore]   = useState(0)
  const [redFlags,   setRedFlags]   = useState([])
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [urgDirecta, setUrgDirecta] = useState(null)

  const handleSubmitDirecto = async (e) => {
    e.preventDefault()
    if (!sintomas.trim()) { toast.error('Describe los síntomas del paciente'); return }
    if (!paciente.nombre.trim()) { toast.error('Ingresa el nombre del paciente'); return }

    // ── Cortocircuito: Red Flag + síntoma crítico → Urgencia directa
    const evaluacion = evaluarRedFlags(redFlags, sintomas, evaScore)
    if (evaluacion.esUrgenciaDirecta) {
      await crearTriaje({
        paciente_nombre: paciente.nombre, paciente_rut: paciente.rut || null,
        paciente_edad: paciente.edad ? parseInt(paciente.edad) : null,
        paciente_genero: paciente.genero || null, sintomas_texto: sintomas,
        zona_corporal: zonas, prioridad: 'URGENCIA',
        especialidad_recomendada: 'Medicina General',
        resumen_clinico: `Urgencia directa por: ${evaluacion.razon}`,
        recomendaciones: ['Atención médica inmediata', 'No esperar en sala de espera general'],
        nivel_confianza: 1.0, tiempo_espera_estimado: 0,
      }).catch(console.error)
      setUrgDirecta(evaluacion.razon)
      return
    }

    setLoading(true)
    try {
      const contexto = [
        paciente.edad   && `Edad: ${paciente.edad} años`,
        paciente.genero && `Género: ${paciente.genero}`,
        zonas.length    && `Zonas afectadas: ${zonas.join(', ')}`,
        `Dolor EVA: ${evaScore}/10`,
        redFlags.length && `Factores de riesgo: ${redFlags.join(', ')}`,
      ].filter(Boolean).join(' | ')

      const iaResult = await evaluarTriaje(sintomas, contexto)
      await crearTriaje({
        paciente_nombre: paciente.nombre, paciente_rut: paciente.rut || null,
        paciente_edad: paciente.edad ? parseInt(paciente.edad) : null,
        paciente_genero: paciente.genero || null, sintomas_texto: sintomas,
        zona_corporal: zonas, prioridad: iaResult.prioridad,
        especialidad_recomendada: iaResult.especialidad,
        resumen_clinico: iaResult.resumen, recomendaciones: iaResult.recomendaciones,
        preguntas_seguimiento: iaResult.preguntas_seguimiento,
        nivel_confianza: iaResult.nivel_confianza,
        tiempo_espera_estimado: parseInt(iaResult.tiempo_espera_estimado) || 30,
      })
      setResult(iaResult)
      toast.success('Triaje completado')
    } catch (err) {
      toast.error(err.message || 'Error al procesar el triaje')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null); setUrgDirecta(null); setSintomas(''); setZonas([])
    setPaciente(INITIAL_PACIENTE); setEvaScore(0); setRedFlags([])
  }

  if (loading) return <AIScanner />

  if (urgDirecta) return (
    <UrgenciaDirecta paciente={paciente} razon={urgDirecta} onReset={handleReset} />
  )

  if (result) return (
    <TriageResult result={result} paciente={paciente} onReset={handleReset} />
  )

  return (
    <div className="triage-page">
      <div className="triage-header">
        <div>
          <h1>Triaje inteligente</h1>
          <p>Selecciona el modo de ingreso de síntomas</p>
        </div>
        <div className="modo-toggle">
          <button className={`modo-btn ${modo === 'directo' ? 'active' : ''}`} onClick={() => setModo('directo')}>
            <Zap size={15} /> Análisis directo
          </button>
          <button className={`modo-btn ${modo === 'chat' ? 'active' : ''}`} onClick={() => setModo('chat')}>
            <MessageSquare size={15} /> Chat con IA
          </button>
        </div>
      </div>

      {modo === 'directo' ? (
        <ModoDirecto
          paciente={paciente} setPaciente={setPaciente}
          sintomas={sintomas} setSintomas={setSintomas}
          zonas={zonas} setZonas={setZonas}
          evaScore={evaScore} setEvaScore={setEvaScore}
          redFlags={redFlags} setRedFlags={setRedFlags}
          onSubmit={handleSubmitDirecto} loading={loading}
        />
      ) : (
        <ModoChat
          paciente={paciente} setPaciente={setPaciente}
          zonas={zonas} setZonas={setZonas}
          evaScore={evaScore} setEvaScore={setEvaScore}
          redFlags={redFlags} setRedFlags={setRedFlags}
          onResultado={setResult}
        />
      )}
    </div>
  )
}
