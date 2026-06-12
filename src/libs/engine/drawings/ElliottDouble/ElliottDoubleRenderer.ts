import type { ElliottDoubleParams } from '@engine/drawings/ElliottDouble/ElliottDouble'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import { textLabel, textLabelBounds } from '@engine/primitives/text-label'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { Coordinate, IPrimitivePaneRenderer, Point } from 'lightweight-charts'

const LABELS = ['0', 'W', 'X', 'Y']

export class ElliottDoubleRenderer implements IPrimitivePaneRenderer {
  #points: Point[]
  #withDots: boolean
  #params: ElliottDoubleParams

  constructor(points: Point[], withDots: boolean, params: ElliottDoubleParams) {
    this.#points = points
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      for (let i = 0; i < this.#points.length - 1; i++) {
        line(scope, this.#points[i], this.#points[i + 1], {
          width: this.#params['line-width'],
          color: this.#params['line-color']
        })
      }

      const fontSize = this.#params['font-size']
      const labelGap = 6

      for (let i = 0; i < this.#points.length; i++) {
        const p = this.#points[i]
        const label = LABELS[i] ?? ''

        const prevY = i > 0 ? this.#points[i - 1].y : null
        const nextY = i < this.#points.length - 1 ? this.#points[i + 1].y : null
        const neighborMinY = prevY !== null && nextY !== null ? Math.min(prevY, nextY) : (prevY ?? nextY ?? p.y)
        const above = p.y <= neighborMinY

        if (label) {
          const { width: labelW, height: labelH } = textLabelBounds(label, fontSize)
          const labelX = p.x - labelW / 2
          const labelY = above ? p.y - labelGap - labelH : p.y + labelGap

          textLabel(
            scope,
            { x: labelX as Coordinate, y: labelY as Coordinate },
            {
              text: label,
              'text-color': this.#params['text-color'],
              'font-size': fontSize
            }
          )
        }

        if (this.#withDots) {
          dot(scope, p, { color: this.#params['line-color'] })
        }
      }
    })
  }
}
