import { circle } from '@engine/primitives/circle'
import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  color: string
}

export const dot = (scope: BitmapCoordinatesRenderingScope, p: Point, params: Params) => {
  return circle(scope, p, { radius: 5, 'line-color': params.color, 'line-width': 2, fill: '#001B36' })
}
