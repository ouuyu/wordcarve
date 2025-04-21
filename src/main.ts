import ArcoVue from '@arco-design/web-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@arco-design/web-vue/dist/arco.css'
import 'virtual:uno.css'

const app = createApp(App)
const pinia = createPinia()

app.use(ArcoVue)
app.use(pinia)
app.use(router)
app.mount('#app')
