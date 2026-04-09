import type { ITimeScaleApi, Logical, Time } from 'lightweight-charts'
import { RESOLUTION_SETTINGS, type ResolutionId } from './constants'

export const getBarOpenTime = (barTime: Time, resolutionId: ResolutionId): Time => {
  const interval = RESOLUTION_SETTINGS[resolutionId].seconds
  return (Math.floor((barTime as number) / interval) * interval) as Time
}

export const getBarLogical = (
  timeScale: ITimeScaleApi<Time>,
  lastBarTime: Time | undefined,
  barTime: Time,
  resolutionId: ResolutionId
) => {
  if (!lastBarTime) {
    return null
  }

  const barInterval = RESOLUTION_SETTINGS[resolutionId].seconds
  const barOpenTime = getBarOpenTime(barTime, resolutionId)
  const barDiff = Math.floor(((barOpenTime as number) - (lastBarTime as number)) / barInterval)
  const lastBarCoord = timeScale.timeToCoordinate(lastBarTime)

  if (!lastBarCoord) {
    return null
  }

  const lastBarLogical = timeScale.coordinateToLogical(lastBarCoord)

  if (!lastBarLogical) {
    return null
  }

  return (lastBarLogical + barDiff) as Logical
}
