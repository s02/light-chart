import { CrossMarkerPaneView } from './CrossMarkerPaneView'
import type { CrossPoint } from './CrossMarkerRenderer'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'

export class CrossMarker implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null
  series: ISeriesApi<SeriesType> | null = null
  points: CrossPoint[] = []

  #view = new CrossMarkerPaneView(this)

  setPoints(points: CrossPoint[]) {
    this.points = points
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

export type { CrossPoint }
