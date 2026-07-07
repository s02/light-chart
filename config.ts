import { fileURLToPath, URL } from 'node:url'

export const alias = {
  '@datafeed': fileURLToPath(new URL('./src/datafeed', import.meta.url)),
  '@chart': fileURLToPath(new URL('./src/chart', import.meta.url)),
  '@engine': fileURLToPath(new URL('./src/engine', import.meta.url))
}

export const outdirs = {
  app: fileURLToPath(new URL('./dist/app', import.meta.url))
}
