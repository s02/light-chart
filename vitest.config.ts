import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/libs/engine', import.meta.url)),
      '@chart': fileURLToPath(new URL('./src/libs/chart', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    fileParallelism: false
  }
})
