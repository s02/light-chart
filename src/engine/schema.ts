type StudyParam = {
  key: string
  fastPanel?: boolean
  textEditPanel?: boolean
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

type StudyLineWidthParam = {
  type: 'line-width'
  default: number
} & StudyParam

type StudyLineColorParam = {
  type: 'line-color'
  default: string
} & StudyParam

type StudyLineStyleParam = {
  type: 'line-style'
  default: 'solid' | 'dashed' | 'dotted'
} & StudyParam

type StudyFontSizeParam = {
  type: 'font-size'
  default: number
} & StudyParam

type StudyBoolParam = {
  type: 'bool'
  default: boolean
} & StudyParam

export type StudyParamDescriptor =
  | StudyNumberParam
  | StudyColorParam
  | StudyStringParam
  | StudySelectParam
  | StudyLineWidthParam
  | StudyLineStyleParam
  | StudyFontSizeParam
  | StudyBoolParam
  | StudyLineColorParam

export type StudyParams = Record<string, number | string | boolean>
export type StudyParamValue = StudyParams[string]
export type SchemaKey = keyof StudySchema

export type StudySchema = {
  text: StudyParamDescriptor[]
  inputs: StudyParamDescriptor[]
  style: StudyParamDescriptor[]
}

export type InferStudyValues<T extends readonly StudyParamDescriptor[]> = {
  [D in T[number] as D['key']]: D extends { type: 'select'; values: readonly (infer V)[] }
    ? V
    : D extends { type: 'number' }
      ? number
      : D extends { type: 'bool' }
        ? boolean
        : D['default']
}

const studyDefaultValues = <T extends readonly StudyParamDescriptor[]>(descriptors: T): InferStudyValues<T> => {
  return Object.fromEntries(descriptors.map((d) => [d.key, d.default])) as InferStudyValues<T>
}

export const resolveStudyParams = <
  TInputs extends readonly StudyParamDescriptor[],
  TStyle extends readonly StudyParamDescriptor[],
  TText extends readonly StudyParamDescriptor[]
>(
  inputs: TInputs,
  style: TStyle,
  text: TText,
  incoming?: StudyParams
): InferStudyValues<TInputs> & InferStudyValues<TStyle> & InferStudyValues<TText> => {
  const defaults = { ...studyDefaultValues(inputs), ...studyDefaultValues(style), ...studyDefaultValues(text) }
  return { ...defaults, ...incoming } as InferStudyValues<TInputs> & InferStudyValues<TStyle> & InferStudyValues<TText>
}
