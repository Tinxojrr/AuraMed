// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { Mic } from 'lucide-react'
import toast from 'react-hot-toast'
import './VoiceButton.css'

export default function VoiceButton({ onTranscript }) {
  const [isSupported, setIsSupported] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-CL'
    recognition.continuous = true // Mantiene el dictado activo mientras se mantenga presionado
    recognition.interimResults = false // Solo nos importa el resultado final de la oración

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento de voz:', event.error)
      if (event.error === 'not-allowed') {
        toast.error('Permiso de micrófono denegado')
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    // Cleanup: detiene la grabación si el componente se desmonta
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript])

  const startRecording = (e) => {
    e.preventDefault()
    if (!isSupported || !recognitionRef.current || isRecording) return
    setIsRecording(true)
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error(err)
    }
  }

  const stopRecording = (e) => {
    e.preventDefault()
    if (!isRecording || !recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch (err) {
      console.error(err)
    }
    // No cambiamos isRecording a false inmediatamente,
    // esperamos a que el evento onend se dispare para asegurar
    // que se capture la última palabra dicha al soltar el botón.
  }

  if (!isSupported) return null

  return (
    <button
      type="button"
      className={`voice-btn ${isRecording ? 'recording' : ''}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      title="Mantén presionado para hablar"
    >
      <div className="voice-btn-inner">
        <Mic size={18} />
      </div>
      {isRecording && (
        <div className="voice-waves">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </button>
  )
}
