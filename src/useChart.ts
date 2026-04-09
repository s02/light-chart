import { computed, reactive } from 'vue'
import { useExpirations } from './useExpirations'
import { dateHelpers } from './dateHelpers'
import type { AssetSymbol, ChartExpiration } from './lib/Chart'
import type { ResolutionId, SeriesId } from './lib/constants'
import type { Expiration } from './transport/types'

type ChartUserState = {
  assetSymbol: AssetSymbol
  resolutionId: ResolutionId
  seriesId: SeriesId
  expiration?: Expiration
}

type ChartState = Omit<ChartUserState, 'expiration'> & {
  expiration: {
    appExpiration: Expiration | undefined
    chartExpiration: ChartExpiration | undefined
  }
}

export const ASSETS = [
  {
    id: '34',
    name: 'ETHEREUM'
  },
  {
    id: '111',
    name: 'PMX'
  }
]

const chartState = reactive<ChartUserState>({
  assetSymbol: ASSETS[0],
  resolutionId: '5S',
  seriesId: 'candlestick'
})

const getActualExpiration = (userExpiration: Expiration | undefined, actualExpirations: Expiration[]) => {
  if (!actualExpirations.length) {
    return userExpiration
  }

  const defaultNextExpiration = actualExpirations[0]

  if (!userExpiration) {
    return defaultNextExpiration
  }

  const userActualExpiration = actualExpirations.find(
    (exp) => exp.close === userExpiration.close && exp.type === userExpiration.type
  )

  return userActualExpiration || defaultNextExpiration
}

export const useChart = () => {
  const { data: expirations } = useExpirations()

  const isReady = computed(() => !!expirations.value.length)

  const state = computed<ChartState>(() => {
    const expiration = getActualExpiration(chartState.expiration, expirations.value)

    return {
      ...chartState,
      expiration: {
        appExpiration: expiration,
        chartExpiration: expiration && {
          ...expiration,
          lock: dateHelpers.iso8601toTime(expiration.lock),
          close: dateHelpers.iso8601toTime(expiration.close)
        }
      }
    }
  })

  const setAssetSymbol = (assetSymbol: AssetSymbol) => {
    chartState.assetSymbol = assetSymbol
  }

  const setResolutionId = (resolutionId: ResolutionId) => {
    chartState.resolutionId = resolutionId
  }

  const setSeriesId = (seriesId: SeriesId) => {
    chartState.seriesId = seriesId
  }

  const setExpiration = (expiration: Expiration) => {
    chartState.expiration = expiration
  }

  return {
    isReady,
    setAssetSymbol,
    setResolutionId,
    setSeriesId,
    setExpiration,
    chartState: state
  }
}
