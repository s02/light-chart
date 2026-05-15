import { Drawing } from '@engine/drawings/Drawing'
import { HorizontalLinePaneView } from '@engine/drawings/HorizontalLine/HorizontalLinePaneView'

export class HorizontalLine extends Drawing {
  override paneViews() {
    const viewport = this.getViewport()

    if (viewport && this.anchors.length === 1) {
      return [new HorizontalLinePaneView(viewport, [this.anchors[0]])]
    }

    return []
  }
}
