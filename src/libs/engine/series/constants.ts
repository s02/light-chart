import type { DeepPartial, SeriesOptionsCommon } from 'lightweight-charts'

export const COMMON_SERIES_SETTINGS: DeepPartial<SeriesOptionsCommon> = {
  priceFormat: {
    type: 'price',
    precision: 6,
    minMove: 0.000001
  }
} as const
