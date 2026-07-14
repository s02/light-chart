import { existsSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'

const config = {
  locales: ['ru', 'en'],
  source: 'node_modules/texts-translations',
  output: `src/chart/locales`
}

const loadSourceFiles = async () => {
  try {
    const files = await readdir(config.source)
    const locales = config.locales.map((l) => `locale-${l}.json`)
    return files.filter((file) => locales.includes(file))
  } catch (e) {
    console.error(e)
  }
}

const loadFile = async (fileName, result) => {
  try {
    const file = await readFile(path.join(config.source, fileName), { encoding: 'utf8' })
    result[fileName] = JSON.parse(file.toString())
    return result
  } catch (e) {
    console.error(e)
  }
}

const loadTranslations = async () => {
  const localesMap = {}
  const files = await loadSourceFiles()

  await Promise.all(files.map((fileName) => loadFile(fileName, localesMap)))

  return localesMap
}

const filterKeys = (key) => {
  return key.indexOf('$mwc@') === 0
}

const start = async () => {
  if (existsSync(config.output)) {
    rmSync(config.output, { recursive: true, force: true })
  }

  mkdirSync(config.output, { recursive: true })

  const txOutput = await loadTranslations()

  Object.keys(txOutput).forEach((locale) => {
    const t = {}
    Object.keys(txOutput[locale])
      .filter(filterKeys)
      .forEach((key) => {
        t[key] = txOutput[locale][key]
      })

    writeFileSync(path.join(config.output, locale), JSON.stringify(t))
  })
}

start()
