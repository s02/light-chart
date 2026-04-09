export type Bar = {
  time: string
  open: number
  high: number
  low: number
  close: number
}

export type Expiration = {
  type: number
  lock: string
  close: string
}

export type Quote = {
  value: number
  timestamp: number
}

export type HttpTransport = {
  getBars(assetId: string, from: string, to: string, detalization: string): Promise<Bar[]>
  getWebsocketToken(): Promise<string>
}

export type WsTransport = {
  subscribeToQuotes(assetId: string, callback: (quote: Quote) => void): Promise<number>
  unsubscribeFromQuotes(assetId: string, id: number): void
}
