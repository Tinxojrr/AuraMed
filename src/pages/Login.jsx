import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'
import { Lock, Mail, Activity, ArrowRight, ShieldCheck, Cpu, ArrowLeft, Key, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import { iniciarSesion } from '@/services/supabase'
import PageTransition from '@/components/ui/PageTransition'
import './Login.css'

const FRASES_SEGURIDAD = [
  "Protocolo de cifrado AES-256 activado...",
  "Sincronizando pesos neuronales con Claude 3.5...",
  "Verificando hand-shake con clúster clínico...",
  "Acceso restringido: Solo personal autorizado.",
  "Canal de datos sanitarios encriptado de extremo a extremo."
]

export default function Login() {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fraseIndex, setFraseIndex] = useState(0)
  const navigate = useNavigate()

  // Efecto que rota las frases de la consola cibernética cada 3.5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % FRASES_SEGURIDAD.length)
    }, 3500)
    return () => clearInterval(intervalo)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await iniciarSesion(email, password)
      toast.success('Acceso concedido. Bienvenido a AuraMed.')
      navigate('/admin/dashboard')
    } catch (error) {
      toast.error('Acceso denegado. Credenciales no reconocidas.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className={`login-container ${theme}`}>
        
        {/* BOTÓN FLOTANTE DÍA / NOCHE */}
        <button className="btn-theme-login" onClick={toggleTheme} aria-label="Cambiar tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        {/* LADO IZQUIERDO: COMANDO CIBERNÉTICO */}
        <div className="login-branding">
          
          {/* Orbes de energía de fondo */}
          <div className="login-orb orb-a"></div>
          <div className="login-orb orb-b"></div>

          {/* Botón de escape al Home */}
          <Link to="/" className="btn-back-home">
            <ArrowLeft size={16} /> Volver al portal público
          </Link>

          <div className="login-logo-area">
            <div className="logo-icon-glow">
              <Activity size={32} color="#3B82F6" />
            </div>
            <h1>AuraMed <span>OS</span></h1>
          </div>

          <div className="security-badge-live">
            <ShieldCheck size={15} className="shield-icon" />
            <span>SISTEMA DE TRIAJE HOSPITALARIO COMPLEMENTARIO</span>
          </div>

          {/* El Escáner Holográfico */}
          <div className="scanner-stage">
            <div className="laser-beam"></div>
            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
            <Lock size={68} className="lock-hologram" />
          </div>

          {/* Consola de Comandos */}
          <div className="terminal-console">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">SECURE_HANDSHAKE // v2.4</span>
            </div>
            <div className="terminal-body">
              <p className="typewriter-text">{FRASES_SEGURIDAD[fraseIndex]}</p>
            </div>
          </div>

          <div className="branding-footer">
            <Cpu size={14} /> Motor de inferencia en tiempo real activo
          </div>
        </div>

        {/* LADO DERECHO: FORMULARIO GLASSMORPHISM */}
        <div className="login-form-wrapper">
          <form className="login-form" onSubmit={handleLogin}>
            
            <div className="form-header">
              <div className="key-badge">
                <Key size={18} color="#3B82F6" />
              </div>
              <h2>Portal de Staff hospitalario</h2>
              <p className="login-subtitle">Introduce tu credencial de red para iniciar tu turno en el sistema.</p>
            </div>

            <div className="form-group">
              <label>Correo Institucional</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="dr.apellido@auramed.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Clave de Autorización</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-login-glow" disabled={loading}>
              <span className="btn-txt">{loading ? 'Desencriptando credencial...' : 'Autorizar Ingreso'}</span>
              {!loading && <ArrowRight size={18} className="arrow-anim" />}
              <div className="shimmer-effect"></div>
            </button>
            
          </form>
        </div>
      </div>
    </PageTransition>
  )
}