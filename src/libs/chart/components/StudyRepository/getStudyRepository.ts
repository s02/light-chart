import { LocalStorageRepository } from '@chart/components/StudyRepository/LocalStorageRepository'
import type { Repository } from '@chart/components/StudyRepository/types'

const repository: Repository = new LocalStorageRepository()

export const getStudyRepository = () => {
  return repository
}
