import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/crm-v2-1-[name]-[hash].js',
        chunkFileNames: 'assets/crm-v2-1-[name]-[hash].js',
        assetFileNames: 'assets/crm-v2-1-[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      }
    }
  }
})
