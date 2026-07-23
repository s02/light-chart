import { LineStyle } from 'lightweight-charts'

export const LINE_STYLE_VALUES = ['solid', 'dashed', 'dotted'] as const

export type LineStyleValue = (typeof LINE_STYLE_VALUES)[number]

type LineDash = {
  dash: number[]
  cap?: CanvasLineCap
}

export const lineDash = (style: LineStyleValue | undefined, width: number): LineDash => {
  if (style === 'dashed') {
    return { dash: [width * 5, width * 5] }
  }

  if (style === 'dotted') {
    return { dash: [width * 2, width * 5], cap: 'round' }
  }

  return { dash: [] }
}

// Mirrors lightweight-charts' own LineStyle -> dash pattern mapping so custom-drawn
// primitives (e.g. ZigZag segments) match the look of native series lines.
export const lineStyleDash = (style: LineStyle, width: number): LineDash => {
  switch (style) {
    case LineStyle.Dotted:
      return { dash: [width, width] }
    case LineStyle.Dashed:
      return { dash: [width * 2, width * 2] }
    case LineStyle.LargeDashed:
      return { dash: [width * 6, width * 6] }
    case LineStyle.SparseDotted:
      return { dash: [width, width * 4] }
    default:
      return { dash: [] }
  }
}
