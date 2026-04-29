/**
 * Максимальный период, который мы можем запрашивать для конкретного периода свечей задан в QUOTES_DETALIZATION.
 * Т.е. для 5 сек свечей мы можем запрашивать период в 1000 секунд.
 *
 * Максимальный период, который мы можем запросить в принципе это MAX_DETALIZATION.
 *
 * Если свечи нужны за период, выходящий за ограничения,
 * то его нужно разбить на несколько запросов.
 */

import { candleHelpers } from './candleHelpers'
import { RESOLUTION_SETTINGS } from '@chart/constants'
import type { HttpTransport } from './transport/types'
import type { AssetSymbol, ChartBar, ResolutionId } from '@chart/types'

const MAX_DETALIZATION = 90 * 24 * 60 * 60

export class CandleHttpService {
  #http: HttpTransport
  #resolutionId: ResolutionId
  #assetSymbol: AssetSymbol

  constructor(resolutionId: ResolutionId, assetSymbol: AssetSymbol, http: HttpTransport) {
    this.#http = http
    this.#resolutionId = resolutionId
    this.#assetSymbol = assetSymbol
  }

  async getCandles({ to, count }: { to: Date; count: number }) {
    const toSeconds = to.getTime() / 1000
    const divider = RESOLUTION_SETTINGS[this.#resolutionId].seconds
    const fromSeconds = toSeconds - divider * count

    const periods = this.#splitPeriod(
      fromSeconds,
      toSeconds,
      Math.min(RESOLUTION_SETTINGS[this.#resolutionId].seconds * 1000, MAX_DETALIZATION)
    ).map((period) => ({
      from: new Date(period.from * 1000),
      to: new Date(period.to * 1000)
    }))

    const result = await Promise.all(periods.map((period) => this.#request(period)))

    const data: ChartBar[] = []

    result.forEach((candles) => {
      candles.forEach((candle) => {
        if (!data.length || candle.time !== data[data.length - 1].date) {
          data.push(candleHelpers.transform(candle))
        }
      })
    })

    return data
  }

  #request(period: { from: Date; to: Date }) {
    return this.#http.getBars(
      this.#assetSymbol.id,
      period.from.toISOString(),
      period.to.toISOString(),
      RESOLUTION_SETTINGS[this.#resolutionId].name
    )
  }

  #splitPeriod(fromSeconds: number, toSeconds: number, maxInterval: number) {
    const periods = []

    let startTo = toSeconds - 1
    let startFrom = toSeconds

    do {
      startFrom = startFrom - maxInterval

      periods.unshift({
        from: startFrom,
        to: startTo
      })

      startTo = startTo - maxInterval
    } while (startFrom > fromSeconds)

    return periods
  }
}
