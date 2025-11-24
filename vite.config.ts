import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
    // Code splitting optimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors grandes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'maps-vendor': ['@react-google-maps/api'],
        },
      },
    },
    // Optimizaciones adicionales
    cssCodeSplit: true,
    sourcemap: false, // Desactivar sourcemaps en producción
    chunkSizeWarningLimit: 1000,
  },
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    // Optimizaciones para desarrollo
    hmr: {
      overlay: false,
    },
  },
})
