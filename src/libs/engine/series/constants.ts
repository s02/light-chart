import type { DeepPartial, SeriesOptionsCommon } from 'lightweight-charts'

export const SERIES_DEFAULTS = {
  pricePrecision: 8
}

export const COMMON_SERIES_SETTINGS: DeepPartial<SeriesOptionsCommon> = {
  priceFormat: {
    type: 'price',
    precision: SERIES_DEFAULTS.pricePrecision,
    minMove: 0.000001
  }
} as const
