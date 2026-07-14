import { useChart } from '@chart/useChart'
import en from './locales/locale-en.json'
import ru from './locales/locale-ru.json'
import { computed } from 'vue'

const dicts = {
  en,
  ru
}

const translate = (key: string) => {
  const { state } = useChart()
  const prefixedKey = `$mwc@${key}`

  const dict = dicts[state.language] as Record<string, string>

  return computed(() => {
    if (dict[prefixedKey]) {
      return dict[prefixedKey]
    }

    return prefixedKey
  })
}

export const i18n = {
  translate
}
