import { INDICATOR_SCRIPTS } from '@engine/indicators'
import type { IndicatorName } from '@engine/indicators'
import type { Indicator, SeriesMap } from './types'
import type { Datafeed, IndicatorOnPane, ChartSeriesLegend } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'
import type { StudyParams } from '@engine/schema'

type IndicatorId = number
export class IndicatorsManager {
  #chart: IChartApi
  #datafeed: Datafeed
  #indicators: { id: IndicatorId; indicator: Indicator }[] = []
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
      legends.push({
        id: el.id,
        category: 'indicators',
        ...legend
      })
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
      if (!script.separatePane) {
        resolve({ id })
      }
      let iv: number | null = null

      const observer = new MutationObserver(() => {
        const el = pane.getHTMLElement()
        const div = el ? el.querySelector('div') : null
        if (div) {
          observer.disconnect()
          resolve({ id, paneIndex: pane.paneIndex(), el: div })
          if (iv) {
            clearTimeout(iv)
          }
        }
      })

      observer.observe(this.#chart.chartElement(), { childList: true, subtree: true })

      iv = setTimeout(() => {
        observer.disconnect()
        reject(new Error('Pane element not found'))
      }, 3000)
    })
  }

  getSchema(id: number) {
    const el = this.#findIndicator(id)
    return el.indicator.getSchema()
  }

  updateParams(id: number, params: StudyParams) {
    const el = this.#findIndicator(id)
    el.indicator.setParams(params)
  }

  remove(id: number) {
    const el = this.#findIndicator(id)
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
      throw new Error(`unknown indicator key: ${key}`)
    }

    return script
  }

  #findIndicator(id: number) {
    const el = this.#indicators.find((ind) => ind.id === id)
    if (!el) {
      throw new Error(`Unknown indicator id: ${id}`)
    }

    return el
  }
}
