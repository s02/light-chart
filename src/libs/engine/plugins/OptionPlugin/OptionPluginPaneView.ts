import { getBarLogical } from '@engine/helpers'
import type { OptionPlugin } from '@engine/plugins/OptionPlugin/OptionPlugin'
import { OptionPluginRenderer } from '@engine/plugins/OptionPlugin/OptionPluginRenderer'
import type { ChartOption } from '@engine/types'
import type { IPrimitivePaneView, Point } from 'lightweight-charts'

export class OptionPluginPaneView implements IPrimitivePaneView {
  #source: OptionPlugin
  #option: ChartOption
  #points: {
    open?: Point
    close?: Point
  } = {}

  constructor(source: OptionPlugin) {
    this.#source = source
    this.#option = this.#source.getOption()
  }

  update() {
    const timeScale = this.#source.getChart().timeScale()
    const series = this.#source.getSeries()

    if (!series) {
      return
    }

    const lastBarTime = this.#source.getLastBarTime()

    if (!lastBarTime) {
      return
    }

    const y = series.priceToCoordinate(this.#option.quoteOpen)
    const resolutionId = this.#source.getResolution()
    const startBarLogical = getBarLogical(timeScale, lastBarTime, this.#option.createdAt, resolutionId)
    const endBarLogical = getBarLogical(timeScale, lastBarTime, this.#option.expirationDate, resolutionId)

    if (startBarLogical) {
      const x = timeScale.logicalToCoordinate(startBarLogical)
      if (x && y) {
        this.#points.open = { x, y }
      }
    }

    if (endBarLogical) {
      const x = timeScale.logicalToCoordinate(endBarLogical)
      if (x && y) {
        this.#points.close = { x, y }
      }
    }
  }

  renderer() {
    if (!this.#points.open || !this.#points.close) {
      return null
    }

    return new OptionPluginRenderer(this.#points.open, this.#points.close, {
      isProfitable: this.#source.isOptionProfitable(),
      option: this.#option
    })
  }
}
