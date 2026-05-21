import { circle } from '@engine/primitives/circle'
import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  color: string
}

export const dot = (scope: BitmapCoordinatesRenderingScope, p: Point, params: Params) => {
  return circle(scope, p, { radius: 5, color: params.color, width: 2, fill: '#001B36' })
}
