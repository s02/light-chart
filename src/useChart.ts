import { computed, reactive } from 'vue'
import { useExpirations } from './useExpirations'
import { dateToEpoch } from '@chart/helpers'
import type { Expiration } from './transport/types'
import type { AssetSymbol, ChartExpiration } from '@chart/types'

type ChartUserState = {
  assetSymbol: AssetSymbol
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
  assetSymbol: ASSETS[0]
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

  const state = computed<ChartState>(() => {
    const expiration = getActualExpiration(chartState.expiration, expirations.value)

    return {
      ...chartState,
      expiration: {
        appExpiration: expiration,
        chartExpiration: expiration && {
          ...expiration,
          lock: dateToEpoch(expiration.lock),
          close: dateToEpoch(expiration.close)
        }
      }
    }
  })

  const setAssetSymbol = (assetSymbol: AssetSymbol) => {
    chartState.assetSymbol = assetSymbol
  }

  const setExpiration = (expiration: Expiration) => {
    chartState.expiration = expiration
  }

  return {
    setAssetSymbol,
    setExpiration,
    chartState: state
  }
}
