import type { IChartApi } from 'lightweight-charts'

export class DrawingKeyManager {
  #onDelete: () => void

  constructor(_chart: IChartApi, onDelete: () => void) {
    this.#onDelete = onDelete
    window.addEventListener('keydown', this.#keyHandler)
  }

  #keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.#onDelete()
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.#keyHandler)
  }
}
