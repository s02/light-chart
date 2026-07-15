import { LocalStorageRepository } from '@chart/components/StudyRepository/LocalStorageRepository'
import type { StudyRepository } from '@chart/components/StudyRepository/types'

const repository: StudyRepository = new LocalStorageRepository()

export const getStudyRepository = () => {
  return repository
}
