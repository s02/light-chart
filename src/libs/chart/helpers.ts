export { dateToEpoch } from '@engine/helpers'

const parseColor = (color: string) => {
  const inner = color.slice(4, -1)
  const slashIdx = inner.indexOf('/')
  if (slashIdx === -1) {
    return { baseColor: color, opacity: 100 }
  }

  const base = inner.slice(0, slashIdx).trim()
  const alphaStr = inner.slice(slashIdx + 1).trim()
  const isPercent = alphaStr.endsWith('%')
  const value = parseFloat(alphaStr)

  return {
    baseColor: `rgb(${base})`,
    opacity: Math.round(isPercent ? value : value * 100)
  }
}

export const helpers = {
  parseColor
}
