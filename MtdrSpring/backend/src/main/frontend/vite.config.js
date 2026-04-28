import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use 127.0.0.1 instead of localhost to avoid IPv6/IPv4 proxy resolution issues on Windows.
const backendTarget = process.env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
