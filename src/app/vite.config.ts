import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      '@chart': fileURLToPath(new URL('../chart', import.meta.url)),
      '@engine': fileURLToPath(new URL('../engine', import.meta.url)),
      '@app': fileURLToPath(new URL('.', import.meta.url))
    }
  }
})
