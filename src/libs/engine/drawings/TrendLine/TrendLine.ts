import { Drawing } from '@engine/drawings/Drawing'
import { TrendLinePaneView } from '@engine/drawings/TrendLine/TrendLinePaneView'

export class TrendLine extends Drawing {
  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new TrendLinePaneView(viewport, this.anchors)]
    }

    return []
  }
}
