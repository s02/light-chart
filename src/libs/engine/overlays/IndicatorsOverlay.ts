import type { ChartSeriesLegend, SeriesMap, Indicator } from '@engine/types'

export class IndicatorsOverlay {
  #indicators: { id: number; indicator: Indicator }[] = []
  #id = 0

  getLegends(seriesData: SeriesMap) {
    const legends: ChartSeriesLegend[] = []
    this.#indicators.forEach((el) => {
      const legend = el.indicator.getLegend(seriesData)
      if (legend) {
        legends.push({
          id: el.id,
          category: 'indicators',
          ...legend
        })
      }
    })
    return legends
  }

  add(indicator: Indicator) {
    this.#indicators.push({
      id: this.#id++,
      indicator
    })
    indicator.apply()
  }

  destroy() {
    this.#indicators.forEach((el) => {
      el.indicator.remove()
    })
  }
}
