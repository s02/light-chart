import type { Indicator } from './indicators/types'

export class IndicatorsOverlay {
  #indicators: Indicator[] = []

  constructor() {}

  add(indicator: Indicator) {
    this.#indicators.push(indicator)
    indicator.apply()
  }

  clear() {
    this.#indicators.forEach((indicator) => {
      indicator.remove()
    })
  }
}
