import { BollingerBandsFillPaneView } from '@engine/indicators/BollingerBands/BollingerBandsFillPaneView'
import type { FillPoint } from '@engine/indicators/BollingerBands/BollingerBandsFillRenderer'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'

export class BollingerBandsFill implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null
  series: ISeriesApi<SeriesType> | null = null
  points: FillPoint[] = []

  #view = new BollingerBandsFillPaneView(this)

  attached(param: SeriesAttachedParameter<Time>) {
    this.chart = param.chart
    this.series = param.series
  }

  detached() {
    this.chart = null
    this.series = null
  }

  set(points: FillPoint[]) {
    this.points = points
  }

  update(point: FillPoint) {
    if (this.points.length && this.points[this.points.length - 1].time === point.time) {
      this.points[this.points.length - 1] = point
    } else {
      this.points.push(point)
    }
  }

  paneViews() {
    return [this.#view]
  }
}
