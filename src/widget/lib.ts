import { createApp } from 'vue'
import Widget from './App.vue'

const create = (el: string) => {
  const app = createApp(Widget, { el })
  app.mount(el)
  return app
}

export const ChartWidget = {
  create
}
