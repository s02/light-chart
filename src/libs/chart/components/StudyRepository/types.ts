import type { Layout, LayoutConfig } from '@engine/indicators/types'

export type Repository = {
  save: (name: string, config: LayoutConfig) => Layout[]
  load: () => Layout[]
  delete: (name: string) => Layout[]
}
