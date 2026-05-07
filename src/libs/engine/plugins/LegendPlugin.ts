import { CANDLE_COLORS } from '@engine/constants'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  SeriesAttachedParameter,
  SeriesType,
  Time,
  MouseEventParams,
  OhlcData,
  DataItem
} from 'lightweight-charts'

class LegendRenderer implements IPrimitivePaneRenderer {
  #bar: OhlcData<Time> | null
  #label: string

  constructor(bar: OhlcData<Time> | null, label: string) {
    this.#bar = bar
    this.#label = label
  }

  draw(target: CanvasRenderingTarget2D) {
    if (!this.#bar) return

    target.useBitmapCoordinateSpace((scope) => {
      if (!this.#bar) return

      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio

      const fontSize = 13 * Math.min(hpr, vpr)
      const marginX = 5 * hpr
      const marginY = 5 * vpr
      const itemGap = 5 * hpr

      ctx.font = `${fontSize}px monospace`
      ctx.textBaseline = 'top'

      if (this.#label) {
        ctx.fillStyle = '#fff'
        ctx.fillText(this.#label, marginX, marginY)
      }

      const { open, high, low, close } = this.#bar
      const ohlcColor = close >= open ? CANDLE_COLORS.up : CANDLE_COLORS.down

      const items: [string, string][] = [
        ['O', open.toFixed(6)],
        ['H', high.toFixed(6)],
        ['L', low.toFixed(6)],
        ['C', close.toFixed(6)]
      ]

      const ohlcY = marginY + fontSize + marginY
      let x = marginX
      for (const [label, value] of items) {
        ctx.fillStyle = '#fff'
        ctx.fillText(label, x, ohlcY)
        x += ctx.measureText(label).width + 4 * hpr
        ctx.fillStyle = ohlcColor
        ctx.fillText(value, x, ohlcY)
        x += ctx.measureText(value).width + itemGap
      }
    })
  }
}

class LegendView implements IPrimitivePaneView {
  #bar: OhlcData<Time> | null = null
  #label: string

  constructor(label: string) {
    this.#label = label
  }

  setBar(bar: OhlcData<Time> | null) {
    this.#bar = bar
  }

  setLabel(label: string) {
    this.#label = label
  }

  renderer() {
    return new LegendRenderer(this.#bar, this.#label)
  }
}

export class LegendPlugin implements ISeriesPrimitive<Time> {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType> | null = null
  #view: LegendView
  #requestUpdate: (() => void) | null = null
  #initialized = false
  #crosshairHandler: (params: MouseEventParams) => void

  constructor(chart: IChartApi, label: string = '') {
    this.#chart = chart
    this.#view = new LegendView(label)
    this.#crosshairHandler = (params: MouseEventParams) => this.#onCrosshairMove(params)
  }

  setLabel(label: string) {
    this.#view.setLabel(label)
  }

  attached({ series, requestUpdate }: SeriesAttachedParameter<Time>) {
    this.#series = series
    this.#requestUpdate = requestUpdate
    this.#chart.subscribeCrosshairMove(this.#crosshairHandler)
  }

  detached() {
    this.#chart.unsubscribeCrosshairMove(this.#crosshairHandler)
    this.#series = null
    this.#requestUpdate = null
    this.#initialized = false
  }

  updateAllViews() {
    if (this.#initialized || !this.#series) {
      return
    }

    const lastBar = this.#series.data().at(-1)

    if (!lastBar) {
      return
    }

    this.#setData(lastBar)
    this.#initialized = true
  }

  paneViews() {
    return [this.#view]
  }

  #setData(data: DataItem<Time>) {
    if ('open' in data) {
      this.#view.setBar(data)
      this.#requestUpdate?.()
    }
  }

  #onCrosshairMove(params: MouseEventParams) {
    if (!this.#series || !params.logical) {
      return
    }

    const data = params.seriesData.get(this.#series)

    if (!data) {
      return
    }

    this.#setData(data)
  }
}
