import type { Repository } from '@chart/components/StudyRepository/types'
import type { Layout, LayoutConfig } from '@engine/indicators/types'

export class LocalStorageRepository implements Repository {
  #layouts: Layout[] = []

  constructor() {
    this.#layouts = this.#loadStudiesFromStorage()
  }

  save(name: string, config: LayoutConfig) {
    this.#layouts.push({ name, config })
    this.#saveStudiesToStorage()
    return this.#layouts
  }

  load() {
    return this.#layouts
  }

  delete(name: string) {
    this.#layouts = this.#layouts.filter((layout) => layout.name !== name)
    this.#saveStudiesToStorage()
    return this.#layouts
  }

  #saveStudiesToStorage() {
    localStorage.setItem('lwc-studies', JSON.stringify(this.#layouts))
  }

  #loadStudiesFromStorage() {
    const s = localStorage.getItem('lwc-studies')
    if (!s) {
      return []
    }

    try {
      return JSON.parse(s)
    } catch (_e) {
      return []
    }
  }
}
