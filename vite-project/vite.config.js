import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // No plugins — we're serving pure vanilla JS
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
