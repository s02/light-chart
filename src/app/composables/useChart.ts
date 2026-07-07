import { computed, reactive } from 'vue'
import { useExpirations } from '@app/composables/useExpirations'
import { helpers } from '@chart/helpers'
import { ASSETS, PROFITABILITY } from '@app/constants'
import type { AppExpiration, ChartState, ChartUserState, ProfitabilityType } from './types'
import type { AssetSymbol } from '@chart/types'
import type { Expiration } from '@app/transport/types'

const chartState = reactive<ChartUserState>({
  assetSymbol: ASSETS[0],
  profitabilityType: PROFITABILITY.TURBO
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
  const { data: expirationList } = useExpirations()

  const expirations = computed<Expiration[]>(() =>
    expirationList.value.filter((exp) => exp.type === chartState.profitabilityType)
  )

  const appExpiration = computed<AppExpiration | undefined>(() => {
    const expiration = getActualExpiration(chartState.expiration, expirations.value)

    if (expiration) {
      return {
        expiration,
        chartExpiration: {
          ...expiration,
          lock: helpers.dateToEpoch(expiration.lock),
          close: helpers.dateToEpoch(expiration.close)
        }
      }
    }

    return undefined
  })

  const state = computed<ChartState>(() => {
    const result = {
      ...chartState,
      expirations: expirations.value,
      currentExpiration: appExpiration.value
    }

    return result
  })

  const setChart = (assetSymbol: AssetSymbol, profitabilityType: ProfitabilityType) => {
    chartState.assetSymbol = assetSymbol
    chartState.profitabilityType = profitabilityType
  }

  const setExpiration = (expiration: Expiration) => {
    chartState.expiration = expiration
  }

  return {
    setChart,
    setExpiration,
    chartState: state
  }
}
