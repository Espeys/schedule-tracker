import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initializeAuth } from './services/auth-service'
import './styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

void initializeAuth().finally(() => {
  app.mount('#app')
})
