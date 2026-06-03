import type { HighlighterParams } from '@engine/drawings/Highlighter/Highlighter'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class HighlighterRenderer implements IPrimitivePaneRenderer {
  #points: Point[]
  #params: HighlighterParams

  constructor(points: Point[], params: HighlighterParams) {
    this.#points = points
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio
      const pts = this.#points

      if (pts.length < 2) {
        if (pts.length === 1) {
          ctx.beginPath()
          ctx.arc(pts[0].x * hpr, pts[0].y * vpr, (this.#params['brush-width'] / 2) * hpr, 0, Math.PI * 2)
          ctx.fillStyle = this.#params['line-color']
          ctx.fill()
        }
        return
      }

      ctx.beginPath()
      ctx.moveTo(pts[0].x * hpr, pts[0].y * vpr)

      for (let i = 1; i < pts.length - 1; i++) {
        const midX = ((pts[i].x + pts[i + 1].x) / 2) * hpr
        const midY = ((pts[i].y + pts[i + 1].y) / 2) * vpr
        ctx.quadraticCurveTo(pts[i].x * hpr, pts[i].y * vpr, midX, midY)
      }

      ctx.lineTo(pts[pts.length - 1].x * hpr, pts[pts.length - 1].y * vpr)

      ctx.strokeStyle = this.#params['line-color']
      ctx.lineWidth = this.#params['brush-width'] * hpr
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    })
  }
}
