import { PlotEngine } from '@engine/PlotEngine'
import StudySettings from '@chart/components/Study/StudySettings.vue'
import PaneLegend from '@chart/components/PaneLegend.vue'
import { computed, h, inject, provide, ref, render, watch, type InjectionKey, type Ref } from 'vue'
import { provideModal, useModal } from '@chart/composables/useModal'
import type {
  AssetSymbol,
  ChartExpiration,
  ChartOption,
  ChartSeriesLegend,
  ResolutionId,
  SeriesId
} from '@engine/types'
import type { DrawingName, DrawingOptions, DrawingSelectFn } from '@engine/drawings/types'
import type { DatafeedFactory } from '@chart/types'
import type { StudyParams } from '@engine/schema'
import type { LayoutConfig } from '@engine/indicators/types'
import type { IndicatorName } from '@engine/indicators'
import { provideHints, useHints } from '@chart/composables/useHints'
import type { IndicatorOnPane } from '@engine/indicators/IndicatorsManager'

type DrawingElement = Parameters<DrawingSelectFn>[0]

type EngineOptions = {
  seriesId: Ref<SeriesId | null>
  resolutionId: Ref<ResolutionId | null>
  options: Ref<ChartOption[] | undefined>
  expiration: Ref<ChartExpiration | undefined>
  expirationOffset: Ref<number | undefined>
  assetSymbol: Ref<AssetSymbol>
  timeZone: Ref<string>
  datafeedFactory: DatafeedFactory
  rootEl: string
  onResolutionChanged(resolutionId: ResolutionId): void
  onSeriesChanged(seriesId: SeriesId): void
}

type EngineState = {
  pe: PlotEngine | null
  rootEl: Ref<string | null>
  unwatch: Array<() => void>
  legendEls: HTMLElement[]
  selectedDrawingElement: Ref<DrawingElement | null>
}

type ModalApi = ReturnType<typeof useModal>
type HintsApi = ReturnType<typeof useHints>

function assertDrawingElement(el: DrawingElement | null): asserts el {
  if (!el) {
    throw new Error(`Drawing doesn't selected`)
  }
}

function assertEngine(engine: PlotEngine | null): asserts engine {
  if (!engine) {
    throw new Error(`Engine isn't defined.`)
  }
}

const EngineStateKey: InjectionKey<EngineState> = Symbol('engine-state')

const createEngineState = (): EngineState => ({
  pe: null,
  rootEl: ref<string | null>(null),
  unwatch: [],
  legendEls: [],
  selectedDrawingElement: ref<DrawingElement | null>(null)
})

const useEngineState = (): EngineState => {
  const state = inject(EngineStateKey, null)
  if (!state) {
    throw new Error('useEngineApi must be used within a TerminalChart instance')
  }
  return state
}

const createEngineApi = (state: EngineState, modal: ModalApi, hints: HintsApi) => {
  const legends = ref<ChartSeriesLegend[]>([])

  const { open: openModal } = modal
  const { show: showHint, hide: hideHint } = hints

  const register = (el: HTMLElement, options: EngineOptions) => {
    state.rootEl.value = options.rootEl

    if (!options.resolutionId.value || !options.seriesId.value) {
      throw 'Resolution Id and Series Id are required for engine initialization'
    }

    state.pe = new PlotEngine(el, {
      datafeed: options.datafeedFactory.create(
        options.assetSymbol.value,
        options.resolutionId.value,
        options.timeZone.value
      ),
      seriesId: options.seriesId.value,
      timeZone: options.timeZone.value
    })

    if (options.options.value) {
      state.pe.setOptions(options.options.value)
    }

    state.pe.setExpiration(options.expiration.value)
    state.pe.setExpirationOffset(options.expirationOffset.value)

    state.unwatch.push(
      state.pe.subscribeToLegends((l) => {
        legends.value = l
      })
    )

    state.pe.subscribeToSelectDrawing(selectDrawing)

    state.unwatch.push(
      watch(options.timeZone, (next) => {
        assertEngine(state.pe)
        state.pe.setTimeZone(next)
      })
    )

    state.unwatch.push(
      watch(options.expiration, (next) => {
        assertEngine(state.pe)
        state.pe.setExpiration(next)
      })
    )

    state.unwatch.push(
      watch(options.expirationOffset, (next) => {
        assertEngine(state.pe)
        state.pe.setExpirationOffset(next)
      })
    )

    state.unwatch.push(
      watch(options.seriesId, (next) => {
        assertEngine(state.pe)
        if (!next) {
          return
        }
        state.pe.setSeriesId(next)
      })
    )

    state.unwatch.push(
      watch(options.options, (next) => {
        assertEngine(state.pe)
        if (next) {
          state.pe.setOptions(next)
        }
      })
    )

    state.unwatch.push(
      watch(
        () => ({
          assetSymbol: options.assetSymbol.value,
          resolutionId: options.resolutionId.value,
          timezone: options.timeZone.value
        }),
        (next) => {
          assertEngine(state.pe)
          if (next && next.resolutionId) {
            state.pe.setDatafeed(options.datafeedFactory.create(next.assetSymbol, next.resolutionId, next.timezone))
          }
        }
      )
    )

    return state.pe.ready
  }

  const unregister = () => {
    if (state.pe) {
      state.pe.destroy()
      state.pe = null
    }

    state.unwatch.forEach((fn) => fn())
    state.unwatch.splice(0, state.unwatch.length)

    state.legendEls.forEach((el) => render(null, el))
    state.legendEls.splice(0, state.legendEls.length)
  }

  const getLayoutConfig = () => {
    assertEngine(state.pe)
    return state.pe.getStudiesLayout()
  }

  const setLayoutConfig = (config: LayoutConfig) => {
    assertEngine(state.pe)
    state.pe.clearStudies()
    state.pe.clearDrawings()

    config.indicators.forEach((ind) => {
      addIndicator(ind.ikey as IndicatorName, ind.params)
    })

    config.drawings.forEach((dw) => {
      state.pe!.addDrawing(dw.ikey as DrawingName, dw.params, dw.anchors)
    })
  }

  const addIndicator = async (key: IndicatorName, params?: StudyParams) => {
    assertEngine(state.pe)
    const iop = await state.pe.addIndicator(key, params)
    addLegends(iop)

    return iop.id
  }

  const removeAllDrawings = () => {
    assertEngine(state.pe)
    state.pe.clearDrawings()
  }

  const removeAllIndicators = () => {
    assertEngine(state.pe)

    state.legendEls.forEach((el) => render(null, el))
    state.legendEls.splice(0, state.legendEls.length)

    state.pe.clearStudies()
  }

  const removeIndicator = (id: number) => {
    assertEngine(state.pe)

    state.pe.removeIndicator(id)
    removeLegends()
    state.pe.getAllIndicators().forEach((iop) => addLegends(iop, 200))
  }

  const addLegends = async (iop: IndicatorOnPane, delay = 0) => {
    if (iop.pane) {
      const el = await iop.pane.getHTMLElement()
      if (el) {
        setTimeout(() => {
          assertEngine(state.pe)
          render(
            h(PaneLegend, { indicatorId: iop.id, subscribeToLegends: state.pe.subscribeToLegends.bind(state.pe) }),
            el
          )
          state.legendEls.push(el)
        }, delay)
      }
    }
  }

  const removeLegends = () => {
    state.legendEls.forEach((el) => render(null, el))
    state.legendEls.splice(0, state.legendEls.length)
  }

  const editIndicator = async (id: number) => {
    assertEngine(state.pe)

    const schema = state.pe.getIndicatorSchema(id)
    const params = await openModal<StudyParams | undefined>(StudySettings, { props: schema })
    if (params) {
      state.pe.updateIndicator(id, params)
    }
  }

  const startDrawing = (id: DrawingName, options?: DrawingOptions, hint?: string) => {
    assertEngine(state.pe)
    if (hint) {
      showHint(hint)
    }

    return state.pe.initDrawing(id, options).then(() => hideHint())
  }

  const cancelDrawing = () => {
    assertEngine(state.pe)
    return state.pe.cancelDrawing()
  }

  const updateDrawing = (params: StudyParams) => {
    assertEngine(state.pe)
    assertDrawingElement(state.selectedDrawingElement.value)
    state.pe.updateDrawing(state.selectedDrawingElement.value.id, params)
    state.selectedDrawingElement.value.ds.params = params
  }

  const removeDrawing = () => {
    assertEngine(state.pe)
    assertDrawingElement(state.selectedDrawingElement.value)
    state.pe.removeDrawing(state.selectedDrawingElement.value.id)
    state.selectedDrawingElement.value = null
  }

  const selectDrawing = (res: DrawingElement | null) => {
    state.selectedDrawingElement.value = res
  }

  return {
    register,
    unregister,
    addIndicator,
    removeIndicator,
    editIndicator,
    startDrawing,
    removeAllDrawings,
    removeAllIndicators,
    cancelDrawing,
    updateDrawing,
    removeDrawing,
    selectDrawing,
    rootEl: state.rootEl,
    legends,
    drawingSchema: computed(() => {
      if (state.selectedDrawingElement.value) {
        return state.selectedDrawingElement.value.ds
      }

      return null
    }),
    getLayoutConfig,
    setLayoutConfig
  }
}

export const provideEngineApi = () => {
  const modal = provideModal()
  const hints = provideHints()
  const state = createEngineState()
  provide(EngineStateKey, state)

  return createEngineApi(state, modal, hints)
}

export const useEngineApi = () => {
  const state = useEngineState()
  const modal = useModal()
  const hints = useHints()

  return createEngineApi(state, modal, hints)
}
