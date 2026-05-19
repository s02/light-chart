import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { TrendLinePaneView } from './TrendLinePaneView'
import type { Point } from 'lightweight-charts'

export class TrendLine extends BaseDrawing {
  static readonly ikey = 'trend-line'
  static readonly points = 2

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new TrendLinePaneView(viewport, this.anchors, this.anchorsVisible)]
    }

    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) {
      return false
    }

    const start = viewport.anchorToPoint(this.anchors[0])
    const end = viewport.anchorToPoint(this.anchors[1])

    if (!start || !end) return false

    const distance = geometry.distanceToLineSegment(point, start, end)
    return distance < TrendLine.hitThreashold
  }
}
