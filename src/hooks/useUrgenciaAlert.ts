import { useEffect, useRef, useCallback } from 'react'

// Contexto de audio compartido — se activa con el primer clic del usuario
let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Reanudar si fue suspendido por el navegador
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function crearSonidoAlerta() {
  try {
    const ctx = getAudioContext()

    const beep = (freq, start, duration) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration + 0.05)
    }

    beep(880, 0,   0.18)
    beep(880, 0.25, 0.18)
    beep(1100, 0.5, 0.28)
  } catch (e) {
    console.warn('Audio no disponible:', e)
  }
}

export function useUrgenciaAlert(triajes) {
  const prevIdsRef  = useRef(new Set())
  const iniciadoRef = useRef(false)

  // Activar contexto de audio con el primer clic del usuario en la página
  useEffect(() => {
    const activar = () => { try { getAudioContext() } catch(e) {} }
    document.addEventListener('click', activar, { once: true })
    return () => document.removeEventListener('click', activar)
  }, [])

  useEffect(() => {
    if (!iniciadoRef.current) {
      prevIdsRef.current = new Set(triajes.map(t => t.id))
      iniciadoRef.current = true
      return
    }

    const nuevasUrgencias = triajes.filter(
      t => t.prioridad === 'URGENCIA' && !prevIdsRef.current.has(t.id)
    )

    if (nuevasUrgencias.length > 0) {
      crearSonidoAlerta()
    }

    prevIdsRef.current = new Set(triajes.map(t => t.id))
  }, [triajes])

  // Exportar función para probar el sonido manualmente
  return { probarSonido: crearSonidoAlerta }
}
