import { ref } from 'vue'
import { Transport } from '@app/transport'
import { MAX_SYSTEM_TIMEOUT, dateHelpers } from '@app/services/dateHelpers'
import type { Expiration } from '@app/types'

let iv: NodeJS.Timeout | null = null
let isFirstRequest = true
const expirationsListTimeouts: NodeJS.Timeout[] = []

const data = ref<Expiration[]>([])

const createNextDate = (date: Date) => {
  let nextTime = dateHelpers.addMinutes(date, 1)
  nextTime = dateHelpers.setSeconds(nextTime, 0)
  nextTime = dateHelpers.addSeconds(nextTime, 1)
  nextTime = dateHelpers.setMilliseconds(nextTime, 0)
  return nextTime
}

export const getActualExpiration = (userExpiration: Expiration | undefined, actualExpirations: Expiration[]) => {
  if (!actualExpirations.length) {
    return userExpiration
  }

  const defaultNextExpiration = actualExpirations[0]

  if (!userExpiration) {
    return defaultNextExpiration
  }

  const userActualExpiration = actualExpirations.find(
    (exp) => exp.close === userExpiration.close && exp.type === userExpiration.type
  )

  return userActualExpiration || defaultNextExpiration
}

export const useExpirations = () => {
  const remove = (exp: Expiration) => {
    data.value = data.value.filter((e) => {
      const toRemove = e.close === exp.close && e.lock === exp.lock && e.type === exp.type
      return !toRemove
    })
  }

  const load = async () => {
    const list = await Transport.get().http.getExpirations()
    expirationsListTimeouts.map(clearTimeout)

    const now = Date.now()

    list.forEach((exp) => {
      const diff = new Date(exp.lock).getTime() - now
      if (diff < MAX_SYSTEM_TIMEOUT) {
        expirationsListTimeouts.push(
          setTimeout(() => {
            remove(exp)
          }, diff)
        )
      }
    })

    data.value = list
  }

  const schedule = () => {
    const now = new Date()
    const nextDate = createNextDate(now)

    const diff = isFirstRequest ? 0 : nextDate.getTime() - now.getTime()
    isFirstRequest = false

    if (iv) {
      clearTimeout(iv)
      iv = null
    }

    iv = setTimeout(async () => {
      await load()
      schedule()
    }, diff)

    console.log('next time', nextDate.toISOString())
  }

  return {
    data,
    schedule
  }
}
