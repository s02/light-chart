import { PlotEngine } from '@engine/PlotEngine'
import StudySettings from '@chart/components/Study/StudySettings.vue'
import PaneLegend from '@chart/components/PaneLegend.vue'
import { computed, h, ref, render, watch, type Ref } from 'vue'
import { useModal } from '@chart/composables/useModal'
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
import { useHints } from '@chart/composables/useHints'
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

let pe: PlotEngine | null = null
const rootEl = ref<string | null>(null)
const unwatch: Array<() => void> = []
const legendEls: HTMLElement[] = []

const selectedDrawingElement = ref<DrawingElement | null>(null)

export const useEngineApi = () => {
  const legends = ref<ChartSeriesLegend[]>([])

  const { open: openModal } = useModal()
  const { show: showHint, hide: hideHint } = useHints()

  const register = (el: HTMLElement, options: EngineOptions) => {
    rootEl.value = options.rootEl

    if (!options.resolutionId.value || !options.seriesId.value) {
      throw 'Resolution Id and Series Id are required for engine initialization'
    }

    pe = new PlotEngine(el, {
      datafeed: options.datafeedFactory.create(
        options.assetSymbol.value,
        options.resolutionId.value,
        options.timeZone.value
      ),
      seriesId: options.seriesId.value,
      timeZone: options.timeZone.value
    })

    if (options.options.value) {
      pe.setOptions(options.options.value)
    }

    pe.setExpiration(options.expiration.value)
    pe.setExpirationOffset(options.expirationOffset.value)

    unwatch.push(
      pe.subscribeToLegends((l) => {
        legends.value = l
      })
    )

    pe.subscribeToSelectDrawing(selectDrawing)

    unwatch.push(
      watch(options.timeZone, (next) => {
        assertEngine(pe)
        pe.setTimeZone(next)
      })
    )

    unwatch.push(
      watch(options.expiration, (next) => {
        assertEngine(pe)
        pe.setExpiration(next)
      })
    )

    unwatch.push(
      watch(options.expirationOffset, (next) => {
        assertEngine(pe)
        pe.setExpirationOffset(next)
      })
    )

    unwatch.push(
      watch(options.seriesId, (next) => {
        assertEngine(pe)
        if (!next) {
          return
        }
        pe.setSeriesId(next)
      })
    )

    unwatch.push(
      watch(options.options, (next) => {
        assertEngine(pe)
        if (next) {
          pe.setOptions(next)
        }
      })
    )

    unwatch.push(
      watch(
        () => ({
          assetSymbol: options.assetSymbol.value,
          resolutionId: options.resolutionId.value,
          timezone: options.timeZone.value
        }),
        (next) => {
          assertEngine(pe)
          if (next && next.resolutionId) {
            pe.setDatafeed(options.datafeedFactory.create(next.assetSymbol, next.resolutionId, next.timezone))
          }
        }
      )
    )

    return pe.ready
  }

  const unregister = () => {
    if (pe) {
      pe.destroy()
      pe = null
    }

    unwatch.forEach((fn) => fn())

    legendEls.forEach((el) => render(null, el))
    legendEls.splice(0, legendEls.length)
  }

  const getLayoutConfig = () => {
    assertEngine(pe)
    return pe.getStudiesLayout()
  }

  const setLayoutConfig = (config: LayoutConfig) => {
    assertEngine(pe)
    pe.clearStudies()
    pe.clearDrawings()

    config.indicators.forEach((ind) => {
      addIndicator(ind.ikey as IndicatorName, ind.params)
    })

    config.drawings.forEach((dw) => {
      pe!.addDrawing(dw.ikey as DrawingName, dw.params, dw.anchors)
    })
  }

  const addIndicator = async (key: IndicatorName, params?: StudyParams) => {
    assertEngine(pe)
    const iop = await pe.addIndicator(key, params)
    addLegends(iop)

    return iop.id
  }

  const removeAllDrawings = () => {
    assertEngine(pe)
    pe.clearDrawings()
  }

  const removeAllIndicators = () => {
    assertEngine(pe)

    legendEls.forEach((el) => render(null, el))
    legendEls.splice(0, legendEls.length)

    pe.clearStudies()
  }

  const removeIndicator = (id: number) => {
    assertEngine(pe)

    pe.removeIndicator(id)
    removeLegends()
    pe.getAllIndicators().forEach((iop) => addLegends(iop, 200))
  }

  const addLegends = async (iop: IndicatorOnPane, delay = 0) => {
    if (iop.pane) {
      const el = await iop.pane.getHTMLElement()
      if (el) {
        setTimeout(() => {
          assertEngine(pe)
          render(h(PaneLegend, { indicatorId: iop.id, subscribeToLegends: pe.subscribeToLegends.bind(pe) }), el)
          legendEls.push(el)
        }, delay)
      }
    }
  }

  const removeLegends = () => {
    legendEls.forEach((el) => render(null, el))
    legendEls.splice(0, legendEls.length)
  }

  const editIndicator = async (id: number) => {
    assertEngine(pe)

    const schema = pe.getIndicatorSchema(id)
    const params = await openModal<StudyParams | undefined>(StudySettings, { props: schema })
    if (params) {
      pe.updateIndicator(id, params)
    }
  }

  const startDrawing = (id: DrawingName, options?: DrawingOptions, hint?: string) => {
    assertEngine(pe)
    if (hint) {
      showHint(hint)
    }

    return pe.initDrawing(id, options).then(() => hideHint())
  }

  const cancelDrawing = () => {
    assertEngine(pe)
    return pe.cancelDrawing()
  }

  const updateDrawing = (params: StudyParams) => {
    assertEngine(pe)
    assertDrawingElement(selectedDrawingElement.value)
    pe.updateDrawing(selectedDrawingElement.value.id, params)
    selectedDrawingElement.value.ds.params = params
  }

  const removeDrawing = () => {
    assertEngine(pe)
    assertDrawingElement(selectedDrawingElement.value)
    pe.removeDrawing(selectedDrawingElement.value.id)
    selectedDrawingElement.value = null
  }

  const selectDrawing = (res: DrawingElement | null) => {
    selectedDrawingElement.value = res
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
    rootEl,
    legends,
    drawingSchema: computed(() => {
      if (selectedDrawingElement.value) {
        return selectedDrawingElement.value.ds
      }

      return null
    }),
    getLayoutConfig,
    setLayoutConfig
  }
}
