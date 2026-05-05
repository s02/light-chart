import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { BarData, CustomBarItemData, PriceToCoordinateConverter, Time } from 'lightweight-charts'

const CONSTANTS = {
  BarBorderWidth: 1
}

export const optimalCandlestickWidth = (barSpacing: number, pixelRatio: number) => {
  const barSpacingSpecialCaseFrom = 2.5
  const barSpacingSpecialCaseTo = 4
  const barSpacingSpecialCaseCoeff = 3
  if (barSpacing >= barSpacingSpecialCaseFrom && barSpacing <= barSpacingSpecialCaseTo) {
    return Math.floor(barSpacingSpecialCaseCoeff * pixelRatio)
  }

  const barSpacingReducingCoeff = 0.2
  const coeff =
    1 -
    (barSpacingReducingCoeff * Math.atan(Math.max(barSpacingSpecialCaseTo, barSpacing) - barSpacingSpecialCaseTo)) /
      (Math.PI * 0.5)
  const res = Math.floor(barSpacing * coeff * pixelRatio)
  const scaledBarSpacing = Math.floor(barSpacing * pixelRatio)
  const optimal = Math.min(res, scaledBarSpacing)
  return Math.max(Math.floor(pixelRatio), optimal)
}

export const calculateBorderWidth = (barWidth: number, pixelRatio: number) => {
  let borderWidth = Math.floor(CONSTANTS.BarBorderWidth * pixelRatio)
  if (barWidth <= 2 * borderWidth) {
    borderWidth = Math.floor((barWidth - 1) * 0.5)
  }
  const res = Math.max(Math.floor(pixelRatio), borderWidth)
  if (barWidth <= res * 2) {
    return Math.max(Math.floor(pixelRatio), Math.floor(CONSTANTS.BarBorderWidth * pixelRatio))
  }
  return res
}

export const drawWicks = (
  bar: CustomBarItemData<Time, BarData>,
  scope: BitmapCoordinatesRenderingScope,
  priceConverter: PriceToCoordinateConverter,
  options: { fill: string }
) => {
  const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = scope
  const { x, originalData: d } = bar
  const wickWidth = Math.max(1, Math.floor(horizontalPixelRatio))

  const highY = Math.round((priceConverter(d.high) ?? 0) * verticalPixelRatio)
  const lowY = Math.round((priceConverter(d.low) ?? 0) * verticalPixelRatio)
  const openY = Math.round((priceConverter(d.open) ?? 0) * verticalPixelRatio)
  const closeY = Math.round((priceConverter(d.close) ?? 0) * verticalPixelRatio)

  const bodyTop = Math.min(openY, closeY)
  const bodyBottom = Math.max(openY, closeY)
  const centerX = Math.round(x * horizontalPixelRatio) - Math.floor(wickWidth / 2)

  ctx.fillStyle = options.fill

  if (highY < bodyTop) {
    ctx.fillRect(centerX, highY, wickWidth, bodyTop - highY)
  }

  if (lowY > bodyBottom) {
    ctx.fillRect(centerX, bodyBottom, wickWidth, lowY - bodyBottom)
  }
}

export const drawBody = (
  bar: CustomBarItemData<Time, BarData>,
  barWidth: number,
  scope: BitmapCoordinatesRenderingScope,
  priceConverter: PriceToCoordinateConverter,
  options: { border: string } | { fill: string }
) => {
  const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = scope
  const { x, originalData: d } = bar

  const openY = Math.round((priceConverter(d.open) ?? 0) * verticalPixelRatio)
  const closeY = Math.round((priceConverter(d.close) ?? 0) * verticalPixelRatio)

  const top = Math.min(openY, closeY)
  const bottom = Math.max(openY, closeY)
  const left = Math.round(x * horizontalPixelRatio) - Math.floor(barWidth / 2)
  const height = Math.max(1, bottom - top)

  const borderWidth = calculateBorderWidth(barWidth, horizontalPixelRatio)

  if ('border' in options) {
    ctx.lineWidth = borderWidth
    ctx.strokeStyle = options.border
    ctx.strokeRect(left + 0.5, top + 0.5, barWidth - 1, height - 1)
  }

  if ('fill' in options) {
    ctx.fillStyle = options.fill
    ctx.fillRect(left, top, barWidth, height)
  }
}
