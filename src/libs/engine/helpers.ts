import { CANDLE_COLORS, RESOLUTION_SETTINGS } from './constants'
import { SERIES_DEFAULTS } from '@engine/series'
import type { BarData, DataItem, ITimeScaleApi, Logical, Time, UTCTimestamp } from 'lightweight-charts'
import type { ResolutionId } from '@engine/types'

export const getBarOpenTime = (barTime: UTCTimestamp, resolutionId: ResolutionId): UTCTimestamp => {
  const interval = RESOLUTION_SETTINGS[resolutionId].seconds
  return (Math.floor(barTime / interval) * interval) as UTCTimestamp
}

export const getBarLogical = (
  timeScale: ITimeScaleApi<Time>,
  lastBarTime: UTCTimestamp,
  barTime: UTCTimestamp,
  resolutionId: ResolutionId
) => {
  if (!lastBarTime) {
    return null
  }

  const barInterval = RESOLUTION_SETTINGS[resolutionId].seconds
  const barOpenTime = getBarOpenTime(barTime, resolutionId)
  const barDiff = Math.floor((barOpenTime - lastBarTime) / barInterval)
  const lastBarCoord = timeScale.timeToCoordinate(lastBarTime as Time)

  if (!lastBarCoord) {
    return null
  }

  const lastBarLogical = timeScale.coordinateToLogical(lastBarCoord)

  if (!lastBarLogical) {
    return null
  }

  return (lastBarLogical + barDiff) as Logical
}

export const getBarPrice = (bar?: DataItem<Time>) => {
  if (bar && 'close' in bar) {
    return bar.close
  }

  if (bar && 'value' in bar) {
    return bar.value
  }

  return null
}

export const getBarTime = (bar?: DataItem<Time>) => {
  return bar?.time as UTCTimestamp
}

export const dateToEpoch = (date: string): UTCTimestamp => (new Date(date).getTime() / 1000) as UTCTimestamp

export const formatPrice = (price: number) => {
  return price.toFixed(SERIES_DEFAULTS.pricePrecision)
}

export const getBarColor = (bar: BarData<Time>) =>
  bar.color ?? (bar.close >= bar.open ? CANDLE_COLORS.up : CANDLE_COLORS.down)

export const parseColor = (color: string) => {
  const inner = color.slice(4, -1)
  const slashIdx = inner.indexOf('/')
  if (slashIdx === -1) {
    return { baseColor: color, opacity: 100 }
  }

  const base = inner.slice(0, slashIdx).trim()
  const alphaStr = inner.slice(slashIdx + 1).trim()
  const isPercent = alphaStr.endsWith('%')
  const value = parseFloat(alphaStr)

  return {
    baseColor: `rgb(${base})`,
    opacity: Math.round(isPercent ? value : value * 100)
  }
}
