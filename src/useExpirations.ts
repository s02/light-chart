import { ref } from 'vue'
import { Http } from './transport/HttpClient'
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
  const remove = (exp: Expiration) => {
    data.value = data.value.filter((e) => {
      const toRemove = e.close === exp.close && e.lock === exp.lock && e.type === exp.type
      return !toRemove
    })
  }

  const load = async () => {
    const list = await Http.get().getExpirations()
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
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}.${month} ${hours}:${minutes}`
  }

  return {
    data,
    format,
    schedule
  }
}
