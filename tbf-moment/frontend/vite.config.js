import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Certificat auto-signé en local : requis par Facebook Login, qui refuse
  // d'appeler FB.login() depuis une page servie en http:// (y compris localhost).
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    https: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
