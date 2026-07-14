import { ASSETS, PROFITABILITY } from '@app/constants'
import { computed, reactive, watch } from 'vue'
import type { AppExpiration, Asset, Expiration, ProfitabilityType, Option } from '@app/types'
import type { AssetSymbol, Language, ResolutionId, SeriesId } from '@chart/types'
import { getActualExpiration, useExpirations } from '@app/composables/useExpirations'
import { helpers } from '@chart/helpers'

type ChartUserState = {
  resolutionId: ResolutionId
  seriesId: SeriesId
  assetSymbol: AssetSymbol
  profitabilityType: ProfitabilityType
  expiration?: Expiration
  timeZone: string
  options: Record<Asset['id'], Option[]>
  language: Language
}

const storage = {
  save: (state: unknown) => {
    localStorage.setItem('mwc-state', JSON.stringify(state))
  },
  load: () => {
    const item = localStorage.getItem('mwc-state')
    const saved = item ? JSON.parse(item) : {}

    return {
      resolutionId: saved.resolutionId || '5S',
      expiration: saved.expiration,
      seriesId: saved.seriesId || 'candlestick',
      assetSymbol: saved.assetSymbol || ASSETS[0],
      profitabilityType: saved.profitabilityType || PROFITABILITY.TURBO,
      timeZone: saved.timeZone || 'Etc/UTC',
      language: saved.language || 'en',
      options: saved.options || {}
    }
  }
}

const state = reactive<ChartUserState>(storage.load())

export const useState = () => {
  const { data: expirationList } = useExpirations()

  const expirations = computed<Expiration[]>(() =>
    expirationList.value.filter((exp) => exp.type === state.profitabilityType)
  )

  const appExpiration = computed<AppExpiration | undefined>(() => {
    const expiration = getActualExpiration(state.expiration, expirations.value)

    if (expiration) {
      return {
        expiration,
        chartExpiration: {
          ...expiration,
          lock: helpers.toZonedDate(expiration.lock, state.timeZone),
          close: helpers.toZonedDate(expiration.close, state.timeZone)
        }
      }
    }

    return undefined
  })

  const setChart = (assetSymbol: AssetSymbol, profitabilityType: ProfitabilityType) => {
    state.assetSymbol = assetSymbol
    state.profitabilityType = profitabilityType
  }

  const setExpiration = (expiration: Expiration) => {
    state.expiration = expiration
  }

  const addOption = (option: Option) => {
    if (!state.options[option.asset]) {
      state.options[option.asset] = []
    }

    state.options[option.asset] = [...state.options[option.asset], option]
  }

  const setSeries = (seriesId: SeriesId) => {
    state.seriesId = seriesId
  }

  const setTimeZone = (tz: string) => {
    state.timeZone = tz
  }

  const setResolution = (resolutionId: ResolutionId) => {
    state.resolutionId = resolutionId
  }

  const setLanguage = (lang: Language) => {
    state.language = lang
  }

  return {
    setChart,
    setSeries,
    setResolution,
    setTimeZone,
    addOption,
    setExpiration,
    setLanguage,
    state: computed(() => ({
      ...state,
      expirations: expirations.value,
      currentExpiration: appExpiration.value
    }))
  }
}

export const runStateWatcher = () => watch(state, storage.save)
