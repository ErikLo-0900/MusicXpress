import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MusicXpress/', // Configura la ruta base correcta para el despliegue en GitHub Pages
})
