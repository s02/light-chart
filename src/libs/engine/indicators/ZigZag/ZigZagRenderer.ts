import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IChartApi, IPrimitivePaneRenderer, ISeriesApi, SeriesType, Time } from 'lightweight-charts'

export type ZigZagLine = {
  from: { time: Time; price: number }
  to: { time: Time; price: number }
}

export class ZigZagRenderer implements IPrimitivePaneRenderer {
  #lines: ZigZagLine[]
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #color: string

  constructor(lines: ZigZagLine[], chart: IChartApi, series: ISeriesApi<SeriesType>, color: string) {
    this.#lines = lines
    this.#chart = chart
    this.#series = series
    this.#color = color
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const timeScale = this.#chart.timeScale()

      for (const segment of this.#lines) {
        const x1 = timeScale.timeToCoordinate(segment.from.time)
        const y1 = this.#series.priceToCoordinate(segment.from.price)
        const x2 = timeScale.timeToCoordinate(segment.to.time)
        const y2 = this.#series.priceToCoordinate(segment.to.price)

        if (x1 === null || y1 === null || x2 === null || y2 === null) continue

        line(scope, { x: x1, y: y1 }, { x: x2, y: y2 }, { color: this.#color, width: 2 })
      }
    })
  }
}
