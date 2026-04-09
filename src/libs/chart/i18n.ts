import en from './locales/en.json'

const translate = (key: string): string => {
  const dict = en as Record<string, string>
  if (dict[key]) {
    return dict[key]
  }

  return key
}

export const i18n = {
  translate
}
