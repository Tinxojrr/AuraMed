import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'
import { Activity, Brain, Clock, Shield, ChevronRight, Sun, Moon, Zap, Users, BarChart2, Sparkles, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import './Landing.css'

const STATS = [
  { value: '< 10s', label: 'Tiempo de triaje IA' },
  { value: '95%', label: 'Precisión clínica' },
  { value: '3', label: 'Niveles de prioridad' },
  { value: '10+', label: 'Especialidades' },
]

const FEATURES = [
  { icon: Brain, title: 'IA clínica avanzada', desc: 'Claude analiza síntomas en lenguaje natural y clasifica la urgencia en segundos.', color: '#3b82f6' },
  { icon: Zap, title: 'Triaje en tiempo real', desc: 'Cuerpo humano interactivo, resultados instantáneos y alertas visuales por prioridad.', color: '#f59e0b' },
  { icon: Users, title: 'Panel médico Kanban', desc: 'Gestión visual de pacientes con arrastrar y soltar. Disponibilidad en vivo.', color: '#10b981' },
  { icon: BarChart2, title: 'Dashboard analítico', desc: 'Estadísticas en tiempo real: carga por especialidad, urgencias del día, tendencias.', color: '#8b5cf6' },
  { icon: Clock, title: 'Historial auditable', desc: 'Cada triaje queda registrado en la nube con su línea de tiempo completa.', color: '#ef4444' },
  { icon: Shield, title: 'Seguro y confiable', desc: 'Base de datos relacional con RLS, acceso controlado y datos encriptados.', color: '#06b6d4' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div className={`landing ${loaded ? 'page-loaded' : ''} ${theme}`}>

      {/* Orbes de luz ambientales flotando en el fondo */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="logo-container">
            <span className="landing-logo">⚕</span>
          </div>
          <span>Aura<strong>Med</strong></span>
        </div>

        <div className="landing-header-right">
          <button className="landing-theme" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* NUEVO: Botón sutil en el header para los doctores */}
          <button
            className="btn-outline-glow"
            onClick={() => navigate('/admin/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
          >
            <Lock size={14} /> Acceso Staff
          </button>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="landing-hero">

        {/* 1. ABRE EL WRAPPER AQUÍ */}
        <div className="hero-badges-wrapper">

          <div className="live-pill">
            <span className="pulse-dot"></span>
            <Sparkles size={13} className="pill-icon" />
            <span>IA clínica en tiempo real</span>
          </div>

          <div className="landing-badge">
            <Activity size={14} />
            Sistema de Triaje Inteligente
          </div>

        </div> {/* <--- 2. CIERRA EL WRAPPER EXACTAMENTE AQUÍ */}


        <h1 className="landing-title">
          Atención primaria<br />
          <span className="landing-title-accent">más rápida e inteligente</span>
        </h1>

        <p className="landing-subtitle">
          AuraMed utiliza inteligencia artificial para clasificar síntomas, priorizar pacientes
          y derivar especialidades en <strong>menos de 10 segundos</strong>.
        </p>

        <div className="landing-actions">
          {/* Botón principal para el paciente */}
          <button className="btn-shimmer" onClick={() => navigate('/triaje')}>
            Comenzar triaje <ChevronRight size={18} />
          </button>

          {/* MODIFICADO: Botón secundario para el login médico */}
          <button className="btn-glass" onClick={() => navigate('/admin/doctor')}>
            <Lock size={16} /> Portal Médico
          </button>
        </div>


        {/* MOCKUP VISUAL DE LA APP */}
        <div className="hero-mockup-container">
          <div className="hero-mockup-glow"></div>
          <div className="hero-mockup-window">
            <div className="mockup-header">
              <span className="mockup-dot red"></span>
              <span className="mockup-dot yellow"></span>
              <span className="mockup-dot green"></span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar"></div>
              <div className="mockup-content">
                <div className="mockup-card urgencia">
                  <div className="mockup-badge">URGENCIA</div>
                  <div className="mockup-line title">María Gómez • Dolor torácico</div>
                  <div className="mockup-line text">Opresión central severa, diaforesis, 58 años.</div>
                </div>
                <div className="mockup-card prioritario">
                  <div className="mockup-badge">PRIORITARIO</div>
                  <div className="mockup-line title">Juan Pérez • Fiebre alta</div>
                  <div className="mockup-line text">39.5°C, mialgia, cefalea intensa. 34 años.</div>
                </div>
                <div className="mockup-card general">
                  <div className="mockup-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>GENERAL</div>
                  <div className="mockup-line title">Ana Silva • Tos seca</div>
                  <div className="mockup-line text">Tos persistente hace 3 días, sin dificultad respiratoria.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-stats">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CÓMO FUNCIONA (Timeline / Steps) ─── */}
      <section className="landing-steps">
        <div className="section-head">
          <span className="section-eyebrow">FLUJO AUTOMATIZADO</span>
          <h2>Triaje en 3 pasos simples</h2>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Paciente ingresa síntomas</h3>
            <p>Usando voz o texto, el paciente describe qué le sucede de forma natural y sin fricción.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Claude IA clasifica</h3>
            <p>En milisegundos, la IA analiza el riesgo clínico, asigna prioridad y deriva a la especialidad.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Médico recibe la ficha</h3>
            <p>El paciente aparece automáticamente en el panel Kanban del doctor correspondiente.</p>
          </div>
        </div>
      </section>

      {/* ─── PRIORIDADES (Neon bars) ────────────────────────── */}
      <section className="landing-priorities">
        <div className="priority-card urgencia">
          <div className="priority-glow" />
          <span className="priority-dot" />
          <div className="priority-info">
            <strong>Urgencia</strong>
            <p>Riesgo de vida inmediato</p>
          </div>
        </div>

        <div className="priority-card prioritario">
          <div className="priority-glow" />
          <span className="priority-dot" />
          <div className="priority-info">
            <strong>Prioritario</strong>
            <p>Atención en menos de 2 horas</p>
          </div>
        </div>

        <div className="priority-card general">
          <div className="priority-glow" />
          <span className="priority-dot" />
          <div className="priority-info">
            <strong>General</strong>
            <p>Turno normal de atención</p>
          </div>
        </div>
      </section>

      {/* ─── MENTAL HEALTH WELLNESS ──────────────────────────── */}
      <section className="landing-wellness">
        <div className="section-head">
          <span className="section-eyebrow">MÁS QUE TRIAJE FÍSICO</span>
          <h2>Atención integral para tu mente</h2>
        </div>
        <div className="wellness-card">
          <div className="wellness-icon">
            <Brain size={32} />
          </div>
          <div className="wellness-content">
            <h2>¿Cómo está tu mente hoy?</h2>
            <p>La salud mental es tan importante como la física. Si te sientes abrumado, ansioso o necesitas contención, estamos aquí para ti. No esperes a una emergencia.</p>
            <button className="btn-wellness" onClick={() => navigate('/bienestar')}>
              Evaluación de Bienestar Preventivo
            </button>
          </div>
        </div>
      </section>

      {/* ─── FEATURES (Bento Grid) ──────────────────────────── */}
      <section className="landing-features">
        <div className="section-head">
          <span className="section-eyebrow">ARQUITECTURA CLÍNICA</span>
          <h2>Diseñado para la medicina del futuro</h2>
        </div>

        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              className="feature-card"
              key={title}
              style={{ '--feature-color': color } as React.CSSProperties}
            >
              <div className="feature-card-border" />
              <div className="feature-icon" style={{ color }}>
                <Icon size={24} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIOS (Social Proof) ─── */}
      <section className="landing-testimonials">
        <div className="section-head">
          <span className="section-eyebrow">CONFIANZA CLÍNICA</span>
          <h2>Aprobado por profesionales de la salud</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"AuraMed ha reducido los tiempos de espera en Urgencias en un 40%. La IA nunca se ha equivocado en derivar una alerta de infarto."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: '#3b82f6' }}>JS</div>
              <div className="author-info">
                <strong>Dr. Javier Salinas</strong>
                <span>Jefe de Urgencias</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"El modo Zen ha sido una revelación. Contener a pacientes con crisis de ansiedad antes de que entren al box cambia todo."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: '#ec4899' }}>MR</div>
              <div className="author-info">
                <strong>Dra. María Ramos</strong>
                <span>Psiquiatra Clínica</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"El Panel Kanban es tan intuitivo que nuestras enfermeras de triaje aprendieron a usarlo en 5 minutos. El diseño es impecable."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: '#10b981' }}>LT</div>
              <div className="author-info">
                <strong>Enf. Luis Torres</strong>
                <span>Coordinador Médico</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <section className="landing-cta">
        <div className="cta-box">
          <div className="cta-glow" />
          <h2>¿Listo para optimizar tu clínica?</h2>
          <p>Implementa AuraMed en tu centro de salud y reduce los tiempos de espera drásticamente.</p>
          <button className="btn-shimmer" onClick={() => navigate('/admin/dashboard')}>
            Agendar demo para tu clínica <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── MARQUEE INFINITO (Especialidades) ─── */}
      <section className="landing-marquee">
        <div className="marquee-content">
          <span>Cardiología Médica</span><span className="bullet">•</span>
          <span>Traumatología y Ortopedia</span><span className="bullet">•</span>
          <span>Medicina General</span><span className="bullet">•</span>
          <span>Salud Mental y Psiquiatría</span><span className="bullet">•</span>
          <span>Pediatría Integral</span><span className="bullet">•</span>
          <span>Neurología Avanzada</span><span className="bullet">•</span>
          {/* Duplicado para ilusión infinita */}
          <span>Cardiología Médica</span><span className="bullet">•</span>
          <span>Traumatología y Ortopedia</span><span className="bullet">•</span>
          <span>Medicina General</span><span className="bullet">•</span>
          <span>Salud Mental y Psiquiatría</span><span className="bullet">•</span>
          <span>Pediatría Integral</span><span className="bullet">•</span>
          <span>Neurología Avanzada</span><span className="bullet">•</span>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-column">
            <div className="landing-brand" style={{ marginBottom: '16px' }}>
              <div className="logo-container">
                <span className="landing-logo">⚕</span>
              </div>
              <span>Aura<strong>Med</strong></span>
            </div>
            <p className="footer-description" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '250px' }}>
              El primer sistema de triaje impulsado por IA clínica para la medicina del futuro.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4>Producto</h4>
              <a href="#">Triaje IA</a>
              <a href="#">Panel Médico</a>
              <a href="#">Seguridad HIPAA</a>
            </div>
            <div className="footer-col">
              <h4>Compañía</h4>
              <a href="#">Sobre nosotros</a>
              <a href="#">Casos de éxito</a>
              <a href="#">Contacto</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacidad</a>
              <a href="#">Términos de servicio</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 AuraMed. Todos los derechos reservados.</span>
          <span className="footer-credit">Proyecto personal de Martin Aburto en proceso.</span>
        </div>
      </footer>

    </div>
  )
}