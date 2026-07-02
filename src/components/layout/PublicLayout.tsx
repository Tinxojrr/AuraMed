import { Link } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'
import { Sun, Moon, ArrowLeft } from 'lucide-react'
import './Navbar.css' // Reutilizamos los estilos maestros de tu Navbar

export default function PublicLayout({ children }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="public-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      
      {/* ─── BARRA DE NAVEGACIÓN DEL PACIENTE ─── */}
      <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            to="/" 
            title="Volver a la página principal"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--text-muted)', 
              fontSize: '0.85rem', 
              textDecoration: 'none', 
              fontWeight: 600 
            }}
          >
            <ArrowLeft size={16} /> Salir del triaje
          </Link>

          <div className="navbar-brand" style={{ pointerEvents: 'none', marginLeft: '10px' }}>
            <span className="navbar-logo">⚕</span>
            <span className="navbar-name">Aura<strong>Med</strong></span>
          </div>
        </div>

        {/* A la derecha: EXCLUSIVAMENTE el botón de noche/día */}
        <button className="navbar-theme-btn" onClick={toggleTheme} aria-label="Cambiar tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

      </nav>

      {/* ─── CONTENEDOR DEL FORMULARIO (Con el espacio anti-techo) ─── */}
      <main style={{ 
        flex: 1, 
        paddingTop: '104px', /* <--- ESTA ES LA DISTANCIA MÁGICA QUE LO DESPEGA DEL TECHO */
        paddingBottom: '60px',
        maxWidth: '1000px', 
        width: '100%', 
        margin: '0 auto',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        {children}
      </main>

    </div>
  )
}