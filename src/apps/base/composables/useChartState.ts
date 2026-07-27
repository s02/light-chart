import { ASSETS, PROFITABILITY } from '@app/constants'
import type { AssetSymbol, Language, ResolutionId, SeriesId } from '@chart/types'
import type { Asset, ProfitabilityType, Option, Expiration } from '@app/types'
import { computed, reactive } from 'vue'
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

const charts = reactive<ChartState[]>([
  {
    id: 'ch-1',
    assetSymbol: ASSETS[0],
    profitability: PROFITABILITY.TURBO,
    active: true,
    resolutionId: '5S',
    seriesId: 'candlestick',
    timeZone: 'Europe/Riga',
    options: {},
    language: 'en',
    expiration: undefined
  },
  {
    id: 'ch-2',
    assetSymbol: ASSETS[1],
    profitability: PROFITABILITY.BINARY,
    active: false,
    resolutionId: '30',
    seriesId: 'candlestick',
    timeZone: 'Europe/London',
    options: {},
    language: 'en',
    expiration: undefined
  }
])

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

  return {
    setExpiration,
    setSeries,
    setResolution,
    setChartActive,
    setTimeZone,
    setLanguage,
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
