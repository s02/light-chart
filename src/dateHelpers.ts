import type { Time } from 'lightweight-charts'

export const MAX_SYSTEM_TIMEOUT = 2147483647

const addMinutes = (date: Date, minutes: number): Date => new Date(date.getTime() + minutes * 60_000)

const addSeconds = (date: Date, seconds: number): Date => new Date(date.getTime() + seconds * 1_000)

const setSeconds = (date: Date, seconds: number): Date => {
  const d = new Date(date)
  d.setSeconds(seconds)
  return d
}

const setMilliseconds = (date: Date, ms: number): Date => {
  const d = new Date(date)
  d.setMilliseconds(ms)
  return d
}

const iso8601toTime = (date: string) => (new Date(date).getTime() / 1000) as Time
const secondsToIso8601 = (seconds: number) => new Date(seconds * 1000).toISOString()

export const dateHelpers = {
  addMinutes,
  addSeconds,
  setSeconds,
  setMilliseconds,
  iso8601toTime,
  secondsToIso8601
}
