/// <reference types="vite/client" />
import { ThreeElements } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare const __LOCAL_IP__: string;
interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; webkitAudioContext: any; }