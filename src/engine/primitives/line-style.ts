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
