import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/ui/",
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:9001'
    }
  }
})
