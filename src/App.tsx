import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase' // Asegúrate de que esta ruta apunte a donde instancias supabase
import PageLayout   from '@/components/layout/PageLayout'
import Landing      from '@/pages/Landing'
import Triage       from '@/pages/Triage'
import Dashboard    from '@/pages/Dashboard'
import MedicalPanel from '@/pages/MedicalPanel'
import History      from '@/pages/History'
import Login        from '@/pages/Login'
import PublicLayout from '@/components/layout/PublicLayout'

// 🛡️ El Guardia de Seguridad
const ProtectedRoute = ({ children, session }) => {
  const location = useLocation()
  
  if (!session) {
    // Si no hay sesión, lo enviamos al login y guardamos la ruta que intentaba ver
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

import PatientTicket from '@/pages/PatientTicket'
import FamilyTracker from '@/pages/FamilyTracker'
import MentalTriage  from '@/pages/MentalTriage'
import DoctorView    from '@/pages/DoctorView'
import Kiosco        from '@/pages/Kiosco'

export default function App() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Esto revisa si el usuario está logueado cuando se carga la app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mientras verifica en la base de datos, mostramos una pantalla negra (o tu skeleton)
  if (isLoading) return <div style={{ height: '100vh', background: 'var(--bg-page)' }} />

  return (
    <Routes>
      {/* UNIVERSO PACIENTE (Público) */}
      <Route path="/" element={<Landing />} />
      
      <Route path="/triaje" element={
        <PublicLayout>
          <Triage />
        </PublicLayout>
      } />

      <Route path="/bienestar" element={
        <MentalTriage />
      } />
      
      <Route path="/kiosco" element={<Kiosco />} />
      
      <Route path="/ticket/:id" element={<PatientTicket />} />
      <Route path="/seguimiento/:id" element={<FamilyTracker />} />
      
      <Route path="/login" element={
        session ? <Navigate to="/admin/dashboard" replace /> : <Login />
      } />

      {/* 🏥 UNIVERSO HOSPITAL (Protegido por contraseña) */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute session={session}>
          <PageLayout>
            <div style={{ paddingTop: '30px' }}>
              <Dashboard />
            </div>
          </PageLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/ingreso" element={
        <ProtectedRoute session={session}>
          <PageLayout>
            <div style={{ paddingTop: '30px' }}>
              <Triage />
            </div>
          </PageLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/panel" element={
        <ProtectedRoute session={session}>
          <PageLayout>
            <div style={{ paddingTop: '30px' }}>
              <MedicalPanel />
            </div>
          </PageLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/doctor" element={
        <ProtectedRoute session={session}>
          <PageLayout>
            <div style={{ paddingTop: '30px' }}>
              <DoctorView />
            </div>
          </PageLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/historial" element={
        <ProtectedRoute session={session}>
          <PageLayout>
            <div style={{ paddingTop: '30px' }}>
              <History />
            </div>
          </PageLayout>
        </ProtectedRoute>
      } />

      {/* Rutas huérfanas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}