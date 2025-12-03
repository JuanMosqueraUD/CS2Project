import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  preview: {
    allowedHosts: ['ciencias-de-la-computacion-2.onrender.com']
  }
})
