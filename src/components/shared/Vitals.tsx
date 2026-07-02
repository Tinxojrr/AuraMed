import React from 'react'
import { Activity, Heart, Thermometer, Wind } from 'lucide-react'
import './Vitals.css'

export default function Vitals({ vitals, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...vitals, [field]: value })
  }

  // Helper para determinar si un valor es crítico (para aplicar animaciones CSS)
  const getStatusClass = (field, value) => {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num) && field !== 'bp') return ''

    switch(field) {
      case 'hr': return (num > 120 || num < 50) ? 'vital-danger' : 'vital-normal'
      case 'temp': return (num >= 38.5 || num < 35) ? 'vital-danger' : 'vital-normal'
      case 'spo2': return (num < 92) ? 'vital-danger' : 'vital-normal'
      case 'bp': 
        if(value.includes('/')) {
          const sys = parseInt(value.split('/')[0])
          if(sys > 180 || sys < 90) return 'vital-danger'
          return 'vital-normal'
        }
        return ''
      default: return ''
    }
  }

  return (
    <div className="vitals-wrapper">
      <div className="vitals-title">
        <Activity size={15} color="#3B82F6" />
        <span>Constantes Vitales</span>
      </div>
      
      <div className="vitals-grid">
        <div className={`vital-box ${getStatusClass('hr', vitals.hr)}`}>
          <div className="vital-header"><Heart size={13} /> FC (LPM)</div>
          <input type="number" placeholder="Ej: 80" value={vitals.hr} onChange={(e) => handleChange('hr', e.target.value)} />
        </div>

        <div className={`vital-box ${getStatusClass('bp', vitals.bp)}`}>
          <div className="vital-header"><Activity size={13} /> PA (mmHg)</div>
          <input type="text" placeholder="Ej: 120/80" value={vitals.bp} onChange={(e) => handleChange('bp', e.target.value)} />
        </div>

        <div className={`vital-box ${getStatusClass('temp', vitals.temp)}`}>
          <div className="vital-header"><Thermometer size={13} /> Temp (°C)</div>
          <input type="number" step="0.1" placeholder="Ej: 36.5" value={vitals.temp} onChange={(e) => handleChange('temp', e.target.value)} />
        </div>

        <div className={`vital-box ${getStatusClass('spo2', vitals.spo2)}`}>
          <div className="vital-header"><Wind size={13} /> SpO2 (%)</div>
          <input type="number" placeholder="Ej: 98" value={vitals.spo2} onChange={(e) => handleChange('spo2', e.target.value)} />
        </div>
      </div>
    </div>
  )
}
