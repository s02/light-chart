import { CrossMarkerRenderer } from './CrossMarkerRenderer'
import type { CrossMarker } from './CrossMarker'
import type { IPrimitivePaneView } from 'lightweight-charts'

export class CrossMarkerPaneView implements IPrimitivePaneView {
  #primitive: CrossMarker

  constructor(primitive: CrossMarker) {
    this.#primitive = primitive
  }

  renderer() {
    const { chart, series, points } = this.#primitive
    if (!chart || !series) {
      return null
    }
    return new CrossMarkerRenderer(points, chart, series)
  }
}
