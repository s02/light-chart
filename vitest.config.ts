import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import { alias } from './config'

export default defineConfig({
  resolve: {
    alias
  },
  test: {
    environment: 'node',
    fileParallelism: false
  }
})
