import type { INDICATOR_SCRIPTS } from '@engine/indicators'

export type Indicator = {
  apply: () => Promise<void>
  remove: () => Promise<void> | void
}

export type IndicatorScript = (typeof INDICATOR_SCRIPTS)[number]['key']
