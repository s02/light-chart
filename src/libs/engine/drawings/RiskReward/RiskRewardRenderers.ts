import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer } from 'lightweight-charts'

export class RiskRewardRenderers implements IPrimitivePaneRenderer {
  #renderers: IPrimitivePaneRenderer[]

  constructor(...renderers: IPrimitivePaneRenderer[]) {
    this.#renderers = renderers
  }

  draw(target: CanvasRenderingTarget2D) {
    for (const r of this.#renderers) {
      r.draw(target)
    }
  }
}
