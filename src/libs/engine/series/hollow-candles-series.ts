import { BarRenderer } from '@engine/primitives/BarRenderer'
import { optimalCandlestickWidth, drawBody, drawWicks } from '@engine/series/candlestickHelpers'
import type { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas'
import type {
  BarData,
  CustomSeriesOptions,
  CustomSeriesPricePlotValues,
  ICustomSeriesPaneRenderer,
  ICustomSeriesPaneView,
  PaneRendererCustomData,
  PriceToCoordinateConverter,
  Time,
  WhitespaceData
} from 'lightweight-charts'
import { customSeriesDefaultOptions } from 'lightweight-charts'

interface HollowCandleSeriesOptions extends CustomSeriesOptions {
  upColor: string
  downColor: string
  wickUpColor: string
  wickDownColor: string
}

const defaultOptions: HollowCandleSeriesOptions = {
  ...customSeriesDefaultOptions,
  upColor: '#26a69a',
  downColor: '#ef5350',
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350'
} as const

class HollowCandleRenderer<TData extends BarData> extends BarRenderer implements ICustomSeriesPaneRenderer {
  #data: PaneRendererCustomData<Time, TData> | null = null
  #options: HollowCandleSeriesOptions | null = null
  #barWidth: number = 0

  draw(target: CanvasRenderingTarget2D, priceConverter: PriceToCoordinateConverter) {
    target.useBitmapCoordinateSpace((scope) => this.#drawImpl(scope, priceConverter))
  }

  update(data: PaneRendererCustomData<Time, TData>, options: HollowCandleSeriesOptions): void {
    this.#data = data
    this.#options = options
  }

  #drawImpl(scope: BitmapCoordinatesRenderingScope, priceConverter: PriceToCoordinateConverter) {
    if (
      this.#data === null ||
      this.#data.bars.length === 0 ||
      this.#data.visibleRange === null ||
      this.#options === null
    ) {
      return
    }

    const { horizontalPixelRatio } = scope
    this.#barWidth = optimalCandlestickWidth(this.#data.barSpacing, horizontalPixelRatio)

    if (this.#barWidth >= 2) {
      const wickWidth = Math.floor(horizontalPixelRatio)
      if (wickWidth % 2 !== this.#barWidth % 2) {
        this.#barWidth--
      }
    }

    const { bars, visibleRange } = this.#data
    const options = this.#options!

    for (let i = visibleRange.from; i < visibleRange.to; i++) {
      const { originalData: d } = bars[i]

      const isUp = d.close >= d.open
      const wickOptions = { fill: isUp ? options.wickUpColor : options.wickDownColor }
      const bodyOptions = isUp ? { border: options.upColor } : { fill: options.downColor }

      drawWicks(bars[i], scope, priceConverter, wickOptions)
      drawBody(bars[i], this.#barWidth, scope, priceConverter, bodyOptions)
    }
  }
}

export class HollowCandlesSeries<TData extends BarData> implements ICustomSeriesPaneView<
  Time,
  TData,
  HollowCandleSeriesOptions
> {
  #renderer: HollowCandleRenderer<TData> = new HollowCandleRenderer()

  priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
    return [plotRow.high, plotRow.low, plotRow.open, plotRow.close]
  }

  update(data: PaneRendererCustomData<Time, TData>, options: HollowCandleSeriesOptions) {
    this.#renderer.update(data, options)
  }

  isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
    return !(data as Partial<TData>).open
  }

  defaultOptions() {
    return defaultOptions
  }

  renderer() {
    return this.#renderer
  }
}

// https://www.tradingview.com/support/solutions/43000745270-hollow-candle-charts-explained/
