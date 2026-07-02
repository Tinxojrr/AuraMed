import './EVAScale.css'

const LABELS = {
  0:  { text: 'Sin dolor',        color: '#16A34A' },
  1:  { text: 'Muy leve',         color: '#22C55E' },
  2:  { text: 'Leve',             color: '#84CC16' },
  3:  { text: 'Leve-moderado',    color: '#BEF264' },
  4:  { text: 'Moderado',         color: '#EAB308' },
  5:  { text: 'Moderado',         color: '#F59E0B' },
  6:  { text: 'Moderado-intenso', color: '#F97316' },
  7:  { text: 'Intenso',          color: '#EA580C' },
  8:  { text: 'Muy intenso',      color: '#DC2626' },
  9:  { text: 'Insoportable',     color: '#B91C1C' },
  10: { text: 'El peor dolor',    color: '#7F1D1D' },
}

export default function EVAScale({ value, onChange }) {
  const config = LABELS[value] || LABELS[0]

  return (
    <div className="eva-wrapper">
      <div className="eva-header">
        
        {/* El nuevo "Pill" clínico en reemplazo del emoji */}
        <div 
          className="eva-severity-node" 
          style={{ 
            backgroundColor: config.color,
            boxShadow: `0 0 16px ${config.color}55`
          }}
        >
          {value}
        </div>

        <div className="eva-header-text">
          <span className="eva-subtitle">Escala Visual Analógica (0-10)</span>
          <span className="eva-main-label" style={{ color: config.color }}>
            {config.text}
          </span>
        </div>

      </div>

      <div className="eva-slider-wrap">
        <input
          type="range"
          min="0" max="10" step="1"
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="eva-slider"
          style={{ '--thumb-color': config.color, '--fill': `${value * 10}%` } as React.CSSProperties}
        />
        <div className="eva-ticks">
          {Array.from({ length: 11 }, (_, i) => (
            <span 
              key={i} 
              className={`eva-tick ${i === value ? 'active' : ''}`}
              style={i === value ? { color: config.color, fontWeight: 700 } : {}}
            >
              {i}
            </span>
          ))}
        </div>
      </div>

      <div className="eva-extremes">
        <span>0 — Ausencia de dolor</span>
        <span>10 — Dolor máximo imaginable</span>
      </div>
    </div>
  )
}