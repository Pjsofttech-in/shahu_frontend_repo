import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/remote-media': {
        target: 'https://shrishahuprabodhini.in',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/remote-media/, ''),
      },
      '/api/api2': {
        target: 'https://shrishahuprabodhini.in',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
