import { ZigZagPaneView } from './ZigZagPaneView'
import type { ZigZagLine } from './ZigZagRenderer'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'

export class ZigZagPrimitive implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null
  series: ISeriesApi<SeriesType> | null = null
  lines: ZigZagLine[] = []
  color: string

  constructor(color: string) {
    this.color = color
  }

  #view = new ZigZagPaneView(this)

  setColor(color: string) {
    this.color = color
  }

  setLines(lines: ZigZagLine[]) {
    this.lines = lines
  }

  attached(param: SeriesAttachedParameter<Time>) {
    this.chart = param.chart
    this.series = param.series
  }

  detached() {
    this.chart = null
    this.series = null
  }

  paneViews() {
    return [this.#view]
  }
}
