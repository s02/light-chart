import { dot } from '@engine/primitives/dot'
import { ray } from '@engine/primitives/ray'
import { textLabel, textLabelBounds } from '@engine/primitives/text-label'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { Coordinate, IPrimitivePaneRenderer, Point } from 'lightweight-charts'
import type { RayParams } from '@engine/drawings/Ray/Ray'

export class RayRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: RayParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: RayParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      ray(scope, this.#p1, this.#p2, { width: this.#params['line-width'], color: this.#params['line-color'] })

      if (this.#params.text) {
        const fontSize = this.#params['font-size']
        const { width, height } = textLabelBounds(this.#params.text, fontSize)

        const dx = this.#p2.x - this.#p1.x
        const dy = this.#p2.y - this.#p1.y
        const len = Math.hypot(dx, dy) || 1

        let normalX = -dy / len
        let normalY = dx / len
        if (normalY > 0) {
          normalX = -normalX
          normalY = -normalY
        }

        const gap = 1
        const offset = gap + height / 2
        const midX = (this.#p1.x + this.#p2.x) / 2 + normalX * offset
        const midY = (this.#p1.y + this.#p2.y) / 2 + normalY * offset

        const center = {
          x: (midX - width / 2) as Coordinate,
          y: (midY - height / 2) as Coordinate
        }

        let angle = Math.atan2(dy, dx)
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          angle += Math.PI
        }

        textLabel(scope, center, {
          text: this.#params.text,
          'text-color': this.#params['text-color'],
          'font-size': fontSize,
          angle
        })
      }

      if (this.#withDots) {
        dot(scope, this.#p1)
        dot(scope, this.#p2)
      }
    })
  }
}
