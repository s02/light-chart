import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  CrosshairMode,
  LineSeries,
  type DeepPartial,
  type SeriesOptionsCommon,
  type TimeChartOptions
} from 'lightweight-charts'

export const CHART_PARAMS: DeepPartial<TimeChartOptions> = {
  autoSize: true,
  layout: {
    attributionLogo: false,
    background: { color: '#001B36' },
    textColor: 'rgba(255, 255, 255, .5)'
  },
  grid: {
    vertLines: { color: 'rgba(255, 255, 255, .05)' },
    horzLines: { color: 'rgba(255, 255, 255, .05)' }
  },
  timeScale: {
    timeVisible: true,
    barSpacing: 10,
    rightOffset: 10,
    uniformDistribution: true,
    borderColor: 'rgba(255, 255, 255, .25)'
  },
  rightPriceScale: {
    borderColor: 'rgba(255, 255, 255, .25)'
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    horzLine: { labelBackgroundColor: '#3c3e43' },
    vertLine: { labelBackgroundColor: '#3c3e43' }
  }
} as const

export const SERIES_PARAMS: DeepPartial<SeriesOptionsCommon> = {
  priceFormat: {
    type: 'price',
    precision: 6,
    minMove: 0.000001
  }
} as const

export const SERIES_SETTINGS = {
  candlestick: {
    series: CandlestickSeries
  },
  bar: {
    series: BarSeries
  },
  line: {
    series: LineSeries
  },
  area: {
    series: AreaSeries
  }
} as const

export const SERIES: SeriesId[] = Object.keys(SERIES_SETTINGS) as SeriesId[]

export const RESOLUTION_SETTINGS = {
  '1S': {
    name: '1s',
    seconds: 1
  },
  '5S': {
    name: '5s',
    seconds: 5
  },
  '10S': {
    name: '10s',
    seconds: 10
  },
  '15S': {
    name: '15s',
    seconds: 15
  },
  '30S': {
    name: '30s',
    seconds: 30
  },
  '1': {
    name: '1m',
    seconds: 60
  },
  '2': {
    name: '2m',
    seconds: 2 * 60
  },
  '5': {
    name: '5m',
    seconds: 5 * 60
  },
  '10': {
    name: '10m',
    seconds: 10 * 60
  },
  '15': {
    name: '15m',
    seconds: 15 * 60
  },
  '30': {
    name: '30m',
    seconds: 30 * 60
  },
  '60': {
    name: '1h',
    seconds: 60 * 60
  },
  '120': {
    name: '2h',
    seconds: 2 * 60 * 60
  },
  '360': {
    name: '6h',
    seconds: 6 * 60 * 60
  },
  '720': {
    name: '12h',
    seconds: 12 * 60 * 60
  }
} as const

export const RESOLUTIONS = Object.keys(RESOLUTION_SETTINGS) as ResolutionId[]
RESOLUTIONS.sort((r1, r2) => RESOLUTION_SETTINGS[r1].seconds - RESOLUTION_SETTINGS[r2].seconds)

export type ResolutionId = keyof typeof RESOLUTION_SETTINGS
export type SeriesId = keyof typeof SERIES_SETTINGS
