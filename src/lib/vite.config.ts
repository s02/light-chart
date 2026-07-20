import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { alias, outdirs } from '../../config'

function copyPackageJson(): Plugin {
  return {
    name: 'copy-package-json',
    closeBundle() {
      copyFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), `${outdirs.component}/package.json`)
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    copyPackageJson(),
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
      name: 'LightChart',
      fileName: 'light-chart',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue', '@floating-ui/dom', '@floating-ui/vue', '@vueuse/core']
    }
  }
})
