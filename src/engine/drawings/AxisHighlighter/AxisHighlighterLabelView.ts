import { formatPrice } from '@engine/helpers'
import type { Anchor } from '@engine/points'
import type { ISeriesPrimitiveAxisView } from 'lightweight-charts'
import type { DrawingViewport } from '../types'

function formatTime(time: Anchor['time']): string {
  if (typeof time !== 'number') {
    return String(time)
  }

  const date = new Date(time * 1000)
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const day = date.getUTCDate()
  const h = date.getUTCHours().toString().padStart(2, '0')
  const m = date.getUTCMinutes().toString().padStart(2, '0')
  const s = date.getUTCSeconds()
  const time_ = s ? `${h}:${m}:${s.toString().padStart(2, '0')}` : `${h}:${m}`

  return `${month} ${day}, ${time_}`
}

type Params = {
  fillColor?: string
  color?: string
  vertical: boolean
}

export class AxisHighlighterLabelView implements ISeriesPrimitiveAxisView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #vertical: boolean
  #backColor: string
  #textColor: string

  constructor(viewport: DrawingViewport, anchor: Anchor, params: Params) {
    this.#viewport = viewport
    this.#anchor = anchor
    this.#vertical = params.vertical
    this.#backColor = params.fillColor || 'rgb(41 98 255)'
    this.#textColor = params.color || 'rgb(255 255 255)'
  }

  coordinate() {
    const point = this.#viewport.anchorToPoint(this.#anchor)
    return point ? (this.#vertical ? point.y : point.x) : -1e9
  }

  text() {
    return this.#vertical ? formatPrice(this.#anchor.price) : formatTime(this.#anchor.time)
  }

  textColor() {
    return this.#textColor
  }

  backColor() {
    return this.#backColor
  }

  visible() {
    return this.#viewport.anchorToPoint(this.#anchor) !== null
  }

  tickVisible() {
    return true
  }
}
