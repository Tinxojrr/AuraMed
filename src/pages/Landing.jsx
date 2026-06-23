import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'
import { Activity, Brain, Clock, Shield, ChevronRight, Sun, Moon, Zap, Users, BarChart2, Sparkles, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import './Landing.css'

const STATS = [
  { value: '< 10s', label: 'Tiempo de triaje IA' },
  { value: '95%',   label: 'Precisión clínica' },
  { value: '3',     label: 'Niveles de prioridad' },
  { value: '10+',   label: 'Especialidades' },
]

const FEATURES = [
  { icon: Brain,     title: 'IA clínica avanzada',     desc: 'Claude analiza síntomas en lenguaje natural y clasifica la urgencia en segundos.', color: '#3b82f6' },
  { icon: Zap,       title: 'Triaje en tiempo real',   desc: 'Cuerpo humano interactivo, resultados instantáneos y alertas visuales por prioridad.', color: '#f59e0b' },
  { icon: Users,     title: 'Panel médico Kanban',     desc: 'Gestión visual de pacientes con arrastrar y soltar. Disponibilidad en vivo.', color: '#10b981' },
  { icon: BarChart2, title: 'Dashboard analítico',     desc: 'Estadísticas en tiempo real: carga por especialidad, urgencias del día, tendencias.', color: '#8b5cf6' },
  { icon: Clock,     title: 'Historial auditable',     desc: 'Cada triaje queda registrado en la nube con su línea de tiempo completa.', color: '#ef4444' },
  { icon: Shield,    title: 'Seguro y confiable',      desc: 'Base de datos relacional con RLS, acceso controlado y datos encriptados.', color: '#06b6d4' },
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
            onClick={() => navigate('/login')}
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
            <span>Motor Claude 3.5 Sonnet activo en el servidor</span>
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
          <button className="btn-glass" onClick={() => navigate('/login')}>
            <Lock size={16} /> Portal Médico
          </button>
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
              style={{ '--feature-color': color }} 
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

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <section className="landing-cta">
        <div className="cta-box">
          <div className="cta-glow" />
          <h2>¿Listo para optimizar tu sala de espera?</h2>
          <p>Prueba el flujo de ingreso de síntomas ahora mismo. No requiere tarjeta.</p>
          <button className="btn-shimmer" onClick={() => navigate('/triaje')}>
            Probar AuraMed gratis <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="landing-brand">
            <span className="landing-logo">⚕</span>
            <span>Aura<strong>Med</strong></span>
          </div>
          <span className="footer-copy">Proyecto de Título © 2025. Todos los derechos reservados.</span>
        </div>
      </footer>

    </div>
  )
}