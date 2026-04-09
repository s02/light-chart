import { inject, ref } from 'vue'
import { HTTP_CLIENT_KEY } from './transport/HttpClient'
import { MAX_SYSTEM_TIMEOUT, dateHelpers } from './dateHelpers'
import type { Expiration } from './transport/types'

let iv: number | null = null
let isFirstRequest = true
const expirationsListTimeouts: number[] = []

const data = ref<Expiration[]>([])

const createNextDate = (date: Date) => {
  let nextTime = dateHelpers.addMinutes(date, 1)
  nextTime = dateHelpers.setSeconds(nextTime, 0)
  nextTime = dateHelpers.addSeconds(nextTime, 1)
  nextTime = dateHelpers.setMilliseconds(nextTime, 0)
  return nextTime
}

export const useExpirations = () => {
  const httpClient = inject(HTTP_CLIENT_KEY)

  if (!httpClient) {
    throw 'No http client provided'
  }

  const remove = (exp: Expiration) => {
    data.value = data.value.filter((e) => {
      const toRemove = e.close === exp.close && e.lock === exp.lock && e.type === exp.type
      return !toRemove
    })
  }

  const load = async () => {
    const expirations = await httpClient.getExpirations()
    const list = expirations.filter((exp) => exp.type === 1)
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

  const format = (date: string) => {
    const zonedTime = date.split('T')[1]
    const time = zonedTime.split('+')[0]
    return time
  }

  return {
    data,
    format,
    schedule
  }
}
