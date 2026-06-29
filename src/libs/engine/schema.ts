type StudyParam = {
  key: string
  fastPanel?: boolean
}

type StudyNumberParam = {
  type: 'number'
  default: number
  min?: number
  max?: number
  step?: number
  options?: number[]
} & StudyParam

type StudyColorParam = {
  type: 'color'
  default: string
} & StudyParam

type StudyStringParam = {
  type: 'string'
  default: string
} & StudyParam

type StudySelectParam = {
  type: 'select'
  default: string
  values: readonly string[]
} & StudyParam

export type StudyParamDescriptor = StudyNumberParam | StudyColorParam | StudyStringParam | StudySelectParam

export type StudyParams = Record<string, number | string>

export type StudySchema = {
  text?: StudyParamDescriptor[]
  inputs?: StudyParamDescriptor[]
  style?: StudyParamDescriptor[]
}

export type InferStudyValues<T extends readonly StudyParamDescriptor[]> = {
  [D in T[number] as D['key']]: D extends { type: 'select'; values: readonly (infer V)[] }
    ? V
    : D extends { type: 'number' }
      ? number
      : D['default']
}

const studyDefaultValues = <T extends readonly StudyParamDescriptor[]>(descriptors: T): InferStudyValues<T> => {
  return Object.fromEntries(descriptors.map((d) => [d.key, d.default])) as InferStudyValues<T>
}

export const resolveStudyParams = <
  TInputs extends readonly StudyParamDescriptor[],
  TStyle extends readonly StudyParamDescriptor[]
>(
  inputs: TInputs,
  style: TStyle,
  incoming?: Record<string, number | string>
): InferStudyValues<TInputs> & InferStudyValues<TStyle> => {
  const defaults = { ...studyDefaultValues(inputs), ...studyDefaultValues(style) }
  return { ...defaults, ...incoming } as InferStudyValues<TInputs> & InferStudyValues<TStyle>
}
