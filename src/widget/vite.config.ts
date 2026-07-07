import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./lib.ts', import.meta.url)),
      name: 'Widget',
      fileName: 'widget',
      formats: ['es']
    },
    outDir: fileURLToPath(new URL('../../dist/widget', import.meta.url)),
    emptyOutDir: true
  }
})
