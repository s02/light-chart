import { createApp } from 'vue'
import App from './App.vue'
import { Http } from './transport/HttpClient'
import { Ws } from './transport/WebSocketClient'

Http.initialize({
  api: 'https://api.binarium.com'
})

Ws.initialize(Http.get(), {
  host: 'wss://ws.binarium.com'
})

const app = createApp(App)
app.mount('#app')
