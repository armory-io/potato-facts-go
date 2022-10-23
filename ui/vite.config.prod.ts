import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/prod/ui/",
  plugins: [react()],
  build: {
    outDir: 'dist/prod'
  }
})
