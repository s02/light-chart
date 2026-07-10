import type { Expiration } from '@app/types'
import type { Bar } from '@datafeed/types'

export type HttpClientOptions = {
  api: string
}

export class HttpClient {
  #options: HttpClientOptions

  constructor(options: HttpClientOptions) {
    this.#options = options
  }

  async getBars(assetId: string, from: string, to: string, detalization: string): Promise<Bar[]> {
    const params = new URLSearchParams()
    params.append('detalization', detalization)
    params.append('from', from)
    params.append('to', to)
    const url = `${this.#options.api}/api/v1/assets/${assetId}/candles?${params.toString()}`
    const response = await fetch(url)
    const { data } = await response.json()
    return data
  }

  async getWebsocketToken(): Promise<string> {
    const response = await fetch(`${this.#options.api}/api/v1/ws/credentials`)
    const { token } = await response.json()
    return token
  }

  async getExpirations(): Promise<Expiration[]> {
    const response = await fetch(`${this.#options.api}/rpc/v1.Trading.GetAllExpirations`)
    const { data } = await response.json()
    return data
  }
}
