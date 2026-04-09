import type { InjectionKey } from 'vue'
import type { Bar, Expiration, HttpTransport } from './types'

export class HttpClient implements HttpTransport {
  //#host = 'https://dev-api.bindev.info'
  #host = 'https://api.binarium.com'

  async getBars(assetId: string, from: string, to: string, detalization: string): Promise<Bar[]> {
    const params = new URLSearchParams()
    params.append('detalization', detalization)
    params.append('from', from)
    params.append('to', to)
    const url = `${this.#host}/api/v1/assets/${assetId}/candles?${params.toString()}`
    const response = await fetch(url)
    const { data } = await response.json()
    return data
  }

  async getWebsocketToken(): Promise<string> {
    const response = await fetch(`${this.#host}/api/v1/ws/credentials`)
    const { token } = await response.json()
    return token
  }

  async getExpirations(): Promise<Expiration[]> {
    const response = await fetch(`${this.#host}/rpc/v1.Trading.GetAllExpirations`)
    const { data } = await response.json()
    return data
  }
}

export const HTTP_CLIENT_KEY: InjectionKey<HttpClient> = Symbol('http')
