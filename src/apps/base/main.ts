import { createApp } from 'vue'
import App from '@app/App.vue'
import { Transport } from '@app/transport'

Transport.initialize('https://dev-api.bindev.info', 'wss://dev-ws.bindev.info')

const app = createApp(App)
app.mount('#app')
