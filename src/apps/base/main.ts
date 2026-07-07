import { createApp } from 'vue'
import App from '@app/App.vue'
import { Http, Ws } from '@app/transport'

Http.initialize({
  api: 'https://dev-api.bindev.info'
})

Ws.initialize(Http.get(), {
  host: 'wss://dev-ws.bindev.info'
})

const app = createApp(App)
app.mount('#app')
