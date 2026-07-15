import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'
import { Activity, Brain, Clock, Shield, ChevronRight, Sun, Moon, Zap, Users, BarChart2, Sparkles, Lock, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, useScroll, useMotionValueEvent, animate, useMotionValue, useTransform } from 'framer-motion'
import './Landing.css'

const STATS = [
  { value: '< 10s', label: 'Tiempo de triaje IA' },
  { value: '95%', label: 'Precisión clínica' },
  { value: '3', label: 'Niveles de prioridad' },
  { value: '10+', label: 'Especialidades' },
]

const FEATURES = [
  { icon: Brain, title: 'IA clínica avanzada', desc: 'Claude analiza síntomas en lenguaje natural y clasifica la urgencia en segundos.', color: '#0284c7' },
  { icon: Zap, title: 'Triaje en tiempo real', desc: 'Cuerpo humano interactivo, resultados instantáneos y alertas visuales por prioridad.', color: '#0d9488' },
  { icon: Users, title: 'Panel médico Kanban', desc: 'Gestión visual de pacientes con arrastrar y soltar. Disponibilidad en vivo.', color: '#0284c7' },
  { icon: BarChart2, title: 'Dashboard analítico', desc: 'Estadísticas en tiempo real: carga por especialidad, urgencias del día, tendencias.', color: '#0d9488' },
  { icon: Clock, title: 'Historial auditable', desc: 'Cada triaje queda registrado en la nube con su línea de tiempo completa.', color: '#0284c7' },
  { icon: Shield, title: 'Seguro y confiable', desc: 'Base de datos relacional con RLS, acceso controlado y datos encriptados.', color: '#0d9488' },
]

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } }
};

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const isNumeric = /^\d+/.test(value) || /\d+$/.test(value) || /\d/.test(value);
  const numericPart = parseInt(value.replace(/\D/g, ''), 10) || 0;
  const prefix = value.match(/^[^\d]+/)?.[0] || '';
  const suffix = value.match(/[^\d]+$/)?.[0] || '';

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  return (
    <motion.div
      className="stat-card"
      variants={fadeInUp}
      onViewportEnter={() => {
        if (isNumeric) animate(count, numericPart, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
      }}
      viewport={{ once: true, margin: "-10%" }}
    >
      <span className="stat-value">
        {isNumeric ? (
          <>{prefix}<motion.span>{rounded}</motion.span>{suffix}</>
        ) : (
          value
        )}
      </span>
      <span className="stat-label">{label}</span>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20)
  })

  return (
    <div className={`landing ${theme}`}>

      {/* Orbes de luz ambientales flotando en el fondo */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-brand">
          <div className="logo-container">
            <span className="landing-logo">⚕</span>
          </div>
          <span>Aura<strong>Med</strong></span>
        </div>

        {/* NAVEGACIÓN DESKTOP & MOBILE */}
        <nav className={`landing-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#flujo" onClick={() => setIsMobileMenuOpen(false)}>Cómo funciona</a>
          <a href="#dashboard" onClick={() => setIsMobileMenuOpen(false)}>Producto</a>
          <a href="#testimonios" onClick={() => setIsMobileMenuOpen(false)}>Testimonios</a>
          <a href="#cta" onClick={() => setIsMobileMenuOpen(false)}>Clínicas</a>
        </nav>

        <div className="landing-header-right">
          <button className="landing-theme" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* NUEVO: Botón sutil en el header para los doctores */}
          <button
            className="btn-outline-glow btn-staff"
            onClick={() => navigate('/admin/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
          >
            <Lock size={14} /> Acceso Staff
          </button>

          {/* BOTÓN MENÚ HAMBURGUESA (Mobile) */}
          <button className="landing-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menú">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <motion.section className="landing-hero" variants={staggerContainer} initial="hidden" animate="show">

        {/* 1. ABRE EL WRAPPER AQUÍ */}
        <motion.div className="hero-badges-wrapper" variants={fadeInUp}>
          <div className="landing-badge editorial-badge">
            <span className="badge-text">IA CLÍNICA EN TIEMPO REAL</span>
          </div>
          <div className="landing-badge editorial-badge">
            <span className="badge-text">SISTEMA DE TRIAJE</span>
          </div>
        </motion.div> {/* <--- 2. CIERRA EL WRAPPER EXACTAMENTE AQUÍ */}


        <motion.h1 className="landing-title" variants={fadeInUp}>
          Atención primaria<br />
          <span className="landing-title-accent">más rápida e inteligente</span>
        </motion.h1>

        <motion.p className="landing-subtitle" variants={fadeInUp}>
          AuraMed utiliza inteligencia artificial para clasificar síntomas, priorizar pacientes
          y derivar especialidades en <strong>menos de 10 segundos</strong>.
        </motion.p>

        <motion.div className="landing-actions" variants={fadeInUp}>
          {/* Botón principal para el paciente */}
          <button className="btn-shimmer" onClick={() => navigate('/triaje')}>
            Comenzar triaje <ChevronRight size={18} />
          </button>

          {/* MODIFICADO: Botón secundario para el login médico */}
          <button className="btn-glass" onClick={() => navigate('/admin/doctor')}>
            <Lock size={16} /> Portal Médico
          </button>
        </motion.div>


        {/* MOCKUP VISUAL DE LA APP (Estilo Ficha Clínica) */}
        <motion.div className="hero-mockup-container" variants={fadeInUp}>
          <div className="hero-mockup-window editorial-card">
            <div className="mockup-body">
              <div className="mockup-content">
                <motion.div 
                  className="mockup-card urgencia"
                  animate={{ borderLeftColor: ['#ef4444', 'rgba(239,68,68,0.3)', '#ef4444'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <div className="mockup-badge">URGENCIA</div>
                  <div className="mockup-line title">María Gómez • Dolor torácico</div>
                  <div className="mockup-line text">Opresión central severa, diaforesis, 58 años.</div>
                </motion.div>
                <div className="mockup-card prioritario">
                  <div className="mockup-badge">PRIORITARIO</div>
                  <div className="mockup-line title">Juan Pérez • Fiebre alta</div>
                  <div className="mockup-line text">39.5°C, mialgia, cefalea intensa. 34 años.</div>
                </div>
                <div className="mockup-card general">
                  <div className="mockup-badge">GENERAL</div>
                  <div className="mockup-line title">Ana Silva • Tos seca</div>
                  <div className="mockup-line text">Tos persistente hace 3 días, sin dificultad respiratoria.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="landing-stats"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
        >
          {STATS.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} />
          ))}
        </motion.div>
      </motion.section>

      {/* ─── MARQUEE INFINITO (Especialidades) ─── */}
      <motion.section 
        className="landing-marquee"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8 }}
      >
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
      </motion.section>

      {/* ─── CÓMO FUNCIONA (Timeline / Steps) ─── */}
      <motion.section 
        className="landing-steps" id="flujo"
        variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span className="section-eyebrow">FLUJO AUTOMATIZADO</span>
          <h2>Triaje en 3 pasos simples</h2>
        </motion.div>
        <div className="steps-container">
          <motion.div className="step-card" variants={fadeInUp}>
            <div className="step-number">1</div>
            <h3>Paciente ingresa síntomas</h3>
            <p>Usando voz o texto, el paciente describe qué le sucede de forma natural y sin fricción.</p>
          </motion.div>
          <motion.div className="step-connector" variants={fadeInUp}></motion.div>
          <motion.div className="step-card" variants={fadeInUp}>
            <div className="step-number">2</div>
            <h3>Claude IA clasifica</h3>
            <p>En milisegundos, la IA analiza el riesgo clínico, asigna prioridad y deriva a la especialidad.</p>
          </motion.div>
          <motion.div className="step-connector" variants={fadeInUp}></motion.div>
          <motion.div className="step-card" variants={fadeInUp}>
            <div className="step-number">3</div>
            <h3>Médico recibe la ficha</h3>
            <p>El paciente aparece automáticamente en el panel Kanban del doctor correspondiente.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── PRIORIDADES (Neon bars) ────────────────────────── */}
      <motion.section 
        className="landing-priorities"
        variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
      >
        <motion.div className="priority-card urgencia" variants={fadeInUp}>
          <div className="priority-glow" />
          <span className="priority-dot" />
          <div className="priority-info">
            <strong>Urgencia</strong>
            <p>Riesgo de vida inmediato</p>
          </div>
        </motion.div>

        <motion.div className="priority-card prioritario" variants={fadeInUp}>
          <div className="priority-glow" />
          <span className="priority-dot" />
          <div className="priority-info">
            <strong>Prioritario</strong>
            <p>Atención en menos de 2 horas</p>
          </div>
        </motion.div>

        <motion.div className="priority-card general" variants={fadeInUp}>
          <div className="priority-glow" />
          <span className="priority-dot" />
          <div className="priority-info">
            <strong>General</strong>
            <p>Turno normal de atención</p>
          </div>
        </motion.div>
      </motion.section>

      {/* ─── MENTAL HEALTH WELLNESS ──────────────────────────── */}
      <motion.section 
        className="landing-wellness"
        variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span className="section-eyebrow">MÁS QUE TRIAJE FÍSICO</span>
          <h2>Atención integral para tu mente</h2>
        </motion.div>
        <motion.div className="wellness-card" variants={fadeInUp}>
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
        </motion.div>
      </motion.section>

      {/* ─── FEATURES (Bento Grid) ──────────────────────────── */}
      <motion.section 
        className="landing-features" id="dashboard"
        variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span className="section-eyebrow">ARQUITECTURA CLÍNICA</span>
          <h2>Diseñado para la medicina del futuro</h2>
        </motion.div>

        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <motion.div
              className="feature-card"
              variants={fadeInUp}
              key={title}
              style={{ '--feature-color': color } as React.CSSProperties}
            >
              <div className="feature-card-border" />
              <div className="feature-icon" style={{ color }}>
                <Icon size={24} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── TESTIMONIOS (Social Proof) ─── */}
      <motion.section 
        className="landing-testimonials" id="testimonios"
        variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span className="section-eyebrow">CONFIANZA CLÍNICA</span>
          <h2>Aprobado por profesionales de la salud</h2>
        </motion.div>
        <div className="testimonials-grid">
          <motion.div className="testimonial-card" variants={fadeInUp}>
            <p>"AuraMed ha reducido los tiempos de espera en Urgencias en un 40%. La IA nunca se ha equivocado en derivar una alerta de infarto."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: '#3b82f6' }}>JS</div>
              <div className="author-info">
                <strong>Dr. Javier Salinas</strong>
                <span>Jefe de Urgencias</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="testimonial-card" variants={fadeInUp}>
            <p>"El modo Zen ha sido una revelación. Contener a pacientes con crisis de ansiedad antes de que entren al box cambia todo."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: '#ec4899' }}>MR</div>
              <div className="author-info">
                <strong>Dra. María Ramos</strong>
                <span>Psiquiatra Clínica</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="testimonial-card" variants={fadeInUp}>
            <p>"El Panel Kanban es tan intuitivo que nuestras enfermeras de triaje aprendieron a usarlo en 5 minutos. El diseño es impecable."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: '#10b981' }}>LT</div>
              <div className="author-info">
                <strong>Enf. Luis Torres</strong>
                <span>Coordinador Médico</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <motion.section 
        className="landing-cta" id="cta"
        variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}
      >
        <div className="cta-box">
          <div className="cta-glow" />
          <h2>¿Listo para optimizar tu clínica?</h2>
          <p>Implementa AuraMed en tu centro de salud y reduce los tiempos de espera drásticamente.</p>
          <button className="btn-shimmer" onClick={() => navigate('/admin/dashboard')}>
            Agendar demo para tu clínica <ChevronRight size={18} />
          </button>
        </div>
      </motion.section>



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
          <span className="footer-copy">© 2026 AuraMed. Todos los derechos reservados. — Proyecto personal de Martín Aburto.</span>
        </div>
      </footer>

    </div>
  )
}