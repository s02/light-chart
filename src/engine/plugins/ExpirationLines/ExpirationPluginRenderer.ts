import { verticalLine } from '@engine/primitives/vertical-line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { Coordinate, IPrimitivePaneRenderer } from 'lightweight-charts'

export class CloseLineRenderer implements IPrimitivePaneRenderer {
  #x: Coordinate | null

  constructor(x: Coordinate | null) {
    this.#x = x
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this.#x) {
        verticalLine(scope, this.#x, { color: '#e25447', width: 1, label: { text: 'Expiration Time' } })
      }
    })
  }
}

export class LockLineRenderer implements IPrimitivePaneRenderer {
  #x: Coordinate | null
  #diff: string

  constructor(x: Coordinate | null, diff: string) {
    this.#x = x
    this.#diff = diff
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this.#x) {
        verticalLine(scope, this.#x, {
          color: '#0db1fd',
          width: 1,
          dash: true,
          label: { text: `Lock Time ${this.#diff}`, position: 'left' }
        })
      }
    })
  }
}
