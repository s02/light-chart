import { createApp } from 'vue'
import App from './App.vue'
import { HTTP_CLIENT_KEY, HttpClient } from './transport/HttpClient'
import { WebSocketClient, WS_CLIENT_KEY } from './transport/WebSocketClient'

const app = createApp(App)

const http = new HttpClient()
const ws = new WebSocketClient(http)

app.provide(HTTP_CLIENT_KEY, http)
app.provide(WS_CLIENT_KEY, ws)

app.mount('#app')
