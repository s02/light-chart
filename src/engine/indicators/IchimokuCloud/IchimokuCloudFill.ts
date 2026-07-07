import { IchimokuCloudFillPaneView } from '@engine/indicators/IchimokuCloud/IchimokuCloudFillPaneView'
import type { FillPoint } from '@engine/indicators/IchimokuCloud/IchimokuCloudFillRenderer'
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

export class IchimokuCloudFill implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null
  series: ISeriesApi<SeriesType> | null = null
  points: FillPoint[] = []
  bull: string
  bear: string

  constructor(bull: string, bear: string) {
    this.bull = bull
    this.bear = bear
  }

  #view = new IchimokuCloudFillPaneView(this)

  attached(param: SeriesAttachedParameter<Time>) {
    this.chart = param.chart
    this.series = param.series
  }

  detached() {
    this.chart = null
    this.series = null
  }

  set(upper: LineData<Time>[] | WhitespaceData<Time>[], lower: LineData<Time>[] | WhitespaceData<Time>[]) {
    this.points = []
    const lowerMap = new Map<Time, number>()
    for (const l of lower) {
      if ('value' in l) lowerMap.set(l.time, l.value)
    }
    for (const u of upper) {
      if ('value' in u) {
        const lv = lowerMap.get(u.time)
        if (lv !== undefined) {
          this.points.push({ time: u.time, upper: u.value, lower: lv })
        }
      }
    }
  }

  paneViews() {
    return [this.#view]
  }
}
