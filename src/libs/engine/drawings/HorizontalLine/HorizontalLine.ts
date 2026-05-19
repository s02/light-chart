import { BaseDrawing } from '../BaseDrawing'
import { HorizontalLinePaneView } from './HorizontalLinePaneView'
import type { Point } from 'lightweight-charts'

export class HorizontalLine extends BaseDrawing {
  static readonly ikey = 'horizontal-line'
  static readonly points = 1

  override paneViews() {
    const viewport = this.getViewport()

    if (viewport && this.anchors.length === 1) {
      return [new HorizontalLinePaneView(viewport, [this.anchors[0]])]
    }

    return []
  }

  override checkTap(_point: Point): boolean {
    throw new Error('Method not implemented.')
  }
}
