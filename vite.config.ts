import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@chart': fileURLToPath(new URL('./src/libs/chart', import.meta.url)),
      '@engine': fileURLToPath(new URL('./src/libs/engine', import.meta.url)),
    },
  },
})