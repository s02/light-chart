import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
//import vueDevTools from 'vite-plugin-vue-devtools'
import { alias, outdirs } from '../../../config'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  build: {
    outDir: outdirs.app,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      ...alias,
      '@app': fileURLToPath(new URL('.', import.meta.url))
    }
  }
})
