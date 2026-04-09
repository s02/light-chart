import { RESOLUTION_SETTINGS } from './constants'
import type { ITimeScaleApi, Logical, Time, UTCTimestamp } from 'lightweight-charts'
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

export const dateToEpoch = (date: string): UTCTimestamp => (new Date(date).getTime() / 1000) as UTCTimestamp
