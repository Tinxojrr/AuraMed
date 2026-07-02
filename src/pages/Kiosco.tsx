import { useEffect } from 'react';
import Triage from '@/pages/Triage';

export default function Kiosco() {
  // Auto-reset por inactividad (60 segundos)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        window.location.reload(); 
      }, 60000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Kiosk Branding header */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚕️</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>AuraMed <span style={{ color: 'var(--color-primary)' }}>Tótem</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Terminal de auto-atención de Urgencias</p>
          </div>
        </div>
        <div style={{ flexDirection: 'column', alignItems: 'flex-end', display: window.innerWidth > 768 ? 'flex' : 'none' }}>
          <span style={{
            padding: '0.375rem 1rem', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.875rem', fontWeight: 500
          }}>
            Sistema en Línea
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>Se reiniciará tras 60s de inactividad</p>
        </div>
      </div>

      {/* Embedded Triage Flow */}
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        flex: 1
      }}>
        <Triage />
      </div>
    </div>
  );
}
