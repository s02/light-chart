import { createApp } from 'vue'
import App from './App.vue'
import { Http } from './transport/HttpClient'
import { Ws } from './transport/WebSocketClient'

Http.initialize({
  api: 'https://dev-api.bindev.info'
})

Ws.initialize(Http.get(), {
  host: 'wss://dev-ws.bindev.info'
})

const app = createApp(App)
app.mount('#app')
