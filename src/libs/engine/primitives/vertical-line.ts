import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Coordinate } from 'lightweight-charts'

type Label = {
  text: string
  position?: 'right' | 'left'
}

type Params = {
  width: number
  color: string
  label?: Label
  dash?: boolean
}

export const verticalLine = (scope: BitmapCoordinatesRenderingScope, x: Coordinate, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio

  ctx.beginPath()

  if (params.dash) {
    ctx.setLineDash([4, 4])
  }

  ctx.moveTo(x * hpr, 0)
  ctx.lineTo(x * hpr, scope.bitmapSize.height)
  ctx.strokeStyle = params.color
  ctx.lineWidth = params.width
  ctx.stroke()

  if (params.dash) {
    ctx.setLineDash([])
  }

  if (params.label) {
    const vpr = scope.verticalPixelRatio
    const px = x * hpr
    const py = scope.bitmapSize.height
    const left = params.label.position === 'left'

    ctx.save()
    ctx.translate(px + (left ? -5 : 5) * hpr, py - 7 * vpr)
    ctx.rotate(-Math.PI / 2)
    ctx.font = `${13 * vpr}px sans-serif`
    ctx.fillStyle = params.color
    ctx.textBaseline = left ? 'bottom' : 'top'
    ctx.fillText(params.label.text, 0, 0)
    ctx.restore()
  }
}
