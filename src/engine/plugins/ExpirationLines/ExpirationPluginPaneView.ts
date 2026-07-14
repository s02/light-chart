import { getBarLogical } from '@engine/helpers'
import { CloseLineRenderer, LockLineRenderer } from './ExpirationPluginRenderer'
import type { ExpirationLinesPlugin } from './ExpirationLinesPlugin'
import type { Coordinate, IPrimitivePaneRenderer, IPrimitivePaneView, UTCTimestamp } from 'lightweight-charts'

interface PaneView extends IPrimitivePaneView {
  update: () => void
}

export class CloseLineView implements IPrimitivePaneView, PaneView {
  protected time: UTCTimestamp
  protected source: ExpirationLinesPlugin
  protected x: Coordinate | null = null

  constructor(source: ExpirationLinesPlugin, time: UTCTimestamp) {
    this.source = source
    this.time = time
  }

  update() {
    const timeScale = this.source.getChart().timeScale()
    const lastBarTime = this.source.getLastBarTime()

    if (!lastBarTime) {
      return
    }

    const posLogical = getBarLogical(timeScale, lastBarTime, this.time, this.source.getResolutionId())

    if (!posLogical) {
      return
    }

    this.x = timeScale.logicalToCoordinate(posLogical)
  }

  renderer(): IPrimitivePaneRenderer {
    return new CloseLineRenderer(this.x)
  }
}

export class LockLineView extends CloseLineView {
  #timer: { diff: number; label: string } | null = null

  updateTimer() {
    const now = Math.floor(Date.now() / 1000)
    const diff = Math.max(0, this.time - now)
    const m = Math.floor(diff / 60)
    const s = diff % 60
    const label = diff > 0 ? `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : ''

    this.#timer = {
      diff,
      label
    }
  }

  override renderer() {
    return new LockLineRenderer(this.x, this.#timer && this.#timer.diff <= 300 ? this.#timer.label : '')
  }
}

export class OffsetLineView implements IPrimitivePaneView, PaneView {
  protected offset: number
  protected source: ExpirationLinesPlugin
  protected x: Coordinate | null = null

  constructor(source: ExpirationLinesPlugin, offset: number) {
    this.source = source
    this.offset = offset
  }

  update() {
    const timeScale = this.source.getChart().timeScale()
    const lastBarTime = this.source.getLastBarTime()

    if (!lastBarTime) {
      return
    }

    const time = lastBarTime + this.offset
    const posLogical = getBarLogical(timeScale, lastBarTime, time as UTCTimestamp, this.source.getResolutionId())

    if (!posLogical) {
      return
    }

    this.x = timeScale.logicalToCoordinate(posLogical)
  }

  renderer(): IPrimitivePaneRenderer {
    return new CloseLineRenderer(this.x)
  }
}
