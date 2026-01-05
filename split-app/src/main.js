// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 新增
import './style.css'
import App from './App.vue'
import router from './router'       // 新增：引入路由設定

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)  // 新增：掛載 Pinia
app.use(router) // 新增：掛載 Router

app.mount('#app')