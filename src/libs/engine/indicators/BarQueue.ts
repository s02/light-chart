import type { ChartBar } from '@engine/types'

export class BarQueue {
  #sw: ChartBar[] = []
  #length: number

  constructor(length: number) {
    this.#length = length
  }

  push(bar: ChartBar) {
    if (this.#sw.length && this.#sw[this.#sw.length - 1].time === bar.time) {
      this.#sw[this.#sw.length - 1] = bar
    } else {
      this.#sw.push(bar)
      if (this.#sw.length > this.#length) {
        this.#sw.shift()
      }
    }
  }

  isFull() {
    return this.#sw.length === this.#length
  }

  map<T>(fn: (bar: ChartBar) => T) {
    return this.#sw.map(fn)
  }
}
