import { onUnmounted, ref, toValue, watch } from 'vue'
import { Ws } from './transport/WebSocketClient'
import { dateHelpers } from './dateHelpers'
import type { Ref } from 'vue'
import type { Expiration, Quote } from './transport/types'

type OptionKind = 'up' | 'down'

type Option = {
  id: number
  sum: number
  kind: OptionKind
  quoteOpen: number
  createdAt: string
  expirationDate: string
}

let id = 1

export const useTrading = (assetIdRef: Ref<string>) => {
  const lastQuote = ref<Quote | null>(null)
  const options = ref<Option[]>([])
  const quoteSubId = ref<number | null>(null)

  const subscribeToQuotes = (assetId: string) =>
    Ws.get().subscribeToQuotes(assetId, (quote) => {
      lastQuote.value = quote
    })

  const unsubscribeFromQuotes = (assetId: string, id: number) => Ws.get().unsubscribeFromQuotes(assetId, id)

  const buyOption = (kind: OptionKind, expiration?: Expiration) => {
    if (!lastQuote.value || !expiration) {
      return
    }

    const option: Option = {
      id: id++,
      sum: 10,
      kind,
      quoteOpen: lastQuote.value.value,
      createdAt: dateHelpers.secondsToIso8601(lastQuote.value.timestamp),
      expirationDate: new Date(expiration.close).toISOString()
    }

    options.value = [...options.value, option]
  }

  onUnmounted(() => {
    if (quoteSubId.value) {
      unsubscribeFromQuotes(toValue(assetIdRef), quoteSubId.value)
    }
  })

  watch(lastQuote, (quote) => {
    if (!quote) {
      return
    }

    const currentExpirationDate = dateHelpers.secondsToIso8601(quote.timestamp)
    const hasExpiredOptions = !!options.value.find((opt) => opt.expirationDate === currentExpirationDate)

    if (hasExpiredOptions) {
      options.value = options.value.filter((opt) => opt.expirationDate !== currentExpirationDate)
    }
  })

  watch(
    assetIdRef,
    async (nextAssetId, prevAssetId) => {
      if (quoteSubId.value && prevAssetId) {
        unsubscribeFromQuotes(prevAssetId, quoteSubId.value)
        quoteSubId.value = null
      }

      quoteSubId.value = await subscribeToQuotes(nextAssetId)
    },
    { immediate: true }
  )

  return {
    buyOption,
    options
  }
}
