import type { ChartBar } from '@engine/types'

export type HollowBar = ChartBar & {
  isGreenHollow: boolean
  isGreenFilled: boolean
  isRedHollow: boolean
  isRedFilled: boolean
}

export class HollowCandleModel {
  #baseBars: HollowBar[] = []

  update(bar: ChartBar) {
    if (!this.#baseBars.length) {
      const hwbar = this.#calcBar(bar, bar)
      this.#baseBars.push(hwbar)
      return hwbar
    }

    const lastBar = this.#baseBars[this.#baseBars.length - 1]

    if (bar.time === lastBar.time) {
      if (this.#baseBars.length === 1) {
        const hwbar = this.#calcBar(bar, bar)
        this.#baseBars = [hwbar]
        return hwbar
      }

      const prevBar = this.#baseBars[this.#baseBars.length - 2]
      const current = this.#calcBar(bar, prevBar)

      this.#baseBars = [prevBar, current]
      return current
    }

    const prevBar = lastBar
    const current = this.#calcBar(bar, prevBar)
    this.#baseBars = [prevBar, current]
    return current
  }

  setData(data: ChartBar[]) {
    if (!data.length) {
      return []
    }

    const result: HollowBar[] = []
    let prevBar: HollowBar | null = null

    for (let i = 0; i < data.length; i++) {
      const bar = data[i]
      let current: HollowBar

      if (prevBar) {
        current = this.#calcBar(bar, prevBar)
      } else {
        current = this.#calcBar(bar, bar)
      }

      result.push(current)
      prevBar = current
    }

    this.#baseBars = result.slice(-2)

    return result
  }

  #calcBar(currentBar: ChartBar, prevBar: ChartBar): HollowBar {
    return {
      ...currentBar,
      isGreenHollow: currentBar.close >= prevBar.close && currentBar.close >= currentBar.open,
      isGreenFilled: currentBar.close >= prevBar.close && currentBar.close < currentBar.open,
      isRedHollow: currentBar.close < prevBar.close && currentBar.close >= currentBar.open,
      isRedFilled: currentBar.close < prevBar.close && currentBar.close < currentBar.open
    }
  }
}

//https://www.tradingview.com/support/solutions/43000745270-hollow-candle-charts-explained/
