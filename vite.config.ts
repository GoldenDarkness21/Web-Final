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
        passes: 2, // Dos pasadas para mejor compresión
      },
      mangle: {
        safari10: true,
      },
    },
    // Code splitting optimizado
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'redux-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            if (id.includes('@react-google-maps')) {
              return 'maps-vendor'
            }
            return 'vendor'
          }
        },
        // Nombres de archivo con hash para cache eficiente
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimizaciones adicionales
    cssCodeSplit: true,
    sourcemap: false, // Desactivar sourcemaps en producción
    chunkSizeWarningLimit: 1000,
    // Optimizaciones de assets
    assetsInlineLimit: 4096, // Inline assets menores a 4kb
    reportCompressedSize: false, // Más rápido en build
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
