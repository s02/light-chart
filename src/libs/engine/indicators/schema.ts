type IndicatorNumberParam = {
  type: 'number'
  key: string
  label: string
  default: number
  min?: number
  max?: number
  step?: number
}

type IndicatorColorParam = {
  type: 'color'
  key: string
  label: string
  default: string
}

type IndicatorParamDescriptor = IndicatorNumberParam | IndicatorColorParam

export type IndicatorSchema = {
  inputs: IndicatorParamDescriptor[]
  style: IndicatorParamDescriptor[]
}

export type InferIndicatorValues<T extends readonly IndicatorParamDescriptor[]> = {
  [D in T[number] as D['key']]: D['default']
}

function indicatorDefaultValues<T extends readonly IndicatorParamDescriptor[]>(
  descriptors: T
): InferIndicatorValues<T> {
  return Object.fromEntries(descriptors.map((d) => [d.key, d.default])) as InferIndicatorValues<T>
}

export function resolveParams<
  TInputs extends readonly IndicatorParamDescriptor[],
  TStyle extends readonly IndicatorParamDescriptor[]
>(
  inputs: TInputs,
  style: TStyle,
  incoming?: Record<string, number | string>
): InferIndicatorValues<TInputs> & InferIndicatorValues<TStyle> {
  const defaults = { ...indicatorDefaultValues(inputs), ...indicatorDefaultValues(style) }
  return { ...defaults, ...incoming } as InferIndicatorValues<TInputs> & InferIndicatorValues<TStyle>
}
