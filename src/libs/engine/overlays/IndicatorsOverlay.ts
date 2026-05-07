import type { Indicator } from '@engine/indicators/types'

export class IndicatorsOverlay {
  #indicators: Indicator[] = []

  constructor() {}

  add(indicator: Indicator) {
    this.#indicators.push(indicator)
    indicator.apply()
  }

  destroy() {
    this.#indicators.forEach((indicator) => {
      indicator.remove()
    })
  }
}
