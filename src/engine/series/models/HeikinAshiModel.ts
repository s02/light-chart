import type { ChartBar } from '@engine/types'

export class HeikinAshiModel {
  #baseBars: ChartBar[] = []

  update(bar: ChartBar) {
    if (!this.#baseBars.length) {
      this.#baseBars.push(bar)
      return bar
    }

    const lastBar = this.#baseBars[this.#baseBars.length - 1]

    if (bar.time === lastBar.time) {
      if (this.#baseBars.length === 1) {
        this.#baseBars = [bar]
        return bar
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

    const result: ChartBar[] = []
    let prevBar: ChartBar | null = null

    for (let i = 0; i < data.length; i++) {
      const bar = data[i]
      if (prevBar) {
        const current = this.#calcBar(bar, prevBar)

        result.push(current)
        prevBar = current
      } else {
        result.push(bar)
        prevBar = bar
      }
    }

    this.#baseBars = result.slice(-2)

    return result
  }

  #calcBar(currentBar: ChartBar, prevBar: ChartBar) {
    return {
      ...currentBar,
      open: (prevBar.open + prevBar.close) / 2,
      close: (currentBar.open + currentBar.close + currentBar.high + currentBar.low) / 4
    }
  }
}

// https://www.tradingview.com/support/solutions/43000619436-understanding-heikin-ashi-charts/
