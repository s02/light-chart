import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const componentOutDir = fileURLToPath(
  new URL('../dist/component', import.meta.url)
)
const rootPkg = JSON.parse(readFileSync(`${rootDir}/package.json`, 'utf-8'))

const peerDependencyNames = [
  'vue',
  '@floating-ui/dom',
  '@floating-ui/vue',
  '@vueuse/core'
]

const componentPkg = {
  name: 'mid-chart',
  version: rootPkg.version,
  type: 'module',
  main: './mid-chart.js',
  module: './mid-chart.js',
  types: './mid-chart.d.ts',
  exports: {
    '.': {
      types: './mid-chart.d.ts',
      import: './mid-chart.js'
    },
    './style.css': './mid-chart.css'
  },
  sideEffects: ['*.css'],
  peerDependencies: Object.fromEntries(
    peerDependencyNames.map((name) => [name, rootPkg.dependencies[name]])
  )
}

writeFileSync(
  `${componentOutDir}/package.json`,
  `${JSON.stringify(componentPkg, null, 2)}\n`
)
