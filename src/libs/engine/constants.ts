import { AreaSeries, BarSeries, CandlestickSeries, CrosshairMode, LineSeries } from 'lightweight-charts'
import type { DeepPartial, SeriesOptionsCommon, TimeChartOptions } from 'lightweight-charts'

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

export const RESOLUTION_SETTINGS = {
  '1S': {
    name: '1s',
    seconds: 1,
    timeframe: 5
  },
  '5S': {
    name: '5s',
    seconds: 5,
    timeframe: 5
  },
  '10S': {
    name: '10s',
    seconds: 10,
    timeframe: 10
  },
  '15S': {
    name: '15s',
    seconds: 15,
    timeframe: 15
  },
  '30S': {
    name: '30s',
    seconds: 30,
    timeframe: 30
  },
  '1': {
    name: '1m',
    seconds: 60,
    timeframe: 60
  },
  '2': {
    name: '2m',
    seconds: 2 * 60,
    timeframe: 120
  },
  '5': {
    name: '5m',
    seconds: 5 * 60,
    timeframe: 300
  },
  '10': {
    name: '10m',
    seconds: 10 * 60,
    timeframe: 600
  },
  '15': {
    name: '15m',
    seconds: 15 * 60,
    timeframe: 900
  },
  '30': {
    name: '30m',
    seconds: 30 * 60,
    timeframe: 1800
  },
  '60': {
    name: '1h',
    seconds: 60 * 60,
    timeframe: 3600
  },
  '120': {
    name: '2h',
    seconds: 2 * 60 * 60,
    timeframe: 7200
  },
  '360': {
    name: '6h',
    seconds: 6 * 60 * 60,
    timeframe: 21600
  },
  '720': {
    name: '12h',
    seconds: 12 * 60 * 60,
    timeframe: 43200
  }
} as const
