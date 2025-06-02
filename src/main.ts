import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/themeStore'
import 'virtual:uno.css'
import './style.css'

import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
