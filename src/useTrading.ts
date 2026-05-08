import { computed, onUnmounted, reactive, toValue, watch } from 'vue'
import { Ws } from './transport/WebSocketClient'
import { dateHelpers } from './dateHelpers'
import type { Ref } from 'vue'
import type { Expiration, Quote } from './transport/types'
import type { Option, Asset, OptionKind } from './types'

const lskey = 'tr-history'

const saveHistory = () => {
  const hasOptions = Object.keys(options).length

  if (!hasOptions) {
    localStorage.removeItem(lskey)
  } else {
    localStorage.setItem(lskey, JSON.stringify(options))
  }
}

const loadHistory = () => {
  const hist = localStorage.getItem(lskey)
  if (hist) {
    try {
      const h = JSON.parse(hist)
      console.log(h)
      return h
    } catch (e) {
      console.log('History is broken', e)
    }
  }
  return {}
}

let id = 1

const options = reactive<Record<Asset['id'], Option[]>>(loadHistory())
const lastQuotes = reactive<Record<Asset['id'], Quote>>({})
const quoteSubIds = reactive<Record<Asset['id'], number>>({})

export const useQuoteHandler = (assetIdRef: Ref<Asset['id']>) => {
  const subscribeToQuotes = (assetId: string) =>
    Ws.get().subscribeToQuotes(assetId, (quote) => {
      lastQuotes[toValue(assetIdRef)] = quote
    })

  const unsubscribeFromQuotes = (assetId: string, id: number) => Ws.get().unsubscribeFromQuotes(assetId, id)

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
  const buyOption = (kind: OptionKind, expiration: Expiration) => {
    if (!lastQuotes[toValue(assetIdRef)]) {
      return
    }

    const option: Option = {
      id: id++,
      asset: toValue(assetIdRef),
      sum: 10,
      kind,
      quoteOpen: lastQuotes[toValue(assetIdRef)].value,
      createdAt: dateHelpers.secondsToIso8601(lastQuotes[toValue(assetIdRef)].timestamp),
      expirationDate: new Date(expiration.close).toISOString()
    }

    if (!options[toValue(assetIdRef)]) {
      options[toValue(assetIdRef)] = []
    }

    options[toValue(assetIdRef)] = [...options[toValue(assetIdRef)], option]
  }

  return {
    buyOption,
    options: computed(() => options[toValue(assetIdRef)] || [])
  }
}

watch(lastQuotes, (next) => {
  for (const [assetId, lastQuote] of Object.entries(next)) {
    const currentExpirationDate = dateHelpers.secondsToIso8601(lastQuote.timestamp)
    if (!options[assetId]) {
      continue
    }

    const hasExpiredOptions = !!options[assetId].find((opt) => opt.expirationDate <= currentExpirationDate)
    if (hasExpiredOptions) {
      options[assetId] = options[assetId].filter((opt) => opt.expirationDate > currentExpirationDate)
      if (!options[assetId].length) {
        delete options[assetId]
      }
    }
  }
})

watch(options, () => saveHistory())
