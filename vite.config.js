import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mapbox-gl') || id.includes('react-map-gl')) return 'maps'
            if (id.includes('recharts')) return 'charts'
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'reporting'
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor'
          }
        }
      }
    }
  }
})
