import type { IChartApi, MouseEventParams } from 'lightweight-charts'
import type { IndicatorsManager } from '@engine/indicators'
import type { SeriesOverlay } from '@engine/series'
import type { ChartSeriesLegend } from '@engine/types'

type SeriesDataMap = MouseEventParams['seriesData']
type LegendsSubscriber = (legends: ChartSeriesLegend[]) => void

type Listener = {
  hovering: boolean
  crosshairHandler: (params: MouseEventParams) => void
  dataChangedHandler: () => void
}

export class LegendsManager {
  #chart: IChartApi
  #seriesOverlay: SeriesOverlay
  #indicatorsManager: IndicatorsManager
  #listeners: Listener[] = []

  constructor(chart: IChartApi, seriesOverlay: SeriesOverlay, indicatorsManager: IndicatorsManager) {
    this.#chart = chart
    this.#seriesOverlay = seriesOverlay
    this.#indicatorsManager = indicatorsManager
  }

  setSeriesOverlay(seriesOverlay: SeriesOverlay) {
    const previousSeries = this.#seriesOverlay.getSeries()
    this.#seriesOverlay = seriesOverlay

    this.#listeners.forEach((listener) => {
      previousSeries.unsubscribeDataChanged(listener.dataChangedHandler)
      this.#seriesOverlay.getSeries().subscribeDataChanged(listener.dataChangedHandler)
    })
  }

  subscribe(cb: LegendsSubscriber) {
    const listener: Listener = {
      hovering: false,
      crosshairHandler: (params) => {
        listener.hovering = !!params.time
        if (params.time) {
          this.#buildLegends(params.seriesData, cb)
          return
        }

        this.#showLastBar(cb)
      },
      dataChangedHandler: () => {
        if (!listener.hovering) {
          this.#showLastBar(cb)
        }
      }
    }

    this.#chart.subscribeCrosshairMove(listener.crosshairHandler)
    this.#seriesOverlay.getSeries().subscribeDataChanged(listener.dataChangedHandler)
    this.#listeners.push(listener)

    this.#showLastBar(cb)

    return () => {
      this.#chart.unsubscribeCrosshairMove(listener.crosshairHandler)
      this.#seriesOverlay.getSeries().unsubscribeDataChanged(listener.dataChangedHandler)
      this.#listeners = this.#listeners.filter((l) => l !== listener)
    }
  }

  #buildLegends(seriesData: SeriesDataMap, cb: LegendsSubscriber) {
    const result: ChartSeriesLegend[] = []
    const series = this.#seriesOverlay.getSeries()
    const data = seriesData.get(series)
    if (data) {
      result.push({
        category: 'main',
        id: -1,
        ...this.#seriesOverlay.getLegend(data)
      })
    }

    const legends = this.#indicatorsManager.getLegends(seriesData)
    result.push(...legends)

    if (result.length) {
      cb(result)
    }
  }

  #showLastBar(cb: LegendsSubscriber) {
    const lastSeriesData = this.#lastSeriesData()
    if (lastSeriesData) {
      this.#buildLegends(lastSeriesData, cb)
    }
  }

  #lastSeriesData(): SeriesDataMap | null {
    const map: SeriesDataMap = new Map()

    this.#chart.panes().forEach((pane) => {
      pane.getSeries().forEach((series) => {
        const data = series.data()
        const last = data[data.length - 1]
        if (last) {
          map.set(series, last)
        }
      })
    })

    return map.size ? map : null
  }
}
