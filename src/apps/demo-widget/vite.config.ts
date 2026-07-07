import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { alias } from '../../../config'

console.log('aa', alias)

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      ...alias
    }
  },
  build: {
    outDir: fileURLToPath(new URL('../../../../dist/demo-widget', import.meta.url)),
    emptyOutDir: true
  }
})
