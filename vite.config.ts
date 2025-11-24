import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Minificación con esbuild (más rápido y confiable)
    minify: 'esbuild',
    // Code splitting optimizado
    rollupOptions: {
      output: {
        manualChunks: undefined, // Dejar que Vite maneje el chunking automáticamente
        // Nombres de archivo con hash para cache eficiente
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
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
