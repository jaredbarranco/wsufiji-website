import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://192.168.0.221:8787',
        changeOrigin: true,
      }
    }
  },
  preview: {
    allowedHosts: ["review.barrancolab.com"]
  }
})
