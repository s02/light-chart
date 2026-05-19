import { INDICATOR_SCRIPTS } from '@engine/indicators'
import type { Indicator, IndicatorName, IndicatorParams, SeriesMap } from './types'
import type { Datafeed, IndicatorOnPane, ChartSeriesLegend } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

export class IndicatorsOverlay {
  #chart: IChartApi
  #datafeed: Datafeed
  #indicators: { id: number; indicator: Indicator }[] = []
  #id = 10

  constructor(chart: IChartApi, datafeed: Datafeed) {
    this.#chart = chart
    this.#datafeed = datafeed
  }

  setDatafeed(datafeed: Datafeed) {
    this.#datafeed = datafeed
    this.#indicators.forEach((el) => {
      el.indicator.setDatafeed(datafeed)
    })
  }

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

  add(key: IndicatorName): Promise<IndicatorOnPane> {
    const script = this.#findScript(key)

    const pane = script.separatePane ? this.#chart.addPane() : this.#chart.panes()[0]
    const id = this.#id++

    const indicator = new script.indicator(this.#chart, this.#datafeed, { paneIndex: pane.paneIndex() })

    this.#indicators.push({
      id,
      indicator
    })

    indicator.apply()

    return new Promise((resolve, reject) => {
      let el: HTMLElement | null

      const iv = setInterval(() => {
        el = pane.getHTMLElement()
        if (el) {
          const div = el.querySelector('div')

          if (!div) {
            reject('No div element found to attach indicator')
            clearInterval(iv)
            return
          }

          resolve({
            id,
            paneIndex: pane.paneIndex(),
            el: div
          })
          clearInterval(iv)
        }
      })
    })
  }

  getSchema(id: number) {
    const el = this.#indicators.find((ind) => ind.id === id)
    if (!el) {
      throw 'Unknown indicator id'
    }

    return el.indicator.getSchema()
  }

  updateParams(id: number, params: IndicatorParams) {
    const el = this.#indicators.find((ind) => ind.id === id)
    if (!el) {
      throw 'Unknown indicator id'
    }

    el.indicator.setParams(params)
  }

  remove(id: number) {
    const el = this.#indicators.find((ind) => ind.id === id)
    if (!el) {
      throw 'Unknown indicator id'
    }

    el.indicator.remove()
    this.#indicators = this.#indicators.filter((ind) => ind.id !== id)
  }

  destroy() {
    this.#indicators.forEach((el) => {
      el.indicator.remove()
    })
    this.#indicators = []
  }

  #findScript(key: IndicatorName) {
    const script = INDICATOR_SCRIPTS.find((s) => s.indicator.ikey === key)
    if (!script) {
      throw 'unknown indicator key'
    }

    return script
  }
}
