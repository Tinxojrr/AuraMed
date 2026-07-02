import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import os from 'os'

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true
  },
  define: {
    '__LOCAL_IP__': JSON.stringify(getLocalIP())
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
