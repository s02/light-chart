type StudyNumberParam = {
  type: 'number'
  key: string
  default: number
  min?: number
  max?: number
  step?: number
  options?: number[]
}

type StudyColorParam = {
  type: 'color'
  key: string
  default: string
}

type StudyStringParam = {
  type: 'string'
  key: string
  default: string
}

export type StudyParamDescriptor = StudyNumberParam | StudyColorParam | StudyStringParam

export type StudyParams = Record<string, number | string>

export type StudySchema = {
  inputs: StudyParamDescriptor[]
  style: StudyParamDescriptor[]
}

export type InferStudyValues<T extends readonly StudyParamDescriptor[]> = {
  [D in T[number] as D['key']]: D['default']
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
