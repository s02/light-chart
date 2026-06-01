import { PriceChannelFillPaneView } from './PriceChannelFillPaneView'
import type { FillPoint } from './PriceChannelFillRenderer'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  LineData,
  SeriesAttachedParameter,
  SeriesType,
  Time,
  WhitespaceData
} from 'lightweight-charts'

export class PriceChannelFill implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null
  series: ISeriesApi<SeriesType> | null = null
  points: FillPoint[] = []
  color: string

  constructor(color: string) {
    this.color = color
  }

  #view = new PriceChannelFillPaneView(this)

  setColor(color: string) {
    this.color = color
  }

  attached(param: SeriesAttachedParameter<Time>) {
    this.chart = param.chart
    this.series = param.series
  }

  detached() {
    this.chart = null
    this.series = null
  }

  set(upper: (LineData<Time> | WhitespaceData<Time>)[], lower: (LineData<Time> | WhitespaceData<Time>)[]) {
    this.points = []
    for (let i = 0; i < upper.length; i++) {
      const u = upper[i]
      const l = lower[i]
      if ('value' in u && 'value' in l) {
        this.points.push({ time: u.time, upper: u.value, lower: l.value })
      }
    }
  }

  paneViews() {
    return [this.#view]
  }
}
