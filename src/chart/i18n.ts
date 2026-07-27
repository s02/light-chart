import en from './locales/locale-en.json'
import ru from './locales/locale-ru.json'
import { computed } from 'vue'
import { ref } from 'vue'
import type { Language } from '@chart/types'

const dicts = {
  en,
  ru
}

const language = ref<Language>('en')

const translate = (key: string) => {
  const prefixedKey = `$mwc@${key}`

  const dict = dicts[language.value] as Record<string, string>

  return computed(() => {
    if (dict[prefixedKey]) {
      return dict[prefixedKey]
    }

    return prefixedKey
  })
}

const setLanguage = (lang: Language) => {
  language.value = lang
}

export const i18n = {
  setLanguage,
  translate
}
