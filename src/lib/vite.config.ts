import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { fileURLToPath, URL } from 'node:url'
import { alias, outdirs } from '../../config'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: fileURLToPath(new URL('../../tsconfig.app.json', import.meta.url)),
      outDirs: outdirs.component,
      include: ['src/lib/**/*.ts', 'src/chart/**/*', 'src/engine/**/*', 'src/datafeed/**/*', 'src/transport/**/*'],
      insertTypesEntry: true
    })
  ],
  resolve: {
    alias
  },
  build: {
    outDir: outdirs.component,
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./index.ts', import.meta.url)),
      name: 'MidChart',
      fileName: 'mid-chart',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue', '@floating-ui/dom', '@floating-ui/vue', '@vueuse/core']
    }
  }
})
