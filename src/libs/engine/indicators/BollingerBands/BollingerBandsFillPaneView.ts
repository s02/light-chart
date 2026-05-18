import type { BollingerBandsFill } from '@engine/indicators/BollingerBands/BollingerBandsFill'
import { BollingerBandsFillRenderer } from '@engine/indicators/BollingerBands/BollingerBandsFillRenderer'
import type { IPrimitivePaneView } from 'lightweight-charts'

export class BollingerBandsFillPaneView implements IPrimitivePaneView {
  #primitive: BollingerBandsFill

  constructor(primitive: BollingerBandsFill) {
    this.#primitive = primitive
  }

  zOrder() {
    return 'bottom' as const
  }

  renderer() {
    const { chart, series, points } = this.#primitive
    if (!chart || !series) return null
    return new BollingerBandsFillRenderer(points, chart, series)
  }
}
