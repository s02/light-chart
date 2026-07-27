import { onUnmounted, reactive, toValue, watch } from 'vue'
import { dateHelpers } from '@app/services/dateHelpers'
import { Transport } from '@app/transport'
import type { Ref } from 'vue'
import type { Asset, OptionKind, Expiration } from '@app/types'
import type { Quote } from '@datafeed/types'
import { useChartState, type ChartState } from '@app/composables/useChartState'

let id = 1

const lastQuotes = reactive<Record<Asset['id'], Quote>>({})
const quoteSubIds = reactive<Record<Asset['id'], string>>({})

export const useQuoteHandler = (assetIdRef: Ref<Asset['id']>) => {
  const subscribeToQuotes = (assetId: string) =>
    Transport.get().ws.subscribeToQuotes(assetId, (quote) => {
      lastQuotes[toValue(assetIdRef)] = quote
    })

  const unsubscribeFromQuotes = (assetId: string, id: string) => Transport.get().ws.unsubscribeFromQuotes(assetId, id)

  onUnmounted(() => {
    const assetId = toValue(assetIdRef)
    if (quoteSubIds[assetId]) {
      unsubscribeFromQuotes(assetId, quoteSubIds[assetId])
      delete quoteSubIds[assetId]
      delete lastQuotes[assetId]
    }
  })

  watch(
    assetIdRef,
    async (nextAssetId, prevAssetId) => {
      if (prevAssetId && quoteSubIds[prevAssetId]) {
        unsubscribeFromQuotes(prevAssetId, quoteSubIds[prevAssetId])
        delete quoteSubIds[prevAssetId]
        delete lastQuotes[prevAssetId]
      }

      quoteSubIds[nextAssetId] = await subscribeToQuotes(nextAssetId)
    },
    { immediate: true }
  )
}

export const useTrading = (chartId: Ref<ChartState['id']>, assetIdRef: Ref<string>) => {
  const { addOption } = useChartState()

  const buyOption = (kind: OptionKind, expiration: Expiration) => {
    const asset = toValue(assetIdRef)

    if (!lastQuotes[asset]) {
      return
    }

    addOption(chartId.value, {
      id: id++,
      asset,
      sum: 10,
      kind,
      quoteOpen: lastQuotes[toValue(assetIdRef)].value,
      createdAt: dateHelpers.secondsToIso8601(lastQuotes[toValue(assetIdRef)].timestamp),
      expirationDate: new Date(expiration.close).toISOString()
    })
  }

  return {
    buyOption
  }
}

export const runOptionsWatcher = () => {
  const { charts } = useChartState()

  return watch(lastQuotes, (next) => {
    for (const [assetId, lastQuote] of Object.entries(next)) {
      const currentExpirationDate = dateHelpers.secondsToIso8601(lastQuote.timestamp)
      charts.value.forEach((chart) => {
        if (chart.options[assetId]) {
          const hasExpiredOptions = !!chart.options[assetId].find((opt) => opt.expirationDate <= currentExpirationDate)

          if (hasExpiredOptions) {
            chart.options[assetId] = chart.options[assetId].filter((opt) => opt.expirationDate > currentExpirationDate)

            if (!chart.options[assetId].length) {
              delete chart.options[assetId]
            }
          }
        }
      })
    }
  })
}
