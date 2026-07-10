import { circle } from '@engine/primitives/circle'
import { horizontalLine } from '@engine/primitives/horizontal-line'
import { infoMarker } from '@engine/primitives/info-marker'
import { verticalLine } from '@engine/primitives/vertical-line'
import type { ChartOption } from '@engine/types'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

type RendererInfo = {
  option: ChartOption
  isProfitable: boolean
}

export class OptionPluginRenderer implements IPrimitivePaneRenderer {
  #openPoint: Point
  #closePoint: Point
  #isProfitable: boolean
  #option: ChartOption

  constructor(openPoint: Point, closePoint: Point, { option, isProfitable }: RendererInfo) {
    this.#openPoint = openPoint
    this.#closePoint = closePoint
    this.#isProfitable = isProfitable
    this.#option = option
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this.#openPoint.x && this.#openPoint.y) {
        circle(scope, this.#openPoint, { radius: 3, 'fill-color': '#999' })
      }

      if (this.#closePoint.x) {
        verticalLine(scope, this.#closePoint.x, { width: 1, color: '#00c21f' })
      }

      if (this.#closePoint.x && this.#closePoint.y) {
        const marker = this.#option.kind === 'up' ? '▴' : '▾'
        const defaultColor = this.#option.kind === 'up' ? '#00c21f' : '#f92c14'
        const background = this.#isProfitable ? defaultColor : '#999'
        infoMarker(scope, this.#closePoint as Point, { text: `${marker} ${this.#option.getSum()}`, background })
      }

      if (this.#openPoint.x && this.#openPoint.y && this.#closePoint.x && this.#closePoint.y) {
        horizontalLine(scope, this.#openPoint as Point, this.#closePoint as Point, {
          width: 3,
          color: '#00c21f',
          dash: true
        })
      }
    })
  }
}
