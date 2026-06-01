import { ZigZagRenderer } from './ZigZagRenderer'
import type { ZigZagPrimitive } from './ZigZagPrimitive'
import type { IPrimitivePaneView } from 'lightweight-charts'

export class ZigZagPaneView implements IPrimitivePaneView {
  #primitive: ZigZagPrimitive

  constructor(primitive: ZigZagPrimitive) {
    this.#primitive = primitive
  }

  renderer() {
    const { chart, series, lines, color } = this.#primitive
    if (!chart || !series) {
      return null
    }
    return new ZigZagRenderer(lines, chart, series, color)
  }
}
