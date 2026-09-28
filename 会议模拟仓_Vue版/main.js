import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SimulateRoom from './components/SimulateRoom.vue'

window.mountSimulateRoom = function(selector) {
  const el = document.querySelector(selector)
  if (el) {
    el.innerHTML = '' // 清空占位内容
    const app = createApp(SimulateRoom)
    const pinia = createPinia()
    app.use(pinia)
    app.mount(selector)
  } else {
    console.error(`无法找到挂载点: ${selector}`)
  }
}
