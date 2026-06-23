import { useState } from 'react'
import { X, Activity, Bot, FileText, CheckCircle, Clock, Download } from 'lucide-react'
import html2pdf from 'html2pdf.js'
import './ClinicalDrawer.css'

const PRIORITY_COLORS = {
  URGENCIA:    { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  PRIORITARIO: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  GENERAL:     { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
}

export default function ClinicalDrawer({ paciente, onClose, onFinalizar }) {
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)

  if (!paciente) return null

  const config = PRIORITY_COLORS[paciente.prioridad] || PRIORITY_COLORS.GENERAL

  const handleFinalizar = async () => {
    setGuardando(true)
    try {
      const element = document.getElementById('ficha-clinica-pdf')
      const opt = {
        margin:       [15, 15, 15, 15],
        filename:     `Ficha_${paciente.paciente_nombre.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob')
      const fileName = `${paciente.paciente_rut || paciente.id}_${Date.now()}.pdf`
      
      await onFinalizar(paciente.id, 'atendido', notas, pdfBlob, fileName)
    } catch (error) {
      console.error('Error generando/subiendo PDF:', error)
      await onFinalizar(paciente.id, 'atendido', notas, null, null)
    } finally {
      setGuardando(false)
    }
  }

  const descargarPDF = async () => {
    setGenerandoPDF(true)
    const element = document.getElementById('ficha-clinica-pdf')
    
    // Opciones para asegurar formato formal A4
    const opt = {
      margin:       [15, 15, 15, 15],
      filename:     `Ficha_Clinica_${paciente.paciente_nombre.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    try {
      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generando PDF:', error)
    } finally {
      setGenerandoPDF(false)
    }
  }

  return (
    <>
      {/* Fondo oscuro interactivo */}
      <div className="drawer-overlay" onClick={onClose} />
      
      {/* Panel lateral */}
      <div className="drawer-panel">
        
        {/* Contenedor que se exportará a PDF */}
        <div id="ficha-clinica-pdf" className="pdf-wrapper">
          {/* Cabecera */}
          <div className="drawer-header">
            <div className="pdf-header-content">
              <div className="drawer-badge" style={{ background: config.bg, color: config.color }}>
                <Activity size={14} />
                {paciente.prioridad}
              </div>
              <h2>{paciente.paciente_nombre}</h2>
              <p className="drawer-meta">
                RUT: {paciente.paciente_rut || 'No registrado'} • Ingreso: {new Date(paciente.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="drawer-header-actions" data-html2canvas-ignore="true">
              <button 
                className="btn-download-pdf" 
                onClick={descargarPDF}
                disabled={generandoPDF}
                title="Descargar Ficha en PDF"
              >
                <Download size={18} />
              </button>
              <button className="btn-close-drawer" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="drawer-body">
          
          {/* Sección 1: Lo que dijo el paciente */}
          <div className="clinical-section">
            <h3 className="section-title">
              <FileText size={16} /> Motivo de Consulta (Textual)
            </h3>
            <div className="clinical-box patient-text">
              "{paciente.sintomas_texto}"
            </div>
          </div>

          {/* Sección 2: El Cerebro de AuraMed (XAI) */}
          <div className="clinical-section">
            <h3 className="section-title ai-title">
              <Bot size={16} /> Razonamiento IA
            </h3>
            <div className="clinical-box ai-box">
              <p className="ai-summary">{paciente.resumen_clinico || 'Sin resumen generado por IA.'}</p>
              
              {/* Aquí simularemos las "Red Flags" y preguntas que la IA sugiere al médico */}
              <div className="ai-suggestions">
                <strong>Sugerencias para el interrogatorio:</strong>
                <ul>
                  <li>¿El dolor aumenta al palpar la zona?</li>
                  <li>¿Ha presentado fiebre en las últimas 12 horas?</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sección 3: El espacio de trabajo del Doctor */}
          <div className="clinical-section">
            <h3 className="section-title">
              <Activity size={16} /> Evolución Clínica
            </h3>
            <textarea 
              className="doctor-notes"
              placeholder="Escriba aquí el examen físico, diagnóstico y tratamiento indicado..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

        </div>
        </div> {/* Cierra pdf-wrapper */}

        {/* Footer con el llamado a la acción */}
        <div className="drawer-footer" data-html2canvas-ignore="true">
          <button className="btn-secondary" onClick={onClose}>
            Mantener en consulta
          </button>
          <button 
            className="btn-primary" 
            onClick={handleFinalizar}
            disabled={guardando}
          >
            <CheckCircle size={18} />
            {guardando ? 'Guardando...' : 'Dar de alta (Atendido)'}
          </button>
        </div>

      </div>
    </>
  )
}