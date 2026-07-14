import { computed, onUnmounted, reactive, toValue, watch } from 'vue'
import { dateHelpers } from '@app/services/dateHelpers'
import { Transport } from '@app/transport'
import { useState } from '@app/composables/useState'
import type { Ref } from 'vue'
import type { Asset, OptionKind, Expiration } from '@app/types'
import type { Quote } from '@datafeed/types'

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

export const useTrading = (assetIdRef: Ref<string>) => {
  const { addOption, state } = useState()

  const buyOption = (kind: OptionKind, expiration: Expiration) => {
    const asset = toValue(assetIdRef)

    if (!lastQuotes[asset]) {
      return
    }

    addOption({
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
    buyOption,
    options: computed(() => state.value.options[toValue(assetIdRef)] || [])
  }
}

export const runOptionsWatcher = () => {
  const { state } = useState()

  return watch(lastQuotes, (next) => {
    for (const [assetId, lastQuote] of Object.entries(next)) {
      const currentExpirationDate = dateHelpers.secondsToIso8601(lastQuote.timestamp)
      if (!state.value.options[assetId]) {
        continue
      }

      const hasExpiredOptions = !!state.value.options[assetId].find(
        (opt) => opt.expirationDate <= currentExpirationDate
      )

      if (hasExpiredOptions) {
        state.value.options[assetId] = state.value.options[assetId].filter(
          (opt) => opt.expirationDate > currentExpirationDate
        )

        if (!state.value.options[assetId].length) {
          delete state.value.options[assetId]
        }
      }
    }
  })
}
