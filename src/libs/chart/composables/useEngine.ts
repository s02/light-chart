import type { IndicatorName } from '@engine/indicators'
import { PlotEngine } from '@engine/PlotEngine'
import type { StudyParams } from '@engine/schema'
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
import StudySettings from '@chart/components/Study/StudySettings.vue'
import type { LayoutConfig } from '@engine/indicators/types'

type DrawingElement = Parameters<DrawingSelectFn>[0]

type EngineOptions = {
  seriesId: Ref<SeriesId>
  options: Ref<ChartOption[] | undefined>
  expiration: Ref<ChartExpiration | undefined>
  assetSymbol: Ref<AssetSymbol>
  resolutionId: Ref<ResolutionId>
  datafeedFactory: DatafeedFactory
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
const unwatch: Array<() => void> = []

const selectedDrawingElement = ref<DrawingElement | null>(null)

export const useEngineApi = () => {
  const legends = ref<ChartSeriesLegend[]>([])

  const { open: openModal } = useModal()

  const register = (el: HTMLElement, options: EngineOptions) => {
    pe = new PlotEngine(el, {
      datafeed: options.datafeedFactory(options.assetSymbol.value, options.resolutionId.value),
      seriesId: options.seriesId.value
    })

    if (options.options.value) {
      pe.setOptions(options.options.value)
    }

    if (options.expiration.value) {
      pe.setExpiration(options.expiration.value)
    }

    unwatch.push(
      pe.subscribeToLegends((l) => {
        legends.value = l
      })
    )

    pe.subscribeToSelectDrawing(selectDrawing)

    unwatch.push(
      watch(options.expiration, (next) => {
        assertEngine(pe)
        if (next) {
          pe.setExpiration(next)
        }
      })
    )

    unwatch.push(
      watch(options.seriesId, (next) => {
        assertEngine(pe)
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
          resolutionId: options.resolutionId.value
        }),
        (next) => {
          assertEngine(pe)
          if (next) {
            pe.setDatafeed(options.datafeedFactory(next.assetSymbol, next.resolutionId))
          }
        }
      )
    )
  }

  const unregister = () => {
    if (pe) {
      pe.destroy()
      pe = null
    }

    unwatch.forEach((fn) => fn())
  }

  const getLayoutConfig = () => {
    assertEngine(pe)
    return pe.getStudiesLayout()
  }

  const setLayoutConfig = (config: LayoutConfig) => {
    assertEngine(pe)
    pe.clearStudies()

    config.indicators.forEach((ind) => {
      addIndicator(ind.ikey as IndicatorName, ind.params)
    })
  }

  const addIndicator = async (key: IndicatorName, params: StudyParams) => {
    assertEngine(pe)
    const t = await pe.addIndicator(key, params)

    if (t.paneIndex && t.paneIndex > 0 && t.el) {
      render(h(PaneLegend, { paneIndex: t.paneIndex, subscribeToLegends: pe.subscribeToLegends.bind(pe) }), t.el)
    }

    return t.id
  }

  const removeIndicator = (id: number) => {
    assertEngine(pe)
    pe.removeIndicator(id)
  }

  const editIndicator = async (id: number) => {
    assertEngine(pe)

    const schema = pe.getIndicatorSchema(id)
    const params = await openModal<StudyParams | undefined>(StudySettings, { props: schema })
    if (params) {
      pe.updateIndicator(id, params)
    }
  }

  const startDrawing = (id: DrawingName, options?: DrawingOptions) => {
    assertEngine(pe)
    return pe.addDrawing(id, options)
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
    cancelDrawing,
    updateDrawing,
    removeDrawing,
    selectDrawing,
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
