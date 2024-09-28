import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 3000, // Vite will serve on this port
  },
  build: {
    outDir: 'dist', // Where the build files will go
  }
})
