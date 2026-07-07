import { HttpClient, type HttpClientOptions } from '@datafeed/HttpClient'
import { WebSocketClient, type WebSocketClientOptions } from '@datafeed/WebSocketClient'

let httpClientInstance: HttpClient | null = null

export const Http = {
  initialize: (options: HttpClientOptions) => {
    if (httpClientInstance) {
      throw 'HttpClient already initialized'
    }

    httpClientInstance = new HttpClient(options)
  },

  get: () => {
    if (!httpClientInstance) {
      throw `HttpClient isn't initialized`
    }

    return httpClientInstance
  }
}

let webSocketClientInstance: WebSocketClient | null = null

export const Ws = {
  initialize: (httpClient: HttpClient, options: WebSocketClientOptions) => {
    if (webSocketClientInstance) {
      throw 'WebSocketClient already initialized'
    }

    webSocketClientInstance = new WebSocketClient(httpClient, options)
  },

  get: () => {
    if (!webSocketClientInstance) {
      throw `WebSocketClient isn't initialized`
    }

    return webSocketClientInstance
  }
}
