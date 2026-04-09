import Centrifuge from 'centrifuge'
import type { Quote, WsTransport } from './types'

type HttpClient = {
  getWebsocketToken(): Promise<string>
}

type WebSocketClientOptions = {
  host: string
}

type ChannelName = string
type CallbackFn = (data: unknown) => void

type Subscriptions = Record<
  ChannelName,
  {
    subscription: Centrifuge.Subscription
    callbacks: { id: number; fn: CallbackFn }[]
  }
>

const CHANNEL = {
  quotes: (assetId: string): ChannelName => `anonymous:assets/${assetId}/quotes`
}

export class WebSocketClient {
  #id = 1
  #ws: Promise<Centrifuge>
  #subscriptions: Subscriptions = {}
  #options: WebSocketClientOptions

  constructor(http: HttpClient, options: WebSocketClientOptions) {
    this.#options = options
    this.#ws = http.getWebsocketToken().then((token) => {
      const ws = new Centrifuge(`${this.#options.host}/connection/websocket`, {
        debug: false,
        onRefresh: async (_ctx, callback) => {
          const token = await http.getWebsocketToken()
          callback({ status: 200, data: { token } })
        }
      })
      ws.setToken(token)
      ws.connect()
      return ws
    })
  }

  subscribeToQuotes(assetId: string, callback: (quote: Quote) => void) {
    const channel = CHANNEL.quotes(assetId)
    return this.#addCallback(channel, (message) => {
      const quote = (message as { data: Quote }).data
      callback(quote)
    })
  }

  unsubscribeFromQuotes(assetId: string, id: number) {
    const channel = CHANNEL.quotes(assetId)
    return this.#removeCallback(channel, id)
  }

  #removeCallback(channel: string, id: number) {
    const sub = this.#subscriptions[channel]
    if (sub && sub.callbacks) {
      sub.callbacks = sub.callbacks.filter((cb) => cb.id !== id)
    }
  }

  async #addCallback(channel: string, cb: CallbackFn) {
    const ws = await this.#ws

    if (this.#subscriptions[channel] && this.#subscriptions[channel].callbacks) {
      this.#subscriptions[channel].callbacks.push({
        id: this.#id,
        fn: cb
      })

      return this.#id++
    }

    this.#subscriptions[channel] = {
      callbacks: [{ id: this.#id, fn: cb }],
      subscription: ws.subscribe(channel, {
        publish: (data: unknown) => {
          this.#subscriptions[channel].callbacks.forEach((callback) => callback.fn(data))
        }
      })
    }

    return this.#id++
  }
}

let instance: WebSocketClient | null = null

export const Ws = {
  initialize: (httpClient: HttpClient, options: WebSocketClientOptions) => {
    if (instance) {
      throw 'WebSocketClient already initialized'
    }

    instance = new WebSocketClient(httpClient, options)
  },

  get: (): WsTransport => {
    if (!instance) {
      throw `WebSocketClient isn't initialized`
    }

    return instance
  }
}
