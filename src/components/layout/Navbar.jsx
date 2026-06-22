import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'
import { Sun, Moon, Activity, LayoutDashboard, Users, History, LogOut } from 'lucide-react'
import { cerrarSesion } from '@/services/supabase'
import toast from 'react-hot-toast'
import './Navbar.css'

const links = [
  { to: '/admin/ingreso',   label: 'Nuevo Ingreso', icon: Activity },
  { to: '/admin/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/panel',     label: 'Panel Médico',  icon: Users },
  { to: '/admin/historial', label: 'Historial',     icon: History }
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion()
      toast.success('Sesión cerrada correctamente')
      navigate('/login')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <nav className="navbar">
      <Link to="/admin/dashboard" className="navbar-brand">
        <span className="navbar-logo">⚕</span>
        <span className="navbar-name">Aura<strong>Med</strong></span>
      </Link>

      <ul className="navbar-links">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className={`navbar-link ${pathname === to ? 'active' : ''}`}>
              <Icon size={16} />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Contenedor de botones de acción a la derecha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="navbar-theme-btn" onClick={toggleTheme} aria-label="Cambiar tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        {/* NUEVO BOTÓN DE CERRAR SESIÓN */}
        <button 
          className="navbar-theme-btn" 
          onClick={handleCerrarSesion} 
          aria-label="Cerrar sesión"
          style={{ color: '#EF4444' }} // Lo ponemos rojito para que destaque
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}