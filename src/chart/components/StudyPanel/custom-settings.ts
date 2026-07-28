import type { Component } from 'vue'
import StudyFibRetracement from '@chart/components/Study/StudyFibRetracement.vue'
import StudyGannSquare from '@chart/components/Study/StudyGannSquare.vue'
import { FibRetracement } from '@engine/drawings/FibRetracement/FibRetracement'
import { GannSquare } from '@engine/drawings/GannSquare/GannSquare'

export const STUDY_CUSTOM_SETTINGS: Record<string, Component> = {
  [FibRetracement.ikey]: StudyFibRetracement,
  [GannSquare.ikey]: StudyGannSquare
}
