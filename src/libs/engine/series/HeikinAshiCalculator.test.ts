import { HeikinAshiCalculator } from '@engine/series/HeikinAshiCalculator'
import type { UTCTimestamp } from '@engine/types'
import { describe, it, expect, beforeEach } from 'vitest'

const bars = [
  {
    time: 1778071055 as UTCTimestamp,
    open: 10,
    high: 14,
    low: 8,
    close: 12,
    date: '2026-05-06T12:37:35Z',
    value: 12
  },
  {
    time: 1778071060 as UTCTimestamp,
    open: 12,
    high: 16,
    low: 8,
    close: 14,
    date: '2026-05-06T12:37:40Z',
    value: 14
  },
  {
    time: 1778071065 as UTCTimestamp,
    open: 14,
    high: 10,
    low: 6,
    close: 16,
    date: '2026-05-06T12:37:45Z',
    value: 16
  },
  {
    time: 1778071070 as UTCTimestamp,
    open: 16,
    high: 20,
    low: 8,
    close: 18,
    date: '2026-05-06T12:37:50Z',
    value: 18
  },
  {
    time: 1778071075 as UTCTimestamp,
    open: 18,
    high: 24,
    low: 8,
    close: 20,
    date: '2026-05-06T12:37:55Z',
    value: 20
  }
]

const result = [
  {
    time: 1778071055 as UTCTimestamp,
    open: 10,
    high: 14,
    low: 8,
    close: 12,
    date: '2026-05-06T12:37:35Z',
    value: 12
  },
  {
    time: 1778071060 as UTCTimestamp,
    open: 11,
    high: 16,
    low: 8,
    close: 12.5,
    date: '2026-05-06T12:37:40Z',
    value: 14
  },
  {
    time: 1778071065 as UTCTimestamp,
    open: 11.75,
    high: 10,
    low: 6,
    close: 11.5,
    date: '2026-05-06T12:37:45Z',
    value: 16
  },
  {
    time: 1778071070 as UTCTimestamp,
    open: 11.625,
    high: 20,
    low: 8,
    close: 15.5,
    date: '2026-05-06T12:37:50Z',
    value: 18
  },
  {
    time: 1778071075 as UTCTimestamp,
    open: 13.5625,
    high: 24,
    low: 8,
    close: 17.5,
    date: '2026-05-06T12:37:55Z',
    value: 20
  }
]

describe('Heikin Ashi Calculator', () => {
  let calculator: HeikinAshiCalculator

  beforeEach(() => {
    calculator = new HeikinAshiCalculator()
  })

  it('should just calculate bars', () => {
    expect(calculator.setData(bars)).toEqual(result)
  })

  it('should update new bar', () => {
    calculator.setData(bars)

    const bar = {
      time: 1778071080 as UTCTimestamp,
      open: 20,
      high: 24,
      low: 8,
      close: 18,
      date: '2026-05-06T12:38:00Z',
      value: 18
    }

    const result = {
      time: 1778071080 as UTCTimestamp,
      open: 15.53125,
      high: 24,
      low: 8,
      close: 17.5,
      date: '2026-05-06T12:38:00Z',
      value: 18
    }

    calculator.setData(bars)
    expect(calculator.update(bar)).toEqual(result)
  })

  it('should update existing bar', () => {
    const bar = {
      time: 1778071075 as UTCTimestamp,
      open: 18,
      high: 24,
      low: 8,
      close: 22,
      date: '2026-05-06T12:37:55Z',
      value: 22
    }

    const result = {
      time: 1778071075 as UTCTimestamp,
      open: 13.5625,
      high: 24,
      low: 8,
      close: 18,
      date: '2026-05-06T12:37:55Z',
      value: 22
    }

    calculator.setData(bars)
    expect(calculator.update(bar)).toEqual(result)
  })

  it('should update when no data set', () => {
    for (let i = 0; i < bars.length; i++) {
      expect(calculator.update(bars[i])).toEqual(result[i])
    }
  })
})
