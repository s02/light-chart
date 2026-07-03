import type { Anchor } from '@engine/points'
import type { StudyParams, StudySchema } from '@engine/schema'
import type { SeriesLegend, SeriesOverlayData } from '@engine/series'
import type { Datafeed } from '@engine/types'
import type { ISeriesApi, SeriesType, Time } from 'lightweight-charts'

export type SeriesMap = Map<ISeriesApi<SeriesType, Time>, SeriesOverlayData>

export type IndicatorOptions = {
  params?: StudyParams
  paneIndex?: number
}

export type Indicator = {
  apply: () => Promise<void>
  remove: () => Promise<void> | void
  setParams: (params: StudyParams) => void
  setDatafeed: (datafeed: Datafeed) => void
  getLegend: (seriesData: SeriesMap) => SeriesLegend
  getSchema: () => {
    ikey: string
    schema: StudySchema
    params: StudyParams
  }
}

export type LayoutConfig = {
  drawings: {
    params: StudyParams
    anchors: Anchor[]
    ikey: string
  }[]
  indicators: {
    params: StudyParams
    ikey: string
  }[]
}

export type Layout = { name: string; config: LayoutConfig }
