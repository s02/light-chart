import { ASSETS, PROFITABILITY } from '@app/constants'
import type { AssetSymbol, Language, ResolutionId, SeriesId } from '@chart/types'
import type { Asset, ProfitabilityType, Option, Expiration } from '@app/types'
import { computed, reactive, toValue, watch, type MaybeRef } from 'vue'
import { getActualExpiration, useExpirations } from '@app/composables/useExpirations'
import { helpers } from '@chart/helpers'

export type ChartState = {
  id: 'ch-1' | 'ch-2'
  assetSymbol: AssetSymbol
  profitability: ProfitabilityType
  active: boolean
  resolutionId: ResolutionId
  seriesId: SeriesId
  timeZone: string
  options: Record<Asset['id'], Option[]>
  language: Language
  expiration?: Expiration
}

const defaults: ChartState[] = [
  {
    id: 'ch-1',
    resolutionId: '5S',
    seriesId: 'candlestick',
    assetSymbol: ASSETS[0],
    profitability: PROFITABILITY.TURBO,
    timeZone: 'Etc/UTC',
    language: 'en',
    options: {},
    active: true
  },
  {
    id: 'ch-2',
    resolutionId: '5S',
    seriesId: 'candlestick',
    assetSymbol: ASSETS[0],
    profitability: PROFITABILITY.BINARY,
    timeZone: 'Europe/London',
    language: 'en',
    options: {},
    active: false
  }
]

const storage = {
  save: (state: unknown) => {
    localStorage.setItem('mwcx-state', JSON.stringify(state))
  },
  load: () => {
    const item = localStorage.getItem('mwcx-state')
    return item ? JSON.parse(item) : defaults
  }
}

const charts = reactive<ChartState[]>(storage.load())

export const useChartState = () => {
  const { data: expirationList } = useExpirations()

  const setChartActive = (id: ChartState['id']) => {
    charts.forEach((chart) => (chart.active = false))
    const chart = charts.find((chart) => chart.id === id)
    chart!.active = true
  }

  const setSeries = (id: ChartState['id'], seriesId: SeriesId) => {
    const chart = charts.find((chart) => chart.id === id)
    chart!.seriesId = seriesId
  }

  const setResolution = (id: ChartState['id'], resolutionId: ResolutionId) => {
    const chart = charts.find((chart) => chart.id === id)
    chart!.resolutionId = resolutionId
  }

  const setTimeZone = (id: ChartState['id'], timeZone: string) => {
    const chart = charts.find((chart) => chart.id === id)
    chart!.timeZone = timeZone
  }

  const setLanguage = (id: ChartState['id'], language: Language) => {
    const chart = charts.find((chart) => chart.id === id)
    chart!.language = language
  }

  const setExpiration = (id: ChartState['id'], expiration: Expiration) => {
    const chart = charts.find((chart) => chart.id === id)
    chart!.expiration = expiration
  }

  const addOption = (id: ChartState['id'], option: Option) => {
    const chart = charts.find((chart) => chart.id === id)
    if (!chart!.options[option.asset]) {
      chart!.options[option.asset] = []
    }

    chart!.options[option.asset] = [...chart!.options[option.asset], option]
  }

  return {
    setExpiration,
    setSeries,
    setResolution,
    setChartActive,
    setTimeZone,
    setLanguage,
    addOption,
    charts: computed(() =>
      charts.map((chart) => {
        const expirations = expirationList.value.filter((exp) => exp.type === chart.profitability)
        const expiration = getActualExpiration(chart.expiration, expirations)

        return {
          ...chart,
          expirations,
          currentExpiration: expiration,
          zonedCurrentExpiration: expiration
            ? {
                ...expiration,
                lock: helpers.toZonedDate(expiration.lock, chart.timeZone),
                close: helpers.toZonedDate(expiration.close, chart.timeZone)
              }
            : undefined
        }
      })
    )
  }
}

export const useChart = (chartId: MaybeRef<ChartState['id']>) => {
  const { charts, setSeries, setResolution, setLanguage, setTimeZone, setExpiration } = useChartState()

  const chart = computed(() => {
    const c = charts.value.find((ch) => ch.id === toValue(chartId))

    if (!c) {
      throw new Error(`Chart with id ${chartId} not found`)
    }

    return c
  })

  return {
    chart,
    setSeries: (seriesId: SeriesId) => setSeries(toValue(chartId), seriesId),
    setResolution: (resolutionId: ResolutionId) => setResolution(toValue(chartId), resolutionId),
    setLanguage: (language: Language) => setLanguage(toValue(chartId), language),
    setTimeZone: (tz: string) => setTimeZone(toValue(chartId), tz),
    setExpiration: (exp: Expiration) => setExpiration(toValue(chartId), exp)
  }
}

export const runStateWatcher = () => watch(charts, storage.save)
