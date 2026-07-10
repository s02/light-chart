import { HttpClient } from '@app/HttpClient'
import { WebSocketClient } from '@app/WebSocketClient'

let httpClientInstance: HttpClient | null = null
let webSocketClientInstance: WebSocketClient | null = null

export const Transport = {
  initialize: (apiHost: string, wsHost: string) => {
    if (httpClientInstance) {
      throw 'HttpClient already initialized'
    }

    if (webSocketClientInstance) {
      throw 'WebSocketClient already initialized'
    }

    httpClientInstance = new HttpClient({ api: apiHost })
    webSocketClientInstance = new WebSocketClient(httpClientInstance, { host: wsHost })
  },

  get: () => {
    if (!httpClientInstance) {
      throw `HttpClient isn't initialized`
    }

    if (!webSocketClientInstance) {
      throw `WebSocketClient isn't initialized`
    }

    return {
      http: httpClientInstance,
      ws: webSocketClientInstance
    }
  }
}
