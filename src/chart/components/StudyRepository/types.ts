import type { Layout, LayoutConfig } from '@engine/indicators/types'

export type StudyRepository = {
  save: (name: string, config: LayoutConfig) => Layout[]
  load: () => Layout[]
  delete: (name: string) => Layout[]
}
