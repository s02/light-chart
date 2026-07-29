import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

// Symbol.for keeps this key stable across Vite HMR re-evaluation, see useEngine.ts
const HintsStateKey: InjectionKey<Ref<string | undefined>> = Symbol.for('light-chart/hints-state')

const createHintsApi = (current: Ref<string | undefined>) => ({
  show: (text: string) => {
    current.value = text
  },
  hide: () => {
    current.value = undefined
  },
  current
})

const useHintsState = (): Ref<string | undefined> => {
  const current = inject(HintsStateKey, null)
  if (!current) {
    throw new Error('useHints must be used within a TerminalChart instance')
  }
  return current
}

export const provideHints = () => {
  const current = ref<string | undefined>()
  provide(HintsStateKey, current)
  return createHintsApi(current)
}

export const useHints = () => createHintsApi(useHintsState())
